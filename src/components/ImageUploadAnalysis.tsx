import { useState } from 'react';
import { runImageAnalysis } from '../engine/geminiClient';
import type { SeverityLevel } from '../types';
import { useGeminiConfig } from '../hooks/useGeminiConfig';

export default function ImageUploadAnalysis({ onSeverity }: { onSeverity?: (s: SeverityLevel) => void }) {
  const geminiConfig = useGeminiConfig();
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ description: string; suggestedSeverity: SeverityLevel } | null>(null);

  async function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      if (!geminiConfig) {
        setResult({ description: 'Add a Gemini API key in settings to enable image analysis.', suggestedSeverity: 'MONITOR' });
        return;
      }
      setLoading(true);
      const base64 = dataUrl.split(',')[1];
      const analysis = await runImageAnalysis(base64, file.type, geminiConfig);
      setResult(analysis);
      onSeverity?.(analysis.suggestedSeverity);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="card p-4 space-y-3">
      <h3 className="font-medium">Photo analysis</h3>
      <p className="text-xs text-clinical-muted">Upload a photo of a wound, rash, or medication label. This does not diagnose — it describes what's visible.</p>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-clinical-accent/15 file:text-clinical-accent"
      />
      {preview && <img src={preview} alt="upload preview" className="max-h-48 rounded-md border border-clinical-border" />}
      {loading && <p className="text-sm text-clinical-muted">Analyzing image…</p>}
      {result && (
        <div className="text-sm space-y-1">
          <p>{result.description}</p>
          <p className={`font-medium severity-${result.suggestedSeverity}`}>Suggested severity: {result.suggestedSeverity}</p>
        </div>
      )}
    </div>
  );
}
