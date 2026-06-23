'use client';

import { useState, useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

type Section = 'countdown' | 'warmup' | 'rest' | 'circuit' | 'cooldown';

type TimedStep = {
  kind: 'timed';
  section: Section;
  label: string;
  sublabel?: string;
  duration: number;
};

type ExerciseStep = {
  kind: 'exercise';
  name: string;
  targets: string;
  reps: string;
  setNum: number;
  totalSets: number;
  cue: string;
};

type DoneStep = { kind: 'done' };

type Step = TimedStep | ExerciseStep | DoneStep;

const CIRCUIT = [
  { name: 'Push-Ups',          targets: 'Chest · Triceps · Front Delts',        sets: 4, reps: '15 reps',     cue: 'Elbows at 45°, lead with your chest. Squeeze at the top.' },
  { name: 'Pike Push-Ups',     targets: 'Shoulders · Upper Back · Triceps',      sets: 3, reps: '12 reps',     cue: 'Hips high. Lower your head toward the floor between your hands.' },
  { name: 'Bodyweight Squats', targets: 'Quads · Glutes · Hamstrings',           sets: 4, reps: '20 reps',     cue: 'Break parallel. 1 sec pause at the bottom — don\'t bounce.' },
  { name: 'Reverse Lunges',    targets: 'Glutes · Quads · Stability',            sets: 3, reps: '10 each leg', cue: 'Back knee just above the floor. Drive through the front heel.' },
  { name: 'Tricep Dips',       targets: 'Triceps · Lower Chest · Front Delts',   sets: 3, reps: '12 reps',     cue: 'Elbows stay close to your body — no chicken wings.' },
  { name: 'Plank-to-Downdog',  targets: 'Core · Shoulders · Thoracic Extension', sets: 3, reps: '10 slow',     cue: '1 sec plank hold, pike up, 2 sec hold at the top.' },
];

function buildSteps(): Step[] {
  const s: Step[] = [
    { kind: 'timed', section: 'countdown', label: 'Get Ready', duration: 10 },
    { kind: 'timed', section: 'warmup', label: 'Arm circles + shoulder rolls', duration: 30 },
    { kind: 'timed', section: 'warmup', label: 'Hip circles + leg swings', duration: 30 },
    { kind: 'timed', section: 'warmup', label: 'Inchworms', sublabel: '5 slow reps', duration: 45 },
    { kind: 'timed', section: 'warmup', label: 'Jumping jacks', duration: 60 },
  ];

  for (let e = 0; e < CIRCUIT.length; e++) {
    const ex = CIRCUIT[e];
    for (let i = 0; i < ex.sets; i++) {
      s.push({ kind: 'exercise', ...ex, setNum: i + 1, totalSets: ex.sets });
      const lastOfAll = i === ex.sets - 1 && e === CIRCUIT.length - 1;
      if (!lastOfAll) {
        // Between-set rest: if it's the last set of this exercise, tell them what's next
        const nextName = i === ex.sets - 1 ? CIRCUIT[e + 1]?.name : undefined;
        s.push({ kind: 'timed', section: 'rest', label: 'Rest', sublabel: nextName ? `${nextName} up next` : undefined, duration: 45 });
      }
    }
  }

  s.push(
    { kind: 'timed', section: 'cooldown', label: "Child's pose", duration: 45 },
    { kind: 'timed', section: 'cooldown', label: 'Pigeon pose', sublabel: '30 sec each side', duration: 60 },
    { kind: 'timed', section: 'cooldown', label: 'Standing quad stretch', sublabel: '20 sec each side', duration: 40 },
    { kind: 'timed', section: 'cooldown', label: 'Doorway chest stretch', duration: 30 },
    { kind: 'done' },
  );

  return s;
}

const ALL_STEPS = buildSteps();
const TOTAL_ACTIVE = ALL_STEPS.length - 1; // exclude done step

const SECTION_STYLE: Record<Section, { badge: string; color: string }> = {
  countdown: { badge: 'GET READY', color: '#F5A623' },
  warmup:    { badge: 'WARM-UP',   color: '#F5A623' },
  rest:      { badge: 'REST',      color: '#888888' },
  circuit:   { badge: 'CIRCUIT',   color: '#7DC427' },
  cooldown:  { badge: 'COOL-DOWN', color: '#ef4444' },
};

// ---------------------------------------------------------------------------
// Audio helpers (Web Audio API — no assets needed)
// ---------------------------------------------------------------------------

function tone(ctx: AudioContext, freq: number, dur: number, vol = 0.45) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.start();
  osc.stop(ctx.currentTime + dur);
}

// ---------------------------------------------------------------------------
// Circular ring SVG
// ---------------------------------------------------------------------------

function Ring({ t, total, color }: { t: number; total: number; color: string }) {
  const r = 86;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - (total > 0 ? t / total : 0));
  return (
    <svg width="216" height="216" viewBox="0 0 216 216">
      <circle cx="108" cy="108" r={r} fill="none" stroke="#1c1c1c" strokeWidth="11" />
      <circle
        cx="108" cy="108" r={r}
        fill="none" stroke={color} strokeWidth="11" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 108 108)"
        style={{ transition: 'stroke-dashoffset 0.85s linear' }}
      />
      <text
        x="108" y="100"
        textAnchor="middle"
        fill="white"
        fontSize="56"
        fontWeight="900"
        fontFamily="-apple-system, system-ui, sans-serif"
      >
        {t}
      </text>
      <text
        x="108" y="124"
        textAnchor="middle"
        fill="#444"
        fontSize="13"
        fontFamily="-apple-system, system-ui, sans-serif"
      >
        seconds
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function WorkoutTimer() {
  const [active,   setActive]   = useState(false);
  const [idx,      setIdx]      = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused,   setPaused]   = useState(false);
  const [showCue,  setShowCue]  = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef    = useRef<AudioContext | null>(null);
  const wakeLockRef = useRef<{ release: () => void } | null>(null);
  const timeRef     = useRef(0); // read-safe copy of timeLeft for the interval closure

  const step = ALL_STEPS[idx];

  // --- Audio ---
  function ctx() {
    if (!audioRef.current) {
      audioRef.current = new (
        window.AudioContext ??
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext
      )();
    }
    if (audioRef.current.state === 'suspended') audioRef.current.resume();
    return audioRef.current;
  }
  const tickBeep = () => tone(ctx(), 880, 0.11);
  const doneBeep = () => {
    const c = ctx();
    tone(c, 1100, 0.15);
    setTimeout(() => tone(c, 1320, 0.22), 180);
  };

  // --- Timer core ---
  function stopTimer() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }

  function startTimer(from: number) {
    stopTimer();
    timeRef.current = from;
    setTimeLeft(from);
    intervalRef.current = setInterval(() => {
      timeRef.current -= 1;
      const t = timeRef.current;
      if (t <= 0) {
        stopTimer();
        setTimeLeft(0);
        doneBeep();
        // Advance after the done-beep plays
        setTimeout(() => { setIdx(i => i + 1); setShowCue(false); }, 480);
        return;
      }
      // Beep at 3, 2, 1 (i.e. when t drops TO 3, 2, 1)
      if (t <= 3) tickBeep();
      setTimeLeft(t);
    }, 1000);
  }

  // Start timer whenever a timed step becomes active
  useEffect(() => {
    if (!active) return;
    if (step.kind === 'timed' && !paused) startTimer(step.duration);
    return stopTimer;
    // stepIdx and active are the intentional deps — paused is handled by handlePause directly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, active]);

  // Cleanup on unmount
  useEffect(() => () => { stopTimer(); wakeLockRef.current?.release(); }, []);

  // --- Control handlers ---
  function handleStart() {
    ctx(); // initialise AudioContext on the user gesture (required by browsers)
    navigator.wakeLock?.request('screen')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((l: any) => { wakeLockRef.current = l; })
      .catch(() => {});
    setIdx(0);
    setTimeLeft(0);
    setPaused(false);
    setShowCue(false);
    setActive(true);
  }

  function handleStop() {
    stopTimer();
    wakeLockRef.current?.release();
    setActive(false);
  }

  function handlePause() {
    if (paused) {
      setPaused(false);
      if (step.kind === 'timed') startTimer(timeLeft); // resume from remaining time
    } else {
      stopTimer();
      setPaused(true);
    }
  }

  function handleSkip() {
    stopTimer();
    setIdx(i => i + 1);
    setShowCue(false);
    setPaused(false);
  }

  // -------------------------------------------------------------------------
  // Render: start button (idle)
  // -------------------------------------------------------------------------
  if (!active) {
    return (
      <div className="mb-6">
        <button
          onClick={handleStart}
          className="w-full py-5 rounded-2xl text-xl font-black flex items-center justify-center gap-3 active:scale-95 transition-transform"
          style={{ background: '#7DC427', color: '#000' }}
        >
          ▶&nbsp; Start Workout Timer
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render: done screen
  // -------------------------------------------------------------------------
  if (step.kind === 'done') {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
        style={{ background: '#0a0a0a' }}
      >
        <div className="text-7xl mb-5">🎉</div>
        <h2 className="text-3xl font-black text-white mb-2">Done! That&apos;s The Grind.</h2>
        <p className="text-sm mb-10" style={{ color: '#666' }}>
          Go log it on the Leaderboard screen.
        </p>
        <button
          onClick={handleStop}
          className="w-full max-w-sm py-5 rounded-2xl text-xl font-black active:scale-95 transition-transform"
          style={{ background: '#7DC427', color: '#000' }}
        >
          Finish
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render: active overlay
  // -------------------------------------------------------------------------
  const sec = SECTION_STYLE[(step as TimedStep | ExerciseStep & { section?: string }).section as Section ?? 'circuit'];
  const progress = (idx / (TOTAL_ACTIVE - 1)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0a0a0a' }}>

      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-4 pt-8 pb-3">
        <div className="flex-1 h-1.5 rounded-full" style={{ background: '#1c1c1c' }}>
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: '#7DC427' }}
          />
        </div>
        <span className="text-xs shrink-0" style={{ color: '#444' }}>
          {idx + 1}/{TOTAL_ACTIVE}
        </span>
        <button
          onClick={handleStop}
          className="text-xs font-bold px-3 py-1.5 rounded-full shrink-0"
          style={{ background: '#1c1c1c', color: '#555' }}
        >
          ✕
        </button>
      </div>

      {/* ── Section badge ── */}
      <div className="px-6 pt-2">
        {'section' in step && step.section && (
          <span
            className="text-xs font-black tracking-widest px-3 py-1 rounded-full"
            style={{ background: `${sec.color}22`, color: sec.color }}
          >
            {sec.badge}
          </span>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">

        {/* Timed step */}
        {step.kind === 'timed' && (
          <>
            <h2 className="text-2xl font-black text-white text-center mb-1">{step.label}</h2>
            {step.sublabel && (
              <p className="text-base font-semibold text-center mb-2" style={{ color: sec.color }}>
                {step.sublabel}
              </p>
            )}
            <Ring t={timeLeft} total={step.duration} color={paused ? '#444' : sec.color} />
            {paused && (
              <p className="text-xs font-bold tracking-widest mt-1" style={{ color: '#555' }}>
                PAUSED
              </p>
            )}
          </>
        )}

        {/* Exercise step */}
        {step.kind === 'exercise' && (
          <div className="w-full max-w-sm">
            {/* Set progress pips */}
            <div className="flex gap-2 justify-center mb-3">
              {Array.from({ length: step.totalSets }, (_, i) => (
                <div
                  key={i}
                  className="h-2 flex-1 rounded-full transition-colors"
                  style={{ background: i < step.setNum ? '#7DC427' : '#222' }}
                />
              ))}
            </div>

            <p className="text-center text-sm mb-1" style={{ color: '#555' }}>
              Set {step.setNum} of {step.totalSets}
            </p>
            <h2 className="text-3xl font-black text-white text-center mb-1">{step.name}</h2>
            <p className="text-xs text-center mb-5" style={{ color: '#555' }}>{step.targets}</p>

            {/* Reps target */}
            <div
              className="rounded-2xl py-5 text-center mb-4"
              style={{ background: '#141414', border: '1px solid #222' }}
            >
              <p className="text-5xl font-black" style={{ color: '#7DC427' }}>{step.reps}</p>
            </div>

            {/* Form cue toggle */}
            <button
              onClick={() => setShowCue(c => !c)}
              className="w-full text-xs text-left px-3 py-2.5 rounded-xl"
              style={{ background: '#141414', color: '#666', border: '1px solid #222' }}
            >
              {showCue ? '▼' : '▶'}&nbsp; Form cue
            </button>
            {showCue && (
              <p className="text-sm italic leading-relaxed px-1 mt-2" style={{ color: '#555' }}>
                {step.cue}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom controls ── */}
      <div className="px-6 pb-10">
        {step.kind === 'exercise' && (
          <button
            onClick={handleSkip}
            className="w-full py-6 rounded-2xl text-2xl font-black active:scale-95 transition-transform"
            style={{ background: '#7DC427', color: '#000' }}
          >
            Done  ✓
          </button>
        )}

        {step.kind === 'timed' && (
          <div className="space-y-3">
            <button
              onClick={handlePause}
              className="w-full py-4 rounded-2xl text-lg font-bold active:scale-95 transition-transform"
              style={{ background: '#141414', color: '#888', border: '1px solid #222' }}
            >
              {paused ? '▶  Resume' : '⏸  Pause'}
            </button>
            <button
              onClick={handleSkip}
              className="w-full py-3 rounded-2xl text-sm font-bold active:scale-95 transition-transform"
              style={{ background: 'transparent', color: '#444', border: '1px solid #1e1e1e' }}
            >
              Skip →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
