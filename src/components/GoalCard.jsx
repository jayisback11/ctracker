import { useEffect, useState } from 'react'
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { Check, Pencil, Target, X } from 'lucide-react'
import { db } from '../firebase'

export default function GoalCard({
  userId,
  selectedDate,
  consumed,
  goal,
  setGoal,
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(goal || 2000))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    setDraft(String(goal || 2000))
  }, [goal])

  useEffect(() => {
    if (!userId || !selectedDate) return undefined

    setError('')
    setSavedMessage('')

    const dailyGoalRef = doc(
      db,
      'users',
      userId,
      'dailyGoals',
      selectedDate
    )

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
          const userSnap = await getDoc(
            doc(db, 'users', userId)
          )

          const oldGoal = Number(
            userSnap.data()?.dailyGoal
          )

          setGoal(oldGoal > 0 ? oldGoal : 2000)
        } catch (err) {
          console.error(
            'Goal fallback error:',
            err
          )

          setGoal(2000)
        }
      },
      (err) => {
        console.error(
          'Daily goal listener error:',
          err
        )

        setError(
          'Could not load this day’s calorie goal.'
        )
      }
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

    if (
      !Number.isFinite(clean) ||
      clean < 1 ||
      clean > 20000
    ) {
      setError(
        'Enter a calorie goal between 1 and 20,000.'
      )

      return
    }

    setSaving(true)

    try {
      await setDoc(
        doc(
          db,
          'users',
          userId,
          'dailyGoals',
          selectedDate
        ),
        {
          goal: clean,
          dateKey: selectedDate,
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      )

      setGoal(clean)
      setDraft(String(clean))
      setEditing(false)

      setSavedMessage(
        `Goal changed to ${clean.toLocaleString()} calories.`
      )
    } catch (err) {
      console.error(
        'Daily goal save error:',
        err
      )

      setError(
        'Could not save goal. Check your Firestore rules.'
      )
    } finally {
      setSaving(false)
    }
  }

  const remaining = Math.max(
    goal - consumed,
    0
  )

  const over = Math.max(
    consumed - goal,
    0
  )

  const percent = Math.min(
    (consumed / Math.max(goal, 1)) * 100,
    100
  )

  return (
    <section className="goal-card card">
      <div className="card-topline">
        <div className="icon-title">
          <Target size={18} />

          <span>
            Calorie goal for this day
          </span>
        </div>

        {!editing && (
          <button
            className="small-action-btn"
            type="button"
            onClick={startEditing}
          >
            <Pencil size={15} />

            Change goal
          </button>
        )}
      </div>

      {editing ? (
        <form
          className="goal-edit-form"
          onSubmit={save}
        >
          <label>
            Calories for {selectedDate}

            <div className="goal-edit-row">
              <input
                type="number"
                min="1"
                max="20000"
                step="1"
                inputMode="numeric"
                value={draft}
                onChange={(e) =>
                  setDraft(e.target.value)
                }
                autoFocus
              />

              <span>cal/day</span>
            </div>
          </label>

          <div className="goal-edit-actions">
            <button
              className="primary-btn compact-btn"
              type="submit"
              disabled={saving}
            >
              <Check size={16} />

              {saving
                ? 'Saving...'
                : 'Save goal'}
            </button>

            <button
              className="secondary-btn compact-btn"
              type="button"
              onClick={cancelEditing}
              disabled={saving}
            >
              <X size={16} />

              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="goal-number">
          {goal.toLocaleString()}

          <span> cal/day</span>
        </div>
      )}

      {error && (
        <p className="form-error goal-message">
          {error}
        </p>
      )}

      {savedMessage && (
        <p className="form-success goal-message">
          {savedMessage}
        </p>
      )}

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${percent}%`,
          }}
        />
      </div>

      <div className="goal-stats">
        <div>
          <strong>
            {consumed.toLocaleString()}
          </strong>

          <span>eaten</span>
        </div>

        <div>
          <strong>
            {over > 0
              ? `+${over.toLocaleString()}`
              : remaining.toLocaleString()}
          </strong>

          <span>
            {over > 0
              ? 'over goal'
              : 'remaining'}
          </span>
        </div>

        <div>
          <strong>
            {Math.round(
              (consumed /
                Math.max(goal, 1)) *
                100
            )}
            %
          </strong>

          <span>used</span>
        </div>
      </div>
    </section>
  )
}