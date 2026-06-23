export const dynamic = 'force-dynamic';

import { getAllWorkouts } from '@/lib/db';
import { getAllStats, UserStats } from '@/lib/streak';

const RANK = ['🥇', '🥈', '🥉'];

// 3 dots for Daily Grind requirement
function GrindDots({ count }: { count: number }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3].map(n => (
        <div
          key={n}
          className="w-4 h-4 rounded-full"
          style={{
            background: count >= n ? 'var(--green)' : 'transparent',
            border: `2px solid ${count >= n ? 'var(--green)' : '#444'}`,
          }}
        />
      ))}
    </div>
  );
}

// 5 pips for total workout requirement
function TotalPips({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <div
          key={n}
          className="w-3 h-3 rounded-sm"
          style={{
            background: count >= n ? '#888' : 'transparent',
            border: `1.5px solid ${count >= n ? '#888' : '#333'}`,
          }}
        />
      ))}
    </div>
  );
}

function getStatusLine(s: UserStats): { text: string; color: string } {
  const weekWon = s.currentWeekTotal >= 5 && s.currentWeekDailyGrind >= 3;

  if (weekWon) {
    return s.currentStreak > 0
      ? { text: `${s.currentStreak}-week streak — keep it going!`, color: 'var(--green)' }
      : { text: 'Week complete! Streak starts now.', color: 'var(--green)' };
  }

  if (s.currentWeekTotal === 0) {
    return { text: 'No workouts yet this week', color: '#ef4444' };
  }

  const needGrind = Math.max(0, 3 - s.currentWeekDailyGrind);
  const needTotal = Math.max(0, 5 - s.currentWeekTotal);
  // Extra non-grind workouts needed beyond the required daily grinds
  const needOther = Math.max(0, needTotal - needGrind);

  const parts: string[] = [];
  if (needGrind > 0) parts.push(`${needGrind} Daily Grind`);
  if (needOther > 0) parts.push(`${needOther} other workout${needOther > 1 ? 's' : ''}`);

  const color = s.currentStreak > 0 ? '#F5A623' : '#F5A623';
  return { text: `Need ${parts.join(' + ')} to win this week`, color };
}

function getDaysLeftInWeek(): number {
  const day = new Date().getDay();
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
      <p className="text-sm mt-3 mb-2" style={{ color: 'var(--muted)' }}>
        Blake vs Matt vs Kyle
      </p>
      <p
        className="text-xs px-3 py-2 rounded-lg mb-8"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted)' }}
      >
        Win a week: <strong style={{ color: '#fff' }}>5+ workouts</strong>, at least{' '}
        <strong style={{ color: 'var(--green)' }}>3 must be The Daily Grind</strong>
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
          const statusLine = getStatusLine(s);
          const weekWon = s.currentWeekTotal >= 5 && s.currentWeekDailyGrind >= 3;
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
              {/* Top row: rank + name + streak number */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{RANK[i]}</span>
                  <p className="text-xl font-black" style={{ color: '#fff' }}>{s.user}</p>
                </div>
                <div className="text-right">
                  <p
                    className="text-4xl font-black"
                    style={{ color: s.currentStreak > 0 ? 'var(--green)' : '#333' }}
                  >
                    {s.currentStreak}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {s.currentStreak === 1 ? 'week streak' : 'week streak'}
                  </p>
                </div>
              </div>

              {/* Progress rows */}
              <div className="space-y-2 mb-3">
                {/* Daily Grind row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>⚡ Daily Grind</span>
                    <GrindDots count={s.currentWeekDailyGrind} />
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: s.currentWeekDailyGrind >= 3 ? 'var(--green)' : 'var(--muted)' }}
                  >
                    {s.currentWeekDailyGrind}/3{s.currentWeekDailyGrind >= 3 ? ' ✓' : ''}
                  </span>
                </div>

                {/* Total workouts row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>💪 Total workouts</span>
                    <TotalPips count={Math.min(s.currentWeekTotal, 5)} />
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: s.currentWeekTotal >= 5 ? '#888' : 'var(--muted)' }}
                  >
                    {s.currentWeekTotal}/5{s.currentWeekTotal >= 5 ? ' ✓' : ''}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div
                className="rounded-lg px-3 py-2 text-xs font-semibold"
                style={{
                  background: weekWon ? 'rgba(125,196,39,0.08)' : 'rgba(255,255,255,0.04)',
                  color: statusLine.color,
                }}
              >
                {statusLine.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-time totals */}
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
