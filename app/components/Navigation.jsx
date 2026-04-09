'use client';

export default function Navigation({ currentPage, onPageChange }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
      }}
    >
      <button
        onClick={() => onPageChange('thinking-states')}
        style={{
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 600,
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: currentPage === 'thinking-states' ? '#3b82f6' : '#e5e7eb',
          color: currentPage === 'thinking-states' ? 'white' : '#374151',
          transition: 'all 0.2s',
        }}
      >
        Thinking States
      </button>

      <button
        onClick={() => onPageChange('input-bars')}
        style={{
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 600,
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: currentPage === 'input-bars' ? '#3b82f6' : '#e5e7eb',
          color: currentPage === 'input-bars' ? 'white' : '#374151',
          transition: 'all 0.2s',
        }}
      >
        Input Bars
      </button>
    </div>
  );
}
