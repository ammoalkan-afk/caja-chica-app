import { useEffect, useState } from 'react'
import { Plus, RefreshCcw as RefreshIcon } from 'lucide-react'
import { fetchUsuarios, createUsuario } from '../lib/data'
import UsuariosTable from '../components/UsuariosTable'
import UsuarioForm from '../components/UsuarioForm'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

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
          <UsuariosTable usuarios={usuarios} />
        )}
      </div>

      {showForm && <UsuarioForm saving={saving} onClose={() => setShowForm(false)} onSave={handleCreate} />}
    </div>
  )
}
