import { Send } from 'lucide-react';

export default function GeminiLoadingBar() {
  return (
    <>
      <style>{`
        @keyframes borderFlow {
          0% {
            border-color: #006fcf;
          }
          20% {
            border-color: rgba(220, 20, 160, 0.8);
          }
          40% {
            border-color: rgba(147, 112, 219, 0.8);
          }
          60% {
            border-color: rgba(0, 150, 255, 0.3);
          }
          100% {
            border-color: #006fcf;
          }
        }

        .gemini-bar::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 10px;
          border: 2px solid transparent;
          animation: borderFlow 3s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>
      <div
        className="gemini-bar"
        style={{
          background: 'white',
          border: '2px solid transparent',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'visible',
          padding: '16px',
          width: '100%',
          height: '56px',
          position: 'relative',
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
