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

const DEFAULT_USERS = ['Blake', 'Matt', 'Kyle'];

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
        );
        CREATE TABLE IF NOT EXISTS users (
          name TEXT PRIMARY KEY
        );
      `)
      .then(() => undefined)
      .catch(err => {
        tableReady = null;
        throw err;
      });
  }
  return tableReady;
}

// ─── File fallback ────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), 'data', 'workouts.json');

interface DB { workouts: Workout[]; users: string[] }

function readDB(): DB {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    return {
      workouts: parsed.workouts ?? [],
      users: parsed.users ?? [...DEFAULT_USERS],
    };
  } catch {
    return { workouts: [], users: [...DEFAULT_USERS] };
  }
}

function writeDB(db: DB): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getUsers(): Promise<string[]> {
  if (!process.env.DATABASE_URL) return readDB().users;
  try {
    await ensureTable();
    const { rows } = await getPool().query('SELECT name FROM users ORDER BY name ASC');
    if (rows.length === 0) {
      for (const name of DEFAULT_USERS) {
        await getPool().query(
          'INSERT INTO users (name) VALUES ($1) ON CONFLICT DO NOTHING',
          [name]
        );
      }
      return [...DEFAULT_USERS];
    }
    return rows.map(r => r.name as string);
  } catch (err) {
    console.error('DB error in getUsers:', err);
    return [...DEFAULT_USERS];
  }
}

export async function addUser(name: string): Promise<void> {
  if (!process.env.DATABASE_URL) {
    const db = readDB();
    if (!db.users.includes(name)) {
      db.users.push(name);
      db.users.sort();
      writeDB(db);
    }
    return;
  }
  try {
    await ensureTable();
    await getPool().query(
      'INSERT INTO users (name) VALUES ($1) ON CONFLICT DO NOTHING',
      [name]
    );
  } catch (err) {
    console.error('DB error in addUser:', err);
  }
}

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
    console.error('DB error in getAllWorkouts:', err);
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
    console.error('DB error in logWorkout:', err);
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
    console.error('DB error in hasLoggedTypeOnDate:', err);
    return readDB().workouts.some(w => w.user === user && w.date === date && w.type === type);
  }
}
