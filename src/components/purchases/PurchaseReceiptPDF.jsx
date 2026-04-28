// src/components/purchases/PurchaseReceiptPDF.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import {
  ArrowLeft,
  Receipt,
  AlertCircle,
  Download,
  Loader2,
  FileText,
  LayoutGrid
} from 'lucide-react'

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
        '/public/logo.svg',
        '/ecsi-logo.svg'
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
      
      // Si aucun logo n'est trouvé, on utilise un texte à la place
      console.warn('Aucun logo trouvé, utilisation du texte par défaut')
    }

    loadLogo()
  }, [])

  return logoSrc
}

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  // En-tête
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 3,
    borderBottomColor: '#1E3A5F'
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  logoImage: {
    width: 60,
    height: 60
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#1E3A5F',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoPlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C9A03D'
  },
  companyInfo: {
    marginLeft: 8
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 4
  },
  companySub: {
    fontSize: 8,
    color: '#4B5563',
    marginBottom: 2
  },
  companyDetails: {
    fontSize: 7,
    color: '#6B7280',
    marginBottom: 1
  },
  docHeader: {
    alignItems: 'flex-end'
  },
  docTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#C9A03D',
    marginBottom: 5,
    letterSpacing: 1
  },
  receiptNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 8,
    textAlign: 'right'
  },
  statusBadge: (bgColor) => ({
    backgroundColor: bgColor,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-end'
  }),
  statusText: (textColor) => ({
    fontSize: 8,
    fontWeight: 'bold',
    color: textColor,
    letterSpacing: 0.5
  }),
  // Sections
  section: {
    marginBottom: 18
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E3A5F',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: '#C9A03D',
    alignSelf: 'flex-start'
  },
  // Grille d'informations
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 10
  },
  infoCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 8
  },
  infoLabel: {
    fontSize: 7,
    textTransform: 'uppercase',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 3,
    fontWeight: 'bold'
  },
  infoValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827'
  },
  supplierValue: {
    color: '#C9A03D'
  },
  // Tableau
  table: {
    marginTop: 8,
    marginBottom: 8
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E3A5F',
    paddingVertical: 6,
    paddingHorizontal: 6
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 6
  },
  productCol: { width: '55%' },
  quantityCol: { width: '20%' },
  qualityCol: { width: '25%' },
  textCenter: { textAlign: 'center' },
  productName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2
  },
  productRef: {
    fontSize: 6,
    color: '#6B7280'
  },
  qualityBadge: (bgColor) => ({
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: bgColor,
    alignSelf: 'center'
  }),
  qualityText: (textColor) => ({
    fontSize: 7,
    fontWeight: 'bold',
    color: textColor
  }),
  // Résumé
  summaryBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 10,
    marginTop: 10
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  summaryBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 4,
    paddingBottom: 4
  },
  summaryLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#4B5563'
  },
  summaryValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#111827'
  },
  textSuccess: { color: '#065F46' },
  textDanger: { color: '#991B1B' },
  // Notes
  notesBox: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 3,
    borderLeftColor: '#C9A03D',
    padding: 8,
    marginTop: 8
  },
  notesText: {
    fontSize: 8,
    color: '#111827',
    lineHeight: 1.3
  },
  // Signatures
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingTop: 15
  },
  signatureItem: {
    alignItems: 'center',
    width: '30%'
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF',
    width: '100%',
    paddingTop: 6,
    marginTop: 20
  },
  signatureLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginTop: 4
  },
  signatureSub: {
    fontSize: 6,
    color: '#6B7280',
    marginTop: 2
  },
  // Footer
  footer: {
    marginTop: 25,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 6,
    color: '#6B7280',
    marginBottom: 2
  }
})

// Composant PDF du bon de réception
const PurchaseReceiptPDFDocument = ({ receipt, logoSrc }) => {
  const statusConfig = {
    draft: { label: 'BROUILLON', color: '#6B7280', bg: '#F3F4F6' },
    sent: { label: 'ENVOYÉE', color: '#2563EB', bg: '#EFF6FF' },
    confirmed: { label: 'CONFIRMÉE', color: '#059669', bg: '#ECFDF5' },
    in_transit: { label: 'EN TRANSIT', color: '#D97706', bg: '#FFFBEB' },
    partially_received: { label: 'RÉCEPTION PARTIELLE', color: '#D97706', bg: '#FFFBEB' },
    received: { label: 'REÇUE', color: '#059669', bg: '#ECFDF5' },
    cancelled: { label: 'ANNULÉE', color: '#DC2626', bg: '#FEF2F2' },
    rejected: { label: 'REJETÉE', color: '#DC2626', bg: '#FEF2F2' }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatNumber = (number) => {
    return new Intl.NumberFormat('fr-FR').format(number || 0)
  }

  const getQualityText = (item) => {
    if (!item.quality_checked) return 'Non contrôlé'
    if (item.quality_ok) return 'Conforme'
    return 'Non conforme'
  }

  const getQualityColor = (item) => {
    if (!item.quality_checked) return '#6B7280'
    if (item.quality_ok) return '#065F46'
    return '#991B1B'
  }

  const getQualityBg = (item) => {
    if (!item.quality_checked) return '#F3F4F6'
    if (item.quality_ok) return '#D1FAE5'
    return '#FEE2E2'
  }

  const orderStatus = statusConfig[receipt.purchase_order?.status] || statusConfig.draft
  const totalQuantity = receipt.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
  const conformingCount = receipt.items?.filter(item => item.quality_ok).length || 0
  const nonConformingCount = receipt.items?.filter(item => item.quality_checked && !item.quality_ok).length || 0
  const conformityRate = (conformingCount + nonConformingCount) > 0 
    ? Math.round((conformingCount / (conformingCount + nonConformingCount)) * 100) 
    : 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* En-tête avec logo */}
        <View style={styles.header}>
          <View style={styles.logoArea}>
            {logoSrc ? (
              <Image src={logoSrc} style={styles.logoImage} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>ECSI</Text>
              </View>
            )}
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>ECSI SARL</Text>
              <Text style={styles.companySub}>Système de Gestion Intégré</Text>
              <Text style={styles.companyDetails}>RC: 123456 | IF: 1234567 | NIF: 123456789</Text>
              <Text style={styles.companyDetails}>Tél: +225 27 22 51 51 51 | Email: contact@ecsi.ci</Text>
            </View>
          </View>
          <View style={styles.docHeader}>
            <Text style={styles.docTitle}>BON DE RÉCEPTION</Text>
            <Text style={styles.receiptNumber}>N° {receipt.receipt_number}</Text>
            <View style={styles.statusBadge(orderStatus.bg)}>
              <Text style={styles.statusText(orderStatus.color)}>{orderStatus.label}</Text>
            </View>
          </View>
        </View>

        {/* Informations générales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS GÉNÉRALES</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>COMMANDE N°</Text>
              <Text style={styles.infoValue}>{receipt.purchase_order?.order_number || '-'}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>FOURNISSEUR</Text>
              <Text style={[styles.infoValue, styles.supplierValue]}>{receipt.purchase_order?.supplier_name || '-'}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>DATE DE RÉCEPTION</Text>
              <Text style={styles.infoValue}>{formatDate(receipt.receipt_date)}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>REÇU PAR</Text>
              <Text style={styles.infoValue}>{receipt.received_by_name || receipt.received_by?.email || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Articles reçus */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ARTICLES REÇUS</Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.productCol]}>DÉSIGNATION</Text>
              <Text style={[styles.tableHeaderText, styles.quantityCol, styles.textCenter]}>QTÉ</Text>
              <Text style={[styles.tableHeaderText, styles.qualityCol, styles.textCenter]}>CONTRÔLE QUALITÉ</Text>
            </View>
            
            {receipt.items?.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <View style={styles.productCol}>
                  <Text style={styles.productName}>{item.order_item?.product_name || item.product_name || '-'}</Text>
                  {item.order_item?.product_reference && (
                    <Text style={styles.productRef}>Réf: {item.order_item.product_reference}</Text>
                  )}
                </View>
                <Text style={[styles.quantityCol, styles.textCenter]}>{item.quantity}</Text>
                <View style={[styles.qualityCol, styles.textCenter]}>
                  <View style={styles.qualityBadge(getQualityBg(item))}>
                    <Text style={styles.qualityText(getQualityColor(item))}>{getQualityText(item)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Résumé */}
          <View style={styles.summaryBox}>
            <View style={[styles.summaryRow, styles.summaryBorder]}>
              <Text style={styles.summaryLabel}>Nombre d'articles différents</Text>
              <Text style={styles.summaryValue}>{receipt.items?.length || 0}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Quantité totale reçue</Text>
              <Text style={styles.summaryValue}>{formatNumber(totalQuantity)} unités</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taux de conformité</Text>
              <Text style={[styles.summaryValue, conformityRate >= 80 ? styles.textSuccess : styles.textDanger]}>
                {conformityRate}%
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>✓ Articles conformes</Text>
              <Text style={[styles.summaryValue, styles.textSuccess]}>{conformingCount}</Text>
            </View>
            {nonConformingCount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>✗ Articles non conformes</Text>
                <Text style={[styles.summaryValue, styles.textDanger]}>{nonConformingCount}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Observations */}
        {receipt.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OBSERVATIONS</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{receipt.notes}</Text>
            </View>
          </View>
        )}

        {/* Signatures */}
        <View style={styles.signatures}>
          <View style={styles.signatureItem}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>RÉCEPTIONNAIRE</Text>
            <Text style={styles.signatureSub}>Nom et signature</Text>
          </View>
          <View style={styles.signatureItem}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>RESPONSABLE QUALITÉ</Text>
            <Text style={styles.signatureSub}>Nom et signature</Text>
          </View>
          <View style={styles.signatureItem}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>CACHET ENTREPRISE</Text>
            <Text style={styles.signatureSub}>Cachet obligatoire</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ECSI SARL - Document contractuel - Toute reproduction est interdite</Text>
          <Text style={styles.footerText}>Siège social: Abidjan, Côte d'Ivoire | www.ecsi.ci</Text>
          <Text style={styles.footerText}>
            Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// Composant principal
const PurchaseReceiptPDF = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const logoSrc = useLogo()

  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get(`/purchase-receipts/${id}/`)
      setReceipt(response.data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement du document...</p>
        </div>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Document non trouvé</h2>
          <p className="text-gray-500 mb-6">La réception n°{id} n'existe pas ou a été supprimée.</p>
          <button onClick={() => navigate('/receptions')} className="px-5 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      {/* Barre d'actions */}
      <div className="max-w-[210mm] mx-auto px-4 mb-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/receptions')} className="p-2 hover:bg-gray-100 rounded-full transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Receipt className="w-6 h-6 text-blue-700" />
                Bon de réception
              </h1>
              <p className="text-sm text-gray-500">{receipt.receipt_number}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setShowPreview(!showPreview)} 
              className="px-4 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition"
            >
              <LayoutGrid className="w-4 h-4" />
              {showPreview ? 'Masquer' : 'Afficher'} aperçu
            </button>
            
            <PDFDownloadLink
              document={<PurchaseReceiptPDFDocument receipt={receipt} logoSrc={logoSrc} />}
              fileName={`bon_reception_${receipt.receipt_number}.pdf`}
              className="px-4 py-1.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 flex items-center gap-2 text-sm font-medium transition shadow-sm"
            >
              {({ loading: pdfLoading }) => (
                <>
                  {pdfLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Préparation...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Télécharger PDF
                    </>
                  )}
                </>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </div>

      {/* Aperçu PDF */}
      {showPreview && receipt && (
        <div className="flex justify-center p-4">
          <div 
            style={{
              width: '210mm',
              minHeight: '297mm',
              backgroundColor: 'white',
              boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.15)',
              margin: '0 auto',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <PDFDownloadLink
              document={<PurchaseReceiptPDFDocument receipt={receipt} logoSrc={logoSrc} />}
              fileName={`bon_reception_${receipt.receipt_number}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <div 
                  style={{
                    width: '100%',
                    minHeight: '297mm',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f9fafb'
                  }}
                >
                  {pdfLoading ? (
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-700 mx-auto mb-3" />
                      <p className="text-gray-500">Génération de l'aperçu...</p>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <FileText className="w-16 h-16 text-blue-700 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Aperçu disponible</p>
                      <p className="text-sm text-gray-400">Cliquez sur "Télécharger PDF" pour voir le document</p>
                    </div>
                  )}
                </div>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      )}
    </div>
  )
}

export default PurchaseReceiptPDF