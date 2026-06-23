'use server';

import { revalidatePath } from 'next/cache';
import { logWorkout, hasLoggedOnDate } from '@/lib/db';

export async function logWorkoutAction(
  user: string,
  date: string
): Promise<{ alreadyLogged: boolean }> {
  // Validate inputs — never trust what comes from the browser
  const validUsers = ['Blake', 'Matt', 'Kyle'];
  if (!validUsers.includes(user)) throw new Error('Invalid user');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid date');

  if (hasLoggedOnDate(user, date)) {
    return { alreadyLogged: true };
  }

  logWorkout(user, date);
  revalidatePath('/');
  return { alreadyLogged: false };
}
