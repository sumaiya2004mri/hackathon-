// A single flat, soft-cartoon fetus silhouette. Early weeks read as a curled
// bean shape; by design the same path is simply scaled + given a gentle
// color deepen as the pregnancy progresses, rather than swapping distinct
// images per week — this satisfies "one SVG that scales/morphs by week."
export default function GrowthGlyph({ scale, accent = '#3FA79A' }: { scale: number; accent?: string }) {
  // Slightly deepen the fill as scale increases, so late-stage weeks read
  // as more "developed" without needing a second illustration.
  const lightness = 92 - Math.round(scale * 22); // 92% -> 70%
  const fill = `hsl(168, 35%, ${lightness}%)`;

  return (
    <svg
      viewBox="0 0 120 120"
      width={56 + scale * 104}
      height={56 + scale * 104}
      className="growth-stage growth-stage-active"
      style={{ transform: `scale(${0.7 + scale * 0.3})` }}
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="56" fill={fill} opacity="0.35" />
      <path
        d="M60 24
           C78 24 90 38 88 56
           C87 66 92 70 90 80
           C88 92 76 98 64 96
           C56 95 52 90 48 92
           C40 96 30 90 30 80
           C30 70 24 66 26 54
           C28 40 42 24 60 24 Z"
        fill={accent}
        opacity={0.85}
      />
      {/* simple curled-limb suggestion, present at all scales for consistency */}
      <path
        d="M50 70 C46 76 46 82 52 86"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}
