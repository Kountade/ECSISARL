// src/components/pos/PointOfSale.jsx
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  X,
  CreditCard,
  Smartphone,
  Banknote,
  Printer,
  Receipt,
  Users,
  Package,
  DollarSign,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  AlertTriangle,
  Eye
} from 'lucide-react'

// Composant produit avec image (corrigé comme dans Products.jsx)
const ProductCard = ({ product, onAddToCart, quantityInCart }) => {
  // Utiliser main_image comme dans Products.jsx
  const imageUrl = product.main_image || product.image || product.image_url || null
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden border ${
        product.stock_quantity === 0 ? 'opacity-60' : 'hover:border-primary/30'
      }`}
      onClick={() => product.stock_quantity > 0 && onAddToCart(product)}
    >
      <div className="relative h-28 bg-gray-100 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200" 
            onError={(e) => {
              e.target.onerror = null
              e.target.src = ''
              e.target.parentElement.innerHTML = '<div class="w-10 h-10 text-gray-400"><Package class="w-10 h-10"/></div>'
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Package className="w-8 h-8" />
          </div>
        )}
        
        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
          <span className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            Stock: {product.stock_quantity}
          </span>
        )}
        
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-red-500 px-2 py-1 rounded-full">Rupture</span>
          </div>
        )}
      </div>
      
      <div className="p-2">
        <h3 className="font-semibold text-sm text-gray-800 truncate">{product.name}</h3>
        <p className="text-xs text-gray-500 truncate">{product.reference || 'Réf: ' + product.id}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="font-bold text-primary text-sm">
            {new Intl.NumberFormat('fr-FR').format(product.sale_price || product.price || product.unit_price)} FCFA
          </span>
          {quantityInCart > 0 && (
            <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {quantityInCart}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Composant ligne du panier
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const imageUrl = item.product_main_image || item.product_image || null
  
  return (
    <div className="flex items-center gap-2 py-2 border-b border-gray-100">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={item.product_name} 
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              e.target.onerror = null
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML = '<div class="w-5 h-5 text-gray-400"><Package class="w-5 h-5"/></div>'
            }}
          />
        ) : (
          <Package className="w-5 h-5 text-gray-400" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-800 truncate">{item.product_name}</p>
        <p className="text-xs text-gray-500">{new Intl.NumberFormat('fr-FR').format(item.unit_price)} FCFA</p>
      </div>
      
      <div className="flex items-center gap-1">
        <button 
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
        <button 
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      
      <div className="text-right min-w-[70px]">
        <p className="font-semibold text-sm">{new Intl.NumberFormat('fr-FR').format(item.subtotal || item.total)} FCFA</p>
      </div>
      
      <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

// Composant Principal POS
const PointOfSale = () => {
  const navigate = useNavigate()
  const searchInputRef = useRef(null)

  // États
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [customers, setCustomers] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [cart, setCart] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [checkoutModal, setCheckoutModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [customerModal, setCustomerModal] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ first_name: '', last_name: '', email: '', phone: '', address: '' })
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(12)

  // Calculs du panier
  const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
  const taxTotal = subtotal * 0.2 // TVA 20%
  const total = subtotal + taxTotal
  const change = paymentAmount ? parseFloat(paymentAmount) - total : 0

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000)
  }

  // Chargement des données
  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsRes, customersRes, warehousesRes] = await Promise.all([
        AxiosInstance.get('/products/'),
        AxiosInstance.get('/customers/'),
        AxiosInstance.get('/warehouses/').catch(() => ({ data: [] }))
      ])
      
      // Traitement des produits - s'assurer que main_image est présent
      const productsData = (productsRes.data || []).map(p => ({
        ...p,
        main_image: p.main_image || p.image || p.image_url || null,
        sale_price: p.sale_price || p.price || p.unit_price || 0,
        stock_quantity: p.stock_quantity || 0
      }))
      
      setProducts(productsData)
      setCustomers(customersRes.data || [])
      setWarehouses(warehousesRes.data || [])
      
      if (warehousesRes.data?.length > 0) setSelectedWarehouse(warehousesRes.data[0])
      
      // Extraire catégories uniques
      const uniqueCategories = [...new Set((productsData || []).map(p => p.category_name).filter(Boolean))]
      setCategories(uniqueCategories)
      
    } catch (error) {
      console.error('Error fetching data:', error)
      showNotification('Erreur de chargement des produits', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    searchInputRef.current?.focus()
  }, [])

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || product.category_name === selectedCategory
    const inStock = product.stock_quantity > 0
    
    return matchesSearch && matchesCategory && inStock
  })

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)

  // Gestion du panier
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock_quantity) {
        showNotification(`Stock insuffisant pour ${product.name}`, 'error')
        return
      }
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unit_price }
          : item
      ))
    } else {
      if (product.stock_quantity < 1) {
        showNotification(`Stock insuffisant pour ${product.name}`, 'error')
        return
      }
      setCart([...cart, {
        id: Date.now(),
        product_id: product.id,
        product_name: product.name,
        product_reference: product.reference,
        product_main_image: product.main_image,
        unit_price: product.sale_price,
        quantity: 1,
        subtotal: product.sale_price
      }])
    }
    showNotification(`${product.name} ajouté au panier`, 'success')
  }

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id)
      return
    }
    const item = cart.find(i => i.id === id)
    const product = products.find(p => p.id === item.product_id)
    
    if (newQuantity > product.stock_quantity) {
      showNotification(`Stock insuffisant (max: ${product.stock_quantity})`, 'error')
      return
    }
    
    setCart(cart.map(item =>
      item.id === id
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.unit_price }
        : item
    ))
  }

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const clearCart = () => {
    if (window.confirm('Vider tout le panier ?')) {
      setCart([])
    }
  }

  // Création client rapide
  const createCustomer = async () => {
    if (!newCustomer.first_name && !newCustomer.last_name && !newCustomer.company_name) {
      showNotification('Veuillez saisir au moins un nom', 'error')
      return
    }
    
    try {
      const customerData = {
        code: `CUST${Date.now()}`,
        first_name: newCustomer.first_name,
        last_name: newCustomer.last_name,
        email: newCustomer.email || 'client@temp.com',
        phone: newCustomer.phone || '00000000',
        address: newCustomer.address || '-',
        city: '-',
        postal_code: '-',
        country: 'Sénégal',
        customer_type: 'individual'
      }
      
      const response = await AxiosInstance.post('/customers/', customerData)
      setCustomers([...customers, response.data])
      setSelectedCustomer(response.data)
      setCustomerModal(false)
      setNewCustomer({ first_name: '', last_name: '', email: '', phone: '', address: '' })
      showNotification('Client créé avec succès', 'success')
    } catch (error) {
      console.error('Error creating customer:', error)
      showNotification('Erreur lors de la création du client', 'error')
    }
  }

  // Finalisation de la vente
  const finalizeSale = async () => {
    if (cart.length === 0) {
      showNotification('Panier vide', 'error')
      return
    }
    if (!selectedWarehouse) {
      showNotification('Sélectionnez un entrepôt', 'error')
      return
    }
    
    if (paymentMethod === 'cash' && (!paymentAmount || parseFloat(paymentAmount) < total)) {
      showNotification(`Montant insuffisant. Total: ${new Intl.NumberFormat('fr-FR').format(total)} FCFA`, 'error')
      return
    }

    setLoading(true)
    
    try {
      const saleData = {
        customer: selectedCustomer?.id || null,
        warehouse: selectedWarehouse.id,
        items: cart.map(item => ({
          product: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_rate: 0,
          tax_rate: 20
        })),
        notes: `Vente POS - ${new Date().toLocaleString()}`
      }

      const saleResponse = await AxiosInstance.post('/sales/', saleData)
      const sale = saleResponse.data

      // Confirmer la vente
      await AxiosInstance.post(`/sales/${sale.id}/confirm/`)

      // Créer la facture
      const invoiceResponse = await AxiosInstance.post('/invoices/', {
        sale: sale.id,
        due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
      })
      const invoice = invoiceResponse.data

      // Créer le paiement
      await AxiosInstance.post('/payments/', {
        invoice: invoice.id,
        amount: total,
        payment_method: paymentMethod,
        notes: `Paiement POS - ${paymentMethod}`
      })

      showNotification('Vente effectuée avec succès!', 'success')
      
      // Imprimer le ticket
      printReceipt(sale, invoice, cart, total, selectedCustomer)
      
      // Réinitialiser
      setCart([])
      setSelectedCustomer(null)
      setCheckoutModal(false)
      setPaymentAmount('')
      
      // Recharger les produits pour mettre à jour les stocks
      await fetchData()
      
    } catch (error) {
      console.error('Error finalizing sale:', error)
      showNotification(error.response?.data?.error || 'Erreur lors de la finalisation', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Impression du ticket
  const printReceipt = (sale, invoice, items, totalAmount, customer) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      showNotification('Veuillez autoriser les popups', 'error')
      return
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ticket de caisse ${sale.sale_number}</title>
        <style>
          body { 
            font-family: 'Courier New', monospace; 
            font-size: 12px; 
            width: 80mm; 
            margin: 0 auto; 
            padding: 10px;
            background: white;
          }
          .header { text-align: center; margin-bottom: 15px; }
          .title { font-size: 16px; font-weight: bold; color: #1E3A5F; }
          .subtitle { font-size: 10px; color: #666; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .divider-double { border-top: 2px solid #000; margin: 10px 0; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; font-size: 11px; }
          .item-name { flex: 1; }
          .item-qty { width: 40px; text-align: center; }
          .item-price { width: 70px; text-align: right; }
          .total-line { display: flex; justify-content: space-between; margin: 5px 0; font-weight: bold; }
          .grand-total { font-size: 14px; color: #1E3A5F; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 9px; color: #666; }
          .text-center { text-align: center; }
          .thankyou { font-size: 12px; font-weight: bold; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">ECSI SARL</div>
          <div class="subtitle">Solution ERP Intégrée</div>
          <div class="subtitle">Abidjan, Côte d'Ivoire</div>
          <div class="divider"></div>
          <div><strong>TICKET DE CAISSE</strong></div>
          <div>N° ${sale.sale_number}</div>
          <div>${new Date().toLocaleString()}</div>
        </div>
        
        <div class="divider"></div>
        
        ${items.map(item => `
          <div class="item">
            <span class="item-name">${item.product_name}</span>
            <span class="item-qty">x${item.quantity}</span>
            <span class="item-price">${new Intl.NumberFormat('fr-FR').format(item.subtotal)} FCFA</span>
          </div>
        `).join('')}
        
        <div class="divider"></div>
        
        <div class="total-line">
          <span>SOUS-TOTAL</span>
          <span>${new Intl.NumberFormat('fr-FR').format(subtotal)} FCFA</span>
        </div>
        <div class="total-line">
          <span>TVA (20%)</span>
          <span>${new Intl.NumberFormat('fr-FR').format(taxTotal)} FCFA</span>
        </div>
        <div class="divider"></div>
        <div class="total-line grand-total">
          <span>TOTAL TTC</span>
          <span>${new Intl.NumberFormat('fr-FR').format(totalAmount)} FCFA</span>
        </div>
        
        <div class="divider"></div>
        
        <div class="total-line">
          <span>Client:</span>
          <span>${customer?.full_name || customer?.company_name || 'Client comptant'}</span>
        </div>
        <div class="total-line">
          <span>Mode:</span>
          <span>${paymentMethod === 'cash' ? 'Espèces' : paymentMethod === 'card' ? 'Carte bancaire' : 'Mobile Money'}</span>
        </div>
        ${paymentMethod === 'cash' && paymentAmount ? `
        <div class="total-line">
          <span>Montant reçu:</span>
          <span>${new Intl.NumberFormat('fr-FR').format(parseFloat(paymentAmount))} FCFA</span>
        </div>
        <div class="total-line">
          <span>Monnaie:</span>
          <span>${new Intl.NumberFormat('fr-FR').format(change)} FCFA</span>
        </div>
        ` : ''}
        
        <div class="divider-double"></div>
        
        <div class="thankyou text-center">
          MERCI DE VOTRE VISITE!
        </div>
        
        <div class="footer">
          <div>Retours acceptés sous 14 jours</div>
          <div>www.ecsi.ci | +225 27 22 51 51 51</div>
          <div>Généré le ${new Date().toLocaleString()}</div>
        </div>
      </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.print()
    printWindow.onafterprint = () => printWindow.close()
  }

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'F1' || e.key === 'F2') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'F12' && cart.length > 0) {
        e.preventDefault()
        setCheckoutModal(true)
      }
      if (e.key === 'Escape' && checkoutModal) {
        setCheckoutModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [cart, checkoutModal])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement du point de vente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm py-2`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-ghost btn-xs">✕</button>
          </div>
        </div>
      )}

      {/* Barre supérieure */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Home className="w-6 h-6" />
          <div>
            <h1 className="text-xl font-bold">ECSI POS</h1>
            <p className="text-xs opacity-80">Point de vente intégré</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold">{selectedWarehouse?.name || 'Sélectionner entrepôt'}</p>
            <p className="text-xs opacity-80">{new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
          
          <select 
            className="select select-sm bg-white/20 text-white border-white/30 text-sm"
            value={selectedWarehouse?.id || ''}
            onChange={(e) => {
              const wh = warehouses.find(w => w.id === parseInt(e.target.value))
              setSelectedWarehouse(wh)
            }}
          >
            {warehouses.map(wh => (
              <option key={wh.id} value={wh.id} className="text-gray-900">{wh.name}</option>
            ))}
          </select>
          
          <button onClick={() => navigate('/')} className="btn btn-ghost btn-sm text-white">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Corps principal */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Colonne gauche - Produits */}
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          
          {/* Barre de recherche et filtres */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher (nom, référence, code-barres)... F1/F2"
                className="input input-bordered w-full pl-10 py-2 text-sm"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              />
            </div>
            
            <select 
              className="select select-bordered select-sm"
              value={selectedCategory} 
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1) }}
            >
              <option value="all">Toutes catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <button onClick={fetchData} className="btn btn-outline btn-sm" title="Actualiser">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Grille produits */}
          <div className="flex-1 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Aucun produit trouvé</p>
                <p className="text-sm text-gray-400 mt-1">Essayez de modifier votre recherche</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {paginatedProducts.map(product => {
                    const cartItem = cart.find(item => item.product_id === product.id)
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={addToCart}
                        quantityInCart={cartItem?.quantity || 0}
                      />
                    )
                  })}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="btn btn-sm btn-ghost"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm">
                      Page {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="btn btn-sm btn-ghost"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Colonne droite - Panier */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-lg">
          
          {/* En-tête panier */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Panier</h2>
                <span className="badge badge-primary badge-sm">{cart.length} article(s)</span>
              </div>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-red-500 hover:text-red-700 text-xs">
                  Tout vider
                </button>
              )}
            </div>
            
            {/* Raccourci clavier */}
            <div className="text-xs text-gray-400 mt-1">
              F12 = Paiement
            </div>
          </div>

          {/* Liste articles */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400">Panier vide</p>
                <p className="text-xs text-gray-400 mt-1">Cliquez sur un produit pour l'ajouter</p>
              </div>
            ) : (
              cart.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))
            )}
          </div>

          {/* Totaux */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(subtotal)} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA (20%)</span>
                  <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(taxTotal)} FCFA</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total TTC</span>
                  <span className="text-primary">{new Intl.NumberFormat('fr-FR').format(total)} FCFA</span>
                </div>
              </div>

              {/* Boutons action */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setCustomerModal(true)}
                  className="btn btn-outline w-full gap-2 text-sm"
                >
                  <Users className="w-4 h-4" />
                  {selectedCustomer 
                    ? `Client: ${selectedCustomer.full_name || selectedCustomer.company_name}` 
                    : 'Sélectionner un client (optionnel)'}
                </button>
                
                <button
                  onClick={() => setCheckoutModal(true)}
                  className="btn btn-primary w-full gap-2 text-base py-3"
                >
                  <CreditCard className="w-5 h-5" />
                  Payer {new Intl.NumberFormat('fr-FR').format(total)} FCFA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Paiement */}
      {checkoutModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">Finaliser le paiement</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Mode de paiement</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`btn btn-sm ${paymentMethod === 'cash' ? 'btn-primary' : 'btn-outline'} gap-1`}
                  >
                    <Banknote className="w-4 h-4" /> Espèces
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`btn btn-sm ${paymentMethod === 'card' ? 'btn-primary' : 'btn-outline'} gap-1`}
                  >
                    <CreditCard className="w-4 h-4" /> Carte
                  </button>
                  <button
                    onClick={() => setPaymentMethod('mobile_money')}
                    className={`btn btn-sm ${paymentMethod === 'mobile_money' ? 'btn-primary' : 'btn-outline'} gap-1`}
                  >
                    <Smartphone className="w-4 h-4" /> Mobile Money
                  </button>
                </div>
              </div>

              <div className="bg-gray-100 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-500">Total à payer</p>
                <p className="text-2xl font-bold text-primary">{new Intl.NumberFormat('fr-FR').format(total)} FCFA</p>
              </div>

              {paymentMethod === 'cash' && (
                <div>
                  <label className="text-sm font-medium">Montant reçu</label>
                  <input
                    type="number"
                    className="input input-bordered w-full mt-1"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Saisir le montant reçu"
                    autoFocus
                  />
                  {paymentAmount && parseFloat(paymentAmount) >= total && (
                    <div className="mt-2 p-2 bg-success/10 rounded-lg">
                      <p className="text-sm font-medium text-success">
                        Monnaie à rendre: {new Intl.NumberFormat('fr-FR').format(change)} FCFA
                      </p>
                    </div>
                  )}
                  {paymentAmount && parseFloat(paymentAmount) < total && (
                    <p className="text-xs text-error mt-1">
                      Montant insuffisant. Il manque {new Intl.NumberFormat('fr-FR').format(total - parseFloat(paymentAmount))} FCFA
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button onClick={() => setCheckoutModal(false)} className="btn btn-ghost flex-1">
                  Annuler (ESC)
                </button>
                <button 
                  onClick={finalizeSale} 
  disabled={loading}
                  className="btn btn-primary flex-1 gap-2"
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <Printer className="w-4 h-4" />
                  )}
                  Valider et imprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Client */}
      {customerModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">Client</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Client existant</label>
                <select
                  className="select select-bordered w-full mt-1 text-sm"
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const customer = customers.find(c => c.id === parseInt(e.target.value))
                    setSelectedCustomer(customer || null)
                    if (e.target.value) setCustomerModal(false)
                  }}
                >
                  <option value="">Client comptant (non enregistré)</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.full_name || c.company_name} - {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="divider text-xs">OU</div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Nouveau client rapide</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Prénom"
                    className="input input-bordered input-sm"
                    value={newCustomer.first_name}
                    onChange={(e) => setNewCustomer({...newCustomer, first_name: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Nom"
                    className="input input-bordered input-sm"
                    value={newCustomer.last_name}
                    onChange={(e) => setNewCustomer({...newCustomer, last_name: e.target.value})}
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  className="input input-bordered input-sm w-full"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                />
                <input
                  type="tel"
                  placeholder="Téléphone"
                  className="input input-bordered input-sm w-full"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Adresse"
                  className="input input-bordered input-sm w-full"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                />
                <button onClick={createCustomer} className="btn btn-primary btn-sm w-full gap-2">
                  <UserPlus className="w-4 h-4" /> Créer le client
                </button>
              </div>
            </div>

            <div className="modal-action">
              <button onClick={() => setCustomerModal(false)} className="btn btn-ghost btn-sm">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
        
        /* Scroll personnalisé */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  )
}

export default PointOfSale