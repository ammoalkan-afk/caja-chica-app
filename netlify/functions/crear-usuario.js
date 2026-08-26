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

  // auth.admin.* solo funciona con la service_role key real (bypasea RLS). Si esto falla,
  // SUPABASE_SERVICE_ROLE_KEY tiene un valor incorrecto (ej. se pegó la anon key por error),
  // y sin este chequeo el síntoma es un confuso "no tenés permisos de administrador" para
  // cualquier admin real, porque la consulta a "perfiles" queda bloqueada por RLS.
  const { error: adminCheckError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 })
  if (adminCheckError) {
    console.error('SUPABASE_SERVICE_ROLE_KEY inválida (sin privilegios de admin):', adminCheckError.message)
    return { statusCode: 500, body: JSON.stringify({ error: 'La configuración del servidor (SUPABASE_SERVICE_ROLE_KEY) es inválida.' }) }
  }

  // Verificamos que el token pertenezca a una sesión válida...
  const { data: callerData, error: callerError } = await supabaseAdmin.auth.getUser(token)
  if (callerError || !callerData?.user) {
    console.error('Token de sesión inválido o expirado:', callerError?.message)
    return { statusCode: 401, body: JSON.stringify({ error: 'Sesión inválida o expirada.' }) }
  }

  // ...y que quien la inició sea un administrador.
  const { data: callerPerfil, error: perfilError } = await supabaseAdmin
    .from('perfiles')
    .select('rol')
    .eq('id', callerData.user.id)
    .single()

  if (perfilError || callerPerfil?.rol !== 'admin') {
    console.error(
      'Acceso denegado en crear-usuario. userId:', callerData.user.id,
      'perfilError:', perfilError?.message, perfilError?.code,
      'rolEncontrado:', callerPerfil?.rol
    )
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
