// Shared types and constants — safe to import from both server and client code

export type WorkoutType =
  | 'daily_grind'
  | 'crossfit'
  | 'hyrox'
  | 'barbell'
  | 'run'
  | 'bike'
  | 'walk';

export const WORKOUT_TYPES: { value: WorkoutType; label: string; emoji: string }[] = [
  { value: 'daily_grind', label: 'The Daily Grind', emoji: '⚡' },
  { value: 'crossfit',    label: 'CrossFit',        emoji: '🏋️' },
  { value: 'hyrox',       label: 'Hyrox',           emoji: '🎯' },
  { value: 'barbell',     label: 'Barbell',          emoji: '🪵' },
  { value: 'run',         label: 'Run',              emoji: '🏃' },
  { value: 'bike',        label: 'Bike',             emoji: '🚴' },
  { value: 'walk',        label: 'Walk',             emoji: '🚶' },
];
