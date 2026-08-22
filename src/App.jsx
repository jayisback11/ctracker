import { useCallback, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { Flame, LogOut, UserRound } from 'lucide-react'
import { auth, db } from './firebase'
import AuthScreen from './components/AuthScreen'
import GoalCard from './components/GoalCard'
import AddEntry from './components/AddEntry'
import EntryList from './components/EntryList'
import History from './components/History'
import WeightTracker from './components/WeightTracker'

const pad = (n) => String(n).padStart(2, '0')
const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function App() {
  const [user, setUser] = useState(undefined)
  const [goal, setGoal] = useState(2000)
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [entries, setEntries] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  useEffect(() => {
    if (!user) return undefined
    const q = query(
      collection(db, 'users', user.uid, 'entries'),
      where('dateKey', '==', selectedDate),
    )
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const nextEntries = snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .sort((a, b) => (b.time || '').localeCompare(a.time || ''))
        setEntries(nextEntries)
      },
      (error) => console.error('Entry listener error:', error),
    )
    return unsubscribe
  }, [user, selectedDate, refreshKey])

  const consumed = useMemo(
    () => entries.reduce((sum, entry) => sum + (Number(entry.calories) || 0), 0),
    [entries],
  )

  const onAdded = useCallback(() => setRefreshKey((v) => v + 1), [])

  if (user === undefined) {
    return <div className="splash"><Flame size={28} /><span>CalTrack</span></div>
  }

  if (!user) return <AuthScreen />

  const selectedIsToday = selectedDate === todayKey()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark"><Flame size={22} /></div>
            <div><strong>CalTrack</strong><span>daily calorie tracker</span></div>
          </div>
          <div className="user-actions">
            <div className="user-pill"><UserRound size={15} /><span>{user.email}</span></div>
            <button className="logout-btn" type="button" onClick={() => signOut(auth)}><LogOut size={17} /><span>Log out</span></button>
          </div>
        </div>
      </header>

      <main className="dashboard">
        <section className="hero-copy">
          <p className="eyebrow">YOUR NUTRITION, SIMPLIFIED</p>
          <h1>{selectedIsToday ? 'Today’s calories.' : 'Daily history.'}</h1>
          <p>Log food in seconds and keep your daily intake synced across your devices.</p>
        </section>

        <History selectedDate={selectedDate} setSelectedDate={setSelectedDate} total={consumed} goal={goal} />

        <div className="dashboard-grid">
          <div className="left-column">
            <GoalCard
              userId={user.uid}
              selectedDate={selectedDate}
              consumed={consumed}
              goal={goal}
              setGoal={setGoal}
            />
            <WeightTracker userId={user.uid} />
            {selectedIsToday && <AddEntry userId={user.uid} onAdded={onAdded} />}
            {!selectedIsToday && (
              <section className="card history-note">
                <strong>Viewing a past or future day</strong>
                <p>Go back to today to add a new calorie entry. Your history remains available here.</p>
                <button className="secondary-btn" type="button" onClick={() => setSelectedDate(todayKey())}>Return to today</button>
              </section>
            )}
          </div>
          <EntryList entries={entries} userId={user.uid} selectedDate={selectedDate} />
        </div>
      </main>
    </div>
  )
}
