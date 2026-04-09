import { Send } from 'lucide-react';

export default function GlowSearchBar({ glowFilter = 'none' }) {
  return (
    <>
      <style>{`
        @keyframes geminiGlow {
          0% {
            box-shadow:
              30px 0px 25px -15px rgba(0, 150, 255, 0.5),
              15px 26px 25px -15px rgba(100, 200, 255, 0.3),
              -15px 26px 25px -15px rgba(147, 112, 219, 0.3),
              -30px 0px 25px -15px rgba(220, 20, 160, 0.5),
              -15px -26px 25px -15px rgba(34, 197, 94, 0.3),
              15px -26px 25px -15px rgba(59, 130, 246, 0.3);
          }
          25% {
            box-shadow:
              15px 26px 25px -15px rgba(100, 200, 255, 0.5),
              -15px 26px 25px -15px rgba(147, 112, 219, 0.3),
              -30px 0px 25px -15px rgba(220, 20, 160, 0.3),
              -15px -26px 25px -15px rgba(34, 197, 94, 0.5),
              15px -26px 25px -15px rgba(59, 130, 246, 0.3),
              30px 0px 25px -15px rgba(0, 150, 255, 0.3);
          }
          50% {
            box-shadow:
              -15px 26px 25px -15px rgba(147, 112, 219, 0.5),
              -30px 0px 25px -15px rgba(220, 20, 160, 0.3),
              -15px -26px 25px -15px rgba(34, 197, 94, 0.3),
              15px -26px 25px -15px rgba(59, 130, 246, 0.5),
              30px 0px 25px -15px rgba(0, 150, 255, 0.3),
              15px 26px 25px -15px rgba(100, 200, 255, 0.3);
          }
          75% {
            box-shadow:
              -30px 0px 25px -15px rgba(220, 20, 160, 0.5),
              -15px -26px 25px -15px rgba(34, 197, 94, 0.3),
              15px -26px 25px -15px rgba(59, 130, 246, 0.3),
              30px 0px 25px -15px rgba(0, 150, 255, 0.5),
              15px 26px 25px -15px rgba(100, 200, 255, 0.3),
              -15px 26px 25px -15px rgba(147, 112, 219, 0.3);
          }
          100% {
            box-shadow:
              30px 0px 25px -15px rgba(0, 150, 255, 0.5),
              15px 26px 25px -15px rgba(100, 200, 255, 0.3),
              -15px 26px 25px -15px rgba(147, 112, 219, 0.3),
              -30px 0px 25px -15px rgba(220, 20, 160, 0.5),
              -15px -26px 25px -15px rgba(34, 197, 94, 0.3),
              15px -26px 25px -15px rgba(59, 130, 246, 0.3);
          }
        }

        .glow-search-bar {
          animation: geminiGlow 6s linear infinite;
        }
      `}</style>
      <div
        className="glow-search-bar"
        style={{
          background: 'white',
          border: '1px solid rgba(100, 150, 200, 0.3)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'clip',
          padding: '16px',
          width: '100%',
          height: '56px',
          boxShadow: 'none',
          filter: glowFilter,
        }}
    >
      <input
        type="text"
        placeholder="Ask your AI Assistant"
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          paddingLeft: '24px',
          fontSize: '14px',
          color: '#b3b3b3',
        }}
      />

      <div style={{ background: '#b3b3b3', height: '26px', width: '1px', margin: '0 12px' }} />

      <Send
        size={28}
        style={{
          cursor: 'pointer',
          color: 'rgba(0, 111, 207, 0.9)',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.target.style.color = 'rgba(0, 111, 207, 1)')}
        onMouseLeave={e => (e.target.style.color = 'rgba(0, 111, 207, 0.9)')}
      />
      </div>
    </>
  );
}
