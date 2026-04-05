'use client';

import { useEffect, useRef, useId } from 'react';

// Animation helpers
const easeIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const PHASES = [
  { name: 'globe',    dur: 1800, t0: 0, t1: 0 },
  { name: 'morphIn',  dur: 1000, t0: 0, t1: 1 },
  { name: 'settled',  dur: 1700, t0: 1, t1: 1 },
  { name: 'morphOut', dur: 1000, t0: 1, t1: 0 },
];

export default function ClipPathThinkingState({
  size = 80,
  color = '#006fcf',
  logo = null,
  running = true,
  speedMultiplier = 1,
  durations = {},
  manualProgress = null,
  onPhase,
}) {
  const containerRef = useRef(null);
  const animProps = useRef({ speedMultiplier, durations, onPhase, manualProgress });

  useEffect(() => {
    animProps.current = { speedMultiplier, durations, onPhase, manualProgress };
  }, [speedMultiplier, durations, onPhase, manualProgress]);

  useEffect(() => {
    let animId;
    let idx = 0;
    let start = performance.now();

    const tick = (now) => {
      animId = requestAnimationFrame(tick);
      if (!containerRef.current) return;
      
      let ph = PHASES[idx];
      let prog = 0;
      let newT = 0;

      if (animProps.current.manualProgress !== null) {
        const mp = animProps.current.manualProgress;
        idx = Math.floor(mp) % PHASES.length;
        if (Number.isNaN(idx) || idx < 0) idx = 0;
        prog = mp % 1;
        ph = PHASES[idx];
        newT = ph.t0 + (ph.t1 - ph.t0) * easeIO(prog);
      } else if (running) {
        const duration = (animProps.current.durations[ph.name] ?? ph.dur) / animProps.current.speedMultiplier;
        prog = clamp((now - start) / duration, 0, 1);
        newT = ph.t0 + (ph.t1 - ph.t0) * easeIO(prog);

        if (prog >= 1) {
          const nextIdx = (idx + 1) % PHASES.length;
          animProps.current.onPhase?.(PHASES[nextIdx].name);
          idx = nextIdx;
          start = now;
        }
      } else {
        newT = 0;
      }

      containerRef.current.style.setProperty('--morph-t', newT.toFixed(3));
      
      const shouldShowLogo = ph.name === 'settled' && prog > 0.20 && prog < 0.78;
      containerRef.current.style.setProperty('--logo-op', shouldShowLogo ? '1' : '0');
    };

    tick(performance.now());
    return () => cancelAnimationFrame(animId);
  }, [running]);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.35;
  
  // Static Box properties
  const DX = size * 0.125;
  const DY = -(size * 0.10);
  const TL = [cx - r, cy - r];
  const TR = [cx + r, cy - r];
  const BR = [cx + r, cy + r];
  const BL = [cx - r, cy + r];
  const sw = size * 0.019;

  // Mask ID globally unified via useId to prevent client/server DOM mismatches
  const reactId = useId();
  const maskId = `clip-wipe-${reactId.replace(/:/g, '')}`;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex' }} ref={containerRef}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <clipPath id={maskId}>
            {/* The magic CSS variable mapping dynamically adjusting the explicit SVG radius hole mechanically! */}
            <circle cx={cx} cy={cy} style={{ r: `calc(var(--morph-t, 0) * ${size * 0.85}px)` }} />
          </clipPath>
        </defs>

        {/* 1. Underlying Base Globe (Fades slightly out so the cube pops!) */}
        <g style={{ opacity: `calc(1 - (var(--morph-t, 0) * 1.5))` }}>
          <ellipse cx={cx} cy={cy - r * 0.50} rx={r * 0.866} ry={r * 0.22} fill="none" stroke={color} strokeWidth={sw} opacity="0.70" />
          <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.27} fill="none" stroke={color} strokeWidth={sw} opacity="0.75" />
          <ellipse cx={cx} cy={cy + r * 0.50} rx={r * 0.866} ry={r * 0.22} fill="none" stroke={color} strokeWidth={sw} opacity="0.70" />
          <ellipse cx={cx} cy={cy} rx={r * 0.30} ry={r} fill="none" stroke={color} strokeWidth={sw} opacity="0.65" />
          <ellipse cx={cx} cy={cy} rx={r * 0.30} ry={r} fill="none" stroke={color} strokeWidth={sw} opacity="0.52" transform={`rotate(60 ${cx} ${cy})`} />
          <ellipse cx={cx} cy={cy} rx={r * 0.30} ry={r} fill="none" stroke={color} strokeWidth={sw} opacity="0.52" transform={`rotate(-60 ${cx} ${cy})`} />
        </g>

        {/* 2. Top-Layer Cube mechanically revealed inside the expanding circle mask! */}
        <g clipPath={`url(#${maskId})`}>
          {/* Depth Faces */}
          <polygon points={`${TL[0] + DX},${TL[1] + DY} ${TR[0] + DX},${TR[1] + DY} ${TR[0]},${TR[1]} ${TL[0]},${TL[1]}`} fill="#1a8ff5" opacity="0.88" />
          <polygon points={`${TR[0]},${TR[1]} ${TR[0] + DX},${TR[1] + DY} ${BR[0] + DX},${BR[1] + DY} ${BR[0]},${BR[1]}`} fill="#004b8c" opacity="0.95" />

          {/* Lines */}
          <line x1={TL[0]} y1={TL[1]} x2={TL[0] + DX} y2={TL[1] + DY} stroke="#00274a" strokeWidth={sw} opacity="0.6" />
          <line x1={TR[0]} y1={TR[1]} x2={TR[0] + DX} y2={TR[1] + DY} stroke="#00274a" strokeWidth={sw} opacity="0.6" />
          <line x1={BR[0]} y1={BR[1]} x2={BR[0] + DX} y2={BR[1] + DY} stroke="#00274a" strokeWidth={sw} opacity="0.6" />

          {/* Solid Front Face */}
          <polygon points={`${TL[0]},${TL[1]} ${TR[0]},${TR[1]} ${BR[0]},${BR[1]} ${BL[0]},${BL[1]}`} fill="rgba(0,111,207,1)" stroke={color} strokeWidth={sw} />
        </g>
      </svg>

      {logo && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 'var(--logo-op, 0)', transition: 'opacity 0.42s ease-in-out', pointerEvents: 'none'
        }}>
          {logo}
        </div>
      )}
    </div>
  );
}
