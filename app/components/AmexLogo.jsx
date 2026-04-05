'use client';

export default function AmexLogo({ size = 40 }) {
  return (
    <div id="amex-logo" style={{ width: size, height: size }}>
      <img 
        src="/Amex_Bluebox-Logo.png" 
        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
        alt="American Express Logo" 
      />
    </div>
  );
}
