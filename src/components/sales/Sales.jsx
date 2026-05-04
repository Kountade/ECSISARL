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

  const formatCurrency = (amount) => `${formatNumber(amount)} FCFA`
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('fr-FR') : '-'

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ ...notification, show: false }), 4000)
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
      console.error(error)
      showNotification('Erreur lors du chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

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
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDirection('asc') }
  }

  const filteredSales = sales.filter(sale => {
    const search = searchTerm.toLowerCase()
    const matchesSearch = sale.sale_number?.toLowerCase().includes(search) || sale.customer_name?.toLowerCase().includes(search)
    const matchesCustomer = !filterCustomer || sale.customer?.toString() === filterCustomer
    const matchesStatus = !filterStatus || sale.status === filterStatus
    const matchesPaymentStatus = !filterPaymentStatus || sale.payment_status === filterPaymentStatus
    return matchesSearch && matchesCustomer && matchesStatus && matchesPaymentStatus
  })

  const sortedSales = [...filteredSales].sort((a, b) => {
    let aVal = a[sortField] || '', bVal = b[sortField] || ''
    if (sortField === 'total') { aVal = parseFloat(aVal) || 0; bVal = parseFloat(bVal) || 0 }
    else if (sortField === 'sale_date') { aVal = new Date(aVal); bVal = new Date(bVal) }
    else if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase() }
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12"></div>
          <p className="text-base font-semibold text-gray-600">Chargement des ventes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-gray-100 min-h-screen">
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ventes</h1>
          <p className="text-sm text-gray-500">Gérez toutes vos ventes et commandes clients</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn btn-outline btn-sm gap-2">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={() => navigate('/ventes/nouveau')} className="btn btn-primary btn-sm gap-2">
            <Plus className="w-4 h-4" /> Nouvelle vente
          </button>
        </div>
      </div>

      {/* Cartes statistiques (style NotificationsPage) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-primary">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-sm text-gray-600 font-medium">Total ventes</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-neutral">
          <div className="text-2xl font-bold text-neutral">{stats.draft}</div>
          <div className="text-sm text-gray-600 font-medium">Brouillons</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-warning">
          <div className="text-2xl font-bold text-warning">{stats.confirmed}</div>
          <div className="text-sm text-gray-600 font-medium">Confirmées</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-success">
          <div className="text-2xl font-bold text-success">{stats.delivered}</div>
          <div className="text-sm text-gray-600 font-medium">Livrées</div>
          <div className="text-xs text-gray-500 mt-1">{formatCurrency(stats.total_amount)}</div>
        </div>
      </div>

      {/* Deuxième ligne de cartes (paiements) */}
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-success">
          <div className="text-2xl font-bold text-success">{stats.paid}</div>
          <div className="text-sm text-gray-600 font-medium">Payées</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-info">
          <div className="text-2xl font-bold text-info">{stats.partially_paid}</div>
          <div className="text-sm text-gray-600 font-medium">Partiellement payées</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-warning">
          <div className="text-2xl font-bold text-warning">{stats.pending_payment}</div>
          <div className="text-sm text-gray-600 font-medium">En attente</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="label text-xs font-semibold text-gray-600 mb-1">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Numéro, client..."
                className="input input-bordered w-full pl-9 py-2 h-10 text-sm"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              />
            </div>
          </div>
          <div className="w-44">
            <label className="label text-xs font-semibold text-gray-600 mb-1">Client</label>
            <select
              className="select select-bordered w-full h-10 text-sm"
              value={filterCustomer}
              onChange={(e) => { setFilterCustomer(e.target.value); setCurrentPage(1) }}
            >
              <option value="">Tous clients</option>
              {customers.map(c => (<option key={c.id} value={c.id}>{c.full_name || c.company_name}</option>))}
            </select>
          </div>
          <div className="w-40">
            <label className="label text-xs font-semibold text-gray-600 mb-1">Statut commande</label>
            <select
              className="select select-bordered w-full h-10 text-sm"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}
            >
              <option value="">Tous statuts</option>
              {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="w-44">
            <label className="label text-xs font-semibold text-gray-600 mb-1">Statut paiement</label>
            <select
              className="select select-bordered w-full h-10 text-sm"
              value={filterPaymentStatus}
              onChange={(e) => { setFilterPaymentStatus(e.target.value); setCurrentPage(1) }}
            >
              <option value="">Tous</option>
              <option value="paid">Payé</option>
              <option value="partially_paid">Partiellement payé</option>
              <option value="pending">En attente</option>
              <option value="overdue">En retard</option>
            </select>
          </div>
          <div>
            <button
              className="btn btn-outline h-10 px-5 gap-2 text-sm"
              onClick={() => { setFilterCustomer(''); setFilterStatus(''); setFilterPaymentStatus(''); setSearchTerm(''); setCurrentPage(1) }}
            >
              <Filter className="w-4 h-4" /> Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des ventes */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {paginatedSales.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-16 h-16 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune vente trouvée</p>
            <button onClick={() => navigate('/ventes/nouveau')} className="btn btn-primary btn-sm mt-4 gap-2">
              <Plus className="w-4 h-4" /> Nouvelle vente
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-sm font-semibold text-gray-700">
                    <th className="py-3 px-4"><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('sale_number')}>N° Vente <ArrowUpDown className="w-4 h-4" /></button></th>
                    <th className="py-3 px-4"><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('customer_name')}>Client <ArrowUpDown className="w-4 h-4" /></button></th>
                    <th className="py-3 px-4"><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('sale_date')}>Date <ArrowUpDown className="w-4 h-4" /></button></th>
                    <th className="py-3 px-4">Livraison</th>
                    <th className="py-3 px-4 text-center">Statut</th>
                    <th className="py-3 px-4 text-center"><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('payment_status')}>Paiement <ArrowUpDown className="w-4 h-4" /></button></th>
                    <th className="py-3 px-4 text-right"><button className="flex items-center gap-1 hover:text-primary justify-end" onClick={() => handleSort('total')}>Montant <ArrowUpDown className="w-4 h-4" /></button></th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSales.map(sale => {
                    const status = statusConfig[sale.status] || statusConfig.draft
                    const StatusIcon = status.icon
                    const paymentStatus = paymentStatusConfig[sale.payment_status] || paymentStatusConfig.pending
                    const isOverdue = sale.payment_status === 'overdue'
                    return (
                      <tr key={sale.id} className="border-b hover:bg-gray-50 text-sm">
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
                            {sale.customer_email && <span className="text-xs text-gray-400">{sale.customer_email}</span>}
                          </div>
                        </td>
                        <td>{formatDate(sale.sale_date)}</td>
                        <td>{sale.delivery_date ? formatDate(sale.delivery_date) : '-'}</td>
                        <td className="text-center">
                          <span className={`badge badge-${status.color} badge-sm gap-1`}>
                            <StatusIcon className="w-3 h-3" /> {status.label}
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
                        <td className="text-right font-bold">{formatCurrency(sale.total)}</td>
                        <td className="text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => navigate(`/ventes/${sale.id}`)} className="btn btn-ghost btn-sm" title="Détails"><Eye className="w-4 h-4" /></button>
                            {sale.status === 'draft' && (
                              <>
                                <button onClick={() => navigate(`/ventes/${sale.id}/modifier`)} className="btn btn-ghost btn-sm text-primary" title="Modifier"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleConfirmSale(sale.id)} className="btn btn-ghost btn-sm text-success" title="Confirmer"><CheckCircle className="w-4 h-4" /></button>
                                <button onClick={() => { setSaleToDelete(sale); setShowDeleteModal(true) }} className="btn btn-ghost btn-sm text-error" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                              </>
                            )}
                            {sale.status === 'confirmed' && (
                              <button onClick={() => handleCancelSale(sale.id)} className="btn btn-ghost btn-sm text-error" title="Annuler"><XCircle className="w-4 h-4" /></button>
                            )}
                            {sale.payment_status === 'pending' && sale.status !== 'draft' && sale.invoice && (
                              <button onClick={() => navigate(`/paiements/nouveau?invoice=${sale.invoice.id}`)} className="btn btn-ghost btn-sm text-info" title="Paiement"><DollarSign className="w-4 h-4" /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr className="text-sm font-semibold">
                    <td colSpan="6" className="py-3 px-4 text-right">Total général :</td>
                    <td className="py-3 px-4 text-right font-bold">{formatCurrency(sortedSales.reduce((s, sale) => s + (sale.total || 0), 0))}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap justify-between items-center gap-3">
                <div className="text-sm text-gray-500">
                  {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedSales.length)} sur {sortedSales.length}
                </div>
                <div className="flex items-center gap-3">
                  <select
                    className="select select-bordered select-sm w-20 text-sm"
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <div className="join">
                    <button className="join-item btn btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" /></button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum = i + 1
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = currentPage - 2 + i
                        if (pageNum > totalPages) return null
                      }
                      return (
                        <button key={i} className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`} onClick={() => setCurrentPage(pageNum)}>
                          {pageNum}
                        </button>
                      )
                    })}
                    <button className="join-item btn btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal suppression */}
      {showDeleteModal && saleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-error" />
            </div>
            <h3 className="text-xl font-bold mb-2">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir supprimer la vente <strong className="text-error">"{saleToDelete.sale_number}"</strong> ?
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <p><strong>Client :</strong> {saleToDelete.customer_name}</p>
              <p><strong>Montant :</strong> {formatCurrency(saleToDelete.total)}</p>
              <p><strong>Date :</strong> {formatDate(saleToDelete.sale_date)}</p>
            </div>
            <p className="text-xs text-gray-500 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline">Annuler</button>
              <button onClick={handleDeleteSale} className="btn btn-error">Supprimer</button>
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
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        .animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  )
}

export default Sales