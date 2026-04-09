'use client';

import { useState } from 'react';
import AiSearchBar from './AiSearchBar';
import AnimatedStarSearchBar from './AnimatedStarSearchBar';
import GlowSearchBar from './GlowSearchBar';
import GeminiLoadingBar from './GeminiLoadingBar';
import GradientBorderBar from './GradientBorderBar';
import DLSColorwayBar from './DLSColorwayBar';
import DLSColorwayBarThin from './DLSColorwayBarThin';
import DLSColorwayBarQuad from './DLSColorwayBarQuad';
import DLSColorwayBarThinQuad from './DLSColorwayBarThinQuad';
import InputBarsCard from './InputBarsCard';
import Navigation from './Navigation';
import SettingsMenu from './SettingsMenu';
import { hslToRgb, getColorShades } from '../utils/colorUtils';

// Convert RGB to hex
const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0').toUpperCase()).join('');
};

export default function InputBarsPage({ onPageChange }) {
  const [currentPage, setCurrentPage] = useState('input-bars');
  const [color, setColor] = useState({ hue: 217, saturation: 100, lightness: 50 });
  const [glowIntensity, setGlowIntensity] = useState(0);

  const handlePageChange = (page) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setCurrentPage(page);
    }
  };

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

  const rgbColor = hslToRgb(colorHsl);
  const colorHex = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);

  return (
    <div className="flex flex-col items-center min-h-screen py-16 px-8 bg-background">
      <div className="w-full max-w-6xl mb-12">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Input Bars</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
            <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
            <SettingsMenu onSettingsChange={handleSettingsChange} color={color} glowIntensity={glowIntensity} />
          </div>
        </div>
      </div>

      <div className="grid w-full max-w-6xl grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cell 1: AI Search Bar */}
        <InputBarsCard label="1. AI Search Bar">
          <AiSearchBar glowFilter={glowFilter} />
        </InputBarsCard>

        {/* Cell 2: Animated Star Search Bar */}
        <InputBarsCard label="2. Animated Stars">
          <AnimatedStarSearchBar glowFilter={glowFilter} />
        </InputBarsCard>

        {/* Cell 3: Glow Search Bar */}
        <InputBarsCard label="3. Glow Effect">
          <GlowSearchBar glowFilter={glowFilter} />
        </InputBarsCard>

        {/* Cell 4: Gemini Loading Bar */}
        <InputBarsCard label="4. Gemini Loading">
          <GeminiLoadingBar glowFilter={glowFilter} />
        </InputBarsCard>

        {/* Cell 5: Gradient Border Bar */}
        <InputBarsCard label="5. Gradient Border">
          <GradientBorderBar glowFilter={glowFilter} />
        </InputBarsCard>

        {/* Cell 6: DLS Colorway Bar */}
        <InputBarsCard label="6. DLS Colorway">
          <DLSColorwayBar glowFilter={glowFilter} />
        </InputBarsCard>

        {/* Cell 7: DLS Colorway Thin */}
        <InputBarsCard label="7. DLS Colorway Thin">
          <DLSColorwayBarThin glowFilter={glowFilter} />
        </InputBarsCard>

        {/* Cell 8: DLS Colorway Quad */}
        <InputBarsCard label="8. DLS Colorway Quad">
          <DLSColorwayBarQuad glowFilter={glowFilter} />
        </InputBarsCard>

        {/* Cell 9: DLS Colorway Thin Quad */}
        <InputBarsCard label="9. DLS Colorway Thin Quad">
          <DLSColorwayBarThinQuad glowFilter={glowFilter} />
        </InputBarsCard>
      </div>
    </div>
  );
}
