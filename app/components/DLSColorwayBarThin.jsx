import { Send } from 'lucide-react';

export default function DLSColorwayBarThin({ glowFilter = 'none' }) {
  return (
    <>
      <style>{`
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes solidPulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        @keyframes gradientPulse {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes rotateGradient {
          0% {
            --angle: 0deg;
          }
          100% {
            --angle: 360deg;
          }
        }

        .dls-bar-thin-solid {
          position: absolute;
          inset: 0;
          border-radius: 10px;
          border: 1px solid #006fcf;
          animation: solidPulse 3s ease-in-out infinite;
          pointer-events: none;
        }

        .dls-bar-thin-gradient {
          --angle: 0deg;
          position: absolute;
          inset: 0;
          border-radius: 10px;
          border: 1px solid transparent;
          padding: 1px;
          background: linear-gradient(#fff, #fff) padding-box,
                      conic-gradient(from var(--angle), #006fcf 0%, #2cd2f7 50%, #006fcf 100%) border-box;
          animation: gradientPulse 3s ease-in-out infinite, rotateGradient 8s linear infinite;
          pointer-events: none;
        }
      `}</style>
      <div
        style={{
          background: 'white',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'visible',
          padding: '16px',
          width: '100%',
          height: '56px',
          position: 'relative',
          filter: glowFilter,
        }}
      >
        <div className="dls-bar-thin-solid" />
        <div className="dls-bar-thin-gradient" />
        <input
          type="text"
          placeholder="Ask your AI Assistant"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            color: '#b3b3b3',
            position: 'relative',
            zIndex: 1,
          }}
        />

        <div style={{ background: '#b3b3b3', height: '26px', width: '1px', margin: '0 12px', zIndex: 1 }} />

        <Send
          size={28}
          style={{
            cursor: 'pointer',
            color: '#b3b3b3',
            transition: 'color 0.2s',
            position: 'relative',
            zIndex: 1,
          }}
          onMouseEnter={e => (e.target.style.color = '#006fcf')}
          onMouseLeave={e => (e.target.style.color = '#b3b3b3')}
        />
      </div>
    </>
  );
}
