import { useRef, useState } from 'react'
import Modal from './Modal'
import { CATEGORIAS_SUGERIDAS, METODOS_PAGO } from '../lib/data'
import { todayISO } from '../lib/format'
import { supabase } from '../lib/supabaseClient'

const empty = {
  fecha: todayISO(),
  concepto: '',
  categoria: '',
  proveedor: '',
  comprobante_nro: '',
  monto: '',
  metodo_pago: 'Efectivo',
  notas: '',
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    reader.readAsDataURL(file)
  })
}

// Redimensiona/comprime la foto antes de mandarla a la función de IA para no
// pasarse del límite de payload de Netlify Functions (~6MB) con fotos de celular.
async function resizeImageForAnalysis(file, maxWidth = 1500, quality = 0.8) {
  const dataUrl = await readAsDataURL(file)
  const img = new Image()
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = () => reject(new Error('No se pudo procesar la imagen.'))
    img.src = dataUrl
  })

  const scale = Math.min(1, maxWidth / img.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo comprimir la imagen.'))), 'image/jpeg', quality)
  })
  const resizedDataUrl = await readAsDataURL(blob)
  return { base64: resizedDataUrl.split(',')[1], mediaType: 'image/jpeg' }
}

export default function GastoForm({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial ? { ...empty, ...initial } : empty)
  const [error, setError] = useState('')
  const [comprobanteFile, setComprobanteFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const fileInputRef = useRef(null)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleExtraer() {
    if (!comprobanteFile) return
    setExtracting(true)
    setError('')
    try {
      const { base64, mediaType } = await resizeImageForAnalysis(comprobanteFile)
      const res = await fetch('/.netlify/functions/extraer-datos', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ image: base64, mediaType }),
      })

      const rawResponse = await res.text()
      let data = null
      try {
        data = rawResponse ? JSON.parse(rawResponse) : null
      } catch {
        // La respuesta no fue JSON (por ejemplo, una página de error del hosting).
      }

      if (!res.ok || !data) {
        throw new Error(
          `Error del servidor (HTTP ${res.status}): ${data?.error || rawResponse.slice(0, 300) || 'sin detalle'}${
            data?.detail ? ` — ${data.detail}` : ''
          }`
        )
      }

      setForm((f) => ({
        ...f,
        comprobante_nro: data.comprobante_nro || f.comprobante_nro,
        proveedor: data.proveedor || f.proveedor,
      }))
    } catch (err) {
      console.error('Error al extraer datos del comprobante:', err)
      setError('No se pudieron extraer los datos del comprobante. Revisá la consola del navegador para más detalles.')
    } finally {
      setExtracting(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.concepto.trim()) return setError('El concepto es obligatorio.')
    if (!form.monto || Number(form.monto) <= 0) return setError('Ingresa un monto válido.')
    setError('')

    let comprobante_url = form.comprobante_url

    if (comprobanteFile) {
      setUploading(true)
      try {
        const ext = comprobanteFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('comprobantes')
          .upload(fileName, comprobanteFile)
        if (uploadError) throw uploadError
        const { data: publicUrlData } = supabase.storage.from('comprobantes').getPublicUrl(fileName)
        comprobante_url = publicUrlData.publicUrl
      } catch (err) {
        setUploading(false)
        setError('No se pudo subir la foto del comprobante.')
        console.error(err)
        return
      }
      setUploading(false)
    }

    onSave({ ...form, monto: Number(form.monto), comprobante_url })
  }

  return (
    <Modal title={initial ? 'Editar gasto' : 'Registrar gasto'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha">
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => update('fecha', e.target.value)}
              className="input"
              required
            />
          </Field>
          <Field label="Monto">
            <input
              type="number"
              min="0"
              step="1"
              value={form.monto}
              onChange={(e) => update('monto', e.target.value)}
              placeholder="0"
              className="input"
              required
            />
          </Field>
        </div>

        <Field label="Concepto">
          <input
            type="text"
            value={form.concepto}
            onChange={(e) => update('concepto', e.target.value)}
            placeholder="Ej: Compra de útiles de oficina"
            className="input"
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoría">
            <input
              list="categorias-list"
              value={form.categoria}
              onChange={(e) => update('categoria', e.target.value)}
              placeholder="Ej: Oficina"
              className="input"
            />
            <datalist id="categorias-list">
              {CATEGORIAS_SUGERIDAS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Método de pago">
            <select
              value={form.metodo_pago}
              onChange={(e) => update('metodo_pago', e.target.value)}
              className="input"
            >
              {METODOS_PAGO.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Proveedor (opcional)">
            <input
              type="text"
              value={form.proveedor}
              onChange={(e) => update('proveedor', e.target.value)}
              placeholder="Ej: Librería Central"
              className="input"
            />
          </Field>
          <Field label="Comprobante Nro. (opcional)">
            <input
              type="text"
              value={form.comprobante_nro}
              onChange={(e) => update('comprobante_nro', e.target.value)}
              placeholder="Ej: 0001-00012345"
              className="input"
            />
          </Field>
        </div>

        <Field label="Notas (opcional)">
          <textarea
            value={form.notas}
            onChange={(e) => update('notas', e.target.value)}
            rows={2}
            className="input resize-none"
          />
        </Field>

        <Field label="Foto del comprobante (opcional)">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setComprobanteFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="input flex-1 text-left text-ink-muted hover:bg-sand-50"
            >
              Seleccionar archivo
            </button>
            <button
              type="button"
              onClick={handleExtraer}
              disabled={!comprobanteFile || extracting}
              className="whitespace-nowrap rounded-xl border border-sand-200 px-3 py-2 text-sm font-medium text-ink-900 hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {extracting ? 'Analizando…' : 'Extraer datos'}
            </button>
          </div>
          {comprobanteFile && (
            <p className="mt-1.5 text-xs text-ink-muted">{comprobanteFile.name}</p>
          )}
        </Field>

        {error && <p className="text-sm text-coral-500">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-ink-900 hover:bg-sand-100">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-accent-500/30 hover:opacity-90 disabled:opacity-60"
          >
            {uploading ? 'Subiendo…' : saving ? 'Guardando…' : 'Guardar gasto'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  )
}
