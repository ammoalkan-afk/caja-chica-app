import { requireAdmin } from './_shared/adminAuth.js'

const ROLES_VALIDOS = ['user', 'admin']

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido.' }) }
  }

  const auth = await requireAdmin(event)
  if (auth.error) return auth.error
  const { supabaseAdmin } = auth

  let nombre, email, password, rol
  try {
    const body = JSON.parse(event.body || '{}')
    nombre = (body.nombre || '').trim()
    email = (body.email || '').trim().toLowerCase()
    password = body.password || ''
    rol = body.rol
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: `Cuerpo de la petición inválido: ${err.message}` }) }
  }

  if (!nombre || !email || !password) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Nombre, email y contraseña son obligatorios.' }) }
  }
  if (password.length < 6) {
    return { statusCode: 400, body: JSON.stringify({ error: 'La contraseña debe tener al menos 6 caracteres.' }) }
  }
  if (!ROLES_VALIDOS.includes(rol)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'El rol debe ser "user" o "admin".' }) }
  }

  const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError) {
    console.error('Error al crear el usuario en Auth:', createError)
    return { statusCode: 400, body: JSON.stringify({ error: createError.message || 'No se pudo crear el usuario.' }) }
  }

  const { data: perfil, error: insertError } = await supabaseAdmin
    .from('perfiles')
    .insert({ id: createdUser.user.id, email, nombre, rol })
    .select()
    .single()

  if (insertError) {
    console.error('Error al crear el perfil, revirtiendo el usuario de Auth:', insertError)
    await supabaseAdmin.auth.admin.deleteUser(createdUser.user.id)
    return { statusCode: 500, body: JSON.stringify({ error: 'No se pudo crear el perfil del usuario.' }) }
  }

  return { statusCode: 200, body: JSON.stringify(perfil) }
}
