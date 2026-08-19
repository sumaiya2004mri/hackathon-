// ============================================================================
// GEMINI AI PASS — "ai pass"
//
// Only invoked when runLocalPass() returns confidence: 'low'. This is the
// two-tier token-optimization architecture: local rules handle the clear
// majority of cases for free; Gemini is reserved for genuinely ambiguous
// free-text input.
//
// The prompt is built FROM symptomKeywords.ts (not a separate hardcoded
// list) specifically to prevent the fracture-keyword drift bug from
// recurring. See ruleEngine.test.ts for the regression test that enforces
// this.
// ============================================================================

import type { SeverityLevel, ModuleKind, TriagePass } from '../types';
import { KEYWORD_RULES } from './symptomKeywords';

const GEMINI_MODEL = 'gemini-1.5-flash'; // free-tier friendly; swap as needed
const GEMINI_ENDPOINT = (apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

export function buildGeminiPrompt(freeText: string, module: ModuleKind): string {
  const relevantRules = KEYWORD_RULES.filter((r) => r.module === 'all' || r.module === module);
  const ruleLines = relevantRules
    .map((r) => `- [${r.severity}] keywords: ${r.keywords.join(', ')} — ${r.rationale}`)
    .join('\n');

  return `You are a non-diagnostic triage classifier for a Bangladesh healthcare navigation app.
Classify the user's symptom description into exactly one severity level:
EMERGENCY, URGENT, MONITOR, or NORMAL.

You MUST apply the same severity distinctions as this reference rule set
(this is the authoritative source of truth — do not contradict it):
${ruleLines}

Rules:
- Never diagnose a specific disease or condition by name to the user.
- Never prescribe medication or dosages.
- If in doubt between two severities, choose the MORE severe one.
- A suspected closed fracture with no deformity/circulation problem is URGENT, not EMERGENCY.
- A suspected fracture WITH deformity, an open wound, or loss of circulation/sensation IS EMERGENCY.
- Module context: "${module}".
- User's description: "${freeText}"

Respond ONLY with strict JSON, no markdown, no preamble:
{"severity": "EMERGENCY|URGENT|MONITOR|NORMAL", "rationale": "one or two plain sentences, reassuring tone if NORMAL/MONITOR"}`;
}

export interface GeminiConfig {
  apiKey: string;
}

/**
 * Calls the Gemini API for the AI pass. Requires a real API key supplied by
 * the deploying developer (see .env.example) — this repo does not embed one.
 */
export async function runAIPass(
  freeText: string,
  module: ModuleKind,
  config: GeminiConfig
): Promise<TriagePass> {
  const prompt = buildGeminiPrompt(freeText, module);

  try {
    const response = await fetch(GEMINI_ENDPOINT(config.apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 300 },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned) as { severity: SeverityLevel; rationale: string };

    return {
      pass: 'ai',
      severity: parsed.severity,
      matchedRules: [],
      rationale: parsed.rationale,
      confidence: 'high',
    };
  } catch (err) {
    // Fail safe: if the AI call errors out (offline, quota, bad key), do
    // NOT block the user. Fall back to a conservative MONITOR-with-caution
    // recommendation and tell them local connectivity/AI was unavailable.
    return {
      pass: 'ai',
      severity: 'MONITOR',
      matchedRules: [],
      rationale: 'AI review was unavailable right now (offline or quota limit). Treating this cautiously — please monitor closely and seek care if symptoms worsen or you remain unsure.',
      confidence: 'low',
    };
  }
}

/**
 * Vision analysis for uploaded images (wound photo, rash, medication label).
 * Also non-diagnostic — describes what's visible and routes to triage
 * severity, never names a specific condition definitively.
 */
export async function runImageAnalysis(
  imageBase64: string,
  mimeType: string,
  config: GeminiConfig
): Promise<{ description: string; suggestedSeverity: SeverityLevel }> {
  const prompt = `You are looking at a photo submitted in a healthcare navigation app (not a diagnostic tool).
Describe visible, objective features only (e.g. redness, swelling, discoloration, visible wound depth, medication label text).
Do not name a specific disease or diagnosis. End with a suggested severity: EMERGENCY, URGENT, MONITOR, or NORMAL,
using the same distinctions as: open wounds/heavy bleeding/deformity = EMERGENCY, moderate injury or concerning rash = URGENT,
mild/cosmetic = MONITOR, clearly benign = NORMAL.
Respond ONLY with strict JSON: {"description": "...", "suggestedSeverity": "..."}`;

  try {
    const response = await fetch(GEMINI_ENDPOINT(config.apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 300 },
      }),
    });
    const data = await response.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      description: 'Image analysis was unavailable right now. Please describe what you see in text instead.',
      suggestedSeverity: 'MONITOR',
    };
  }
}
