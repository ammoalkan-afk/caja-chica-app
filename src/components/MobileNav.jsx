import { NavLink } from 'react-router-dom'
import { Receipt, RefreshCcw } from 'lucide-react'

const navItems = [
  { to: '/gastos', label: 'Gastos', icon: Receipt },
  { to: '/reposiciones', label: 'Reposiciones', icon: RefreshCcw },
]

export default function MobileNav() {
  return (
    <nav className="md:hidden flex border-b border-sand-100 bg-white px-2">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-medium ${
              isActive ? 'border-accent-500 text-accent-700' : 'border-transparent text-ink-muted'
            }`
          }
        >
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
