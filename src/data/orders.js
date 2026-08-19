

const API = '/api'

export async function createOrder(orderData) {
  const res = await fetch(`${API}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al crear el pedido')
  }
  return res.json()
}

export async function getOrders(estado) {
  const url = estado ? `${API}/pedidos?estado=${estado}` : `${API}/pedidos`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Error al obtener pedidos')
  return res.json()
}

export async function completarPedido(id) {
  const res = await fetch(`${API}/pedidos/${id}/completar`, { method: 'PUT' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al completar pedido')
  }
  return res.json()
}

export async function cancelarPedido(id) {
  const res = await fetch(`${API}/pedidos/${id}/cancelar`, { method: 'PUT' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al cancelar pedido')
  }
  return res.json()
}

export async function clearHistory() {
  const res = await fetch(`${API}/pedidos/historial`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al borrar historial')
  }
  return res.json()
}

export async function deleteOrder(id) {
  const res = await fetch(`${API}/pedidos/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al eliminar pedido')
  }
  return res.json()
}
