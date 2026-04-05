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

export default function OrigamiThinkingState({
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

      // Calculate distinct multi-part animation timeline directly into CSS 
      // tUnfold = 0 to 1 (Sphere to Flat Cross) over the first 35% of the overall progress
      // tFold = 0 to 1 (Flat Cross into Strict Cube) over the remaining 65%
      const tUnfold = clamp(newT / 0.35, 0, 1);
      const tFold = clamp((newT - 0.35) / 0.65, 0, 1);

      containerRef.current.style.setProperty('--base-rot-x', `${rotX}deg`);
      containerRef.current.style.setProperty('--base-rot-y', `${rotY}deg`);
      containerRef.current.style.setProperty('--base-rot-z', `${rotZ}deg`);
      containerRef.current.style.setProperty('--border-rad', `${(1 - newT) * 50}%`);
      containerRef.current.style.setProperty('--morph-t', newT.toFixed(4));
      containerRef.current.style.setProperty('--unfold-t', tUnfold.toFixed(4));
      containerRef.current.style.setProperty('--fold-t', tFold.toFixed(4));

    };

    tick(performance.now());
    return () => cancelAnimationFrame(animId);
  }, [running]);

  const r = size * 0.35;
  const offset = (size / 2) - r;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', perspective: '1200px' }} ref={containerRef}>
      
      {/* Container Engine Rotator */}
      <div style={{
        position: 'absolute', top: offset, left: offset, width: r * 2, height: r * 2,
        transformStyle: 'preserve-3d',
        transform: `rotateX(var(--base-rot-x, ${angleX}deg)) rotateZ(var(--base-rot-z, ${angleZ}deg)) rotateY(var(--base-rot-y, 0deg))`,
      }}>
        
        {/* Core Front Face rigidly placed */}
        <OrigamiFace type="front" color={color} size={r * 2}>
           {/* Top face hinges heavily on the Front edge */}
           <OrigamiFace type="top" color={color} size={r * 2}>
               {/* Back face hinges explicitly along Top's top-edge extending the origami net dynamically mapping out */}
               <OrigamiFace type="back" color={color} size={r * 2} />
           </OrigamiFace>

           {/* Remaining lateral faces string onto the main Front piece */}
           <OrigamiFace type="bottom" color={color} size={r * 2} />
           <OrigamiFace type="left" color={color} size={r * 2} />
           <OrigamiFace type="right" color={color} size={r * 2} />
        </OrigamiFace>
      </div>

    </div>
  );
}

function OrigamiFace({ type, color, size, children }) {
  let origin = 'center';
  let tX = '0', tY = '0';
  let rX_sphere = 0, rX_cube = 0;
  let rY_sphere = 0, rY_cube = 0;

  // Mathematically assemble origami kinematics utilizing hierarchical hinging origins natively tracking along edge paths!
  if (type === 'front') {
    // Front merely bounds the Z translation so the entire cube pivots accurately at its core depth visually 
  } else if (type === 'top') {
    origin = 'bottom center';
    tY = '-100%';
    rX_sphere = -180; // Overlaps flush flat down on Front 
    rX_cube   = 90;   // Orthogonal roof
  } else if (type === 'bottom') {
    origin = 'top center';
    tY = '100%';
    rX_sphere = 180;  // Folds flush into Front 
    rX_cube   = -90;  // Orthogonal floor
  } else if (type === 'left') {
    origin = 'right center';
    tX = '-100%';
    rY_sphere = 180;  
    rY_cube   = -90;  // Orthogonal left wall
  } else if (type === 'right') {
    origin = 'left center';
    tX = '100%';
    rY_sphere = -180;
    rY_cube   = 90;   // Orthogonal right wall
  } else if (type === 'back') {
    origin = 'bottom center';
    tY = '-100%';
    rX_sphere = -180; // Collapses twice into the overlapping center core!
    rX_cube   = 90;   // The box backside perfectly aligns geometrically
  }

  return (
    <div
      style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        boxSizing: 'border-box',
        border: `3px solid ${color}`,
        borderRadius: `var(--border-rad, 50%)`,
        background: `rgba(0, 111, 207, calc(0.2 + (var(--morph-t, 0) * 0.7)))`,
        transformOrigin: origin,
        transformStyle: 'preserve-3d',
        // Interpolator algorithm securely calculates native unrolling physics
        transform: `
          translate(${tX}, ${tY}) 
          rotateX(calc(${rX_sphere}deg * (1 - var(--unfold-t, 0)) + ${rX_cube}deg * var(--fold-t, 0))) 
          rotateY(calc(${rY_sphere}deg * (1 - var(--unfold-t, 0)) + ${rY_cube}deg * var(--fold-t, 0))) 
          ${type === 'front' ? `translateZ(calc(${size/2}px * var(--fold-t)))` : ''}
        `,
        backfaceVisibility: 'visible',
      }}
    >
      {children}
    </div>
  );
}
