import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'workouts.json');

export interface Workout {
  id: string;
  user: string;
  date: string; // YYYY-MM-DD
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

export function logWorkout(user: string, date: string): void {
  const db = readDB();
  db.workouts.push({
    id: `${user}-${date}-${Date.now()}`,
    user,
    date,
    timestamp: Date.now(),
  });
  writeDB(db);
}

export function hasLoggedOnDate(user: string, date: string): boolean {
  return readDB().workouts.some(w => w.user === user && w.date === date);
}
