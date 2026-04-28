// src/components/sales/Quotations.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import {
  Plus,
  Search,
  RefreshCw,
  Filter,
  Eye,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Users,
  Receipt,
  FileText,
  AlertCircle,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  Edit,
  UserCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react'
import logo from '../../assets/logo.svg'

// Styles pour le PDF
const pdfStyles = StyleSheet.create({
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003C3F',
    marginBottom: 4
  },
  companySlogan: {
    fontSize: 8,
    color: '#666',
    marginBottom: 2
  },
  logoContainer: {
    alignItems: 'flex-end'
  },
  logoImage: {
    width: 50,
    height: 50,
    marginBottom: 5
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DA4A0E',
    marginBottom: 3
  },
  quotationNumber: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right'
  },
  statusBadge: (statusColor) => ({
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: statusColor,
    marginTop: 5,
    alignSelf: 'flex-end'
  }),
  statusText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center'
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
    marginBottom: 5,
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
  customerCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15
  },
  customerName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#003C3F',
    marginBottom: 4
  },
  table: {
    marginTop: 10,
    marginBottom: 10
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#003C3F',
    paddingVertical: 8,
    paddingHorizontal: 6
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 6
  },
  productCol: { width: '50%' },
  quantityCol: { width: '15%', textAlign: 'center' },
  priceCol: { width: '17%', textAlign: 'right' },
  totalCol: { width: '18%', textAlign: 'right' },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  productName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827'
  },
  productRef: {
    fontSize: 7,
    color: '#6B7280',
    marginTop: 2
  },
  totalSection: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end'
  },
  totalRow: {
    flexDirection: 'row',
    marginVertical: 3
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    width: 100,
    textAlign: 'right',
    marginRight: 10
  },
  totalValue: {
    fontSize: 9,
    fontWeight: 'bold',
    width: 100,
    textAlign: 'right'
  },
  grandTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#DA4A0E',
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#003C3F'
  },
  notesBox: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 3,
    borderLeftColor: '#DA4A0E',
    padding: 10,
    marginTop: 10,
    marginBottom: 10
  },
  notesText: {
    fontSize: 8,
    color: '#111827',
    lineHeight: 1.4
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 7,
    color: '#999',
    marginBottom: 2
  }
})

// Composant PDF du devis
const QuotationPDF = ({ quotation }) => {
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

  const getStatusColor = (status) => {
    const colors = {
      draft: '#757575',
      sent: '#1976d2',
      approved: '#2e7d32',
      rejected: '#d32f2f',
      expired: '#ed6c02',
      converted: '#2e7d32'
    }
    return colors[status] || '#757575'
  }

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'BROUILLON',
      sent: 'ENVOYÉ',
      approved: 'APPROUVÉ',
      rejected: 'REJETÉ',
      expired: 'EXPIRÉ',
      converted: 'CONVERTI'
    }
    return labels[status] || status
  }

  const subtotal = quotation.items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0
  const taxTotal = subtotal * 0.2
  const total = subtotal + taxTotal

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        
        {/* En-tête */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.companyInfo}>
            <Text style={pdfStyles.companyName}>ECSI SARL</Text>
            <Text style={pdfStyles.companySlogan}>Enterprise Resource Planning</Text>
            <Text style={pdfStyles.companySlogan}>Solution ERP Intégrée</Text>
          </View>
          <View style={pdfStyles.logoContainer}>
            <Image src={logo} style={pdfStyles.logoImage} />
            <Text style={pdfStyles.title}>DEVIS</Text>
            <Text style={pdfStyles.quotationNumber}>N° {quotation.quotation_number}</Text>
            <View style={pdfStyles.statusBadge(getStatusColor(quotation.status))}>
              <Text style={pdfStyles.statusText}>{getStatusLabel(quotation.status)}</Text>
            </View>
          </View>
        </View>

        {/* Informations générales */}
        <View style={pdfStyles.infoSection}>
          <Text style={pdfStyles.sectionTitle}>INFORMATIONS GÉNÉRALES</Text>
          
          <View style={pdfStyles.customerCard}>
            <Text style={pdfStyles.customerName}>{quotation.customer_name}</Text>
            {quotation.customer_email && (
              <Text style={[pdfStyles.infoValue, { textAlign: 'left', fontSize: 8, marginTop: 3 }]}>
                {quotation.customer_email}
              </Text>
            )}
            {quotation.customer_phone && (
              <Text style={[pdfStyles.infoValue, { textAlign: 'left', fontSize: 8 }]}>
                {quotation.customer_phone}
              </Text>
            )}
          </View>

          <View style={pdfStyles.infoRow}>
            <Text style={pdfStyles.infoLabel}>Date du devis</Text>
            <Text style={pdfStyles.infoValue}>{formatDate(quotation.quotation_date)}</Text>
          </View>
          <View style={pdfStyles.infoRow}>
            <Text style={pdfStyles.infoLabel}>Date de validité</Text>
            <Text style={pdfStyles.infoValue}>{formatDate(quotation.valid_until)}</Text>
          </View>
        </View>

        {/* Articles */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.productCol]}>DÉSIGNATION</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.quantityCol, pdfStyles.textCenter]}>QTÉ</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.priceCol, pdfStyles.textRight]}>PRIX U.</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.totalCol, pdfStyles.textRight]}>TOTAL</Text>
          </View>
          {quotation.items?.map((item, idx) => (
            <View key={idx} style={pdfStyles.tableRow}>
              <View style={pdfStyles.productCol}>
                <Text style={pdfStyles.productName}>{item.product_name || '-'}</Text>
                {item.product_reference && (
                  <Text style={pdfStyles.productRef}>Réf: {item.product_reference}</Text>
                )}
              </View>
              <Text style={[pdfStyles.quantityCol, pdfStyles.textCenter]}>{item.quantity}</Text>
              <Text style={[pdfStyles.priceCol, pdfStyles.textRight]}>{formatNumber(item.unit_price)} FCFA</Text>
              <Text style={[pdfStyles.totalCol, pdfStyles.textRight]}>{formatNumber(item.total)} FCFA</Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={pdfStyles.totalSection}>
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalLabel}>SOUS-TOTAL HT:</Text>
            <Text style={pdfStyles.totalValue}>{formatNumber(subtotal)} FCFA</Text>
          </View>
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalLabel}>TVA (20%):</Text>
            <Text style={pdfStyles.totalValue}>{formatNumber(taxTotal)} FCFA</Text>
          </View>
          <View style={[pdfStyles.totalRow, pdfStyles.grandTotal]}>
            <Text style={[pdfStyles.totalLabel, { color: '#DA4A0E' }]}>TOTAL TTC:</Text>
            <Text style={[pdfStyles.totalValue, { color: '#DA4A0E', fontSize: 11 }]}>{formatNumber(total)} FCFA</Text>
          </View>
        </View>

        {/* Notes */}
        {quotation.notes && (
          <View style={pdfStyles.notesBox}>
            <Text style={pdfStyles.notesText}>{quotation.notes}</Text>
          </View>
        )}

        {/* Conditions générales */}
        {quotation.terms_conditions && (
          <View style={pdfStyles.infoSection}>
            <Text style={pdfStyles.sectionTitle}>CONDITIONS GÉNÉRALES</Text>
            <View style={pdfStyles.notesBox}>
              <Text style={pdfStyles.notesText}>{quotation.terms_conditions}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>ECSI SARL - Solution ERP intégrée</Text>
          <Text style={pdfStyles.footerText}>Devis valable 30 jours</Text>
          <Text style={pdfStyles.footerText}>Document généré le {new Date().toLocaleDateString('fr-FR')}</Text>
        </View>
      </Page>
    </Document>
  )
}

// Composant principal Quotations
const Quotations = () => {
  const navigate = useNavigate()

  const [quotations, setQuotations] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCustomer, setFilterCustomer] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [quotationToDelete, setQuotationToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [sortField, setSortField] = useState('quotation_date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'neutral', icon: FileText },
    sent: { label: 'Envoyé', color: 'info', icon: Send },
    approved: { label: 'Approuvé', color: 'success', icon: CheckCircle },
    rejected: { label: 'Rejeté', color: 'error', icon: XCircle },
    expired: { label: 'Expiré', color: 'warning', icon: AlertCircle },
    converted: { label: 'Converti', color: 'primary', icon: CheckCircle }
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
      const [quotationsRes, customersRes] = await Promise.all([
        AxiosInstance.get('/quotations/'),
        AxiosInstance.get('/customers/')
      ])
      setQuotations(quotationsRes.data || [])
      setCustomers(customersRes.data || [])
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

  const handleSendQuotation = async (id) => {
    try {
      await AxiosInstance.post(`/quotations/${id}/send/`)
      showNotification('Devis envoyé avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification("Erreur lors de l'envoi", 'error')
    }
  }

  const handleApproveQuotation = async (id) => {
    try {
      await AxiosInstance.post(`/quotations/${id}/approve/`)
      showNotification('Devis approuvé avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification("Erreur lors de l'approbation", 'error')
    }
  }

  const handleRejectQuotation = async (id) => {
    try {
      await AxiosInstance.post(`/quotations/${id}/reject/`)
      showNotification('Devis rejeté', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur lors du rejet', 'error')
    }
  }

  const handleDeleteQuotation = async () => {
    if (!quotationToDelete) return
    try {
      await AxiosInstance.delete(`/quotations/${quotationToDelete.id}/`)
      showNotification('Devis supprimé avec succès', 'success')
      fetchData()
      setShowDeleteModal(false)
      setQuotationToDelete(null)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  const handleConvertToSale = async (id) => {
    const warehouseId = prompt("Entrez l'ID de l'entrepôt pour la vente:")
    if (!warehouseId) return
    try {
      await AxiosInstance.post(`/quotations/${id}/convert_to_sale/`, { warehouse: parseInt(warehouseId) })
      showNotification('Devis converti en vente avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors de la conversion', 'error')
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

  const filteredQuotations = quotations.filter(q => {
    const search = searchTerm.toLowerCase()
    const matchesSearch = q.quotation_number?.toLowerCase().includes(search) ||
      q.customer_name?.toLowerCase().includes(search)
    const matchesCustomer = !filterCustomer || q.customer?.toString() === filterCustomer
    const matchesStatus = !filterStatus || q.status === filterStatus
    return matchesSearch && matchesCustomer && matchesStatus
  })

  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    let aVal = a[sortField] || ''
    let bVal = b[sortField] || ''
    if (sortField === 'total') {
      aVal = parseFloat(aVal) || 0
      bVal = parseFloat(bVal) || 0
    } else if (sortField === 'quotation_date' || sortField === 'valid_until') {
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

  const totalPages = Math.ceil(sortedQuotations.length / itemsPerPage)
  const paginatedQuotations = sortedQuotations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const stats = {
    total: quotations.length,
    draft: quotations.filter(q => q.status === 'draft').length,
    sent: quotations.filter(q => q.status === 'sent').length,
    approved: quotations.filter(q => q.status === 'approved').length,
    converted: quotations.filter(q => q.status === 'converted').length,
    total_amount: quotations.reduce((sum, q) => sum + (q.total || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des devis...
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
            Devis
          </h1>
          <p className="text-xs text-base-content/60">Gérez vos devis clients</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn btn-sm btn-outline gap-1"><RefreshCw className="w-3 h-3" /> Actualiser</button>
          <button onClick={() => navigate('/devis/nouveau')} className="btn btn-sm btn-primary gap-1"><Plus className="w-3 h-3" /> Nouveau devis</button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-primary"><Receipt className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Total</div>
          <div className="stat-value text-xl font-black">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-neutral"><FileText className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Brouillons</div>
          <div className="stat-value text-xl font-black">{stats.draft}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-info"><Send className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Envoyés</div>
          <div className="stat-value text-xl font-black">{stats.sent}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-success"><CheckCircle className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Approuvés</div>
          <div className="stat-value text-xl font-black">{stats.approved}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-primary"><DollarSign className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Montant total</div>
          <div className="stat-value text-sm font-black">{formatNumber(stats.total_amount)} FCFA</div>
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
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.full_name || c.company_name}</option>
              ))}
            </select>
            <select 
              className="select select-bordered select-sm w-32" 
              value={filterStatus} 
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}
            >
              <option value="">Tous statuts</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <button 
              className="btn btn-outline btn-sm gap-1" 
              onClick={() => { setFilterCustomer(''); setFilterStatus(''); setSearchTerm(''); setCurrentPage(1) }}
            >
              <Filter className="w-3 h-3" /> Réinit
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des devis */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
        {paginatedQuotations.length === 0 ? (
          <div className="p-8 text-center">
            <Receipt className="w-12 h-12 mx-auto mb-3 text-base-content/30" />
            <p className="font-semibold text-base-content/50">Aucun devis trouvé</p>
            <button onClick={() => navigate('/devis/nouveau')} className="btn btn-sm btn-primary mt-3 gap-1">
              <Plus className="w-3 h-3" /> Nouveau devis
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table table-xs w-full">
                <thead>
                  <tr className="text-xs">
                    <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('quotation_number')}>N° Devis<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('customer_name')}>Client<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('quotation_date')}>Date<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('valid_until')}>Validité<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th className="text-center">Statut</th>
                    <th className="text-right"><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('total')}>Montant<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedQuotations.map((quotation) => {
                    const status = statusConfig[quotation.status] || statusConfig.draft
                    const StatusIcon = status.icon
                    const isExpired = new Date(quotation.valid_until) < new Date() && quotation.status !== 'converted'
                    
                    return (
                      <tr key={quotation.id} className="hover">
                        <td>
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full bg-${status.color}/10 flex items-center justify-center`}>
                              <StatusIcon className={`w-3.5 h-3.5 text-${status.color}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{quotation.quotation_number}</p>
                              <p className="text-xs text-base-content/50">{quotation.items?.length || 0} produit(s)</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-primary" />
                            <span className="text-sm">{quotation.customer_name}</span>
                          </div>
                        </td>
                        <td className="text-sm">{formatDate(quotation.quotation_date)}</td>
                        <td className={`text-sm ${isExpired ? 'text-error font-semibold' : ''}`}>
                          {formatDate(quotation.valid_until)}
                          {isExpired && <span className="text-xs ml-1">(Expiré)</span>}
                        </td>
                        <td className="text-center">
                          <span className={`badge badge-${status.color} badge-sm gap-1`}>
                            <StatusIcon className="w-2.5 h-2.5" /> {status.label}
                          </span>
                        </td>
                        <td className="text-right font-bold text-sm">{formatNumber(quotation.total)} FCFA</td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            <button 
                              onClick={() => navigate(`/devis/${quotation.id}`)} 
                              className="btn btn-ghost btn-xs" 
                              title="Détails"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            
                            <PDFDownloadLink
                              document={<QuotationPDF quotation={quotation} />}
                              fileName={`devis_${quotation.quotation_number}.pdf`}
                              className="btn btn-ghost btn-xs text-primary"
                              title="Télécharger PDF"
                            >
                              {({ loading }) => (
                                loading ? <span className="loading loading-spinner loading-xs"></span> : <Download className="w-3.5 h-3.5" />
                              )}
                            </PDFDownloadLink>

                            {quotation.status === 'draft' && (
                              <>
                                <button 
                                  onClick={() => handleSendQuotation(quotation.id)} 
                                  className="btn btn-ghost btn-xs text-info" 
                                  title="Envoyer"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => navigate(`/devis/${quotation.id}/modifier`)} 
                                  className="btn btn-ghost btn-xs text-primary" 
                                  title="Modifier"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => { setQuotationToDelete(quotation); setShowDeleteModal(true) }} 
                                  className="btn btn-ghost btn-xs text-error" 
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {quotation.status === 'sent' && (
                              <>
                                <button 
                                  onClick={() => handleApproveQuotation(quotation.id)} 
                                  className="btn btn-ghost btn-xs text-success" 
                                  title="Approuver"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleRejectQuotation(quotation.id)} 
                                  className="btn btn-ghost btn-xs text-error" 
                                  title="Rejeter"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {quotation.status === 'approved' && (
                              <button 
                                onClick={() => handleConvertToSale(quotation.id)} 
                                className="btn btn-ghost btn-xs text-success" 
                                title="Convertir en vente"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-base-100 border-t-2">
                  <tr className="text-xs font-bold">
                    <td colSpan="5" className="text-right">Total général:</td>
                    <td className="text-right">{formatNumber(sortedQuotations.reduce((s, q) => s + (q.total || 0), 0))} FCFA</td>
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
                    {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedQuotations.length)} sur {sortedQuotations.length}
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
      {showDeleteModal && quotationToDelete && (
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
                Supprimer le devis <strong className="text-error">"{quotationToDelete.quotation_number}"</strong> ?
              </p>
              <div className="mt-2 p-2 bg-base-200 rounded-lg">
                <p className="text-xs"><strong>Client:</strong> {quotationToDelete.customer_name}</p>
                <p className="text-xs"><strong>Montant:</strong> {formatNumber(quotationToDelete.total)} FCFA</p>
                <p className="text-xs"><strong>Date:</strong> {formatDate(quotationToDelete.quotation_date)}</p>
              </div>
              <p className="text-xs text-base-content/50 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </button>
              <button className="btn btn-sm btn-error flex-1" onClick={handleDeleteQuotation}>
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
      `}</style>
    </div>
  )
}

export default Quotations