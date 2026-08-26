import { createClient } from '@supabase/supabase-js'

// Valida que quien invoca la función tenga una sesión activa y rol "admin",
// usando la service_role key (que bypasea RLS) para consultar "perfiles".
// Devuelve { error } listo para retornar tal cual desde el handler, o
// { supabaseAdmin, callerUser } si la validación fue exitosa.
export async function requireAdmin(event) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Faltan las variables de entorno VITE_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.')
    return { error: { statusCode: 500, body: JSON.stringify({ error: 'El servidor no está configurado correctamente.' }) } }
  }

  const authHeader = event.headers?.authorization || event.headers?.Authorization || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) {
    return { error: { statusCode: 401, body: JSON.stringify({ error: 'Falta el token de sesión.' }) } }
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
    return {
      error: {
        statusCode: 500,
        body: JSON.stringify({ error: 'La configuración del servidor (SUPABASE_SERVICE_ROLE_KEY) es inválida.' }),
      },
    }
  }

  // Verificamos que el token pertenezca a una sesión válida...
  const { data: callerData, error: callerError } = await supabaseAdmin.auth.getUser(token)
  if (callerError || !callerData?.user) {
    console.error('Token de sesión inválido o expirado:', callerError?.message)
    return { error: { statusCode: 401, body: JSON.stringify({ error: 'Sesión inválida o expirada.' }) } }
  }

  // ...y que quien la inició sea un administrador.
  const { data: callerPerfil, error: perfilError } = await supabaseAdmin
    .from('perfiles')
    .select('rol')
    .eq('id', callerData.user.id)
    .single()

  if (perfilError || callerPerfil?.rol !== 'admin') {
    console.error(
      'Acceso denegado. userId:', callerData.user.id,
      'perfilError:', perfilError?.message, perfilError?.code,
      'rolEncontrado:', callerPerfil?.rol
    )
    return { error: { statusCode: 403, body: JSON.stringify({ error: 'No tenés permisos de administrador para esta acción.' }) } }
  }

  return { supabaseAdmin, callerUser: callerData.user }
}
