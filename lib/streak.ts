import { Workout } from './db';

const WEEKLY_TOTAL_MIN = 5;
const WEEKLY_GRIND_MIN = 3;

export interface UserStats {
  user: string;
  currentWeekTotal: number;
  currentWeekDailyGrind: number;
  currentStreak: number;
  bestStreak: number;
  totalWorkouts: number;
  weeksWon: number;
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

function calcBestStreak(weekMap: Map<string, WeekBucket>): number {
  const wonWeeks = [...weekMap.keys()].filter(k => weekWon(weekMap.get(k)!)).sort();
  if (wonWeeks.length === 0) return 0;
  let best = 1, run = 1;
  for (let i = 1; i < wonWeeks.length; i++) {
    const diffDays = Math.round(
      (new Date(wonWeeks[i] + 'T12:00:00').getTime() -
       new Date(wonWeeks[i - 1] + 'T12:00:00').getTime()) / 86_400_000
    );
    if (diffDays === 7) { run++; best = Math.max(best, run); }
    else run = 1;
  }
  return best;
}

export function calculateStats(workouts: Workout[], user: string): UserStats {
  const mine = workouts.filter(w => w.user === user);

  const weekMap = new Map<string, WeekBucket>();
  for (const w of mine) {
    const monday = getMondayOfWeek(w.date);
    if (!weekMap.has(monday)) weekMap.set(monday, { total: 0, dailyGrind: 0 });
    const b = weekMap.get(monday)!;
    b.total++;
    if (w.type === 'daily_grind') b.dailyGrind++;
  }

  const today = getTodayStr();
  const thisWeekMonday = getMondayOfWeek(today);
  const thisWeek = weekMap.get(thisWeekMonday) ?? { total: 0, dailyGrind: 0 };

  let streak = 0;
  let check = weekWon(thisWeek) ? thisWeekMonday : prevWeek(thisWeekMonday);
  while (true) {
    const b = weekMap.get(check) ?? { total: 0, dailyGrind: 0 };
    if (weekWon(b)) { streak++; check = prevWeek(check); }
    else break;
  }

  const bestStreak = Math.max(calcBestStreak(weekMap), streak);
  const weeksWon = [...weekMap.values()].filter(weekWon).length;
  const sorted = mine.map(w => w.date).sort();

  return {
    user,
    currentWeekTotal: thisWeek.total,
    currentWeekDailyGrind: thisWeek.dailyGrind,
    currentStreak: streak,
    bestStreak,
    totalWorkouts: mine.length,
    weeksWon,
    lastWorkoutDate: sorted.length > 0 ? sorted[sorted.length - 1] : null,
  };
}

export function getAllStats(workouts: Workout[], users: string[]): UserStats[] {
  return users.map(u => calculateStats(workouts, u)).sort(
    (a, b) =>
      b.currentStreak - a.currentStreak ||
      b.currentWeekTotal - a.currentWeekTotal ||
      b.totalWorkouts - a.totalWorkouts
  );
}
