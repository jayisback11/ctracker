import { useMemo, useState } from 'react'
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore'
import { CalendarDays, Clock3, Plus } from 'lucide-react'
import { db } from '../firebase'

const pad = (n) => String(n).padStart(2, '0')
const localDate = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const localTime = (date = new Date()) => `${pad(date.getHours())}:${pad(date.getMinutes())}`

export default function AddEntry({ userId, onAdded }) {
  const now = useMemo(() => new Date(), [])
  const [food, setFood] = useState('')
  const [calories, setCalories] = useState('')
  const [date, setDate] = useState(localDate(now))
  const [time, setTime] = useState(localTime(now))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const value = Number(calories)
    if (!food.trim()) return setError('Enter the food or meal name.')
    if (!value || value < 1) return setError('Enter a calorie amount greater than 0.')

    const eatenAt = new Date(`${date}T${time}:00`)
    if (Number.isNaN(eatenAt.getTime())) return setError('Choose a valid date and time.')

    setSaving(true)
    try {
      await addDoc(collection(db, 'users', userId, 'entries'), {
        food: food.trim(),
        calories: Math.round(value),
        dateKey: date,
        time,
        eatenAt: Timestamp.fromDate(eatenAt),
        createdAt: serverTimestamp(),
      })
      setFood('')
      setCalories('')
      onAdded?.()
    } catch (err) {
      console.error(err)
      setError('Could not save this entry. Check your Firebase setup and Firestore rules.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="card add-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">QUICK LOG</p>
          <h2>Add calories</h2>
        </div>
      </div>

      <form className="entry-form" onSubmit={submit}>
        <label className="food-field">
          Food / meal
          <input
            value={food}
            onChange={(e) => setFood(e.target.value)}
            placeholder="Chicken breast"
            required
          />
        </label>
        <label>
          Calories
          <div className="calorie-input-wrap">
            <input
              type="number"
              min="1"
              step="1"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="240"
              required
            />
            <span>cal</span>
          </div>
        </label>

        <div className="date-time-grid">
          <label>
            Day
            <div className="input-icon-wrap">
              <CalendarDays size={16} />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
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
        <button className="primary-btn" type="submit" disabled={saving}>
          <Plus size={18} /> {saving ? 'Saving…' : 'Add entry'}
        </button>
      </form>
    </section>
  )
}
