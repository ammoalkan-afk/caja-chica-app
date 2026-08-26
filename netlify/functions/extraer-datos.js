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
    'Analiza la imagen de este comprobante o factura y extrae el número de comprobante ' +
    '(número de factura, ticket o recibo) y el nombre del proveedor o comercio emisor. ' +
    'Responde ÚNICAMENTE con un JSON válido de la forma {"comprobante_nro": "...", "proveedor": "..."}, ' +
    'sin texto adicional, sin explicaciones y sin bloques de markdown. ' +
    'Si no encuentras alguno de los datos, devolvé ese campo como una cadena de texto vacía.'

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
