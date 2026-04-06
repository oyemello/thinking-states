'use client';

import { useEffect, useRef } from 'react';
import { hslToRgb } from '../utils/colorUtils';

// Animation helpers
const easeIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const PHASES = [
  { name: 'globe',    dur: 1800, t0: 0, t1: 0 },
  { name: 'morphIn',  dur: 1000, t0: 0, t1: 1 },
  { name: 'settled',  dur: 1700, t0: 1, t1: 1 },
  { name: 'morphOut', dur: 1000, t0: 1, t1: 0 },
];

export default function SolidMathThinkingState({
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
  const canvasRef = useRef(null);
  const animProps = useRef({ speedMultiplier, durations, onPhase, manualProgress, rotSpeed });

  useEffect(() => {
    animProps.current = { speedMultiplier, durations, onPhase, manualProgress, rotSpeed };
  }, [speedMultiplier, durations, onPhase, manualProgress, rotSpeed]);

  // Mesh definitions
  const R = size * 0.35;
  const cubeScale = 0.85;

  const LATS = 12;
  const LONS = 24;
  const vertices = [];
  const faces = [];

  // Generate Spherical Grid Vertices (Normalized)
  for (let i = 0; i <= LATS; i++) {
    const lat = Math.PI * (-0.5 + i / LATS);
    const ny = Math.sin(lat);
    const cosLat = Math.cos(lat);
    for (let j = 0; j <= LONS; j++) {
      const lon = (j / LONS) * Math.PI * 2;
      const nx = cosLat * Math.cos(lon);
      const nz = cosLat * Math.sin(lon);
      vertices.push({ nx, ny, nz });
    }
  }

  // Generate Quad Faces
  const resolveIdx = (i, j) => i * (LONS + 1) + j;
  for (let i = 0; i < LATS; i++) {
    for (let j = 0; j < LONS; j++) {
      const v1 = resolveIdx(i, j);
      const v2 = resolveIdx(i + 1, j);
      const v3 = resolveIdx(i + 1, j + 1);
      const v4 = resolveIdx(i, j + 1);
      faces.push([v1, v2, v3, v4]);
    }
  }

  useEffect(() => {
    let animId;
    let baseRotation = 0;
    let idx = 0;
    let start = performance.now();

    const cx = size / 2;
    const cy = size / 2;
    const ctx = canvasRef.current?.getContext('2d');

    // Get RGB values from the color prop
    const rgbColor = hslToRgb(color);

    // Set scale for retina displays
    const dpr = window.devicePixelRatio || 1;
    if (canvasRef.current) {
        canvasRef.current.width = size * dpr;
        canvasRef.current.height = size * dpr;
        ctx.scale(dpr, dpr);
    }

    const tick = (now) => {
      animId = requestAnimationFrame(tick);
      if (!ctx || !containerRef.current) return;

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

      // Pre-compute transformed vertices and light dot products
      const transformed = vertices.map(v => {
        const maxAx = Math.max(Math.abs(v.nx), Math.abs(v.ny), Math.abs(v.nz));
        const targetR = (R * cubeScale) / (maxAx || 1);
        const currentR = R * (1 - newT) + targetR * newT;

        const x0 = v.nx * currentR;
        const y0 = v.ny * currentR;
        const z0 = v.nz * currentR;

        // Rotate Y
        const x1 = x0 * cosY - z0 * sinY;
        const z1 = x0 * sinY + z0 * cosY;

        // Rotate X
        const y2 = y0 * cosX - z1 * sinX;
        const z2 = y0 * sinX + z1 * cosX;

        return { x: x1, y: y2, z: z2 };
      });

      // Assemble projected faces 
      const renderedFaces = [];
      const perspective = 300;
      
      const lightDir = { x: 0.3, y: -0.8, z: 0.5 }; // normalized-ish light source

      faces.forEach(f => {
        const p1 = transformed[f[0]];
        const p2 = transformed[f[1]];
        const p3 = transformed[f[2]];

        // compute face center
        const cz = (p1.z + p2.z + p3.z + transformed[f[3]].z) / 4;
        
        // compute cross product for normal vector
        const vx1 = p2.x - p1.x;
        const vy1 = p2.y - p1.y;
        const vz1 = p2.z - p1.z;
        const vx2 = p3.x - p1.x;
        const vy2 = p3.y - p1.y;
        const vz2 = p3.z - p1.z;

        const nx = vy1 * vz2 - vz1 * vy2;
        const ny = vz1 * vx2 - vx1 * vz2;
        const nz = vx1 * vy2 - vy1 * vx2;

        const length = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
        const normalizedNx = nx / length;
        const normalizedNy = ny / length;
        const normalizedNz = nz / length;

        // backface culling -> Camera is looking down -Z axis essentially, so if Nz > 0 face is pointing away 
        if (normalizedNz > 0.0) return;

        // lighting calculation
        const dot = normalizedNx * lightDir.x + normalizedNy * lightDir.y + normalizedNz * lightDir.z;
        const brightness = Math.max(0.2, Math.min(1, 0.4 + dot * 0.6));

        // Apply brightness to the RGB color from the color prop
        const rVal = Math.floor(rgbColor.r * brightness);
        const gVal = Math.floor(rgbColor.g * brightness);
        const bVal = Math.floor(rgbColor.b * brightness);

        const project = (p) => {
          const scale = perspective / (perspective + p.z);
          return { px: cx + p.x * scale, py: cy + p.y * scale };
        };

        renderedFaces.push({
          z: cz,
          pts: f.map(idx => project(transformed[idx])),
          color: `rgb(${rVal}, ${gVal}, ${bVal})`
        });
      });

      // Painter's algorithm (Sort back-to-front just in case, though backface culling helps massively)
      renderedFaces.sort((a, b) => b.z - a.z);

      // Draw
      ctx.clearRect(0, 0, size, size);
      
      renderedFaces.forEach(rf => {
        ctx.fillStyle = rf.color;
        // Stroke with same color prevents sub-pixel gaps between polygons
        ctx.strokeStyle = rf.color;
        ctx.lineWidth = 0.5; 
        
        ctx.beginPath();
        rf.pts.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.px, pt.py);
          else ctx.lineTo(pt.px, pt.py);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      const shouldShowLogo = ph.name === 'settled' && prog > 0.20 && prog < 0.78;
      containerRef.current.style.setProperty('--logo-op', shouldShowLogo ? '1' : '0');
    };

    tick(performance.now());
    return () => cancelAnimationFrame(animId);
  }, [running, size, color]);

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex' }} ref={containerRef}>
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      
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
