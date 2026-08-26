import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Wallet, Receipt, RefreshCcw, Users, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/gastos', label: 'Gastos', icon: Receipt },
  { to: '/reposiciones', label: 'Reposiciones', icon: RefreshCcw },
]

export default function MobileNav() {
  const { user, perfil, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const isAdmin = perfil?.rol === 'admin'
  const items = isAdmin ? [...navItems, { to: '/usuarios', label: 'Usuarios', icon: Users }] : navItems
  const displayName = perfil?.nombre || user?.email || ''
  const initials = displayName.slice(0, 2).toUpperCase() || 'CC'

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-sand-100 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-sm shadow-accent-500/30">
            <Wallet size={16} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-ink-900">Caja Chica</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted hover:bg-sand-50 hover:text-ink-900"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className={`fixed inset-0 z-50 md:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col bg-white p-5 shadow-xl transition-transform duration-300 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between pb-8 pt-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-sm shadow-accent-500/30">
                <Wallet size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-ink-900">Caja Chica</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted hover:bg-sand-50 hover:text-ink-900"
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
          </div>

          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Menú</p>
          <nav className="flex flex-col gap-1">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-accent-100 text-accent-700' : 'text-ink-muted hover:bg-sand-50 hover:text-ink-900'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto flex items-center gap-3 rounded-xl border-t border-sand-100 px-2 py-3 pt-4">
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
        </div>
      </div>
    </>
  )
}
