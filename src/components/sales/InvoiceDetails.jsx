// src/components/sales/InvoiceDetails.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import {
  ArrowLeft,
  Printer,
  Download,
  Send,
  Trash2,
  Users,
  Receipt,
  DollarSign,
  AlertCircle,
  CheckCircle,
  FileText,
  Calendar,
  CreditCard
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
  invoiceNumber: {
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
  invoiceInfoSection: {
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
    fontWeight: 'bold',
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
  paymentSection: {
    marginTop: 8,
    padding: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 4
  },
  paymentText: {
    fontSize: 8,
    marginBottom: 3
  },
  progressBar: {
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    height: 6,
    marginVertical: 4
  },
  progressFill: (paidPercent) => ({
    backgroundColor: '#DA4A0E',
    height: 6,
    width: `${paidPercent}%`,
    borderRadius: 5
  }),
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
      // Essayer plusieurs chemins possibles
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
      
      // Si aucun logo n'est trouvé, on garde null
      console.warn('Aucun logo trouvé, utilisation du texte par défaut')
    }

    loadLogo()
  }, [])

  return logoSrc
}

// Composant PDF
const InvoicePDF = ({ invoice }) => {
  const logoSrc = useLogo()

  const statusConfig = {
    draft: { label: 'Brouillon', color: '#757575' },
    sent: { label: 'Envoyée', color: '#1976d2' },
    paid: { label: 'Payée', color: '#2e7d32' },
    partially_paid: { label: 'Partiellement payée', color: '#ed6c02' },
    overdue: { label: 'En retard', color: '#d32f2f' },
    cancelled: { label: 'Annulée', color: '#757575' }
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

  const status = statusConfig[invoice.status] || statusConfig.draft
  const customerName = invoice.customer_name || invoice.sale?.customer_name || 'Client'
  const customerEmail = invoice.customer_email || invoice.sale?.customer_email || ''
  const customerPhone = invoice.customer_phone || invoice.sale?.customer_phone || ''
  const items = invoice.sale?.items || invoice.items || []
  const paidPercent = invoice.total > 0 ? (invoice.paid_amount / invoice.total) * 100 : 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* En-tête avec logo à droite */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>ECSI SARL</Text>
            <Text style={styles.companySlogan}>Enterprise Resource Planning</Text>
            <Text style={styles.companySlogan}>Solution ERP Intégrée</Text>
          </View>
          <View style={styles.logoContainer}>
            {logoSrc ? (
              <Image src={logoSrc} style={styles.logoImage} />
            ) : (
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#003C3F', marginBottom: 5 }}>
                ECSI
              </Text>
            )}
            <Text style={styles.title}>FACTURE</Text>
            <Text style={styles.invoiceNumber}>N° {invoice.invoice_number}</Text>
            <View style={{ ...styles.statusBadge, backgroundColor: status.color }}>
              <Text>{status.label}</Text>
            </View>
          </View>
        </View>

        {/* Deux colonnes : Client à gauche, Infos facture à droite */}
        <View style={styles.infoRow}>
          {/* Colonne gauche - Client */}
          <View style={styles.clientSection}>
            <Text style={styles.sectionTitle}>CLIENT</Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Nom: </Text>
              <Text style={styles.infoValue}>{customerName}</Text>
            </Text>
            {customerEmail && (
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Email: </Text>
                <Text style={styles.infoValue}>{customerEmail}</Text>
              </Text>
            )}
            {customerPhone && (
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Tél: </Text>
                <Text style={styles.infoValue}>{customerPhone}</Text>
              </Text>
            )}
          </View>

          {/* Colonne droite - Informations facture */}
          <View style={styles.invoiceInfoSection}>
            <Text style={styles.sectionTitle}>DÉTAILS FACTURE</Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Date facture: </Text>
              <Text style={styles.infoValue}>{formatDate(invoice.invoice_date)}</Text>
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Date d'échéance: </Text>
              <Text style={styles.infoValue}>{formatDate(invoice.due_date)}</Text>
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Mode de paiement: </Text>
              <Text style={styles.infoValue}>Virement bancaire</Text>
            </Text>
          </View>
        </View>

        {/* Articles */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.productCol]}>DÉSIGNATION</Text>
            <Text style={[styles.tableHeaderText, styles.quantityCol]}>QTÉ</Text>
            <Text style={[styles.tableHeaderText, styles.priceCol]}>PRIX U.</Text>
            <Text style={[styles.tableHeaderText, styles.totalCol]}>TOTAL</Text>
          </View>
          {items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.productCol]}>{item.product_name || '-'}</Text>
              <Text style={[styles.quantityCol, styles.textCenter]}>{item.quantity || 0}</Text>
              <Text style={[styles.priceCol, styles.textRight]}>{formatNumber(item.unit_price || 0)} FCFA</Text>
              <Text style={[styles.totalCol, styles.textRight]}>{formatNumber(item.total || 0)} FCFA</Text>
            </View>
          ))}
        </View>

        {/* État du paiement */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentText}>
            <Text style={styles.infoLabel}>Paiement: </Text>
            <Text>Payé {formatNumber(invoice.paid_amount)} FCFA sur {formatNumber(invoice.total)} FCFA</Text>
          </Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill(paidPercent)} />
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>SOUS-TOTAL:</Text>
            <Text style={styles.totalValue}>{formatNumber(invoice.subtotal || 0)} FCFA</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA (20%):</Text>
            <Text style={styles.totalValue}>{formatNumber(invoice.tax_total || 0)} FCFA</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={[styles.totalLabel, { color: '#DA4A0E' }]}>TOTAL TTC:</Text>
            <Text style={[styles.totalValue, { color: '#DA4A0E', fontSize: 11 }]}>{formatNumber(invoice.total)} FCFA</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={{ marginTop: 6 }}>
            <Text style={styles.sectionTitle}>NOTES</Text>
            <Text style={styles.infoText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ECSI SARL - Solution ERP intégrée</Text>
          <Text style={styles.footerText}>Merci de votre confiance</Text>
          <Text style={styles.footerText}>Document généré le {new Date().toLocaleDateString('fr-FR')}</Text>
        </View>
      </Page>
    </Document>
  )
}

const InvoiceDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'neutral', icon: FileText },
    sent: { label: 'Envoyée', color: 'info', icon: Send },
    paid: { label: 'Payée', color: 'success', icon: CheckCircle },
    partially_paid: { label: 'Partiellement payée', color: 'warning', icon: DollarSign },
    overdue: { label: 'En retard', color: 'error', icon: AlertCircle },
    cancelled: { label: 'Annulée', color: 'error', icon: AlertCircle }
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
      month: 'long',
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
      const response = await AxiosInstance.get(`/invoices/${id}/`)
      setInvoice(response.data)
    } catch (error) {
      console.error('Error fetching invoice:', error)
      showNotification('Erreur lors du chargement de la facture', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

  const handleSendInvoice = async () => {
    try {
      await AxiosInstance.post(`/invoices/${id}/send/`)
      showNotification('Facture envoyée avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification("Erreur lors de l'envoi", 'error')
    }
  }

  const handleDeleteInvoice = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return
    try {
      await AxiosInstance.delete(`/invoices/${id}/`)
      showNotification('Facture supprimée avec succès', 'success')
      setTimeout(() => navigate('/factures'), 1500)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12"></div>
          <p className="text-base font-semibold text-base-content/70">Chargement de la facture...</p>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-base-200 py-6 px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Facture non trouvée</h2>
          <Link to="/factures" className="btn btn-primary gap-2">Retour à la liste</Link>
        </div>
      </div>
    )
  }

  const status = statusConfig[invoice.status] || statusConfig.draft
  const StatusIcon = status.icon
  const customerName = invoice.customer_name || invoice.sale?.customer_name || 'Client'
  const items = invoice.sale?.items || invoice.items || []
  const paidPercent = invoice.total > 0 ? (invoice.paid_amount / invoice.total) * 100 : 0

  return (
    <div className="min-h-screen bg-base-200 py-4 sm:py-6 px-3 sm:px-4">
      <div className="w-full max-w-6xl mx-auto">
        
        {/* Notification */}
        {notification.show && (
          <div className="fixed top-16 right-3 z-50 animate-slide-in">
            <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm`}>
              {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{notification.message}</span>
              <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
            </div>
          </div>
        )}

        {/* Bouton retour et actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <Link to="/factures" className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour aux factures
          </Link>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="btn btn-sm btn-outline gap-1"><Printer className="w-4 h-4" /> Imprimer</button>
            <PDFDownloadLink
              document={<InvoicePDF invoice={invoice} />}
              fileName={`facture_${invoice.invoice_number}.pdf`}
              className="btn btn-sm btn-primary gap-1"
            >
              {({ loading }) => (
                <>
                  <Download className="w-4 h-4" />
                  {loading ? 'Préparation...' : 'PDF'}
                </>
              )}
            </PDFDownloadLink>
            {invoice.status === 'draft' && (
              <>
                <button onClick={handleSendInvoice} className="btn btn-sm btn-info gap-1 text-white"><Send className="w-4 h-4" /> Envoyer</button>
                <button onClick={handleDeleteInvoice} className="btn btn-sm btn-error gap-1"><Trash2 className="w-4 h-4" /> Supprimer</button>
              </>
            )}
          </div>
        </div>

        {/* En-tête */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Receipt className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white">Facture {invoice.invoice_number}</h1>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className={`badge badge-${status.color} badge-sm gap-1`}>
                      <StatusIcon className="w-3 h-3" /> {status.label}
                    </span>
                    <span className="badge badge-neutral badge-sm gap-1">
                      <Calendar className="w-3 h-3" /> Échéance: {formatDate(invoice.due_date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grille des informations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          
          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Informations générales
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-base-100">
                <span className="text-base-content/50">N° Facture</span>
                <span className="font-semibold">{invoice.invoice_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-base-100">
                <span className="text-base-content/50">Date facture</span>
                <span>{formatDate(invoice.invoice_date)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-base-100">
                <span className="text-base-content/50">Date d'échéance</span>
                <span>{formatDate(invoice.due_date)}</span>
              </div>
            </div>
          </div>

          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Client
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{customerName}</p>
                {invoice.customer_email && <p className="text-sm text-base-content/60">{invoice.customer_email}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Récapitulatif financier */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 mb-6 overflow-hidden">
          <div className="p-4 border-b border-base-200">
            <h3 className="text-md font-semibold text-primary flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Récapitulatif financier
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-base-200">
            <div className="p-4 text-center">
              <p className="text-xs text-base-content/50">Sous-total</p>
              <p className="text-2xl font-bold text-base-content">{formatNumber(invoice.subtotal)} FCFA</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-base-content/50">TVA (20%)</p>
              <p className="text-2xl font-bold text-primary">{formatNumber(invoice.tax_total)} FCFA</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-base-content/50">Total TTC</p>
              <p className="text-2xl font-bold text-success">{formatNumber(invoice.total)} FCFA</p>
            </div>
          </div>
        </div>

        {/* État du paiement */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 mb-6 overflow-hidden">
          <div className="p-4 border-b border-base-200">
            <h3 className="text-md font-semibold text-primary flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> État du paiement
            </h3>
          </div>
          <div className="p-4">
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm">Progression du paiement</span>
                <span className="text-sm font-semibold">{Math.round(paidPercent)}%</span>
              </div>
              <progress className="progress progress-primary w-full" value={paidPercent} max="100"></progress>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-success/10 rounded-lg">
                <p className="text-xs">Payé</p>
                <p className="text-lg font-bold text-success">{formatNumber(invoice.paid_amount)} FCFA</p>
              </div>
              <div className="p-2 bg-warning/10 rounded-lg">
                <p className="text-xs">Reste à payer</p>
                <p className="text-lg font-bold text-warning">{formatNumber(invoice.remaining_amount)} FCFA</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <p className="text-xs">Total</p>
                <p className="text-lg font-bold text-primary">{formatNumber(invoice.total)} FCFA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 mb-6 overflow-hidden">
          <div className="p-4 border-b border-base-200">
            <h3 className="text-md font-semibold text-primary flex items-center gap-2">
              <FileText className="w-5 h-5" /> Articles facturés
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead className="bg-base-200">
                <tr className="text-xs">
                  <th>Produit</th>
                  <th className="text-center">Qté</th>
                  <th className="text-right">Prix unitaire</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">Aucun article</td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx} className="hover">
                      <td>
                        <div className="font-medium text-sm">{item.product_name}</div>
                        <div className="text-xs text-base-content/50">{item.product_reference}</div>
                      </td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">{formatNumber(item.unit_price)} FCFA</td>
                      <td className="text-right font-semibold">{formatNumber(item.total)} FCFA</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 mb-6 p-4">
            <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Notes
            </h3>
            <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-wrap justify-end gap-3 mt-4">
          <Link to="/factures" className="btn btn-outline">Retour</Link>
          <PDFDownloadLink
            document={<InvoicePDF invoice={invoice} />}
            fileName={`facture_${invoice.invoice_number}.pdf`}
            className="btn btn-primary gap-2"
          >
            {({ loading }) => (
              <>
                <Download className="w-4 h-4" />
                {loading ? 'Préparation...' : 'Télécharger PDF'}
              </>
            )}
          </PDFDownloadLink>
          {invoice.status === 'sent' && (
            <Link to={`/paiements/nouveau?invoice=${invoice.id}`} className="btn btn-success gap-2">
              <CreditCard className="w-4 h-4" /> Paiement
            </Link>
          )}
        </div>
      </div>

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

export default InvoiceDetails