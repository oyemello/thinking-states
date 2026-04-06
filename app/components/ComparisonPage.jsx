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
import CardWithQuickView from './CardWithQuickView';
import SettingsMenu from './SettingsMenu';
import AmexLogo from './AmexLogo';
import { hslToRgb, getColorShades } from '../utils/colorUtils';

// Convert RGB to hex
const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0').toUpperCase()).join('');
};

export default function ComparisonPage() {
  const [phase, setPhase] = useState('globe');

  // Clean synchronized timeline speeds
  const currentDurations = { globe: 1800, morphIn: 1000, settled: 1700, morphOut: 1000 };

  // Settings state
  const [color, setColor] = useState({ hue: 217, saturation: 100, lightness: 50 });
  const [glowIntensity, setGlowIntensity] = useState(0);

  const handleSettingsChange = (settings) => {
    if (settings.type === 'color') {
      setColor(prev => ({
        ...prev,
        [settings.property]: settings.value
      }));
    } else if (settings.type === 'glow') {
      setGlowIntensity(settings.value);
    } else if (settings.type === 'reset') {
      setColor({ hue: 217, saturation: 100, lightness: 50 });
      setGlowIntensity(0);
    }
  };

  const colorHsl = `hsl(${color.hue}, ${color.saturation}%, ${color.lightness}%)`;
  const glowFilter = glowIntensity > 0
    ? `drop-shadow(0 0 ${(glowIntensity / 100) * 20}px ${colorHsl})`
    : 'none';

  // Get RGB values and convert to hex for backward compatibility
  const rgbColor = hslToRgb(colorHsl);
  const colorHex = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
  const colorShades = getColorShades(colorHsl);

  return (
    <div className="flex flex-col items-center min-h-screen py-16 px-8 bg-background">
      <div className="w-full max-w-6xl mb-12">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Animation Gallery</h1>
            <p className="text-lg text-muted-foreground">Identical visual transitions computed through 18 different physical geometry architectures natively.</p>
          </div>
          <SettingsMenu onSettingsChange={handleSettingsChange} color={color} glowIntensity={glowIntensity} />
        </div>
      </div>

      <div className="grid w-full max-w-6xl grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {/* Cell 1 */}
        <Card label="1. 2D SVG Bezier Math" glowFilter={glowFilter}>
          <ThinkingState size={80} color={colorHex} logo={<AmexLogo size={40} />} durations={currentDurations} onPhase={setPhase} />
        </Card>

        {/* Cell 2 */}
        <Card label="2. Pure CSS 3D Box" glowFilter={glowFilter}>
          <Css3DThinkingState size={80} color={colorHex} logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 3 */}
        <Card label="3. Framer + Flubber Extrusion" glowFilter={glowFilter}>
          <FramerThinkingState size={80} color={colorHex} logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 4 */}
        <Card label="4. CSS Cross Rings (Glass)" glowFilter={glowFilter}>
          <AnimatedSphere size={80} color={colorHex} logo={<AmexLogo size={40} />} durations={currentDurations} useWhiteOutline />
        </Card>

        {/* Cell 5 */}
        <Card label="5. CSS Cross Rings" glowFilter={glowFilter}>
          <AnimatedSphere size={80} color={colorHex} logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 6 */}
        <Card label="6. HTML5 Canvas Paint" glowFilter={glowFilter}>
          <CanvasThinkingState size={80} color={colorHex} logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 7 */}
        <Card label="7. CSS Origami Net Fold" glowFilter={glowFilter}>
          <OrigamiThinkingState size={80} color={colorHex} logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 8 */}
        <Card label="8. CSS GPU Particle Swarm" glowFilter={glowFilter}>
          <ParticleThinkingState size={80} color={colorHex} logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 9 */}
        <Card label="9. ASCII Typographic Matrix" glowFilter={glowFilter}>
          <AsciiThinkingState size={80} color={colorHex} durations={currentDurations} />
        </Card>

        {/* Cell 10 */}
        <Card label="10. Soft-Body Elastic Physics" glowFilter={glowFilter}>
          <SoftBodyThinkingState size={80} color={colorHex} logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 11 */}
        <Card label="11. SVG Masking Reveal" glowFilter={glowFilter}>
          <ClipPathThinkingState size={80} color={colorHex} logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 12 */}
        <Card label="12. 3D Math Wireframe" glowFilter={glowFilter}>
          <WireframeThinkingState size={80} color={colorHex} logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 13 */}
        <Card label="13. Solid 3D Math Mesh" glowFilter={glowFilter}>
          <SolidMathThinkingState size={80} color={colorHex} logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 14 */}
        <Card label="14. CSS Orthogonal Rings" glowFilter={glowFilter}>
          <OrthogonalRingsThinkingState size={80} color={colorHex} logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 15 */}
        <Card label="15. GPU Particle Dots Only" glowFilter={glowFilter}>
          <DotParticleThinkingState size={80} color={colorHex} logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 16 */}
        <Card label="16. 3D Sphere Particles" glowFilter={glowFilter}>
          <Particle3DThinkingState size={80} color={colorHex} logo={<AmexLogo size={40} />} durations={currentDurations} />
        </Card>

        {/* Cell 17 */}
        <Card label="17. ASCII Geometric" glowFilter={glowFilter}>
          <AsciiGeometricThinkingState size={80} color={colorHex} durations={currentDurations} />
        </Card>

        {/* Cell 18 */}
        <Card label="18. ASCII Wireframe Globe" glowFilter={glowFilter}>
          <AsciiWireframeThinkingState size={80} color={colorHex} durations={currentDurations} />
        </Card>

      </div>
    </div>
  );
}

function Card({ label, children, glowFilter }) {
  return (
    <CardWithQuickView label={label} glowFilter={glowFilter}>{children}</CardWithQuickView>
  );
}
