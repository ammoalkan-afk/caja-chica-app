import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, loading, signIn, inactiveMessage } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    return <Navigate to="/gastos" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate('/gastos', { replace: true })
    } catch (err) {
      setError('Email o contraseña incorrectos.')
      console.error('Error al iniciar sesión:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-canvas-bg flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl shadow-indigo-200/40">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-sm shadow-accent-500/30">
            <Wallet size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-ink-900">Caja Chica</h1>
          <p className="text-sm text-ink-muted">Iniciá sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              autoFocus
              required
            />
          </Field>
          <Field label="Contraseña">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </Field>

          {(error || inactiveMessage) && <p className="text-sm text-coral-500">{error || inactiveMessage}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-accent-500/30 hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  )
}
