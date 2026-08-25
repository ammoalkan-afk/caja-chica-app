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
