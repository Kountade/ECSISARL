// src/components/sales/Payments.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import {
  Plus,
  Search,
  RefreshCw,
  Filter,
  Users,
  CreditCard,
  Eye,
  FileText,
  Trash2,
  Printer,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Receipt
} from 'lucide-react'

// Styles pour le PDF du reçu
const receiptStyles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#003C3F'
  },
  companyInfo: {
    flex: 1
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003C3F',
    marginBottom: 4
  },
  companySlogan: {
    fontSize: 8,
    color: '#666',
    marginBottom: 2
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DA4A0E',
    marginBottom: 5,
    textAlign: 'right'
  },
  receiptSubtitle: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right'
  },
  paymentNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#003C3F',
    textAlign: 'right',
    marginTop: 5
  },
  infoSection: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#003C3F',
    borderLeftWidth: 3,
    borderLeftColor: '#DA4A0E',
    paddingLeft: 8,
    marginBottom: 10,
    marginTop: 5
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 5
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#555',
    fontSize: 9,
    width: 120
  },
  infoValue: {
    color: '#333',
    fontSize: 9,
    flex: 1,
    textAlign: 'right'
  },
  amountBox: {
    marginTop: 15,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DA4A0E'
  },
  amountLabel: {
    fontSize: 9,
    color: '#666',
    marginBottom: 5
  },
  amountValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#DA4A0E'
  },
  amountCurrency: {
    fontSize: 14,
    fontWeight: 'normal'
  },
  statusBadge: (status) => ({
    padding: 5,
    borderRadius: 5,
    backgroundColor: status === 'completed' ? '#2e7d32' : 
                     status === 'pending' ? '#ed6c02' : 
                     status === 'failed' ? '#d32f2f' : '#757575',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10
  }),
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  footer: {
    marginTop: 25,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 8,
    color: '#999',
    marginBottom: 3
  },
  signatureLine: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20
  },
  signatureText: {
    fontSize: 8,
    color: '#666'
  }
})

// Composant PDF du reçu
const PaymentReceiptPDF = ({ payment }) => {
  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(number)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const paymentMethods = {
    cash: 'Espèces',
    card: 'Carte bancaire',
    check: 'Chèque',
    transfer: 'Virement bancaire',
    mobile_money: 'Mobile Money',
    other: 'Autre'
  }

  const statusLabels = {
    pending: 'En attente',
    completed: 'Complété',
    failed: 'Échoué',
    refunded: 'Remboursé'
  }

  const customerName = payment.customer_name || payment.customer?.full_name || 'Client'
  const invoiceNumber = payment.invoice_number || payment.invoice?.invoice_number || '-'
  const method = paymentMethods[payment.payment_method] || payment.payment_method
  const statusLabel = statusLabels[payment.status] || payment.status

  return (
    <Document>
      <Page size="A4" style={receiptStyles.page}>
        
        {/* En-tête */}
        <View style={receiptStyles.header}>
          <View style={receiptStyles.companyInfo}>
            <Text style={receiptStyles.companyName}>ECSI SARL</Text>
            <Text style={receiptStyles.companySlogan}>Enterprise Resource Planning</Text>
            <Text style={receiptStyles.companySlogan}>Solution ERP Intégrée</Text>
          </View>
          <View>
            <Text style={receiptStyles.receiptTitle}>REÇU DE PAIEMENT</Text>
            <Text style={receiptStyles.receiptSubtitle}>Document officiel</Text>
            <Text style={receiptStyles.paymentNumber}>N° {payment.payment_number}</Text>
          </View>
        </View>

        {/* Informations générales */}
        <View style={receiptStyles.infoSection}>
          <Text style={receiptStyles.sectionTitle}>INFORMATIONS GÉNÉRALES</Text>
          <View style={receiptStyles.infoRow}>
            <Text style={receiptStyles.infoLabel}>Client :</Text>
            <Text style={receiptStyles.infoValue}>{customerName}</Text>
          </View>
          <View style={receiptStyles.infoRow}>
            <Text style={receiptStyles.infoLabel}>Facture associée :</Text>
            <Text style={receiptStyles.infoValue}>{invoiceNumber}</Text>
          </View>
          <View style={receiptStyles.infoRow}>
            <Text style={receiptStyles.infoLabel}>Date du paiement :</Text>
            <Text style={receiptStyles.infoValue}>{formatDate(payment.payment_date)}</Text>
          </View>
          <View style={receiptStyles.infoRow}>
            <Text style={receiptStyles.infoLabel}>Mode de paiement :</Text>
            <Text style={receiptStyles.infoValue}>{method}</Text>
          </View>
          {payment.reference && (
            <View style={receiptStyles.infoRow}>
              <Text style={receiptStyles.infoLabel}>Référence transaction :</Text>
              <Text style={receiptStyles.infoValue}>{payment.reference}</Text>
            </View>
          )}
        </View>

        {/* Montant */}
        <View style={receiptStyles.amountBox}>
          <Text style={receiptStyles.amountLabel}>MONTANT PAYÉ</Text>
          <Text style={receiptStyles.amountValue}>
            {formatNumber(payment.amount)} <Text style={receiptStyles.amountCurrency}>FCFA</Text>
          </Text>
        </View>

        {/* Statut */}
        <View style={receiptStyles.statusBadge(payment.status)}>
          <Text style={receiptStyles.statusText}>
            {statusLabel}
          </Text>
        </View>

        {/* Notes */}
        {payment.notes && (
          <View style={receiptStyles.infoSection}>
            <Text style={receiptStyles.sectionTitle}>COMMENTAIRES</Text>
            <View style={receiptStyles.infoRow}>
              <Text style={receiptStyles.infoValue}>{payment.notes}</Text>
            </View>
          </View>
        )}

        {/* Signature / Cachet */}
        <View style={receiptStyles.signatureLine}>
          <Text style={receiptStyles.signatureText}>Signature du client</Text>
          <Text style={receiptStyles.signatureText}>Cachet et signature ECSI SARL</Text>
        </View>

        {/* Footer */}
        <View style={receiptStyles.footer}>
          <Text style={receiptStyles.footerText}>ECSI SARL - Solution ERP intégrée</Text>
          <Text style={receiptStyles.footerText}>Ce document fait office de reçu officiel</Text>
          <Text style={receiptStyles.footerText}>Généré le {formatDateTime(new Date())}</Text>
        </View>
      </Page>
    </Document>
  )
}

// Composant principal
const Payments = () => {
  const navigate = useNavigate()

  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMethod, setFilterMethod] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [sortField, setSortField] = useState('payment_date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)

  const paymentMethods = {
    cash: { label: 'Espèces', icon: '💰', color: 'success' },
    card: { label: 'Carte bancaire', icon: '💳', color: 'info' },
    check: { label: 'Chèque', icon: '📝', color: 'secondary' },
    transfer: { label: 'Virement', icon: '🏦', color: 'warning' },
    mobile_money: { label: 'Mobile Money', icon: '📱', color: 'error' },
    other: { label: 'Autre', icon: '📌', color: 'neutral' }
  }

  const statusConfig = {
    pending: { label: 'En attente', color: 'warning', icon: AlertCircle },
    completed: { label: 'Complété', color: 'success', icon: CheckCircle },
    failed: { label: 'Échoué', color: 'error', icon: XCircle },
    refunded: { label: 'Remboursé', color: 'neutral', icon: RefreshCw }
  }

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(number)
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
      const response = await AxiosInstance.get('/payments/')
      console.log('Payments data:', response.data)
      setPayments(response.data || [])
    } catch (err) {
      console.error('Error fetching payments:', err)
      showNotification('Erreur lors du chargement des paiements', 'error')
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchData() 
  }, [])

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return
    try {
      await AxiosInstance.delete(`/payments/${paymentToDelete.id}/`)
      showNotification('Paiement supprimé avec succès', 'success')
      fetchData()
      setShowDeleteModal(false)
      setPaymentToDelete(null)
    } catch (error) {
      console.error('Error:', error)
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  const handleGenerateReceipt = (payment) => {
    // Cette fonction est maintenant gérée par PDFDownloadLink
    showNotification('Préparation du reçu PDF...', 'info')
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredPayments = payments.filter(p => {
    const search = searchTerm.toLowerCase()
    const customerName = (p.customer_name || p.customer?.full_name || '').toLowerCase()
    const paymentNumber = (p.payment_number || '').toLowerCase()
    const invoiceNumber = (p.invoice_number || p.invoice?.invoice_number || '').toLowerCase()
    const reference = (p.reference || '').toLowerCase()
    
    const matchesSearch = paymentNumber.includes(search) || 
                         customerName.includes(search) || 
                         invoiceNumber.includes(search) ||
                         reference.includes(search)
    const matchesMethod = !filterMethod || p.payment_method === filterMethod
    const matchesStatus = !filterStatus || p.status === filterStatus
    
    return matchesSearch && matchesMethod && matchesStatus
  })

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    let aVal = a[sortField] || ''
    let bVal = b[sortField] || ''
    if (sortField === 'amount') {
      aVal = parseFloat(aVal) || 0
      bVal = parseFloat(bVal) || 0
    } else if (sortField === 'payment_date') {
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

  const totalPages = Math.ceil(sortedPayments.length / itemsPerPage)
  const paginatedPayments = sortedPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const stats = {
    total: payments.length,
    total_amount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    cash: payments.filter(p => p.payment_method === 'cash').reduce((sum, p) => sum + (p.amount || 0), 0),
    card: payments.filter(p => p.payment_method === 'card').reduce((sum, p) => sum + (p.amount || 0), 0),
    transfer: payments.filter(p => p.payment_method === 'transfer').reduce((sum, p) => sum + (p.amount || 0), 0),
    mobile_money: payments.filter(p => p.payment_method === 'mobile_money').reduce((sum, p) => sum + (p.amount || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des paiements...
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
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : notification.type === 'info' ? 'alert-info' : 'alert-error'} shadow-lg text-sm`}>
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
            Paiements
          </h1>
          <p className="text-xs text-base-content/60">Gérez les paiements des clients</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn btn-sm btn-outline gap-1"><RefreshCw className="w-3 h-3" /> Actualiser</button>
          <button onClick={() => navigate('/paiements/nouveau')} className="btn btn-sm btn-primary gap-1"><Plus className="w-3 h-3" /> Nouveau paiement</button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-primary"><CreditCard className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Total</div>
          <div className="stat-value text-xl font-black">{stats.total}</div>
          <div className="stat-desc text-xs">{formatNumber(stats.total_amount)} FCFA</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-success"><CheckCircle className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Complétés</div>
          <div className="stat-value text-xl font-black">{stats.completed}</div>
          <div className="stat-desc text-xs">{stats.pending} en attente</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-error"><CreditCard className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Mobile Money</div>
          <div className="stat-value text-sm font-black">{formatNumber(stats.mobile_money)} FCFA</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-success"><CreditCard className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Espèces</div>
          <div className="stat-value text-sm font-black">{formatNumber(stats.cash)} FCFA</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-base-content/40" />
            <input type="text" placeholder="Rechercher par numéro, client, facture..." className="input input-bordered w-full pl-8 text-sm input-sm" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-outline btn-sm sm:hidden gap-1"><Filter className="w-3 h-3" /> Filtres</button>
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex gap-2`}>
            <select className="select select-bordered select-sm w-36" value={filterMethod} onChange={(e) => { setFilterMethod(e.target.value); setCurrentPage(1) }}>
              <option value="">Tous modes</option>
              {Object.entries(paymentMethods).map(([key, config]) => (<option key={key} value={key}>{config.label}</option>))}
            </select>
            <select className="select select-bordered select-sm w-32" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}>
              <option value="">Tous statuts</option>
              <option value="pending">En attente</option>
              <option value="completed">Complété</option>
              <option value="failed">Échoué</option>
              <option value="refunded">Remboursé</option>
            </select>
            <button className="btn btn-outline btn-sm gap-1" onClick={() => { setFilterMethod(''); setFilterStatus(''); setSearchTerm(''); setCurrentPage(1) }}>
              <Filter className="w-3 h-3" /> Réinit
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des paiements */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
        {paginatedPayments.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-base-content/30" />
            <p className="font-semibold text-base-content/50">Aucun paiement trouvé</p>
            <button onClick={() => navigate('/paiements/nouveau')} className="btn btn-sm btn-primary mt-3 gap-1"><Plus className="w-3 h-3" /> Nouveau paiement</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table table-xs w-full">
                <thead>
                  <tr className="text-xs">
                    <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('payment_number')}>N° paiement<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('customer_name')}>Client<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th>Facture</th>
                    <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('payment_date')}>Date<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th>Mode</th>
                    <th className="text-center">Statut</th>
                    <th className="text-right"><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('amount')}>Montant<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayments.map((payment) => {
                    const method = paymentMethods[payment.payment_method] || paymentMethods.other
                    const status = statusConfig[payment.status] || statusConfig.pending
                    const StatusIcon = status.icon
                    const customerName = payment.customer_name || payment.customer?.full_name || 'Client'
                    const invoiceNumber = payment.invoice_number || payment.invoice?.invoice_number || '-'
                    
                    return (
                      <tr key={payment.id} className="hover">
                        <td className="font-mono text-xs font-semibold">{payment.payment_number}</td>
                        <td><div className="flex items-center gap-1"><Users className="w-3 h-3 text-primary" /><span className="text-sm">{customerName}</span></div></td>
                        <td className="text-sm">{invoiceNumber}</td>
                        <td className="text-sm">{formatDate(payment.payment_date)}</td>
                        <td><span className="badge badge-sm gap-1">{method.icon} {method.label}</span></td>
                        <td className="text-center"><span className={`badge badge-${status.color} badge-sm gap-1`}><StatusIcon className="w-2.5 h-2.5" /> {status.label}</span></td>
                        <td className="text-right font-bold text-sm">{formatNumber(payment.amount)} FCFA</td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => { setSelectedPayment(payment); setShowDetailsModal(true) }} className="btn btn-ghost btn-xs" title="Détails"><Eye className="w-3.5 h-3.5" /></button>
                            <PDFDownloadLink
                              document={<PaymentReceiptPDF payment={payment} />}
                              fileName={`recu_paiement_${payment.payment_number}.pdf`}
                              className="btn btn-ghost btn-xs text-primary"
                              title="Télécharger reçu PDF"
                            >
                              {({ loading }) => (
                                loading ? <span className="loading loading-spinner loading-xs"></span> : <FileText className="w-3.5 h-3.5" />
                              )}
                            </PDFDownloadLink>
                            {payment.status === 'pending' && (
                              <button onClick={() => { setPaymentToDelete(payment); setShowDeleteModal(true) }} className="btn btn-ghost btn-xs text-error" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
                            )}
                          </div>
                         </td>
                       </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-base-100 border-t-2">
                  <tr className="text-xs font-bold">
                    <td colSpan="6" className="text-right">Total:</td>
                    <td className="text-right">{formatNumber(sortedPayments.reduce((s, p) => s + (p.amount || 0), 0))} FCFA</td>
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
                    {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedPayments.length)} sur {sortedPayments.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <select className="select select-bordered select-xs w-20" value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}>
                      <option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option>
                    </select>
                    <div className="join">
                      <button className="join-item btn btn-xs" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="w-3 h-3" /></button>
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum = i + 1
                        if (totalPages > 5 && currentPage > 3) {
                          pageNum = currentPage - 2 + i
                          if (pageNum > totalPages) return null
                        }
                        return (<button key={i} className={`join-item btn btn-xs ${currentPage === pageNum ? 'btn-primary' : ''}`} onClick={() => setCurrentPage(pageNum)}>{pageNum}</button>)
                      })}
                      <button className="join-item btn btn-xs" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Détails */}
      {showDetailsModal && selectedPayment && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">{selectedPayment.payment_number}</h3>
              <span className={`badge badge-${statusConfig[selectedPayment.status]?.color} badge-sm mt-1`}>
                {statusConfig[selectedPayment.status]?.label}
              </span>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-base-200">
                  <span className="text-base-content/50">Client</span>
                  <span className="font-semibold">{selectedPayment.customer_name || selectedPayment.customer?.full_name || 'Client'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-base-200">
                  <span className="text-base-content/50">Facture</span>
                  <span>{selectedPayment.invoice_number || selectedPayment.invoice?.invoice_number || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-base-200">
                  <span className="text-base-content/50">Date</span>
                  <span>{formatDate(selectedPayment.payment_date)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-base-200">
                  <span className="text-base-content/50">Mode</span>
                  <span>{paymentMethods[selectedPayment.payment_method]?.label || selectedPayment.payment_method}</span>
                </div>
                {selectedPayment.reference && (
                  <div className="flex justify-between py-2 border-b border-base-200">
                    <span className="text-base-content/50">Référence</span>
                    <span className="font-mono text-sm">{selectedPayment.reference}</span>
                  </div>
                )}
                <div className="mt-3 p-3 bg-primary/10 rounded-lg text-center">
                  <p className="text-xs text-base-content/50">Montant payé</p>
                  <p className="text-2xl font-bold text-primary">{formatNumber(selectedPayment.amount)} FCFA</p>
                </div>
                {selectedPayment.notes && (
                  <div className="py-2">
                    <p className="text-xs text-base-content/50">Notes</p>
                    <p className="text-sm">{selectedPayment.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 p-4 bg-base-200">
              <button onClick={() => setShowDetailsModal(false)} className="btn btn-ghost flex-1">Fermer</button>
              <PDFDownloadLink
                document={<PaymentReceiptPDF payment={selectedPayment} />}
                fileName={`recu_paiement_${selectedPayment.payment_number}.pdf`}
                className="btn btn-primary flex-1 gap-1"
              >
                {({ loading }) => (
                  <>
                    <FileText className="w-4 h-4" />
                    {loading ? 'Préparation...' : 'Reçu PDF'}
                  </>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {showDeleteModal && paymentToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4">
            <div className="text-center mb-3">
              <div className="avatar placeholder mb-2"><div className="bg-error/10 text-error rounded-full w-12 h-12"><AlertCircle className="w-6 h-6" /></div></div>
              <h3 className="font-bold text-base mb-1">Confirmer la suppression</h3>
              <p className="text-xs text-base-content/70">Supprimer le paiement <strong>"{paymentToDelete.payment_number}"</strong> ?</p>
              <div className="mt-2 p-2 bg-base-200 rounded-lg">
                <p className="text-xs"><strong>Client:</strong> {paymentToDelete.customer_name || paymentToDelete.customer?.full_name}</p>
                <p className="text-xs"><strong>Montant:</strong> {formatNumber(paymentToDelete.amount)} FCFA</p>
              </div>
              <p className="text-xs text-base-content/50 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn btn-sm btn-error flex-1" onClick={handleDeletePayment}>Supprimer</button>
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

export default Payments