import { Pencil, Trash2, Receipt } from 'lucide-react'
import { formatMoney, formatDate } from '../lib/format'

export default function GastosTable({ gastos, onEdit, onDelete }) {
  if (gastos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <Receipt size={28} className="text-ink-muted" />
        <p className="text-sm font-medium text-ink-900">Todavía no hay gastos</p>
        <p className="text-sm text-ink-muted">Registra el primer gasto de tu caja chica.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="text-left text-xs font-medium uppercase tracking-wide text-ink-muted">
            <th className="pb-3 pr-4">Fecha</th>
            <th className="pb-3 pr-4">Concepto</th>
            <th className="pb-3 pr-4">Categoría</th>
            <th className="pb-3 pr-4">Proveedor</th>
            <th className="pb-3 pr-4">Pago</th>
            <th className="pb-3 pr-4 text-right">Monto</th>
            <th className="pb-3 pr-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-100">
          {gastos.map((g) => (
            <tr key={g.id} className="hover:bg-sand-50/60">
              <td className="py-3 pr-4 whitespace-nowrap text-ink-muted">{formatDate(g.fecha)}</td>
              <td className="py-3 pr-4 font-medium text-ink-900">{g.concepto}</td>
              <td className="py-3 pr-4">
                {g.categoria ? (
                  <span className="rounded-full bg-lime-100 px-2.5 py-0.5 text-xs font-medium text-ink-800">
                    {g.categoria}
                  </span>
                ) : (
                  <span className="text-ink-muted">—</span>
                )}
              </td>
              <td className="py-3 pr-4 text-ink-muted">{g.proveedor || '—'}</td>
              <td className="py-3 pr-4 text-ink-muted">{g.metodo_pago || '—'}</td>
              <td className="py-3 pr-4 text-right font-semibold text-ink-900 whitespace-nowrap">
                {formatMoney(g.monto)}
              </td>
              <td className="py-3 pr-2">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => onEdit(g)}
                    className="rounded-lg p-1.5 text-ink-muted hover:bg-sand-100 hover:text-ink-900"
                    aria-label="Editar"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(g)}
                    className="rounded-lg p-1.5 text-ink-muted hover:bg-coral-100 hover:text-coral-500"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
