// src/components/purchases/PurchaseOrders.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import { generateOrderPDF } from './PurchaseOrderPDF'
import {
  Plus,
  Search,
  RefreshCw,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  Building2,
  Truck,
  Receipt,
  Send,
  Calendar,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  FileText,
  Warehouse,
  Clock,
  Package,
  Download,
  Loader2
} from 'lucide-react'

const PurchaseOrders = () => {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [downloadingPDF, setDownloadingPDF] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterSupplier, setFilterSupplier] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState('order_date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    in_progress: 0,
    received: 0,
    total_amount: 0
  })

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'badge-ghost', icon: Edit },
    sent: { label: 'Envoyée', color: 'badge-info', icon: Send },
    confirmed: { label: 'Confirmée', color: 'badge-primary', icon: CheckCircle },
    in_transit: { label: 'En transit', color: 'badge-warning', icon: Truck },
    partially_received: { label: 'Partiel', color: 'badge-warning', icon: Receipt },
    received: { label: 'Reçue', color: 'badge-success', icon: CheckCircle },
    cancelled: { label: 'Annulée', color: 'badge-error', icon: X },
    rejected: { label: 'Rejetée', color: 'badge-error', icon: X }
  }

  const urgencyConfig = {
    normal: { label: 'Normal', color: 'badge-info' },
    urgent: { label: 'Urgent', color: 'badge-warning' },
    very_urgent: { label: 'Très urgent', color: 'badge-error' }
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
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ordersRes, suppliersRes] = await Promise.all([
        AxiosInstance.get('/purchase-orders/'),
        AxiosInstance.get('/suppliers/')
      ])
      
      const ordersData = ordersRes.data
      setOrders(ordersData)
      setSuppliers(suppliersRes.data)
      
      setStats({
        total: ordersData.length,
        draft: ordersData.filter(o => o.status === 'draft').length,
        in_progress: ordersData.filter(o => ['sent', 'confirmed', 'in_transit', 'partially_received'].includes(o.status)).length,
        received: ordersData.filter(o => o.status === 'received').length,
        total_amount: ordersData.filter(o => o.status === 'received').reduce((sum, o) => sum + (o.total || 0), 0)
      })
      
    } catch (error) {
      console.error('Error:', error)
      showNotification('Erreur lors du chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Fonction pour télécharger le PDF
  const handleDownloadPDF = async (order) => {
    if (!order) return
    setDownloadingPDF(order.id)
    try {
      await generateOrderPDF(order)
      showNotification('PDF téléchargé avec succès', 'success')
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      showNotification('Erreur lors de la génération du PDF', 'error')
    } finally {
      setDownloadingPDF(null)
    }
  }

  const handleDelete = async () => {
    if (!orderToDelete) return
    try {
      await AxiosInstance.delete(`/purchase-orders/${orderToDelete.id}/`)
      showNotification('Commande supprimée', 'success')
      fetchData()
      setShowDeleteModal(false)
      setOrderToDelete(null)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  const handleSendOrder = async (orderId) => {
    try {
      await AxiosInstance.post(`/purchase-orders/${orderId}/send/`)
      showNotification('Commande envoyée', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur lors de l\'envoi', 'error')
    }
  }

  const handleConfirmOrder = async (orderId) => {
    try {
      await AxiosInstance.post(`/purchase-orders/${orderId}/confirm/`)
      showNotification('Commande confirmée', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur lors de la confirmation', 'error')
    }
  }

  const handleCancelOrder = async (orderId) => {
    try {
      await AxiosInstance.post(`/purchase-orders/${orderId}/cancel/`)
      showNotification('Commande annulée', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur lors de l\'annulation', 'error')
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSupplier = !filterSupplier || order.supplier?.toString() === filterSupplier
    const matchesStatus = !filterStatus || order.status === filterStatus
    return matchesSearch && matchesSupplier && matchesStatus
  })

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aVal = a[sortField] || ''
    let bVal = b[sortField] || ''
    
    if (sortField === 'order_date' || sortField === 'expected_date') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    } else if (sortField === 'total') {
      aVal = parseFloat(aVal) || 0
      bVal = parseFloat(bVal) || 0
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage)
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 opacity-40" />
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />
  }

  const isLate = (order) => {
    return order.expected_date && new Date(order.expected_date) < new Date() &&
      !['received', 'cancelled'].includes(order.status)
  }

  const getProgress = (order) => {
    if (!order.items) return 0
    const total = order.items.reduce((acc, i) => acc + i.quantity_ordered, 0)
    const received = order.items.reduce((acc, i) => acc + (i.quantity_received || 0), 0)
    return total > 0 ? (received / total) * 100 : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-3 lg:p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 lg:top-20 right-3 lg:right-6 z-50 animate-slideDown w-[calc(100%-1.5rem)] lg:w-auto max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ ...notification, show: false })}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content flex items-center gap-2">
            <Receipt className="w-7 h-7 text-primary" /> Commandes d'achat
          </h1>
          <p className="text-sm lg:text-base text-base-content/60 mt-1">Gérez vos commandes fournisseurs</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn btn-outline btn-sm lg:btn-md gap-2">
            <RefreshCw className="w-4 h-4" /> <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button onClick={() => navigate('/commandes/nouveau')} className="btn btn-primary btn-sm lg:btn-md gap-2">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nouvelle commande</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-primary p-3 lg:p-4">
          <div className="stat-figure text-primary"><Receipt className="w-6 h-6" /></div>
          <div className="stat-title text-sm">Total</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-info p-3 lg:p-4">
          <div className="stat-figure text-info"><Edit className="w-6 h-6" /></div>
          <div className="stat-title text-sm">Brouillons</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.draft}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-warning p-3 lg:p-4">
          <div className="stat-figure text-warning"><Send className="w-6 h-6" /></div>
          <div className="stat-title text-sm">En cours</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.in_progress}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-success p-3 lg:p-4">
          <div className="stat-figure text-success"><CheckCircle className="w-6 h-6" /></div>
          <div className="stat-title text-sm">Reçues</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.received}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-secondary p-3 lg:p-4 col-span-2 lg:col-span-1">
          <div className="stat-figure text-secondary"><FileText className="w-6 h-6" /></div>
          <div className="stat-title text-sm">Total reçu</div>
          <div className="stat-value text-lg lg:text-xl truncate">{formatCurrency(stats.total_amount)}</div>
        </div>
      </div>

      {/* Filtres - Desktop */}
      <div className="hidden lg:flex bg-base-100 rounded-xl shadow-sm border border-base-300 p-4 items-center gap-3">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
          <input type="text" placeholder="Rechercher par numéro, fournisseur..." className="input input-bordered w-full pl-10"
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} />
        </div>
        <select className="select select-bordered w-48" value={filterSupplier} onChange={(e) => { setFilterSupplier(e.target.value); setCurrentPage(1) }}>
          <option value="">Tous les fournisseurs</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.company_name}</option>)}
        </select>
        <select className="select select-bordered w-40" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}>
          <option value="">Tous les statuts</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setFilterSupplier(''); setFilterStatus(''); setCurrentPage(1) }}>
          <Filter className="w-4 h-4" /> Réinitialiser
        </button>
      </div>

      {/* Filtres - Mobile */}
      <div className="lg:hidden">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input type="text" placeholder="Rechercher..." className="input input-bordered input-sm w-full pl-9"
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} />
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setShowMobileFilters(!showMobileFilters)}>
            <Filter className="w-4 h-4" /> Filtres
          </button>
        </div>
        {showMobileFilters && (
          <div className="mt-2 p-3 bg-base-100 rounded-lg border border-base-300 space-y-2">
            <select className="select select-bordered select-sm w-full" value={filterSupplier} onChange={(e) => { setFilterSupplier(e.target.value); setCurrentPage(1) }}>
              <option value="">Tous fournisseurs</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.company_name}</option>)}
            </select>
            <select className="select select-bordered select-sm w-full" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}>
              <option value="">Tous statuts</option>
              {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button className="btn btn-outline btn-sm w-full" onClick={() => { setSearchTerm(''); setFilterSupplier(''); setFilterStatus(''); setCurrentPage(1); setShowMobileFilters(false) }}>
              Réinitialiser
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
                <th><button className="flex items-center gap-1 font-semibold" onClick={() => handleSort('order_number')}>Commande <SortIcon field="order_number" /></button></th>
                <th>Fournisseur</th>
                <th><button className="flex items-center gap-1 font-semibold" onClick={() => handleSort('order_date')}>Date <SortIcon field="order_date" /></button></th>
                <th><button className="flex items-center gap-1 font-semibold" onClick={() => handleSort('expected_date')}>Livraison <SortIcon field="expected_date" /></button></th>
                <th className="text-center">Statut</th>
                <th className="text-center">Urgence</th>
                <th><button className="flex items-center gap-1 font-semibold" onClick={() => handleSort('total')}>Montant <SortIcon field="total" /></button></th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-base-content/50">Aucune commande trouvée</td></tr>
              ) : (
                paginatedOrders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.draft
                  const urgency = urgencyConfig[order.urgency] || urgencyConfig.normal
                  const StatusIcon = status.icon
                  const late = isLate(order)
                  const progress = getProgress(order)

                  return (
                    <tr key={order.id} className="hover">
                      <td>
                        <div className="flex items-center gap-2">
                          <div className={`avatar placeholder`}>
                            <div className={`bg-${status.color?.replace('badge-', '') || 'primary'}/10 rounded-lg w-10 h-10`}>
                              <StatusIcon className={`w-5 h-5 text-${status.color?.replace('badge-', '') || 'primary'}`} />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{order.order_number}</div>
                            <div className="text-xs text-base-content/60">{order.items?.length || 0} produit(s)</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4 text-base-content/50" />
                          <span>{order.supplier_name}</span>
                        </div>
                      </td>
                      <td>{formatDate(order.order_date)}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-base-content/50" />
                          <span>{formatDate(order.expected_date)}</span>
                          {late && <span className="badge badge-error badge-xs ml-1">Retard</span>}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${status.color}`}>{status.label}</span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${urgency.color}`}>{urgency.label}</span>
                      </td>
                      <td>
                        <div className="font-semibold">{formatCurrency(order.total || 0)}</div>
                        {order.status === 'partially_received' && (
                          <div className="mt-1">
                            <progress className="progress progress-warning w-20 h-2" value={progress} max="100"></progress>
                            <div className="text-xs text-base-content/60">{Math.round(progress)}%</div>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="flex justify-center gap-1 flex-wrap">
                          <button 
                            className="btn btn-ghost btn-sm" 
                            onClick={() => navigate(`/commandes/${order.id}`)}
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button 
                            className="btn btn-ghost btn-sm text-primary" 
                            onClick={() => handleDownloadPDF(order)}
                            disabled={downloadingPDF === order.id}
                            title="Télécharger PDF"
                          >
                            {downloadingPDF === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                          
                          {order.status === 'draft' && (
                            <>
                              <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/commandes/${order.id}/modifier`)}>
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="btn btn-ghost btn-sm text-success" onClick={() => handleSendOrder(order.id)}>
                                <Send className="w-4 h-4" />
                              </button>
                              <button className="btn btn-ghost btn-sm text-error" onClick={() => { setOrderToDelete(order); setShowDeleteModal(true) }}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {order.status === 'sent' && (
                            <button className="btn btn-ghost btn-sm text-primary" onClick={() => handleConfirmOrder(order.id)}>
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          
                          {['confirmed', 'in_transit', 'partially_received'].includes(order.status) && (
                            <button className="btn btn-ghost btn-sm text-success" onClick={() => navigate(`/commandes/${order.id}/reception`)}>
                              <Truck className="w-4 h-4" />
                            </button>
                          )}
                          
                          {order.status === 'in_transit' && (
                            <button className="btn btn-ghost btn-sm text-error" onClick={() => handleCancelOrder(order.id)}>
                              <X className="w-4 h-4" />
                            </button>
                          )}
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
        {paginatedOrders.length === 0 ? (
          <div className="bg-base-100 rounded-xl p-8 text-center border border-base-300 text-base-content/50">Aucune commande</div>
        ) : (
          paginatedOrders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.draft
            const urgency = urgencyConfig[order.urgency] || urgencyConfig.normal
            const StatusIcon = status.icon
            const late = isLate(order)
            const progress = getProgress(order)

            return (
              <div key={order.id} className="bg-base-100 rounded-xl p-4 border border-base-300">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-5 h-5" />
                    <div>
                      <span className="font-bold">{order.order_number}</span>
                      <p className="text-sm text-base-content/60">{order.supplier_name}</p>
                    </div>
                  </div>
                  <span className={`badge ${status.color}`}>{status.label}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div><span className="text-base-content/60">Commande:</span> {formatDate(order.order_date)}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-base-content/60">Livraison:</span> {formatDate(order.expected_date)}
                    {late && <span className="badge badge-error badge-xs">Retard</span>}
                  </div>
                  <div><span className="text-base-content/60">Urgence:</span> <span className={`badge ${urgency.color} badge-xs`}>{urgency.label}</span></div>
                  <div><span className="text-base-content/60">Montant:</span> <span className="font-semibold">{formatCurrency(order.total)}</span></div>
                </div>
                
                {order.status === 'partially_received' && (
                  <div className="mt-2">
                    <progress className="progress progress-warning w-full h-2" value={progress} max="100"></progress>
                    <div className="text-xs text-base-content/60 text-right">{Math.round(progress)}% reçu</div>
                  </div>
                )}
                
                <div className="flex flex-wrap justify-end gap-1 mt-3 pt-2 border-t border-base-200">
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/commandes/${order.id}`)}>
                    <Eye className="w-4 h-4" /> Voir
                  </button>
                  
                  <button 
                    className="btn btn-ghost btn-sm text-primary" 
                    onClick={() => handleDownloadPDF(order)}
                    disabled={downloadingPDF === order.id}
                  >
                    {downloadingPDF === order.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                  
                  {order.status === 'draft' && (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/commandes/${order.id}/modifier`)}>
                        <Edit className="w-4 h-4" /> Modifier
                      </button>
                      <button className="btn btn-ghost btn-sm text-error" onClick={() => { setOrderToDelete(order); setShowDeleteModal(true) }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {sortedOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-base-content/60">
            {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedOrders.length)} sur {sortedOrders.length}
          </div>
          <div className="flex items-center gap-2">
            <select className="select select-bordered select-sm w-20" value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}>
              <option value="10">10</option><option value="25">25</option><option value="50">50</option>
            </select>
            <div className="join">
              <button className="join-item btn btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" /></button>
              <span className="join-item btn btn-sm no-animation">{currentPage} / {totalPages}</span>
              <button className="join-item btn btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md">
            <div className="text-center">
              <div className="bg-error/10 text-error rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center"><AlertTriangle className="w-10 h-10" /></div>
              <h3 className="font-bold text-xl mb-2">Confirmer la suppression</h3>
              <p className="mb-2">Supprimer la commande</p>
              <p className="text-xl font-bold text-error">"{orderToDelete?.order_number}" ?</p>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn btn-error" onClick={handleDelete}><Trash2 className="w-4 h-4" /> Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PurchaseOrders