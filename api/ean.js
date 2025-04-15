export default async function handler(req, res) {
  const { code } = req.query;

  if (!code || !/^\d{8,14}$/.test(code)) {
    return res.status(400).json({ error: 'Código EAN inválido' });
  }

  const endpoint = `https://www.carrefour.com.ar/api/catalog_system/pub/products/search?fq=alternateIds_EAN:${code}`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const result = data.map(product => {
      const sku = product.items?.[0] ?? {};
      const image = sku.images?.[0]?.imageUrl ?? null;

      return {
        id: product.productId,
        name: product.productName,
        brand: product.brand ?? null,             // 👈 Marca en texto
        brandId: product.brandId ?? null,         // 👈 ID de marca (por si lo querés)
        skuId: sku.itemId ?? null,
        image,
        price: sku.sellers?.[0]?.commertialOffer?.Price ?? null,
        available: sku.sellers?.[0]?.commertialOffer?.AvailableQuantity > 0
      };
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('Error buscando por EAN:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
