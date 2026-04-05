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

function generateAsciiParticles(numParticles, r) {
  const particles = [];
  
  for(let i = 0; i < numParticles; i++) {
    // Math plotted Sphere coordinate map
    const phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const sx = r * Math.sin(phi) * Math.cos(theta);
    const sy = r * Math.sin(phi) * Math.sin(theta);
    const sz = r * Math.cos(phi);

    // Math plotted Cube planar coordinate map
    const face = Math.floor(Math.random() * 6);
    let cx=0, cy=0, cz=0;
    const u = (Math.random() * 2 - 1) * r;
    const v = (Math.random() * 2 - 1) * r;
    if (face===0) { cx=u; cy=v; cz=r; }   
    if (face===1) { cx=u; cy=v; cz=-r; }  
    if (face===2) { cx=u; cy=r; cz=v; }   
    if (face===3) { cx=u; cy=-r; cz=v; }  
    if (face===4) { cx=r; cy=u; cz=v; }   
    if (face===5) { cx=-r; cy=u; cz=v; }  

    particles.push({ sx, sy, sz, cx, cy, cz });
  }
  return particles;
}

export default function AsciiThinkingState({
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
  // Use a very high density of points to print solid text structures
  const particles = useMemo(() => generateAsciiParticles(2500, r), [r]); 

  useEffect(() => {
    animProps.current = { speedMultiplier, durations, rotSpeed, manualProgress };
  }, [speedMultiplier, durations, rotSpeed, manualProgress]);

  useEffect(() => {
    let animId;
    let baseRotation = Math.PI / 4; // Start at isometric angle internally
    let idx = 0;
    let start = performance.now();

    // Text rendering constraints mapping directly to square box bounds
    const cols = 52; 
    const rows = 28; 
    const chars = " .:-=+*#%@@"; // 11-step depth map luminance

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

      // Realtime CPU Javascript Matrix Rotations
      const cosY = Math.cos(baseRotation);
      const sinY = Math.sin(baseRotation);
      const angleX = -0.35; 
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Z-Buffer initialization mapping for textual depth testing
      const grid = new Array(cols * rows).fill(' ');
      const zBuffer = new Array(cols * rows).fill(-9999);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // 3D Morph coordinate translation
        let dx = p.sx * (1 - newT) + p.cx * newT;
        let dy = p.sy * (1 - newT) + p.cy * newT;
        let dz = p.sz * (1 - newT) + p.cz * newT;

        // Apply Y axis rotation
        let rx = dx * cosY + dz * sinY;
        let rz = -dx * sinY + dz * cosY;
        
        // Apply X axis isometric tilt
        let ry = dy * cosX - rz * sinX;
        let finalZ = dy * sinX + rz * cosX;

        // Compress and map floating pixels to discrete typographic terminal layouts
        const scaleX = (cols / 2) / (r * 1.5);
        const scaleY = (rows / 2) / (r * 1.5);
        
        const projX = Math.floor((rx * scaleX) + cols / 2);
        const projY = Math.floor((ry * scaleY) + rows / 2);

        if (projX >= 0 && projX < cols && projY >= 0 && projY < rows) {
            const index = projY * cols + projX;
            
            // Standard Z-index depth testing!
            if (finalZ > zBuffer[index]) {
              zBuffer[index] = finalZ;
              let lumIndex = Math.floor( ((finalZ + r) / (r * 2)) * chars.length );
              lumIndex = clamp(lumIndex, 0, chars.length - 1);
              grid[index] = chars[lumIndex];
            }
        }
      }

      // Reconstruct buffer and commit raw DOM writes directly
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
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <pre 
        ref={preRef}
        style={{
          fontFamily: 'monospace',
          fontSize: '4.8px', // Dense pixels!
          lineHeight: '4.4px',
          letterSpacing: '1.2px',
          fontWeight: 'bold',
          margin: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
