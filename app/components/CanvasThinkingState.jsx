'use client';

import { useEffect, useRef } from 'react';

// Animation helpers
const easeIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp   = (a, b, t)   => a + (b - a) * t;

const PHASES = [
  { name: 'globe',    dur: 1800, t0: 0, t1: 0 },
  { name: 'morphIn',  dur: 1000, t0: 0, t1: 1 },
  { name: 'settled',  dur: 1700, t0: 1, t1: 1 },
  { name: 'morphOut', dur: 1000, t0: 1, t1: 0 },
];

function buildMorphPathString(t, cx, cy, r) {
  const k  = 0.5523 * r;
  const lp = (a, b) => lerp(a, b, t).toFixed(3);
  const cp = (ccx, ccy, sx, sy) => `${lp(ccx, sx)},${lp(ccy, sy)}`;

  const [tx, ty] = [cx,     cy - r]; 
  const [rx, ry] = [cx + r, cy    ]; 
  const [bx, by] = [cx,     cy + r]; 
  const [lx, ly] = [cx - r, cy    ]; 

  const [TRx, TRy] = [cx + r, cy - r];
  const [BRx, BRy] = [cx + r, cy + r];
  const [BLx, BLy] = [cx - r, cy + r];
  const [TLx, TLy] = [cx - r, cy - r];

  return [
    `M ${tx},${ty}`,
    `C ${cp(cx + k, cy - r, TRx, TRy)} ${cp(cx + r, cy - k, TRx, TRy)} ${rx},${ry}`,
    `C ${cp(cx + r, cy + k, BRx, BRy)} ${cp(cx + k, cy + r, BRx, BRy)} ${bx},${by}`,
    `C ${cp(cx - k, cy + r, BLx, BLy)} ${cp(cx - r, cy + k, BLx, BLy)} ${lx},${ly}`,
    `C ${cp(cx - r, cy - k, TLx, TLy)} ${cp(cx - k, cy - r, TLx, TLy)} ${tx},${ty}`,
    'Z',
  ].join(' ');
}

export default function CanvasThinkingState({
  size = 80,
  color = '#006fcf',
  logo = null, // Note: For Canvas, complex React node logos would need to be converted to Image() buffering. We'll skip complex logo blitting to keep it ultra lightweight CPU benchmark.
  running = true,
  speedMultiplier = 1,
  durations = {},
  manualProgress = null,
  onPhase,
}) {
  const canvasRef = useRef(null);
  const animProps = useRef({ speedMultiplier, durations, onPhase, manualProgress });

  useEffect(() => {
    animProps.current = { speedMultiplier, durations, onPhase, manualProgress };
  }, [speedMultiplier, durations, onPhase, manualProgress]);

  useEffect(() => {
    let animId;
    let idx = 0;
    let start = performance.now();
    
    const cx = size / 2;
    const cy = size / 2;
    const r  = size * 0.35;
    const DX = size * 0.125;
    const DY = -(size * 0.10);
    const sw = size * 0.019;
    
    const TL = [cx - r, cy - r];
    const TR = [cx + r, cy - r];
    const BR = [cx + r, cy + r];

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // To prevent blur, scale for retina displays natively
    const dpr = window.devicePixelRatio || 1;
    // We already do standard Canvas resizing internally manually inside the functional component, but we will apply standard scaling once here
    canvasRef.current.width = size * dpr;
    canvasRef.current.height = size * dpr;
    ctx.scale(dpr, dpr);

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
      } else if (running) {
        const duration = (animProps.current.durations[ph.name] ?? ph.dur) / animProps.current.speedMultiplier;
        prog = clamp((now - start) / duration, 0, 1);
        newT = ph.t0 + (ph.t1 - ph.t0) * easeIO(prog);

        if (prog >= 1) {
          const next = PHASES[(idx + 1) % PHASES.length];
          animProps.current.onPhase?.(next.name);
          idx = (idx + 1) % PHASES.length;
          start = now;
        }
      }

      ctx.clearRect(0, 0, size, size);

      const fillOp = clamp((newT - 0.28) / 0.72, 0, 1);
      const globeOp = clamp(1 - newT * 2.2, 0, 1);
      const depthOp = clamp((newT - 0.80) / 0.20, 0, 1);

      // Draw Top/Right Depth faces
      if (depthOp > 0) {
        ctx.globalAlpha = depthOp;
        
        ctx.fillStyle = '#1a8ff5';
        ctx.globalAlpha = depthOp * 0.88;
        ctx.beginPath();
        ctx.moveTo(TL[0] + DX, TL[1] + DY);
        ctx.lineTo(TR[0] + DX, TR[1] + DY);
        ctx.lineTo(TR[0], TR[1]);
        ctx.lineTo(TL[0], TL[1]);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#004b8c';
        ctx.globalAlpha = depthOp * 0.95;
        ctx.beginPath();
        ctx.moveTo(TR[0], TR[1]);
        ctx.lineTo(TR[0] + DX, TR[1] + DY);
        ctx.lineTo(BR[0] + DX, BR[1] + DY);
        ctx.lineTo(BR[0], BR[1]);
        ctx.closePath();
        ctx.fill();

        // Lines
        ctx.strokeStyle = '#00274a';
        ctx.lineWidth = sw;
        ctx.globalAlpha = depthOp * 0.6;
        ctx.beginPath();
        ctx.moveTo(TL[0], TL[1]); ctx.lineTo(TL[0] + DX, TL[1] + DY);
        ctx.moveTo(TR[0], TR[1]); ctx.lineTo(TR[0] + DX, TR[1] + DY);
        ctx.moveTo(BR[0], BR[1]); ctx.lineTo(BR[0] + DX, BR[1] + DY);
        ctx.stroke();
      }

      // Draw Morphing Front View dynamically mapped into Canvas Path2D
      ctx.globalAlpha = 1;
      const frontPathStr = buildMorphPathString(newT, cx, cy, r);
      const p2d = new Path2D(frontPathStr);

      if (fillOp > 0) {
        ctx.fillStyle = `rgba(0,111,207,${fillOp.toFixed(3)})`;
        ctx.fill(p2d);
      }
      
      ctx.strokeStyle = color;
      ctx.lineWidth = sw;
      ctx.stroke(p2d);

      // Draw complex globe wireframe
      if (globeOp > 0) {
        ctx.globalAlpha = globeOp;
        ctx.strokeStyle = color;

        // Use standard canvas ellipse context drawings 
        ctx.beginPath();
        ctx.globalAlpha = globeOp * 0.70;
        ctx.ellipse(cx, cy - r * 0.50, r * 0.866, r * 0.22, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.globalAlpha = globeOp * 0.75;
        ctx.ellipse(cx, cy, r, r * 0.27, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.globalAlpha = globeOp * 0.70;
        ctx.ellipse(cx, cy + r * 0.50, r * 0.866, r * 0.22, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.globalAlpha = globeOp * 0.65;
        ctx.ellipse(cx, cy, r * 0.30, r, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.globalAlpha = globeOp * 0.52;
        ctx.ellipse(cx, cy, r * 0.30, r, (60 * Math.PI) / 180, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.globalAlpha = globeOp * 0.52;
        ctx.ellipse(cx, cy, r * 0.30, r, (-60 * Math.PI) / 180, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    tick(performance.now());
    return () => cancelAnimationFrame(animId);
  }, [running, size, color]);

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex' }}>
      <canvas 
        ref={canvasRef} 
        style={{ width: `${size}px`, height: `${size}px`, display: 'block' }}
      />
      {/* Fallback to CSS Logo layer floating directly ABOVE the canvas for absolute performance mapping */}
      {logo && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', mixBlendMode: 'plus-lighter'
        }}>
          {logo}
        </div>
      )}
    </div>
  );
}
