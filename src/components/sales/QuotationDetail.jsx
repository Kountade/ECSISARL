// src/components/sales/QuotationDetail.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import {
  ArrowLeft,
  Users,
  Calendar,
  Package,
  FileText,
  CheckCircle,
  XCircle,
  Send,
  Check,
  Warehouse,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Clock,
  Download,
  Printer,
  Edit,
  Trash2,
  RefreshCw,
  Eye
} from 'lucide-react'

// ========== STYLES PDF ÉCONOMIQUES ==========
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    paddingBottom: 15
  },
  companyBox: {
    flex: 1
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4
  },
  companySub: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 2
  },
  docBox: {
    alignItems: 'flex-end'
  },
  docTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4
  },
  docNumber: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 4
  },
  statusBadge: {
    borderWidth: 1,
    borderColor: '#999999',
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4
  },
  statusText: {
    fontSize: 9,
    color: '#333333',
    fontWeight: 'bold'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    marginTop: 10
  },
  infoBox: {
    width: '48%'
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    paddingBottom: 4,
    marginBottom: 8
  },
  infoLine: {
    flexDirection: 'row',
    marginBottom: 4,
    fontSize: 9
  },
  infoLabel: {
    width: 70,
    fontWeight: 'bold',
    color: '#555555'
  },
  infoValue: {
    flex: 1,
    color: '#000000'
  },
  // Tableau avec bordures
  table: {
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EEEEEE',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC'
  },
  tableHeaderCell: {
    paddingVertical: 8,
    paddingHorizontal: 5
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333333'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDDDDD'
  },
  tableCell: {
    paddingVertical: 6,
    paddingHorizontal: 5
  },
  tableCellText: {
    fontSize: 8,
    color: '#000000'
  },
  colProduct: { width: '40%' },
  colRef: { width: '20%' },
  colQty: { width: '12%' },
  colPrice: { width: '13%' },
  colTotal: { width: '15%' },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  totalsBox: {
    marginTop: 10,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    paddingTop: 10
  },
  totalLine: {
    flexDirection: 'row',
    marginBottom: 4,
    width: 250
  },
  totalLabel: {
    width: 120,
    fontSize: 9,
    textAlign: 'right',
    paddingRight: 10,
    color: '#555555'
  },
  totalValue: {
    width: 100,
    fontSize: 9,
    textAlign: 'right',
    color: '#000000'
  },
  grandTotalLine: {
    flexDirection: 'row',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#999999',
    width: 250
  },
  grandTotalLabel: {
    width: 120,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingRight: 10,
    color: '#000000'
  },
  grandTotalValue: {
    width: 100,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#000000'
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 7,
    color: '#999999',
    marginBottom: 2
  },
  notesBox: {
    marginTop: 15,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE'
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4
  },
  notesText: {
    fontSize: 8,
    color: '#555555',
    lineHeight: 1.4
  }
})

// ========== COMPOSANT PDF ==========
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
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      draft: 'BROUILLON',
      sent: 'ENVOYÉ',
      approved: 'APPROUVÉ',
      rejected: 'REJETÉ',
      expired: 'EXPIRÉ',
      converted: 'CONVERTI'
    }
    return statusMap[status] || status.toUpperCase()
  }

  const customer = quotation.customer || {}
  const items = quotation.items || []

  let subtotal = 0, taxTotal = 0, total = 0
  if (items.length > 0) {
    items.forEach(item => {
      const qty = parseFloat(item.quantity) || 0
      const price = parseFloat(item.unit_price) || 0
      const itemTotal = parseFloat(item.total) || (qty * price)
      const itemSubtotal = parseFloat(item.subtotal) || (itemTotal / 1.2)
      const itemTax = parseFloat(item.tax_amount) || (itemTotal - itemSubtotal)
      subtotal += itemSubtotal
      taxTotal += itemTax
      total += itemTotal
    })
  } else {
    subtotal = parseFloat(quotation.subtotal) || 0
    taxTotal = parseFloat(quotation.tax_total) || 0
    total = parseFloat(quotation.total) || 0
  }

  const discount = parseFloat(quotation.discount) || 0
  const finalTotal = total - discount

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* En-tête */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.companyBox}>
            <Text style={pdfStyles.companyName}>ECSISARL</Text>
            <Text style={pdfStyles.companySub}>Talephone: </Text>
            <Text style={pdfStyles.companySub}>Email: ecsisarlinfo@gmail.com</Text>
          </View>
          <View style={pdfStyles.docBox}>
            <Text style={pdfStyles.docTitle}>DEVIS</Text>
            <Text style={pdfStyles.docNumber}>N° {quotation.quotation_number}</Text>
            <View style={pdfStyles.statusBadge}>
              <Text style={pdfStyles.statusText}>{getStatusLabel(quotation.status)}</Text>
            </View>
          </View>
        </View>

        {/* Informations */}
        <View style={pdfStyles.infoRow}>
          <View style={pdfStyles.infoBox}>
            <Text style={pdfStyles.sectionTitle}>CLIENT</Text>
            <View style={pdfStyles.infoLine}>
              <Text style={pdfStyles.infoLabel}>Nom :</Text>
              <Text style={pdfStyles.infoValue}>{customer.full_name || customer.company_name || '-'}</Text>
            </View>
            {customer.email && (
              <View style={pdfStyles.infoLine}>
                <Text style={pdfStyles.infoLabel}>Email :</Text>
                <Text style={pdfStyles.infoValue}>{customer.email}</Text>
              </View>
            )}
            {customer.phone && (
              <View style={pdfStyles.infoLine}>
                <Text style={pdfStyles.infoLabel}>Tél :</Text>
                <Text style={pdfStyles.infoValue}>{customer.phone}</Text>
              </View>
            )}
            {customer.address && (
              <View style={pdfStyles.infoLine}>
                <Text style={pdfStyles.infoLabel}>Adresse :</Text>
                <Text style={pdfStyles.infoValue}>{customer.address}</Text>
              </View>
            )}
          </View>

          <View style={pdfStyles.infoBox}>
            <Text style={pdfStyles.sectionTitle}>DÉTAILS DEVIS</Text>
            <View style={pdfStyles.infoLine}>
              <Text style={pdfStyles.infoLabel}>Date :</Text>
              <Text style={pdfStyles.infoValue}>{formatDate(quotation.quotation_date)}</Text>
            </View>
            <View style={pdfStyles.infoLine}>
              <Text style={pdfStyles.infoLabel}>Validité :</Text>
              <Text style={pdfStyles.infoValue}>{formatDate(quotation.valid_until)}</Text>
            </View>
            <View style={pdfStyles.infoLine}>
              <Text style={pdfStyles.infoLabel}>Créé par :</Text>
              <Text style={pdfStyles.infoValue}>{quotation.created_by?.email || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Tableau avec bordures et en-tête gris clair */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <View style={[pdfStyles.tableHeaderCell, pdfStyles.colProduct]}>
              <Text style={pdfStyles.tableHeaderText}>DÉSIGNATION</Text>
            </View>
            <View style={[pdfStyles.tableHeaderCell, pdfStyles.colRef]}>
              <Text style={pdfStyles.tableHeaderText}>RÉFÉRENCE</Text>
            </View>
            <View style={[pdfStyles.tableHeaderCell, pdfStyles.colQty]}>
              <Text style={[pdfStyles.tableHeaderText, pdfStyles.textCenter]}>QTÉ</Text>
            </View>
            <View style={[pdfStyles.tableHeaderCell, pdfStyles.colPrice]}>
              <Text style={[pdfStyles.tableHeaderText, pdfStyles.textRight]}>PRIX U.</Text>
            </View>
            <View style={[pdfStyles.tableHeaderCell, pdfStyles.colTotal]}>
              <Text style={[pdfStyles.tableHeaderText, pdfStyles.textRight]}>TOTAL HT</Text>
            </View>
          </View>

          {items.map((item, idx) => {
            const qty = parseFloat(item.quantity) || 0
            const price = parseFloat(item.unit_price) || 0
            const itemTotal = parseFloat(item.total) || (qty * price)
            const itemSubtotal = parseFloat(item.subtotal) || (itemTotal / 1.2)

            return (
              <View key={idx} style={pdfStyles.tableRow}>
                <View style={[pdfStyles.tableCell, pdfStyles.colProduct]}>
                  <Text style={pdfStyles.tableCellText}>{item.product?.name || item.product_name || '-'}</Text>
                </View>
                <View style={[pdfStyles.tableCell, pdfStyles.colRef]}>
                  <Text style={pdfStyles.tableCellText}>{item.product?.reference || item.product_reference || '-'}</Text>
                </View>
                <View style={[pdfStyles.tableCell, pdfStyles.colQty]}>
                  <Text style={[pdfStyles.tableCellText, pdfStyles.textCenter]}>{formatNumber(qty)}</Text>
                </View>
                <View style={[pdfStyles.tableCell, pdfStyles.colPrice]}>
                  <Text style={[pdfStyles.tableCellText, pdfStyles.textRight]}>{formatNumber(price)} FCFA</Text>
                </View>
                <View style={[pdfStyles.tableCell, pdfStyles.colTotal]}>
                  <Text style={[pdfStyles.tableCellText, pdfStyles.textRight]}>{formatNumber(itemSubtotal)} FCFA</Text>
                </View>
              </View>
            )
          })}

          {items.length === 0 && (
            <View style={pdfStyles.tableRow}>
              <View style={[pdfStyles.tableCell, { width: '100%' }]}>
                <Text style={[pdfStyles.tableCellText, pdfStyles.textCenter]}>Aucun article</Text>
              </View>
            </View>
          )}
        </View>

        {/* Totaux */}
        <View style={pdfStyles.totalsBox}>
          <View style={pdfStyles.totalLine}>
            <Text style={pdfStyles.totalLabel}>SOUS-TOTAL HT :</Text>
            <Text style={pdfStyles.totalValue}>{formatNumber(subtotal)} FCFA</Text>
          </View>
          <View style={pdfStyles.totalLine}>
            <Text style={pdfStyles.totalLabel}>TVA (20%) :</Text>
            <Text style={pdfStyles.totalValue}>{formatNumber(taxTotal)} FCFA</Text>
          </View>
          {discount > 0 && (
            <View style={pdfStyles.totalLine}>
              <Text style={pdfStyles.totalLabel}>REMISE :</Text>
              <Text style={pdfStyles.totalValue}>- {formatNumber(discount)} FCFA</Text>
            </View>
          )}
          <View style={pdfStyles.grandTotalLine}>
            <Text style={pdfStyles.grandTotalLabel}>TOTAL TTC :</Text>
            <Text style={pdfStyles.grandTotalValue}>{formatNumber(finalTotal)} FCFA</Text>
          </View>
        </View>

        {/* Notes */}
        {quotation.notes && (
          <View style={pdfStyles.notesBox}>
            <Text style={pdfStyles.notesTitle}>📝 NOTES</Text>
            <Text style={pdfStyles.notesText}>{quotation.notes}</Text>
          </View>
        )}

        {/* Conditions */}
        {quotation.terms_conditions && (
          <View style={[pdfStyles.notesBox, { marginTop: 8 }]}>
            <Text style={pdfStyles.notesTitle}>📋 CONDITIONS GÉNÉRALES</Text>
            <Text style={pdfStyles.notesText}>{quotation.terms_conditions}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>GALSENSHOP ERP - Solution ERP intégrée</Text>
          <Text style={pdfStyles.footerText}>Devis valable 30 jours</Text>
          <Text style={pdfStyles.footerText}>Document généré le {formatDate(new Date().toISOString())}</Text>
        </View>
      </Page>
    </Document>
  )
}

// ========== COMPOSANT PRINCIPAL ==========
const QuotationDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [quotation, setQuotation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showWarehouseModal, setShowWarehouseModal] = useState(false)
  const [warehouses, setWarehouses] = useState([])
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [loadingWarehouses, setLoadingWarehouses] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'badge-ghost', textColor: 'text-gray-600', bgColor: 'bg-gray-100', icon: FileText },
    sent: { label: 'Envoyé', color: 'badge-info', textColor: 'text-info', bgColor: 'bg-info/10', icon: Send },
    approved: { label: 'Approuvé', color: 'badge-success', textColor: 'text-success', bgColor: 'bg-success/10', icon: Check },
    rejected: { label: 'Rejeté', color: 'badge-error', textColor: 'text-error', bgColor: 'bg-error/10', icon: XCircle },
    expired: { label: 'Expiré', color: 'badge-warning', textColor: 'text-warning', bgColor: 'bg-warning/10', icon: Clock },
    converted: { label: 'Converti', color: 'badge-primary', textColor: 'text-primary', bgColor: 'bg-primary/10', icon: CheckCircle }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number)
  }

  const formatCurrency = (amount) => `${formatNumber(amount)} FCFA`

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

  const fetchQuotation = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get(`/quotations/${id}/`)
      setQuotation(response.data)
    } catch (error) {
      console.error(error)
      showNotification('Erreur lors du chargement du devis', 'error')
      navigate('/devis')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotation()
  }, [id])

  const handleSend = async () => {
    setActionLoading(true)
    try {
      await AxiosInstance.post(`/quotations/${id}/send/`)
      showNotification('Devis envoyé avec succès', 'success')
      fetchQuotation()
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors de l\'envoi', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      await AxiosInstance.post(`/quotations/${id}/approve/`)
      showNotification('Devis approuvé avec succès', 'success')
      fetchQuotation()
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors de l\'approbation', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    setActionLoading(true)
    try {
      await AxiosInstance.post(`/quotations/${id}/reject/`)
      showNotification('Devis rejeté', 'success')
      fetchQuotation()
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors du rejet', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    setActionLoading(true)
    try {
      await AxiosInstance.delete(`/quotations/${id}/`)
      showNotification('Devis supprimé avec succès', 'success')
      setTimeout(() => navigate('/devis'), 1500)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
      setActionLoading(false)
      setShowDeleteModal(false)
    }
  }

  const fetchWarehouses = async () => {
    setLoadingWarehouses(true)
    try {
      const response = await AxiosInstance.get('/warehouses/')
      setWarehouses(response.data || [])
      const defaultWarehouse = response.data?.find(w => w.is_default) || response.data?.[0]
      if (defaultWarehouse) setSelectedWarehouse(defaultWarehouse)
    } catch (error) {
      showNotification('Erreur lors du chargement des entrepôts', 'error')
    } finally {
      setLoadingWarehouses(false)
    }
  }

  const handleConvert = async () => {
    await fetchWarehouses()
    setShowWarehouseModal(true)
  }

  const confirmConvert = async () => {
    if (!selectedWarehouse) {
      showNotification('Veuillez sélectionner un entrepôt', 'error')
      return
    }
    setActionLoading(true)
    setShowWarehouseModal(false)
    try {
      const response = await AxiosInstance.post(`/quotations/${id}/convert_to_sale/`, {
        warehouse: selectedWarehouse.id
      })
      showNotification(response.data.message || 'Devis converti en vente avec succès', 'success')
      fetchQuotation()
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la conversion'
      showNotification(errorMsg, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Chargement du devis...</p>
        </div>
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Devis introuvable</h2>
          <Link to="/devis" className="btn btn-primary mt-4">Retour à la liste</Link>
        </div>
      </div>
    )
  }

  const status = statusConfig[quotation.status] || statusConfig.draft
  const StatusIcon = status.icon
  const isExpired = new Date(quotation.valid_until) < new Date() && quotation.status !== 'converted'
  const customer = quotation.customer || {}

  // Calcul des totaux
  let subtotal = 0, taxTotal = 0, total = 0
  if (quotation.items && quotation.items.length > 0) {
    quotation.items.forEach(item => {
      const qty = parseFloat(item.quantity) || 0
      const price = parseFloat(item.unit_price) || 0
      const itemTotal = parseFloat(item.total) || (qty * price)
      const itemSubtotal = parseFloat(item.subtotal) || (itemTotal / 1.2)
      const itemTax = parseFloat(item.tax_amount) || (itemTotal - itemSubtotal)
      subtotal += itemSubtotal
      taxTotal += itemTax
      total += itemTotal
    })
  } else {
    subtotal = parseFloat(quotation.subtotal) || 0
    taxTotal = parseFloat(quotation.tax_total) || 0
    total = parseFloat(quotation.total) || 0
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 md:px-8 py-6">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`alert shadow-lg text-sm ${notification.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/devis" className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Détail du devis</h1>
            <p className="text-gray-500 text-sm">N° {quotation.quotation_number}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handlePrint} className="btn btn-sm btn-outline gap-1">
            <Printer className="w-4 h-4" /> Imprimer
          </button>
          <PDFDownloadLink
            document={<QuotationPDF quotation={quotation} />}
            fileName={`devis_${quotation.quotation_number}.pdf`}
            className="btn btn-sm btn-primary gap-1"
          >
            {({ loading: pdfLoading }) => (
              <>
                <Download className="w-4 h-4" />
                {pdfLoading ? 'Préparation...' : 'PDF'}
              </>
            )}
          </PDFDownloadLink>
          {quotation.status === 'draft' && (
            <>
              <button onClick={handleSend} disabled={actionLoading} className="btn btn-sm btn-info gap-2">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer
              </button>
              <Link to={`/devis/${id}/edit`} className="btn btn-sm btn-outline gap-2">
                <Edit className="w-4 h-4" /> Modifier
              </Link>
              <button onClick={() => setShowDeleteModal(true)} className="btn btn-sm btn-error gap-2">
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            </>
          )}
          {quotation.status === 'sent' && (
            <>
              <button onClick={handleApprove} disabled={actionLoading} className="btn btn-sm btn-success gap-2">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Approuver
              </button>
              <button onClick={handleReject} disabled={actionLoading} className="btn btn-sm btn-error gap-2">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Rejeter
              </button>
            </>
          )}
          {quotation.status === 'approved' && (
            <button onClick={handleConvert} disabled={actionLoading} className="btn btn-sm btn-primary gap-2">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Convertir
            </button>
          )}
          <button onClick={fetchQuotation} className="btn btn-sm btn-ghost gap-1">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Carte principale */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className={`px-6 py-4 ${status.bgColor} border-b flex justify-between items-center`}>
          <div className="flex items-center gap-3">
            <StatusIcon className={`w-6 h-6 ${status.textColor}`} />
            <span className={`font-semibold ${status.textColor}`}>Statut : {status.label}</span>
            {isExpired && (
              <span className="badge badge-warning gap-1 ml-2">
                <Clock className="w-3 h-3" /> Expiré
              </span>
            )}
          </div>
          {quotation.converted_sale && (
            <Link to={`/ventes/${quotation.converted_sale.id}`} className="btn btn-sm btn-outline gap-1">
              <Eye className="w-3 h-3" /> Voir la vente
            </Link>
          )}
        </div>

        <div className="p-6">
          {/* Informations client et devis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                <Users className="w-5 h-5 text-primary" /> Informations client
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Nom / Société</p>
                  <p className="font-semibold text-gray-800">{customer.full_name || customer.company_name || '-'}</p>
                </div>
                {customer.code && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Code client</p>
                    <p className="font-mono text-sm">{customer.code}</p>
                  </div>
                )}
                {customer.email && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                    <p className="flex items-center gap-1 text-sm"><Mail className="w-3 h-3" /> {customer.email}</p>
                  </div>
                )}
                {customer.phone && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Téléphone</p>
                    <p className="flex items-center gap-1 text-sm"><Phone className="w-3 h-3" /> {customer.phone}</p>
                  </div>
                )}
                {customer.address && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Adresse</p>
                    <p className="flex items-start gap-1 text-sm"><MapPin className="w-3 h-3 mt-0.5" /> {customer.address}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                <FileText className="w-5 h-5 text-primary" /> Détails du devis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Date de création</p>
                  <p className="flex items-center gap-1 text-sm"><Calendar className="w-3 h-3" /> {formatDate(quotation.quotation_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Validité</p>
                  <p className={`flex items-center gap-1 text-sm ${isExpired ? 'text-error' : ''}`}>
                    <Clock className="w-3 h-3" /> {formatDate(quotation.valid_until)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Créé par</p>
                  <p className="text-sm">{quotation.created_by?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Modification</p>
                  <p className="text-sm">{formatDateTime(quotation.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des produits */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2 mb-4">
              <Package className="w-5 h-5 text-primary" /> Articles
            </h2>
            <div className="overflow-x-auto border rounded-xl">
              <table className="table w-full">
                <thead className="bg-gray-100">
                  <tr className="text-sm text-gray-700">
                    <th className="py-3 px-4">Produit</th>
                    <th className="py-3 px-4">Référence</th>
                    <th className="py-3 px-4 text-center">Quantité</th>
                    <th className="py-3 px-4 text-right">Prix unitaire</th>
                    <th className="py-3 px-4 text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items && quotation.items.length > 0 ? (
                    quotation.items.map((item, idx) => {
                      const qty = parseFloat(item.quantity) || 0
                      const price = parseFloat(item.unit_price) || 0
                      const itemTotal = parseFloat(item.total) || (qty * price)
                      const itemSubtotal = parseFloat(item.subtotal) || (itemTotal / 1.2)
                      return (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium">{item.product?.name || item.product_name || '-'}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-500">{item.product?.reference || item.product_reference || '-'}</td>
                          <td className="py-3 px-4 text-center font-semibold">{formatNumber(qty)}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(price)}</td>
                          <td className="py-3 px-4 text-right font-semibold">{formatCurrency(itemSubtotal)}</td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">Aucun article</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr className="font-semibold">
                    <td colSpan="4" className="py-3 px-4 text-right">Sous-total HT :</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(subtotal)}</td>
                  </tr>
                  <tr className="font-semibold">
                    <td colSpan="4" className="py-3 px-4 text-right">TVA (20%) :</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(taxTotal)}</td>
                  </tr>
                  {quotation.discount > 0 && (
                    <tr className="text-success">
                      <td colSpan="4" className="py-2 px-4 text-right">Remise :</td>
                      <td className="py-2 px-4 text-right">- {formatCurrency(quotation.discount)}</td>
                    </tr>
                  )}
                  <tr className="bg-primary/5">
                    <td colSpan="4" className="py-3 px-4 text-right text-lg font-bold">TOTAL TTC :</td>
                    <td className="py-3 px-4 text-right text-xl font-bold text-primary">
                      {formatCurrency(total - (quotation.discount || 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes et conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quotation.notes && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary" /> Notes
                </h3>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{quotation.notes}</p>
              </div>
            )}
            {quotation.terms_conditions && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary" /> Conditions générales
                </h3>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{quotation.terms_conditions}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal sélection entrepôt */}
      {showWarehouseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-primary px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Warehouse className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold text-white">Sélectionner l'entrepôt</h3>
              </div>
              <button onClick={() => setShowWarehouseModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {loadingWarehouses ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : warehouses.length === 0 ? (
                <div className="alert alert-warning">Aucun entrepôt trouvé.</div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {warehouses.map(wh => (
                    <label
                      key={wh.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedWarehouse?.id === wh.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="warehouse"
                        checked={selectedWarehouse?.id === wh.id}
                        onChange={() => setSelectedWarehouse(wh)}
                        className="radio radio-primary mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-semibold">
                          {wh.name}
                          {wh.is_default && <span className="badge badge-primary badge-sm ml-2">Défaut</span>}
                        </div>
                        {wh.location && <p className="text-sm text-gray-500">{wh.location}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button onClick={() => setShowWarehouseModal(false)} className="btn btn-outline">Annuler</button>
                <button onClick={confirmConvert} disabled={!selectedWarehouse} className="btn btn-primary gap-2">
                  <CheckCircle className="w-4 h-4" /> Convertir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-error" />
            </div>
            <h3 className="text-xl font-bold mb-2">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir supprimer le devis <strong className="text-error">"{quotation.quotation_number}"</strong> ?
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left text-sm">
              <p><strong>Client :</strong> {customer.full_name || customer.company_name}</p>
              <p><strong>Montant :</strong> {formatCurrency(total)}</p>
              <p><strong>Date :</strong> {formatDate(quotation.quotation_date)}</p>
            </div>
            <p className="text-xs text-gray-500 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline">Annuler</button>
              <button onClick={handleDelete} disabled={actionLoading} className="btn btn-error gap-2">
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Supprimer
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
        
        @media print {
          .btn, .fixed, .modal, .alert, button, .no-print {
            display: none !important;
          }
          body { background: white; padding: 0; margin: 0; }
          .shadow-lg { box-shadow: none; }
        }
      `}</style>
    </div>
  )
}

export default QuotationDetail