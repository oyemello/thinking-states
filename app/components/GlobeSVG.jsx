'use client';

// Minimal wireframe globe SVG.
// Used as a standalone decorative element or within ThinkingState.

export default function GlobeSVG({ size = 72, color = '#006fcf' }) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = size / 2 - size * 0.04;
  const sw = size * 0.021;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ overflow: 'visible', display: 'block' }}
      aria-hidden="true"
    >
      {/* Silhouette */}
      <circle cx={cx} cy={cy} r={r}
        fill="none" stroke={color} strokeWidth={sw * 1.2} opacity="0.9" />

      {/* Latitude lines (perspective-correct ellipses) */}
      <ellipse cx={cx} cy={cy - r * 0.50} rx={r * 0.866} ry={r * 0.22}
        fill="none" stroke={color} strokeWidth={sw} opacity="0.70" />
      <ellipse cx={cx} cy={cy}            rx={r}         ry={r * 0.27}
        fill="none" stroke={color} strokeWidth={sw} opacity="0.75" />
      <ellipse cx={cx} cy={cy + r * 0.50} rx={r * 0.866} ry={r * 0.22}
        fill="none" stroke={color} strokeWidth={sw} opacity="0.70" />

      {/* Longitude lines */}
      <ellipse cx={cx} cy={cy} rx={r * 0.30} ry={r}
        fill="none" stroke={color} strokeWidth={sw} opacity="0.65" />
      <ellipse cx={cx} cy={cy} rx={r * 0.30} ry={r}
        fill="none" stroke={color} strokeWidth={sw} opacity="0.52"
        transform={`rotate(60 ${cx} ${cy})`} />
      <ellipse cx={cx} cy={cy} rx={r * 0.30} ry={r}
        fill="none" stroke={color} strokeWidth={sw} opacity="0.52"
        transform={`rotate(-60 ${cx} ${cy})`} />
    </svg>
  );
}
