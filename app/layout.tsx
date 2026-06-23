import type { Metadata } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'The Daily Grind',
  description: 'Blake vs Matt vs Kyle — who keeps the streak?',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="max-w-md mx-auto pb-28">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
