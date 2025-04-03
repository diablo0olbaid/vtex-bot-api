export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

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

    const primeros = data.slice(0, 3).map(p => {
      const sku = p.items?.[0]?.itemId || null
      const offer = p.items?.[0]?.sellers?.[0]?.commertialOffer || {}

      return {
        nombre: p.productName,
        link: `https://${cuenta}.${dominio}/${p.linkText}/p`,
        imagen: p.items?.[0]?.images?.[0]?.imageUrl || '',
        sku,
        precio: offer.Price || null,
        precioAnterior: offer.ListPrice || null
      }
    })

    res.status(200).json({ productos: primeros })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
