import fs from 'fs';
import path from 'path';
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

// ─── PostgreSQL ───────────────────────────────────────────────────────────────

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('localhost')
        ? false
        : { rejectUnauthorized: false },
    });
  }
  return pool;
}

let tableReady: Promise<void> | null = null;

function ensureTable(): Promise<void> {
  if (!tableReady) {
    tableReady = getPool()
      .query(`
        CREATE TABLE IF NOT EXISTS workouts (
          id        TEXT PRIMARY KEY,
          "user"    TEXT NOT NULL,
          date      TEXT NOT NULL,
          type      TEXT NOT NULL,
          timestamp BIGINT NOT NULL
        )
      `)
      .then(() => undefined)
      .catch(err => {
        tableReady = null; // allow retry next request
        throw err;
      });
  }
  return tableReady;
}

// ─── File fallback ────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), 'data', 'workouts.json');

interface DB { workouts: Workout[] }

function readDB(): DB {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); }
  catch { return { workouts: [] }; }
}

function writeDB(db: DB): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

// ─── Public API (Postgres with file fallback) ─────────────────────────────────

export async function getAllWorkouts(): Promise<Workout[]> {
  if (!process.env.DATABASE_URL) return readDB().workouts;
  try {
    await ensureTable();
    const { rows } = await getPool().query('SELECT * FROM workouts ORDER BY timestamp ASC');
    return rows.map(r => ({
      id: r.id,
      user: r.user,
      date: r.date,
      type: r.type as WorkoutType,
      timestamp: Number(r.timestamp),
    }));
  } catch (err) {
    console.error('DB error, falling back to file:', err);
    return readDB().workouts;
  }
}

export async function logWorkout(user: string, date: string, type: WorkoutType): Promise<void> {
  const entry: Workout = {
    id: `${user}-${date}-${type}-${Date.now()}`,
    user, date, type, timestamp: Date.now(),
  };
  if (!process.env.DATABASE_URL) {
    const db = readDB();
    db.workouts.push(entry);
    writeDB(db);
    return;
  }
  try {
    await ensureTable();
    await getPool().query(
      'INSERT INTO workouts (id, "user", date, type, timestamp) VALUES ($1, $2, $3, $4, $5)',
      [entry.id, entry.user, entry.date, entry.type, entry.timestamp]
    );
  } catch (err) {
    console.error('DB error, falling back to file:', err);
    const db = readDB();
    db.workouts.push(entry);
    writeDB(db);
  }
}

export async function hasLoggedTypeOnDate(
  user: string,
  date: string,
  type: WorkoutType
): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    return readDB().workouts.some(w => w.user === user && w.date === date && w.type === type);
  }
  try {
    await ensureTable();
    const { rows } = await getPool().query(
      'SELECT 1 FROM workouts WHERE "user" = $1 AND date = $2 AND type = $3 LIMIT 1',
      [user, date, type]
    );
    return rows.length > 0;
  } catch (err) {
    console.error('DB error, falling back to file:', err);
    return readDB().workouts.some(w => w.user === user && w.date === date && w.type === type);
  }
}
