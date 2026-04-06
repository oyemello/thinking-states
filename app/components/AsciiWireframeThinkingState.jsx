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

function generateWireframeParticles(numParticles, r) {
  const particles = [];
  const f = val => Number(val.toFixed(5));

  for(let i = 0; i < numParticles; i++) {
    // Wireframe globe: dense points on latitude/longitude lines
    let sx, sy, sz;

    // Create dense grid of latitude/longitude intersections
    const latLines = 6;
    const lonLines = 12;
    const pointsPerLine = Math.ceil(numParticles / (latLines + lonLines));

    const lineIdx = Math.floor(i / pointsPerLine);
    const pointIdx = i % pointsPerLine;

    if (lineIdx < latLines) {
      // Latitude line
      const lat = (lineIdx / latLines) * Math.PI - Math.PI / 2;
      const lon = (pointIdx / pointsPerLine) * Math.PI * 2;
      sx = f(r * Math.cos(lat) * Math.cos(lon));
      sy = f(r * Math.sin(lat));
      sz = f(r * Math.cos(lat) * Math.sin(lon));
    } else {
      // Longitude line
      const lon = ((lineIdx - latLines) / lonLines) * Math.PI * 2;
      const lat = (pointIdx / pointsPerLine) * Math.PI - Math.PI / 2;
      sx = f(r * Math.cos(lat) * Math.cos(lon));
      sy = f(r * Math.sin(lat));
      sz = f(r * Math.cos(lat) * Math.sin(lon));
    }

    // Cube: Deterministic distribution on cube faces
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

    if (face===0) { cx=u; cy=v; cz=fixedR; }
    if (face===1) { cx=u; cy=v; cz=-fixedR; }
    if (face===2) { cx=u; cy=fixedR; cz=v; }
    if (face===3) { cx=u; cy=-fixedR; cz=v; }
    if (face===4) { cx=fixedR; cy=u; cz=v; }
    if (face===5) { cx=-fixedR; cy=u; cz=v; }

    particles.push({ sx, sy, sz, cx, cy, cz });
  }
  return particles;
}

export default function AsciiWireframeThinkingState({
  size = 80,
  color = '#006fcf',
  running = true,
  speedMultiplier = 1,
  durations = {},
  manualProgress = null,
  rotSpeed = 1,
}) {
  const preRef = useRef(null);
  const animProps = useRef({ speedMultiplier, durations, rotSpeed, manualProgress });

  const r = size * 0.40;
  const particles = useMemo(() => generateWireframeParticles(2500, r), [r]);

  useEffect(() => {
    animProps.current = { speedMultiplier, durations, rotSpeed, manualProgress };
  }, [speedMultiplier, durations, rotSpeed, manualProgress]);

  useEffect(() => {
    let animId;
    let baseRotation = Math.PI / 4;
    let idx = 0;
    let start = performance.now();

    const cols = 28;
    const rows = 28;
    const chars = " .:-=+*#%@@";

    const tick = (now) => {
      animId = requestAnimationFrame(tick);
      if (!preRef.current) return;

      if (running && animProps.current.manualProgress === null) {
        baseRotation += 0.012 * animProps.current.rotSpeed;
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
          idx = (idx + 1) % PHASES.length;
          start = now;
        }
      }

      const cosY = Math.cos(baseRotation);
      const sinY = Math.sin(baseRotation);
      const angleX = -0.35;
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const grid = new Array(cols * rows).fill(' ');
      const zBuffer = new Array(cols * rows).fill(-9999);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        let dx = p.sx * (1 - newT) + p.cx * newT;
        let dy = (p.sy * (1 - newT) + p.cy * newT) * (newT < 0.5 ? 0.92 : 1);
        let dz = p.sz * (1 - newT) + p.cz * newT;

        let rx = dx * cosY + dz * sinY;
        let rz = -dx * sinY + dz * cosY;

        let ry = dy * cosX - rz * sinX;
        let finalZ = dy * sinX + rz * cosX;

        const scaleX = (cols / 2) / (r * 1.5);
        const scaleY = (rows / 2) / (r * 1.5);

        const projX = Math.floor((rx * scaleX) + cols / 2);
        const projY = Math.floor((ry * scaleY) + rows / 2);

        if (projX >= 0 && projX < cols && projY >= 0 && projY < rows) {
          const index = projY * cols + projX;

          if (finalZ > zBuffer[index]) {
            zBuffer[index] = finalZ;
            let lumIndex = Math.floor(((finalZ + r) / (r * 2)) * chars.length);
            lumIndex = clamp(lumIndex, 0, chars.length - 1);
            grid[index] = chars[lumIndex];
          }
        }
      }

      let output = "";
      for (let r = 0; r < rows; r++) {
        output += grid.slice(r * cols, r * cols + cols).join('') + "\n";
      }

      preRef.current.textContent = output;
      preRef.current.style.color = color;
    };

    tick(performance.now());
    return () => cancelAnimationFrame(animId);
  }, [running, color]);

  return (
    <div style={{ position: 'relative', width: size, height: size - 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <pre
        ref={preRef}
        style={{
          fontFamily: 'monospace',
          fontSize: '2.4px',
          lineHeight: '2.2px',
          letterSpacing: '0.6px',
          fontWeight: 'bold',
          margin: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
