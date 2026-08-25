// Ajusta CURRENCY_SYMBOL y el locale si tu caja chica no usa Guaraníes.
export const CURRENCY_SYMBOL = 'Gs.'
const numberFormatter = new Intl.NumberFormat('es-PY', { maximumFractionDigits: 0 })

export function formatMoney(value) {
  const n = Number(value) || 0
  return `${CURRENCY_SYMBOL} ${numberFormatter.format(n)}`
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''))
  return new Intl.DateTimeFormat('es-PY', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
