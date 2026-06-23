// src/components/purchases/PurchaseReceipts.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import { generateReceiptPDF } from './PurchaseReceiptPDF'
import {
  Plus,
  Search,
  RefreshCw,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  Building2,
  Receipt,
  Calendar,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Package,
  Truck,
  FileText,
  Clock,
  Award,
  Download,
  Loader2
} from 'lucide-react'

const PurchaseReceipts = () => {
  const navigate = useNavigate()

  const [receipts, setReceipts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [downloadingPDF, setDownloadingPDF] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterSupplier, setFilterSupplier] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState('receipt_date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const [stats, setStats] = useState({
    total: 0,
    total_items: 0,
    total_quantity: 0,
    pending_orders: 0,
    conforming: 0,
    non_conforming: 0
  })

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'badge-ghost' },
    sent: { label: 'Envoyée', color: 'badge-info' },
    confirmed: { label: 'Confirmée', color: 'badge-primary' },
    in_transit: { label: 'En transit', color: 'badge-warning' },
    partially_received: { label: 'Partiel', color: 'badge-warning' },
    received: { label: 'Reçue', color: 'badge-success' },
    cancelled: { label: 'Annulée', color: 'badge-error' },
    rejected: { label: 'Rejetée', color: 'badge-error' }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR').format(number)
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [receiptsRes, suppliersRes, availableRes] = await Promise.all([
        AxiosInstance.get('/purchase-receipts/'),
        AxiosInstance.get('/suppliers/?is_active=true'),
        AxiosInstance.get('/purchase-receipts/available_orders/')
      ])

      const receiptsData = receiptsRes.data || []
      setReceipts(receiptsData)
      setSuppliers(suppliersRes.data || [])

      const totalItems = receiptsData.reduce((acc, r) => acc + (r.items?.length || 0), 0)
      const totalQuantity = receiptsData.reduce((acc, r) => acc + (r.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0), 0)
      const conforming = receiptsData.reduce((acc, r) => acc + (r.items?.filter(i => i.quality_ok).length || 0), 0)
      const nonConforming = receiptsData.reduce((acc, r) => acc + (r.items?.filter(i => i.quality_checked && !i.quality_ok).length || 0), 0)

      setStats({
        total: receiptsData.length,
        total_items: totalItems,
        total_quantity: totalQuantity,
        pending_orders: availableRes.data?.length || 0,
        conforming,
        non_conforming: nonConforming
      })

    } catch (error) {
      console.error('Erreur:', error)
      showNotification('Erreur de chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Fonction pour télécharger le PDF
  const handleDownloadPDF = async (receipt) => {
    if (!receipt) return
    setDownloadingPDF(receipt.id)
    try {
      await generateReceiptPDF(receipt)
      showNotification(`PDF téléchargé avec succès`, 'success')
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      showNotification('Erreur lors de la génération du PDF', 'error')
    } finally {
      setDownloadingPDF(null)
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

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch =
      (receipt.receipt_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (receipt.purchase_order?.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (receipt.purchase_order?.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSupplier = !filterSupplier || receipt.purchase_order?.supplier == filterSupplier
    const matchesStatus = !filterStatus || receipt.purchase_order?.status === filterStatus

    return matchesSearch && matchesSupplier && matchesStatus
  })

  const sortedReceipts = [...filteredReceipts].sort((a, b) => {
    let aVal = a[sortField] || ''
    let bVal = b[sortField] || ''
    
    if (sortField === 'receipt_date') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedReceipts.length / itemsPerPage)
  const paginatedReceipts = sortedReceipts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 opacity-40" />
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />
  }

  const getQualityBadge = (item) => {
    if (!item.quality_checked) return { label: 'Non contrôlé', color: 'badge-ghost' }
    if (item.quality_ok) return { label: 'Conforme', color: 'badge-success' }
    return { label: 'Non conforme', color: 'badge-error' }
  }

  const conformityRate = stats.conforming + stats.non_conforming > 0
    ? Math.round((stats.conforming / (stats.conforming + stats.non_conforming)) * 100)
    : 0

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
            <Receipt className="w-7 h-7 text-primary" /> Réceptions de commandes
          </h1>
          <p className="text-sm lg:text-base text-base-content/60 mt-1">Gérez les réceptions de vos commandes d'achat</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn btn-outline btn-sm lg:btn-md gap-2">
            <RefreshCw className="w-4 h-4" /> <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button onClick={() => navigate('/receptions/nouveau')} className="btn btn-primary btn-sm lg:btn-md gap-2">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nouvelle réception</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-primary p-3 lg:p-4">
          <div className="stat-figure text-primary"><Receipt className="w-6 h-6" /></div>
          <div className="stat-title text-sm">Total réceptions</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-info p-3 lg:p-4">
          <div className="stat-figure text-info"><Package className="w-6 h-6" /></div>
          <div className="stat-title text-sm">Articles reçus</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.total_items}</div>
          <div className="stat-desc text-xs">{stats.total_quantity} unités</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-warning p-3 lg:p-4">
          <div className="stat-figure text-warning"><AlertTriangle className="w-6 h-6" /></div>
          <div className="stat-title text-sm">En attente</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.pending_orders}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-success p-3 lg:p-4">
          <div className="stat-figure text-success"><CheckCircle className="w-6 h-6" /></div>
          <div className="stat-title text-sm">Conformité</div>
          <div className="stat-value text-xl lg:text-2xl">{conformityRate}%</div>
          <div className="stat-desc text-xs">{stats.conforming} conformes</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-secondary p-3 lg:p-4 col-span-2 lg:col-span-1">
          <div className="stat-figure text-secondary"><Award className="w-6 h-6" /></div>
          <div className="stat-title text-sm">Non conformes</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.non_conforming}</div>
        </div>
      </div>

      {/* Filtres - Desktop */}
      <div className="hidden lg:flex bg-base-100 rounded-xl shadow-sm border border-base-300 p-4 items-center gap-3">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
          <input type="text" placeholder="Rechercher par numéro, commande ou fournisseur..." className="input input-bordered w-full pl-10"
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
                <th>Réception</th>
                <th>Commande</th>
                <th>Fournisseur</th>
                <th><button className="flex items-center gap-1 font-semibold" onClick={() => handleSort('receipt_date')}>Date <SortIcon field="receipt_date" /></button></th>
                <th className="text-center">Articles</th>
                <th className="text-center">Statut</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReceipts.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-base-content/50">Aucune réception trouvée</td></tr>
              ) : (
                paginatedReceipts.map((receipt) => {
                  const status = statusConfig[receipt.purchase_order?.status] || statusConfig.draft
                  
                  return (
                    <tr key={receipt.id} className="hover">
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar placeholder">
                            <div className="bg-primary/10 rounded-lg w-10 h-10">
                              <Receipt className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{receipt.receipt_number}</div>
                            <div className="text-xs text-base-content/60">Reçu par: {receipt.received_by_name || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-medium">{receipt.purchase_order?.order_number || '-'}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4 text-base-content/50" />
                          <span>{receipt.purchase_order?.supplier_name || '-'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-base-content/50" />
                          <span>{formatDate(receipt.receipt_date)}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge badge-outline">{receipt.items?.length || 0} article(s)</span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${status.color}`}>{status.label}</span>
                      </td>
                      <td>
                        <div className="flex justify-center gap-1">
                          <button 
                            className="btn btn-ghost btn-sm" 
                            onClick={() => navigate(`/receptions/${receipt.id}`)}
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm text-primary" 
                            onClick={() => handleDownloadPDF(receipt)}
                            disabled={downloadingPDF === receipt.id}
                            title="Télécharger PDF"
                          >
                            {downloadingPDF === receipt.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
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
        {paginatedReceipts.length === 0 ? (
          <div className="bg-base-100 rounded-xl p-8 text-center border border-base-300 text-base-content/50">Aucune réception</div>
        ) : (
          paginatedReceipts.map((receipt) => {
            const status = statusConfig[receipt.purchase_order?.status] || statusConfig.draft
            
            return (
              <div key={receipt.id} className="bg-base-100 rounded-xl p-4 border border-base-300">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-bold">{receipt.receipt_number}</span>
                      <p className="text-sm text-base-content/60">{receipt.purchase_order?.order_number}</p>
                    </div>
                  </div>
                  <span className={`badge ${status.color}`}>{status.label}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div><span className="text-base-content/60">Fournisseur:</span> {receipt.purchase_order?.supplier_name}</div>
                  <div><span className="text-base-content/60">Date:</span> {formatDate(receipt.receipt_date)}</div>
                  <div><span className="text-base-content/60">Articles:</span> {receipt.items?.length || 0}</div>
                  <div><span className="text-base-content/60">Reçu par:</span> {receipt.received_by_name || '-'}</div>
                </div>
                
                <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-base-200">
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/receptions/${receipt.id}`)}>
                    <Eye className="w-4 h-4" /> Voir
                  </button>
                  <button 
                    className="btn btn-ghost btn-sm text-primary" 
                    onClick={() => handleDownloadPDF(receipt)}
                    disabled={downloadingPDF === receipt.id}
                  >
                    {downloadingPDF === receipt.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {sortedReceipts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-base-content/60">
            {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedReceipts.length)} sur {sortedReceipts.length}
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
    </div>
  )
}

export default PurchaseReceipts