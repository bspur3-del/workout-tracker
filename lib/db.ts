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

let pool: import('pg').Pool | null = null;

function getPool(): import('pg').Pool {
  if (!pool) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require('pg') as typeof import('pg');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
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
      .then(() => undefined);
  }
  return tableReady;
}

async function pgGetAll(): Promise<Workout[]> {
  await ensureTable();
  const { rows } = await getPool().query('SELECT * FROM workouts ORDER BY timestamp ASC');
  return rows.map(r => ({
    id: r.id,
    user: r.user,
    date: r.date,
    type: r.type as WorkoutType,
    timestamp: Number(r.timestamp),
  }));
}

async function pgLog(user: string, date: string, type: WorkoutType): Promise<void> {
  await ensureTable();
  const id = `${user}-${date}-${type}-${Date.now()}`;
  await getPool().query(
    'INSERT INTO workouts (id, "user", date, type, timestamp) VALUES ($1, $2, $3, $4, $5)',
    [id, user, date, type, Date.now()]
  );
}

async function pgHasLogged(user: string, date: string, type: WorkoutType): Promise<boolean> {
  await ensureTable();
  const { rows } = await getPool().query(
    'SELECT 1 FROM workouts WHERE "user" = $1 AND date = $2 AND type = $3 LIMIT 1',
    [user, date, type]
  );
  return rows.length > 0;
}

// ─── File fallback ────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';

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

// ─── Public API ───────────────────────────────────────────────────────────────

const usePostgres = !!process.env.DATABASE_URL;

export async function getAllWorkouts(): Promise<Workout[]> {
  if (usePostgres) return pgGetAll();
  return readDB().workouts;
}

export async function logWorkout(user: string, date: string, type: WorkoutType): Promise<void> {
  if (usePostgres) return pgLog(user, date, type);
  const db = readDB();
  db.workouts.push({ id: `${user}-${date}-${type}-${Date.now()}`, user, date, type, timestamp: Date.now() });
  writeDB(db);
}

export async function hasLoggedTypeOnDate(user: string, date: string, type: WorkoutType): Promise<boolean> {
  if (usePostgres) return pgHasLogged(user, date, type);
  return readDB().workouts.some(w => w.user === user && w.date === date && w.type === type);
}
