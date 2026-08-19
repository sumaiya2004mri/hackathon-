import { useState } from 'react';
import { runImageAnalysis } from '../engine/geminiClient';
import type { SeverityLevel } from '../types';
import { useGeminiConfig } from '../hooks/useGeminiConfig';
import Skeleton from './Skeleton';

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
    <div className="card card-neutral p-4 space-y-3">
      <h3 className="font-medium text-ink">Photo analysis</h3>
      <p className="text-xs text-ink-muted">Upload a photo of a wound, rash, or medication label. This does not diagnose — it describes what's visible.</p>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-module-neutralBg file:text-ink"
      />
      {preview && <img src={preview} alt="upload preview" className="max-h-48 rounded-md border border-cream-border" />}
      {loading && <Skeleton lines={2} accent="neutral" />}
      {result && (
        <div className="text-sm space-y-1">
          <p className="text-ink">{result.description}</p>
          <p className={`font-medium severity-${result.suggestedSeverity}`}>Suggested severity: {result.suggestedSeverity}</p>
        </div>
      )}
    </div>
  );
}
