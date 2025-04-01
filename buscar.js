export default async function handler(req, res) {
  const cuenta = 'carrefourar'
  const dominio = 'vtexcommercestable.com.br'
  const pedido = req.query.query || 'remera'

  try {
    const url = `https://${cuenta}.${dominio}/api/catalog_system/pub/products/search?ft=${encodeURIComponent(pedido)}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.status}`)
    }

    const data = await response.json()
    const primeros = data.slice(0, 3).map(p => ({
      nombre: p.productName,
      link: `https://${cuenta}.${dominio}/${p.linkText}/p`
    }))

    res.status(200).json({ productos: primeros })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
