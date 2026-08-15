import { useEffect, useRef, useState } from "react";
import type { AssessmentInput, UrgencyResult, View } from "./types";
import { scoreSymptoms } from "./mockData";
import { Navbar, SafetyDisclaimer } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Landing } from "./components/Landing";
import { AssessmentForm } from "./components/AssessmentForm";
import { ResultsView } from "./components/ResultsView";
import { HospitalList } from "./components/HospitalList";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [result, setResult] = useState<UrgencyResult | null>(null);
  const [lastUrgency, setLastUrgency] = useState<UrgencyResult["level"] | null>(
    null
  );
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [view]);

  const handleAnalyze = async (input: AssessmentInput) => {
    // --- Token-optimization tier 1: local, deterministic, zero-cost scoring ---
    const { result: localResult, score } = scoreSymptoms(input);

    // Only spend an AI call on cases that actually benefit from it:
    // borderline scores where local rules disagree, or when a symptom
    // photo was attached (needs vision reasoning the local engine can't do).
    const isBorderline = score >= 2 && score <= 5;
    const hasPhoto = Boolean(input.photoDataUrl);
    const needsAI = isBorderline || hasPhoto;

    if (!needsAI) {
      // Confident local read — skip the network call entirely.
      setResult(localResult);
      setLastUrgency(localResult.level);
      setView("results");
      return;
    }

    // --- Tier 2: AI call for ambiguous or image-containing cases ---
    let res: UrgencyResult;
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error("AI service unavailable");
      res = await response.json();
      res.source = "ai";
    } catch {
      // Fall back to the local, deterministic rule-based assessment
      // if the AI call fails, is slow, or isn't configured. Flagged
      // clearly in the UI rather than silently substituted.
      res = { ...localResult, source: "local-fallback" };
    }
    setResult(res);
    setLastUrgency(res.level);
    setView("results");
  };

  const handleNavigate = (v: View) => setView(v);

  const handleRestart = () => {
    setResult(null);
    setLastUrgency(null);
    setView("assessment");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div ref={topRef} />
      <SafetyDisclaimer />
      <Navbar onNavigate={handleNavigate} />

      <main className="flex-1">
        {view === "home" && <Landing onNavigate={handleNavigate} />}
        {view === "assessment" && (
          <AssessmentForm
            onBack={() => setView("home")}
            onAnalyze={handleAnalyze}
          />
        )}
        {view === "results" && result && (
          <ResultsView
            result={result}
            onBack={() => setView("assessment")}
            onFindHospitals={() => setView("hospitals")}
            onRestart={handleRestart}
          />
        )}
        {view === "hospitals" && (
          <HospitalList
            urgency={lastUrgency}
            onBack={() => setView(result ? "results" : "home")}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
