import { getAllWorkouts } from '@/lib/db';
import { getAllStats } from '@/lib/streak';
import StatsView from '@/components/StatsView';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const workouts = await getAllWorkouts();
  const stats = getAllStats(workouts);

  return (
    <main className="px-4 pt-10 pb-4">
      <h2 className="text-2xl font-black mb-1" style={{ color: '#fff' }}>Stats</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Calendar & breakdown by person</p>
      <StatsView allWorkouts={workouts} allStats={stats} />
    </main>
  );
}
