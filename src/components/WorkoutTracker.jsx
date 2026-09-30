import { useMemo, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore'
import {
  Activity,
  ArrowLeft,
  Clock3,
  Dumbbell,
  Flame,
  Footprints,
  Info,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { db } from '../firebase'

const pad = (n) => String(n).padStart(2, '0')
const localTime = (date = new Date()) => `${pad(date.getHours())}:${pad(date.getMinutes())}`

const HOME_PLAN = [
  {
    day: 'Monday',
    focus: 'Full body + incline walk',
    note: 'Strength first, then steady cardio.',
    exercises: [
      { name: 'Bodyweight Squat', sets: '4 sets × 12–20 reps', kind: 'squat', cue: 'Keep your chest tall, knees tracking over your toes, and sit your hips back and down.' },
      { name: 'Push-Up', sets: '4 sets × 8–15 reps', kind: 'pushup', cue: 'Brace your core, keep your body in one line, and lower your chest under control.' },
      { name: 'Reverse Lunge', sets: '3 sets × 10 each leg', kind: 'lunge', cue: 'Step back softly, keep the front foot planted, and drive through that front foot to stand.' },
      { name: 'Glute Bridge', sets: '3 sets × 15–20 reps', kind: 'bridge', cue: 'Drive through your heels and squeeze your glutes at the top without over-arching your back.' },
      { name: 'Forearm Plank', sets: '3 sets × 30–60 sec', kind: 'plank', cue: 'Keep ribs down and squeeze your glutes. Stop before your lower back starts sagging.' },
      { name: 'Treadmill Incline Walk', sets: '20–30 min', kind: 'treadmill', cue: 'Use a brisk pace. Choose an incline that raises your breathing while you can still speak in short sentences.' },
    ],
  },
  {
    day: 'Tuesday',
    focus: 'Upper body + core',
    note: 'Push, shoulders, arms, and abs.',
    exercises: [
      { name: 'Push-Up', sets: '4 sets × 8–15 reps', kind: 'pushup', cue: 'Keep elbows roughly 30–45° from your torso and lower with control.' },
      { name: 'Pike Push-Up', sets: '3 sets × 6–12 reps', kind: 'pike', cue: 'Start in an inverted V and bend your elbows to bring your head toward the floor.' },
      { name: 'Close-Grip Push-Up', sets: '3 sets × 6–12 reps', kind: 'closepushup', cue: 'Bring your hands slightly closer than a normal push-up while keeping your core tight.' },
      { name: 'Dead Bug', sets: '3 sets × 8–12 each side', kind: 'deadbug', cue: 'Keep your lower back gently pressed toward the floor as the opposite arm and leg extend.' },
      { name: 'Mountain Climber', sets: '3 sets × 30–45 sec', kind: 'mountain', cue: 'Keep shoulders stacked over your hands and drive knees forward without bouncing your hips.' },
      { name: 'Treadmill Brisk Walk', sets: '20–25 min', kind: 'treadmill', cue: 'Walk at a pace that feels purposeful. Keep posture tall and avoid hanging on the rails.' },
    ],
  },
  {
    day: 'Wednesday',
    focus: 'Active recovery',
    note: 'Keep moving, but keep the intensity easy.',
    exercises: [
      { name: 'Treadmill Easy Walk', sets: '30–45 min', kind: 'treadmill', cue: 'Easy conversational pace. The goal is recovery and extra activity, not exhaustion.' },
      { name: 'Bodyweight Squat', sets: '2 sets × 15 reps', kind: 'squat', cue: 'Use a comfortable range of motion and smooth tempo.' },
      { name: 'Glute Bridge', sets: '2 sets × 15 reps', kind: 'bridge', cue: 'Move slowly and focus on squeezing your glutes rather than rushing reps.' },
      { name: 'Bird Dog', sets: '2 sets × 8 each side', kind: 'birddog', cue: 'Reach opposite arm and leg long while keeping your hips level.' },
      { name: 'Forearm Plank', sets: '2 sets × 30 sec', kind: 'plank', cue: 'Use a shorter hold if your form starts to break.' },
    ],
  },
  {
    day: 'Thursday',
    focus: 'Lower body + incline intervals',
    note: 'Legs and glutes with controlled conditioning.',
    exercises: [
      { name: 'Bodyweight Squat', sets: '4 sets × 12–20 reps', kind: 'squat', cue: 'Control the lowering phase for about two seconds, then stand powerfully.' },
      { name: 'Reverse Lunge', sets: '4 sets × 8–12 each leg', kind: 'lunge', cue: 'Keep the front knee stable and take a long enough step that you feel your glutes and quads working.' },
      { name: 'Wall Sit', sets: '3 sets × 30–60 sec', kind: 'wallsit', cue: 'Press your back into the wall and keep your knees comfortable rather than forcing a perfect 90° angle.' },
      { name: 'Single-Leg Glute Bridge', sets: '3 sets × 8–12 each leg', kind: 'singlebridge', cue: 'Keep hips level and drive through the heel of the working leg.' },
      { name: 'Calf Raise', sets: '3 sets × 15–25 reps', kind: 'calf', cue: 'Rise onto the balls of your feet, pause, then lower slowly through the full range.' },
      { name: 'Treadmill Incline Intervals', sets: '20 min: 2 min easy / 1 min hard × 7', kind: 'treadmill', cue: 'Make the hard minutes faster or steeper, but never at a pace where you lose control of your stride.' },
    ],
  },
  {
    day: 'Friday',
    focus: 'Upper body + core',
    note: 'Repeat upper-body patterns with a little more volume.',
    exercises: [
      { name: 'Push-Up', sets: '5 sets × 6–15 reps', kind: 'pushup', cue: 'Stop 1–3 reps before failure on the first sets and keep every rep clean.' },
      { name: 'Pike Push-Up', sets: '4 sets × 6–12 reps', kind: 'pike', cue: 'Think about pushing the floor away while keeping your hips high.' },
      { name: 'Close-Grip Push-Up', sets: '3 sets × 6–12 reps', kind: 'closepushup', cue: 'Keep elbows tucked and move as one solid unit.' },
      { name: 'Dead Bug', sets: '3 sets × 10 each side', kind: 'deadbug', cue: 'Slow down the extension. If your lower back lifts, shorten the range.' },
      { name: 'Mountain Climber', sets: '4 sets × 30 sec', kind: 'mountain', cue: 'Use a controlled rhythm instead of turning it into a sloppy sprint.' },
      { name: 'Treadmill Brisk Walk', sets: '20–30 min', kind: 'treadmill', cue: 'Finish with a sustainable brisk pace to increase weekly activity.' },
    ],
  },
  {
    day: 'Saturday',
    focus: 'Full body conditioning',
    note: 'A faster session without needing equipment.',
    exercises: [
      { name: 'Bodyweight Squat', sets: '3 sets × 15 reps', kind: 'squat', cue: 'Smooth reps. Do not rush the bottom position.' },
      { name: 'Push-Up', sets: '3 sets × 8–15 reps', kind: 'pushup', cue: 'Use an easier variation on the final set if needed so you can keep good form.' },
      { name: 'Reverse Lunge', sets: '3 sets × 10 each leg', kind: 'lunge', cue: 'Stay balanced and control each step backward.' },
      { name: 'Burpee', sets: '3 sets × 6–10 reps', kind: 'burpee', cue: 'Step your feet back and forward instead of jumping if the impact is too much.' },
      { name: 'Forearm Plank', sets: '3 sets × 30–60 sec', kind: 'plank', cue: 'Brace your stomach as if preparing for a punch.' },
      { name: 'Treadmill Walk/Jog', sets: '25–35 min', kind: 'treadmill', cue: 'Alternate easy jogging and walking based on your current fitness and joint comfort.' },
    ],
  },
  {
    day: 'Sunday',
    focus: 'Recovery + steps',
    note: 'Recover so you can train hard again next week.',
    exercises: [
      { name: 'Treadmill Easy Walk', sets: '30–45 min', kind: 'treadmill', cue: 'Keep it easy and conversational. This is not a hard cardio session.' },
      { name: 'Bird Dog', sets: '2 sets × 8 each side', kind: 'birddog', cue: 'Move slowly and keep your torso steady.' },
      { name: 'Glute Bridge', sets: '2 sets × 15 reps', kind: 'bridge', cue: 'Focus on a full squeeze at the top.' },
      { name: 'Wall Sit', sets: '2 sets × 30 sec', kind: 'wallsit', cue: 'Use a comfortable knee angle and stop if you feel sharp pain.' },
    ],
  },
]

export default function WorkoutTracker({ userId, selectedDate, workouts, burned, canAdd = true }) {
  const now = useMemo(() => new Date(), [])
  const [workout, setWorkout] = useState('')
  const [caloriesBurned, setCaloriesBurned] = useState('')
  const [time, setTime] = useState(localTime(now))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [openExercise, setOpenExercise] = useState(null)

  const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'America/Chicago' }).format(new Date())
  const planDay = HOME_PLAN.find((item) => item.day === todayName) || HOME_PLAN[0]

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    const calories = Math.round(Number(caloriesBurned))
    if (!workout.trim()) return setError('Enter the workout name.')
    if (!Number.isFinite(calories) || calories < 1) return setError('Enter calories burned greater than 0.')
    if (!/^\d{2}:\d{2}$/.test(time)) return setError('Choose a valid time.')

    const workedOutAt = new Date(`${selectedDate}T${time}:00`)
    if (Number.isNaN(workedOutAt.getTime())) return setError('Choose a valid date and time.')

    setSaving(true)
    try {
      await addDoc(collection(db, 'users', userId, 'workouts'), {
        workout: workout.trim(),
        caloriesBurned: calories,
        dateKey: selectedDate,
        time,
        workedOutAt: Timestamp.fromDate(workedOutAt),
        createdAt: serverTimestamp(),
      })
      setWorkout('')
      setCaloriesBurned('')
    } catch (err) {
      console.error('Workout save error:', err)
      setError('Could not save this workout. Make sure the new Firestore workout rule is published.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this workout?')) return
    try {
      await deleteDoc(doc(db, 'users', userId, 'workouts', id))
    } catch (err) {
      console.error('Workout delete error:', err)
      setError('Could not delete that workout.')
    }
  }

  const workoutStyles = `
    .workout-card { color: #f8fafc; background: #0f172a !important; border-color: #263244 !important; }
    .workout-heading h2, .workout-card h2, .workout-card h3, .workout-card strong, .workout-card label { color: #f8fafc; }
    .workout-card .eyebrow { color: #94a3b8; }
    .workout-card .workout-subtitle, .workout-card p, .workout-readonly-note { color: #94a3b8; }
    .home-plan-shell { margin-top: 16px; padding: 16px; border: 1px solid #334155; border-radius: 18px; background: linear-gradient(180deg, #111c2f 0%, #0b1324 100%); }
    .home-plan-day { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 14px; }
    .home-plan-label { display: block; font-size: 11px; font-weight: 800; letter-spacing: .08em; color: #94a3b8; margin-bottom: 5px; }
    .home-plan-day h3 { margin: 0; font-size: 18px; line-height: 1.25; color: #f8fafc; }
    .home-plan-day p { margin: 6px 0 0; color: #94a3b8; font-size: 13px; }
    .home-plan-icon { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; flex: 0 0 auto; background: #123c2a; color: #6ee7b7; }
    .home-exercise-list { display: grid; gap: 8px; }
    .home-exercise-card { width: 100%; border: 1px solid #334155; background: #162033; border-radius: 14px; padding: 11px 12px; display: flex; align-items: center; gap: 11px; text-align: left; cursor: pointer; color: #f8fafc; transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease, background .15s ease; }
    .home-exercise-card:hover { transform: translateY(-1px); border-color: #34d399; background: #1b2a40; box-shadow: 0 7px 18px rgba(0, 0, 0, .28); }
    .home-exercise-card > svg { margin-left: auto; color: #94a3b8; flex: 0 0 auto; }
    .home-exercise-number { width: 28px; height: 28px; border-radius: 9px; display: grid; place-items: center; background: #123c2a; color: #6ee7b7; font-size: 12px; font-weight: 800; flex: 0 0 auto; }
    .home-exercise-copy { min-width: 0; display: grid; gap: 3px; }
    .home-exercise-copy strong { font-size: 14px; color: #f8fafc; }
    .home-exercise-copy span { font-size: 12px; color: #94a3b8; }
    .home-plan-tip, .home-plan-disclaimer { margin-top: 12px; border-radius: 12px; padding: 11px 12px; font-size: 12px; line-height: 1.5; }
    .home-plan-tip { background: #17243a; color: #cbd5e1; border: 1px solid #334155; }
    .home-plan-tip strong { color: #f8fafc; }
    .home-plan-disclaimer { color: #94a3b8; background: #111827; border: 1px solid #334155; margin-bottom: 0; }
    .burned-badge { background: #1b2a40 !important; border-color: #334155 !important; color: #f8fafc !important; }
    .burned-badge span { color: #94a3b8 !important; }
    .workout-form { color: #f8fafc; }
    .workout-form input, .workout-form select, .workout-form textarea { background: #111827 !important; color: #f8fafc !important; border-color: #334155 !important; }
    .workout-form input::placeholder { color: #64748b; }
    .input-icon-wrap, .calorie-input-wrap { background: #111827 !important; border-color: #334155 !important; }
    .input-icon-wrap svg { color: #94a3b8; }
    .calorie-input-wrap span { color: #94a3b8; }
    .workout-empty { background: #111827 !important; border-color: #334155 !important; color: #94a3b8 !important; }
    .workout-row { background: #111827 !important; border-color: #334155 !important; color: #f8fafc; }
    .workout-row-main span { color: #94a3b8 !important; }
    .workout-row-right strong { color: #f8fafc !important; }
    .workout-row-right strong span { color: #94a3b8 !important; }
    .delete-btn { background: #1f2937 !important; color: #fca5a5 !important; border-color: #374151 !important; }
    .form-error { color: #fca5a5 !important; }
    .workout-add-btn { box-shadow: none; }
    .exercise-modal-backdrop { position: fixed; inset: 0; z-index: 1000; background: rgba(2, 6, 23, .82); display: grid; place-items: center; padding: 20px; }
    .exercise-modal { width: min(620px, 100%); max-height: min(90vh, 760px); overflow: auto; border-radius: 22px; background: #0f172a; color: #f8fafc; border: 1px solid #334155; box-shadow: 0 30px 80px rgba(0, 0, 0, .55); }
    .exercise-modal-topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border-bottom: 1px solid #334155; font-size: 11px; font-weight: 800; letter-spacing: .09em; color: #94a3b8; }
    .exercise-back-btn, .exercise-close-btn { width: 36px; height: 36px; border: 0; border-radius: 10px; background: #1e293b; color: #f8fafc; display: grid; place-items: center; cursor: pointer; }
    .exercise-back-btn:hover, .exercise-close-btn:hover { background: #334155; }
    .exercise-picture { padding: 18px 18px 0; color: #e2e8f0; }
    .exercise-picture svg { width: 100%; height: auto; display: block; border-radius: 18px; }
    .exercise-modal-content { padding: 18px 20px 22px; }
    .exercise-modal-content h3 { margin: 3px 0 8px; font-size: 24px; color: #f8fafc; }
    .exercise-modal-content > p:not(.eyebrow) { margin: 0; color: #cbd5e1; line-height: 1.65; }
    .exercise-form-note { margin-top: 14px; padding: 12px 13px; border-radius: 12px; background: #2a1d13; border: 1px solid #7c4a21; color: #fed7aa; font-size: 12px; line-height: 1.5; }
    @media (max-width: 560px) {
      .home-plan-shell { padding: 12px; }
      .home-plan-day h3 { font-size: 16px; }
      .exercise-modal-backdrop { padding: 10px; }
      .exercise-modal-content { padding: 15px 16px 18px; }
    }
  `

  return (
    <>
      <style>{workoutStyles}</style>
      <section className="card workout-card">
      <div className="section-heading workout-heading">
        <div>
          <p className="eyebrow">HOME WORKOUT</p>
          <h2>Get Ripped Plan</h2>
          <p className="workout-subtitle">Treadmill + bodyweight only. Tap any exercise for a visual and form cues.</p>
        </div>
        <div className="burned-badge">
          <Flame size={16} />
          <strong>{burned.toLocaleString()}</strong>
          <span>burned</span>
        </div>
      </div>

      <div className="home-plan-shell">
        <div className="home-plan-day">
          <div>
            <span className="home-plan-label">TODAY'S PLAN</span>
            <h3>{planDay.day} · {planDay.focus}</h3>
            <p>{planDay.note}</p>
          </div>
          <div className="home-plan-icon"><Activity size={20} /></div>
        </div>

        <div className="home-exercise-list">
          {planDay.exercises.map((exercise, index) => (
            <button
              key={`${exercise.name}-${index}`}
              type="button"
              className="home-exercise-card"
              onClick={() => setOpenExercise(exercise)}
            >
              <div className="home-exercise-number">{index + 1}</div>
              <div className="home-exercise-copy">
                <strong>{exercise.name}</strong>
                <span>{exercise.sets}</span>
              </div>
              <Info size={18} />
            </button>
          ))}
        </div>

        <div className="home-plan-tip">
          <strong>Progression:</strong> When you can complete the top end of the rep range with clean form, slow the reps down, add 1–2 reps, or choose a harder variation.
        </div>
        <p className="home-plan-disclaimer">Getting “ripped” depends primarily on losing body fat while preserving/building muscle. Your calorie goal and consistent training work together.</p>
      </div>

      {canAdd && (
        <form className="workout-form" onSubmit={submit}>
          <label>
            Log a workout
            <div className="input-icon-wrap">
              <Dumbbell size={16} />
              <input
                value={workout}
                onChange={(e) => setWorkout(e.target.value)}
                placeholder="Treadmill, push-ups, walking..."
                required
              />
            </div>
          </label>

          <div className="workout-form-grid">
            <label>
              Calories burned
              <div className="calorie-input-wrap burn-input-wrap">
                <input
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={caloriesBurned}
                  onChange={(e) => setCaloriesBurned(e.target.value)}
                  placeholder="300"
                  required
                />
                <span>cal</span>
              </div>
            </label>

            <label>
              Time
              <div className="input-icon-wrap">
                <Clock3 size={16} />
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
            </label>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="workout-add-btn" type="submit" disabled={saving}>
            <Plus size={18} />
            {saving ? 'Saving…' : 'Add workout'}
          </button>
        </form>
      )}

      {!canAdd && <p className="workout-readonly-note">Workout history for {selectedDate}</p>}

      <div className="workout-list">
        {workouts.length === 0 ? (
          <div className="workout-empty">
            <Footprints size={20} />
            <span>No workouts logged for this day.</span>
          </div>
        ) : (
          workouts.map((item) => (
            <article className="workout-row" key={item.id}>
              <div className="workout-row-main">
                <strong>{item.workout}</strong>
                <span><Clock3 size={12} /> {formatTime(item.time)}</span>
              </div>
              <div className="workout-row-right">
                <strong>-{Number(item.caloriesBurned || 0).toLocaleString()} <span>cal</span></strong>
                <button className="delete-btn" type="button" onClick={() => remove(item.id)} aria-label={`Delete ${item.workout}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {openExercise && (
        <div className="exercise-modal-backdrop" role="presentation" onClick={() => setOpenExercise(null)}>
          <div className="exercise-modal" role="dialog" aria-modal="true" aria-labelledby="exercise-modal-title" onClick={(e) => e.stopPropagation()}>
            <div className="exercise-modal-topbar">
              <button type="button" className="exercise-back-btn" onClick={() => setOpenExercise(null)} aria-label="Close exercise details">
                <ArrowLeft size={18} />
              </button>
              <span>EXERCISE GUIDE</span>
              <button type="button" className="exercise-close-btn" onClick={() => setOpenExercise(null)} aria-label="Close">
                <X size={19} />
              </button>
            </div>

            <div className="exercise-picture" aria-label={`${openExercise.name} illustration`}>
              <ExerciseIllustration kind={openExercise.kind} />
            </div>

            <div className="exercise-modal-content">
              <p className="eyebrow">{openExercise.sets}</p>
              <h3 id="exercise-modal-title">{openExercise.name}</h3>
              <p>{openExercise.cue}</p>
              <div className="exercise-form-note">
                <strong>Form first.</strong> Stop if you feel sharp pain, dizziness, or anything that feels wrong. Make the movement easier before adding reps.
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
    </>
  )
}

function ExerciseIllustration({ kind }) {
  const common = { stroke: 'currentColor', strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }

  return (
    <svg viewBox="0 0 420 260" role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`bg-${kind}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#172554" />
          <stop offset="100%" stopColor="#0f3d33" />
        </linearGradient>
      </defs>
      <rect width="420" height="260" rx="28" fill={`url(#bg-${kind})`} />
      <line x1="40" y1="220" x2="380" y2="220" stroke="#64748b" strokeWidth="4" />
      {renderPose(kind, common)}
    </svg>
  )
}

function renderPose(kind, common) {
  const head = <circle cx="210" cy="55" r="20" fill="white" stroke="currentColor" strokeWidth="5" />
  if (kind === 'treadmill') {
    return (
      <>
        <path d="M285 78 L315 185 L180 185 L145 95" {...common} />
        <line x1="135" y1="90" x2="205" y2="62" {...common} />
        <line x1="300" y1="88" x2="260" y2="45" {...common} />
        {head}
        <line x1="210" y1="75" x2="190" y2="115" {...common} />
        <line x1="190" y1="115" x2="220" y2="155" {...common} />
        <line x1="190" y1="115" x2="165" y2="153" {...common} />
        <line x1="220" y1="155" x2="245" y2="190" {...common} />
        <line x1="165" y1="153" x2="145" y2="185" {...common} />
        <line x1="195" y1="92" x2="235" y2="110" {...common} />
      </>
    )
  }
  if (kind === 'squat' || kind === 'wallsit') {
    return (
      <>
        {kind === 'wallsit' && <line x1="315" y1="25" x2="315" y2="220" stroke="#64748b" strokeWidth="8" />}
        {head}
        <line x1="210" y1="75" x2="210" y2="125" {...common} />
        <line x1="210" y1="90" x2="165" y2="112" {...common} />
        <line x1="165" y1="112" x2="145" y2="125" {...common} />
        <line x1="210" y1="125" x2="170" y2="165" {...common} />
        <line x1="170" y1="165" x2="150" y2="215" {...common} />
        <line x1="210" y1="125" x2="250" y2="165" {...common} />
        <line x1="250" y1="165" x2="275" y2="215" {...common} />
        {kind === 'squat' && <line x1="142" y1="215" x2="159" y2="215" {...common} />}
        {kind === 'squat' && <line x1="267" y1="215" x2="284" y2="215" {...common} />}
        {kind === 'wallsit' && <line x1="275" y1="215" x2="290" y2="215" {...common} />}
      </>
    )
  }
  if (kind === 'pushup' || kind === 'closepushup' || kind === 'mountain' || kind === 'burpee') {
    return (
      <>
        <circle cx="300" cy="95" r="16" fill="white" stroke="currentColor" strokeWidth="5" />
        <line x1="285" y1="108" x2="235" y2="155" {...common} />
        <line x1="235" y1="155" x2="155" y2="175" {...common} />
        <line x1="155" y1="175" x2="95" y2="215" {...common} />
        <line x1="235" y1="155" x2="245" y2="205" {...common} />
        {kind === 'mountain' ? (
          <>
            <line x1="235" y1="155" x2="205" y2="180" {...common} />
            <line x1="205" y1="180" x2="165" y2="202" {...common} />
            <line x1="235" y1="155" x2="270" y2="180" {...common} />
            <line x1="270" y1="180" x2="305" y2="202" {...common} />
          </>
        ) : kind === 'burpee' ? (
          <>
            <line x1="155" y1="175" x2="120" y2="200" {...common} />
            <line x1="155" y1="175" x2="190" y2="200" {...common} />
          </>
        ) : (
          <>
            <line x1="155" y1="175" x2="120" y2="210" {...common} />
            <line x1="245" y1="205" x2="275" y2="220" {...common} />
          </>
        )}
      </>
    )
  }
  if (kind === 'lunge') {
    return (
      <>
        {head}
        <line x1="210" y1="75" x2="210" y2="120" {...common} />
        <line x1="210" y1="90" x2="170" y2="115" {...common} />
        <line x1="170" y1="115" x2="155" y2="140" {...common} />
        <line x1="210" y1="120" x2="175" y2="160" {...common} />
        <line x1="175" y1="160" x2="120" y2="205" {...common} />
        <line x1="210" y1="120" x2="260" y2="165" {...common} />
        <line x1="260" y1="165" x2="310" y2="205" {...common} />
        <line x1="112" y1="205" x2="130" y2="205" {...common} />
        <line x1="302" y1="205" x2="320" y2="205" {...common} />
      </>
    )
  }
  if (kind === 'bridge' || kind === 'singlebridge') {
    return (
      <>
        <circle cx="105" cy="153" r="17" fill="white" stroke="currentColor" strokeWidth="5" />
        <line x1="120" y1="163" x2="185" y2="150" {...common} />
        <line x1="185" y1="150" x2="250" y2="135" {...common} />
        <line x1="250" y1="135" x2="300" y2="170" {...common} />
        <line x1="185" y1="150" x2="235" y2="190" {...common} />
        {kind === 'singlebridge' ? <line x1="235" y1="190" x2="275" y2="215" {...common} /> : <line x1="235" y1="190" x2="275" y2="215" {...common} />}
        <line x1="100" y1="170" x2="85" y2="205" {...common} />
        <line x1="300" y1="170" x2="320" y2="210" {...common} />
      </>
    )
  }
  if (kind === 'plank') {
    return (
      <>
        <circle cx="300" cy="105" r="16" fill="white" stroke="currentColor" strokeWidth="5" />
        <line x1="285" y1="118" x2="225" y2="155" {...common} />
        <line x1="225" y1="155" x2="145" y2="190" {...common} />
        <line x1="225" y1="155" x2="235" y2="215" {...common} />
        <line x1="145" y1="190" x2="95" y2="215" {...common} />
        <line x1="85" y1="215" x2="105" y2="215" {...common} />
      </>
    )
  }
  if (kind === 'pike') {
    return (
      <>
        <circle cx="315" cy="90" r="16" fill="white" stroke="currentColor" strokeWidth="5" />
        <line x1="300" y1="103" x2="245" y2="150" {...common} />
        <line x1="245" y1="150" x2="185" y2="115" {...common} />
        <line x1="185" y1="115" x2="120" y2="195" {...common} />
        <line x1="245" y1="150" x2="215" y2="215" {...common} />
        <line x1="120" y1="195" x2="100" y2="215" {...common} />
        <line x1="205" y1="215" x2="225" y2="215" {...common} />
      </>
    )
  }
  if (kind === 'deadbug') {
    return (
      <>
        <circle cx="95" cy="150" r="18" fill="white" stroke="currentColor" strokeWidth="5" />
        <line x1="112" y1="155" x2="185" y2="160" {...common} />
        <line x1="185" y1="160" x2="255" y2="170" {...common} />
        <line x1="155" y1="158" x2="130" y2="105" {...common} />
        <line x1="155" y1="158" x2="185" y2="105" {...common} />
        <line x1="255" y1="170" x2="300" y2="125" {...common} />
        <line x1="255" y1="170" x2="315" y2="195" {...common} />
      </>
    )
  }
  if (kind === 'birddog') {
    return (
      <>
        <circle cx="295" cy="112" r="16" fill="white" stroke="currentColor" strokeWidth="5" />
        <line x1="280" y1="122" x2="225" y2="155" {...common} />
        <line x1="225" y1="155" x2="145" y2="185" {...common} />
        <line x1="150" y1="180" x2="90" y2="125" {...common} />
        <line x1="225" y1="155" x2="245" y2="215" {...common} />
        <line x1="145" y1="185" x2="120" y2="215" {...common} />
        <line x1="225" y1="155" x2="245" y2="100" {...common} />
      </>
    )
  }
  if (kind === 'calf') {
    return (
      <>
        {head}
        <line x1="210" y1="75" x2="210" y2="135" {...common} />
        <line x1="210" y1="95" x2="170" y2="125" {...common} />
        <line x1="170" y1="125" x2="150" y2="145" {...common} />
        <line x1="210" y1="135" x2="175" y2="200" {...common} />
        <line x1="210" y1="135" x2="245" y2="200" {...common} />
        <line x1="160" y1="200" x2="190" y2="200" {...common} />
        <line x1="230" y1="200" x2="260" y2="200" {...common} />
        <path d="M145 75 L145 30 L280 30" {...common} />
        <line x1="145" y1="90" x2="145" y2="30" {...common} />
      </>
    )
  }
  return (
    <>
      {head}
      <line x1="210" y1="75" x2="210" y2="135" {...common} />
      <line x1="210" y1="90" x2="170" y2="125" {...common} />
      <line x1="170" y1="125" x2="150" y2="145" {...common} />
      <line x1="210" y1="135" x2="170" y2="185" {...common} />
      <line x1="170" y1="185" x2="145" y2="215" {...common} />
      <line x1="210" y1="135" x2="250" y2="185" {...common} />
      <line x1="250" y1="185" x2="275" y2="215" {...common} />
    </>
  )
}

function formatTime(time) {
  if (!time) return ''
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}
