'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

// Utility functions for color conversion
const hslToHex = (h, s, l) => {
  const c = (1 - Math.abs(2 * l / 100 - 1)) * (s / 100);
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l / 100 - c / 2;
  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0').toUpperCase()).join('');
};

const hexToHsl = (hex) => {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

export default function SettingsMenu({ onSettingsChange, color, glowIntensity }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState('');
  const currentHex = hslToHex(color.hue, color.saturation, color.lightness);

  const handleHexChange = (value) => {
    // Allow typing freely, just store the value
    setHexInput(value);
  };

  const applyHexChange = () => {
    // Validate and apply when user is done typing
    const cleanHex = hexInput.trim();
    if (/^#?[0-9A-F]{6}$/i.test(cleanHex)) {
      const hex = cleanHex.startsWith('#') ? cleanHex : '#' + cleanHex;
      const hsl = hexToHsl(hex);
      onSettingsChange({ type: 'color', property: 'hue', value: hsl.h });
      onSettingsChange({ type: 'color', property: 'saturation', value: hsl.s });
      onSettingsChange({ type: 'color', property: 'lightness', value: hsl.l });
      setHexInput('');
    } else {
      setHexInput('');
    }
  };

  const handleColorChange = (property, value) => {
    onSettingsChange({ type: 'color', property, value });
  };

  const handleGlowChange = (value) => {
    onSettingsChange({ type: 'glow', value });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          color: '#6b7280',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.target.style.color = '#1f2937')}
        onMouseLeave={e => (e.target.style.color = '#6b7280')}
        title="Settings"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            zIndex: 2000,
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              background: 'white',
              width: '100%',
              maxWidth: '320px',
              height: '100vh',
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#6b7280',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Glow Settings */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  Glow Effect
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(glowIntensity)}
                  onChange={e => handleGlowChange(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  style={{
                    width: '50px',
                    padding: '4px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px',
                    textAlign: 'right',
                    color: '#1f2937',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={glowIntensity}
                  onChange={e => handleGlowChange(parseFloat(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '15px' }}>
                  %
                </span>
              </div>
            </div>

            {/* Color Settings */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                Color Controls
              </h3>

              {/* Color Preview */}
              <div
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '8px',
                  background: `hsl(${color.hue}, ${color.saturation}%, ${color.lightness}%)`,
                  border: '1px solid #e5e7eb',
                  marginBottom: '16px',
                }}
              />

              {/* Hex Input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                  Hex Color
                </label>
                <input
                  type="text"
                  value={hexInput || currentHex}
                  onChange={e => handleHexChange(e.target.value)}
                  onBlur={() => applyHexChange()}
                  onKeyDown={e => e.key === 'Enter' && applyHexChange()}
                  placeholder="#006FCF"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    color: '#1f2937',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={e => {
                    e.target.style.borderColor = '#d1d5db';
                    applyHexChange();
                  }}
                />
              </div>

              {/* Hue */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#6b7280' }}>Hue</label>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={color.hue}
                    onChange={e => handleColorChange('hue', Math.max(0, Math.min(360, parseFloat(e.target.value) || 0)))}
                    style={{
                      width: '50px',
                      padding: '4px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '11px',
                      textAlign: 'right',
                      color: '#1f2937',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                    onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={color.hue}
                  onChange={e => handleColorChange('hue', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>{Math.round(color.hue)}°</span>
              </div>

              {/* Saturation */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#6b7280' }}>Saturation</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={color.saturation}
                    onChange={e => handleColorChange('saturation', Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    style={{
                      width: '50px',
                      padding: '4px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '11px',
                      textAlign: 'right',
                      color: '#1f2937',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                    onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={color.saturation}
                  onChange={e => handleColorChange('saturation', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>{Math.round(color.saturation)}%</span>
              </div>

              {/* Lightness */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#6b7280' }}>Lightness</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={color.lightness}
                    onChange={e => handleColorChange('lightness', Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    style={{
                      width: '50px',
                      padding: '4px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '11px',
                      textAlign: 'right',
                      color: '#1f2937',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                    onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={color.lightness}
                  onChange={e => handleColorChange('lightness', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>{Math.round(color.lightness)}%</span>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                onSettingsChange({ type: 'reset' });
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.target.style.background = '#e5e7eb')}
              onMouseLeave={e => (e.target.style.background = '#f3f4f6')}
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}
    </>
  );
}
