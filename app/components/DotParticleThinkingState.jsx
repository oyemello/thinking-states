'use client';

import { useEffect, useRef, useMemo } from 'react';

// Animation helpers
const easeIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const PHASES = [
  { name: 'globe',    dur: 1800, t0: 0, t1: 0 },
  { name: 'morphIn',  dur: 1000, t0: 0, t1: 1 },
  { name: 'settled',  dur: 1700, t0: 1, t1: 1 },
  { name: 'morphOut', dur: 1000, t0: 1, t1: 0 },
];

function generateParticles(numParticles, r) {
  const particles = [];
  const f = val => Number(val.toFixed(5));

  for(let i = 0; i < numParticles; i++) {
    // 1. Math plotted Sphere coordinate map (Fibonacci style for even distribution)
    const phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const sx = f(r * Math.sin(phi) * Math.cos(theta));
    const sy = f(r * Math.sin(phi) * Math.sin(theta));
    const sz = f(r * Math.cos(phi));

    // 2. Math plotted Cube planar coordinate map - using deterministic hash to prevent Next.js hydration mismatch
    const hashA = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    const hashB = Math.sin(i * 4.1414 + 13.311) * 82731.3341;
    const hashC = Math.sin(i * 9.8765 + 41.233) * 31415.9265;

    const prA = hashA - Math.floor(hashA);
    const prB = hashB - Math.floor(hashB);
    const prC = hashC - Math.floor(hashC);

    const face = Math.floor(prA * 6);
    let cx=0, cy=0, cz=0;
    const u = f((prB * 2 - 1) * r);
    const v = f((prC * 2 - 1) * r);
    const fixedR = f(r);

    if (face===0) { cx=u; cy=v; cz=fixedR; }   // Front
    if (face===1) { cx=u; cy=v; cz=-fixedR; }  // Back
    if (face===2) { cx=u; cy=fixedR; cz=v; }   // Bottom
    if (face===3) { cx=u; cy=-fixedR; cz=v; }  // Top
    if (face===4) { cx=fixedR; cy=u; cz=v; }   // Right
    if (face===5) { cx=-fixedR; cy=u; cz=v; }  // Left

    particles.push({ sx, sy, sz, cx, cy, cz });
  }
  return particles;
}

export default function DotParticleThinkingState({
  size = 80,
  color = '#006fcf',
  running = true,
  speedMultiplier = 1,
  durations = {},
  manualProgress = null,
  onPhase,
  rotSpeed = 1,
  angleX = -15,
  angleZ = 10,
}) {
  const containerRef = useRef(null);
  const animProps = useRef({ speedMultiplier, durations, rotSpeed, angleX, angleZ, onPhase, manualProgress });

  const r = size * 0.35;
  const particles = useMemo(() => generateParticles(180, r), [r]); // 180 particles mapped natively

  useEffect(() => {
    animProps.current = { speedMultiplier, durations, rotSpeed, angleX, angleZ, onPhase, manualProgress };
  }, [speedMultiplier, durations, rotSpeed, angleX, angleZ, onPhase, manualProgress]);

  useEffect(() => {
    let animId;
    let baseRotation = 0;
    let idx = 0;
    let start = performance.now();

    const tick = (now) => {
      animId = requestAnimationFrame(tick);
      if (!containerRef.current) return;

      if (running && animProps.current.manualProgress === null) {
        baseRotation += 0.5 * animProps.current.rotSpeed;
      }

      const rotX = animProps.current.angleX;
      const rotZ = animProps.current.angleZ;
      let rotY = baseRotation;

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

      containerRef.current.style.setProperty('--base-rot-x', `${rotX}deg`);
      containerRef.current.style.setProperty('--base-rot-y', `${rotY}deg`);
      containerRef.current.style.setProperty('--base-rot-z', `${rotZ}deg`);
      containerRef.current.style.setProperty('--morph-t', newT.toFixed(4));
    };

    tick(performance.now());
    return () => cancelAnimationFrame(animId);
  }, [running]);

  const offset = (size / 2); // Center of the container
  const dotSize = size * 0.04;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', perspective: '1200px' }} ref={containerRef}>

      {/* Center Anchor Point explicitly tracking */}
      <div style={{
        position: 'absolute', top: offset, left: offset, width: 0, height: 0,
        transformStyle: 'preserve-3d',
        transform: `rotateX(var(--base-rot-x, ${angleX}deg)) rotateZ(var(--base-rot-z, ${angleZ}deg)) rotateY(var(--base-rot-y, 0deg))`,
      }}>

        {/* Render natively orchestrated GPU particle swarm — dots only, no guide lines */}
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: -dotSize / 2,
              left: -dotSize / 2,
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              background: color,
              opacity: 0.8,
              transform: `translate3d(calc(${p.sx}px * (1 - var(--morph-t, 0)) + ${p.cx}px * var(--morph-t, 0)), calc(${p.sy}px * (1 - var(--morph-t, 0)) + ${p.cy}px * var(--morph-t, 0)), calc(${p.sz}px * (1 - var(--morph-t, 0)) + ${p.cz}px * var(--morph-t, 0)))`
            }}
          />
        ))}

      </div>
    </div>
  );
}
