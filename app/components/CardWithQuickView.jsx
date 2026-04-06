'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import QuickViewModal from './QuickViewModal';

export default function CardWithQuickView({ label, children, glowFilter = 'none' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

        {/* Eye icon button */}
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: '#9ca3af',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.target.style.color = '#3b82f6')}
          onMouseLeave={e => (e.target.style.color = '#9ca3af')}
          title="Quick view"
        >
          <Eye size={18} />
        </button>

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
