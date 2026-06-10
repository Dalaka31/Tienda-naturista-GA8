import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import WebSocket from 'ws'

globalThis.WebSocket = WebSocket
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)


app.get('/', (req, res) => {
  res.send('🌿 API de El Jardín de Morgana funcionando correctamente')
})


app.post('/api/pedidos', async (req, res) => {
  const { nombre_cliente, telefono, direccion, detalle_carrito, total } = req.body

  if (!nombre_cliente || !telefono || !direccion || !detalle_carrito) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' })
  }

  const { data, error } = await supabase.rpc('registrar_pedido', {
    p_nombre: nombre_cliente,
    p_telefono: telefono,
    p_direccion: direccion,
    p_detalle: detalle_carrito,
    p_total: total
  })

  if (error) {
    console.error('Error creando pedido:', error)
    return res.status(400).json({ error: error.message || 'Error al procesar el pedido' })
  }

  console.log(`✅ Pedido #${data.id} creado y stock reservado — ${nombre_cliente}`)
  res.status(201).json(data)
})


app.get('/api/pedidos', async (req, res) => {
  const { estado } = req.query

  let query = supabase.from('pedidos').select('*').order('fecha', { ascending: false })
  if (estado) query = query.eq('estado', estado)

  const { data, error } = await query

  if (error) {
    console.error('Error obteniendo pedidos:', error)
    return res.status(500).json({ error: 'Error al obtener pedidos' })
  }

  res.json(data)
})


app.put('/api/pedidos/:id/completar', async (req, res) => {
  const pedidoId = parseInt(req.params.id)

  const { error } = await supabase.rpc('completar_pedido', { p_pedido_id: pedidoId })

  if (error) {
    console.error('Error completando pedido:', error)
    return res.status(500).json({ error: error.message || 'Error al completar el pedido' })
  }

  console.log(`✅ Pedido #${pedidoId} COMPLETADO — inventario actualizado`)
  res.json({ message: 'Pedido completado exitosamente' })
})


app.put('/api/pedidos/:id/cancelar', async (req, res) => {
  const pedidoId = parseInt(req.params.id)

  const { error } = await supabase.rpc('cancelar_pedido_y_devolver_stock', { p_pedido_id: pedidoId })

  if (error) {
    console.error('Error cancelando pedido:', error)
    return res.status(500).json({ error: error.message || 'Error al cancelar el pedido' })
  }

  console.log(`❌ Pedido #${pedidoId} CANCELADO y stock restaurado`)
  res.json({ message: 'Pedido cancelado y stock restaurado' })
})


app.delete('/api/pedidos/historial', async (req, res) => {
  const { error } = await supabase
    .from('pedidos')
    .delete()
    .eq('estado', 'COMPLETADO')

  if (error) {
    console.error('Error borrando historial:', error)
    return res.status(500).json({ error: 'Error al borrar el historial' })
  }

  console.log(`🗑️ Historial de ventas borrado`)
  res.json({ message: 'Historial borrado exitosamente' })
})


app.get('/api/inventario', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      category,
      inventario (stock_actual)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error obteniendo inventario:', error)
    return res.status(500).json({ error: 'Error obteniendo inventario' })
  }

  const result = data.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    stock_actual: Array.isArray(p.inventario) 
      ? (p.inventario[0]?.stock_actual || 0) 
      : (p.inventario?.stock_actual || 0)
  }))

  res.json(result)
})


app.put('/api/inventario/:producto_id', async (req, res) => {
  const { stock_actual } = req.body
  const producto_id = parseInt(req.params.producto_id)

  const { data: inv } = await supabase.from('inventario').select('*').eq('producto_id', producto_id).single()
  
  let error
  if (inv) {
    ({ error } = await supabase.from('inventario').update({ stock_actual }).eq('producto_id', producto_id))
  } else {
    ({ error } = await supabase.from('inventario').insert({ producto_id, stock_actual }))
  }

  if (error) {
    console.error('Error actualizando stock:', error)
    return res.status(500).json({ error: 'Error actualizando stock' })
  }

  res.json({ message: 'Stock actualizado correctamente' })
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🌿 Backend El Jardín de Morgana corriendo en http://localhost:${PORT}`)
})
