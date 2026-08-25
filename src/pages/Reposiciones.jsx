import { useEffect, useState } from 'react'
import { Plus, RefreshCcw as RefreshIcon } from 'lucide-react'
import { fetchReposiciones, createReposicion, updateReposicion, deleteReposicion, fetchGastos } from '../lib/data'
import ReposicionesTable from '../components/ReposicionesTable'
import ReposicionForm from '../components/ReposicionForm'
import ConfirmDialog from '../components/ConfirmDialog'
import SummaryStrip from '../components/SummaryStrip'

export default function Reposiciones() {
  const [reposiciones, setReposiciones] = useState([])
  const [totalEgresos, setTotalEgresos] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [r, g] = await Promise.all([fetchReposiciones(), fetchGastos()])
      setReposiciones(r)
      setTotalEgresos(g.reduce((sum, x) => sum + Number(x.monto), 0))
    } catch (err) {
      setError('No se pudieron cargar los datos. Verifica tu conexión a Supabase.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const totalIngresos = reposiciones.reduce((sum, r) => sum + Number(r.monto), 0)

  async function handleSave(values) {
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateReposicion(editing.id, values)
        setReposiciones((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      } else {
        const created = await createReposicion(values)
        setReposiciones((prev) => [created, ...prev])
      }
      setShowForm(false)
      setEditing(null)
    } catch (err) {
      alert('Ocurrió un error al guardar la reposición.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteReposicion(toDelete.id)
      setReposiciones((prev) => prev.filter((r) => r.id !== toDelete.id))
      setToDelete(null)
    } catch (err) {
      alert('Ocurrió un error al eliminar la reposición.')
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Reposiciones</h1>
          <p className="text-sm text-ink-muted">Registra los ingresos que reponen la caja chica.</p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-accent-500/30 hover:opacity-90"
        >
          <Plus size={16} />
          Nueva reposición
        </button>
      </div>

      <SummaryStrip totalIngresos={totalIngresos} totalEgresos={totalEgresos} />

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-900">Todas las reposiciones</h2>
          <button onClick={load} className="flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink-900">
            <RefreshIcon size={13} />
            Actualizar
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-coral-500">{error}</p>}
        {loading ? (
          <p className="py-10 text-center text-sm text-ink-muted">Cargando…</p>
        ) : (
          <ReposicionesTable
            reposiciones={reposiciones}
            onEdit={(r) => {
              setEditing(r)
              setShowForm(true)
            }}
            onDelete={(r) => setToDelete(r)}
          />
        )}
      </div>

      {showForm && (
        <ReposicionForm
          initial={editing}
          saving={saving}
          onClose={() => {
            setShowForm(false)
            setEditing(null)
          }}
          onSave={handleSave}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Eliminar reposición"
          message={`¿Seguro que quieres eliminar esta reposición de ${toDelete.concepto}? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
