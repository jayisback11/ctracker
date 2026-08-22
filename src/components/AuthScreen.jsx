import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { Flame, LoaderCircle } from 'lucide-react'
import { auth } from '../firebase'

const messageForError = (error) => {
  const code = error?.code || ''
  if (code.includes('invalid-credential')) return 'Incorrect email or password.'
  if (code.includes('email-already-in-use')) return 'That email already has an account.'
  if (code.includes('weak-password')) return 'Password must be at least 6 characters.'
  if (code.includes('invalid-email')) return 'Enter a valid email address.'
  return error?.message || 'Something went wrong. Please try again.'
}

export default function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email.trim(), password)
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      }
    } catch (err) {
      setError(messageForError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand brand-center">
          <div className="brand-mark"><Flame size={24} /></div>
          <div>
            <strong>CalTrack</strong>
            <span>simple calorie logging</span>
          </div>
        </div>

        <div className="auth-heading">
          <p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}</p>
          <h1>{mode === 'login' ? 'Track today.' : 'Start tracking.'}</h1>
          <p>Set a daily goal, log meals, and keep every entry synced with Firebase.</p>
        </div>

        <form onSubmit={submit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6+ characters"
              minLength={6}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading && <LoaderCircle className="spin" size={18} />}
            {mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <button
          className="text-btn"
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError('')
          }}
        >
          {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}
        </button>
      </section>
    </main>
  )
}
