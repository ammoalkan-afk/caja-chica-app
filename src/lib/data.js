import { supabase } from './supabaseClient'

// ---------- GASTOS ----------

export async function fetchGastos() {
  const { data, error } = await supabase
    .from('gastos')
    .select('*')
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createGasto(gasto) {
  const { data, error } = await supabase.from('gastos').insert(gasto).select().single()
  if (error) throw error
  return data
}

export async function updateGasto(id, gasto) {
  const { data, error } = await supabase.from('gastos').update(gasto).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteGasto(id) {
  const { error } = await supabase.from('gastos').delete().eq('id', id)
  if (error) throw error
}

// ---------- REPOSICIONES ----------

export async function fetchReposiciones() {
  const { data, error } = await supabase
    .from('reposiciones')
    .select('*')
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createReposicion(reposicion) {
  const { data, error } = await supabase.from('reposiciones').insert(reposicion).select().single()
  if (error) throw error
  return data
}

export async function updateReposicion(id, reposicion) {
  const { data, error } = await supabase.from('reposiciones').update(reposicion).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteReposicion(id) {
  const { error } = await supabase.from('reposiciones').delete().eq('id', id)
  if (error) throw error
}

// ---------- USUARIOS ----------

export async function fetchUsuarios() {
  const { data, error } = await supabase.from('perfiles').select('*').order('nombre', { ascending: true })
  if (error) throw error
  return data
}

async function callAuthedFunction(path, payload) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  const token = sessionData?.session?.access_token
  if (!token) throw new Error('No hay una sesión activa.')

  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const rawResponse = await res.text()
  let data = null
  try {
    data = rawResponse ? JSON.parse(rawResponse) : null
  } catch {
    // La respuesta no fue JSON (por ejemplo, una página de error del hosting).
  }

  if (!res.ok || !data) {
    const detail = data?.error || rawResponse.slice(0, 300) || 'sin detalle'
    console.error(`Error al llamar a ${path}:`, res.status, detail)
    throw new Error(detail)
  }

  return data
}

export async function createUsuario(values) {
  return callAuthedFunction('/.netlify/functions/crear-usuario', values)
}

export async function gestionarUsuario(payload) {
  return callAuthedFunction('/.netlify/functions/gestionar-usuario', payload)
}

export const CATEGORIAS_SUGERIDAS = [
  'Oficina',
  'Transporte',
  'Alimentación',
  'Servicios',
  'Limpieza',
  'Mantenimiento',
  'Otros',
]

export const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Tarjeta']
