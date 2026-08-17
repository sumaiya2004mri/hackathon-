import { useState, useCallback } from 'react';

export default function VoiceReadout({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [text, supported]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  if (!supported) return null;

  return (
    <button
      onClick={speaking ? stop : speak}
      className="text-xs px-3 py-1.5 rounded-md bg-clinical-panel2 border border-clinical-border hover:border-clinical-accent flex items-center gap-1.5"
    >
      {speaking ? '■ Stop' : '🔊 Read aloud'}
    </button>
  );
}
