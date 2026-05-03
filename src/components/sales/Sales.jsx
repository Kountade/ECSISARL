// src/components/sales/Sales.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  Eye,
  FileText,
  Truck,
  Send,
  Calendar,
  Package,
  Users,
  DollarSign,
  Receipt,
  Building2,
  MapPin,
  Phone,
  Mail,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  XCircle
} from 'lucide-react'

const Sales = () => {
  const navigate = useNavigate()

  const [sales, setSales] = useState([])
  const [customers, setCustomers] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCustomer, setFilterCustomer] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [saleToDelete, setSaleToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [sortField, setSortField] = useState('sale_date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'neutral', icon: FileText },
    confirmed: { label: 'Confirmée', color: 'primary', icon: CheckCircle },
    in_preparation: { label: 'En préparation', color: 'info', icon: Package },
    shipped: { label: 'Expédiée', color: 'warning', icon: Truck },
    delivered: { label: 'Livrée', color: 'success', icon: CheckCircle },
    partially_delivered: { label: 'Partiellement livrée', color: 'warning', icon: Truck },
    cancelled: { label: 'Annulée', color: 'error', icon: XCircle },
    returned: { label: 'Retournée', color: 'error', icon: XCircle }
  }

  const paymentStatusConfig = {
    pending: { label: 'En attente', color: 'warning' },
    partially_paid: { label: 'Partiellement payé', color: 'info' },
    paid: { label: 'Payé', color: 'success' },
    overdue: { label: 'En retard', color: 'error' },
    refunded: { label: 'Remboursé', color: 'neutral' }
  }

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(number)
  }

  const formatCurrency = (amount) => {
    return `${formatNumber(amount)} FCFA`
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [salesRes, customersRes, warehousesRes] = await Promise.all([
        AxiosInstance.get('/sales/'),
        AxiosInstance.get('/customers/'),
        AxiosInstance.get('/warehouses/').catch(() => ({ data: [] }))
      ])
      setSales(salesRes.data || [])
      setCustomers(customersRes.data || [])
      setWarehouses(warehousesRes.data || [])
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

  const handleConfirmSale = async (saleId) => {
    try {
      await AxiosInstance.post(`/sales/${saleId}/confirm/`)
      showNotification('Vente confirmée avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors de la confirmation', 'error')
    }
  }

  const handleCancelSale = async (saleId) => {
    try {
      await AxiosInstance.post(`/sales/${saleId}/cancel/`)
      showNotification('Vente annulée', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur lors de l\'annulation', 'error')
    }
  }

  const handleDeleteSale = async () => {
    if (!saleToDelete) return
    try {
      await AxiosInstance.delete(`/sales/${saleToDelete.id}/`)
      showNotification('Vente supprimée avec succès', 'success')
      fetchData()
      setShowDeleteModal(false)
      setSaleToDelete(null)
    } catch (error) {
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

  const filteredSales = sales.filter(sale => {
    const search = searchTerm.toLowerCase()
    const matchesSearch = sale.sale_number?.toLowerCase().includes(search) ||
      sale.customer_name?.toLowerCase().includes(search)
    const matchesCustomer = !filterCustomer || sale.customer?.toString() === filterCustomer
    const matchesStatus = !filterStatus || sale.status === filterStatus
    const matchesPaymentStatus = !filterPaymentStatus || sale.payment_status === filterPaymentStatus
    return matchesSearch && matchesCustomer && matchesStatus && matchesPaymentStatus
  })

  const sortedSales = [...filteredSales].sort((a, b) => {
    let aVal = a[sortField] || ''
    let bVal = b[sortField] || ''
    if (sortField === 'total') {
      aVal = parseFloat(aVal) || 0
      bVal = parseFloat(bVal) || 0
    } else if (sortField === 'sale_date') {
      aVal = new Date(aVal)
      bVal = new Date(bVal)
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedSales.length / itemsPerPage)
  const paginatedSales = sortedSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const stats = {
    total: sales.length,
    draft: sales.filter(s => s.status === 'draft').length,
    confirmed: sales.filter(s => s.status === 'confirmed').length,
    delivered: sales.filter(s => s.status === 'delivered').length,
    total_amount: sales.filter(s => s.status === 'delivered').reduce((sum, s) => sum + (s.total || 0), 0),
    paid: sales.filter(s => s.payment_status === 'paid').length,
    partially_paid: sales.filter(s => s.payment_status === 'partially_paid').length,
    pending_payment: sales.filter(s => s.payment_status === 'pending').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des ventes...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 bg-base-200 min-h-screen">
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="font-semibold">{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Ventes
          </h1>
          <p className="text-xs text-base-content/60">Gérez toutes vos ventes et commandes clients</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn btn-sm btn-outline gap-1"><RefreshCw className="w-3 h-3" /> Actualiser</button>
          <button onClick={() => navigate('/ventes/nouveau')} className="btn btn-sm btn-primary gap-1"><Plus className="w-3 h-3" /> Nouvelle vente</button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-primary"><Receipt className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Total ventes</div>
          <div className="stat-value text-xl font-black">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-neutral"><FileText className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Brouillons</div>
          <div className="stat-value text-xl font-black">{stats.draft}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-warning"><CheckCircle className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Confirmées</div>
          <div className="stat-value text-xl font-black">{stats.confirmed}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-success"><CheckCircle className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Livrées</div>
          <div className="stat-value text-xl font-black">{stats.delivered}</div>
          <div className="stat-desc text-xs">{formatCurrency(stats.total_amount)}</div>
        </div>
      </div>

      {/* Statistiques de paiement supplémentaires */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-success"><CheckCircle className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Payées</div>
          <div className="stat-value text-lg font-black">{stats.paid}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-info"><DollarSign className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Partiellement payées</div>
          <div className="stat-value text-lg font-black">{stats.partially_paid}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-warning"><AlertCircle className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">En attente</div>
          <div className="stat-value text-lg font-black">{stats.pending_payment}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-base-content/40" />
            <input 
              type="text" 
              placeholder="Rechercher par numéro, client..." 
              className="input input-bordered w-full pl-8 text-sm input-sm" 
              value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} 
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-outline btn-sm sm:hidden gap-1"><Filter className="w-3 h-3" /> Filtres</button>
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex gap-2 flex-wrap`}>
            <select 
              className="select select-bordered select-sm w-36" 
              value={filterCustomer} 
              onChange={(e) => { setFilterCustomer(e.target.value); setCurrentPage(1) }}
            >
              <option value="">Tous clients</option>
              {customers.map(c => (<option key={c.id} value={c.id}>{c.full_name || c.company_name}</option>))}
            </select>
            <select 
              className="select select-bordered select-sm w-32" 
              value={filterStatus} 
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}
            >
              <option value="">Tous statuts</option>
              {Object.entries(statusConfig).map(([key, config]) => (<option key={key} value={key}>{config.label}</option>))}
            </select>
            <select 
              className="select select-bordered select-sm w-36" 
              value={filterPaymentStatus} 
              onChange={(e) => { setFilterPaymentStatus(e.target.value); setCurrentPage(1) }}
            >
              <option value="">Tous paiements</option>
              <option value="paid">Payé</option>
              <option value="partially_paid">Partiellement payé</option>
              <option value="pending">En attente</option>
              <option value="overdue">En retard</option>
            </select>
            <button 
              className="btn btn-outline btn-sm gap-1" 
              onClick={() => { setFilterCustomer(''); setFilterStatus(''); setFilterPaymentStatus(''); setSearchTerm(''); setCurrentPage(1) }}
            >
              <Filter className="w-3 h-3" /> Réinit
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des ventes */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
        {paginatedSales.length === 0 ? (
          <div className="p-8 text-center">
            <Receipt className="w-12 h-12 mx-auto mb-3 text-base-content/30" />
            <p className="font-semibold text-base-content/50">Aucune vente trouvée</p>
            <button onClick={() => navigate('/ventes/nouveau')} className="btn btn-sm btn-primary mt-3 gap-1">
              <Plus className="w-3 h-3" /> Nouvelle vente
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="text-xs bg-gray-50">
                    <th className="py-3"><button className="flex items-center gap-1 hover:text-primary font-semibold" onClick={() => handleSort('sale_number')}>N° Vente<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th><button className="flex items-center gap-1 hover:text-primary font-semibold" onClick={() => handleSort('customer_name')}>Client<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th><button className="flex items-center gap-1 hover:text-primary font-semibold" onClick={() => handleSort('sale_date')}>Date<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th>Livraison</th>
                    <th className="text-center">Statut</th>
                    <th className="text-center"><button className="flex items-center gap-1 hover:text-primary font-semibold" onClick={() => handleSort('payment_status')}>Paiement<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th className="text-right"><button className="flex items-center gap-1 hover:text-primary font-semibold" onClick={() => handleSort('total')}>Montant<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSales.map((sale) => {
                    const status = statusConfig[sale.status] || statusConfig.draft
                    const StatusIcon = status.icon
                    const paymentStatus = paymentStatusConfig[sale.payment_status] || paymentStatusConfig.pending
                    const isOverdue = sale.payment_status === 'overdue'
                    
                    return (
                      <tr key={sale.id} className="hover border-b border-gray-100">
                        <td>
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full bg-${status.color}/10 flex items-center justify-center`}>
                              <StatusIcon className={`w-4 h-4 text-${status.color}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{sale.sale_number}</p>
                              <p className="text-xs text-gray-400">{sale.items?.length || 0} produit(s)</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{sale.customer_name}</span>
                            {sale.customer_email && (
                              <span className="text-xs text-gray-400">{sale.customer_email}</span>
                            )}
                          </div>
                        </td>
                        <td className="text-sm">{formatDate(sale.sale_date)}</td>
                        <td className="text-sm">{sale.delivery_date ? formatDate(sale.delivery_date) : '-'}</td>
                        <td className="text-center">
                          <span className={`badge badge-${status.color} badge-sm gap-1`}>
                            <StatusIcon className="w-2.5 h-2.5" /> {status.label}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge badge-${paymentStatus.color} badge-sm gap-1 ${isOverdue ? 'animate-pulse' : ''}`}>
                            {paymentStatus.label}
                          </span>
                          {sale.payment_status === 'partially_paid' && sale.invoice && (
                            <div className="text-xs text-gray-400 mt-1">
                              Payé: {formatCurrency(sale.invoice.paid_amount || 0)} / {formatCurrency(sale.total)}
                            </div>
                          )}
                        </td>
                        <td className="text-right font-bold text-sm">{formatCurrency(sale.total)}</td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => navigate(`/ventes/${sale.id}`)} 
                              className="btn btn-ghost btn-xs" 
                              title="Détails"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {sale.status === 'draft' && (
                              <>
                                <button 
                                  onClick={() => navigate(`/ventes/${sale.id}/modifier`)} 
                                  className="btn btn-ghost btn-xs text-primary" 
                                  title="Modifier"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleConfirmSale(sale.id)} 
                                  className="btn btn-ghost btn-xs text-success" 
                                  title="Confirmer"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => { setSaleToDelete(sale); setShowDeleteModal(true) }} 
                                  className="btn btn-ghost btn-xs text-error" 
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {sale.status === 'confirmed' && (
                              <button 
                                onClick={() => handleCancelSale(sale.id)} 
                                className="btn btn-ghost btn-xs text-error" 
                                title="Annuler"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {sale.payment_status === 'pending' && sale.status !== 'draft' && (
                              <button 
                                onClick={() => navigate(`/paiements/nouveau?invoice=${sale.invoice?.id}`)} 
                                className="btn btn-ghost btn-xs text-info" 
                                title="Enregistrer paiement"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2">
                  <tr className="text-xs font-bold">
                    <td colSpan="6" className="text-right">Total général:</td>
                    <td className="text-right">{formatCurrency(sortedSales.reduce((s, sale) => s + (sale.total || 0), 0))}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-3 border-t border-base-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="text-xs text-base-content/60">
                    {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedSales.length)} sur {sortedSales.length} ventes
                  </div>
                  <div className="flex items-center gap-2">
                    <select 
                      className="select select-bordered select-xs w-20" 
                      value={itemsPerPage} 
                      onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                    <div className="join">
                      <button 
                        className="join-item btn btn-xs" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum = i + 1
                        if (totalPages > 5 && currentPage > 3) {
                          pageNum = currentPage - 2 + i
                          if (pageNum > totalPages) return null
                        }
                        return (
                          <button 
                            key={i} 
                            className={`join-item btn btn-xs ${currentPage === pageNum ? 'btn-primary' : ''}`} 
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                      <button 
                        className="join-item btn btn-xs" 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Suppression */}
      {showDeleteModal && saleToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4">
            <div className="text-center mb-3">
              <div className="avatar placeholder mb-2">
                <div className="bg-error/10 text-error rounded-full w-12 h-12">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>
              <h3 className="font-bold text-base mb-1">Confirmer la suppression</h3>
              <p className="text-xs text-base-content/70">
                Supprimer la vente <strong className="text-error">"{saleToDelete.sale_number}"</strong> ?
              </p>
              <div className="mt-2 p-2 bg-base-200 rounded-lg">
                <p className="text-xs"><strong>Client:</strong> {saleToDelete.customer_name}</p>
                <p className="text-xs"><strong>Montant:</strong> {formatCurrency(saleToDelete.total)}</p>
                <p className="text-xs"><strong>Date:</strong> {formatDate(saleToDelete.sale_date)}</p>
              </div>
              <p className="text-xs text-base-content/50 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </button>
              <button className="btn btn-sm btn-error flex-1" onClick={handleDeleteSale}>
                <Trash2 className="w-3 h-3" /> Supprimer
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
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default Sales