import { ChevronLeft, ChevronRight } from 'lucide-react'

const pad = (n) => String(n).padStart(2, '0')
const keyFor = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export default function History({ selectedDate, setSelectedDate, total, consumed = 0, burned = 0, goal }) {
  const date = new Date(`${selectedDate}T12:00:00`)
  const move = (amount) => {
    const next = new Date(date)
    next.setDate(next.getDate() + amount)
    setSelectedDate(keyFor(next))
  }

  const label = date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <section className="date-navigator">
      <button className="date-arrow" type="button" onClick={() => move(-1)} aria-label="Previous day"><ChevronLeft size={20} /></button>
      <div>
        <strong>{label}</strong>
        <span>
          {total.toLocaleString()} net / {goal.toLocaleString()} goal
          {burned > 0 ? ` • ${consumed.toLocaleString()} food − ${burned.toLocaleString()} workout` : ''}
        </span>
      </div>
      <button className="date-arrow" type="button" onClick={() => move(1)} aria-label="Next day"><ChevronRight size={20} /></button>
    </section>
  )
}
