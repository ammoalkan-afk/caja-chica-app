import { UserRound } from 'lucide-react'

export default function UsuariosTable({ usuarios }) {
  if (usuarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <UserRound size={28} className="text-ink-muted" />
        <p className="text-sm font-medium text-ink-900">Todavía no hay usuarios</p>
        <p className="text-sm text-ink-muted">Creá el primer usuario del equipo.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="text-left text-xs font-medium uppercase tracking-wide text-ink-muted">
            <th className="pb-3 pr-4">Nombre</th>
            <th className="pb-3 pr-4">Email</th>
            <th className="pb-3 pr-2">Rol</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-100">
          {usuarios.map((u) => (
            <tr key={u.id} className="hover:bg-sand-50/60">
              <td className="py-3 pr-4 font-medium text-ink-900">{u.nombre || '—'}</td>
              <td className="py-3 pr-4 text-ink-muted">{u.email}</td>
              <td className="py-3 pr-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    u.rol === 'admin' ? 'bg-accent-100 text-accent-700' : 'bg-lime-100 text-ink-800'
                  }`}
                >
                  {u.rol === 'admin' ? 'Admin' : 'Usuario'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
