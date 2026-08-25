import { Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { formatMoney } from '../lib/format'

export default function SummaryStrip({ totalIngresos, totalEgresos }) {
  const saldo = totalIngresos - totalEgresos

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl bg-ink-900 p-5 text-white shadow-sm">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Wallet size={16} className="text-lime-400" />
          Saldo actual
        </div>
        <p className="mt-3 text-2xl font-extrabold tracking-tight">{formatMoney(saldo)}</p>
        <p className="mt-1 text-xs text-white/40">Reposiciones − Gastos</p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-muted">Total ingresos</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-100">
            <ArrowDownCircle size={16} className="text-lime-600" />
          </span>
        </div>
        <p className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900">{formatMoney(totalIngresos)}</p>
        <p className="mt-1 text-xs text-ink-muted">Reposiciones registradas</p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-muted">Total egresos</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral-100">
            <ArrowUpCircle size={16} className="text-coral-500" />
          </span>
        </div>
        <p className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900">{formatMoney(totalEgresos)}</p>
        <p className="mt-1 text-xs text-ink-muted">Gastos registrados</p>
      </div>
    </div>
  )
}
