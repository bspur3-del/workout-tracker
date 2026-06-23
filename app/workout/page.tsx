const warmUp = [
  { name: 'Arm circles + shoulder rolls', time: '30s' },
  { name: 'Hip circles + leg swings', time: '30s' },
  { name: 'Inchworms (slow, 5 reps)', time: '45s' },
  { name: 'Jumping jacks', time: '60s' },
];

const circuit = [
  {
    num: '01',
    name: 'Push-Ups',
    targets: 'Chest · Triceps · Front Delts',
    volume: '4 × 15',
    unit: 'sets × reps',
    cue: 'Lock your core, lead with your chest, full range. Elbows at 45° — not flared. Squeeze the pecs at the top.',
  },
  {
    num: '02',
    name: 'Pike Push-Ups',
    targets: 'Shoulders · Upper Back · Triceps',
    volume: '3 × 12',
    unit: 'sets × reps',
    cue: 'Hips high, straight line from hips to hands. Lower your head toward the floor between your hands. Overhead pressing without the bar.',
  },
  {
    num: '03',
    name: 'Bodyweight Squats',
    targets: 'Quads · Glutes · Hamstrings',
    volume: '4 × 20',
    unit: 'sets × reps',
    cue: 'Feet shoulder-width, chest up, knees track over toes. Break parallel. Pause 1 sec at the bottom — don\'t bounce.',
  },
  {
    num: '04',
    name: 'Reverse Lunges',
    targets: 'Glutes · Quads · Single-Leg Stability',
    volume: '3 × 10',
    unit: 'each leg',
    cue: 'Step back, back knee just above the floor. Keep your torso upright — don\'t lean forward. Drive through the front heel to stand.',
  },
  {
    num: '05',
    name: 'Tricep Dips',
    targets: 'Triceps · Lower Chest · Front Delts',
    volume: '3 × 12',
    unit: 'sets × reps',
    cue: 'Hands on chair/sofa edge, fingers forward. Lower until elbows hit 90°. Elbows stay close to your body — no chicken wings.',
  },
  {
    num: '06',
    name: 'Plank-to-Downdog',
    targets: 'Core · Shoulders · Thoracic Extension',
    volume: '3 × 10',
    unit: 'reps (slow)',
    cue: 'Hold 1 sec in plank, then pike hips up into downward dog and push the floor away. 2 sec hold. Controlled movement, not a flow.',
  },
];

const coolDown = [
  { name: "Child's pose", time: '45s' },
  { name: 'Pigeon pose', time: '30s each side' },
  { name: 'Standing quad stretch', time: '20s each side' },
  { name: 'Doorway chest stretch', time: '30s' },
];

const overload = [
  { week: 'Week 1–2', label: 'BASE', desc: 'Hit all reps with perfect form. Learn the movements.' },
  { week: 'Week 3', label: 'BUILD', desc: 'Add 2–3 reps per set on push-ups and squats.' },
  { week: 'Week 4', label: 'PUSH', desc: 'Add 1 extra set to every exercise. Cut rest to 35s.' },
  { week: 'Month 2+', label: 'LEVEL UP', desc: 'Advance moves: archer push-ups, Bulgarian splits, pseudo planche.' },
];

import WorkoutTimer from '@/components/WorkoutTimer';

function SectionLabel({ color, label, title, time }: { color: string; label: string; title: string; time: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-bold tracking-widest uppercase" style={{ color }}>{label}</span>
      <h3 className="font-black text-white uppercase tracking-wide">{title}</h3>
      <span className="ml-auto text-xs" style={{ color: 'var(--muted)' }}>{time}</span>
    </div>
  );
}

export default function WorkoutPage() {
  return (
    <main className="px-4 pt-10 pb-4">
      <h2 className="text-2xl font-black mb-1" style={{ color: '#fff' }}>The Workout</h2>
      <p className="text-sm mb-1" style={{ color: 'var(--muted)' }}>20 min · 0 equipment · 6 moves</p>
      <WorkoutTimer />

      <p className="text-xs mb-8 px-3 py-2 rounded-lg" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
        ⚡ Rest <strong style={{ color: '#fff' }}>45 sec</strong> between sets. Short rest = metabolic stress. If you finish a set feeling fresh, add reps next session.
      </p>

      {/* Warm-up */}
      <div className="mb-6">
        <SectionLabel color="#F5A623" label="Warm-Up" title="Ignition" time="3 min" />
        <div className="space-y-2">
          {warmUp.map(item => (
            <div
              key={item.name}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <span className="text-sm" style={{ color: '#ccc' }}>{item.name}</span>
              <span className="text-sm font-bold" style={{ color: 'var(--muted)' }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Circuit */}
      <div className="mb-6">
        <SectionLabel color="var(--green)" label="Work" title="The Circuit" time="14 min" />
        <div className="space-y-3">
          {circuit.map(ex => (
            <div
              key={ex.num}
              className="rounded-2xl p-4"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black" style={{ color: 'var(--muted)' }}>{ex.num}</span>
                  <div>
                    <p className="font-black" style={{ color: '#ccc' }}>{ex.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{ex.targets}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-xl font-black" style={{ color: 'var(--green)' }}>{ex.volume}</p>
                  <p className="text-xs uppercase" style={{ color: 'var(--muted)' }}>{ex.unit}</p>
                </div>
              </div>
              <p className="text-xs italic leading-relaxed" style={{ color: '#666' }}>
                {ex.cue}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Cool-down */}
      <div className="mb-6">
        <SectionLabel color="#ef4444" label="Cool-Down" title="Close Out" time="3 min" />
        <div className="space-y-2">
          {coolDown.map(item => (
            <div
              key={item.name}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <span className="text-sm" style={{ color: '#ccc' }}>{item.name}</span>
              <span className="text-sm font-bold" style={{ color: 'var(--muted)' }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progressive Overload */}
      <div>
        <SectionLabel color="var(--green)" label="Overload" title="How It Scales" time="" />
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          <div className="px-4 py-3" style={{ background: 'rgba(125,196,39,0.08)', borderBottom: '1px solid var(--border)' }}>
            <p className="text-xs font-bold" style={{ color: 'var(--green)' }}>Progressive Overload — 4-Week Cycle</p>
          </div>
          {overload.map((row, i) => (
            <div
              key={row.week}
              className="flex items-start gap-4 px-4 py-3"
              style={{
                borderBottom: i < overload.length - 1 ? '1px solid var(--border)' : 'none',
                background: 'var(--card)',
              }}
            >
              <div className="w-20 shrink-0">
                <p className="text-sm font-bold" style={{ color: '#fff' }}>{row.week}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{row.desc}</p>
              </div>
              <div className="shrink-0">
                <span className="text-xs font-black" style={{ color: 'var(--green)' }}>{row.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
