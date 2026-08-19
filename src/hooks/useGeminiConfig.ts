import { useState, useEffect } from 'react';
import type { GeminiConfig } from '../engine/geminiClient';

export function useGeminiConfig(): GeminiConfig | undefined {
  const [config, setConfig] = useState<GeminiConfig | undefined>(undefined);

  useEffect(() => {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    const storedKey = localStorage.getItem('ea_gemini_api_key') ?? undefined;
    const key = envKey || storedKey;
    setConfig(key ? { apiKey: key } : undefined);
  }, []);

  return config;
}

export function setStoredGeminiKey(key: string) {
  localStorage.setItem('ea_gemini_api_key', key);
}
