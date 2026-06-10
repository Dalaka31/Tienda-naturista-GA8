import { useState, useEffect } from 'react'
import { loadProducts, CATEGORIES, PHONE } from '../data/products'
import { createOrder } from '../data/orders'


const formatPrice = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

function buildWhatsAppUrl(items) {
  const lines = items.map((it) => `• ${it.name} (x${it.qty}) — ${formatPrice(it.price * it.qty)}`)
  const total = items.reduce((s, it) => s + it.price * it.qty, 0)
  const msg =
    `Hola, Jardín de Morgana.\n\nMe encantaría realizar el siguiente pedido:\n\n` +
    lines.join('\n') +
    `\n\n💰 Total estimado: ${formatPrice(total)}\n\n¿Podrían confirmarme disponibilidad y detalles de envío? ¡Muchas gracias! 🍃`
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`
}

function buildSingleWhatsApp(product) {
  const msg = `Hola, Jardín de Morgana.\n\nEstoy interesado/a en adquirir:\n\n• ${product.name} — ${formatPrice(product.price)}\n\n¿Podrían brindarme más información sobre este producto, disponibilidad y opciones de envío? Gracias.`
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`
}


const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
)
const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
)
const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
)
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
const AddCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
const PlantIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-light)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>
const SearchBigIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>


function Toast({ message, show }) {
  return <div className={`toast ${show ? 'show' : ''}`}>✨ {message}</div>
}


export default function Store() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState({ show: false, message: '' })


  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [userInfo, setUserInfo] = useState({ nombre: '', telefono: '', direccion: '' })
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      const data = await loadProducts()
      setProducts(data)
      setLoading(false)
    }
    fetchProducts()
  }, [])


  useEffect(() => {
    const saved = {
      nombre: localStorage.getItem('userName') || '',
      telefono: localStorage.getItem('userPhone') || '',
      direccion: localStorage.getItem('userAddress') || '',
    }
    setUserInfo(saved)
  }, [])

  const totalItems = cart.reduce((s, it) => s + it.qty, 0)
  const totalPrice = cart.reduce((s, it) => s + it.price * it.qty, 0)

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'Todos' || p.category === activeCategory
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  function showToast(msg) {
    setToast({ show: true, message: msg })
    setTimeout(() => setToast({ show: false, message: '' }), 2500)
  }

  function addToCart(product, e) {
    if (e) e.stopPropagation()


    if (product.stock_actual <= 0) {
      showToast(`Agotado: ${product.name}`)
      return
    }

    setCart((prev) => {
      const exists = prev.find((it) => it.id === product.id)


      if (exists && exists.qty >= product.stock_actual) {
        showToast(`Límite de stock: ${product.stock_actual} unidades disponibles.`)
        return prev
      }

      showToast(`${product.name} añadido al carrito`)
      if (exists) return prev.map((it) => (it.id === product.id ? { ...it, qty: it.qty + 1 } : it))
      return [...prev, { ...product, qty: 1, stock_actual: product.stock_actual }]
    })
  }

  function updateQty(id, delta) {
    setCart((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const newQty = it.qty + delta
          if (newQty > it.stock_actual) {
            showToast(`Solo hay ${it.stock_actual} unidades de ${it.name}.`)
            return it
          }
          return { ...it, qty: newQty }
        }
        return it
      }).filter((it) => it.qty > 0)
    )
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((it) => it.id !== id))
  }

  function scrollToProducts() {
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
  }


  async function handleCheckout(e) {
    e.preventDefault()
    setCheckoutLoading(true)
    setCheckoutError('')

    try {

      localStorage.setItem('userName', userInfo.nombre)
      localStorage.setItem('userPhone', userInfo.telefono)
      localStorage.setItem('userAddress', userInfo.direccion)


      await createOrder({
        nombre_cliente: userInfo.nombre,
        telefono: userInfo.telefono,
        direccion: userInfo.direccion,
        detalle_carrito: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image,
        })),
        total: totalPrice,
      })

      const url = buildWhatsAppUrl(cart)
      window.open(url, '_blank')

      setCart([])
      setCheckoutOpen(false)
      setCartOpen(false)
      showToast('¡Pedido registrado exitosamente!')
    } catch (err) {
      // Si la API falla mostrar error, NO redirigir a WhatsApp
      setCheckoutError(err.message || 'Error al procesar el pedido. Intenta de nuevo.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  useEffect(() => {
    document.body.style.overflow = cartOpen || selectedProduct || checkoutOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen, selectedProduct, checkoutOpen])

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          <a href="/" className="header-logo">
            <img src="/logo.png" alt="El Jardín de Morgana" />
            <span className="header-title">El Jardín de Morgana</span>
          </a>
          <div className="header-search">
            <span className="search-icon"><SearchIcon /></span>
            <input id="search-input" type="text" placeholder="Buscar productos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="header-actions">
            <button className="nav-link-products" onClick={scrollToProducts}>Productos</button>
            <button id="cart-toggle" className="cart-btn" onClick={() => setCartOpen(true)}>
              <CartIcon /><span>Carrito</span>
              {totalItems > 0 && <span className="cart-badge" key={totalItems}>{totalItems}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* CATEGORIES */}
      <nav className="categories-bar">
        <div className="categories-inner">
          {CATEGORIES.map((cat) => (
            <button key={cat} className={`cat-chip ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
          ))}
        </div>
      </nav>

      {/* BANNER */}
      <section className="banner-section">
        <div className="banner-wrapper">
          <img src="/banner.png" alt="Bienvenidos al Jardín de Morgana" />
          <div className="banner-overlay" />
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="products-section" id="productos">
        <h1 className="section-title">Nuestros Productos</h1>
        <p className="section-subtitle">Seleccionados con amor para tu bienestar natural</p>
        <div className="products-grid">
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--color-text-light)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</p>
              <p>Cargando productos...</p>
            </div>
          ) : filtered.map((product) => (
            <article key={product.id} className="product-card" onClick={() => setSelectedProduct(product)}>
              <span className="product-card-category">{product.category}</span>
              <img className={`product-card-img ${product.stock_actual <= 0 ? 'out-of-stock' : ''}`} src={product.image} alt={product.name} />

              {product.stock_actual <= 0 && (
                <div className="stock-badge empty">Agotado</div>
              )}
              {product.stock_actual > 0 && product.stock_actual <= 15 && (
                <div className="stock-badge low">Quedan {product.stock_actual} en stock</div>
              )}

              <div className="product-card-body">
                <div className="product-info">
                  <h2 className="product-name">{product.name}</h2>
                  <p className="product-price">{formatPrice(product.price)}</p>
                </div>
                <button
                  className={`add-cart-btn ${product.stock_actual <= 0 ? 'disabled' : ''}`}
                  onClick={(e) => product.stock_actual > 0 && addToCart(product, e)}
                  title={product.stock_actual > 0 ? "Agregar al carrito" : "Agotado"}
                >
                  <AddCartIcon />
                </button>
              </div>
            </article>
          ))}
          {!loading && filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--color-text-light)' }}>
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}><SearchBigIcon /></div>
              <p>No se encontraron productos</p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-brand-name">El Jardín de Morgana</span>
            <p>Tu espacio natural para cuerpo, mente y alma. Productos seleccionados con amor para tu bienestar.</p>
          </div>
          <div className="footer-col">
            <h3>Ubicación</h3>
            <p> Bogotá, Colombia</p>
            <p>Envíos a nivel nacional</p>
            <p style={{ marginTop: '8px', fontSize: '0.85rem' }}>Realizamos envíos a todas las ciudades de Colombia. ¡Tu bienestar no tiene fronteras!</p>
          </div>
          <div className="footer-col">
            <h3>Contacto</h3>
            <div className="contact-item"><span><MailIcon /></span><a href="mailto:contacto@jardindemorgana.com">contacto@jardindemorgana.com</a></div>
            <div className="contact-item"><span><PhoneIcon /></span><a href={`https://wa.me/${PHONE}`} target="_blank" rel="noopener noreferrer">+57 318 404 5140</a></div>
            <div className="contact-item"><span><ClockIcon /></span><span>Lun - Sáb: 8:00 AM - 6:00 PM</span></div>
          </div>
        </div>
        <div className="footer-bottom"><p>© 2026 El Jardín de Morgana. Todos los derechos reservados.</p></div>
      </footer>

      {/* CART SIDEBAR */}
      <div className={`cart-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} />
      <aside className={`cart-sidebar ${cartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2><CartIcon /> Tu Carrito</h2>
          <button className="cart-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}><PlantIcon /></div>
              <p>Tu carrito está vacío</p>
              <p style={{ fontSize: '0.85rem', marginTop: '8px', color: '#aaa' }}>¡Explora nuestros productos naturales!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <img className="cart-item-img" src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{formatPrice(item.price * item.qty)}</div>
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                    <span className="qty-value">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                </div>
                <button className="cart-item-remove" onClick={() => removeItem(item.id)} title="Eliminar"><TrashIcon /></button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total"><span>Total:</span><span>{formatPrice(totalPrice)}</span></div>
            <button className="whatsapp-btn" onClick={() => { setCartOpen(false); setCheckoutOpen(true) }}>
              <WhatsAppIcon /> Proceder al Pago
            </button>
          </div>
        )}
      </aside>

      {/* PRODUCT MODAL */}
      <div className={`modal-overlay ${selectedProduct ? 'open' : ''}`} onClick={() => setSelectedProduct(null)}>
        {selectedProduct && (
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>✕</button>
            <img className="modal-img" src={selectedProduct.image} alt={selectedProduct.name} />
            <div className="modal-body">
              <span className="modal-category">{selectedProduct.category}</span>
              <h2 className="modal-name">{selectedProduct.name}</h2>
              <p className="modal-price">{formatPrice(selectedProduct.price)}</p>

              {selectedProduct.stock_actual <= 0 ? (
                <p style={{ color: '#c0392b', fontSize: '0.9rem', marginBottom: '16px' }}>Agotado</p>
              ) : selectedProduct.stock_actual <= 15 ? (
                <p style={{ color: '#e67e22', fontSize: '0.9rem', marginBottom: '16px' }}>Quedan {selectedProduct.stock_actual} en stock</p>
              ) : null}

              <p className="modal-desc">{selectedProduct.description}</p>
              <div className="modal-actions">
                <button
                  className="modal-add-btn"
                  onClick={() => { addToCart(selectedProduct); setSelectedProduct(null) }}
                  disabled={selectedProduct.stock_actual <= 0}
                  style={{ opacity: selectedProduct.stock_actual <= 0 ? 0.5 : 1, cursor: selectedProduct.stock_actual <= 0 ? 'not-allowed' : 'pointer' }}
                >
                  <AddCartIcon /> Agregar al Carrito
                </button>
                <a className="modal-buy-btn" href={buildSingleWhatsApp(selectedProduct)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> Consultar</a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== CHECKOUT EXPRESS MODAL ===== */}
      <div className={`modal-overlay ${checkoutOpen ? 'open' : ''}`} onClick={() => !checkoutLoading && setCheckoutOpen(false)}>
        {checkoutOpen && (
          <div className="modal-content checkout-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => !checkoutLoading && setCheckoutOpen(false)} disabled={checkoutLoading}>✕</button>

            <div className="checkout-header">
              <div className="checkout-header-icon" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Naturista</div>
              <h2>Finalizar Pedido</h2>
              <p>Completa tus datos para confirmar tu compra</p>
            </div>

            <form onSubmit={handleCheckout} className="checkout-form">
              <div className="checkout-form-group">
                <label><UserIcon /> Nombre completo</label>
                <input
                  type="text"
                  value={userInfo.nombre}
                  onChange={(e) => setUserInfo((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Tu nombre completo"
                  required
                  disabled={checkoutLoading}
                />
              </div>
              <div className="checkout-form-group">
                <label><PhoneIcon /> Teléfono</label>
                <input
                  type="tel"
                  value={userInfo.telefono}
                  onChange={(e) => setUserInfo((prev) => ({ ...prev, telefono: e.target.value }))}
                  placeholder="300 123 4567"
                  required
                  disabled={checkoutLoading}
                />
              </div>
              <div className="checkout-form-group">
                <label><MapPinIcon /> Dirección de entrega</label>
                <textarea
                  value={userInfo.direccion}
                  onChange={(e) => setUserInfo((prev) => ({ ...prev, direccion: e.target.value }))}
                  placeholder="Dirección completa para el envío..."
                  required
                  disabled={checkoutLoading}
                  rows="2"
                />
              </div>

              <div className="checkout-summary">
                <h3>Resumen del pedido</h3>
                <div className="checkout-items">
                  {cart.map((item) => (
                    <div key={item.id} className="checkout-item">
                      <span className="checkout-item-name">{item.name} <span className="checkout-item-qty">x{item.qty}</span></span>
                      <span className="checkout-item-price">{formatPrice(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="checkout-total">
                  <span>Total a pagar:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {checkoutError && (
                <div className="checkout-error">
                  <span>!</span> {checkoutError}
                </div>
              )}

              <button type="submit" className="whatsapp-btn checkout-submit" disabled={checkoutLoading}>
                {checkoutLoading ? '⏳ Procesando pedido...' : <><WhatsAppIcon /> Confirmar y Enviar por WhatsApp</>}
              </button>
            </form>
          </div>
        )}
      </div>

      <Toast message={toast.message} show={toast.show} />
    </>
  )
}
