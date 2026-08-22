import { useState } from 'react'
import { deleteDoc, doc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore'
import { Check, Clock3, Pencil, Trash2, Utensils, X } from 'lucide-react'
import { db } from '../firebase'

export default function EntryList({ entries, userId, selectedDate }) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState({ food: '', calories: '', time: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const remove = async (id) => {
    if (!window.confirm('Delete this calorie entry?')) return
    try {
      await deleteDoc(doc(db, 'users', userId, 'entries', id))
    } catch (err) {
      console.error(err)
      setError('Could not delete that entry.')
    }
  }

  const startEdit = (entry) => {
    setEditingId(entry.id)
    setDraft({
      food: entry.food || '',
      calories: String(entry.calories || ''),
      time: entry.time || '12:00',
    })
    setError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setError('')
  }

  const saveEdit = async (entry) => {
    const calories = Math.round(Number(draft.calories))
    if (!draft.food.trim()) return setError('Food name cannot be empty.')
    if (!Number.isFinite(calories) || calories < 1) return setError('Calories must be greater than 0.')
    if (!/^\d{2}:\d{2}$/.test(draft.time)) return setError('Choose a valid time.')

    const eatenAt = new Date(`${entry.dateKey || selectedDate}T${draft.time}:00`)
    if (Number.isNaN(eatenAt.getTime())) return setError('Choose a valid time.')

    setSaving(true)
    setError('')
    try {
      await updateDoc(doc(db, 'users', userId, 'entries', entry.id), {
        food: draft.food.trim(),
        calories,
        time: draft.time,
        eatenAt: Timestamp.fromDate(eatenAt),
        updatedAt: serverTimestamp(),
      })
      setEditingId(null)
    } catch (err) {
      console.error(err)
      setError('Could not update that calorie entry.')
    } finally {
      setSaving(false)
    }
  }

  const isToday = selectedDate === localDateKey(new Date())

  return (
    <section className="card entries-card">
      <div className="section-heading entries-heading">
        <div>
          <p className="eyebrow">{isToday ? 'TODAY' : 'SELECTED DAY'}</p>
          <h2>Food log</h2>
        </div>
        <span className="entry-count">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
      </div>

      {error && <p className="form-error entry-error">{error}</p>}

      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Utensils size={22} /></div>
          <strong>No food logged yet</strong>
          <p>Add your first meal. Example: Chicken breast — 240 calories.</p>
        </div>
      ) : (
        <div className="entry-list">
          {entries.map((entry) => (
            <article className={`entry-row ${editingId === entry.id ? 'entry-row-editing' : ''}`} key={entry.id}>
              {editingId === entry.id ? (
                <div className="entry-edit-form">
                  <label>
                    Food
                    <input value={draft.food} onChange={(e) => setDraft((v) => ({ ...v, food: e.target.value }))} />
                  </label>
                  <div className="entry-edit-grid">
                    <label>
                      Calories
                      <input type="number" min="1" inputMode="numeric" value={draft.calories} onChange={(e) => setDraft((v) => ({ ...v, calories: e.target.value }))} />
                    </label>
                    <label>
                      Time
                      <input type="time" value={draft.time} onChange={(e) => setDraft((v) => ({ ...v, time: e.target.value }))} />
                    </label>
                  </div>
                  <div className="entry-edit-actions">
                    <button className="primary-btn compact-btn" type="button" disabled={saving} onClick={() => saveEdit(entry)}>
                      <Check size={16} /> {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button className="secondary-btn compact-btn" type="button" disabled={saving} onClick={cancelEdit}>
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="entry-main">
                    <strong>{entry.food}</strong>
                    <span><Clock3 size={13} /> {formatTime(entry.time)}</span>
                  </div>
                  <div className="entry-right">
                    <strong>{Number(entry.calories).toLocaleString()} <span>cal</span></strong>
                    <button className="edit-entry-btn" type="button" onClick={() => startEdit(entry)} aria-label={`Edit ${entry.food}`}>
                      <Pencil size={16} />
                    </button>
                    <button className="delete-btn" type="button" onClick={() => remove(entry.id)} aria-label={`Delete ${entry.food}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
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

function localDateKey(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
