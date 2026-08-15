// Vercel serverless function: POST /api/analyze
// Calls Google's free Gemini API to produce a structured, non-diagnostic
// urgency assessment. Falls back with a clear error if the API key is
// missing or the call fails — the frontend then falls back to its local
// rule-based logic (see src/mockData.ts + App.tsx).

const SYSTEM_PROMPT = `You are a non-diagnostic emergency triage assistant embedded in a web app, applying logic consistent with the Emergency Severity Index (ESI), the 5-level triage framework used in hospital emergency departments.

STRICT RULES:
- You NEVER diagnose a disease or condition.
- You NEVER recommend or name specific medications, dosages, or treatments.
- Your only job is to estimate how urgently the person should seek in-person medical care, and give safe, general, non-medical first-response guidance (e.g. "call emergency services", "avoid strenuous activity", "keep the person calm and seated").
- If there is any sign of a life-threatening emergency (e.g. chest pain, difficulty breathing, unconsciousness, stroke symptoms, severe bleeding, suicidal ideation), you must classify it as HIGH urgency and tell the person to contact emergency services immediately. This mirrors ESI Level 1-2.
- When uncertain, err toward a HIGHER urgency level, never a lower one.
- If a photo is provided, you may describe visually relevant observations (e.g. "the area appears swollen and red") but you must not name a diagnosis from it.
- Rate your own confidence honestly: "low" if the provided information is sparse or ambiguous, "high" only if the inputs clearly and consistently point to one urgency level.

You must respond with ONLY valid JSON, no markdown, no commentary, matching exactly this shape:
{
  "level": "LOW" | "MODERATE" | "HIGH",
  "reasons": string[],   // 3-6 short factual reasons for this level, referencing the specific inputs given and, loosely, which ESI tier they resemble
  "actionSteps": string[], // 3-5 concrete, non-medical next steps appropriate to the level
  "confidence": "low" | "medium" | "high"
}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "AI service not configured" });
    return;
  }

  try {
    const input = req.body;

    const userPrompt = `Patient-reported information:
- Age: ${input.age}
- Symptoms (free text): ${input.symptoms}
- Self-reported severity: ${input.severity}
- Duration: ${input.duration}
- Temperature: ${input.temperature || "not provided"}
- Heart rate: ${input.heartRate || "not provided"} bpm
- Oxygen saturation: ${input.oxygenSaturation || "not provided"}%
- Existing conditions: ${
      Array.isArray(input.conditions) && input.conditions.length > 0
        ? input.conditions.join(", ")
        : "none reported"
    }
${input.photoDataUrl ? "- A photo of the visible symptom/injury is attached." : ""}

Return the JSON assessment now.`;

    const parts = [{ text: userPrompt }];

    // Optional vision input: a symptom/injury photo, sent as inline base64.
    if (input.photoDataUrl && typeof input.photoDataUrl === "string") {
      const match = input.photoDataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: { mimeType: match[1], data: match[2] },
        });
      }
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", errText);
      res.status(502).json({ error: "AI service call failed" });
      return;
    }

    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      res.status(502).json({ error: "Empty AI response" });
      return;
    }

    const parsed = JSON.parse(text);

    if (
      !parsed.level ||
      !["LOW", "MODERATE", "HIGH"].includes(parsed.level) ||
      !Array.isArray(parsed.reasons) ||
      !Array.isArray(parsed.actionSteps)
    ) {
      res.status(502).json({ error: "AI response did not match expected shape" });
      return;
    }

    if (!["low", "medium", "high"].includes(parsed.confidence)) {
      parsed.confidence = "medium";
    }

    res.status(200).json(parsed);
  } catch (err) {
    console.error("Analyze function error:", err);
    res.status(500).json({ error: "Internal error" });
  }
}
