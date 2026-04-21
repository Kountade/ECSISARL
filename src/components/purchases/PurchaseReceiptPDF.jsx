// src/components/purchases/PurchaseReceiptPDF.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft,
  Receipt,
  AlertCircle,
  Download,
  Loader2,
  FileText,
  LayoutGrid,
  Printer
} from 'lucide-react'
import logo from '../../assets/logo.svg'

const PurchaseReceiptPDF = () => {
  const navigate = useNavigate()
  const { id } = useParams()

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

  const handlePrint = () => {
    if (!receipt) return
    
    setGenerating(true)
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Veuillez autoriser les popups')
      setGenerating(false)
      return
    }
    
    printWindow.document.write(getPrintHTML())
    printWindow.document.close()
    
    printWindow.onload = () => {
      printWindow.print()
      printWindow.onafterprint = () => {
        printWindow.close()
        setGenerating(false)
      }
    }
  }

  const getPrintHTML = () => {
    if (!receipt) return ''
    
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

    const pageWidth = isA5 ? '148mm' : '210mm'
    const pageHeight = isA5 ? '210mm' : '297mm'
    const padding = isA5 ? '10mm' : '15mm'
    const titleSize = isA5 ? '20px' : '28px'
    const docTitleSize = isA5 ? '16px' : '22px'
    const bodySize = isA5 ? '10px' : '12px'
    const headerSize = isA5 ? '10px' : '12px'
    const smallSize = isA5 ? '8px' : '10px'

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bon de réception ${receipt.receipt_number}</title>
  <style>
    @page {
      size: ${pageWidth} ${pageHeight};
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica Neue', 'Segoe UI', 'Roboto', Arial, sans-serif;
      background: white;
      padding: ${padding};
      width: ${pageWidth};
      min-height: ${pageHeight};
      margin: 0 auto;
      color: #111827;
      line-height: 1.5;
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #1E3A5F;
    }
    
    .logo-area {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .logo {
      width: ${isA5 ? '60px' : '80px'};
      height: ${isA5 ? '60px' : '80px'};
      object-fit: contain;
    }
    
    .company-name {
      font-size: ${titleSize};
      font-weight: 800;
      color: #1E3A5F;
      letter-spacing: -0.5px;
      margin-bottom: 5px;
    }
    
    .company-sub {
      font-size: ${bodySize};
      color: #4B5563;
      margin: 2px 0;
    }
    
    .company-details {
      font-size: ${smallSize};
      color: #6B7280;
      margin: 2px 0;
    }
    
    .doc-title {
      font-size: ${docTitleSize};
      font-weight: 800;
      color: #C9A03D;
      letter-spacing: 1px;
      margin-bottom: 8px;
      text-align: right;
    }
    
    .receipt-number {
      font-size: ${bodySize};
      font-weight: 700;
      color: #1E3A5F;
      margin-bottom: 10px;
      text-align: right;
    }
    
    .status-badge {
      display: inline-block;
      padding: 5px 14px;
      border-radius: 20px;
      font-size: ${headerSize};
      font-weight: 700;
      letter-spacing: 0.5px;
      background: ${orderStatus.bg};
      color: ${orderStatus.color};
      text-align: right;
    }
    
    .text-right {
      text-align: right;
    }
    
    /* Sections */
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: ${isA5 ? '13px' : '15px'};
      font-weight: 800;
      color: #1E3A5F;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #C9A03D;
      display: inline-block;
    }
    
    /* Info grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 12px;
    }
    
    .info-card {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 12px;
    }
    
    .info-label {
      font-size: ${smallSize};
      text-transform: uppercase;
      color: #6B7280;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      font-weight: 600;
    }
    
    .info-value {
      font-size: ${bodySize};
      font-weight: 700;
      color: #111827;
    }
    
    .supplier-value {
      color: #C9A03D;
    }
    
    /* Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: ${bodySize};
    }
    
    .items-table th {
      background: #1E3A5F;
      color: white;
      padding: ${isA5 ? '10px 6px' : '12px 8px'};
      text-align: left;
      font-weight: 700;
    }
    
    .items-table td {
      padding: ${isA5 ? '10px 6px' : '12px 8px'};
      border-bottom: 1px solid #E5E7EB;
      vertical-align: top;
    }
    
    .text-center {
      text-align: center;
    }
    
    .quality-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: ${smallSize};
      font-weight: 700;
    }
    
    /* Summary */
    .summary-box {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 14px;
      margin-top: 15px;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
    }
    
    .summary-border {
      border-bottom: 1px solid #E5E7EB;
      margin-bottom: 6px;
    }
    
    .summary-label {
      font-weight: 700;
      color: #4B5563;
    }
    
    .summary-value {
      font-weight: 700;
      color: #111827;
    }
    
    /* Notes */
    .notes-box {
      background: #FFFBEB;
      border-left: 3px solid #C9A03D;
      padding: 10px 12px;
      font-size: ${bodySize};
      color: #111827;
      line-height: 1.5;
    }
    
    /* Signatures */
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 20px;
    }
    
    .signature-item {
      text-align: center;
      width: 140px;
    }
    
    .signature-line {
      border-top: 1px solid #9CA3AF;
      padding-top: 8px;
      margin-top: 30px;
    }
    
    .signature-label {
      font-size: ${bodySize};
      color: #1E3A5F;
      margin-top: 5px;
      font-weight: 700;
    }
    
    .signature-sub {
      font-size: ${smallSize};
      color: #6B7280;
      margin-top: 4px;
    }
    
    /* Footer */
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      text-align: center;
      font-size: ${smallSize};
      color: #6B7280;
      border-top: 1px solid #E5E7EB;
    }
    
    .text-success {
      color: #065F46;
    }
    
    .text-danger {
      color: #991B1B;
    }
    
    .fw-700 {
      font-weight: 700;
    }
  </style>
</head>
<body>
  <!-- Header avec logo -->
  <div class="header">
    <div class="logo-area">
      <img src="${logo}" class="logo" alt="ECSI SARL" />
      <div>
        <div class="company-name">ECSI SARL</div>
        <div class="company-sub">Système de Gestion Intégré</div>
        <div class="company-details">RC: 123456 | IF: 1234567 | NIF: 123456789</div>
        <div class="company-details">Tél: +225 27 22 51 51 51 | Email: contact@ecsi.ci</div>
      </div>
    </div>
    <div>
      <div class="doc-title">BON DE RÉCEPTION</div>
      <div class="receipt-number">N° ${receipt.receipt_number}</div>
      <div class="text-right">
        <span class="status-badge">${orderStatus.label}</span>
      </div>
    </div>
  </div>

  <!-- Informations -->
  <div class="section">
    <div class="section-title">INFORMATIONS GÉNÉRALES</div>
    <div class="info-grid">
      <div class="info-card">
        <div class="info-label">COMMANDE N°</div>
        <div class="info-value">${receipt.purchase_order?.order_number || '-'}</div>
      </div>
      <div class="info-card">
        <div class="info-label">FOURNISSEUR</div>
        <div class="info-value supplier-value">${receipt.purchase_order?.supplier_name || '-'}</div>
      </div>
      <div class="info-card">
        <div class="info-label">DATE DE RÉCEPTION</div>
        <div class="info-value">${formatDate(receipt.receipt_date)}</div>
      </div>
      <div class="info-card">
        <div class="info-label">REÇU PAR</div>
        <div class="info-value">${receipt.received_by_name || receipt.received_by?.email || '-'}</div>
      </div>
    </div>
  </div>

  <!-- Articles -->
  <div class="section">
    <div class="section-title">ARTICLES REÇUS</div>
    <table class="items-table">
      <thead>
        <tr>
          <th>Désignation</th>
          <th style="width: 60px;" class="text-center">Qté</th>
          <th style="width: 110px;" class="text-center">Contrôle Qualité</th>
        </tr>
      </thead>
      <tbody>
        ${receipt.items?.map(item => `
          <tr>
            <td>
              <strong style="font-weight: 700; color: #111827;">${item.order_item?.product_name || item.product_name || '-'}</strong>
              ${item.order_item?.product_reference ? `<div style="font-size: ${smallSize}; color: #6B7280; margin-top: 2px;">Réf: ${item.order_item.product_reference}</div>` : ''}
            </td>
            <td class="text-center fw-700">${item.quantity}</td>
            <td class="text-center">
              <span class="quality-badge" style="background: ${getQualityBg(item)}; color: ${getQualityColor(item)}">
                ${getQualityText(item)}
              </span>
            </td>
           </>
        `).join('')}
      </tbody>
    </table>

    <!-- Résumé -->
    <div class="summary-box">
      <div class="summary-row summary-border">
        <span class="summary-label">Nombre d'articles différents</span>
        <span class="summary-value">${receipt.items?.length || 0}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Quantité totale reçue</span>
        <span class="summary-value">${formatNumber(totalQuantity)} unités</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Taux de conformité</span>
        <span class="summary-value ${conformityRate >= 80 ? 'text-success' : 'text-danger'}">${conformityRate}%</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">✓ Articles conformes</span>
        <span class="summary-value text-success">${conformingCount}</span>
      </div>
      ${nonConformingCount > 0 ? `
      <div class="summary-row">
        <span class="summary-label">✗ Articles non conformes</span>
        <span class="summary-value text-danger">${nonConformingCount}</span>
      </div>
      ` : ''}
    </div>
  </div>

  ${receipt.notes ? `
  <div class="section">
    <div class="section-title">OBSERVATIONS</div>
    <div class="notes-box">${receipt.notes.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
  </div>
  ` : ''}

  <!-- Signatures -->
  <div class="signatures">
    <div class="signature-item">
      <div class="signature-line"></div>
      <div class="signature-label">RÉCEPTIONNAIRE</div>
      <div class="signature-sub">Nom et signature</div>
    </div>
    <div class="signature-item">
      <div class="signature-line"></div>
      <div class="signature-label">RESPONSABLE QUALITÉ</div>
      <div class="signature-sub">Nom et signature</div>
    </div>
    <div class="signature-item">
      <div class="signature-line"></div>
      <div class="signature-label">CACHET ENTREPRISE</div>
      <div class="signature-sub">Cachet obligatoire</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div>ECSI SARL - Document contractuel - Toute reproduction est interdite</div>
    <div>Siège social: Abidjan, Côte d'Ivoire | www.ecsi.ci</div>
    <div>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</div>
  </div>
</body>
</html>`
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
                Format A4
              </button>
              <button 
                className={`px-4 py-1.5 text-sm font-medium transition ${selectedFormat === 'A5' ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setSelectedFormat('A5')}
              >
                Format A5
              </button>
            </div>
            
            <button 
              onClick={handlePrint} 
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
          <div 
            style={{
              width: selectedFormat === 'A4' ? '210mm' : '148mm',
              minHeight: selectedFormat === 'A4' ? '297mm' : '210mm',
              backgroundColor: 'white',
              boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.15)',
              margin: '0 auto'
            }}
          >
            <iframe
              srcDoc={getPrintHTML()}
              style={{
                width: '100%',
                minHeight: selectedFormat === 'A4' ? '297mm' : '210mm',
                border: 'none'
              }}
              title="Aperçu du bon de réception"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default PurchaseReceiptPDF