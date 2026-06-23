'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Leaderboard', icon: '🏆' },
  { href: '/log', label: 'Log It', icon: '⚡' },
  { href: '/workout', label: 'Workout', icon: '💪' },
  { href: '/stats', label: 'Stats', icon: '📊' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex"
      style={{
        background: 'var(--card)',
        borderTop: '1px solid var(--border)',
        maxWidth: '448px',
        margin: '0 auto',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
      }}
    >
      {links.map(({ href, label, icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold transition-colors"
            style={{ color: active ? 'var(--green)' : 'var(--muted)' }}
          >
            <span className="text-xl leading-none">{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
