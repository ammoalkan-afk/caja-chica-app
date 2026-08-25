import { NavLink } from 'react-router-dom'
import { Wallet, Receipt, RefreshCcw } from 'lucide-react'

const navItems = [
  { to: '/gastos', label: 'Gastos', icon: Receipt },
  { to: '/reposiciones', label: 'Reposiciones', icon: RefreshCcw },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 shrink-0 flex-col bg-ink-900 text-white/90 p-5">
      <div className="flex items-center gap-2 px-2 pb-8 pt-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-500/15">
          <Wallet size={18} className="text-lime-400" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">Caja Chica</span>
      </div>

      <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
        Menú
      </p>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors border-l-2 ${
                isActive
                  ? 'bg-white/10 text-white border-lime-400'
                  : 'text-white/60 border-transparent hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-lg px-2 py-3 border-t border-white/10 pt-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-500/20 text-sm font-semibold text-lime-300">
          CC
        </div>
        <div className="leading-tight">
          <p className="text-sm font-medium text-white">Tu caja chica</p>
          <p className="text-xs text-white/40">Sin autenticación</p>
        </div>
      </div>
    </aside>
  )
}
