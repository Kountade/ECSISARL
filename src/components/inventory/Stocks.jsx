// src/components/inventory/Stocks.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'  // ← AJOUTER CET IMPORT
import AxiosInstance from '../AxiosInstance'
import {
  Plus,
  Search,
  RefreshCw,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  Package,
  Warehouse,
  History,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  DollarSign,
  Boxes
} from 'lucide-react'

const Stocks = () => {
  const navigate = useNavigate()  // ← AJOUTER CECI

  // États
  const [stocks, setStocks] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals - SUPPRIMER showMovementModal
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productHistory, setProductHistory] = useState([])

  // Notification
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  // Filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [filterWarehouse, setFilterWarehouse] = useState('')
  const [filterStock, setFilterStock] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState('product_name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Statistiques
  const [stats, setStats] = useState({
    total_products: 0,
    total_stock: 0,
    low_stock: 0,
    out_of_stock: 0,
    total_value: 0
  })

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number)
  }

  const formatCurrency = (amount) => {
    return `${formatNumber(amount)} FCFA`
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsRes, warehousesRes, movementsRes] = await Promise.all([
        AxiosInstance.get('/products/'),
        AxiosInstance.get('/warehouses/'),
        AxiosInstance.get('/stock-movements/')
      ])
      
      setProducts(productsRes.data)
      setWarehouses(warehousesRes.data)
      setMovements(movementsRes.data)

      // Calculer le stock par produit/entrepôt
      const stockMap = new Map()
      movementsRes.data.forEach(movement => {
        const warehouseId = movement.to_warehouse || movement.from_warehouse
        const key = `${movement.product}_${warehouseId}`
        
        if (!stockMap.has(key)) {
          stockMap.set(key, {
            product: movement.product,
            product_name: movement.product_name,
            product_reference: movement.product_reference,
            warehouse: warehouseId,
            warehouse_name: movement.to_warehouse_name || movement.from_warehouse_name,
            quantity: 0,
            unit_price: movement.unit_price || 0
          })
        }

        const stock = stockMap.get(key)
        if (movement.movement_type === 'in' || movement.movement_type === 'return') {
          stock.quantity += movement.quantity
        } else if (movement.movement_type === 'out' || movement.movement_type === 'transfer') {
          stock.quantity -= movement.quantity
        }
      })

      const stocksArray = Array.from(stockMap.values())
      setStocks(stocksArray)

      // Calculer les statistiques
      const total_stock = stocksArray.reduce((acc, s) => acc + s.quantity, 0)
      const low_stock = stocksArray.filter(s => s.quantity <= 5 && s.quantity > 0).length
      const out_of_stock = stocksArray.filter(s => s.quantity <= 0).length
      const total_value = stocksArray.reduce((acc, s) => {
        const product = productsRes.data.find(p => p.id === s.product)
        return acc + (s.quantity * (product?.purchase_price || 0))
      }, 0)

      setStats({
        total_products: productsRes.data.length,
        total_stock,
        low_stock,
        out_of_stock,
        total_value
      })

    } catch (error) {
      console.error('Error fetching data:', error)
      showNotification('Erreur lors du chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenHistoryModal = (product) => {
    setSelectedProduct(product)
    const history = movements.filter(m => m.product === product.product)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    setProductHistory(history)
    setShowHistoryModal(true)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = (stock.product_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (stock.product_reference?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesWarehouse = !filterWarehouse || stock.warehouse == filterWarehouse
    const matchesStock = !filterStock ||
                        (filterStock === 'low' && stock.quantity <= 5 && stock.quantity > 0) ||
                        (filterStock === 'out' && stock.quantity <= 0) ||
                        (filterStock === 'normal' && stock.quantity > 5)

    return matchesSearch && matchesWarehouse && matchesStock
  })

  const getFilteredByTab = () => {
    switch (activeTab) {
      case 'low': return filteredStocks.filter(s => s.quantity <= 5 && s.quantity > 0)
      case 'out': return filteredStocks.filter(s => s.quantity <= 0)
      default: return filteredStocks
    }
  }

  const displayedStocks = getFilteredByTab()
  
  const sortedStocks = [...displayedStocks].sort((a, b) => {
    let aVal = a[sortField] || ''
    let bVal = b[sortField] || ''
    
    if (sortField === 'quantity') {
      aVal = parseInt(aVal) || 0
      bVal = parseInt(bVal) || 0
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedStocks.length / itemsPerPage)
  const paginatedStocks = sortedStocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-3 h-3" /> : 
      <ChevronDown className="w-3 h-3" />
  }

  const tabs = [
    { id: 'all', label: 'Tous les stocks', icon: Package },
    { id: 'low', label: 'Stock faible', icon: AlertTriangle },
    { id: 'out', label: 'En rupture', icon: X }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base font-medium text-base-content/70 animate-pulse">
            Chargement des stocks...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-3 lg:p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 lg:top-20 right-3 lg:right-6 z-50 animate-slideDown w-[calc(100%-1.5rem)] lg:w-auto max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            ) : (
              <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            )}
            <span className="text-sm lg:text-base font-medium">{notification.message}</span>
            <button 
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
            Gestion des Stocks
          </h1>
          <p className="text-xs lg:text-sm text-base-content/60">
            Suivez vos niveaux de stock en temps réel
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={fetchData}
            className="btn btn-outline btn-sm lg:btn-md gap-1 lg:gap-2"
          >
            <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          {/* ← BOUTON MODIFIÉ : redirection vers /stocks/nouveau */}
          <button 
            onClick={() => navigate('/stocks/nouveau')}
            className="btn btn-primary btn-sm lg:btn-md gap-1 lg:gap-2"
          >
            <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Nouveau mouvement</span>
            <span className="sm:hidden">Mouvement</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-3">
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-primary">
            <Package className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Total produits</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.total_products}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-info">
            <Boxes className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Quantité totale</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.total_stock}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-warning">
            <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Stock faible</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.low_stock}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-error">
            <X className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">En rupture</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.out_of_stock}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4 col-span-2 lg:col-span-1">
          <div className="stat-figure text-success">
            <DollarSign className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Valeur stock</div>
          <div className="stat-value text-base lg:text-xl truncate">
            {formatCurrency(stats.total_value)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-100 p-1 rounded-xl shadow-sm border border-base-300">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`tab gap-2 text-sm lg:text-base ${activeTab === tab.id ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.id === 'low' && stats.low_stock > 0 && (
                <span className="badge badge-warning badge-xs">{stats.low_stock}</span>
              )}
              {tab.id === 'out' && stats.out_of_stock > 0 && (
                <span className="badge badge-error badge-xs">{stats.out_of_stock}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Filtres - Desktop */}
      <div className="hidden lg:block bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher par produit, référence..."
              className="input input-bordered input-sm w-full pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          
          <select 
            className="select select-bordered select-sm min-w-[180px]"
            value={filterWarehouse}
            onChange={(e) => {
              setFilterWarehouse(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">Tous les entrepôts</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          
          <select 
            className="select select-bordered select-sm w-36"
            value={filterStock}
            onChange={(e) => {
              setFilterStock(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">Tous états</option>
            <option value="normal">Normal</option>
            <option value="low">Faible</option>
            <option value="out">Rupture</option>
          </select>
          
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSearchTerm('')
              setFilterWarehouse('')
              setFilterStock('')
              setCurrentPage(1)
            }}
          >
            <Filter className="w-3 h-3" />
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Filtres - Mobile */}
      <div className="lg:hidden">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="input input-bordered input-sm w-full pl-8 text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter className="w-3 h-3" />
            Filtres
          </button>
        </div>

        {showMobileFilters && (
          <div className="mt-2 p-3 bg-base-100 rounded-lg border border-base-300 space-y-2">
            <select 
              className="select select-bordered select-sm w-full"
              value={filterWarehouse}
              onChange={(e) => {
                setFilterWarehouse(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Tous les entrepôts</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            
            <select 
              className="select select-bordered select-sm w-full"
              value={filterStock}
              onChange={(e) => {
                setFilterStock(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Tous les états</option>
              <option value="normal">Normal</option>
              <option value="low">Faible</option>
              <option value="out">Rupture</option>
            </select>
            
            <button 
              className="btn btn-outline btn-sm w-full"
              onClick={() => {
                setSearchTerm('')
                setFilterWarehouse('')
                setFilterStock('')
                setCurrentPage(1)
                setShowMobileFilters(false)
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Tableau - Desktop */}
      <div className="hidden lg:block bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr className="bg-base-200">
                <th>
                  <button 
                    className="flex items-center gap-1 hover:text-primary font-semibold"
                    onClick={() => handleSort('product_name')}
                  >
                    Produit
                    <SortIcon field="product_name" />
                  </button>
                </th>
                <th>Entrepôt</th>
                <th>
                  <button 
                    className="flex items-center gap-1 hover:text-primary font-semibold"
                    onClick={() => handleSort('quantity')}
                  >
                    Quantité
                    <SortIcon field="quantity" />
                  </button>
                </th>
                <th>Statut</th>
                <th className="text-right">Valeur</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStocks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-3 text-base-content/30" />
                    <p className="text-base font-medium text-base-content/50">
                      Aucun stock trouvé
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedStocks.map((stock) => {
                  const status = stock.quantity <= 0 ? 'rupture' : stock.quantity <= 5 ? 'faible' : 'normal'
                  const product = products.find(p => p.id === stock.product)
                  const value = stock.quantity * (product?.purchase_price || 0)

                  return (
                    <tr key={`${stock.product}_${stock.warehouse}`} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-primary/10 text-primary rounded-lg w-10 h-10">
                              <Package className="w-5 h-5" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{stock.product_name}</div>
                            <div className="text-xs text-base-content/60">{stock.product_reference}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Warehouse className="w-4 h-4 text-base-content/50" />
                          {stock.warehouse_name}
                        </div>
                      </td>
                      <td>
                        <span className={`font-bold text-lg ${
                          status === 'rupture' ? 'text-error' : 
                          status === 'faible' ? 'text-warning' : 'text-success'
                        }`}>
                          {stock.quantity}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          status === 'rupture' ? 'badge-error' : 
                          status === 'faible' ? 'badge-warning' : 'badge-success'
                        }`}>
                          {status === 'rupture' ? 'RUPTURE' : 
                           status === 'faible' ? 'STOCK FAIBLE' : 'NORMAL'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="font-semibold">{formatCurrency(value)}</div>
                        <div className="text-xs text-base-content/60">
                          {formatCurrency(product?.purchase_price || 0)} / unité
                        </div>
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button 
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleOpenHistoryModal(stock)}
                          >
                            <History className="w-4 h-4" />
                          </button>
                          {/* ← BOUTON MODIFIÉ */}
                          <button 
                            className="btn btn-ghost btn-xs"
                            onClick={() => navigate('/stocks/nouveau')}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Liste - Mobile */}
      <div className="lg:hidden space-y-2">
        {paginatedStocks.length === 0 ? (
          <div className="bg-base-100 rounded-xl p-8 text-center border border-base-300">
            <Package className="w-12 h-12 mx-auto mb-2 text-base-content/30" />
            <p className="text-sm font-medium text-base-content/50">
              Aucun stock trouvé
            </p>
          </div>
        ) : (
          paginatedStocks.map((stock) => {
            const status = stock.quantity <= 0 ? 'rupture' : stock.quantity <= 5 ? 'faible' : 'normal'
            const product = products.find(p => p.id === stock.product)
            const value = stock.quantity * (product?.purchase_price || 0)

            return (
              <div key={`${stock.product}_${stock.warehouse}`} className="bg-base-100 rounded-xl p-3 border border-base-300 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-primary/10 text-primary rounded-lg w-12 h-12">
                      <Package className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm">{stock.product_name}</h3>
                        <p className="text-xs text-base-content/60">{stock.product_reference}</p>
                      </div>
                      <span className={`badge ${
                        status === 'rupture' ? 'badge-error' : 
                        status === 'faible' ? 'badge-warning' : 'badge-success'
                      } badge-sm`}>
                        {status === 'rupture' ? 'RUPTURE' : 
                         status === 'faible' ? 'FAIBLE' : 'OK'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <Warehouse className="w-3 h-3 text-base-content/50" />
                      <span>{stock.warehouse_name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <span className={`text-lg font-bold ${
                          status === 'rupture' ? 'text-error' : 
                          status === 'faible' ? 'text-warning' : 'text-success'
                        }`}>
                          {stock.quantity}
                        </span>
                        <span className="text-xs text-base-content/60 ml-1">unités</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">{formatCurrency(value)}</div>
                        <div className="text-xs text-base-content/60">
                          {formatCurrency(product?.purchase_price || 0)}/u
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-base-200">
                  <button 
                    className="btn btn-ghost btn-xs"
                    onClick={() => handleOpenHistoryModal(stock)}
                  >
                    <History className="w-3 h-3" />
                    <span className="text-xs">Historique</span>
                  </button>
                  {/* ← BOUTON MODIFIÉ */}
                  <button 
                    className="btn btn-ghost btn-xs"
                    onClick={() => navigate('/stocks/nouveau')}
                  >
                    <Plus className="w-3 h-3" />
                    <span className="text-xs">Mouvement</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {sortedStocks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs lg:text-sm text-base-content/60">
            {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedStocks.length)} sur {sortedStocks.length} stocks
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              className="select select-bordered select-xs lg:select-sm w-20 lg:w-28"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value))
                setCurrentPage(1)
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            
            <div className="join">
              <button 
                className="join-item btn btn-xs lg:btn-sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
              
              <span className="join-item btn btn-xs lg:btn-sm no-animation">
                {currentPage} / {totalPages}
              </span>
              
              <button 
                className="join-item btn btn-xs lg:btn-sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Historique */}
      {showHistoryModal && selectedProduct && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Historique des mouvements</h3>
              </div>
              <button 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowHistoryModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-base-content/60 mb-4">
              {selectedProduct.product_name} - {selectedProduct.product_reference}
            </p>
            
            {productHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 mx-auto mb-2 text-base-content/30" />
                <p className="text-base-content/50">Aucun mouvement pour ce produit</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr className="bg-base-200">
                      <th>Date</th>
                      <th>Type</th>
                      <th className="text-center">Quantité</th>
                      <th>Entrepôt</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productHistory.map((movement, idx) => {
                      const typeConfig = {
                        in: { label: 'ENTRÉE', color: 'badge-success' },
                        out: { label: 'SORTIE', color: 'badge-error' },
                        transfer: { label: 'TRANSFERT', color: 'badge-info' },
                        adjustment: { label: 'AJUSTEMENT', color: 'badge-warning' }
                      }
                      const config = typeConfig[movement.movement_type] || typeConfig.in

                      return (
                        <tr key={idx}>
                          <td className="text-xs">{formatDate(movement.created_at)}</td>
                          <td>
                            <span className={`badge ${config.color} badge-xs`}>
                              {config.label}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className={movement.movement_type === 'in' ? 'text-success font-bold' : 'text-error font-bold'}>
                              {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                            </span>
                          </td>
                          <td className="text-xs">
                            {movement.to_warehouse_name || movement.from_warehouse_name || '-'}
                          </td>
                          <td className="text-xs max-w-xs truncate">
                            {movement.notes || '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="modal-action">
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setShowHistoryModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Stocks