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
import Particle3DThinkingState from './Particle3DThinkingState';
import AsciiGeometricThinkingState from './AsciiGeometricThinkingState';
import AsciiWireframeThinkingState from './AsciiWireframeThinkingState';
import AmexLogo from './AmexLogo';

export default function ComparisonPage() {
  const [phase, setPhase] = useState('globe');
  
  // Clean synchronized timeline speeds 
  const currentDurations = { globe: 1800, morphIn: 1000, settled: 1700, morphOut: 1000 };

  return (
    <div className="flex flex-col items-center min-h-screen py-16 px-8 bg-background">
      <div className="w-full max-w-6xl mb-12 text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Animation Gallery</h1>
        <p className="text-lg text-muted-foreground text-balance mx-auto">Identical visual transitions computed through 15 different physical geometry architectures natively.</p>
      </div>

      <div className="grid w-full max-w-6xl grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
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

        {/* Cell 16 */}
        <Card label="16. 3D Sphere Particles">
          <Particle3DThinkingState size={80} color="#006fcf" logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 17 */}
        <Card label="17. ASCII Geometric">
          <AsciiGeometricThinkingState size={80} color="#006fcf" durations={currentDurations} />
        </Card>

        {/* Cell 18 */}
        <Card label="18. ASCII Wireframe Globe">
          <AsciiWireframeThinkingState size={80} color="#006fcf" durations={currentDurations} />
        </Card>

      </div>
    </div>
  );
}

function Card({ label, children }) {
  return (
    <div className="relative flex flex-col items-center justify-center p-8 pt-14 bg-card text-card-foreground shadow-sm border border-border rounded-xl">
      {label && (
        <div className="absolute top-4 left-4 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
