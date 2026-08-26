// Netlify corta la conexión antes de invocar la función si el body es demasiado
// grande (probado empíricamente: falla por encima de ~6-7MB), por eso el margen.
const MAX_BODY_BYTES = 4_500_000

function extractJson(text) {
  if (!text) return null
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    // fall through to brace-matching below
  }
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (match) {
    try {
      return JSON.parse(match[0])
    } catch {
      // give up, caller handles null
    }
  }
  return null
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido.' }) }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('Falta la variable de entorno ANTHROPIC_API_KEY.')
    return { statusCode: 500, body: JSON.stringify({ error: 'El servidor no tiene configurada ANTHROPIC_API_KEY.' }) }
  }

  const bodyLength = event.body ? event.body.length : 0
  if (bodyLength > MAX_BODY_BYTES) {
    return {
      statusCode: 413,
      body: JSON.stringify({
        error: `La imagen es demasiado grande (${(bodyLength / 1_000_000).toFixed(1)}MB). Probá con una foto más liviana.`,
      }),
    }
  }

  let image, mediaType
  try {
    const parsedBody = JSON.parse(event.body || '{}')
    image = parsedBody.image
    mediaType = parsedBody.mediaType || 'image/jpeg'
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: `Cuerpo de la petición inválido: ${err.message}` }) }
  }

  if (!image) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Falta la imagen del comprobante.' }) }
  }

  const prompt =
    'Esta imagen es una factura o comprobante de compra paraguayo. Tiene una estructura típica que debés seguir con cuidado:\n\n' +
    '1. ARRIBA DE TODO aparece el nombre de la EMPRESA/NEGOCIO que vende (el emisor de la factura) junto con su R.U.C. ' +
    'Ejemplo: "RED GOAL S.A." — Ese es el "proveedor" que necesito.\n\n' +
    '2. MÁS ABAJO hay una línea como "Factura Contado Nro:" o similar, seguida de un número con formato XXX-XXX-XXXXXXX ' +
    '(ejemplo: "021-003-0049912"). Ese es el "comprobante_nro" que necesito.\n\n' +
    '3. MÁS ABAJO TODAVÍA hay una sección con "Cliente:" y "CI/RUC:" que identifica a la PERSONA QUE COMPRA. ' +
    'IGNORÁ COMPLETAMENTE esos datos: no son el proveedor ni el comprobante que busco, aunque tengan un formato parecido de RUC.\n\n' +
    'Ejemplo de qué NO tomar: si ves "Cliente: JUAN PEREZ  CI/RUC: 1234567-8", eso es el cliente, no lo uses para "proveedor" ni para "comprobante_nro".\n' +
    'Ejemplo de qué SÍ tomar: si ves "RED GOAL S.A." arriba del todo y más abajo "Factura Contado Nro: 021-003-0049912", ' +
    'entonces proveedor = "RED GOAL S.A." y comprobante_nro = "021-003-0049912".\n\n' +
    'Respondé ÚNICAMENTE con un JSON válido de la forma {"comprobante_nro": "...", "proveedor": "..."}, ' +
    'sin texto adicional, sin explicaciones y sin bloques de markdown. ' +
    'Si no encontrás alguno de los datos con certeza, devolvé ese campo como una cadena de texto vacía en vez de adivinar.'

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: image,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error('Error de la API de Anthropic:', response.status, responseText)
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: `La IA respondió con un error (HTTP ${response.status}).`,
          detail: responseText.slice(0, 500),
        }),
      }
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (err) {
      console.error('La respuesta de Anthropic no es JSON válido:', responseText)
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'La IA devolvió una respuesta no válida.', detail: responseText.slice(0, 500) }),
      }
    }

    const rawText = data.content?.[0]?.text || ''
    const parsed = extractJson(rawText)

    if (!parsed) {
      console.error('No se pudo interpretar el JSON devuelto por la IA:', rawText)
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'No se pudo interpretar la respuesta de la IA.', detail: rawText.slice(0, 500) }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        comprobante_nro: parsed.comprobante_nro || '',
        proveedor: parsed.proveedor || '',
      }),
    }
  } catch (err) {
    console.error('Error al extraer datos del comprobante:', err)
    return { statusCode: 500, body: JSON.stringify({ error: `Error interno: ${err.message}` }) }
  }
}
