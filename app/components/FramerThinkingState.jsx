'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { interpolate } from 'flubber';

const easeIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp   = (a, b, t)   => a + (b - a) * t;

const PHASES = [
  { name: 'globe',    dur: 1800, t0: 0, t1: 0 },
  { name: 'morphIn',  dur: 1000, t0: 0, t1: 1 },
  { name: 'settled',  dur: 1700, t0: 1, t1: 1 },
  { name: 'morphOut', dur: 1000, t0: 1, t1: 0 },
];

function generatePaths(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = size * 0.35;
  const k  = 0.5523 * r;

  const lp = (a, b, t) => lerp(a, b, t).toFixed(3);
  const cp = (t, ccx, ccy, sx, sy) => `${lp(ccx, sx, t)},${lp(ccy, sy, t)}`;

  const [tx, ty] = [cx,     cy - r]; 
  const [rx, ry] = [cx + r, cy    ]; 
  const [bx, by] = [cx,     cy + r]; 
  const [lx, ly] = [cx - r, cy    ]; 

  const [TRx, TRy] = [cx + r, cy - r];
  const [BRx, BRy] = [cx + r, cy + r];
  const [BLx, BLy] = [cx - r, cy + r];
  const [TLx, TLy] = [cx - r, cy - r];

  const buildPath = (t) => [
    `M ${tx},${ty}`,
    `C ${cp(t, cx + k, cy - r, TRx, TRy)} ${cp(t, cx + r, cy - k, TRx, TRy)} ${rx},${ry}`,
    `C ${cp(t, cx + r, cy + k, BRx, BRy)} ${cp(t, cx + k, cy + r, BRx, BRy)} ${bx},${by}`,
    `C ${cp(t, cx - k, cy + r, BLx, BLy)} ${cp(t, cx - r, cy + k, BLx, BLy)} ${lx},${ly}`,
    `C ${cp(t, cx - r, cy - k, TLx, TLy)} ${cp(t, cx - k, cy - r, TLx, TLy)} ${tx},${ty}`,
    'Z',
  ].join(' ');

  const DX = size * 0.125;
  const DY = -(size * 0.10);

  // Origins are mathematically shrunk back into the core edges of the sphere curve
  const topOrigin = `M ${cx-0.1},${cy-r-0.1} L ${cx+0.1},${cy-r-0.1} L ${cx+0.1},${cy-r} L ${cx-0.1},${cy-r} Z`;
  const topTarget = `M ${TLx + DX},${TLy + DY} L ${TRx + DX},${TRy + DY} L ${TRx},${TRy} L ${TLx},${TLy} Z`;

  const rightOrigin = `M ${cx+r},${cy-0.1} L ${cx+r+0.1},${cy-0.1} L ${cx+r+0.1},${cy+0.1} L ${cx+r},${cy+0.1} Z`;
  const rightTarget = `M ${TRx},${TRy} L ${TRx + DX},${TRy + DY} L ${BRx + DX},${BRy + DY} L ${BRx},${BRy} Z`;

  return {
    sphere: buildPath(0),
    cube: buildPath(1),
    topOrigin,
    topTarget,
    rightOrigin,
    rightTarget
  };
}

export default function FramerThinkingState({
  size = 80,
  color = '#006fcf',
  logo = null,
  running = true,
  speedMultiplier = 1,
  durations = {},
  manualProgress = null,
  onPhase,
}) {
  const paths = useMemo(() => generatePaths(size), [size]);
  
  const progressValue = useMotionValue(0);
  const [logoOp, setLogoOp] = useState(0);

  // Triple Flubber Sync! Mathematically pushing thick volumes straight out of the 2D sphere's perimeter
  const morphedFront = useTransform(progressValue, [0, 1], [paths.sphere, paths.cube], {
    mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 2 })
  });
  const morphedTop = useTransform(progressValue, [0, 1], [paths.topOrigin, paths.topTarget], {
    mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 2 })
  });
  const morphedRight = useTransform(progressValue, [0, 1], [paths.rightOrigin, paths.rightTarget], {
    mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 2 })
  });

  const fillOp = useTransform(progressValue, p => clamp((p - 0.28) / 0.72, 0, 1));
  const globeOp = useTransform(progressValue, p => clamp(1 - p * 2.2, 0, 1));
  const depthOp = useTransform(progressValue, p => clamp((p - 0.80) / 0.20, 0, 1)); // Used only for edge lines now

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
        
        progressValue.set(newT);
        setLogoOp(ph.name === 'settled' && prog > 0.20 && prog < 0.78 ? 1 : 0);
      } else if (running) {
        const duration = (animProps.current.durations[ph.name] ?? ph.dur) / animProps.current.speedMultiplier;
        prog = clamp((now - start) / duration, 0, 1);
        newT = ph.t0 + (ph.t1 - ph.t0) * easeIO(prog);

        progressValue.set(newT);
        setLogoOp(ph.name === 'settled' && prog > 0.20 && prog < 0.78 ? 1 : 0);

        if (prog >= 1) {
          const next = PHASES[(idx + 1) % PHASES.length];
          animProps.current.onPhase?.(next.name);
          idx = (idx + 1) % PHASES.length;
          start = now;
        }
      } else {
        progressValue.set(0);
        setLogoOp(0);
      }
    };

    tick(performance.now());
    return () => cancelAnimationFrame(animId);
  }, [running, progressValue]);

  const cx = size / 2;
  const cy = size / 2;
  const r  = size * 0.35;
  const DX = size * 0.125;
  const DY = -(size * 0.10);
  const sw = size * 0.019;
  
  const fillRgbaString = useTransform(fillOp, f => `rgba(0,111,207,${f.toFixed(3)})`);

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block', overflow: 'visible' }}>
        
        {/* Dynamic 3D depth surfaces sprouting natively out of the core edge! */}
        <motion.path d={morphedTop} fill="#1a8ff5" opacity="0.88" />
        <motion.path d={morphedRight} fill="#004b8c" opacity="0.95" />

        <motion.g style={{ opacity: depthOp }}>
          <line x1={cx-r} y1={cy-r} x2={cx-r + DX} y2={cy-r + DY} stroke="#00274a" strokeWidth={sw} opacity="0.6" />
          <line x1={cx+r} y1={cy-r} x2={cx+r + DX} y2={cy-r + DY} stroke="#00274a" strokeWidth={sw} opacity="0.6" />
          <line x1={cx+r} y1={cy+r} x2={cx+r + DX} y2={cy+r + DY} stroke="#00274a" strokeWidth={sw} opacity="0.6" />
        </motion.g>

        {/* Center projection Face stretching outwards */}
        <motion.path d={morphedFront} fill={fillRgbaString} stroke={color} strokeWidth={sw} />

        <motion.g style={{ opacity: globeOp }}>
          <ellipse cx={cx} cy={cy - r * 0.50} rx={r * 0.866} ry={r * 0.22} fill="none" stroke={color} strokeWidth={sw} opacity="0.70" />
          <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.27} fill="none" stroke={color} strokeWidth={sw} opacity="0.75" />
          <ellipse cx={cx} cy={cy + r * 0.50} rx={r * 0.866} ry={r * 0.22} fill="none" stroke={color} strokeWidth={sw} opacity="0.70" />
          <ellipse cx={cx} cy={cy} rx={r * 0.30} ry={r} fill="none" stroke={color} strokeWidth={sw} opacity="0.65" />
          <ellipse cx={cx} cy={cy} rx={r * 0.30} ry={r} fill="none" stroke={color} strokeWidth={sw} opacity="0.52" transform={`rotate(60 ${cx} ${cy})`} />
          <ellipse cx={cx} cy={cy} rx={r * 0.30} ry={r} fill="none" stroke={color} strokeWidth={sw} opacity="0.52" transform={`rotate(-60 ${cx} ${cy})`} />
        </motion.g>
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
