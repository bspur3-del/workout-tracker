import { Workout } from './db';

export const USERS = ['Blake', 'Matt', 'Kyle'] as const;

export interface UserStats {
  user: string;
  currentWeekCount: number;
  currentStreak: number;
  totalWorkouts: number;
  lastWorkoutDate: string | null;
}

function getMondayOfWeek(dateStr: string): string {
  // Parse date as local noon to avoid DST/timezone edge cases
  const date = new Date(dateStr + 'T12:00:00');
  const day = date.getDay(); // 0=Sun, 1=Mon...6=Sat
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
  // Returns local date in YYYY-MM-DD format
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calculateStats(workouts: Workout[], user: string): UserStats {
  const mine = workouts.filter(w => w.user === user);

  // Build a map: monday-of-week -> Set of unique dates worked out
  const weekMap = new Map<string, Set<string>>();
  for (const w of mine) {
    const monday = getMondayOfWeek(w.date);
    if (!weekMap.has(monday)) weekMap.set(monday, new Set());
    weekMap.get(monday)!.add(w.date);
  }

  const today = getTodayStr();
  const thisWeekMonday = getMondayOfWeek(today);
  const currentWeekCount = weekMap.get(thisWeekMonday)?.size ?? 0;

  // Calculate streak: consecutive past weeks (+ current if already won)
  let streak = 0;
  let check = currentWeekCount >= 3 ? thisWeekMonday : prevWeek(thisWeekMonday);
  while (true) {
    const count = weekMap.get(check)?.size ?? 0;
    if (count >= 3) {
      streak++;
      check = prevWeek(check);
    } else {
      break;
    }
  }

  const sorted = mine.map(w => w.date).sort();
  return {
    user,
    currentWeekCount,
    currentStreak: streak,
    totalWorkouts: mine.length,
    lastWorkoutDate: sorted.length > 0 ? sorted[sorted.length - 1] : null,
  };
}

export function getAllStats(workouts: Workout[]): UserStats[] {
  return USERS.map(u => calculateStats(workouts, u)).sort(
    (a, b) =>
      b.currentStreak - a.currentStreak ||
      b.currentWeekCount - a.currentWeekCount ||
      b.totalWorkouts - a.totalWorkouts
  );
}
