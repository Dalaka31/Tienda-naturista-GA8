import { useState, useEffect, useRef } from 'react'
import { loadProducts, addProduct, updateProduct, deleteProduct, CATEGORIES } from '../data/products'
import { getOrders, completarPedido, cancelarPedido, clearHistory, deleteOrder } from '../data/orders'
import { getInventory, updateStock } from '../data/inventory'
import { fetchBanners, uploadBanner, deleteBanner } from '../data/banners'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = 'morgana2026'
const CATS = CATEGORIES.filter((c) => c !== 'Todos')

const formatPrice = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

const emptyForm = { name: '', price: '', category: CATS[0], image: '', description: '' }

/* ===== ICONS ===== */
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
const PackageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
const FolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
const BoxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
const AlertCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState(false)

  // TABS: 'dashboard' | 'productos' | 'inventario' | 'pendientes' | 'historial' | 'banner'
  const [activeTab, setActiveTab] = useState('dashboard')


  const [products, setProducts] = useState([])
  const [inventory, setInventory] = useState([])
  const [orders, setOrders] = useState([])
  const [banners, setBanners] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)


  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [imageFile, setImageFile] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  // UI
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('Todos')
  const fileRef = useRef(null)

  useEffect(() => {
    if (authed) {
      if (activeTab === 'productos') fetchProducts()
      else if (activeTab === 'inventario') fetchInventory()
      else if (activeTab === 'pendientes') fetchOrders('PENDIENTE')
      else if (activeTab === 'historial') fetchOrders('COMPLETADO')
      else if (activeTab === 'banner') loadBanners()
      else if (activeTab === 'dashboard') loadDashboardData()
    }
  }, [authed, activeTab])

  async function fetchProducts(silent = false) {
    if (!silent) setLoading(true)
    const data = await loadProducts()
    setProducts(data)
    if (!silent) setLoading(false)
  }

  async function fetchInventory(silent = false) {
    if (!silent) setLoading(true)
    try {
      const data = await getInventory()
      setInventory(data)
    } catch (err) {
      flash('Error: ' + err.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function fetchOrders(estado, silent = false) {
    if (!silent) setLoading(true)
    try {
      const data = await getOrders(estado)
      setOrders(data)
    } catch (err) {
      flash('Error cargando pedidos: ' + err.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function loadBanners(silent = false) {
    if (!silent) setLoading(true)
    try {
      const data = await fetchBanners()
      setBanners(data)
    } catch (error) {
      flash('Error al cargar banners')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function loadDashboardData(silent = false) {
    if (!silent) setLoading(true)
    try {
      const [pendientes, historial, inv] = await Promise.all([
        getOrders('PENDIENTE'),
        getOrders('COMPLETADO'),
        getInventory()
      ])

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

      const ventasMes = historial.filter(o => new Date(o.fecha).getTime() >= startOfMonth)
      const ingresosMes = ventasMes.reduce((sum, o) => sum + Number(o.total), 0)
      const agotados = inv.filter(i => i.stock_actual <= 0).length

      const productSales = {}
      historial.forEach(o => {
        o.detalle_carrito.forEach(item => {
          productSales[item.name] = (productSales[item.name] || 0) + item.qty
        })
      })
      const topProducts = Object.entries(productSales)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 3)

      setDashboardData({
        ingresosMes,
        ventasMesCount: ventasMes.length,
        pendientesCount: pendientes.length,
        agotados,
        topProducts
      })
    } catch (error) {
      flash('Error cargando dashboard')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function handleUploadBanner(e) {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      await uploadBanner(file)
      flash('Banner subido exitosamente')
      await loadBanners()
    } catch (err) {
      flash('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteBanner(filename) {
    if (!confirm('¿Eliminar esta imagen?')) return
    setLoading(true)
    try {
      await deleteBanner(filename)
      flash('Banner eliminado')
      await loadBanners()
    } catch (err) {
      flash('Error al eliminar banner')
    } finally {
      setLoading(false)
    }
  }

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }


  function flash(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }


  function formatInputPrice(val) {
    if (!val) return ''
    const num = val.toString().replace(/\D/g, '')
    return num ? Number(num).toLocaleString('es-CO') : ''
  }

  function openNew() {
    setForm({ ...emptyForm })
    setImageFile(null)
    setEditing('new')
  }

  function openEdit(p) {
    setForm({ name: p.name, price: Number(p.price).toLocaleString('es-CO'), category: p.category, image: p.image, description: p.description })
    setImageFile(null)
    setEditing(p.id)
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleImageFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setForm((prev) => ({ ...prev, image: ev.target.result }))
    reader.readAsDataURL(file)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.price || !form.category) return

    setSaving(true)
    let finalImageUrl = form.image || '/logo.png'

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `products/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        finalImageUrl = publicUrlData.publicUrl
      }

      const data = {
        name: form.name.trim(),
        price: Number(form.price.replace(/\D/g, '')),
        category: form.category,
        image: finalImageUrl,
        description: form.description.trim(),
      }

      if (editing === 'new') {
        await addProduct(data)
        flash('Producto creado exitosamente')
      } else {
        await updateProduct(editing, data)
        flash('Producto actualizado')
      }

      await fetchProducts()
      setEditing(null)
    } catch (err) {
      console.error(err)
      flash('Error al guardar producto')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteProduct(id)
      await fetchProducts()
      setConfirmDelete(null)
      flash('Producto eliminado')
    } catch (error) {
      console.error(error)
      flash('Error al eliminar')
    }
  }

  /* ---------- ORDER ACTIONS ---------- */
  async function handleCompletarPedido(id) {
    try {
      await completarPedido(id)
      flash('Pedido completado e inventario actualizado')
      fetchOrders('PENDIENTE')
      fetchInventory(true)
    } catch (err) {
      flash('Error: ' + err.message)
    }
  }

  async function handleCancelarPedido(id) {
    if (!confirm('¿Estás seguro de cancelar este pedido?')) return;
    try {
      await cancelarPedido(id)
      flash('Pedido cancelado')
      fetchOrders('PENDIENTE')
    } catch (err) {
      flash('Error: ' + err.message)
    }
  }

  async function handleClearHistory() {
    if (!confirm('¿Estás seguro de que deseas borrar TODO el historial de ventas? Esta acción no se puede deshacer.')) return;
    try {
      await clearHistory()
      flash('Historial de ventas borrado')
      fetchOrders('COMPLETADO')
    } catch (err) {
      flash('Error al borrar: ' + err.message)
    }
  }

  async function handleDeleteHistoryItem(id) {
    if (!confirm('¿Eliminar esta compra del historial? El inventario de estos productos será devuelto a stock.')) return;
    try {
      await deleteOrder(id)
      flash('Compra eliminada y stock restaurado')
      fetchOrders('COMPLETADO')
    } catch (err) {
      flash('Error: ' + err.message)
    }
  }

  async function handleSaveStock(producto_id, newStock) {
    try {
      await updateStock(producto_id, Number(newStock))
      flash('Stock actualizado correctamente')
      fetchInventory()
    } catch (err) {
      flash('Error al actualizar stock: ' + err.message)
    }
  }


  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCategory === 'Todos' || p.category === filterCategory
    return matchSearch && matchCat
  })
  const filteredInventory = inventory.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
  const filteredOrders = orders.filter((o) => o.nombre_cliente.toLowerCase().includes(search.toLowerCase()))


  if (!authed) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <img src="/logo.png" alt="Logo" className="admin-login-logo" />
          <h1 className="admin-login-title">Panel de Administración</h1>
          <p className="admin-login-sub">Ingresa la contraseña para acceder</p>
          <form onSubmit={handleLogin} className="admin-login-form">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPwError(false) }}
              className={`admin-input ${pwError ? 'error' : ''}`}
              autoFocus
            />
            {pwError && <span className="admin-pw-error">Contraseña incorrecta</span>}
            <button type="submit" className="admin-btn-primary">Ingresar</button>
          </form>
          <a href="/" className="admin-back-link">← Volver a la tienda</a>
        </div>
      </div>
    )
  }



  return (
    <div className="admin-wrapper">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img src="/logo.png" alt="Logo" />
          <span>Admin Panel</span>
        </div>
        <nav className="admin-sidebar-nav">
          <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setSearch('') }}>
            <TrendingUpIcon /> Dashboard
          </button>
          <button className={`admin-nav-item ${activeTab === 'productos' ? 'active' : ''}`} onClick={() => { setActiveTab('productos'); setSearch('') }}>
            <PackageIcon /> Productos
          </button>
          <button className={`admin-nav-item ${activeTab === 'inventario' ? 'active' : ''}`} onClick={() => { setActiveTab('inventario'); setSearch('') }}>
            <BoxIcon /> Inventario
          </button>
          <button className={`admin-nav-item ${activeTab === 'pendientes' ? 'active' : ''}`} onClick={() => { setActiveTab('pendientes'); setSearch('') }}>
            <ClockIcon /> Pedidos Pendientes
          </button>
          <button className={`admin-nav-item ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => { setActiveTab('historial'); setSearch('') }}>
            <ListIcon /> Historial de Ventas
          </button>
          <button className={`admin-nav-item ${activeTab === 'banner' ? 'active' : ''}`} onClick={() => { setActiveTab('banner'); setSearch('') }}>
            <ImageIcon /> Banner
          </button>
          <a href="/" className="admin-nav-item" target="_blank" rel="noopener noreferrer" style={{ marginTop: 'auto' }}><StoreIcon /> Ver Tienda</a>
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-btn-outline-sm danger" onClick={() => setAuthed(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <LogOutIcon /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        {/* TOP BAR */}
        <header className="admin-topbar">
          <div>
            <h1 className="admin-page-title">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'productos' && 'Gestión de Productos'}
              {activeTab === 'inventario' && 'Control de Inventario'}
              {activeTab === 'pendientes' && 'Pedidos en Tránsito'}
              {activeTab === 'historial' && 'Historial de Ventas'}
              {activeTab === 'banner' && 'Gestión de Banners'}
            </h1>
            <p className="admin-page-sub">
              {activeTab === 'dashboard' && 'Resumen en tiempo real del negocio'}
              {activeTab === 'productos' && `${products.length} producto(s) registrado(s)`}
              {activeTab === 'inventario' && `${inventory.length} producto(s) en almacén`}
              {activeTab === 'pendientes' && `${orders.length} pedido(s) pendiente(s)`}
              {activeTab === 'historial' && `${orders.length} venta(s) completada(s)`}
              {activeTab === 'banner' && `${banners.length}/3 imágenes en carrusel`}
            </p>
          </div>
          <div className="admin-topbar-actions">
            {activeTab !== 'dashboard' && (
              <div className="admin-search-wrap">
                <span><SearchIcon /></span>
                <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="admin-input sm" />
              </div>
            )}
            {activeTab === 'productos' && (
              <>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="admin-input sm" style={{ width: 'auto' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button className="admin-btn-primary" onClick={openNew}>+ Nuevo Producto</button>
              </>
            )}
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="admin-content-wrap">

          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && dashboardData && (
            <div className="dashboard-grid">
              <div className="dashboard-card primary">
                <div className="dashboard-card-icon"><TrendingUpIcon /></div>
                <div className="dashboard-card-info">
                  <h3>Ingresos del Mes</h3>
                  <p className="dashboard-val">{formatPrice(dashboardData.ingresosMes)}</p>
                  <span>{dashboardData.ventasMesCount} ventas completadas</span>
                </div>
              </div>
              <div className="dashboard-card warning">
                <div className="dashboard-card-icon"><ClockIcon /></div>
                <div className="dashboard-card-info">
                  <h3>Pedidos Pendientes</h3>
                  <p className="dashboard-val">{dashboardData.pendientesCount}</p>
                  <span>Por procesar</span>
                </div>
              </div>
              <div className="dashboard-card danger">
                <div className="dashboard-card-icon"><AlertCircleIcon /></div>
                <div className="dashboard-card-info">
                  <h3>Alertas de Stock</h3>
                  <p className="dashboard-val">{dashboardData.agotados}</p>
                  <span>Productos agotados</span>
                </div>
              </div>

              <div className="dashboard-top-products">
                <h3><StarIcon /> Top Productos (Histórico)</h3>
                <div className="top-products-list">
                  {dashboardData.topProducts.map((p, i) => (
                    <div key={p.name} className="top-product-item">
                      <div className="top-product-rank">#{i + 1}</div>
                      <div className="top-product-name">{p.name}</div>
                      <div className="top-product-qty">{p.qty} unid.</div>
                    </div>
                  ))}
                  {dashboardData.topProducts.length === 0 && <p className="admin-empty" style={{padding: '24px 0'}}>No hay datos suficientes.</p>}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRODUCTOS */}
          {activeTab === 'productos' && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="admin-empty">Cargando...</td></tr>
                  ) : filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td><img src={p.image} alt={p.name} className="admin-table-img" /></td>
                      <td>
                        <div className="admin-table-name">{p.name}</div>
                        <div className="admin-table-desc">{p.description?.substring(0, 60)}...</div>
                      </td>
                      <td><span className="admin-cat-badge">{p.category}</span></td>
                      <td className="admin-table-price">{formatPrice(p.price)}</td>
                      <td>
                        <div className="admin-action-btns">
                          <button className="admin-btn-icon edit" onClick={() => openEdit(p)} title="Editar"><EditIcon /></button>
                          <button className="admin-btn-icon delete" onClick={() => setConfirmDelete(p.id)} title="Eliminar"><TrashIcon /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredProducts.length === 0 && (
                    <tr><td colSpan="5" className="admin-empty">No se encontraron productos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: INVENTARIO */}
          {activeTab === 'inventario' && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock Actual</th>
                    <th>Ajustar Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="4" className="admin-empty">Cargando inventario...</td></tr>
                  ) : filteredInventory.map((item) => (
                    <tr key={item.id}>
                      <td><div className="admin-table-name">{item.name}</div></td>
                      <td><span className="admin-cat-badge">{item.category}</span></td>
                      <td>
                        <span className={`admin-status-badge ${item.stock_actual > 0 ? 'success' : 'pending'}`}>
                          {item.stock_actual > 0 ? `${item.stock_actual} unidades` : 'Agotado'}
                        </span>
                      </td>
                      <td>
                        <form
                          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                          onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            handleSaveStock(item.id, formData.get('stock'));
                          }}
                        >
                          <input
                            type="number"
                            name="stock"
                            className="admin-input sm"
                            style={{ width: '80px', textAlign: 'center' }}
                            defaultValue={item.stock_actual}
                            min="0"
                            required
                          />
                          <button type="submit" className="admin-btn-icon success" title="Guardar stock">
                            <SaveIcon />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredInventory.length === 0 && (
                    <tr><td colSpan="4" className="admin-empty">No se encontró inventario</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: PEDIDOS PENDIENTES */}
          {activeTab === 'pendientes' && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Contacto / Dirección</th>
                    <th>Detalle Pedido</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="admin-empty">Cargando pedidos...</td></tr>
                  ) : filteredOrders.map((o) => (
                    <tr key={o.id}>
                      <td><div className="admin-date">{new Date(o.fecha).toLocaleString('es-CO')}</div></td>
                      <td><div className="admin-table-name">{o.nombre_cliente}</div></td>
                      <td>
                        <div className="admin-table-desc"><strong>Tel:</strong> {o.telefono}</div>
                        <div className="admin-table-desc"><strong>Dir:</strong> {o.direccion}</div>
                      </td>
                      <td>
                        <ul className="admin-order-items">
                          {o.detalle_carrito.map((item, i) => (
                            <li key={i}>x{item.qty} {item.name}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="admin-table-price">{formatPrice(o.total)}</td>
                      <td>
                        <div className="admin-action-btns">
                          <button className="admin-btn-icon success" onClick={() => handleCompletarPedido(o.id)} title="Marcar como Venta Hecha"><CheckIcon /></button>
                          <button className="admin-btn-icon delete" onClick={() => handleCancelarPedido(o.id)} title="Cancelar Pedido"><XIcon /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredOrders.length === 0 && (
                    <tr><td colSpan="6" className="admin-empty">No hay pedidos pendientes</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: HISTORIAL DE VENTAS */}
          {activeTab === 'historial' && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Contacto / Dirección</th>
                    <th>Detalle Pedido</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="admin-empty">Cargando historial...</td></tr>
                  ) : filteredOrders.map((o) => (
                    <tr key={o.id}>
                      <td><div className="admin-date">{new Date(o.fecha).toLocaleString('es-CO')}</div></td>
                      <td><div className="admin-table-name">{o.nombre_cliente}</div></td>
                      <td>
                        <div className="admin-table-desc"><strong>Tel:</strong> {o.telefono}</div>
                        <div className="admin-table-desc"><strong>Dir:</strong> {o.direccion}</div>
                      </td>
                      <td>
                        <ul className="admin-order-items">
                          {o.detalle_carrito.map((item, i) => (
                            <li key={i}>x{item.qty} {item.name}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="admin-table-price">{formatPrice(o.total)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span className="admin-status-badge success">{o.estado}</span>
                          <button className="admin-btn-icon delete" onClick={() => handleDeleteHistoryItem(o.id)} title="Eliminar del historial y restaurar stock"><TrashIcon /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredOrders.length === 0 && (
                    <tr><td colSpan="6" className="admin-empty">No hay ventas registradas</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: BANNER */}
          {activeTab === 'banner' && (
            <div className="admin-table-wrap">
              <div style={{ padding: '24px', background: 'var(--color-white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>Imágenes del Banner ({banners.length}/3)</h2>
                  <label className={`admin-btn-primary ${banners.length >= 3 ? 'disabled' : ''}`} style={{ cursor: banners.length >= 3 ? 'not-allowed' : 'pointer' }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} disabled={banners.length >= 3 || loading} onChange={handleUploadBanner} />
                    + Subir Imagen
                  </label>
                </div>
                {loading && <p style={{ color: 'var(--color-text-light)' }}>Procesando...</p>}
                
                {!loading && banners.length === 0 ? (
                  <div className="admin-empty">No hay imágenes en el banner. Se mostrará la imagen por defecto.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {banners.map(b => (
                      <div key={b.name} style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--color-ash)' }}>
                        <img src={b.url} alt="Banner" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
                        <button 
                          className="admin-btn-icon delete" 
                          style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.9)' }}
                          onClick={() => handleDeleteBanner(b.name)}
                          title="Eliminar"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* EDIT / NEW MODAL (PRODUCTS) */}
      {editing !== null && (
        <div className="admin-modal-overlay" onClick={() => !saving && setEditing(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {editing === 'new' ? 'Nuevo Producto' : <><EditIcon /> Editar Producto</>}
              </h2>
              <button className="admin-modal-close" onClick={() => !saving && setEditing(null)} disabled={saving}>✕</button>
            </div>
            <form onSubmit={handleSave} className="admin-form">
              <div className="admin-form-group">
                <label>Nombre del producto *</label>
                <input type="text" className="admin-input" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Ej: Té Verde Orgánico" required disabled={saving} />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Precio (COP)</label>
                  <input
                    type="text"
                    value={form.price}
                    onChange={(e) => handleChange('price', formatInputPrice(e.target.value))}
                    className="admin-input"
                    placeholder="30.000"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Categoría *</label>
                  <select className="admin-input" value={form.category} onChange={(e) => handleChange('category', e.target.value)} disabled={saving}>
                    {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Imagen del producto</label>
                <div className="admin-image-upload">
                  {form.image && <img src={form.image} alt="Preview" className="admin-image-preview" />}
                  <div className="admin-image-options">
                    <button type="button" className="admin-btn-outline-sm" onClick={() => fileRef.current?.click()} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FolderIcon /> Subir Imagen
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleImageFile} style={{ display: 'none' }} disabled={saving} />
                    <span className="admin-or">o</span>
                    <input type="text" className="admin-input sm" value={form.image.startsWith('data:') ? '' : form.image} onChange={(e) => handleChange('image', e.target.value)} placeholder="URL de la imagen" disabled={saving} />
                  </div>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Descripción</label>
                <textarea className="admin-input textarea" value={form.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Descripción detallada del producto..." rows="4" disabled={saving} />
              </div>
              <div className="admin-form-actions">
                <button type="button" className="admin-btn-outline" onClick={() => setEditing(null)} disabled={saving}>Cancelar</button>
                <button type="submit" className="admin-btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : editing === 'new' ? 'Crear Producto' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM (PRODUCTS) */}
      {confirmDelete !== null && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-modal small" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c0392b' }}>
                <WarningIcon /> Confirmar Eliminación
              </h2>
              <button className="admin-modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className="admin-delete-body">
              <p>¿Estás seguro de que deseas eliminar <strong>{products.find((p) => p.id === confirmDelete)?.name}</strong>?</p>
              <p className="admin-delete-warn">Esta acción no se puede deshacer.</p>
            </div>
            <div className="admin-form-actions">
              <button className="admin-btn-outline" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="admin-btn-danger" onClick={() => handleDelete(confirmDelete)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className="toast show">{toast}</div>}
    </div>
  )
}
