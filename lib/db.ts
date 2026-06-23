import { Pool } from 'pg';
import { WorkoutType } from './types';

export type { WorkoutType };
export { WORKOUT_TYPES } from './types';

export interface Workout {
  id: string;
  user: string;
  date: string; // YYYY-MM-DD
  type: WorkoutType;
  timestamp: number;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Create table once per process lifetime
let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!tableReady) {
    tableReady = pool
      .query(`
        CREATE TABLE IF NOT EXISTS workouts (
          id        TEXT PRIMARY KEY,
          "user"    TEXT NOT NULL,
          date      TEXT NOT NULL,
          type      TEXT NOT NULL,
          timestamp BIGINT NOT NULL
        )
      `)
      .then(() => undefined);
  }
  return tableReady;
}

export async function getAllWorkouts(): Promise<Workout[]> {
  await ensureTable();
  const { rows } = await pool.query('SELECT * FROM workouts ORDER BY timestamp ASC');
  return rows.map(r => ({
    id: r.id,
    user: r.user,
    date: r.date,
    type: r.type as WorkoutType,
    timestamp: Number(r.timestamp),
  }));
}

export async function logWorkout(user: string, date: string, type: WorkoutType): Promise<void> {
  await ensureTable();
  const id = `${user}-${date}-${type}-${Date.now()}`;
  await pool.query(
    'INSERT INTO workouts (id, "user", date, type, timestamp) VALUES ($1, $2, $3, $4, $5)',
    [id, user, date, type, Date.now()]
  );
}

export async function hasLoggedTypeOnDate(
  user: string,
  date: string,
  type: WorkoutType
): Promise<boolean> {
  await ensureTable();
  const { rows } = await pool.query(
    'SELECT 1 FROM workouts WHERE "user" = $1 AND date = $2 AND type = $3 LIMIT 1',
    [user, date, type]
  );
  return rows.length > 0;
}
