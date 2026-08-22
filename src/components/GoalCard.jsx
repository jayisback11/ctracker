import { useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { Check, Dumbbell, Pencil, Target, X } from 'lucide-react'
import { db } from '../firebase'

export default function GoalCard({ userId, selectedDate, consumed, burned = 0, goal, setGoal }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(goal || 2000))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => setDraft(String(goal || 2000)), [goal])

  useEffect(() => {
    if (!userId || !selectedDate) return undefined

    setError('')
    setSavedMessage('')

    const dailyGoalRef = doc(db, 'users', userId, 'dailyGoals', selectedDate)

    return onSnapshot(
      dailyGoalRef,
      async (snap) => {
        if (snap.exists()) {
          const savedGoal = Number(snap.data()?.goal)
          if (savedGoal > 0) {
            setGoal(savedGoal)
            return
          }
        }

        try {
          const userSnap = await getDoc(doc(db, 'users', userId))
          const legacyGoal = Number(userSnap.data()?.dailyGoal)
          setGoal(legacyGoal > 0 ? legacyGoal : 2000)
        } catch (err) {
          console.error('Fallback goal load error:', err)
          setGoal(2000)
        }
      },
      (err) => {
        console.error('Daily goal listener error:', err)
        setError('Could not load this day’s calorie goal from Firebase.')
      },
    )
  }, [userId, selectedDate, setGoal])

  const startEditing = () => {
    setDraft(String(goal || 2000))
    setError('')
    setSavedMessage('')
    setEditing(true)
  }

  const cancelEditing = () => {
    setDraft(String(goal || 2000))
    setError('')
    setEditing(false)
  }

  const save = async (event) => {
    event?.preventDefault()
    setError('')
    setSavedMessage('')

    const clean = Math.round(Number(draft))
    if (!Number.isFinite(clean) || clean < 1 || clean > 20000) {
      setError('Enter a daily goal between 1 and 20,000 calories.')
      return
    }

    setSaving(true)

    try {
      await setDoc(
        doc(db, 'users', userId, 'dailyGoals', selectedDate),
        {
          goal: clean,
          dateKey: selectedDate,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )

      setGoal(clean)
      setDraft(String(clean))
      setEditing(false)
      setSavedMessage(`Daily goal updated to ${clean.toLocaleString()} calories.`)
    } catch (err) {
      console.error('Daily goal save error:', err)
      setError('Could not save this day’s goal. Check your Firebase connection and Firestore rules.')
    } finally {
      setSaving(false)
    }
  }

  const netCalories = Math.max(consumed - burned, 0)
  const remaining = Math.max(goal - netCalories, 0)
  const over = Math.max(netCalories - goal, 0)
  const isOver = netCalories > goal
  const percent = Math.min((netCalories / Math.max(goal, 1)) * 100, 100)

  return (
    <section className={`goal-card calorie-balance-card card${isOver ? ' is-over' : ''}`}>
      <div className="card-topline calorie-balance-topline">
        <div className="icon-title">
          <Target size={18} />
          <span>Calories for this day</span>
        </div>

        {!editing && (
          <button className="small-action-btn" type="button" onClick={startEditing}>
            <Pencil size={15} />
            Change goal
          </button>
        )}
      </div>

      {!editing && (
        <div className="calorie-balance-hero">
          <p className="calorie-balance-kicker">{isOver ? 'YOU ARE OVER BY' : 'YOU HAVE'}</p>
          <div className="calorie-balance-number">
            {isOver ? over.toLocaleString() : remaining.toLocaleString()}
          </div>
          <p className="calorie-balance-label">{isOver ? 'calories over' : 'calories left'}</p>
          <p className="calorie-balance-meta">
            <strong>{consumed.toLocaleString()}</strong> eaten
            <span aria-hidden="true">•</span>
            <strong className="burned-inline"><Dumbbell size={13} /> {burned.toLocaleString()}</strong> burned
            <span aria-hidden="true">•</span>
            <strong>{goal.toLocaleString()}</strong> goal
          </p>
        </div>
      )}

      {editing && (
        <form className="goal-edit-form goal-edit-panel" onSubmit={save}>
          <div className="goal-edit-heading">
            <strong>Change daily goal</strong>
            <span>This goal is saved for {selectedDate}.</span>
          </div>

          <label>
            Calories
            <div className="goal-edit-row">
              <input
                type="number"
                min="1"
                max="20000"
                step="1"
                inputMode="numeric"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
                aria-label="Daily calorie goal"
              />
              <span>cal/day</span>
            </div>
          </label>

          <div className="goal-edit-actions">
            <button className="primary-btn compact-btn" type="submit" disabled={saving}>
              <Check size={16} />
              {saving ? 'Saving…' : 'Save goal'}
            </button>
            <button className="secondary-btn compact-btn" type="button" onClick={cancelEditing} disabled={saving}>
              <X size={16} />
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && <p className="form-error goal-message">{error}</p>}
      {savedMessage && <p className="form-success goal-message">{savedMessage}</p>}

      <div className="progress-track calorie-balance-progress">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>

      <div className="goal-stats calorie-balance-stats four-stats">
        <div>
          <strong>{consumed.toLocaleString()}</strong>
          <span>food</span>
        </div>
        <div>
          <strong className="burned-stat">-{burned.toLocaleString()}</strong>
          <span>workout</span>
        </div>
        <div>
          <strong>{netCalories.toLocaleString()}</strong>
          <span>net</span>
        </div>
        <div>
          <strong>{goal.toLocaleString()}</strong>
          <span>goal</span>
        </div>
      </div>
    </section>
  )
}
