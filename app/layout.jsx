import Script from 'next/script';
import { Agentation } from 'agentation';
import './globals.css';

export const metadata = {
  title: 'Thinking State — One World · One Service',
  description: 'Globe → Cube → Logo thinking state animation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === 'development' && (
          <Script
            src="https://unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>
        {children}
        {process.env.NODE_ENV === 'development' && <Agentation />}
      </body>
    </html>
  );
}
