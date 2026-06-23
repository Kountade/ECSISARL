// src/components/purchases/PurchaseReceiptPDF.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import jsPDF from 'jspdf';
import logoSvg from '../../assets/logo.svg';
import {
  ArrowLeft,
  Receipt,
  AlertCircle,
  Download,
  Loader2,
  FileText,
  LayoutGrid
} from 'lucide-react';

// Fonction pour formater les nombres
const formatNumber = (n) => {
  const num = parseFloat(n) || 0;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Fonction pour formater les dates
const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const formatDateTime = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleString('fr-FR');
};

// Configuration des statuts
const statusConfig = {
  draft: { label: 'EN ATTENTE', color: [217, 119, 6] },
  sent: { label: 'ENVOYÉE', color: [37, 99, 235] },
  confirmed: { label: 'CONFIRMÉE', color: [5, 150, 105] },
  in_transit: { label: 'EN TRANSIT', color: [217, 119, 6] },
  partially_received: { label: 'RÉCEPTION PARTIELLE', color: [217, 119, 6] },
  received: { label: 'REÇUE', color: [5, 150, 105] },
  cancelled: { label: 'ANNULÉE', color: [220, 38, 38] },
  rejected: { label: 'REJETÉE', color: [220, 38, 38] }
};

// Fonction pour générer le PDF (EXPORTÉE)
export const generateReceiptPDF = async (receipt) => {
  if (!receipt || typeof receipt !== 'object') {
    throw new Error('Données de la réception invalides');
  }

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margins = { left: 15, right: 15, top: 18, bottom: 18 };
    let y = margins.top;

    // ========== INFORMATIONS DE L'ENTREPRISE ==========
    const company = {
      name: 'ECSI SARL',
      activities: 'TRAVAUX BÂTIMENT - GÉNIE CIVIL - ENTRETIEN ROUTIER',
      activities2: 'FOURNITURES DE BUREAU - VENTE DE MATÉRIELS INFORMATIQUES ET DIVERS',
      cc: 'CC N° : 1648157 R',
      taxRegime: "Régime d'Imposition : T.E.E",
      taxCenter: 'Centre des Impôts : ABOBO 1',
      addressLine1: 'Siège Social : ABOBO GARE',
      addressLine2: '21 B.P. 2132 Abidjan 21',
      phone: 'Tél : (225) 25 24 00 14 28',
      cell: 'Cell : 07 57 24 01 10 - 05 06 41 83 00',
      rc: 'RC N° CI-ABJ-2016-B-25017',
      email: 'E-mail : ecsisarlinfo@gmail.com',
      bda: 'BDA : 104010419101',
      bankAccount: 'NSIA Compte N° 020394302001'
    };

    // Récupération des données
    const receiptNumber = receipt.receipt_number || 'REC-000001';
    const receiptDate = receipt.receipt_date || new Date().toISOString().split('T')[0];
    const supplierName = receipt.purchase_order?.supplier_name || 'Fournisseur';
    const orderNumber = receipt.purchase_order?.order_number || '-';
    const receivedBy = receipt.received_by_name || receipt.received_by?.email || '-';
    const notes = receipt.notes || '';
    const status = receipt.purchase_order?.status || 'draft';
    const orderStatus = statusConfig[status] || statusConfig.draft;

    const items = receipt.items || [];
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const conformingCount = items.filter(item => item.quality_ok).length || 0;
    const nonConformingCount = items.filter(item => item.quality_checked && !item.quality_ok).length || 0;
    const conformityRate = (conformingCount + nonConformingCount) > 0 
      ? Math.round((conformingCount / (conformingCount + nonConformingCount)) * 100) 
      : 0;

    // Chargement du logo
    const loadLogo = (src) => new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
    let logoData = null;
    try { logoData = await loadLogo(logoSvg); } catch { /* ignore */ }

    // ==================== EN-TÊTE ====================
    const logoWidth = 30;
    const logoHeight = 15;
    if (logoData) {
      doc.addImage(logoData, 'PNG', margins.left, y, logoWidth, logoHeight);
    } else {
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(company.name, margins.left, y + 6);
    }

    const textStartX = margins.left + logoWidth + 4;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(company.name, textStartX, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(company.activities, textStartX, y + 8);
    doc.text(company.activities2, textStartX, y + 12);
    doc.text(company.cc, textStartX, y + 16);
    doc.text(company.taxRegime, textStartX, y + 20);
    doc.text(company.taxCenter, textStartX, y + 24);
    y = y + 34;

    // ==================== TITRE ====================
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 0, 0);
    const title = 'BON DE RÉCEPTION';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, y);
    y += 8;

    // Numéro
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`N° ${receiptNumber}`, pageWidth - margins.right, y, { align: 'right' });
    y += 12;

    // ==================== INFORMATIONS GÉNÉRALES ====================
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 60, 63);
    doc.text('INFORMATIONS GÉNÉRALES', margins.left, y);
    y += 2;
    doc.setDrawColor(218, 74, 14);
    doc.setLineWidth(0.5);
    doc.line(margins.left, y, margins.left + 80, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);

    const infoRows = [
      ['Commande N° :', orderNumber],
      ['Fournisseur :', supplierName],
      ['Date de réception :', formatDate(receiptDate)],
      ['Reçu par :', receivedBy],
    ];

    const col1Width = 50;
    const col2Width = 90;
    let tempY = y;

    infoRows.forEach(([label, value]) => {
      doc.text(label, margins.left, tempY);
      doc.text(value, margins.left + col1Width, tempY);
      tempY += 7;
    });
    y = tempY + 10;

    // ==================== TABLEAU DES ARTICLES ====================
    const colDescX = margins.left;
    const colQtyX = pageWidth - margins.right - 55;
    const colQualityX = pageWidth - margins.right;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('DÉSIGNATION', colDescX, y);
    doc.text('QTÉ', colQtyX + 20, y, { align: 'right' });
    doc.text('CONTRÔLE', colQualityX, y, { align: 'right' });
    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(colDescX, y, pageWidth - margins.right, y);
    y += 5;

    let currentY = y;
    if (items.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('Aucun article', colDescX, currentY);
      currentY += 10;
    } else {
      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const productName = item.order_item?.product_name || item.product_name || '-';
        const productRef = item.order_item?.product_reference || '';
        const qty = item.quantity || 0;
        const qualityChecked = item.quality_checked || false;
        const qualityOk = item.quality_ok || false;

        if (currentY > pageHeight - 80) {
          doc.addPage();
          currentY = margins.top;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('DÉSIGNATION', colDescX, currentY);
          doc.text('QTÉ', colQtyX + 20, currentY, { align: 'right' });
          doc.text('CONTRÔLE', colQualityX, currentY, { align: 'right' });
          currentY += 4;
          doc.line(colDescX, currentY, pageWidth - margins.right, currentY);
          currentY += 5;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(productName, colDescX, currentY);
        
        doc.text(qty.toString(), colQtyX + 20, currentY, { align: 'right' });
        
        let qualityText = 'Non contrôlé';
        let qualityColor = [150, 150, 150];
        if (qualityChecked) {
          if (qualityOk) {
            qualityText = '✓ Conforme';
            qualityColor = [5, 150, 105];
          } else {
            qualityText = '✗ Non conforme';
            qualityColor = [220, 38, 38];
          }
        }
        doc.setTextColor(qualityColor[0], qualityColor[1], qualityColor[2]);
        doc.text(qualityText, colQualityX, currentY, { align: 'right' });
        
        currentY += 5;

        if (productRef) {
          doc.setFontSize(7);
          doc.setTextColor(100, 100, 100);
          doc.text(`Réf: ${productRef}`, colDescX + 2, currentY);
          currentY += 4;
        }
        currentY += 3;
      }
    }
    y = currentY + 8;

    // ==================== RÉSUMÉ DE LA RÉCEPTION (Mieux organisé) ====================
    const summaryBoxX = margins.left;
    const summaryBoxY = y;
    const summaryBoxWidth = pageWidth - margins.left - margins.right;
    const summaryBoxHeight = 65;

    // Cadre du résumé
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(249, 250, 251);
    doc.rect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight, 'FD');
    
    // Titre du résumé
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 60, 63);
    doc.text('RÉSUMÉ DE LA RÉCEPTION', margins.left + 5, summaryBoxY + 6);
    
    // Ligne séparatrice sous le titre
    doc.setDrawColor(218, 74, 14);
    doc.setLineWidth(0.3);
    doc.line(margins.left + 5, summaryBoxY + 9, margins.left + 70, summaryBoxY + 9);
    
    let sumY = summaryBoxY + 14;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);

    // Grille 2 colonnes pour le résumé
    const col1X = margins.left + 8;
    const col2X = margins.left + 75;
    const col3X = margins.left + 120;
    const col4X = margins.left + 160;

    // Ligne 1: Nombre d'articles
    doc.text('Nombre d\'articles différents :', col1X, sumY);
    doc.text(`${items.length}`, col2X, sumY);
    sumY += 7;

    // Ligne 2: Quantité totale
    doc.text('Quantité totale reçue :', col1X, sumY);
    doc.text(`${formatNumber(totalQuantity)} unités`, col2X, sumY);
    sumY += 7;

    // Ligne 3: Taux de conformité
    doc.text('Taux de conformité :', col1X, sumY);
    const conformityColor = conformityRate >= 80 ? [5, 150, 105] : [220, 38, 38];
    doc.setTextColor(conformityColor[0], conformityColor[1], conformityColor[2]);
    doc.text(`${conformityRate}%`, col2X, sumY);
    doc.setTextColor(50, 50, 50);
    sumY += 7;

    // Ligne 4: Articles conformes (à droite)
    doc.setTextColor(5, 150, 105);
    doc.text('✓ Articles conformes :', col3X, sumY - 14);
    doc.text(`${conformingCount}`, col4X, sumY - 14);
    doc.setTextColor(50, 50, 50);

    // Ligne 5: Articles non conformes (à droite)
    if (nonConformingCount > 0) {
      doc.setTextColor(220, 38, 38);
      doc.text('✗ Articles non conformes :', col3X, sumY - 7);
      doc.text(`${nonConformingCount}`, col4X, sumY - 7);
      doc.setTextColor(50, 50, 50);
    }

    y = summaryBoxY + summaryBoxHeight + 8;

    // ==================== OBSERVATIONS ====================
    if (notes) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 60, 63);
      doc.text('OBSERVATIONS', margins.left, y);
      y += 2;
      doc.setDrawColor(218, 74, 14);
      doc.line(margins.left, y, margins.left + 60, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      
      const noteBoxX = margins.left;
      const noteBoxY = y;
      doc.setFillColor(255, 251, 235);
      doc.setDrawColor(201, 160, 61);
      doc.setLineWidth(0.5);
      doc.rect(noteBoxX, noteBoxY, pageWidth - margins.left - margins.right, 10, 'FD');
      doc.setDrawColor(0);
      
      const noteLines = doc.splitTextToSize(notes, pageWidth - margins.left - margins.right - 10);
      doc.text(noteLines, margins.left + 3, y + 4);
      y += noteLines.length * 5 + 12;
    }

    // ==================== SIGNATURES ====================
    const signatureY = Math.max(y + 20, pageHeight - margins.bottom - 40);
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    
    // Signature réceptionnaire
    doc.line(margins.left + 10, signatureY, margins.left + 60, signatureY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('RÉCEPTIONNAIRE', margins.left + 25, signatureY + 4);
    doc.setFontSize(6);
    doc.text('Nom et signature', margins.left + 25, signatureY + 8);

    // Signature responsable qualité
    const sig2X = pageWidth / 2 - 25;
    doc.line(sig2X, signatureY, sig2X + 50, signatureY);
    doc.setFontSize(8);
    doc.text('RESPONSABLE QUALITÉ', sig2X + 5, signatureY + 4);
    doc.setFontSize(6);
    doc.text('Nom et signature', sig2X + 5, signatureY + 8);

    // Signature cachet entreprise
    const sig3X = pageWidth - margins.right - 60;
    doc.line(sig3X, signatureY, sig3X + 50, signatureY);
    doc.setFontSize(8);
    doc.text('CACHET ENTREPRISE', sig3X + 5, signatureY + 4);
    doc.setFontSize(6);
    doc.text('Cachet obligatoire', sig3X + 5, signatureY + 8);

    // ==================== PIED DE PAGE ====================
    const footerY = pageHeight - margins.bottom - 15;
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);

    doc.text(
      `${company.addressLine1} ${company.addressLine2} - ${company.phone} - ${company.cell}`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );

    doc.text(
      `${company.rc} - ${company.email}`,
      pageWidth / 2,
      footerY + 5,
      { align: 'center' }
    );

    doc.text(
      `${company.bda} - ${company.bankAccount}`,
      pageWidth / 2,
      footerY + 10,
      { align: 'center' }
    );

    doc.setFontSize(6);
    doc.text(
      `Généré le ${formatDateTime(new Date())}`,
      pageWidth / 2,
      footerY + 16,
      { align: 'center' }
    );

    doc.save(`Bon_reception_${receiptNumber}.pdf`);
    return true;

  } catch (error) {
    console.error('Erreur generateReceiptPDF:', error);
    throw error;
  }
};

// Composant principal (exporté par défaut)
const PurchaseReceiptPDF = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get(`/purchase-receipts/${id}/`);
      setReceipt(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleGeneratePDF = async () => {
    if (!receipt) return;
    setGenerating(true);
    try {
      await generateReceiptPDF(receipt);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement du document...</p>
        </div>
      </div>
    );
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
    );
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
            
            <button
              onClick={handleGeneratePDF}
              disabled={generating}
              className="px-4 py-1.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 flex items-center gap-2 text-sm font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div 
              style={{
                width: '100%',
                minHeight: '297mm',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9fafb',
                padding: '20px'
              }}
            >
              <FileText className="w-16 h-16 text-blue-700 mx-auto mb-4" />
              <p className="text-gray-600 mb-2 text-center">Aperçu du bon de réception</p>
              <p className="text-sm text-gray-400 text-center">Cliquez sur "Télécharger PDF" pour générer le document</p>
              <div className="mt-4 text-xs text-gray-300">
                {receipt.receipt_number} - {receipt.purchase_order?.supplier_name || 'Fournisseur'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseReceiptPDF;