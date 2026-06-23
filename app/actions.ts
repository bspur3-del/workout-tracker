'use server';

import { revalidatePath } from 'next/cache';
import { logWorkout, hasLoggedTypeOnDate, addUser, getUsers } from '@/lib/db';
import { WorkoutType, WORKOUT_TYPES } from '@/lib/types';

const VALID_TYPES = new Set<string>(WORKOUT_TYPES.map(t => t.value));
const APP_START = '2026-06-22';

export async function logWorkoutAction(
  user: string,
  date: string,
  type: WorkoutType
): Promise<{ alreadyLogged: boolean }> {
  const users = await getUsers();
  if (!users.includes(user)) throw new Error('Invalid user');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid date');
  if (date < APP_START) throw new Error('Date before app start');
  if (!VALID_TYPES.has(type)) throw new Error('Invalid workout type');

  if (await hasLoggedTypeOnDate(user, date, type)) {
    return { alreadyLogged: true };
  }

  await logWorkout(user, date, type);
  revalidatePath('/');
  revalidatePath('/stats');
  return { alreadyLogged: false };
}

export async function addUserAction(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 30) throw new Error('Invalid name');
  await addUser(trimmed);
  revalidatePath('/');
  revalidatePath('/log');
  revalidatePath('/stats');
}
