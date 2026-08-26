import { useState } from 'react'
import Modal from './Modal'

const empty = { nombre: '', email: '', password: '', rol: 'user' }

export default function UsuarioForm({ onSave, onClose, saving }) {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return setError('El nombre es obligatorio.')
    if (!form.email.trim()) return setError('El email es obligatorio.')
    if (!form.password || form.password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.')
    }
    setError('')
    try {
      await onSave(form)
    } catch (err) {
      setError(err.message || 'Ocurrió un error al crear el usuario.')
      console.error('Error al crear usuario:', err)
    }
  }

  return (
    <Modal title="Nuevo usuario" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nombre">
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => update('nombre', e.target.value)}
            placeholder="Ej: Ana Gómez"
            className="input"
            required
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="Ej: ana@empresa.com"
            className="input"
            required
          />
        </Field>

        <Field label="Contraseña">
          <input
            type="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="input"
            required
          />
        </Field>

        <Field label="Rol">
          <select value={form.rol} onChange={(e) => update('rol', e.target.value)} className="input">
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
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
            {saving ? 'Creando…' : 'Crear usuario'}
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
