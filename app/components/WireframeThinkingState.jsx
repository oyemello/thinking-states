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

export default function WireframeThinkingState({
  size = 80,
  color = '#006fcf',
  logo = null,
  running = true,
  speedMultiplier = 1,
  durations = {},
  manualProgress = null,
  onPhase,
  rotSpeed = 1
}) {
  const containerRef = useRef(null);
  const pathsRef = useRef([]);
  const animProps = useRef({ speedMultiplier, durations, onPhase, manualProgress, rotSpeed });

  useEffect(() => {
    animProps.current = { speedMultiplier, durations, onPhase, manualProgress, rotSpeed };
  }, [speedMultiplier, durations, onPhase, manualProgress, rotSpeed]);

  // Wireframe definitions
  const R = size * 0.35; // base radius
  const cubeScale = 0.85;

  // Generate parametric lines
  const rings = [];
  const resolution = 40;

  // 4 Longitude rings
  for (let i = 0; i < 4; i++) {
    const theta = (i / 4) * Math.PI;
    const pts = [];
    for (let j = 0; j <= resolution; j++) {
      const phi = (j / resolution) * Math.PI * 2;
      // Normal unit sphere
      const nx = Math.cos(phi) * Math.cos(theta);
      const ny = Math.sin(phi);
      const nz = Math.cos(phi) * Math.sin(theta);
      pts.push({ nx, ny, nz });
    }
    rings.push(pts);
  }

  // 3 Latitude rings
  const lats = [-0.5, 0, 0.5]; // fractional Z offsets
  for (const lat of lats) {
    const phi = Math.asin(lat);
    const pts = [];
    for (let j = 0; j <= resolution; j++) {
      const theta = (j / resolution) * Math.PI * 2;
      const nx = Math.cos(phi) * Math.cos(theta);
      const ny = lat;
      const nz = Math.cos(phi) * Math.sin(theta);
      pts.push({ nx, ny, nz });
    }
    rings.push(pts);
  }

  useEffect(() => {
    let animId;
    let baseRotation = 0;
    let idx = 0;
    let start = performance.now();

    const cx = size / 2;
    const cy = size / 2;

    const tick = (now) => {
      animId = requestAnimationFrame(tick);
      if (!containerRef.current) return;

      if (running && animProps.current.manualProgress === null) {
        baseRotation += 0.015 * animProps.current.rotSpeed; 
      }

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

      // Compute 3D transformation matrices
      const cosY = Math.cos(baseRotation);
      const sinY = Math.sin(baseRotation);
      const rotX = -0.3; // Slight tilt
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Render loops
      rings.forEach((ring, rIdx) => {
        const pathEl = pathsRef.current[rIdx];
        if (!pathEl) return;

        let d = '';
        for (let i = 0; i < ring.length; i++) {
          const { nx, ny, nz } = ring[i];

          // 1. Morph Radius
          const maxAx = Math.max(Math.abs(nx), Math.abs(ny), Math.abs(nz));
          // targetR traces a pure cubic boundary shell
          const targetR = (R * cubeScale) / (maxAx || 1);
          // interpolate
          const currentR = R * (1 - newT) + targetR * newT;

          // 2. Scale up
          let x = nx * currentR;
          let y = ny * currentR;
          let z = nz * currentR;

          // 3. Rotate Y (Continuous Spin)
          let x1 = x * cosY - z * sinY;
          let z1 = x * sinY + z * cosY;

          // 4. Rotate X (Tilt view slightly forward)
          let y2 = y * cosX - z1 * sinX;
          let z2 = y * sinX + z1 * cosX;

          // 5. Fake perspective (Orthographic-ish but slightly scaled by depth)
          const perspective = 300;
          const scale = perspective / (perspective + z2);
          
          const px = cx + x1 * scale;
          const py = cy + y2 * scale;

          if (i === 0) d += `M ${px} ${py} `;
          else d += `L ${px} ${py} `;
        }
        pathEl.setAttribute('d', d);
      });

      const shouldShowLogo = ph.name === 'settled' && prog > 0.20 && prog < 0.78;
      containerRef.current.style.setProperty('--logo-op', shouldShowLogo ? '1' : '0');
    };

    tick(performance.now());
    return () => cancelAnimationFrame(animId);
  }, [running, size]);

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex' }} ref={containerRef}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
        {rings.map((_, i) => (
          <path
            key={i}
            ref={el => pathsRef.current[i] = el}
            fill="none"
            stroke={color}
            strokeWidth={size * 0.025}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.8"
          />
        ))}
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
