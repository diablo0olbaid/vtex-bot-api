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
  const sellerIdFiltro = req.query.sellerId || '1'

  try {
    const url = `https://${cuenta}.${dominio}/api/catalog_system/pub/products/search?ft=${encodeURIComponent(pedido)}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.status}`)
    }

    const data = await response.json()

    const productosFiltrados = data
      .map(p => {
        const item = p.items?.[0]
        const seller = item?.sellers?.find(s => s.sellerId === sellerIdFiltro)

        if (!seller || seller?.commertialOffer?.AvailableQuantity < 1) {
          return null
        }

        return {
          nombre: p.productName,
          link: `https://${cuenta}.${dominio}/${p.linkText}/p`,
          imagen: item.images?.[0]?.imageUrl || '',
          sku: item.itemId,
          precio: seller.commertialOffer?.ListPrice || null,
          precioOferta: seller.commertialOffer?.Price || null
        }
      })
      .filter(Boolean)
      .slice(0, 3)

    res.status(200).json({ productos: productosFiltrados })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
