'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const THINKING_VERBS = [
  'Analyzing',
  'Researching',
  'Processing',
  'Computing',
  'Evaluating',
  'Considering',
  'Synthesizing',
  'Reasoning',
  'Exploring',
  'Interpreting',
  'Reflecting',
  'Calculating',
  'Assessing',
  'Reviewing',
  'Examining',
  'Deriving',
  'Formulating',
  'Deducing',
  'Verifying',
];

function TypewriterText({ verbs }) {
  const [displayText, setDisplayText] = useState('');
  const [verbIndex, setVerbIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState('typing'); // 'typing' or 'deleting'

  const currentVerb = verbs[verbIndex];

  useEffect(() => {
    let timeout;

    if (phase === 'typing') {
      if (charIndex < currentVerb.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentVerb.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 80);
      } else {
        // Typed complete word, wait then start deleting
        timeout = setTimeout(() => {
          setPhase('deleting');
        }, 1500);
      }
    } else if (phase === 'deleting') {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setCharIndex(charIndex - 1);
          setDisplayText(currentVerb.slice(0, charIndex - 1));
        }, 50);
      } else {
        // Deleted complete word, move to next verb
        setVerbIndex((prev) => (prev + 1) % verbs.length);
        setPhase('typing');
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, phase, currentVerb, verbs]);

  return <span>{displayText}</span>;
}

export default function QuickViewModal({ isOpen, onClose, animationComponent, cardLabel }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '500px',
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
            {cardLabel}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#6b7280',
            }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Container */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* AI message 1 */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>AI</span>
            </div>
            <div
              style={{
                background: '#f3f4f6',
                padding: '10px 12px',
                borderRadius: '8px',
                maxWidth: '70%',
                color: '#374151',
                fontSize: '14px',
              }}
            >
              How can I help you?
            </div>
          </div>

          {/* User message */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <div
              style={{
                background: '#3b82f6',
                padding: '10px 12px',
                borderRadius: '8px',
                maxWidth: '70%',
                color: 'white',
                fontSize: '14px',
              }}
            >
              What is the weather?
            </div>
          </div>

          {/* AI thinking message */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              <div style={{ transform: 'scale(0.5)', transformOrigin: 'center', lineHeight: 1 }}>
                {animationComponent}
              </div>
            </div>
            <div
              style={{
                color: '#6b7280',
                fontSize: '14px',
                minHeight: '20px',
                display: 'flex',
                alignItems: 'center',
                fontFamily: 'monospace',
              }}
            >
              <TypewriterText verbs={THINKING_VERBS} />
            </div>
          </div>
        </div>

        {/* Input area */}
        <div
          style={{
            padding: '12px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '8px',
          }}
        >
          <input
            type="text"
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = '#3b82f6')}
            onBlur={e => (e.target.style.borderColor = '#d1d5db')}
          />
          <button
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
