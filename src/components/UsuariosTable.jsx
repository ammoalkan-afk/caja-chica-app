import { KeyRound, ShieldCheck, ShieldOff, Trash2, UserRound } from 'lucide-react'

export default function UsuariosTable({ usuarios, currentUserId, onToggleActivo, onChangePassword, onDelete }) {
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
      <table className="w-full min-w-[620px] text-sm">
        <thead>
          <tr className="text-left text-xs font-medium uppercase tracking-wide text-ink-muted">
            <th className="pb-3 pr-4">Nombre</th>
            <th className="pb-3 pr-4">Email</th>
            <th className="pb-3 pr-4">Rol</th>
            <th className="pb-3 pr-4">Estado</th>
            <th className="pb-3 pr-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-100">
          {usuarios.map((u) => {
            const isSelf = u.id === currentUserId
            const activo = u.activo !== false
            return (
              <tr key={u.id} className="hover:bg-sand-50/60">
                <td className="py-3 pr-4 font-medium text-ink-900">{u.nombre || '—'}</td>
                <td className="py-3 pr-4 text-ink-muted">{u.email}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.rol === 'admin' ? 'bg-accent-100 text-accent-700' : 'bg-lime-100 text-ink-800'
                    }`}
                  >
                    {u.rol === 'admin' ? 'Admin' : 'Usuario'}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      activo ? 'bg-lime-100 text-lime-700' : 'bg-sand-100 text-ink-muted'
                    }`}
                  >
                    {activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="py-3 pr-2">
                  {!isSelf && (
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onToggleActivo(u)}
                        className="rounded-lg p-1.5 text-ink-muted hover:bg-sand-100 hover:text-ink-900"
                        aria-label={activo ? 'Inactivar' : 'Reactivar'}
                        title={activo ? 'Inactivar' : 'Reactivar'}
                      >
                        {activo ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
                      </button>
                      <button
                        onClick={() => onChangePassword(u)}
                        className="rounded-lg p-1.5 text-ink-muted hover:bg-sand-100 hover:text-ink-900"
                        aria-label="Cambiar contraseña"
                        title="Cambiar contraseña"
                      >
                        <KeyRound size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(u)}
                        className="rounded-lg p-1.5 text-ink-muted hover:bg-coral-100 hover:text-coral-500"
                        aria-label="Eliminar"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
