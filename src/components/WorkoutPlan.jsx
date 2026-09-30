import { useState } from 'react'
import {
  Activity,
  ArrowDown,
  CheckCircle2,
  Dumbbell,
  HeartPulse,
  Info,
  MoveUp,
  Sparkles,
  Timer,
  Trophy,
  UserRound,
  Zap,
} from 'lucide-react'

const plan = [
  {
    day: 'Monday',
    label: 'Upper A',
    focus: 'Chest + back + shoulders + arms',
    accent: 'push',
    imageType: 'press',
    exercises: [
      ['Smith machine bench press', '3 × 8–12', 'Rest 90 sec', 'Chest', 'press'],
      ['Lat pulldown', '3 × 8–12', 'Rest 90 sec', 'Back', 'pulldown'],
      ['Machine shoulder press', '3 × 8–12', 'Rest 75 sec', 'Shoulders', 'press'],
      ['Seated cable row', '3 × 8–12', 'Rest 90 sec', 'Back', 'row'],
      ['Dumbbell curl', '2 × 10–15', 'Rest 60 sec', 'Biceps', 'curl'],
      ['Cable triceps pushdown', '2 × 10–15', 'Rest 60 sec', 'Triceps', 'pushdown'],
    ],
    cardio: '15–20 min incline treadmill walk',
  },
  {
    day: 'Tuesday',
    label: 'Lower A',
    focus: 'Quads + glutes + hamstrings + core',
    accent: 'legs',
    imageType: 'squat',
    exercises: [
      ['Leg press', '3 × 10–12', 'Rest 90 sec', 'Quads / glutes', 'legpress'],
      ['Smith machine squat', '3 × 8–12', 'Rest 90 sec', 'Quads / glutes', 'squat'],
      ['Seated or lying leg curl', '3 × 10–15', 'Rest 75 sec', 'Hamstrings', 'curl'],
      ['Calf raise machine', '3 × 12–15', 'Rest 60 sec', 'Calves', 'calf'],
      ['Ab machine', '3 × 12–15', 'Rest 60 sec', 'Abs', 'abs'],
    ],
    cardio: '15 min stair climber or incline treadmill',
  },
  {
    day: 'Wednesday',
    label: 'Active Recovery',
    focus: 'Burn calories without beating up your muscles',
    accent: 'recovery',
    imageType: 'cardio',
    exercises: [
      ['Incline treadmill walk', '30–40 min', 'Easy/moderate pace', 'Cardio', 'cardio'],
      ['Hip + shoulder mobility', '8–10 min', 'Slow and controlled', 'Mobility', 'mobility'],
      ['Light stretching', '5–10 min', 'No painful ranges', 'Recovery', 'mobility'],
    ],
    cardio: 'Optional: 5–10 extra easy minutes on bike or elliptical',
  },
  {
    day: 'Thursday',
    label: 'Upper B',
    focus: 'Upper chest + lats + delts + arms',
    accent: 'pull',
    imageType: 'pulldown',
    exercises: [
      ['Incline Smith machine press', '3 × 8–12', 'Rest 90 sec', 'Upper chest', 'press'],
      ['Neutral-grip lat pulldown', '3 × 8–12', 'Rest 90 sec', 'Lats', 'pulldown'],
      ['Cable chest fly', '2 × 10–15', 'Rest 60 sec', 'Chest', 'fly'],
      ['Seated cable row', '3 × 8–12', 'Rest 90 sec', 'Mid-back', 'row'],
      ['Dumbbell lateral raise', '3 × 12–15', 'Rest 60 sec', 'Side delts', 'raise'],
      ['Dumbbell curl', '2 × 10–15', 'Rest 60 sec', 'Biceps', 'curl'],
      ['Cable triceps pushdown', '2 × 10–15', 'Rest 60 sec', 'Triceps', 'pushdown'],
    ],
    cardio: '15–20 min incline treadmill walk',
  },
  {
    day: 'Friday',
    label: 'Lower B',
    focus: 'Quads + posterior chain + core',
    accent: 'legs',
    imageType: 'hinge',
    exercises: [
      ['Hack squat or leg press', '3 × 8–12', 'Rest 90 sec', 'Quads / glutes', 'squat'],
      ['Smith machine Romanian deadlift', '3 × 8–12', 'Rest 90 sec', 'Hamstrings / glutes', 'hinge'],
      ['Leg extension', '3 × 10–15', 'Rest 60–75 sec', 'Quads', 'legext'],
      ['Leg curl', '3 × 10–15', 'Rest 60–75 sec', 'Hamstrings', 'curl'],
      ['Calf raise', '3 × 12–15', 'Rest 60 sec', 'Calves', 'calf'],
      ['Cable crunch or ab machine', '3 × 12–15', 'Rest 60 sec', 'Abs', 'abs'],
    ],
    cardio: '15–20 min stair climber or incline walk',
  },
  {
    day: 'Saturday',
    label: 'Full Body + Conditioning',
    focus: 'Keep muscle, train everything, finish with conditioning',
    accent: 'full',
    imageType: 'full',
    exercises: [
      ['Goblet squat', '3 × 10–12', 'Rest 75 sec', 'Lower body', 'squat'],
      ['Machine or dumbbell chest press', '3 × 10–12', 'Rest 75 sec', 'Chest', 'press'],
      ['Cable row', '3 × 10–12', 'Rest 75 sec', 'Back', 'row'],
      ['Machine shoulder press', '2 × 10–12', 'Rest 60 sec', 'Shoulders', 'press'],
      ['Cable crunch', '3 × 12–15', 'Rest 60 sec', 'Abs', 'abs'],
    ],
    cardio: '20–25 min stair climber, bike, or treadmill intervals',
  },
  {
    day: 'Sunday',
    label: 'Recovery',
    focus: 'Walk, recover, and come back ready to train',
    accent: 'recovery',
    imageType: 'recovery',
    exercises: [
      ['Easy walk', '30–60 min', 'Conversational pace', 'Activity', 'cardio'],
      ['Mobility / stretching', '10–15 min', 'Relaxed breathing', 'Recovery', 'mobility'],
    ],
    cardio: 'No hard cardio and no heavy lifting',
  },
]

export default function WorkoutPlan() {
  const todayIndex = (new Date().getDay() + 6) % 7
  const [selected, setSelected] = useState(todayIndex)
  const current = plan[selected]

  return (
    <section className="workout-plan card">
      <div className="section-heading workout-plan-heading">
        <div>
          <p className="eyebrow">YOUR WEEKLY PLAN</p>
          <h2>Get Ripped: Planet Fitness Routine</h2>
          <p className="workout-plan-intro">
            Goal: lose body fat while keeping/building muscle. You do not need to lift hard every day—recovery days are part of the plan.
          </p>
        </div>
        <div className="plan-profile-badge">
          <UserRound size={15} />
          <span>5'8&quot; · 190 lb</span>
        </div>
      </div>

      <div className="plan-guidance-grid">
        <div><Trophy size={16} /><strong>Progressive overload</strong><span>Hit the top of the rep range with clean form → add a small amount of weight.</span></div>
        <div><Dumbbell size={16} /><strong>Muscle-building volume</strong><span>Most lifts are 2–3 sets; focus on consistent weekly work.</span></div>
        <div><HeartPulse size={16} /><strong>Fat-loss cardio</strong><span>Use walking, stair climber, bike, or elliptical to build weekly activity.</span></div>
        <div><Zap size={16} /><strong>Effort</strong><span>Most sets should feel challenging without sacrificing form or control.</span></div>
      </div>

      <div className="day-tabs" role="tablist" aria-label="Workout days">
        {plan.map((item, index) => (
          <button
            key={item.day}
            type="button"
            role="tab"
            aria-selected={selected === index}
            className={`day-tab ${selected === index ? 'is-active' : ''} ${index === todayIndex ? 'is-today' : ''}`}
            onClick={() => setSelected(index)}
          >
            <span>{item.day.slice(0, 3)}</span>
            <strong>{item.label}</strong>
            {index === todayIndex && <small>Today</small>}
          </button>
        ))}
      </div>

      <div className={`plan-day-card accent-${current.accent}`}>
        <div className="plan-day-header">
          <div>
            <p className="eyebrow">{current.day}</p>
            <h3>{current.label}</h3>
            <p>{current.focus}</p>
          </div>
          <div className="plan-day-chips">
            <span><Timer size={13} /> {current.exercises.length} movements</span>
            <span><Activity size={13} /> {current.cardio}</span>
          </div>
        </div>

        <div className="plan-visual-and-list">
          <ExerciseVisual type={current.imageType} title={current.label} />
          <div className="exercise-list">
            {current.exercises.map(([name, reps, rest, muscle, type], index) => (
              <ExerciseRow key={`${name}-${index}`} name={name} reps={reps} rest={rest} muscle={muscle} type={type} />
            ))}
          </div>
        </div>

        <div className="cardio-strip">
          <HeartPulse size={17} />
          <div>
            <strong>Finish with cardio</strong>
            <span>{current.cardio}</span>
          </div>
        </div>
      </div>

      <div className="plan-footer-note">
        <Info size={16} />
        <p><strong>Form first.</strong> Start lighter than you think you need, learn the machines, and increase weight gradually. Planet Fitness lists machines, cable towers, dumbbells/barbells, Smith machines, and several cardio options, but exact equipment can vary by club.</p>
      </div>
    </section>
  )
}

function ExerciseRow({ name, reps, rest, muscle, type }) {
  return (
    <article className="exercise-row">
      <div className="exercise-mini-visual">
        <ExerciseIcon type={type} />
      </div>
      <div className="exercise-copy">
        <strong>{name}</strong>
        <span>{muscle} · {rest}</span>
      </div>
      <div className="exercise-prescription">
        <strong>{reps}</strong>
        <CheckCircle2 size={15} />
      </div>
    </article>
  )
}

function ExerciseVisual({ type, title }) {
  return (
    <div className="exercise-hero-visual">
      <div className="visual-badge"><Sparkles size={13} /> Form guide</div>
      <svg viewBox="0 0 420 300" role="img" aria-label={`${title} exercise illustration`}>
        <defs>
          <linearGradient id="exerciseGlow" x1="0" x2="1">
            <stop offset="0%" stopOpacity="0.06" />
            <stop offset="100%" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="420" height="300" rx="26" fill="url(#exerciseGlow)" />
        <line x1="30" y1="255" x2="390" y2="255" stroke="currentColor" strokeOpacity=".22" strokeWidth="4" strokeLinecap="round" />
        <ExercisePose type={type} />
      </svg>
      <div className="visual-caption"><strong>{title}</strong><span>Slow reps · controlled range · no ego lifting</span></div>
    </div>
  )
}

function ExercisePose({ type }) {
  const common = { stroke: 'currentColor', strokeWidth: 8, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
  const skin = { fill: 'currentColor', opacity: .92 }

  if (type === 'pulldown') {
    return <g {...common}>
      <circle cx="210" cy="74" r="23" {...skin} stroke="none" />
      <path d="M185 105 Q210 90 235 105 L250 165" />
      <path d="M188 112 L142 92 L110 65 M232 112 L278 92 L310 65" />
      <path d="M107 63 L313 63" />
      <path d="M197 160 L170 232 M222 160 L250 232" />
      <path d="M132 238 L187 238 M238 238 L293 238" />
      <path d="M165 162 Q210 185 255 162" strokeWidth="5" />
      <path d="M150 230 L270 230" strokeOpacity=".55" strokeWidth="5" />
    </g>
  }

  if (type === 'hinge') {
    return <g {...common}>
      <circle cx="190" cy="78" r="22" {...skin} stroke="none" />
      <path d="M175 105 L235 130 L275 175" />
      <path d="M210 124 L165 190 L126 226" />
      <path d="M242 131 L285 220" />
      <path d="M165 189 L115 190" />
      <path d="M285 220 L330 220" />
      <path d="M105 245 L340 245" strokeOpacity=".55" strokeWidth="5" />
      <circle cx="110" cy="189" r="13" strokeWidth="5" />
      <circle cx="113" cy="189" r="4" {...skin} stroke="none" />
    </g>
  }

  if (type === 'squat') {
    return <g {...common}>
      <circle cx="215" cy="65" r="22" {...skin} stroke="none" />
      <path d="M190 92 L205 145 L172 190" />
      <path d="M205 145 L260 185 L305 220" />
      <path d="M174 192 L137 225" />
      <path d="M260 185 L240 232" />
      <path d="M125 235 L170 235 M224 240 L280 240" />
      <path d="M170 96 L260 96" />
      <path d="M164 106 L176 89 M256 106 L268 89" />
      <path d="M154 82 L278 82" />
    </g>
  }

  if (type === 'row') {
    return <g {...common}>
      <circle cx="204" cy="73" r="22" {...skin} stroke="none" />
      <path d="M184 102 L230 132 L285 154" />
      <path d="M230 132 L178 172 L145 225" />
      <path d="M178 172 L235 225" />
      <path d="M136 230 L185 230 M226 230 L279 230" />
      <path d="M285 154 L330 166" />
      <path d="M330 166 L350 195" />
    </g>
  }

  if (type === 'cardio' || type === 'recovery') {
    return <g {...common}>
      <circle cx="195" cy="77" r="22" {...skin} stroke="none" />
      <path d="M184 102 L215 145 L184 190 L155 232" />
      <path d="M214 145 L258 160 L296 224" />
      <path d="M163 126 L120 158 M213 124 L248 105" />
      <path d="M126 158 L100 208 M296 224 L329 224" />
      <path d="M80 235 L340 235" strokeWidth="6" />
      <path d="M90 235 Q140 204 190 235 T340 235" strokeWidth="4" strokeOpacity=".45" />
    </g>
  }

  return <g {...common}>
    <circle cx="205" cy="66" r="22" {...skin} stroke="none" />
    <path d="M205 92 L205 165" />
    <path d="M205 110 L148 142 M205 110 L265 142" />
    <path d="M205 165 L170 232 M205 165 L245 232" />
    <path d="M145 145 L125 175 M268 145 L290 175" />
    <path d="M155 236 L185 236 M230 236 L260 236" />
    <rect x="137" y="170" width="135" height="6" rx="3" stroke="none" fill="currentColor" opacity=".35" />
  </g>
}

function ExerciseIcon({ type }) {
  const Icon = type === 'cardio' ? Activity : type === 'mobility' ? MoveUp : type === 'raise' ? ArrowDown : Dumbbell
  return <Icon size={18} strokeWidth={2.25} />
}
