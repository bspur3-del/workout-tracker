export const dynamic = 'force-dynamic';

import { getAllWorkouts } from '@/lib/db';
import { getAllStats, UserStats } from '@/lib/streak';

const RANK = ['🥇', '🥈', '🥉'];

function WeekDots({ count }: { count: number }) {
  return (
    <div className="flex gap-2 mt-1">
      {[1, 2, 3].map(n => (
        <div
          key={n}
          className="w-5 h-5 rounded-full"
          style={{
            background: count >= n ? 'var(--green)' : 'transparent',
            border: `2px solid ${count >= n ? 'var(--green)' : '#444'}`,
          }}
        />
      ))}
    </div>
  );
}

function getStatusText(s: UserStats): { text: string; color: string } {
  if (s.currentStreak > 0 && s.currentWeekCount >= 3)
    return { text: `${s.currentStreak}-week streak — keep going!`, color: 'var(--green)' };
  if (s.currentStreak > 0)
    return { text: `${s.currentStreak}-week streak — finish this one!`, color: '#F5A623' };
  if (s.currentWeekCount > 0)
    return { text: `${3 - s.currentWeekCount} more to lock in this week`, color: '#F5A623' };
  return { text: 'No workouts yet this week', color: '#ef4444' };
}

function getDaysLeftInWeek(): number {
  const day = new Date().getDay(); // 0=Sun
  return day === 0 ? 0 : 7 - day;
}

export default function Home() {
  const workouts = getAllWorkouts();
  const stats = getAllStats(workouts);
  const daysLeft = getDaysLeftInWeek();

  return (
    <main className="px-4 pt-10">
      {/* Branding */}
      <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--green)' }}>
        No Weights · No Excuses
      </p>
      <h1 className="text-5xl font-black leading-none mb-1" style={{ color: '#333' }}>
        THE<br />DAILY<br />
        <span style={{ color: 'var(--green)' }}>GRIND</span>
      </h1>
      <p className="text-sm mt-3 mb-8" style={{ color: 'var(--muted)' }}>
        Blake vs Matt vs Kyle — 3 workouts a week. Who stays consistent?
      </p>

      {/* Week header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold" style={{ color: '#fff' }}>This Week</h2>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Last day — go!'}
        </span>
      </div>

      {/* Leaderboard cards */}
      <div className="space-y-3 mb-8">
        {stats.map((s, i) => {
          const status = getStatusText(s);
          const isLeading = i === 0 && s.currentStreak > 0;
          return (
            <div
              key={s.user}
              className="rounded-2xl p-4"
              style={{
                background: isLeading ? '#111d06' : 'var(--card)',
                border: `1px solid ${isLeading ? 'rgba(125,196,39,0.3)' : 'var(--border)'}`,
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{RANK[i]}</span>
                  <div>
                    <p className="text-xl font-black" style={{ color: '#fff' }}>{s.user}</p>
                    <WeekDots count={s.currentWeekCount} />
                    <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
                      {s.currentWeekCount}/3 this week
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black" style={{ color: s.currentStreak > 0 ? 'var(--green)' : '#333' }}>
                    {s.currentStreak}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {s.currentStreak === 1 ? 'week' : 'weeks'}
                  </p>
                </div>
              </div>
              <div
                className="mt-3 rounded-lg px-3 py-2 text-xs font-semibold"
                style={{ background: 'rgba(255,255,255,0.04)', color: status.color }}
              >
                {status.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total workouts */}
      <h2 className="text-base font-bold mb-3" style={{ color: '#fff' }}>All-Time Totals</h2>
      <div className="grid grid-cols-3 gap-3">
        {stats.map(s => (
          <div
            key={s.user}
            className="rounded-xl p-3 text-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p className="text-3xl font-black" style={{ color: '#fff' }}>{s.totalWorkouts}</p>
            <p className="text-xs font-bold mt-1" style={{ color: 'var(--green)' }}>{s.user}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>workouts</p>
          </div>
        ))}
      </div>
    </main>
  );
}
