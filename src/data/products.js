import { supabase } from '../lib/supabase'

export const CATEGORIES = [
  'Todos',
  'Alimentos',
  'Suplementos',
  'Fitoterapéuticos',
  'Dermocosméticos',
]

export const PHONE = '573184045140'

export async function loadProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, inventario(stock_actual)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading products:', error)
    return []
  }

  return (data || []).map(p => ({
    ...p,
    stock_actual: Array.isArray(p.inventario)
      ? (p.inventario[0]?.stock_actual || 0)
      : (p.inventario?.stock_actual || 0)
  }))
}

export async function addProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()

  if (error) {
    console.error('Error adding product:', error)
    throw error
  }
  return data
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating product:', error)
    throw error
  }
  return data
}

export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}
