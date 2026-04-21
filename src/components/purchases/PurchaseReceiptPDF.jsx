// src/components/purchases/PurchaseReceiptPDF.jsx
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft,
  Receipt,
  AlertCircle,
  Download,
  Loader2,
  FileText,
  LayoutGrid
} from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const PurchaseReceiptPDF = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const pdfContentRef = useRef(null)

  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState('A4')
  const [showPreview, setShowPreview] = useState(true)

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

  const handleGeneratePDF = async () => {
    if (!receipt || !pdfContentRef.current) return
    
    setGenerating(true)
    
    try {
      const element = pdfContentRef.current
      const isA5 = selectedFormat === 'A5'
      
      // Configuration pour éviter l'erreur oklch
      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        onclone: (clonedDoc, element) => {
          // Supprimer les styles problématiques dans le clone
          const styleElements = clonedDoc.querySelectorAll('style')
          styleElements.forEach(style => {
            if (style.innerHTML && style.innerHTML.includes('oklch')) {
              style.innerHTML = style.innerHTML.replace(/oklch\([^)]+\)/g, '#1E3A5F')
            }
          })
        }
      })
      
      const imgData = canvas.toDataURL('image/png', 1.0)
      
      const pdf = new jsPDF({
        unit: 'mm',
        format: isA5 ? 'a5' : 'a4',
        orientation: 'portrait',
        compress: true
      })
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      let heightLeft = imgHeight
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
      heightLeft -= pdfHeight
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
        heightLeft -= pdfHeight
      }
      
      pdf.save(`RECEPTION_${receipt.receipt_number}_${selectedFormat}.pdf`)
      
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la génération du PDF: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  const PDFContent = () => {
    if (!receipt) return null
    
    const isA5 = selectedFormat === 'A5'
    const orderStatus = statusConfig[receipt.purchase_order?.status] || statusConfig.draft
    const totalQuantity = receipt.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
    const conformingCount = receipt.items?.filter(item => item.quality_ok).length || 0
    const nonConformingCount = receipt.items?.filter(item => item.quality_checked && !item.quality_ok).length || 0
    const conformityRate = (conformingCount + nonConformingCount) > 0 
      ? Math.round((conformingCount / (conformingCount + nonConformingCount)) * 100) 
      : 0

    const getQualityText = (item) => {
      if (!item.quality_checked) return 'Non contrôlé'
      if (item.quality_ok) return 'Conforme'
      return 'Non conforme'
    }

    const getQualityStyle = (item) => {
      if (!item.quality_checked) return { bg: '#F3F4F6', color: '#6B7280' }
      if (item.quality_ok) return { bg: '#D1FAE5', color: '#059669' }
      return { bg: '#FEE2E2', color: '#DC2626' }
    }

    const padding = isA5 ? '8mm' : '12mm'
    const titleSize = isA5 ? '20px' : '28px'
    const docTitleSize = isA5 ? '16px' : '22px'
    const bodySize = isA5 ? '9px' : '11px'
    const headerSize = isA5 ? '9px' : '11px'

    return (
      <div ref={pdfContentRef} style={{
        fontFamily: "'Helvetica Neue', 'Segoe UI', 'Roboto', Arial, sans-serif",
        backgroundColor: '#ffffff',
        padding: padding,
        width: isA5 ? '148mm' : '210mm',
        minHeight: isA5 ? '210mm' : '297mm',
        color: '#111827',
        lineHeight: '1.4',
        position: 'relative'
      }}>
        {/* Header avec logo texte */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '2px solid #1E3A5F'
        }}>
          <div>
            <h1 style={{
              fontSize: titleSize,
              fontWeight: '700',
              color: '#1E3A5F',
              letterSpacing: '-0.5px',
              marginBottom: '5px'
            }}>ECSI SARL</h1>
            <p style={{ fontSize: bodySize, color: '#6B7280', margin: '2px 0' }}>Système de Gestion Intégré</p>
            <p style={{ fontSize: bodySize, color: '#6B7280', margin: '2px 0' }}>RC: 123456 | IF: 1234567 | NIF: 123456789</p>
            <p style={{ fontSize: bodySize, color: '#6B7280', margin: '2px 0' }}>Tél: +225 27 22 51 51 51 | Email: contact@ecsi.ci</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{
              fontSize: docTitleSize,
              fontWeight: '700',
              color: '#C9A03D',
              letterSpacing: '1px',
              marginBottom: '5px'
            }}>BON DE RÉCEPTION</h2>
            <p style={{ fontSize: bodySize, fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              N° {receipt.receipt_number}
            </p>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: headerSize,
                fontWeight: '600',
                letterSpacing: '0.5px',
                backgroundColor: orderStatus.bg,
                color: orderStatus.color
              }}>{orderStatus.label}</span>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{
            fontSize: isA5 ? '12px' : '14px',
            fontWeight: '700',
            color: '#1E3A5F',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px',
            paddingBottom: '6px',
            borderBottom: '2px solid #C9A03D',
            display: 'inline-block'
          }}>INFORMATIONS GÉNÉRALES</div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginTop: '12px'
          }}>
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: isA5 ? '8px' : '10px', textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.5px', marginBottom: '6px' }}>COMMANDE N°</div>
              <div style={{ fontSize: isA5 ? '12px' : '14px', fontWeight: '600', color: '#111827' }}>{receipt.purchase_order?.order_number || '-'}</div>
            </div>
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: isA5 ? '8px' : '10px', textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.5px', marginBottom: '6px' }}>FOURNISSEUR</div>
              <div style={{ fontSize: isA5 ? '12px' : '14px', fontWeight: '600', color: '#C9A03D' }}>{receipt.purchase_order?.supplier_name || '-'}</div>
            </div>
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: isA5 ? '8px' : '10px', textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.5px', marginBottom: '6px' }}>DATE DE RÉCEPTION</div>
              <div style={{ fontSize: isA5 ? '12px' : '14px', fontWeight: '600', color: '#111827' }}>{formatDate(receipt.receipt_date)}</div>
            </div>
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: isA5 ? '8px' : '10px', textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.5px', marginBottom: '6px' }}>REÇU PAR</div>
              <div style={{ fontSize: isA5 ? '12px' : '14px', fontWeight: '600', color: '#111827' }}>{receipt.received_by_name || receipt.received_by?.email || '-'}</div>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{
            fontSize: isA5 ? '12px' : '14px',
            fontWeight: '700',
            color: '#1E3A5F',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px',
            paddingBottom: '6px',
            borderBottom: '2px solid #C9A03D',
            display: 'inline-block'
          }}>ARTICLES REÇUS</div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '15px 0', fontSize: isA5 ? '9px' : '11px' }}>
            <thead>
              <tr>
                <th style={{ backgroundColor: '#1E3A5F', color: '#ffffff', padding: isA5 ? '8px 6px' : '10px 8px', textAlign: 'left' }}>Désignation</th>
                <th style={{ backgroundColor: '#1E3A5F', color: '#ffffff', padding: isA5 ? '8px 6px' : '10px 8px', textAlign: 'center', width: '60px' }}>Qté</th>
                <th style={{ backgroundColor: '#1E3A5F', color: '#ffffff', padding: isA5 ? '8px 6px' : '10px 8px', textAlign: 'center', width: '100px' }}>Contrôle Qualité</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items?.map((item, idx) => {
                const qualityStyle = getQualityStyle(item)
                return (
                  <tr key={idx}>
                    <td style={{ padding: isA5 ? '8px 6px' : '10px 8px', borderBottom: '1px solid #E5E7EB' }}>
                      <strong>{item.order_item?.product_name || item.product_name || '-'}</strong>
                      {item.order_item?.product_reference && (
                        <div style={{ fontSize: isA5 ? '8px' : '9px', color: '#6B7280', marginTop: '2px' }}>Réf: {item.order_item.product_reference}</div>
                      )}
                     </td>
                    <td style={{ padding: isA5 ? '8px 6px' : '10px 8px', borderBottom: '1px solid #E5E7EB', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                    <td style={{ padding: isA5 ? '8px 6px' : '10px 8px', borderBottom: '1px solid #E5E7EB', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: isA5 ? '8px' : '10px',
                        fontWeight: '600',
                        backgroundColor: qualityStyle.bg,
                        color: qualityStyle.color
                      }}>{getQualityText(item)}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Résumé */}
          <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px', marginTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E5E7EB', marginBottom: '6px' }}>
              <span style={{ fontWeight: '600', color: '#4B5563' }}>Nombre d'articles différents</span>
              <span style={{ fontWeight: '700' }}>{receipt.items?.length || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontWeight: '600', color: '#4B5563' }}>Quantité totale reçue</span>
              <span style={{ fontWeight: '700' }}>{formatNumber(totalQuantity)} unités</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontWeight: '600', color: '#4B5563' }}>Taux de conformité</span>
              <span style={{ fontWeight: '700', color: conformityRate >= 80 ? '#059669' : conformityRate >= 50 ? '#D97706' : '#DC2626' }}>{conformityRate}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontWeight: '600', color: '#4B5563' }}>✓ Articles conformes</span>
              <span style={{ fontWeight: '700', color: '#059669' }}>{conformingCount}</span>
            </div>
            {nonConformingCount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontWeight: '600', color: '#4B5563' }}>✗ Articles non conformes</span>
                <span style={{ fontWeight: '700', color: '#DC2626' }}>{nonConformingCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {receipt.notes && (
          <div style={{ marginBottom: '25px' }}>
            <div style={{
              fontSize: isA5 ? '12px' : '14px',
              fontWeight: '700',
              color: '#1E3A5F',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
              paddingBottom: '6px',
              borderBottom: '2px solid #C9A03D',
              display: 'inline-block'
            }}>OBSERVATIONS</div>
            <div style={{
              backgroundColor: '#FFFBEB',
              borderLeft: '3px solid #C9A03D',
              padding: '10px 12px',
              fontSize: isA5 ? '9px' : '11px',
              color: '#374151',
              lineHeight: '1.5'
            }}>{receipt.notes}</div>
          </div>
        )}

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px' }}>
          <div style={{ textAlign: 'center', width: '140px' }}>
            <div style={{ borderTop: '1px solid #9CA3AF', paddingTop: '8px', marginTop: '30px' }}></div>
            <div style={{ fontSize: isA5 ? '8px' : '9px', color: '#6B7280', marginTop: '5px', fontWeight: '600' }}>RÉCEPTIONNAIRE</div>
            <div style={{ fontSize: isA5 ? '7px' : '8px', color: '#9CA3AF', marginTop: '4px' }}>Nom et signature</div>
          </div>
          <div style={{ textAlign: 'center', width: '140px' }}>
            <div style={{ borderTop: '1px solid #9CA3AF', paddingTop: '8px', marginTop: '30px' }}></div>
            <div style={{ fontSize: isA5 ? '8px' : '9px', color: '#6B7280', marginTop: '5px', fontWeight: '600' }}>RESPONSABLE QUALITÉ</div>
            <div style={{ fontSize: isA5 ? '7px' : '8px', color: '#9CA3AF', marginTop: '4px' }}>Nom et signature</div>
          </div>
          <div style={{ textAlign: 'center', width: '140px' }}>
            <div style={{ borderTop: '1px solid #9CA3AF', paddingTop: '8px', marginTop: '30px' }}></div>
            <div style={{ fontSize: isA5 ? '8px' : '9px', color: '#6B7280', marginTop: '5px', fontWeight: '600' }}>CACHET ENTREPRISE</div>
            <div style={{ fontSize: isA5 ? '7px' : '8px', color: '#9CA3AF', marginTop: '4px' }}>Cachet obligatoire</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '30px',
          paddingTop: '15px',
          textAlign: 'center',
          fontSize: isA5 ? '7px' : '8px',
          color: '#9CA3AF',
          borderTop: '1px solid #E5E7EB'
        }}>
          <p style={{ margin: '2px 0' }}>ECSI SARL - Document contractuel - Toute reproduction est interdite</p>
          <p style={{ margin: '2px 0' }}>Siège social: Abidjan, Côte d'Ivoire | www.ecsi.ci</p>
          <p style={{ margin: '2px 0' }}>Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
      </div>
    )
  }

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
            
            <div className="flex border rounded-lg overflow-hidden">
              <button 
                className={`px-4 py-1.5 text-sm font-medium transition ${selectedFormat === 'A4' ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setSelectedFormat('A4')}
              >
                A4
              </button>
              <button 
                className={`px-4 py-1.5 text-sm font-medium transition ${selectedFormat === 'A5' ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setSelectedFormat('A5')}
              >
                A5
              </button>
            </div>
            
            <button 
              onClick={handleGeneratePDF} 
              disabled={generating} 
              className="px-4 py-1.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition shadow-sm"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Télécharger PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Aperçu PDF */}
      {showPreview && receipt && (
        <div className="flex justify-center">
          <div style={{
            width: selectedFormat === 'A4' ? '210mm' : '148mm',
            minHeight: selectedFormat === 'A4' ? '297mm' : '210mm',
            backgroundColor: '#ffffff',
            boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.15)',
            margin: '0 auto'
          }}>
            <PDFContent />
          </div>
        </div>
      )}
    </div>
  )
}

export default PurchaseReceiptPDF