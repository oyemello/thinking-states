'use client';

import { useEffect, useRef } from 'react';

// Animation helpers
const easeIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const PHASES = [
  { name: 'globe',    dur: 1800, t0: 0, t1: 0 },
  { name: 'morphIn',  dur: 1000, t0: 0, t1: 1 },
  { name: 'settled',  dur: 1700, t0: 1, t1: 1 },
  { name: 'morphOut', dur: 1000, t0: 1, t1: 0 },
];

export default function OrthogonalRingsThinkingState({ 
  size = 80, 
  color = "#006fcf",
  logo = null,
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

      // Sync variables down to all child CSS planes simultaneously
      containerRef.current.style.setProperty('--base-rot-x', `${rotX}deg`);
      containerRef.current.style.setProperty('--base-rot-y', `${rotY}deg`);
      containerRef.current.style.setProperty('--base-rot-z', `${rotZ}deg`);
      
      // Interpolate the expansion and the corner flattening
      containerRef.current.style.setProperty('--morph-t', newT.toFixed(3));
      containerRef.current.style.setProperty('--border-rad', `${(1 - newT) * 50}%`);
      
      const shouldShowLogo = ph.name === 'settled' && prog > 0.20 && prog < 0.78;
      containerRef.current.style.setProperty('--logo-op', shouldShowLogo ? '1' : '0');
    };

    tick(performance.now());
    return () => cancelAnimationFrame(animId);
  }, [running]);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.35;
  const offset = cx - r;

  return (
    <div 
      style={{ position: 'relative', width: size, height: size, display: 'inline-flex', perspective: '800px' }}
      ref={containerRef}
    >
      {/* Engine Parent synchronized with the Master Component Rotation */}
      <div style={{
        position: 'absolute', top: offset, left: offset, width: r * 2, height: r * 2,
        transformStyle: 'preserve-3d',
        transform: `rotateX(var(--base-rot-x, ${angleX}deg)) rotateZ(var(--base-rot-z, ${angleZ}deg)) rotateY(var(--base-rot-y, 0deg))`,
      }}>
        {/*
          Orthogonal rings sliding linearly without twisting.
          Instead of 6 randomly rotated planes like in #5, these sit perfectly aligned on the X, Y, and Z axes.
          They seamlessly slide outward on their local Z-axes as they morph.
        */}
        <Face color={color} dZ={r} rx={0} ry={0} logo={logo} isFront />
        <Face color={color} dZ={r} rx={0} ry={180} />
        <Face color={color} dZ={r} rx={0} ry={90} />
        <Face color={color} dZ={r} rx={0} ry={-90} />
        <Face color={color} dZ={r} rx={90} ry={0} />
        <Face color={color} dZ={r} rx={-90} ry={0} />
      </div>
    </div>
  );
}

function Face({ color, dZ, rx, ry, isFront, logo }) {
  // Linearly interpolates translateZ outward along normal vector
  return (
    <div
      style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        boxSizing: 'border-box',
        border: `3px solid ${color}`,
        borderRadius: `var(--border-rad, 50%)`,
        background: `rgba(0, 111, 207, calc(0.1 + (var(--morph-t, 0) * 0.4)))`, // Muted inner fill
        transform: `
          rotateX(${rx}deg) 
          rotateY(${ry}deg) 
          translateZ(calc(${dZ}px * var(--morph-t, 0)))
        `,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backfaceVisibility: 'visible',
      }}
    >
      {isFront && logo && (
        <div style={{
          opacity: 'var(--logo-op, 0)',
          pointerEvents: 'none',
          transition: 'opacity 0.42s ease-in-out',
          width: '100%', height: '100%',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backgroundColor: 'white',
        }}>
          {logo}
        </div>
      )}
    </div>
  );
}
