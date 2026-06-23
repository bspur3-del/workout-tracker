'use client';

import { useState } from 'react';
import { Workout } from '@/lib/db';
import { UserStats } from '@/lib/streak';
import { WORKOUT_TYPES, WorkoutType } from '@/lib/types';

const USERS = ['Blake', 'Matt', 'Kyle'];

const TYPE_COLOR: Record<WorkoutType, string> = {
  daily_grind: '#7DC427',
  crossfit:    '#F5A623',
  hyrox:       '#60A5FA',
  barbell:     '#A78BFA',
  run:         '#F87171',
  bike:        '#FBBF24',
  walk:        '#34D399',
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function dateToStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMondayOfDate(d: Date): Date {
  const day = d.getDay();
  const daysBack = day === 0 ? 6 : day - 1;
  const monday = new Date(d);
  monday.setDate(d.getDate() - daysBack);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Returns 8 weeks of dates (oldest first), each week is Mon→Sun
function buildCalendar(): string[][] {
  const today = new Date();
  const thisMonday = getMondayOfDate(today);
  const weeks: string[][] = [];
  for (let w = 7; w >= 0; w--) {
    const weekStart = new Date(thisMonday);
    weekStart.setDate(thisMonday.getDate() - w * 7);
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + d);
      week.push(dateToStr(day));
    }
    weeks.push(week);
  }
  return weeks;
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <p className="text-3xl font-black" style={{ color }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: '#666' }}>{label}</p>
    </div>
  );
}

export default function StatsView({
  allWorkouts,
  allStats,
}: {
  allWorkouts: Workout[];
  allStats: UserStats[];
}) {
  const [user, setUser] = useState('Blake');

  const stats = allStats.find(s => s.user === user)!;
  const workouts = allWorkouts.filter(w => w.user === user);

  // date → Workout[]
  const byDate = new Map<string, Workout[]>();
  for (const w of workouts) {
    if (!byDate.has(w.date)) byDate.set(w.date, []);
    byDate.get(w.date)!.push(w);
  }

  const calendar = buildCalendar();
  const today = dateToStr(new Date());

  // Type breakdown sorted by count desc
  const typeCounts = new Map<WorkoutType, number>();
  for (const w of workouts) typeCounts.set(w.type, (typeCounts.get(w.type) ?? 0) + 1);
  const breakdown = WORKOUT_TYPES
    .map(t => ({ ...t, count: typeCounts.get(t.value) ?? 0 }))
    .filter(t => t.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      {/* User selector */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {USERS.map(u => (
          <button
            key={u}
            onClick={() => setUser(u)}
            className="py-3 rounded-xl text-lg font-black transition-all active:scale-95"
            style={{
              background: user === u ? '#7DC427' : 'var(--card)',
              color: user === u ? '#000' : '#fff',
              border: `2px solid ${user === u ? '#7DC427' : 'var(--border)'}`,
            }}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Current Streak" value={`${stats.currentStreak}w`}  color="#7DC427" />
        <StatCard label="Best Streak"    value={`${stats.bestStreak}w`}     color="#F5A623" />
        <StatCard label="Total Workouts" value={String(stats.totalWorkouts)} color="#fff"    />
        <StatCard label="Weeks Won"      value={String(stats.weeksWon)}      color="#888"    />
      </div>

      {/* Calendar */}
      <h3 className="text-sm font-bold mb-2" style={{ color: '#fff' }}>Last 8 Weeks</h3>
      <div className="rounded-2xl p-3 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_LABELS.map((d, i) => (
            <p key={i} className="text-center text-xs font-bold" style={{ color: '#444' }}>{d}</p>
          ))}
        </div>

        {/* Weeks */}
        {calendar.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 mb-1">
            {week.map(date => {
              const dayWorkouts = byDate.get(date) ?? [];
              const isToday = date === today;
              const isFuture = date > today;
              return (
                <div key={date} className="flex flex-col items-center gap-0.5 py-0.5">
                  {dayWorkouts.length > 0 ? (
                    dayWorkouts.slice(0, 3).map((w, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full"
                        style={{ background: TYPE_COLOR[w.type] }}
                      />
                    ))
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{
                        background: 'transparent',
                        border: `1.5px solid ${isToday ? '#555' : isFuture ? 'transparent' : '#1e1e1e'}`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-6">
        {WORKOUT_TYPES.map(t => (
          <div key={t.value} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: TYPE_COLOR[t.value] }} />
            <span className="text-xs" style={{ color: '#555' }}>{t.label}</span>
          </div>
        ))}
      </div>

      {/* Type breakdown */}
      {breakdown.length > 0 ? (
        <>
          <h3 className="text-sm font-bold mb-2" style={{ color: '#fff' }}>By Type</h3>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {breakdown.map((t, i) => (
              <div
                key={t.value}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  background: 'var(--card)',
                  borderBottom: i < breakdown.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <span className="text-base">{t.emoji}</span>
                <span className="flex-1 text-sm" style={{ color: '#ccc' }}>{t.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full" style={{ background: '#1e1e1e' }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${(t.count / stats.totalWorkouts) * 100}%`,
                        background: TYPE_COLOR[t.value],
                      }}
                    />
                  </div>
                  <span className="text-sm font-black w-5 text-right" style={{ color: '#fff' }}>{t.count}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-sm py-8" style={{ color: '#444' }}>
          No workouts logged yet. Get moving!
        </p>
      )}
    </div>
  );
}
