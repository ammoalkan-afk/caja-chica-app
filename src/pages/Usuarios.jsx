import { useEffect, useState } from 'react'
import { Plus, RefreshCcw as RefreshIcon } from 'lucide-react'
import { fetchUsuarios, createUsuario, gestionarUsuario } from '../lib/data'
import { useAuth } from '../context/AuthContext'
import UsuariosTable from '../components/UsuariosTable'
import UsuarioForm from '../components/UsuarioForm'
import CambiarPasswordForm from '../components/CambiarPasswordForm'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Usuarios() {
  const { user } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [passwordTarget, setPasswordTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionSaving, setActionSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchUsuarios()
      setUsuarios(data)
    } catch (err) {
      setError('No se pudieron cargar los usuarios.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(values) {
    setSaving(true)
    try {
      const created = await createUsuario(values)
      setUsuarios((prev) => [...prev, created].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '')))
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActivo(usuario) {
    const accion = usuario.activo !== false ? 'desactivar' : 'reactivar'
    try {
      const updated = await gestionarUsuario({ accion, userId: usuario.id })
      setUsuarios((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } catch (err) {
      alert('Ocurrió un error al actualizar el estado del usuario.')
      console.error(err)
    }
  }

  async function handleChangePassword(password) {
    setActionSaving(true)
    try {
      await gestionarUsuario({ accion: 'cambiar_password', userId: passwordTarget.id, password })
      setPasswordTarget(null)
    } finally {
      setActionSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await gestionarUsuario({ accion: 'eliminar', userId: deleteTarget.id })
      setUsuarios((prev) => prev.filter((u) => u.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      alert('Ocurrió un error al eliminar el usuario.')
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Usuarios</h1>
          <p className="text-sm text-ink-muted">Administrá quién puede acceder a la caja chica.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-accent-500/30 hover:opacity-90"
        >
          <Plus size={16} />
          Nuevo usuario
        </button>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-900">Todos los usuarios</h2>
          <button onClick={load} className="flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink-900">
            <RefreshIcon size={13} />
            Actualizar
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-coral-500">{error}</p>}
        {loading ? (
          <p className="py-10 text-center text-sm text-ink-muted">Cargando…</p>
        ) : (
          <UsuariosTable
            usuarios={usuarios}
            currentUserId={user?.id}
            onToggleActivo={handleToggleActivo}
            onChangePassword={(u) => setPasswordTarget(u)}
            onDelete={(u) => setDeleteTarget(u)}
          />
        )}
      </div>

      {showForm && <UsuarioForm saving={saving} onClose={() => setShowForm(false)} onSave={handleCreate} />}

      {passwordTarget && (
        <CambiarPasswordForm
          usuario={passwordTarget}
          saving={actionSaving}
          onClose={() => setPasswordTarget(null)}
          onSave={handleChangePassword}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar usuario"
          message={`¿Seguro que quieres eliminar a "${deleteTarget.nombre || deleteTarget.email}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
