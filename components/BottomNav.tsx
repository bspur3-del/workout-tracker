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
      className="flex"
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '416px',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        zIndex: 50,
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
