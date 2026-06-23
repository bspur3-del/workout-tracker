import { getAllWorkouts, getUsers } from '@/lib/db';
import { getAllStats } from '@/lib/streak';
import StatsView from '@/components/StatsView';

export const revalidate = 30;

export default async function StatsPage() {
  const [workouts, users] = await Promise.all([getAllWorkouts(), getUsers()]);
  const stats = getAllStats(workouts, users);

  return (
    <main className="px-4 pt-10 pb-4">
      <h2 className="text-2xl font-black mb-1" style={{ color: '#fff' }}>Stats</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Calendar & breakdown by person</p>
      <StatsView allWorkouts={workouts} allStats={stats} users={users} />
    </main>
  );
}
