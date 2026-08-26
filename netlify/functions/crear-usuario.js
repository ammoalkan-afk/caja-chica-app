import { createClient } from '@supabase/supabase-js'

const ROLES_VALIDOS = ['user', 'admin']

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido.' }) }
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Faltan las variables de entorno VITE_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.')
    return { statusCode: 500, body: JSON.stringify({ error: 'El servidor no está configurado correctamente.' }) }
  }

  const authHeader = event.headers?.authorization || event.headers?.Authorization || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Falta el token de sesión.' }) }
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Verificamos que el token pertenezca a una sesión válida...
  const { data: callerData, error: callerError } = await supabaseAdmin.auth.getUser(token)
  if (callerError || !callerData?.user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Sesión inválida o expirada.' }) }
  }

  // ...y que quien la inició sea un administrador.
  const { data: callerPerfil, error: perfilError } = await supabaseAdmin
    .from('perfiles')
    .select('rol')
    .eq('id', callerData.user.id)
    .single()

  if (perfilError || callerPerfil?.rol !== 'admin') {
    return { statusCode: 403, body: JSON.stringify({ error: 'No tenés permisos de administrador para esta acción.' }) }
  }

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
