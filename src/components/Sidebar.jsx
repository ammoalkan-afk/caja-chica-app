import { NavLink } from 'react-router-dom'
import { Wallet, Receipt, RefreshCcw } from 'lucide-react'

const navItems = [
  { to: '/gastos', label: 'Gastos', icon: Receipt },
  { to: '/reposiciones', label: 'Reposiciones', icon: RefreshCcw },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 shrink-0 flex-col bg-white p-5">
      <div className="flex items-center gap-2 px-2 pb-8 pt-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-sm shadow-accent-500/30">
          <Wallet size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-ink-900">Caja Chica</span>
      </div>

      <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        Menú
      </p>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent-100 text-accent-700'
                  : 'text-ink-muted hover:bg-sand-50 hover:text-ink-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-xl px-2 py-3 border-t border-sand-100 pt-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-accent-600 text-sm font-semibold text-white">
          CC
        </div>
        <div className="leading-tight">
          <p className="text-sm font-medium text-ink-900">Tu caja chica</p>
          <p className="text-xs text-ink-muted">Sin autenticación</p>
        </div>
      </div>
    </aside>
  )
}
