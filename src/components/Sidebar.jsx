import { NavLink, useNavigate } from 'react-router-dom'
import { Wallet, Receipt, RefreshCcw, Users, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/gastos', label: 'Gastos', icon: Receipt },
  { to: '/reposiciones', label: 'Reposiciones', icon: RefreshCcw },
]

const linkClass = ({ isActive }) =>
  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-accent-100 text-accent-700' : 'text-ink-muted hover:bg-sand-50 hover:text-ink-900'
  }`

export default function Sidebar() {
  const { user, perfil, signOut } = useAuth()
  const navigate = useNavigate()
  const isAdmin = perfil?.rol === 'admin'
  const displayName = perfil?.nombre || user?.email || ''
  const initials = displayName.slice(0, 2).toUpperCase() || 'CC'

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

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
          <NavLink key={to} to={to} className={linkClass}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink to="/usuarios" className={linkClass}>
            <Users size={18} />
            Usuarios
          </NavLink>
        )}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-xl px-2 py-3 border-t border-sand-100 pt-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-accent-600 text-sm font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium text-ink-900">{displayName}</p>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1 text-xs text-ink-muted hover:text-coral-500"
          >
            <LogOut size={12} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  )
}
