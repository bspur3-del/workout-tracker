'use client';

import { useState } from 'react';
import { logWorkoutAction } from '@/app/actions';
import { WorkoutType, WORKOUT_TYPES } from '@/lib/types';

const APP_START = '2026-06-22';

type Status = 'idle' | 'loading' | 'done' | 'already';

function getTodayLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDate(dateStr: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function LogForm({ users }: { users: string[] }) {
  const today = getTodayLocal();
  const [user, setUser] = useState<string | null>(null);
  const [date, setDate] = useState(today);
  const [workoutType, setWorkoutType] = useState<WorkoutType | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  async function handleLog() {
    if (!user || !workoutType) return;
    setStatus('loading');
    try {
      const result = await logWorkoutAction(user, date, workoutType);
      setStatus(result.alreadyLogged ? 'already' : 'done');
    } catch {
      setStatus('idle');
    }
  }

  function reset() {
    setUser(null);
    setDate(today);
    setWorkoutType(null);
    setStatus('idle');
  }

  const selectedTypeLabel = WORKOUT_TYPES.find(t => t.value === workoutType);
  const isBackfill = date !== today;

  if (status === 'done') {
    return (
      <main className="px-4 pt-16 text-center">
        <div className="text-8xl mb-6">🔥</div>
        <h2 className="text-3xl font-black mb-2" style={{ color: '#fff' }}>
          Let&apos;s go, {user}!
        </h2>
        <p
          className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-2"
          style={{ background: 'rgba(125,196,39,0.15)', color: 'var(--green)' }}
        >
          {selectedTypeLabel?.emoji} {selectedTypeLabel?.label}
        </p>
        <p className="text-sm mb-1" style={{ color: 'var(--muted)' }}>{formatDate(date)}</p>
        <p className="mb-10" style={{ color: 'var(--green)' }}>
          {isBackfill ? 'Logged to past date.' : 'Logged. Keep the streak alive.'}
        </p>
        <button onClick={reset} className="text-sm font-bold underline" style={{ color: 'var(--muted)' }}>
          Log another workout?
        </button>
      </main>
    );
  }

  if (status === 'already') {
    return (
      <main className="px-4 pt-16 text-center">
        <div className="text-8xl mb-6">✅</div>
        <h2 className="text-3xl font-black mb-2" style={{ color: '#fff' }}>
          Already logged!
        </h2>
        <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>
          {user} already logged{' '}
          <span style={{ color: 'var(--green)' }}>
            {selectedTypeLabel?.emoji} {selectedTypeLabel?.label}
          </span>{' '}
          on {formatDate(date)}.
        </p>
        <p className="mb-10" style={{ color: 'var(--muted)' }}>
          Pick a different workout type or date.
        </p>
        <button onClick={reset} className="text-sm font-bold underline" style={{ color: 'var(--muted)' }}>
          Go back
        </button>
      </main>
    );
  }

  const readyToLog = user && workoutType;
  const cols = users.length <= 3 ? users.length : users.length <= 4 ? 2 : 3;

  return (
    <main className="px-4 pt-10 pb-8">
      <h2 className="text-2xl font-black mb-1" style={{ color: '#fff' }}>Log Workout</h2>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>{formatDate(date)}</p>

      {/* Step 1: Who */}
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--muted)' }}>
        1 — Who are you?
      </p>
      <div className={`grid gap-3 mb-8`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {users.map(u => {
          const active = user === u;
          return (
            <button
              key={u}
              onClick={() => setUser(u)}
              className="py-4 rounded-2xl text-lg font-black transition-all active:opacity-75"
              style={{
                background: active ? 'var(--green)' : 'var(--card)',
                color: active ? '#000' : '#fff',
                border: `2px solid ${active ? 'var(--green)' : 'var(--border)'}`,
              }}
            >
              {u}
            </button>
          );
        })}
      </div>

      {/* Step 2: Date */}
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--muted)' }}>
        2 — When?
      </p>
      <div className="mb-8">
        <input
          type="date"
          value={date}
          min={APP_START}
          max={today}
          onChange={e => setDate(e.target.value)}
          className="px-4 py-3 rounded-2xl text-base font-bold"
          style={{
            background: 'var(--card)',
            border: `2px solid ${isBackfill ? '#F5A623' : 'var(--border)'}`,
            color: '#fff',
            colorScheme: 'dark',
          }}
        />
        {isBackfill && (
          <p className="text-xs mt-2 px-1" style={{ color: '#F5A623' }}>
            Logging to a past date — {formatDate(date)}
          </p>
        )}
      </div>

      {/* Step 3: What */}
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--muted)' }}>
        3 — What did you do?
      </p>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {WORKOUT_TYPES.map(({ value, label, emoji }) => {
          const active = workoutType === value;
          const isGrind = value === 'daily_grind';
          return (
            <button
              key={value}
              onClick={() => setWorkoutType(value)}
              className={`py-4 px-3 rounded-2xl font-bold transition-all active:opacity-75 flex items-center gap-2 ${isGrind ? 'col-span-2' : ''}`}
              style={{
                background: active
                  ? isGrind ? 'var(--green)' : 'rgba(125,196,39,0.15)'
                  : 'var(--card)',
                color: active
                  ? isGrind ? '#000' : 'var(--green)'
                  : '#fff',
                border: `2px solid ${active ? 'var(--green)' : 'var(--border)'}`,
                justifyContent: isGrind ? 'center' : 'flex-start',
                fontSize: isGrind ? '1.1rem' : '0.95rem',
              }}
            >
              <span className="text-xl">{emoji}</span>
              <span>{label}</span>
              {isGrind && (
                <span
                  className="ml-auto text-xs font-black px-2 py-0.5 rounded-full"
                  style={{
                    background: active ? 'rgba(0,0,0,0.2)' : 'rgba(125,196,39,0.2)',
                    color: active ? '#000' : 'var(--green)',
                  }}
                >
                  counts for streak
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Log button */}
      <button
        onClick={handleLog}
        disabled={!readyToLog || status === 'loading'}
        className="w-full py-7 rounded-2xl text-2xl font-black transition-all active:opacity-75 disabled:opacity-40"
        style={{
          background: readyToLog ? 'var(--green)' : 'var(--card)',
          color: readyToLog ? '#000' : '#333',
          border: readyToLog ? 'none' : '2px solid var(--border)',
          cursor: readyToLog ? 'pointer' : 'default',
        }}
      >
        {status === 'loading' ? 'Saving...' : 'I DID IT!  ⚡'}
      </button>
    </main>
  );
}
