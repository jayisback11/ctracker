import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { CalendarDays, Scale, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import { db } from '../firebase'

const pad = (n) => String(n).padStart(2, '0')
const keyFor = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

function mostRecentMonday(date = new Date()) {
  const result = new Date(date)
  result.setHours(12, 0, 0, 0)
  const day = result.getDay()
  const diff = day === 0 ? 6 : day - 1
  result.setDate(result.getDate() - diff)
  return result
}

function nextMonday(date = new Date()) {
  const result = new Date(date)
  result.setHours(12, 0, 0, 0)
  const day = result.getDay()
  const daysUntil = day === 1 ? 0 : (8 - day) % 7 || 7
  result.setDate(result.getDate() + daysUntil)
  return result
}

function isMonday(dateKey) {
  if (!dateKey) return false
  return new Date(`${dateKey}T12:00:00`).getDay() === 1
}

export default function WeightTracker({ userId }) {
  const defaultMonday = useMemo(() => keyFor(mostRecentMonday()), [])
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(defaultMonday)
  const [entries, setEntries] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!userId) return undefined
    return onSnapshot(
      collection(db, 'users', userId, 'weights'),
      (snapshot) => {
        const next = snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .sort((a, b) => (b.dateKey || '').localeCompare(a.dateKey || ''))
        setEntries(next)
      },
      (err) => {
        console.error('Weight listener error:', err)
        setError('Could not load weight history. Publish the updated Firestore rules.')
      },
    )
  }, [userId])

  const latest = entries[0]
  const previous = entries[1]
  const change = latest && previous ? Number(latest.weight) - Number(previous.weight) : null
  const nextCheckIn = nextMonday()

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const clean = Number(weight)
    if (!Number.isFinite(clean) || clean < 50 || clean > 1000) {
      setError('Enter a weight between 50 and 1,000 lb.')
      return
    }
    if (!isMonday(date)) {
      setError('Weight check-ins are set for Mondays. Please choose a Monday.')
      return
    }
    if (entries.some((item) => item.dateKey === date)) {
      setError('You already logged a weight for that Monday. Delete the old one first if you want to replace it.')
      return
    }

    setSaving(true)
    try {
      await addDoc(collection(db, 'users', userId, 'weights'), {
        weight: Math.round(clean * 10) / 10,
        unit: 'lb',
        dateKey: date,
        createdAt: serverTimestamp(),
      })
      setWeight('')
      setSuccess('Monday weigh-in saved.')
    } catch (err) {
      console.error('Weight save error:', err)
      setError('Could not save your weight. Publish the updated Firestore rules and try again.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this weight check-in?')) return
    try {
      await deleteDoc(doc(db, 'users', userId, 'weights', id))
    } catch (err) {
      console.error(err)
      setError('Could not delete that weight check-in.')
    }
  }

  return (
    <section className="card weight-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">EVERY MONDAY</p>
          <h2>Weight check-in</h2>
        </div>
        <div className="weight-icon"><Scale size={20} /></div>
      </div>

      <div className="weight-summary">
        <div>
          <span>Latest weight</span>
          <strong>{latest ? `${Number(latest.weight).toFixed(1)} lb` : '—'}</strong>
        </div>
        <div>
          <span>Weekly change</span>
          <strong className={change === null ? '' : change <= 0 ? 'good-change' : 'up-change'}>
            {change === null ? '—' : (
              <>{change <= 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}{change > 0 ? '+' : ''}{change.toFixed(1)} lb</>
            )}
          </strong>
        </div>
      </div>

      <p className="weight-next">Next Monday: <strong>{nextCheckIn.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong></p>

      <form className="weight-form" onSubmit={submit}>
        <label>
          Weight (lb)
          <div className="calorie-input-wrap">
            <input
              type="number"
              min="50"
              max="1000"
              step="0.1"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="185.0"
              required
            />
            <span>lb</span>
          </div>
        </label>
        <label>
          Monday
          <div className="input-icon-wrap">
            <CalendarDays size={16} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </label>
        {error && <p className="form-error weight-form-message">{error}</p>}
        {success && <p className="form-success weight-form-message">{success}</p>}
        <button className="primary-btn" type="submit" disabled={saving}>
          <Scale size={17} /> {saving ? 'Saving…' : 'Save Monday weight'}
        </button>
      </form>

      {entries.length > 0 && (
        <div className="weight-history">
          <div className="weight-history-title">Recent weigh-ins</div>
          {entries.slice(0, 6).map((entry) => (
            <div className="weight-history-row" key={entry.id}>
              <div>
                <strong>{Number(entry.weight).toFixed(1)} lb</strong>
                <span>{new Date(`${entry.dateKey}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <button className="delete-btn" type="button" onClick={() => remove(entry.id)} aria-label={`Delete weight from ${entry.dateKey}`}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
