import { useEffect, useState } from 'react'
import { Plus, RefreshCcw as RefreshIcon } from 'lucide-react'
import { fetchGastos, createGasto, updateGasto, deleteGasto, fetchReposiciones } from '../lib/data'
import GastosTable from '../components/GastosTable'
import GastoForm from '../components/GastoForm'
import ConfirmDialog from '../components/ConfirmDialog'
import SummaryStrip from '../components/SummaryStrip'

export default function Gastos() {
  const [gastos, setGastos] = useState([])
  const [totalIngresos, setTotalIngresos] = useState(0)
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
      const [g, r] = await Promise.all([fetchGastos(), fetchReposiciones()])
      setGastos(g)
      setTotalIngresos(r.reduce((sum, x) => sum + Number(x.monto), 0))
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

  const totalEgresos = gastos.reduce((sum, g) => sum + Number(g.monto), 0)

  async function handleSave(values) {
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateGasto(editing.id, values)
        setGastos((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
      } else {
        const created = await createGasto(values)
        setGastos((prev) => [created, ...prev])
      }
      setShowForm(false)
      setEditing(null)
    } catch (err) {
      alert('Ocurrió un error al guardar el gasto.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteGasto(toDelete.id)
      setGastos((prev) => prev.filter((g) => g.id !== toDelete.id))
      setToDelete(null)
    } catch (err) {
      alert('Ocurrió un error al eliminar el gasto.')
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Gastos</h1>
          <p className="text-sm text-ink-muted">Registra y consulta los gastos de la caja chica.</p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-accent-500/30 hover:opacity-90"
        >
          <Plus size={16} />
          Nuevo gasto
        </button>
      </div>

      <SummaryStrip totalIngresos={totalIngresos} totalEgresos={totalEgresos} />

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-900">Todos los gastos</h2>
          <button onClick={load} className="flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink-900">
            <RefreshIcon size={13} />
            Actualizar
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-coral-500">{error}</p>}
        {loading ? (
          <p className="py-10 text-center text-sm text-ink-muted">Cargando…</p>
        ) : (
          <GastosTable
            gastos={gastos}
            onEdit={(g) => {
              setEditing(g)
              setShowForm(true)
            }}
            onDelete={(g) => setToDelete(g)}
          />
        )}
      </div>

      {showForm && (
        <GastoForm
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
          title="Eliminar gasto"
          message={`¿Seguro que quieres eliminar "${toDelete.concepto}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
