// src/components/sales/Invoices.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Search,
  Receipt,
  Eye,
  FileText,
  RefreshCw,
  Filter,
  Users,
  DollarSign,
  Send,
  CheckCircle,
  XCircle,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Plus
} from 'lucide-react'

const Invoices = () => {
  const navigate = useNavigate()

  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [sortField, setSortField] = useState('invoice_date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'neutral', icon: FileText },
    sent: { label: 'Envoyée', color: 'info', icon: Send },
    paid: { label: 'Payée', color: 'success', icon: CheckCircle },
    partially_paid: { label: 'Partiellement payée', color: 'warning', icon: DollarSign },
    overdue: { label: 'En retard', color: 'error', icon: AlertCircle },
    cancelled: { label: 'Annulée', color: 'error', icon: XCircle }
  }

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(number)
  }

  const formatCurrency = (amount) => `${formatNumber(amount)} FCFA`

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
      const response = await AxiosInstance.get('/invoices/')
      console.log('Invoices data:', response.data)
      setInvoices(response.data || [])
    } catch (err) {
      console.error('Error fetching invoices:', err)
      showNotification('Erreur lors du chargement des factures', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchData() 
  }, [])

  const handleSendInvoice = async (id) => {
    try {
      await AxiosInstance.post(`/invoices/${id}/send/`)
      showNotification('Facture envoyée avec succès', 'success')
      fetchData()
    } catch (error) {
      console.error('Error:', error)
      showNotification('Erreur lors de l\'envoi', 'error')
    }
  }

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return
    try {
      await AxiosInstance.delete(`/invoices/${invoiceToDelete.id}/`)
      showNotification('Facture supprimée avec succès', 'success')
      fetchData()
      setShowDeleteModal(false)
      setInvoiceToDelete(null)
    } catch (error) {
      console.error('Error:', error)
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

  const filteredInvoices = invoices.filter(inv => {
    const search = searchTerm.toLowerCase()
    const customerName = inv.customer_name || inv.sale?.customer_name || ''
    const invoiceNumber = (inv.invoice_number || '').toLowerCase()
    const matchesSearch = invoiceNumber.includes(search) || customerName.toLowerCase().includes(search)
    const matchesStatus = !filterStatus || inv.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let aVal = a[sortField] || ''
    let bVal = b[sortField] || ''
    if (sortField === 'total') {
      aVal = parseFloat(aVal) || 0
      bVal = parseFloat(bVal) || 0
    } else if (sortField === 'invoice_date' || sortField === 'due_date') {
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

  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage)
  const paginatedInvoices = sortedInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    unpaid: invoices.filter(i => i.status === 'sent' || i.status === 'partially_paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    total_amount: invoices.reduce((sum, i) => sum + (i.total || 0), 0),
    paid_amount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des factures...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 p-5 bg-base-200 min-h-screen">
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-base`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-semibold">{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Factures
          </h1>
          <p className="text-base text-base-content/60">Gérez vos factures clients</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="btn btn-md btn-outline gap-2"><RefreshCw className="w-4 h-4" /> Actualiser</button>
          <Link to="/factures/nouveau" className="btn btn-md btn-primary gap-2"><Plus className="w-4 h-4" /> Nouvelle facture</Link>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <div className="stat-figure text-primary"><Receipt className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">Total factures</div>
          <div className="stat-value text-2xl font-black">{stats.total}</div>
          <div className="stat-desc text-sm">{formatCurrency(stats.total_amount)}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <div className="stat-figure text-success"><CheckCircle className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">Payées</div>
          <div className="stat-value text-2xl font-black">{stats.paid}</div>
          <div className="stat-desc text-sm">{formatCurrency(stats.paid_amount)}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <div className="stat-figure text-warning"><DollarSign className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">En attente</div>
          <div className="stat-value text-2xl font-black">{stats.unpaid}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <div className="stat-figure text-error"><AlertCircle className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">En retard</div>
          <div className="stat-value text-2xl font-black">{stats.overdue}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input 
              type="text" 
              placeholder="Rechercher par numéro, client..." 
              className="input input-bordered w-full pl-9 text-base py-2" 
              value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} 
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-outline btn-md sm:hidden gap-2"><Filter className="w-4 h-4" /> Filtres</button>
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex gap-3`}>
            <select 
              className="select select-bordered select-md w-36 text-base" 
              value={filterStatus} 
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}
            >
              <option value="">Tous statuts</option>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyée</option>
              <option value="paid">Payée</option>
              <option value="partially_paid">Partiellement payée</option>
              <option value="overdue">En retard</option>
              <option value="cancelled">Annulée</option>
            </select>
            <button 
              className="btn btn-outline btn-md gap-2" 
              onClick={() => { setFilterStatus(''); setSearchTerm(''); setCurrentPage(1) }}
            >
              <Filter className="w-4 h-4" /> Réinit
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des factures */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
        {paginatedInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg font-semibold text-base-content/50">Aucune facture trouvée</p>
            <Link to="/factures/nouveau" className="btn btn-md btn-primary mt-4 gap-2"><Plus className="w-4 h-4" /> Nouvelle facture</Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table table-md w-full">
                <thead>
                  <tr className="text-sm bg-gray-50">
                    <th className="py-3"><button className="flex items-center gap-2 hover:text-primary font-semibold" onClick={() => handleSort('invoice_number')}>N° facture<ArrowUpDown className="w-4 h-4" /></button></th>
                    <th><button className="flex items-center gap-2 hover:text-primary font-semibold" onClick={() => handleSort('customer_name')}>Client<ArrowUpDown className="w-4 h-4" /></button></th>
                    <th><button className="flex items-center gap-2 hover:text-primary font-semibold" onClick={() => handleSort('invoice_date')}>Date<ArrowUpDown className="w-4 h-4" /></button></th>
                    <th><button className="flex items-center gap-2 hover:text-primary font-semibold" onClick={() => handleSort('due_date')}>Échéance<ArrowUpDown className="w-4 h-4" /></button></th>
                    <th className="text-center">Statut</th>
                    <th className="text-right"><button className="flex items-center gap-2 hover:text-primary font-semibold" onClick={() => handleSort('total')}>Montant<ArrowUpDown className="w-4 h-4" /></button></th>
                    <th className="text-right">Payé</th>
                    <th className="text-right">Restant</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInvoices.map((inv) => {
                    const status = statusConfig[inv.status] || statusConfig.draft
                    const StatusIcon = status.icon
                    const customerName = inv.customer_name || inv.sale?.customer_name || 'Client'
                    const paidPercent = inv.total > 0 ? (inv.paid_amount / inv.total) * 100 : 0
                    
                    return (
                      <tr key={inv.id} className="hover border-b border-gray-100">
                        <td className="font-mono text-base font-semibold">{inv.invoice_number}</td>
                        <td><div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /><span className="text-base">{customerName}</span></div></td>
                        <td className="text-base">{formatDate(inv.invoice_date)}</td>
                        <td className={`text-base ${inv.status === 'overdue' ? 'text-error font-semibold' : ''}`}>{formatDate(inv.due_date)}</td>
                        <td className="text-center"><span className={`badge badge-${status.color} badge-md gap-1 text-sm py-2 px-3`}><StatusIcon className="w-3.5 h-3.5" /> {status.label}</span></td>
                        <td className="text-right font-bold text-base">{formatCurrency(inv.total)}</td>
                        <td className="text-right text-success text-base">{formatCurrency(inv.paid_amount)}</td>
                        <td className="text-right text-base">
                          <span className={inv.remaining_amount > 0 ? 'text-warning font-semibold' : 'text-success'}>{formatCurrency(inv.remaining_amount)}</span>
                          {inv.status !== 'paid' && inv.total > 0 && (
                            <progress className="progress progress-warning w-24 h-2 mt-1" value={paidPercent} max="100"></progress>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => navigate(`/factures/${inv.id}`)} className="btn btn-ghost btn-md" title="Voir"><Eye className="w-4 h-4" /></button>
                            {inv.status === 'draft' && (
                              <>
                                <button onClick={() => handleSendInvoice(inv.id)} className="btn btn-ghost btn-md text-info" title="Envoyer"><Send className="w-4 h-4" /></button>
                                <button onClick={() => { setInvoiceToDelete(inv); setShowDeleteModal(true) }} className="btn btn-ghost btn-md text-error" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2">
                  <tr className="text-sm font-bold">
                    <td colSpan="5" className="text-right">Total:</td>
                    <td className="text-right">{formatCurrency(sortedInvoices.reduce((s, i) => s + (i.total || 0), 0))}</td>
                    <td className="text-right">{formatCurrency(sortedInvoices.reduce((s, i) => s + (i.paid_amount || 0), 0))}</td>
                    <td className="text-right">{formatCurrency(sortedInvoices.reduce((s, i) => s + (i.remaining_amount || 0), 0))}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-base-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-sm text-base-content/60">
                    {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedInvoices.length)} sur {sortedInvoices.length}
                  </div>
                  <div className="flex items-center gap-3">
                    <select 
                      className="select select-bordered select-sm w-24 text-sm" 
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
                        className="join-item btn btn-sm" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
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
                            className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`} 
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                      <button 
                        className="join-item btn btn-sm" 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
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
      {showDeleteModal && invoiceToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-5">
            <div className="text-center mb-4">
              <div className="avatar placeholder mb-3"><div className="bg-error/10 text-error rounded-full w-16 h-16"><AlertCircle className="w-8 h-8" /></div></div>
              <h3 className="font-bold text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-base text-base-content/70">Supprimer la facture <strong className="text-error">"{invoiceToDelete.invoice_number}"</strong> ?</p>
              <p className="text-sm text-base-content/50 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-md btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn btn-md btn-error flex-1" onClick={handleDeleteInvoice}>Supprimer</button>
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
      `}</style>
    </div>
  )
}

export default Invoices