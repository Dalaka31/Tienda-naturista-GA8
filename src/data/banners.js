import { supabase } from '../lib/supabase'

export async function fetchBanners() {
  const { data, error } = await supabase.storage.from('product-images').list('banners', {
    limit: 3,
    sortBy: { column: 'name', order: 'asc' },
  })

  if (error) {
    console.error('Error fetching banners:', error)
    return []
  }

  // Filtrar carpetas (tienen id null y metadata null en algunos casos) y placeholder de supabase (.emptyFolderPlaceholder)
  const files = data.filter(file => file.name !== '.emptyFolderPlaceholder')

  if (files.length === 0) return []

  // Obtener URL pública para cada archivo
  const bannersUrls = files.map(file => {
    const { data: publicData } = supabase.storage.from('product-images').getPublicUrl(`banners/${file.name}`)
    return { name: file.name, url: publicData.publicUrl }
  })

  return bannersUrls
}

export async function uploadBanner(file) {
  // Limitar a 3 banners
  const currentBanners = await fetchBanners()
  if (currentBanners.length >= 3) {
    throw new Error('Máximo de 3 banners alcanzado')
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
  const filePath = `banners/${fileName}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file)

  if (error) throw error

  const { data: publicData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return { name: fileName, url: publicData.publicUrl }
}

export async function deleteBanner(filename) {
  const { error } = await supabase.storage
    .from('product-images')
    .remove([`banners/${filename}`])

  if (error) throw error
}
