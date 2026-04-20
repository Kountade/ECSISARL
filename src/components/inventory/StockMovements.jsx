// src/components/inventory/StockMovements.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  History,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  DollarSign,
  Edit,
  Trash2,
  Download,
  Calendar,
  Eye
} from 'lucide-react'

const StockMovements = () => {
  const navigate = useNavigate()

  // États
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [movementToDelete, setMovementToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  // Filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterProduct, setFilterProduct] = useState('')
  const [filterWarehouse, setFilterWarehouse] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState('movement_date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Statistiques
  const [stats, setStats] = useState({
    entries: 0,
    exits: 0,
    transfers: 0,
    adjustments: 0,
    totalQuantity: 0
  })

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatShortDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const getMovementTypeInfo = (type) => {
    const types = {
      'in': { label: 'Entrée', color: 'badge-success', icon: TrendingUp, bgColor: 'bg-success/10' },
      'out': { label: 'Sortie', color: 'badge-error', icon: TrendingDown, bgColor: 'bg-error/10' },
      'transfer': { label: 'Transfert', color: 'badge-info', icon: ArrowLeftRight, bgColor: 'bg-info/10' },
      'adjustment': { label: 'Ajustement', color: 'badge-warning', icon: Edit, bgColor: 'bg-warning/10' },
      'return': { label: 'Retour', color: 'badge-secondary', icon: ArrowLeftRight, bgColor: 'bg-secondary/10' },
      'scrap': { label: 'Mise au rebut', color: 'badge-error', icon: Trash2, bgColor: 'bg-error/10' }
    }
    return types[type] || { label: type, color: 'badge-ghost', icon: History, bgColor: 'bg-base-200' }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [movementsRes, productsRes, warehousesRes] = await Promise.all([
        AxiosInstance.get('/stock-movements/'),
        AxiosInstance.get('/products/'),
        AxiosInstance.get('/warehouses/')
      ])
      
      const movementsData = movementsRes.data
      setMovements(movementsData)
      setProducts(productsRes.data)
      setWarehouses(warehousesRes.data)

      // Calculer les statistiques
      setStats({
        entries: movementsData.filter(m => m.movement_type === 'in').length,
        exits: movementsData.filter(m => m.movement_type === 'out').length,
        transfers: movementsData.filter(m => m.movement_type === 'transfer').length,
        adjustments: movementsData.filter(m => m.movement_type === 'adjustment').length,
        totalQuantity: movementsData.reduce((sum, m) => {
          if (m.movement_type === 'in') return sum + m.quantity
          if (m.movement_type === 'out') return sum - m.quantity
          return sum
        }, 0)
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

  const handleDelete = async () => {
    if (!movementToDelete) return
    
    try {
      await AxiosInstance.delete(`/stock-movements/${movementToDelete.id}/`)
      showNotification('Mouvement supprimé avec succès', 'success')
      fetchData()
      setShowDeleteModal(false)
      setMovementToDelete(null)
    } catch (err) {
      console.error('Erreur:', err)
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Référence', 'Produit', 'Quantité', 'De', 'Vers', 'Notes']
    const data = filteredMovements.map(m => [
      formatShortDate(m.movement_date),
      getMovementTypeInfo(m.movement_type).label,
      m.reference,
      m.product_name,
      m.quantity,
      m.from_warehouse_name || '-',
      m.to_warehouse_name || '-',
      m.notes || ''
    ])

    const csvContent = [headers.join(','), ...data.map(row => row.join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mouvements_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = (movement.product_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (movement.reference?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (movement.product_reference?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    const matchesType = !filterType || movement.movement_type === filterType
    const matchesProduct = !filterProduct || movement.product == filterProduct
    const matchesWarehouse = !filterWarehouse ||
      movement.from_warehouse == filterWarehouse ||
      movement.to_warehouse == filterWarehouse

    const movementDate = new Date(movement.movement_date)
    const matchesStartDate = !startDate || movementDate >= new Date(startDate)
    const matchesEndDate = !endDate || movementDate <= new Date(endDate + 'T23:59:59')

    return matchesSearch && matchesType && matchesProduct && matchesWarehouse && matchesStartDate && matchesEndDate
  })

  const sortedMovements = [...filteredMovements].sort((a, b) => {
    let aVal = a[sortField] || ''
    let bVal = b[sortField] || ''
    
    if (sortField === 'movement_date') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    } else if (sortField === 'quantity') {
      aVal = parseInt(aVal) || 0
      bVal = parseInt(bVal) || 0
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedMovements.length / itemsPerPage)
  const paginatedMovements = sortedMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-3 h-3" /> : 
      <ChevronDown className="w-3 h-3" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base font-medium text-base-content/70 animate-pulse">
            Chargement des mouvements...
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
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content flex items-center gap-2">
            <History className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
            Mouvements de Stock
          </h1>
          <p className="text-xs lg:text-sm text-base-content/60 mt-1">
            Historique complet des entrées et sorties
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
          <button 
            onClick={exportToCSV}
            disabled={filteredMovements.length === 0}
            className="btn btn-outline btn-sm lg:btn-md gap-1 lg:gap-2"
          >
            <Download className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          {/* Redirection vers /stock-movements/nouveau */}
          <button 
            onClick={() => navigate('/stock-movements/nouveau')}
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
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border-l-4 border-success p-2 lg:p-4">
          <div className="stat-figure text-success">
            <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Entrées</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.entries}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border-l-4 border-error p-2 lg:p-4">
          <div className="stat-figure text-error">
            <TrendingDown className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Sorties</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.exits}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border-l-4 border-info p-2 lg:p-4">
          <div className="stat-figure text-info">
            <ArrowLeftRight className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Transferts</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.transfers}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border-l-4 border-warning p-2 lg:p-4">
          <div className="stat-figure text-warning">
            <Edit className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Ajustements</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.adjustments}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border-l-4 border-primary p-2 lg:p-4 col-span-2 lg:col-span-1">
          <div className="stat-figure text-primary">
            <Package className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Stock net</div>
          <div className="stat-value text-base lg:text-xl">
            {stats.totalQuantity > 0 ? '+' : ''}{stats.totalQuantity}
          </div>
        </div>
      </div>

      {/* Filtres - Desktop */}
      <div className="hidden lg:block bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[200px] relative">
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
            className="select select-bordered select-sm w-32"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">Tous types</option>
            <option value="in">Entrée</option>
            <option value="out">Sortie</option>
            <option value="transfer">Transfert</option>
            <option value="adjustment">Ajustement</option>
            <option value="return">Retour</option>
          </select>
          
          <select 
            className="select select-bordered select-sm min-w-[180px]"
            value={filterProduct}
            onChange={(e) => {
              setFilterProduct(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">Tous produits</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          
          <select 
            className="select select-bordered select-sm min-w-[180px]"
            value={filterWarehouse}
            onChange={(e) => {
              setFilterWarehouse(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">Tous entrepôts</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setCurrentPage(1)
              }}
              className="input input-bordered input-sm w-36"
              placeholder="Début"
            />
            <span className="text-base-content/40">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setCurrentPage(1)
              }}
              className="input input-bordered input-sm w-36"
              placeholder="Fin"
            />
          </div>
          
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSearchTerm('')
              setFilterType('')
              setFilterProduct('')
              setFilterWarehouse('')
              setStartDate('')
              setEndDate('')
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
          <div className="mt-2 p-3 bg-base-100 rounded-lg border border-base-300 space-y-2 max-h-80 overflow-y-auto">
            <select 
              className="select select-bordered select-sm w-full"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Tous les types</option>
              <option value="in">Entrée</option>
              <option value="out">Sortie</option>
              <option value="transfer">Transfert</option>
              <option value="adjustment">Ajustement</option>
            </select>
            
            <select 
              className="select select-bordered select-sm w-full"
              value={filterProduct}
              onChange={(e) => {
                setFilterProduct(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Tous les produits</option>
              {products.slice(0, 20).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            
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
            
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="input input-bordered input-sm"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="input input-bordered input-sm"
              />
            </div>
            
            <button 
              className="btn btn-outline btn-sm w-full"
              onClick={() => {
                setSearchTerm('')
                setFilterType('')
                setFilterProduct('')
                setFilterWarehouse('')
                setStartDate('')
                setEndDate('')
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
                    onClick={() => handleSort('movement_date')}
                  >
                    Date
                    <SortIcon field="movement_date" />
                  </button>
                </th>
                <th>Type</th>
                <th>Référence</th>
                <th>Produit</th>
                <th>
                  <button 
                    className="flex items-center gap-1 hover:text-primary font-semibold"
                    onClick={() => handleSort('quantity')}
                  >
                    Quantité
                    <SortIcon field="quantity" />
                  </button>
                </th>
                <th>De</th>
                <th>Vers</th>
                <th>Notes</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMovements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <History className="w-16 h-16 mx-auto mb-3 text-base-content/30" />
                    <p className="text-base font-medium text-base-content/50">
                      Aucun mouvement trouvé
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedMovements.map((movement) => {
                  const typeInfo = getMovementTypeInfo(movement.movement_type)
                  const TypeIcon = typeInfo.icon
                  
                  return (
                    <tr key={movement.id} className="hover">
                      <td>
                        <div className="text-sm">{formatShortDate(movement.movement_date)}</div>
                        <div className="text-xs text-base-content/60">
                          {new Date(movement.movement_date).toLocaleTimeString().slice(0, 5)}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${typeInfo.color} gap-1`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeInfo.label}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-sm">{movement.reference}</span>
                      </td>
                      <td>
                        <div className="font-medium text-sm">{movement.product_name}</div>
                        <div className="text-xs text-base-content/60">{movement.product_reference}</div>
                      </td>
                      <td>
                        <span className={`font-bold ${
                          movement.movement_type === 'in' ? 'text-success' : 
                          movement.movement_type === 'out' ? 'text-error' : 'text-info'
                        }`}>
                          {movement.movement_type === 'in' ? '+' : 
                           movement.movement_type === 'out' ? '-' : ''}
                          {movement.quantity}
                        </span>
                      </td>
                      <td className="text-sm">{movement.from_warehouse_name || '-'}</td>
                      <td className="text-sm">{movement.to_warehouse_name || '-'}</td>
                      <td className="max-w-xs truncate text-sm text-base-content/70">
                        {movement.notes || '-'}
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button 
                            className="btn btn-ghost btn-xs"
                            onClick={() => navigate(`/stock-movements/${movement.id}/modifier`)}
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button 
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => {
                              setMovementToDelete(movement)
                              setShowDeleteModal(true)
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
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
        {paginatedMovements.length === 0 ? (
          <div className="bg-base-100 rounded-xl p-8 text-center border border-base-300">
            <History className="w-12 h-12 mx-auto mb-2 text-base-content/30" />
            <p className="text-sm font-medium text-base-content/50">
              Aucun mouvement trouvé
            </p>
          </div>
        ) : (
          paginatedMovements.map((movement) => {
            const typeInfo = getMovementTypeInfo(movement.movement_type)
            const TypeIcon = typeInfo.icon
            
            return (
              <div key={movement.id} className="bg-base-100 rounded-xl p-3 border border-base-300 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${typeInfo.color} gap-1`}>
                      <TypeIcon className="w-3 h-3" />
                      {typeInfo.label}
                    </span>
                    <span className="font-mono text-xs">{movement.reference}</span>
                  </div>
                  <span className={`font-bold text-lg ${
                    movement.movement_type === 'in' ? 'text-success' : 
                    movement.movement_type === 'out' ? 'text-error' : 'text-info'
                  }`}>
                    {movement.movement_type === 'in' ? '+' : 
                     movement.movement_type === 'out' ? '-' : ''}
                    {movement.quantity}
                  </span>
                </div>
                
                <div className="mb-2">
                  <div className="font-medium text-sm">{movement.product_name}</div>
                  <div className="text-xs text-base-content/60">{movement.product_reference}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-base-content/60">De:</span>
                    <span className="ml-1">{movement.from_warehouse_name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-base-content/60">Vers:</span>
                    <span className="ml-1">{movement.to_warehouse_name || '-'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-base-content/60 mb-2">
                  <span>{formatShortDate(movement.movement_date)}</span>
                  {movement.notes && (
                    <span className="truncate max-w-[150px]">{movement.notes}</span>
                  )}
                </div>
                
                <div className="flex justify-end gap-1 pt-2 border-t border-base-200">
                  <button 
                    className="btn btn-ghost btn-xs"
                    onClick={() => navigate(`/stock-movements/${movement.id}/modifier`)}
                  >
                    <Edit className="w-3 h-3" />
                    <span className="text-xs">Modifier</span>
                  </button>
                  <button 
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => {
                      setMovementToDelete(movement)
                      setShowDeleteModal(true)
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="text-xs">Supprimer</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {sortedMovements.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs lg:text-sm text-base-content/60">
            {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedMovements.length)} sur {sortedMovements.length} mouvements
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

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md">
            <div className="text-center">
              <div className="avatar placeholder mb-4">
                <div className="bg-error/10 text-error rounded-full w-16 h-16">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              </div>
              <h3 className="font-bold text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-base-content/70 text-sm">
                Êtes-vous sûr de vouloir supprimer ce mouvement ?
              </p>
              <p className="text-xs text-base-content/50 mt-3">
                Cette action est irréversible.
              </p>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-error btn-sm"
                onClick={handleDelete}
              >
                <Trash2 className="w-3 h-3" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StockMovements