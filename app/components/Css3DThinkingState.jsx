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

export default function Css3DThinkingState({
  size = 80,
  color = '#006fcf',
  logo = null,
  running = true,
  speedMultiplier = 1,
  durations = {},
  rotSpeed = 1,
  angleX = 45,
  angleY = 45,
  manualProgress = null,
  onPhase 
}) {
  const containerRef = useRef(null);

  const animProps = useRef({ speedMultiplier, durations, rotSpeed, angleX, angleY, onPhase, manualProgress });
  useEffect(() => {
    animProps.current = { speedMultiplier, durations, rotSpeed, angleX, angleY, onPhase, manualProgress };
  }, [speedMultiplier, durations, rotSpeed, angleX, angleY, onPhase, manualProgress]);

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
      let rotY = animProps.current.angleY + baseRotation;

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

      // Update CSS variables instead of React state for ultra-high performance UI locking
      containerRef.current.style.setProperty('--cube-rot-x', `${rotX}deg`);
      containerRef.current.style.setProperty('--cube-rot-y', `${rotY}deg`);
      containerRef.current.style.setProperty('--border-rad', `${(1 - newT) * 50}%`);
      
      const shouldShowLogo = ph.name === 'settled' && prog > 0.20 && prog < 0.78;
      containerRef.current.style.setProperty('--logo-op', shouldShowLogo ? '1' : '0');
    };

    tick(performance.now());
    return () => cancelAnimationFrame(animId);
  }, [running]);

  const D = size * 0.5; // translateZ distance is half size

  return (
    <div 
      className="css-3d-scene" 
      style={{ 
        width: size, 
        height: size, 
        perspective: `${size * 8}px`, // Large perspective blocks excessive distortion
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div 
        className="css-3d-cube"
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `rotateX(var(--cube-rot-x, ${angleX}deg)) rotateY(var(--cube-rot-y, ${angleY}deg))`,
        }}
      >
        <Face transform={`translateZ(${D}px)`} color={color} isFront logo={logo} />
        <Face transform={`rotateY(180deg) translateZ(${D}px)`} color={color} />
        <Face transform={`rotateY(-90deg) translateZ(${D}px)`} color={color} />
        <Face transform={`rotateY(90deg) translateZ(${D}px)`} color={color} />
        <Face transform={`rotateX(90deg) translateZ(${D}px)`} color={color} />
        <Face transform={`rotateX(-90deg) translateZ(${D}px)`} color={color} />
      </div>
    </div>
  );
}

function Face({ transform, color, isFront, logo }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `rgba(0, 111, 207, 0.88)`,
        border: `3px solid ${color}`,
        borderRadius: `var(--border-rad, 50%)`,
        transform: transform,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backfaceVisibility: 'visible', // allows transparent overlap look
        transition: 'opacity 0.1s linear',
        overflow: 'hidden'
      }}
    >
      {isFront && logo && (
        <div style={{
          opacity: 'var(--logo-op, 0)',
          transition: 'opacity 0.42s ease-in-out',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white', // Bright background specifically for Logo face
        }}>
          {logo}
        </div>
      )}
    </div>
  );
}
