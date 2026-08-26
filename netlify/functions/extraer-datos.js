export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido.' }) }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('Falta la variable de entorno ANTHROPIC_API_KEY.')
    return { statusCode: 500, body: JSON.stringify({ error: 'El servidor no está configurado correctamente.' }) }
  }

  let image, mediaType
  try {
    const body = JSON.parse(event.body || '{}')
    image = body.image
    mediaType = body.mediaType || 'image/jpeg'
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Cuerpo de la petición inválido.' }) }
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

    if (!response.ok) {
      const errText = await response.text()
      console.error('Error de la API de Anthropic:', errText)
      return { statusCode: 502, body: JSON.stringify({ error: 'No se pudo analizar la imagen.' }) }
    }

    const data = await response.json()
    const rawText = data.content?.[0]?.text || '{}'

    let parsed
    try {
      parsed = JSON.parse(rawText)
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/)
      parsed = match ? JSON.parse(match[0]) : {}
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
    return { statusCode: 500, body: JSON.stringify({ error: 'Error interno al procesar la imagen.' }) }
  }
}
