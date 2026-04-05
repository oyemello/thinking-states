'use client';

import { useEffect, useRef, useState, useMemo } from 'react';

const easeIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp   = (a, b, t)   => a + (b - a) * t;

const PHASES = [
  { name: 'globe',    dur: 1800, t0: 0, t1: 0 },
  { name: 'morphIn',  dur: 1000, t0: 0, t1: 1 },
  { name: 'settled',  dur: 1700, t0: 1, t1: 1 },
  { name: 'morphOut', dur: 1000, t0: 1, t1: 0 },
];

export default function SoftBodyThinkingState({
  size = 80,
  color = '#006fcf',
  logo = null,
  running = true,
  speedMultiplier = 1,
  durations = {},
  manualProgress = null,
  onPhase,
}) {
  const [logoOp, setLogoOp] = useState(0);
  const [svgStr, setSvgStr] = useState('');
  
  const [fillOp, setFillOp] = useState(0);
  const [globeOp, setGlobeOp] = useState(1);
  const [depthOp, setDepthOp] = useState(0);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.35;
  
  // Custom Hook to prevent stale closures
  const animProps = useRef({ speedMultiplier, durations, onPhase, manualProgress });
  useEffect(() => {
    animProps.current = { speedMultiplier, durations, onPhase, manualProgress };
  }, [speedMultiplier, durations, onPhase, manualProgress]);

  useEffect(() => {
    let animId;
    let idx = 0;
    let start = performance.now();

    // Soft-body internal Jello physics properties!
    let physicsT = 0;
    let velocity = 0;
    const SPRING_STIFFNESS = 0.08; 
    const SPRING_FRICTION = 0.85; // Low friction causes aggressive rubber banding/bouncing

    const tick = (now) => {
      animId = requestAnimationFrame(tick);
      
      let ph = PHASES[idx];
      let prog = 0;
      let targetT = 0;

      if (animProps.current.manualProgress !== null) {
        const mp = animProps.current.manualProgress;
        idx = Math.floor(mp) % PHASES.length;
        if (Number.isNaN(idx) || idx < 0) idx = 0;
        prog = mp % 1;
        ph = PHASES[idx];
        targetT = ph.t0 + (ph.t1 - ph.t0) * easeIO(prog);
        setLogoOp(ph.name === 'settled' && prog > 0.20 && prog < 0.78 ? 1 : 0);
      } else if (running) {
        const duration = (animProps.current.durations[ph.name] ?? ph.dur) / animProps.current.speedMultiplier;
        prog = clamp((now - start) / duration, 0, 1);
        targetT = ph.t0 + (ph.t1 - ph.t0) * easeIO(prog);
        setLogoOp(ph.name === 'settled' && prog > 0.20 && prog < 0.78 ? 1 : 0);

        if (prog >= 1) {
          const nextIdx = (idx + 1) % PHASES.length;
          animProps.current.onPhase?.(PHASES[nextIdx].name);
          idx = nextIdx;
          start = now;
        }
      } else {
        targetT = 0;
        setLogoOp(0);
      }

      // Instead of explicitly mapping the bezier graphics to exactly `targetT` synchronously...
      // We physically pull the vertices using mechanical spring logic causing overshoots and jello bouncing natively!
      const force = (targetT - physicsT) * SPRING_STIFFNESS;
      velocity += force;
      velocity *= SPRING_FRICTION;
      physicsT += velocity;

      // Ensure that extreme jiggle physics doesn't overflow math coordinates natively
      let constrainedT = physicsT;

      const k  = 0.5523 * r;
      const lp = (a, b) => lerp(a, b, constrainedT).toFixed(3);
      const cp = (ccx, ccy, sx, sy) => `${lp(ccx, sx)},${lp(ccy, sy)}`;

      const [tx, ty] = [cx,     cy - r]; 
      const [rx, ry] = [cx + r, cy    ]; 
      const [bx, by] = [cx,     cy + r]; 
      const [lx, ly] = [cx - r, cy    ]; 

      const [TRx, TRy] = [cx + r, cy - r];
      const [BRx, BRy] = [cx + r, cy + r];
      const [BLx, BLy] = [cx - r, cy + r];
      const [TLx, TLy] = [cx - r, cy - r];

      const newPath = [
        `M ${tx},${ty}`,
        `C ${cp(cx + k, cy - r, TRx, TRy)} ${cp(cx + r, cy - k, TRx, TRy)} ${rx},${ry}`,
        `C ${cp(cx + r, cy + k, BRx, BRy)} ${cp(cx + k, cy + r, BRx, BRy)} ${bx},${by}`,
        `C ${cp(cx - k, cy + r, BLx, BLy)} ${cp(cx - r, cy + k, BLx, BLy)} ${lx},${ly}`,
        `C ${cp(cx - r, cy - k, TLx, TLy)} ${cp(cx - k, cy - r, TLx, TLy)} ${tx},${ty}`,
        'Z',
      ].join(' ');

      setSvgStr(newPath);

      // Interpolate rigid state properties based mechanically on actual physical stretch distance
      setFillOp(clamp((constrainedT - 0.28) / 0.72, 0, 1));
      setGlobeOp(clamp(1 - constrainedT * 2.2, 0, 1));
      setDepthOp(clamp((constrainedT - 0.80) / 0.20, 0, 1));
    };

    tick(performance.now());
    return () => cancelAnimationFrame(animId);
  }, [running, cx, cy, r]);

  const DX = size * 0.125;
  const DY = -(size * 0.10);
  const TL = [cx - r, cy - r];
  const TR = [cx + r, cy - r];
  const BR = [cx + r, cy + r];
  const sw = size * 0.019;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block', overflow: 'visible' }}>
        
        {/* Deep background shapes heavily utilizing physics elasticity stretch logic tracking `constrainedT` dynamically  */}
        <g style={{ opacity: depthOp, transition: 'opacity 0.05s linear' }}>
          <polygon points={`${TL[0] + DX},${TL[1] + DY} ${TR[0] + DX},${TR[1] + DY} ${TR[0]},${TR[1]} ${TL[0]},${TL[1]}`} fill="#1a8ff5" opacity="0.88" />
          <polygon points={`${TR[0]},${TR[1]} ${TR[0] + DX},${TR[1] + DY} ${BR[0] + DX},${BR[1] + DY} ${BR[0]},${BR[1]}`} fill="#004b8c" opacity="0.95" />

          {/* Depth lines */}
          <line x1={TL[0]} y1={TL[1]} x2={TL[0] + DX} y2={TL[1] + DY} stroke="#00274a" strokeWidth={sw} opacity="0.6" />
          <line x1={TR[0]} y1={TR[1]} x2={TR[0] + DX} y2={TR[1] + DY} stroke="#00274a" strokeWidth={sw} opacity="0.6" />
          <line x1={BR[0]} y1={BR[1]} x2={BR[0] + DX} y2={BR[1] + DY} stroke="#00274a" strokeWidth={sw} opacity="0.6" />
        </g>

        {/* Central Morph Plane */}
        {svgStr && (
          <path
            d={svgStr}
            fill={`rgba(0,111,207,${fillOp.toFixed(3)})`}
            stroke={color}
            strokeWidth={sw}
            style={{ transition: 'fill 0.05s linear' }}
          />
        )}

        {/* Core sphere outlines dynamically tracking logic elasticity */}
        <g style={{ opacity: globeOp, transition: 'opacity 0.05s linear' }}>
          <ellipse cx={cx} cy={cy - r * 0.50} rx={r * 0.866} ry={r * 0.22} fill="none" stroke={color} strokeWidth={sw} opacity="0.70" />
          <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.27} fill="none" stroke={color} strokeWidth={sw} opacity="0.75" />
          <ellipse cx={cx} cy={cy + r * 0.50} rx={r * 0.866} ry={r * 0.22} fill="none" stroke={color} strokeWidth={sw} opacity="0.70" />
          <ellipse cx={cx} cy={cy} rx={r * 0.30} ry={r} fill="none" stroke={color} strokeWidth={sw} opacity="0.65" />
          <ellipse cx={cx} cy={cy} rx={r * 0.30} ry={r} fill="none" stroke={color} strokeWidth={sw} opacity="0.52" transform={`rotate(60 ${cx} ${cy})`} />
          <ellipse cx={cx} cy={cy} rx={r * 0.30} ry={r} fill="none" stroke={color} strokeWidth={sw} opacity="0.52" transform={`rotate(-60 ${cx} ${cy})`} />
        </g>
      </svg>

      {logo && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: logoOp, transition: 'opacity 0.42s ease-in-out', pointerEvents: 'none'
        }}>
          {logo}
        </div>
      )}
    </div>
  );
}
