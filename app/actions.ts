'use server';

import { revalidatePath } from 'next/cache';
import { logWorkout, hasLoggedTypeOnDate } from '@/lib/db';
import { WorkoutType, WORKOUT_TYPES } from '@/lib/types';

const VALID_TYPES = new Set<string>(WORKOUT_TYPES.map(t => t.value));
const VALID_USERS = new Set(['Blake', 'Matt', 'Kyle']);

export async function logWorkoutAction(
  user: string,
  date: string,
  type: WorkoutType
): Promise<{ alreadyLogged: boolean }> {
  if (!VALID_USERS.has(user)) throw new Error('Invalid user');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid date');
  if (!VALID_TYPES.has(type)) throw new Error('Invalid workout type');

  if (hasLoggedTypeOnDate(user, date, type)) {
    return { alreadyLogged: true };
  }

  logWorkout(user, date, type);
  revalidatePath('/');
  return { alreadyLogged: false };
}
