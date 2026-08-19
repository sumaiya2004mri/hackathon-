import { describe, it, expect } from 'vitest';
import { runLocalPass, shouldEscalateToAI } from './ruleEngine';
import { matchKeywordRules, KEYWORD_RULES } from './symptomKeywords';
import { buildGeminiPrompt } from './geminiClient';

describe('Fracture / broken-bone keyword handling (regression suite)', () => {
  // These cases previously drifted between the local engine and the Gemini
  // prompt layer. Each case is asserted against the LOCAL engine here, and
  // a separate test below asserts the SAME keyword dictionary is what gets
  // embedded into the Gemini prompt, so the two layers cannot diverge again.

  it('classifies a plain suspected closed fracture as URGENT', () => {
    const result = runLocalPass('I think I broke my wrist after falling', 'general');
    expect(result.severity).toBe('URGENT');
    expect(result.confidence).toBe('high');
  });

  it('classifies an open/compound fracture as EMERGENCY', () => {
    const result = runLocalPass('I fell and now I have a compound fracture, bone is sticking out', 'general');
    expect(result.severity).toBe('EMERGENCY');
    expect(result.confidence).toBe('high');
  });

  it('classifies a fracture with visible deformity as EMERGENCY', () => {
    const result = runLocalPass('My arm is visibly deformed after the accident, I think it is broken', 'general');
    expect(result.severity).toBe('EMERGENCY');
  });

  it('classifies a fracture with loss of circulation as EMERGENCY', () => {
    const result = runLocalPass('Broke my ankle and I cannot feel my toes, foot is cold and pale', 'general');
    expect(result.severity).toBe('EMERGENCY');
  });

  it('classifies a suspected hip fracture in an elderly fall as EMERGENCY', () => {
    const result = runLocalPass('My grandmother fell and cannot stand, possible hip fracture', 'general');
    expect(result.severity).toBe('EMERGENCY');
  });

  it('does not upgrade a plain "fracture" mention to EMERGENCY without deformity/circulation/open-wound signals', () => {
    const result = runLocalPass('Possible fracture in my finger, mild swelling only', 'general');
    expect(result.severity).toBe('URGENT');
    expect(result.severity).not.toBe('EMERGENCY');
  });

  it('the same fracture keywords exist in BOTH the local dictionary and the built Gemini prompt (no drift)', () => {
    const fractureRules = KEYWORD_RULES.filter((r) => r.id.startsWith('fracture-'));
    expect(fractureRules.length).toBeGreaterThan(0);

    const prompt = buildGeminiPrompt('test input', 'general');
    for (const rule of fractureRules) {
      for (const kw of rule.keywords) {
        expect(prompt.toLowerCase()).toContain(kw.toLowerCase());
      }
      expect(prompt).toContain(rule.severity);
    }
  });

  it('matchKeywordRules returns the exact same rule set the local engine used, for parity checks', () => {
    const text = 'compound fracture, bone sticking out of my leg';
    const rules = matchKeywordRules(text, 'general');
    const pass = runLocalPass(text, 'general');
    expect(pass.matchedRules.sort()).toEqual(rules.map((r) => r.id).sort());
  });
});

describe('General local rule engine behavior', () => {
  it('flags chest pain as EMERGENCY with high confidence (never waits on AI)', () => {
    const result = runLocalPass('I have severe chest pain and pressure', 'general');
    expect(result.severity).toBe('EMERGENCY');
    expect(result.confidence).toBe('high');
    expect(shouldEscalateToAI(result)).toBe(false);
  });

  it('escalates ambiguous free text with no keyword match to the AI pass', () => {
    const result = runLocalPass('I feel a bit strange today, hard to explain', 'general');
    expect(result.confidence).toBe('low');
    expect(shouldEscalateToAI(result)).toBe(true);
  });

  it('routes pregnancy danger signs (heavy bleeding) as EMERGENCY within the pregnancy module', () => {
    const result = runLocalPass('I am pregnant and having heavy vaginal bleeding, soaking pad every hour', 'pregnancy');
    expect(result.severity).toBe('EMERGENCY');
  });

  it('does not apply pregnancy-only rules to the general module', () => {
    const result = runLocalPass('reduced fetal movement, baby not moving', 'general');
    // module mismatch -> no pregnancy-specific rule fires
    expect(result.matchedRules).not.toContain('pregnancy-reduced-fetal-movement');
  });

  it('treats a UTI symptom in female_health module as MONITOR, not diagnostic', () => {
    const result = runLocalPass('burning when urinating for two days', 'female_health');
    expect(result.severity).toBe('MONITOR');
  });
});
