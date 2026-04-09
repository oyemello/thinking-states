'use client';

import { useState } from 'react';
import { Eye, Copy, Check } from 'lucide-react';
import QuickViewModal from './QuickViewModal';

export default function CardWithQuickView({ label, children, glowFilter = 'none', componentName }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopyCode = async () => {
    if (!componentName) return;
    try {
      // API routes are not supported on static GitHub Pages. 
      // In the future, this could be replaced with a static code mapping.
      /*
      const response = await fetch('/api/get-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentName })
      });
      const data = await response.json();
      if (data.code) {
        await navigator.clipboard.writeText(data.code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
      */
      console.log('Static export: Code copying via API is disabled.');
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <>
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '3.5rem 2rem 2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          border: '1px solid #e5e7eb',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {label && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              fontSize: '13px',
              color: '#888',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
            }}
          >
            {label}
          </div>
        )}

        {/* Copy icon button */}
        {componentName && isHovered && (
          <button
            onClick={handleCopyCode}
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '44px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: isCopied ? '#10b981' : '#9ca3af',
              transition: 'color 0.2s, opacity 0.2s',
              opacity: isHovered ? 1 : 0,
            }}
            onMouseEnter={e => !isCopied && (e.target.style.color = '#3b82f6')}
            onMouseLeave={e => !isCopied && (e.target.style.color = '#9ca3af')}
            title="Copy component code"
          >
            {isCopied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        )}

        {/* Eye icon button */}
        {isHovered && (
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#9ca3af',
              transition: 'color 0.2s, opacity 0.2s',
              opacity: isHovered ? 1 : 0,
            }}
            onMouseEnter={e => (e.target.style.color = '#3b82f6')}
            onMouseLeave={e => (e.target.style.color = '#9ca3af')}
            title="Quick view"
          >
            <Eye size={18} />
          </button>
        )}

        <div style={{ filter: glowFilter }}>
          {children}
        </div>
      </div>

      <QuickViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        animationComponent={children}
        cardLabel={label}
      />
    </>
  );
}
