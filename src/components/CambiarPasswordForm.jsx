import { useState } from 'react'
import Modal from './Modal'

export default function CambiarPasswordForm({ usuario, onSave, onClose, saving }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!password || password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    if (password !== confirmPassword) return setError('Las contraseñas no coinciden.')
    setError('')
    try {
      await onSave(password)
    } catch (err) {
      setError(err.message || 'Ocurrió un error al cambiar la contraseña.')
      console.error('Error al cambiar contraseña:', err)
    }
  }

  return (
    <Modal title={`Cambiar contraseña de ${usuario.nombre || usuario.email}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nueva contraseña">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="input"
            autoFocus
            required
          />
        </Field>

        <Field label="Confirmar contraseña">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input"
            required
          />
        </Field>

        {error && <p className="text-sm text-coral-500">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-ink-900 hover:bg-sand-100">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-accent-500/30 hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Guardando…' : 'Cambiar contraseña'}
          </button>
        </div>
      </form>
    </Modal>
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
