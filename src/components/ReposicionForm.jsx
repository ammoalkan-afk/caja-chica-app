import { useState } from 'react'
import Modal from './Modal'
import { todayISO } from '../lib/format'

const empty = {
  fecha: todayISO(),
  concepto: 'Reposición de caja chica',
  monto: '',
  notas: '',
}

export default function ReposicionForm({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial ? { ...empty, ...initial } : empty)
  const [error, setError] = useState('')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.monto || Number(form.monto) <= 0) return setError('Ingresa un monto válido.')
    setError('')
    onSave({ ...form, monto: Number(form.monto) })
  }

  return (
    <Modal title={initial ? 'Editar reposición' : 'Registrar reposición'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha">
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => update('fecha', e.target.value)}
              className="input"
              required
            />
          </Field>
          <Field label="Monto">
            <input
              type="number"
              min="0"
              step="1"
              value={form.monto}
              onChange={(e) => update('monto', e.target.value)}
              placeholder="0"
              className="input"
              required
            />
          </Field>
        </div>

        <Field label="Concepto / origen">
          <input
            type="text"
            value={form.concepto}
            onChange={(e) => update('concepto', e.target.value)}
            placeholder="Ej: Depósito de gerencia"
            className="input"
          />
        </Field>

        <Field label="Notas (opcional)">
          <textarea
            value={form.notas}
            onChange={(e) => update('notas', e.target.value)}
            rows={2}
            className="input resize-none"
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
            {saving ? 'Guardando…' : 'Guardar reposición'}
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
