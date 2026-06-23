import { Workout } from './db';

export const USERS = ['Blake', 'Matt', 'Kyle'] as const;

// To win a week: 5+ total workouts AND 3+ must be The Daily Grind
const WEEKLY_TOTAL_MIN = 5;
const WEEKLY_GRIND_MIN = 3;

export interface UserStats {
  user: string;
  currentWeekTotal: number;     // all workout logs this week
  currentWeekDailyGrind: number; // daily_grind logs this week
  currentStreak: number;
  totalWorkouts: number;
  lastWorkoutDate: string | null;
}

interface WeekBucket {
  total: number;
  dailyGrind: number;
}

function getMondayOfWeek(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const day = date.getDay();
  const daysBack = day === 0 ? 6 : day - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysBack);
  return monday.toISOString().split('T')[0];
}

function prevWeek(mondayStr: string): string {
  const d = new Date(mondayStr + 'T12:00:00');
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
}

function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function weekWon(b: WeekBucket): boolean {
  return b.total >= WEEKLY_TOTAL_MIN && b.dailyGrind >= WEEKLY_GRIND_MIN;
}

export function calculateStats(workouts: Workout[], user: string): UserStats {
  const mine = workouts.filter(w => w.user === user);

  // Build map: monday-of-week -> { total, dailyGrind }
  // Each entry is already a unique (date, type) pair (enforced at log time)
  const weekMap = new Map<string, WeekBucket>();
  for (const w of mine) {
    const monday = getMondayOfWeek(w.date);
    if (!weekMap.has(monday)) weekMap.set(monday, { total: 0, dailyGrind: 0 });
    const bucket = weekMap.get(monday)!;
    bucket.total++;
    if (w.type === 'daily_grind') bucket.dailyGrind++;
  }

  const today = getTodayStr();
  const thisWeekMonday = getMondayOfWeek(today);
  const thisWeek = weekMap.get(thisWeekMonday) ?? { total: 0, dailyGrind: 0 };

  // Streak = consecutive won weeks going back from last week (or this week if already won)
  let streak = 0;
  let check = weekWon(thisWeek) ? thisWeekMonday : prevWeek(thisWeekMonday);
  while (true) {
    const bucket = weekMap.get(check) ?? { total: 0, dailyGrind: 0 };
    if (weekWon(bucket)) {
      streak++;
      check = prevWeek(check);
    } else {
      break;
    }
  }

  const sorted = mine.map(w => w.date).sort();
  return {
    user,
    currentWeekTotal: thisWeek.total,
    currentWeekDailyGrind: thisWeek.dailyGrind,
    currentStreak: streak,
    totalWorkouts: mine.length,
    lastWorkoutDate: sorted.length > 0 ? sorted[sorted.length - 1] : null,
  };
}

export function getAllStats(workouts: Workout[]): UserStats[] {
  return USERS.map(u => calculateStats(workouts, u)).sort(
    (a, b) =>
      b.currentStreak - a.currentStreak ||
      b.currentWeekTotal - a.currentWeekTotal ||
      b.totalWorkouts - a.totalWorkouts
  );
}
