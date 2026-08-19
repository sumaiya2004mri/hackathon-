# Emergency AI — Triage & Localized Healthcare Navigation (v2)

Bangladesh-localized emergency triage and healthcare navigation app. React + TypeScript + Tailwind + Vite, deployable to Vercel.

## What's real vs. what needs your keys

This is a fully working, tested frontend. Two things are intentionally left as configuration rather than hardcoded:

- **Gemini API key** — the app runs perfectly on the local rule engine alone (guest mode, zero setup). Add `VITE_GEMINI_API_KEY` (see `.env.example`) to enable the AI pass for ambiguous symptoms and photo analysis. Without a key, ambiguous input gets a cautious "MONITOR — see a doctor if unsure" fallback rather than silently failing.
- **Firebase project** — auth (email/password + Google) and persistent accounts need your own Firebase project config in `.env`. **Guest mode works with zero configuration** and is the default — emergency triage is never gated behind login.

Everything else — the rule engine, geolocation, Overpass hospital lookup, PPG camera heart-rate, voice readout, SBAR/period/pregnancy exports, all four modules — runs as-is.

## Quickstart

```bash
npm install
cp .env.example .env   # optional — fill in Gemini/Firebase keys if you want them
npm run dev
```

Run tests (includes the fracture-keyword regression suite):
```bash
npm test
```

Build for Vercel:
```bash
npm run build
```

## Architecture

### One rule engine, parameterized by module
`src/engine/ruleEngine.ts` runs a deterministic, offline "local pass" against `src/engine/symptomKeywords.ts` — a single canonical keyword dictionary used by **both** the local engine and the Gemini prompt builder (`src/engine/geminiClient.ts`). This was a deliberate fix for the historical bug where fracture/broken-bone keywords drifted out of sync between the local rules and the AI prompt. `src/engine/ruleEngine.test.ts` has an explicit regression test asserting the two layers can never diverge again — run it before shipping any change to symptom keywords.

`src/engine/triageOrchestrator.ts` ties it together: local pass runs first (free, instant); Gemini is only called when the local pass reports `confidence: 'low'` (no keyword match, or conflicting signals). This is the two-tier token-optimization architecture. The **more severe** of the two passes always wins — the system never gets less cautious by calling AI.

The same orchestrator, same rule dictionary, and same `<TriageForm>` component are reused across all four modules (general / pregnancy / period / female_health) via the `ModuleKind` parameter — there are not four separate triage systems.

### One export engine
`src/export/exportEngine.ts` produces the SBAR passport, the period PDF summary, and the period CSV, all from one `jsPDF`-based layout system sharing the same header/footer/typography — not three separate PDF pipelines.

### One dashboard
`src/dashboard/Dashboard.tsx` is a single tabbed view over triage history, period history, and pregnancy tracking.

### Danger-sign routing into the emergency flow
Every module's symptom classifier returns a `TriageSession` with `finalSeverity`. When that's `EMERGENCY`, `routedToEmergencyFlow` is `true` and `<TriageResult>` renders `<HospitalList>` directly inline — this is the explicit routing point requested for pregnancy danger signs (heavy bleeding, severe headache/vision changes, reduced fetal movement, severe abdominal pain, pre-eclampsia signs) and urgent female-health symptoms. See `symptomKeywords.ts` for the `pregnancy-*` and `female_health`-scoped rules that trigger this.

### Critical-symptoms banner
`<CriticalBanner>` is mounted once in `App.tsx`, above the router `<Routes>` — not inside any module page — so it's guaranteed visible on every screen regardless of app state, module, or auth status.

## Data model

See `src/types.ts` for the full model. Core entities:

- **User** — supports guest mode (`isGuest: true`) by default; never required for triage.
- **TriageSession** — `localPass` + optional `aiPass`, `finalSeverity`, `routedToEmergencyFlow`.
- **SymptomEntry** — free text + matched keyword IDs + optional image.
- **Vitals** — heart rate (PPG or manual), BP, glucose.
- **PregnancyProfile** — LMP/due date, ANC visits, TT doses, BP/glucose logs, kick-counter sessions, delivery facility, hospital bag checklist.
- **PeriodLog** / **CycleStats** — cycle logging + personal-average-based stats (not fixed-calendar).

## Auth/DB choice: Firebase Auth + Firestore

Chosen over Supabase because:
1. Firestore's offline persistence suits patchy mobile networks — the primary real-world usage pattern for this app.
2. Firebase Auth's anonymous-auth mode maps directly onto "guest mode" without extra plumbing.
3. Firestore's field-level security rules give clean per-document, owner-only access control for sensitive period/pregnancy data.

Supabase (Postgres + RLS) is an equally valid alternative — swap `src/auth/firebaseConfig.ts` and `src/auth/AuthContext.tsx` if your team prefers SQL.

**Current state:** the prototype persists locally (`localStorage`) so it's fully testable offline. `src/engine/sessionStore.ts` and the module storage helpers are the single points to swap for real Firestore reads/writes — each has a `NOTE:` comment marking the swap point and a suggested collection path.

### Suggested Firestore security rules (for the production swap)
```
match /users/{uid}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

## Privacy

Period, pregnancy, and symptom data is treated as sensitive throughout:
- Settings page has explicit **export my data** and **delete my data** actions.
- First-use privacy notice text lives in `SettingsPage.tsx` — surface it as an onboarding modal in production.
- Production Firestore fields for this data should be restricted by the owner-only rule above; consider field-level encryption for BP/glucose logs if your compliance requirements call for it.

## Fracture-keyword bug: how it's prevented now

1. `symptomKeywords.ts` is the **only** place fracture keywords are defined (4 explicit rules: open/compound, deformity/neurovascular, suspected closed, hip-fracture-in-fall).
2. `geminiClient.ts`'s `buildGeminiPrompt()` renders these same rules directly into the AI prompt text — it cannot hardcode a different list.
3. `ruleEngine.test.ts` has a test that iterates every `fracture-*` rule and asserts its keywords AND severity literally appear in the built Gemini prompt string, so any future edit to one without the other fails CI immediately.

## Known simplifications (flagged, not hidden)

- Local persistence (`localStorage`) instead of live Firestore — swap points are marked.
- PPG heart-rate is a consumer-grade estimate (simple peak-detection over red-channel intensity), not a clinical measurement — labeled as "estimated" in the UI.
- Gemini vision/text calls require your own API key; without one the app is local-rules-only and says so in the UI rather than pretending to have AI review.
- Kick-counter drop-off alert uses a simple heuristic (last session < 10 kicks vs. prior 3 averaging ≥10) — a real clinical product should validate this threshold with an OB advisor.
