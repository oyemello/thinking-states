'use client';

import { useState } from 'react';
import AiSearchBar from './AiSearchBar';
import AnimatedStarSearchBar from './AnimatedStarSearchBar';
import GlowSearchBar from './GlowSearchBar';
import GeminiLoadingBar from './GeminiLoadingBar';
import GradientBorderBar from './GradientBorderBar';
import InputBarsCard from './InputBarsCard';
import Navigation from './Navigation';

export default function InputBarsPage({ onPageChange }) {
  const [currentPage, setCurrentPage] = useState('input-bars');

  const handlePageChange = (page) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-16 px-8 bg-background">
      <div className="w-full max-w-6xl mb-12">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Input Bars</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
            <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
          </div>
        </div>
      </div>

      <div className="grid w-full max-w-6xl grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cell 1: AI Search Bar */}
        <InputBarsCard label="1. AI Search Bar">
          <AiSearchBar />
        </InputBarsCard>

        {/* Cell 2: Animated Star Search Bar */}
        <InputBarsCard label="2. Animated Stars">
          <AnimatedStarSearchBar />
        </InputBarsCard>

        {/* Cell 3: Glow Search Bar */}
        <InputBarsCard label="3. Glow Effect">
          <GlowSearchBar />
        </InputBarsCard>

        {/* Cell 4: Gemini Loading Bar */}
        <InputBarsCard label="4. Gemini Loading">
          <GeminiLoadingBar />
        </InputBarsCard>

        {/* Cell 5: Gradient Border Bar */}
        <InputBarsCard label="5. Gradient Border">
          <GradientBorderBar />
        </InputBarsCard>
      </div>
    </div>
  );
}
