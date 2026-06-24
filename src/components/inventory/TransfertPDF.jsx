// src/components/inventory/TransfertPDF.jsx
import jsPDF from 'jspdf';
import logoSvg from '../../assets/logo.svg';

// Fonction pour formater les nombres
const formatNumber = (n) => {
  const num = parseFloat(n) || 0;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Fonction pour formater la devise en FCFA
const formatCurrency = (amt) => `${formatNumber(amt)} FCFA`;

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
  draft: { label: 'BROUILLON', color: [107, 114, 128] },
  pending: { label: 'EN ATTENTE', color: [217, 119, 6] },
  in_transit: { label: 'EN TRANSIT', color: [37, 99, 235] },
  partial: { label: 'RÉCEPTION PARTIELLE', color: [217, 119, 6] },
  completed: { label: 'TERMINÉ', color: [5, 150, 105] },
  cancelled: { label: 'ANNULÉ', color: [220, 38, 38] }
};

// Fonction pour générer le PDF
export const generateTransferPDF = async (transfer) => {
  if (!transfer || typeof transfer !== 'object') {
    throw new Error('Données du transfert invalides');
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
    const reference = transfer.reference || 'TRF-000001';
    const fromWarehouse = transfer.from_warehouse?.name || '-';
    const toWarehouse = transfer.to_warehouse?.name || '-';
    const waybill = transfer.waybill || '';
    const notes = transfer.notes || '';
    const status = transfer.status || 'draft';
    const orderStatus = statusConfig[status] || statusConfig.draft;

    const items = transfer.items || [];
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unit_price || 0), 0);
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalReceived = items.reduce((sum, item) => sum + (item.quantity_received || 0), 0);
    const progress = totalQuantity > 0 ? (totalReceived / totalQuantity) * 100 : 0;

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
    const title = 'BON DE TRANSFERT';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, y);
    y += 8;

    // Numéro
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`N° ${reference}`, pageWidth - margins.right, y, { align: 'right' });
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
      ['Entrepôt source :', fromWarehouse],
      ['Entrepôt destination :', toWarehouse],
      ['Date de création :', formatDateTime(transfer.created_at)],
    ];

    if (transfer.expected_date) {
      infoRows.push(['Date prévue :', formatDate(transfer.expected_date)]);
    }
    if (waybill) {
      infoRows.push(['Bon de livraison :', waybill]);
    }

    const col1Width = 55;
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
    const colRefX = margins.left + 70;
    const colQtyX = pageWidth - margins.right - 65;
    const colPriceX = pageWidth - margins.right - 40;
    const colTotalX = pageWidth - margins.right;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('DÉSIGNATION', colDescX, y);
    doc.text('RÉFÉRENCE', colRefX, y);
    doc.text('QTÉ', colQtyX, y, { align: 'right' });
    doc.text('PRIX U.', colPriceX, y, { align: 'right' });
    doc.text('TOTAL', colTotalX, y, { align: 'right' });
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
        const productName = item.product_name || '-';
        const productRef = item.product_reference || '-';
        const qty = item.quantity || 0;
        const price = item.unit_price || 0;
        const itemTotal = qty * price;

        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = margins.top;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('DÉSIGNATION', colDescX, currentY);
          doc.text('RÉFÉRENCE', colRefX, currentY);
          doc.text('QTÉ', colQtyX, currentY, { align: 'right' });
          doc.text('PRIX U.', colPriceX, currentY, { align: 'right' });
          doc.text('TOTAL', colTotalX, currentY, { align: 'right' });
          currentY += 4;
          doc.line(colDescX, currentY, pageWidth - margins.right, currentY);
          currentY += 5;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(productName, colDescX, currentY);
        doc.text(productRef, colRefX, currentY);
        doc.text(qty.toString(), colQtyX, currentY, { align: 'right' });
        doc.text(formatCurrency(price), colPriceX, currentY, { align: 'right' });
        doc.text(formatCurrency(itemTotal), colTotalX, currentY, { align: 'right' });
        currentY += 6;
      }
    }
    y = currentY + 8;

    // ==================== TOTAL ====================
    const totalBoxX = margins.left + 110;
    const totalBoxY = y;
    const totalBoxWidth = pageWidth - margins.right - totalBoxX;
    const totalBoxHeight = 20;

    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(240, 249, 255);
    doc.rect(totalBoxX, totalBoxY, totalBoxWidth, totalBoxHeight, 'FD');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('VALEUR TOTALE', totalBoxX + 5, totalBoxY + 7);
    doc.setTextColor(200, 0, 0);
    doc.text(formatCurrency(totalValue), totalBoxX + totalBoxWidth - 5, totalBoxY + 7, { align: 'right' });

    y = totalBoxY + totalBoxHeight + 10;

    // ==================== RÉSUMÉ ====================
    const summaryBoxX = margins.left;
    const summaryBoxY = y;
    const summaryBoxWidth = pageWidth - margins.left - margins.right;
    const summaryBoxHeight = 35;

    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(249, 250, 251);
    doc.rect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight, 'FD');
    y += 4;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text('RÉSUMÉ DU TRANSFERT', margins.left + 5, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    const summaryRows = [
      ['Nombre d\'articles :', `${items.length}`],
      ['Quantité totale :', `${formatNumber(totalQuantity)} unités`],
      ['Quantité reçue :', `${formatNumber(totalReceived)} unités (${Math.round(progress)}%)`],
    ];

    const col1WidthSum = 55;
    summaryRows.forEach(([label, value]) => {
      doc.text(label, margins.left + 5, y);
      doc.text(value, margins.left + col1WidthSum, y);
      y += 5;
    });

    y = summaryBoxY + summaryBoxHeight + 8;

    // ==================== NOTES ====================
    if (notes) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 60, 63);
      doc.text('NOTES', margins.left, y);
      y += 2;
      doc.setDrawColor(218, 74, 14);
      doc.line(margins.left, y, margins.left + 40, y);
      y += 6;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      const noteLines = doc.splitTextToSize(notes, pageWidth - margins.left - margins.right - 10);
      doc.text(noteLines, margins.left, y);
      y += noteLines.length * 4 + 8;
    }

    // ==================== SIGNATURES ====================
    const signatureY = Math.max(y + 20, pageHeight - margins.bottom - 40);
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);

    // Signature expéditeur
    doc.line(margins.left + 10, signatureY, margins.left + 60, signatureY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('EXPÉDITEUR', margins.left + 20, signatureY + 4);
    doc.setFontSize(6);
    doc.text('Signature et cachet', margins.left + 20, signatureY + 8);

    // Signature réceptionnaire
    const sig2X = pageWidth / 2 - 30;
    doc.line(sig2X, signatureY, sig2X + 60, signatureY);
    doc.setFontSize(8);
    doc.text('RÉCEPTIONNAIRE', sig2X + 10, signatureY + 4);
    doc.setFontSize(6);
    doc.text('Signature et cachet', sig2X + 10, signatureY + 8);

    // Signature transporteur
    const sig3X = pageWidth - margins.right - 60;
    doc.line(sig3X, signatureY, sig3X + 60, signatureY);
    doc.setFontSize(8);
    doc.text('TRANSPORTEUR', sig3X + 10, signatureY + 4);
    doc.setFontSize(6);
    doc.text('Signature et cachet', sig3X + 10, signatureY + 8);

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

    doc.save(`Transfert_${reference}.pdf`);
    return true;

  } catch (error) {
    console.error('Erreur generateTransferPDF:', error);
    throw error;
  }
};

// Export par défaut
const TransfertPDF = () => {
  return null;
};

export default TransfertPDF;