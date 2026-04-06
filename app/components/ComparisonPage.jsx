'use client';

import { useState } from 'react';
import ThinkingState from './ThinkingState';
import Css3DThinkingState from './Css3DThinkingState';
import FramerThinkingState from './FramerThinkingState';
import AnimatedSphere from './AnimatedSphere';
import CanvasThinkingState from './CanvasThinkingState';
import OrigamiThinkingState from './OrigamiThinkingState';
import ParticleThinkingState from './ParticleThinkingState';
import AsciiThinkingState from './AsciiThinkingState';
import SoftBodyThinkingState from './SoftBodyThinkingState';
import ClipPathThinkingState from './ClipPathThinkingState';
import WireframeThinkingState from './WireframeThinkingState';
import SolidMathThinkingState from './SolidMathThinkingState';
import OrthogonalRingsThinkingState from './OrthogonalRingsThinkingState';
import DotParticleThinkingState from './DotParticleThinkingState';
import AmexLogo from './AmexLogo';

export default function ComparisonPage() {
  const [phase, setPhase] = useState('globe');
  
  // Clean synchronized timeline speeds 
  const currentDurations = { globe: 1800, morphIn: 1000, settled: 1700, morphOut: 1000 };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7f9', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: '1200px', width: '100%', marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#1a1a1a', marginBottom: '0.5rem', fontWeight: 700 }}>Animation Gallery</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>Identical visual transitions computed through 11 different physical geometry architectures natively.</p>
      </div>

      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', 
        maxWidth: '1200px', width: '100%' 
      }}>
        
        {/* Cell 1 */}
        <Card label="1. 2D SVG Bezier Math">
          <ThinkingState size={80} color="#006fcf" logo={<AmexLogo size={40} />} durations={currentDurations} onPhase={setPhase} />
        </Card>

        {/* Cell 2 */}
        <Card label="2. Pure CSS 3D Box">
          <Css3DThinkingState size={80} color="#006fcf" logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 3 */}
        <Card label="3. Framer + Flubber Extrusion">
          <FramerThinkingState size={80} color="#006fcf" logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 4 */}
        <Card label="4. CSS Cross Rings (Glass)">
          <AnimatedSphere size={80} color="#006fcf" logo={<AmexLogo size={40} />} durations={currentDurations} useWhiteOutline />
        </Card>

        {/* Cell 5 */}
        <Card label="5. CSS Cross Rings">
          <AnimatedSphere size={80} color="#006fcf" logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 6 */}
        <Card label="6. HTML5 Canvas Paint">
          <CanvasThinkingState size={80} color="#006fcf" logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 7 */}
        <Card label="7. CSS Origami Net Fold">
          <OrigamiThinkingState size={80} color="#006fcf" logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 8 */}
        <Card label="8. CSS GPU Particle Swarm">
          <ParticleThinkingState size={80} color="#006fcf" logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 9 */}
        <Card label="9. ASCII Typographic Matrix">
          <AsciiThinkingState size={80} color="#006fcf" durations={currentDurations} />
        </Card>

        {/* Cell 10 */}
        <Card label="10. Soft-Body Elastic Physics">
          <SoftBodyThinkingState size={80} color="#006fcf" logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 11 */}
        <Card label="11. SVG Masking Reveal">
          <ClipPathThinkingState size={80} color="#006fcf" logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 12 */}
        <Card label="12. 3D Math Wireframe">
          <WireframeThinkingState size={80} color="#006fcf" logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 13 */}
        <Card label="13. Solid 3D Math Mesh">
          <SolidMathThinkingState size={80} color="#006fcf" logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 14 */}
        <Card label="14. CSS Orthogonal Rings">
          <OrthogonalRingsThinkingState size={80} color="#006fcf" logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 15 */}
        <Card label="15. GPU Particle Dots Only">
          <DotParticleThinkingState size={80} color="#006fcf" logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

      </div>
    </div>
  );
}

function Card({ label, children }) {
  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '3.5rem 2rem 2.5rem 2rem',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      position: 'relative'
    }}>
      {label && (
        <div style={{
          position: 'absolute', top: '16px', left: '16px', fontSize: '13px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px'
        }}>
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
