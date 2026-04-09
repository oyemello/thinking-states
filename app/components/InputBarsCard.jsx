export default function InputBarsCard({ label, children, glowFilter = 'none' }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '3.5rem 1.5rem 2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        border: '1px solid #e5e7eb',
        filter: glowFilter,
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

      <div style={{ width: '100%' }}>
        {children}
      </div>
    </div>
  );
}
