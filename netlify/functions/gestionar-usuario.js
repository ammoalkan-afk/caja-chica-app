import { requireAdmin } from './_shared/adminAuth.js'

const ACCIONES_VALIDAS = ['desactivar', 'reactivar', 'eliminar', 'cambiar_password']

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido.' }) }
  }

  const auth = await requireAdmin(event)
  if (auth.error) return auth.error
  const { supabaseAdmin, callerUser } = auth

  let accion, userId, password
  try {
    const body = JSON.parse(event.body || '{}')
    accion = body.accion
    userId = body.userId
    password = body.password || ''
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: `Cuerpo de la petición inválido: ${err.message}` }) }
  }

  if (!ACCIONES_VALIDAS.includes(accion)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Acción inválida.' }) }
  }
  if (!userId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Falta el usuario a modificar.' }) }
  }
  if (userId === callerUser.id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No podés realizar esta acción sobre tu propia cuenta.' }) }
  }

  if (accion === 'desactivar' || accion === 'reactivar') {
    const activar = accion === 'reactivar'
    const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: activar ? 'none' : '87600h',
    })
    if (banError) {
      console.error(`Error al ${accion} usuario:`, banError)
      return { statusCode: 400, body: JSON.stringify({ error: banError.message || `No se pudo ${accion} el usuario.` }) }
    }

    const { data: perfil, error: updateError } = await supabaseAdmin
      .from('perfiles')
      .update({ activo: activar })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error(`Error al actualizar el perfil tras ${accion}:`, updateError)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `El usuario se ${activar ? 'reactivó' : 'desactivó'} pero no se pudo actualizar su perfil.` }),
      }
    }

    return { statusCode: 200, body: JSON.stringify(perfil) }
  }

  if (accion === 'eliminar') {
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteError) {
      console.error('Error al eliminar usuario:', deleteError)
      return { statusCode: 400, body: JSON.stringify({ error: deleteError.message || 'No se pudo eliminar el usuario.' }) }
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) }
  }

  if (accion === 'cambiar_password') {
    if (!password || password.length < 6) {
      return { statusCode: 400, body: JSON.stringify({ error: 'La contraseña debe tener al menos 6 caracteres.' }) }
    }
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password })
    if (passwordError) {
      console.error('Error al cambiar la contraseña:', passwordError)
      return { statusCode: 400, body: JSON.stringify({ error: passwordError.message || 'No se pudo cambiar la contraseña.' }) }
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) }
  }
}
