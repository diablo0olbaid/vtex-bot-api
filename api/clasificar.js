export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const mensaje = req.query.mensaje || ''

  try {
    const clasificacion = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'user',
            content: `Clasificá esta frase del usuario en una de estas categorías:

- agregar_producto
- finalizar_carrito
- consultar_promocion
- saludo
- otro

Frase: "${mensaje}"

Respuesta (solo una palabra):`
          }
        ],
        temperature: 0.1,
        max_tokens: 1
      })
    })

    const data = await clasificacion.json()
    const categoria = data.choices?.[0]?.message?.content?.trim().toLowerCase() || 'otro'

    res.status(200).json({ categoria })
  } catch (error) {
    console.error('Error clasificando intención:', error)
    res.status(500).json({ error: 'Error clasificando intención' })
  }
}
