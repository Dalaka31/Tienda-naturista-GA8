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
  res.send('API de El Jardín de Morgana funcionando correctamente')
})


app.post('/api/pedidos', async (req, res) => {
  const { nombre_cliente, telefono, direccion, detalle_carrito, total } = req.body

  if (!nombre_cliente || !telefono || !direccion || !detalle_carrito) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' })
  }

  try {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([
        {
          nombre_cliente,
          telefono,
          direccion,
          detalle_carrito,
          total,
          estado: 'PENDIENTE'
        }
      ])
      .select()

    if (error) {
      console.error('Error creando pedido:', error)
      return res.status(400).json({ error: error.message || 'Error al procesar el pedido' })
    }

    if (!data || data.length === 0) {
      console.error('Error: no se obtuvieron datos al crear el pedido')
      return res.status(500).json({ error: 'Error al procesar el pedido en la base de datos' })
    }

    console.log(`Pedido #${data[0].id} creado - ${nombre_cliente}`)
    res.status(201).json(data[0])
  } catch (err) {
    console.error('Excepción al crear pedido:', err)
    res.status(500).json({ error: 'Error interno del servidor al procesar el pedido' })
  }
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
  const pedidoId = req.params.id

  try {
    const { data: pedido, error: errFetch } = await supabase.from('pedidos').select('*').eq('id', pedidoId).single()
    if (errFetch || !pedido) throw new Error('Pedido no encontrado')

    for (const item of pedido.detalle_carrito) {
      const { data: inv } = await supabase.from('inventario').select('stock_actual').eq('producto_id', item.id).single()
      if (inv) {
        await supabase.from('inventario').update({ stock_actual: inv.stock_actual - item.qty }).eq('producto_id', item.id)
      }
    }

    const { error: errUpdate } = await supabase.from('pedidos').update({ estado: 'COMPLETADO' }).eq('id', pedidoId)
    if (errUpdate) throw errUpdate

    console.log(`Pedido #${pedidoId} COMPLETADO - inventario actualizado`)
    res.json({ message: 'Pedido completado exitosamente' })
  } catch (error) {
    console.error('Error completando pedido:', error)
    res.status(500).json({ error: error.message || 'Error al completar el pedido' })
  }
})


app.put('/api/pedidos/:id/cancelar', async (req, res) => {
  const pedidoId = req.params.id

  try {
    const { error } = await supabase.from('pedidos').update({ estado: 'CANCELADO' }).eq('id', pedidoId)
    if (error) throw error
    console.log(`Pedido #${pedidoId} CANCELADO (sin cambios en stock)`)
    res.json({ message: 'Pedido cancelado exitosamente' })
  } catch (error) {
    console.error('Error cancelando pedido:', error)
    res.status(500).json({ error: error.message || 'Error al cancelar el pedido' })
  }
})


app.delete('/api/historial', async (req, res) => {
  const { error } = await supabase.from('pedidos').delete().eq('estado', 'COMPLETADO')

  if (error) {
    return res.status(500).json({ error: 'Error al borrar el historial' })
  }

  console.log(`Historial de ventas borrado`)
  res.json({ message: 'Historial borrado exitosamente' })
})

app.delete('/api/pedidos/:id', async (req, res) => {
  const pedidoId = req.params.id
  try {
    const { data: pedido, error: errFetch } = await supabase.from('pedidos').select('*').eq('id', pedidoId).single()
    if (errFetch || !pedido) throw new Error('Pedido no encontrado')

    if (pedido.estado === 'COMPLETADO') {
      for (const item of pedido.detalle_carrito) {
        const { data: inv } = await supabase.from('inventario').select('stock_actual').eq('producto_id', item.id).single()
        if (inv) {
          await supabase.from('inventario').update({ stock_actual: inv.stock_actual + item.qty }).eq('producto_id', item.id)
        }
      }
    }

    const { error: errDel } = await supabase.from('pedidos').delete().eq('id', pedidoId)
    if (errDel) throw errDel

    console.log(`Pedido #${pedidoId} ELIMINADO y stock restaurado si aplicaba`)
    res.json({ message: 'Pedido eliminado y stock restaurado' })
  } catch (error) {
    console.error('Error al eliminar pedido:', error)
    res.status(500).json({ error: error.message || 'Error al eliminar pedido' })
  }
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
  console.log(`Backend El Jardín de Morgana corriendo en http://localhost:${PORT}`)
})
