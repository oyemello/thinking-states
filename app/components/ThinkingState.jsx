'use client';

import { useEffect, useState, useRef } from 'react';

// ─────────────────────────────────────────────────────────
// Animation helpers
// ─────────────────────────────────────────────────────────
const easeIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp   = (a, b, t)   => a + (b - a) * t;

// ─────────────────────────────────────────────────────────
// SVG path morph: circle ↔ square
//
// Key insight: a circle and square share the same 4 anchor
// points (midpoints of each side). Only bezier control
// points differ. Lerping CPs gives a smooth, correct morph.
//
//  Circle CPs  → use the 0.5523 × r approximation
//  Square CPs  → both collapse to the corner point
// ─────────────────────────────────────────────────────────
function morphPath(t, cx, cy, r) {
  const k  = 0.5523 * r;
  const lp = (a, b) => lerp(a, b, t).toFixed(3);
  const cp = (ccx, ccy, sx, sy) => `${lp(ccx, sx)},${lp(ccy, sy)}`;

  // Shared anchor points (midpoint of each side)
  const [tx, ty] = [cx,     cy - r]; // top
  const [rx, ry] = [cx + r, cy    ]; // right
  const [bx, by] = [cx,     cy + r]; // bottom
  const [lx, ly] = [cx - r, cy    ]; // left

  // Square corners (target control points at t = 1)
  const [TRx, TRy] = [cx + r, cy - r];
  const [BRx, BRy] = [cx + r, cy + r];
  const [BLx, BLy] = [cx - r, cy + r];
  const [TLx, TLy] = [cx - r, cy - r];

  return [
    `M ${tx},${ty}`,
    `C ${cp(cx + k, cy - r, TRx, TRy)} ${cp(cx + r, cy - k, TRx, TRy)} ${rx},${ry}`,
    `C ${cp(cx + r, cy + k, BRx, BRy)} ${cp(cx + k, cy + r, BRx, BRy)} ${bx},${by}`,
    `C ${cp(cx - k, cy + r, BLx, BLy)} ${cp(cx - r, cy + k, BLx, BLy)} ${lx},${ly}`,
    `C ${cp(cx - r, cy - k, TLx, TLy)} ${cp(cx - k, cy - r, TLx, TLy)} ${tx},${ty}`,
    'Z',
  ].join(' ');
}

// ─────────────────────────────────────────────────────────
// Phase sequence
// ─────────────────────────────────────────────────────────
const PHASES = [
  { name: 'globe',    dur: 1800, t0: 0, t1: 0 }, // show globe
  { name: 'morphIn',  dur: 1000, t0: 0, t1: 1 }, // globe → cube
  { name: 'settled',  dur: 1700, t0: 1, t1: 1 }, // cube + logo
  { name: 'morphOut', dur: 1000, t0: 1, t1: 0 }, // cube → globe
];

// ─────────────────────────────────────────────────────────
// ThinkingState
//
// Props:
//   size      number   Component diameter in px       (80)
//   color     string   Primary #hex color             (#00BFFF)
//   logo      node     Content shown on cube face     ('AMEX')
//   running   bool     false = freeze on globe state  (true)
//   onPhase   fn       Called with phase name on change
// ─────────────────────────────────────────────────────────
export default function ThinkingState({
  size    = 80,
  color   = '#006fcf',
  logo    = 'AMEX',
  running = true,
  speedMultiplier = 1,
  durations = {},
  manualProgress = null,
  onPhase,
}) {
  const [t,      setT     ] = useState(0);
  const [logoOp, setLogoOp] = useState(0);

  // Sync props to refs to prevent stale closures without retriggering animate loop
  const animProps = useRef({ speedMultiplier, durations, onPhase, manualProgress });
  useEffect(() => {
    animProps.current = { speedMultiplier, durations, onPhase, manualProgress };
  }, [speedMultiplier, durations, onPhase, manualProgress]);

  useEffect(() => {
    let idx   = 0;
    let start = performance.now();
    let animId;

    const tick = (now) => {
      animId = requestAnimationFrame(tick);
      
      let ph = PHASES[idx];
      let prog = 0;
      let newT = 0;

      if (animProps.current.manualProgress !== null) {
        const mp = animProps.current.manualProgress;
        idx = Math.floor(mp) % PHASES.length;
        if (Number.isNaN(idx) || idx < 0) idx = 0;
        prog = mp % 1;
        ph = PHASES[idx];
        newT = lerp(ph.t0, ph.t1, easeIO(prog));

        setT(newT);
        setLogoOp(ph.name === 'settled' && prog > 0.20 && prog < 0.78 ? 1 : 0);
      } else if (running) {
        const duration = (animProps.current.durations[ph.name] ?? ph.dur) / animProps.current.speedMultiplier;
        prog = clamp((now - start) / duration, 0, 1);
        newT = lerp(ph.t0, ph.t1, easeIO(prog));

        setT(newT);
        setLogoOp(ph.name === 'settled' && prog > 0.20 && prog < 0.78 ? 1 : 0);

        if (prog >= 1) {
          const next = PHASES[(idx + 1) % PHASES.length];
          animProps.current.onPhase?.(next.name);
          idx   = (idx + 1) % PHASES.length;
          start = now;
        }
      } else {
        newT = 0;
        setT(newT);
        setLogoOp(0);
      }
    };

    tick(performance.now());
    return () => cancelAnimationFrame(animId);
  }, [running]);

  // ── Geometry (all derived from `size`) ──────────────
  const cx = size / 2;
  const cy = size / 2;
  const r  = size * 0.35;          // shape radius = 35% of size

  const path = morphPath(t, cx, cy, r);

  // ── Layer opacities ──────────────────────────────────
  const globeOp = clamp(1 - t * 2.2,       0, 1); // fades out in first half
  const fillOp  = clamp((t - 0.28) / 0.72, 0, 1); // floods in from midpoint
  const depthOp = clamp((t - 0.80) / 0.20, 0, 1); // depth faces in last 20%

  // ── Isometric cube depth faces ───────────────────────
  const DX = size * 0.125;
  const DY = -(size * 0.10);
  const TL = [cx - r, cy - r];
  const TR = [cx + r, cy - r];
  const BR = [cx + r, cy + r];

  const topFacePts = [
    `${TL[0] + DX},${TL[1] + DY}`,
    `${TR[0] + DX},${TR[1] + DY}`,
    `${TR[0]},${TR[1]}`,
    `${TL[0]},${TL[1]}`,
  ].join(' ');

  const rightFacePts = [
    `${TR[0]},${TR[1]}`,
    `${TR[0] + DX},${TR[1] + DY}`,
    `${BR[0] + DX},${BR[1] + DY}`,
    `${BR[0]},${BR[1]}`,
  ].join(' ');

  const sw = size * 0.019; // stroke width

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex' }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        style={{ display: 'block', overflow: 'visible' }}
        aria-label="Thinking"
        role="img"
      >
        {/* ── Isometric cube top + right faces ── */}
        <g opacity={depthOp}>
          <polygon points={topFacePts}   fill="#1a8ff5" opacity="0.88" />
          <polygon points={rightFacePts} fill="#004b8c" opacity="0.95" />
          <line x1={TL[0]} y1={TL[1]} x2={TL[0] + DX} y2={TL[1] + DY} stroke="#00274a" strokeWidth={sw} opacity="0.6" />
          <line x1={TR[0]} y1={TR[1]} x2={TR[0] + DX} y2={TR[1] + DY} stroke="#00274a" strokeWidth={sw} opacity="0.6" />
          <line x1={BR[0]} y1={BR[1]} x2={BR[0] + DX} y2={BR[1] + DY} stroke="#00274a" strokeWidth={sw} opacity="0.6" />
        </g>

        {/* ── Morphing front face (circle → square bezier lerp) ── */}
        <path
          d={path}
          fill={`rgba(0,111,207,${fillOp.toFixed(3)})`}
          stroke={color}
          strokeWidth={sw}
        />

        {/* ── Globe lat / lon lines ── */}
        <g opacity={globeOp.toFixed(3)}>
          <ellipse cx={cx} cy={cy - r * 0.50} rx={r * 0.866} ry={r * 0.22}
            fill="none" stroke={color} strokeWidth={sw} opacity="0.70" />
          <ellipse cx={cx} cy={cy}            rx={r}         ry={r * 0.27}
            fill="none" stroke={color} strokeWidth={sw} opacity="0.75" />
          <ellipse cx={cx} cy={cy + r * 0.50} rx={r * 0.866} ry={r * 0.22}
            fill="none" stroke={color} strokeWidth={sw} opacity="0.70" />
          <ellipse cx={cx} cy={cy} rx={r * 0.30} ry={r}
            fill="none" stroke={color} strokeWidth={sw} opacity="0.65" />
          <ellipse cx={cx} cy={cy} rx={r * 0.30} ry={r}
            fill="none" stroke={color} strokeWidth={sw} opacity="0.52"
            transform={`rotate(60 ${cx} ${cy})`} />
          <ellipse cx={cx} cy={cy} rx={r * 0.30} ry={r}
            fill="none" stroke={color} strokeWidth={sw} opacity="0.52"
            transform={`rotate(-60 ${cx} ${cy})`} />
        </g>
      </svg>

      {/* ── Logo blend on cube face ── */}
      {logo && (
        <div style={{
          position:       'absolute',
          inset:          0,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          opacity:        logoOp,
          transition:     'opacity 0.42s ease-in-out',
          pointerEvents:  'none',
          fontFamily:     "'Arial Black', 'Helvetica Neue', sans-serif",
          fontSize:       size * 0.16,
          fontWeight:     900,
          letterSpacing:  '0.12em',
          color:          '#00274a',
          userSelect:     'none',
        }}>
          {logo}
        </div>
      )}
    </div>
  );
}
