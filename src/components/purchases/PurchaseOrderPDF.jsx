// src/components/purchases/PurchaseOrderPDF.jsx
import jsPDF from 'jspdf';
import logoSvg from '../../assets/logo.svg';

// Fonction pour formater les nombres
const formatNumber = (n) => {
  const num = parseFloat(n) || 0;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// ✅ Fonction pour formater la devise en FCFA
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
  draft: { label: 'EN ATTENTE', color: [217, 119, 6] },
  sent: { label: 'ENVOYÉE', color: [37, 99, 235] },
  confirmed: { label: 'CONFIRMÉE', color: [5, 150, 105] },
  in_transit: { label: 'EN TRANSIT', color: [217, 119, 6] },
  partially_received: { label: 'RÉCEPTION PARTIELLE', color: [217, 119, 6] },
  received: { label: 'REÇUE', color: [5, 150, 105] },
  cancelled: { label: 'ANNULÉE', color: [220, 38, 38] },
  rejected: { label: 'REJETÉE', color: [220, 38, 38] }
};

// Fonction pour générer le PDF
export const generateOrderPDF = async (order) => {
  if (!order || typeof order !== 'object') {
    throw new Error('Données de la commande invalides');
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
    const orderNumber = order.order_number || 'CMD-000001';
    const orderDate = order.order_date || new Date().toISOString().split('T')[0];
    const expectedDate = order.expected_date || '';
    const supplierName = order.supplier_name || order.supplier?.company_name || 'Fournisseur';
    const supplierRef = order.supplier_reference || '';
    const warehouse = order.warehouse_name || order.warehouse?.name || '';
    const notes = order.notes || '';
    const internalNotes = order.internal_notes || '';
    const status = order.status || 'draft';
    const orderStatus = statusConfig[status] || statusConfig.draft;

    const items = order.items || [];
    const total = order.total || items.reduce((sum, item) => sum + (item.total || 0), 0);

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
    const title = 'COMMANDE D\'ACHAT';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, y);
    y += 8;

    // Numéro
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`N° ${orderNumber}`, pageWidth - margins.right, y, { align: 'right' });
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
      ['Fournisseur :', supplierName],
      ['Date commande :', formatDate(orderDate)],
      ['Livraison prévue :', formatDate(expectedDate)],
    ];

    if (supplierRef) {
      infoRows.push(['Réf. fournisseur :', supplierRef]);
    }

    if (warehouse) {
      infoRows.push(['Entrepôt :', warehouse]);
    }

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
        const qty = item.quantity_ordered || 0;
        const price = item.unit_price || 0;
        const itemTotal = item.total || (qty * price);

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
    doc.text('TOTAL COMMANDE', totalBoxX + 5, totalBoxY + 7);
    doc.setTextColor(200, 0, 0);
    doc.text(formatCurrency(total), totalBoxX + totalBoxWidth - 5, totalBoxY + 7, { align: 'right' });

    y = totalBoxY + totalBoxHeight + 10;

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

    if (internalNotes) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 60, 63);
      doc.text('NOTES INTERNES', margins.left, y);
      y += 2;
      doc.setDrawColor(218, 74, 14);
      doc.line(margins.left, y, margins.left + 50, y);
      y += 6;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      const internalLines = doc.splitTextToSize(internalNotes, pageWidth - margins.left - margins.right - 10);
      doc.text(internalLines, margins.left, y);
      y += internalLines.length * 4 + 8;
    }

    // ==================== SIGNATURES ====================
    const signatureY = Math.max(y + 20, pageHeight - margins.bottom - 40);
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    
    // Signature fournisseur
    doc.line(margins.left + 10, signatureY, margins.left + 70, signatureY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('SIGNATURE FOURNISSEUR', margins.left + 20, signatureY + 4);
    doc.setFontSize(6);
    doc.text('Cachet et signature', margins.left + 20, signatureY + 8);

    // Signature ECSI
    const sig2X = pageWidth - margins.right - 80;
    doc.line(sig2X, signatureY, sig2X + 70, signatureY);
    doc.setFontSize(8);
    doc.text('SIGNATURE ECSI SARL', sig2X + 15, signatureY + 4);
    doc.setFontSize(6);
    doc.text('Cachet et signature', sig2X + 15, signatureY + 8);

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

    doc.save(`Commande_${orderNumber}.pdf`);
    return true;

  } catch (error) {
    console.error('Erreur generateOrderPDF:', error);
    throw error;
  }
};

// Export par défaut pour le composant
const PurchaseOrderPDF = () => {
  return null;
};

export default PurchaseOrderPDF;