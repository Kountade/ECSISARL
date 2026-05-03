// src/components/sales/QuotationDetail.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
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
  Receipt,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Clock,
  Download,
  Printer
} from 'lucide-react'

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 25,
    backgroundColor: '#ffffff',
    fontSize: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
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
    marginBottom: 2
  },
  companySlogan: {
    fontSize: 8,
    color: '#666'
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DA4A0E',
    marginBottom: 3
  },
  documentNumber: {
    fontSize: 10,
    color: '#666'
  },
  statusBadge: {
    padding: 3,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 70,
    marginTop: 5
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 5
  },
  clientSection: {
    width: '48%'
  },
  quotationSection: {
    width: '48%'
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#003C3F',
    borderLeftWidth: 3,
    borderLeftColor: '#DA4A0E',
    paddingLeft: 6,
    marginBottom: 6
  },
  infoText: {
    fontSize: 9,
    marginBottom: 3
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#666'
  },
  infoValue: {
    color: '#333'
  },
  table: {
    marginTop: 8,
    marginBottom: 8
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#003C3F',
    paddingVertical: 5,
    paddingHorizontal: 5
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 4,
    paddingHorizontal: 5
  },
  productCol: { width: '45%' },
  quantityCol: { width: '15%', textAlign: 'center' },
  priceCol: { width: '20%', textAlign: 'right' },
  totalCol: { width: '20%', textAlign: 'right' },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  totalSection: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end'
  },
  totalRow: {
    flexDirection: 'row',
    marginVertical: 2
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    width: 80,
    textAlign: 'right',
    marginRight: 10
  },
  totalValue: {
    fontSize: 9,
    width: 80,
    textAlign: 'right'
  },
  grandTotal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#DA4A0E',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#003C3F'
  },
  footer: {
    marginTop: 12,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 7,
    color: '#999',
    marginBottom: 2
  }
})

// Hook personnalisé pour charger le logo en base64
const useLogo = () => {
  const [logoSrc, setLogoSrc] = useState(null)

  useEffect(() => {
    const loadLogo = async () => {
      // Chemins possibles
      const paths = [
        '/logo.svg',
        '/src/assets/logo.svg',
        '/assets/logo.svg',
        '/public/logo.svg'
      ]

      for (const path of paths) {
        try {
          const response = await fetch(path)
          if (response.ok) {
            const blob = await response.blob()
            const reader = new FileReader()
            reader.onloadend = () => {
              setLogoSrc(reader.result)
            }
            reader.readAsDataURL(blob)
            console.log(`Logo chargé depuis: ${path}`)
            return
          }
        } catch (error) {
          console.log(`Logo non trouvé au chemin: ${path}`)
        }
      }
      console.warn('Aucun logo trouvé, utilisation du texte par défaut')
    }

    loadLogo()
  }, [])

  return logoSrc
}

// Composant PDF pour le devis
const QuotationPDF = ({ quotation }) => {
  const logoSrc = useLogo()

  const statusConfig = {
    draft: { label: 'Brouillon', color: '#757575' },
    sent: { label: 'Envoyé', color: '#1976d2' },
    approved: { label: 'Approuvé', color: '#2e7d32' },
    rejected: { label: 'Rejeté', color: '#d32f2f' },
    expired: { label: 'Expiré', color: '#ed6c02' },
    converted: { label: 'Converti', color: '#9c27b0' }
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
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const status = statusConfig[quotation.status] || statusConfig.draft
  const customer = quotation.customer || {}
  const items = quotation.items || []
  
  // Calcul des totaux
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête avec logo à droite */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>GALSENSHOP ERP</Text>
            <Text style={styles.companySlogan}>Système de gestion intégré</Text>
            <Text style={styles.companySlogan}>Solution ERP professionnelle</Text>
          </View>
          <View style={styles.logoContainer}>
            {logoSrc ? (
              <Image src={logoSrc} style={styles.logoImage} />
            ) : (
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#003C3F', marginBottom: 5 }}>
                LOGO
              </Text>
            )}
            <Text style={styles.title}>DEVIS</Text>
            <Text style={styles.documentNumber}>N° {quotation.quotation_number}</Text>
            <View style={{ ...styles.statusBadge, backgroundColor: status.color }}>
              <Text>{status.label}</Text>
            </View>
          </View>
        </View>

        {/* Deux colonnes : Client à gauche, Infos devis à droite */}
        <View style={styles.infoRow}>
          <View style={styles.clientSection}>
            <Text style={styles.sectionTitle}>CLIENT</Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Nom: </Text>
              <Text style={styles.infoValue}>{customer.full_name || customer.company_name || '-'}</Text>
            </Text>
            {customer.email && (
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Email: </Text>
                <Text style={styles.infoValue}>{customer.email}</Text>
              </Text>
            )}
            {customer.phone && (
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Tél: </Text>
                <Text style={styles.infoValue}>{customer.phone}</Text>
              </Text>
            )}
            {customer.address && (
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Adresse: </Text>
                <Text style={styles.infoValue}>{customer.address}</Text>
              </Text>
            )}
          </View>

          <View style={styles.quotationSection}>
            <Text style={styles.sectionTitle}>DÉTAILS DEVIS</Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Date devis: </Text>
              <Text style={styles.infoValue}>{formatDate(quotation.quotation_date)}</Text>
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Valable jusqu'au: </Text>
              <Text style={styles.infoValue}>{formatDate(quotation.valid_until)}</Text>
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Créé par: </Text>
              <Text style={styles.infoValue}>{quotation.created_by?.email || '-'}</Text>
            </Text>
          </View>
        </View>

        {/* Articles */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.productCol]}>DÉSIGNATION</Text>
            <Text style={[styles.tableHeaderText, styles.quantityCol]}>QTÉ</Text>
            <Text style={[styles.tableHeaderText, styles.priceCol]}>PRIX U.</Text>
            <Text style={[styles.tableHeaderText, styles.totalCol]}>TOTAL HT</Text>
          </View>
          {items.map((item, idx) => {
            const qty = parseFloat(item.quantity) || 0
            const price = parseFloat(item.unit_price) || 0
            const itemTotal = parseFloat(item.total) || (qty * price)
            const itemSubtotal = parseFloat(item.subtotal) || (itemTotal / 1.2)
            return (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.productCol]}>{item.product?.name || item.product_name || '-'}</Text>
                <Text style={[styles.quantityCol, styles.textCenter]}>{qty}</Text>
                <Text style={[styles.priceCol, styles.textRight]}>{formatNumber(price)} FCFA</Text>
                <Text style={[styles.totalCol, styles.textRight]}>{formatNumber(itemSubtotal)} FCFA</Text>
              </View>
            )
          })}
        </View>

        {/* Totaux */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>SOUS-TOTAL HT:</Text>
            <Text style={styles.totalValue}>{formatNumber(subtotal)} FCFA</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA (20%):</Text>
            <Text style={styles.totalValue}>{formatNumber(taxTotal)} FCFA</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={[styles.totalLabel, { color: '#DA4A0E' }]}>TOTAL TTC:</Text>
            <Text style={[styles.totalValue, { color: '#DA4A0E', fontSize: 11 }]}>{formatNumber(total)} FCFA</Text>
          </View>
        </View>

        {/* Notes */}
        {quotation.notes && (
          <View style={{ marginTop: 6 }}>
            <Text style={styles.sectionTitle}>NOTES</Text>
            <Text style={styles.infoText}>{quotation.notes}</Text>
          </View>
        )}

        {/* Conditions générales */}
        {quotation.terms_conditions && (
          <View style={{ marginTop: 6 }}>
            <Text style={styles.sectionTitle}>CONDITIONS GÉNÉRALES</Text>
            <Text style={styles.infoText}>{quotation.terms_conditions}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>GALSENSHOP ERP - Solution ERP intégrée</Text>
          <Text style={styles.footerText}>Devis valable 30 jours</Text>
          <Text style={styles.footerText}>Document généré le {new Date().toLocaleDateString('fr-FR')}</Text>
        </View>
      </Page>
    </Document>
  )
}

// Composant principal de détail
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
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'badge-ghost', icon: null },
    sent: { label: 'Envoyé', color: 'badge-info', icon: Send },
    approved: { label: 'Approuvé', color: 'badge-success', icon: Check },
    rejected: { label: 'Rejeté', color: 'badge-error', icon: XCircle },
    expired: { label: 'Expiré', color: 'badge-warning', icon: Clock },
    converted: { label: 'Converti', color: 'badge-primary', icon: CheckCircle }
  }

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

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotation()
  }, [id])

  // Actions
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
      await AxiosInstance.post(`/quotations/${id}/convert_to_sale/`, {
        warehouse: selectedWarehouse.id
      })
      showNotification('Devis converti en vente avec succès', 'success')
      fetchQuotation()
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors de la conversion', 'error')
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
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
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
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      {/* En-tête avec actions */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/devis" className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Détail du devis</h1>
            <p className="text-gray-500">N° {quotation.quotation_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
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
              <button onClick={handleSend} disabled={actionLoading} className="btn btn-info gap-2">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer
              </button>
              <Link to={`/devis/${id}/edit`} className="btn btn-outline gap-2">
                Modifier
              </Link>
            </>
          )}
          {quotation.status === 'sent' && (
            <>
              <button onClick={handleApprove} disabled={actionLoading} className="btn btn-success gap-2">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Approuver
              </button>
              <button onClick={handleReject} disabled={actionLoading} className="btn btn-error gap-2">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Rejeter
              </button>
            </>
          )}
          {quotation.status === 'approved' && (
            <button onClick={handleConvert} disabled={actionLoading} className="btn btn-primary gap-2">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Convertir en vente
            </button>
          )}
        </div>
      </div>

      {/* Grille d'informations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : infos client et devis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Carte client */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Informations client
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm text-gray-500">Nom / Société</p>
                  <p className="font-semibold">{customer.full_name || customer.company_name || '-'}</p>
                </div>
                {customer.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="flex items-center gap-1"><Mail className="w-4 h-4" /> {customer.email}</p>
                  </div>
                )}
                {customer.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="flex items-center gap-1"><Phone className="w-4 h-4" /> {customer.phone}</p>
                  </div>
                )}
                {customer.address && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="flex items-start gap-1"><MapPin className="w-4 h-4 mt-0.5" /> {customer.address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Carte des articles */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Articles
              </h2>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Référence</th>
                      <th className="text-center">Qté</th>
                      <th className="text-right">Prix unitaire</th>
                      <th className="text-right">Total HT</th>
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
                          <tr key={idx}>
                            <td>{item.product?.name || item.product_name || '-'}</td>
                            <td>{item.product?.reference || item.product_reference || '-'}</td>
                            <td className="text-center">{qty}</td>
                            <td className="text-right">{formatNumber(price)} €</td>
                            <td className="text-right">{formatNumber(itemSubtotal)} €</td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr><td colSpan="5" className="text-center">Aucun article</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Notes et conditions */}
          {(quotation.notes || quotation.terms_conditions) && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                {quotation.notes && (
                  <div>
                    <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" /> Notes</h3>
                    <p className="text-gray-600 mt-1">{quotation.notes}</p>
                  </div>
                )}
                {quotation.terms_conditions && (
                  <div className="mt-3">
                    <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" /> Conditions générales</h3>
                    <p className="text-gray-600 mt-1">{quotation.terms_conditions}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite : résumé et statut */}
        <div className="space-y-6">
          {/* Carte statut */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Statut</h2>
              <div className="flex items-center gap-2">
                {StatusIcon && <StatusIcon className="w-4 h-4" />}
                <div className={`badge ${status.color} badge-lg`}>{status.label}</div>
              </div>
              {isExpired && <div className="alert alert-warning mt-3">Ce devis est expiré</div>}
              <div className="divider my-2"></div>
              <div className="flex justify-between">
                <span>Date de création</span>
                <span>{formatDate(quotation.quotation_date)}</span>
              </div>
              <div className="flex justify-between">
                <span>Valable jusqu'au</span>
                <span className={isExpired ? 'text-error' : ''}>{formatDate(quotation.valid_until)}</span>
              </div>
            </div>
          </div>

          {/* Carte récapitulatif financier */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2"><DollarSign className="w-5 h-5" /> Récapitulatif</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total HT</span>
                  <span>{formatNumber(subtotal)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (20%)</span>
                  <span>{formatNumber(taxTotal)} €</span>
                </div>
                {quotation.discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Remise</span>
                    <span>- {formatNumber(quotation.discount)} €</span>
                  </div>
                )}
                {quotation.shipping_cost > 0 && (
                  <div className="flex justify-between">
                    <span>Frais de livraison</span>
                    <span>{formatNumber(quotation.shipping_cost)} €</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total TTC</span>
                    <span className="text-primary">{formatNumber(total)} €</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Entrepôt utilisé (si déjà converti) */}
          {quotation.converted_sale && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title flex items-center gap-2"><Warehouse className="w-5 h-5" /> Vente associée</h2>
                <p>Devis converti en vente n° <strong>{quotation.converted_sale.sale_number}</strong></p>
                <Link to={`/ventes/${quotation.converted_sale.id}`} className="btn btn-sm btn-outline mt-2">
                  Voir la vente
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de sélection d'entrepôt pour conversion */}
      {showWarehouseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><Warehouse className="w-5 h-5" /> Sélectionner l'entrepôt</h3>
              <button onClick={() => setShowWarehouseModal(false)} className="btn btn-sm btn-ghost">✕</button>
            </div>
            {loadingWarehouses ? (
              <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : warehouses.length === 0 ? (
              <div className="alert alert-warning">Aucun entrepôt trouvé.</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {warehouses.map(wh => (
                  <label key={wh.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${selectedWarehouse?.id === wh.id ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                    <input type="radio" name="warehouse" value={wh.id} checked={selectedWarehouse?.id === wh.id} onChange={() => setSelectedWarehouse(wh)} className="radio radio-primary mt-1" />
                    <div className="flex-1">
                      <div className="font-semibold">{wh.name} {wh.is_default && <span className="badge badge-primary badge-sm">Défaut</span>}</div>
                      {wh.location && <p className="text-xs text-gray-500">{wh.location}</p>}
                    </div>
                  </label>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowWarehouseModal(false)} className="btn btn-outline">Annuler</button>
              <button onClick={confirmConvert} disabled={!selectedWarehouse} className="btn btn-primary gap-2">
                <CheckCircle className="w-4 h-4" /> Convertir
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
          .btn, .btn-sm, .fixed, .modal, nav, header, .no-print { display: none !important; }
          body { background: white; padding: 20px; margin: 0; }
        }
      `}</style>
    </div>
  )
}

export default QuotationDetail