'use client';

import { useState } from 'react';
import { logWorkoutAction } from '@/app/actions';

const USERS = ['Blake', 'Matt', 'Kyle'];

type Status = 'idle' | 'loading' | 'done' | 'already';

function getTodayLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function LogPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const today = getTodayLocal();

  async function handleLog() {
    if (!selected) return;
    setStatus('loading');
    try {
      const result = await logWorkoutAction(selected, today);
      setStatus(result.alreadyLogged ? 'already' : 'done');
    } catch {
      setStatus('idle');
    }
  }

  if (status === 'done') {
    return (
      <main className="px-4 pt-16 text-center">
        <div className="text-8xl mb-6 animate-bounce">🔥</div>
        <h2 className="text-3xl font-black mb-2" style={{ color: '#fff' }}>
          Let&apos;s go, {selected}!
        </h2>
        <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>
          {formatDate(today)}
        </p>
        <p className="mb-10" style={{ color: 'var(--green)' }}>Workout logged. Keep the streak alive.</p>
        <button
          onClick={() => { setSelected(null); setStatus('idle'); }}
          className="text-sm font-bold underline"
          style={{ color: 'var(--muted)' }}
        >
          Log for someone else?
        </button>
      </main>
    );
  }

  if (status === 'already') {
    return (
      <main className="px-4 pt-16 text-center">
        <div className="text-8xl mb-6">✅</div>
        <h2 className="text-3xl font-black mb-2" style={{ color: '#fff' }}>
          Already done, {selected}!
        </h2>
        <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>
          {formatDate(today)}
        </p>
        <p className="mb-10" style={{ color: 'var(--green)' }}>
          You already logged a workout today. Come back tomorrow.
        </p>
        <button
          onClick={() => { setSelected(null); setStatus('idle'); }}
          className="text-sm font-bold underline"
          style={{ color: 'var(--muted)' }}
        >
          Go back
        </button>
      </main>
    );
  }

  return (
    <main className="px-4 pt-10">
      <h2 className="text-2xl font-black mb-1" style={{ color: '#fff' }}>Log Workout</h2>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>{formatDate(today)}</p>

      <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--muted)' }}>
        Who are you?
      </p>

      <div className="space-y-3 mb-8">
        {USERS.map(user => {
          const active = selected === user;
          return (
            <button
              key={user}
              onClick={() => setSelected(user)}
              className="w-full py-5 rounded-2xl text-xl font-black transition-all active:scale-95"
              style={{
                background: active ? 'var(--green)' : 'var(--card)',
                color: active ? '#000' : '#fff',
                border: `2px solid ${active ? 'var(--green)' : 'var(--border)'}`,
              }}
            >
              {user}
            </button>
          );
        })}
      </div>

      {selected && (
        <button
          onClick={handleLog}
          disabled={status === 'loading'}
          className="w-full py-7 rounded-2xl text-2xl font-black transition-all active:scale-95 disabled:opacity-60"
          style={{ background: 'var(--green)', color: '#000' }}
        >
          {status === 'loading' ? 'Saving...' : 'I DID IT!  ⚡'}
        </button>
      )}

      {!selected && (
        <div
          className="w-full py-7 rounded-2xl text-2xl font-black text-center"
          style={{ background: 'var(--card)', color: '#333', border: '2px solid var(--border)' }}
        >
          I DID IT!  ⚡
        </div>
      )}
    </main>
  );
}
