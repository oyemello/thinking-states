import { Send } from 'lucide-react';

export default function GradientBorderBar() {
  return (
    <>
      <style>{`
        @property --a {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes gradientRotate {
          to { --a: 360deg }
        }

        .gradient-border-bar {
          --a: 0deg;
          position: relative;
          border-radius: 10px;
        }

        .gradient-border-bar::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 10px;
          padding: 2px;
          background: conic-gradient(
            from var(--a),
            hsl(0, 100%, 50%),
            hsl(60, 100%, 50%),
            hsl(120, 100%, 50%),
            hsl(180, 100%, 50%),
            hsl(240, 100%, 50%),
            hsl(300, 100%, 50%),
            hsl(360, 100%, 50%)
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#000 0 0);
          mask-composite: exclude;
          animation: gradientRotate 10s linear infinite;
          pointer-events: none;
        }
      `}</style>

      <div
        className="gradient-border-bar"
        style={{
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'visible',
          padding: '16px',
          width: '100%',
          height: '56px',
          position: 'relative',
          borderRadius: '10px',
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
