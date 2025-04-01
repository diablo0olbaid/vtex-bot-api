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

    // Buscar promos por Price < ListPrice o presence of priceTags
    const posiblesPromos = data
      .map(p => {
        const item = p.items?.[0]
        const seller = item?.sellers?.[0]
        const offer = seller?.commertialOffer

        const tieneDescuento = offer?.Price < offer?.ListPrice
        const tienePriceTag = offer?.PriceTags?.length > 0

        if (!tieneDescuento && !tienePriceTag) return null

        return {
          nombre: p.productName,
          link: `https://${cuenta}.${dominio}/${p.linkText}/p`,
          imagen: item?.images?.[0]?.imageUrl || '',
          sku: item?.itemId,
          precioAnterior: offer?.ListPrice,
          precioActual: offer?.Price
        }
      })
      .filter(p => p !== null)

    // Si no encontramos promos, devolver 5 productos normales
    const fallback = data.slice(0, 5).map(p => {
      const item = p.items?.[0]
      const seller = item?.sellers?.[0]
      const offer = seller?.commertialOffer

      return {
        nombre: p.productName,
        link: `https://${cuenta}.${dominio}/${p.linkText}/p`,
        imagen: item?.images?.[0]?.imageUrl || '',
        sku: item?.itemId,
        precioAnterior: offer?.ListPrice,
        precioActual: offer?.Price,
        sinPromo: true
      }
    })

    const resultadoFinal = posiblesPromos.length > 0 ? posiblesPromos.slice(0, 10) : fallback

    res.status(200).json({ productos: resultadoFinal })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
