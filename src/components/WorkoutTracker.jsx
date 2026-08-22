import { useMemo, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { Clock3, Dumbbell, Flame, Plus, Trash2 } from 'lucide-react'
import { db } from '../firebase'

const pad = (n) => String(n).padStart(2, '0')
const localTime = (date = new Date()) => `${pad(date.getHours())}:${pad(date.getMinutes())}`

export default function WorkoutTracker({ userId, selectedDate, workouts, burned, canAdd = true }) {
  const now = useMemo(() => new Date(), [])
  const [workout, setWorkout] = useState('')
  const [caloriesBurned, setCaloriesBurned] = useState('')
  const [time, setTime] = useState(localTime(now))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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

  return (
    <section className="card workout-card">
      <div className="section-heading workout-heading">
        <div>
          <p className="eyebrow">ACTIVITY</p>
          <h2>Workout</h2>
          <p className="workout-subtitle">Burned calories are automatically deducted from your food calories.</p>
        </div>
        <div className="burned-badge">
          <Flame size={16} />
          <strong>{burned.toLocaleString()}</strong>
          <span>burned</span>
        </div>
      </div>

      {canAdd && (
        <form className="workout-form" onSubmit={submit}>
          <label>
            Workout
            <div className="input-icon-wrap">
              <Dumbbell size={16} />
              <input
                value={workout}
                onChange={(e) => setWorkout(e.target.value)}
                placeholder="Basketball, treadmill, weights..."
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

      {!canAdd && (
        <p className="workout-readonly-note">Workout history for {selectedDate}</p>
      )}

      <div className="workout-list">
        {workouts.length === 0 ? (
          <div className="workout-empty">
            <Dumbbell size={20} />
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
    </section>
  )
}

function formatTime(time) {
  if (!time) return ''
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}
