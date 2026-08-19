// Shared skeleton loader (spec item 5). Sweeps left-to-right ~1.5s loop,
// tinted with the calling module's accent at low opacity rather than a
// plain gray. Used for any data fetch over ~300ms: hospital lookup,
// Gemini triage/image calls, etc.
export default function Skeleton({
  lines = 2,
  accent = 'neutral',
  className = '',
}: {
  lines?: number;
  accent?: 'pregnancy' | 'period' | 'emergency' | 'neutral';
  className?: string;
}) {
  const tint = accent === 'neutral' ? 'skeleton' : `skeleton skeleton-${accent}`;
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-live="polite" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`${tint} h-4`} style={{ width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
    </div>
  );
}
