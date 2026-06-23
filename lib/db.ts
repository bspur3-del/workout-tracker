import fs from 'fs';
import path from 'path';
import { WorkoutType } from './types';

export type { WorkoutType };
export { WORKOUT_TYPES } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'workouts.json');

export interface Workout {
  id: string;
  user: string;
  date: string; // YYYY-MM-DD
  type: WorkoutType;
  timestamp: number;
}

interface DB {
  workouts: Workout[];
}

function readDB(): DB {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { workouts: [] };
  }
}

function writeDB(db: DB): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

export function getAllWorkouts(): Workout[] {
  return readDB().workouts;
}

export function logWorkout(user: string, date: string, type: WorkoutType): void {
  const db = readDB();
  db.workouts.push({
    id: `${user}-${date}-${type}-${Date.now()}`,
    user,
    date,
    type,
    timestamp: Date.now(),
  });
  writeDB(db);
}

// Prevents the same person from logging the same workout type twice on one day
export function hasLoggedTypeOnDate(user: string, date: string, type: WorkoutType): boolean {
  return readDB().workouts.some(
    w => w.user === user && w.date === date && w.type === type
  );
}
