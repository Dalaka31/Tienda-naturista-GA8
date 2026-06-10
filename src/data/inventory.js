

const API = '/api'

export async function getInventory() {
  const res = await fetch(`${API}/inventario`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al obtener inventario')
  }
  return res.json()
}

export async function updateStock(producto_id, stock_actual) {
  const res = await fetch(`${API}/inventario/${producto_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock_actual })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al actualizar stock')
  }
  return res.json()
}
