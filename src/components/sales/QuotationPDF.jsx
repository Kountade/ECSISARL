// src/components/sales/QuotationPDF.jsx
import jsPDF from 'jspdf';
import logoSvg from '../../assets/logo.svg';

const nombreEnLettres = (montant) => {
  const unite = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const dizaine = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  const centaine = ['', 'cent', 'deux cents', 'trois cents', 'quatre cents', 'cinq cents', 'six cents', 'sept cents', 'huit cents', 'neuf cents'];

  const sousBloc = (n) => {
    if (n === 0) return '';
    let lettres = '';
    const cents = Math.floor(n / 100);
    const reste = n % 100;
    if (cents > 0) {
      lettres += centaine[cents];
      if (reste > 0) lettres += ' ';
    }
    if (reste > 0) {
      if (reste < 10) lettres += unite[reste];
      else if (reste < 20) {
        const u = reste - 10;
        if (u === 0) lettres += 'dix';
        else if (u === 1) lettres += 'onze';
        else if (u === 2) lettres += 'douze';
        else if (u === 3) lettres += 'treize';
        else if (u === 4) lettres += 'quatorze';
        else if (u === 5) lettres += 'quinze';
        else if (u === 6) lettres += 'seize';
        else lettres += dizaine[1] + (u ? '-' + unite[u] : '');
      } else {
        const d = Math.floor(reste / 10);
        const u = reste % 10;
        if (d === 7 || d === 9) {
          lettres += dizaine[d - 1] + '-' + (u === 0 ? '' : (u === 1 ? 'onze' : unite[u + 10]));
        } else {
          lettres += dizaine[d];
          if (u === 1 && d !== 8) lettres += ' et un';
          else if (u > 0) lettres += '-' + unite[u];
        }
      }
    }
    return lettres.trim();
  };

  const milliers = Math.floor(montant / 1000);
  const resteMilliers = montant % 1000;
  let result = '';
  if (milliers > 0) {
    if (milliers === 1) result += 'mille';
    else result += sousBloc(milliers) + ' mille';
    if (resteMilliers > 0) result += ' ';
  }
  if (resteMilliers > 0) result += sousBloc(resteMilliers);
  if (result === '') result = 'zéro';
  return result.charAt(0).toUpperCase() + result.slice(1) + ' Francs';
};

const QuotationPDF = async (quotation) => {
  if (!quotation || typeof quotation !== 'object') {
    throw new Error('Données du devis invalides');
  }

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margins = { left: 15, right: 15, top: 18, bottom: 18 };
    const contentWidth = pageWidth - margins.left - margins.right;
    let y = margins.top;

    // ========== INFORMATIONS ECSI - Sarl ==========
    const company = {
      name: 'ECSI - Sarl',
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

    const formatNumber = (n) => {
      const num = parseFloat(n) || 0;
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };
    const formatCurrency = (amt) => `${formatNumber(amt)} CFA`;
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';

    const quotationNumber = quotation.quotation_number || 'DEV-000001';
    const quotationDate = quotation.quotation_date || new Date().toISOString().split('T')[0];
    const subtotal = quotation.subtotal || 0;
    const taxRate = 0;
    const taxTotal = quotation.tax_total || 0;
    const discount = quotation.discount || 0;
    const total = quotation.total || 0;
    const finalTotal = total - discount;

    const items = quotation.items || [];
    const displayItems = items.length ? items : [];

    const totalEnLettres = nombreEnLettres(finalTotal);

    // Logo (optionnel, ne pas bloquer)
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
    doc.text('DEVIS', margins.left, y);
    const devisWidth = doc.getTextWidth('DEVIS');
    doc.setTextColor(40, 40, 40);
    doc.text(` ${quotationNumber}`, margins.left + devisWidth, y);
    y += 20;

    // ==================== DATES & CLIENT ====================
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 0, 0);

    // Ligne 1: Date du devis (gauche) + Client (avec 70px d'espace)
    doc.text('Date du devis : ', margins.left, y);
    const date1LabelWidth = doc.getTextWidth('Date du devis : ');
    const dateValue = formatDate(quotationDate);
    doc.text(dateValue, margins.left + date1LabelWidth, y);

    // Calculer la position X après la date
    const dateEndX = margins.left + date1LabelWidth + doc.getTextWidth(dateValue);
    const spaceAfterDate = 70;

    const customer = quotation.customer || {};
    doc.text('Client : ', dateEndX + spaceAfterDate, y);
    const clientLabelWidth = doc.getTextWidth('Client : ');
    doc.text(customer.full_name || customer.company_name || '-', dateEndX + spaceAfterDate + clientLabelWidth, y);
    y += 10;

    // Ligne 2: Téléphone (juste sous Client)
    doc.text('Tél : ', dateEndX + spaceAfterDate, y);
    const telLabelWidth = doc.getTextWidth('Tél : ');
    doc.text(customer.phone || '-', dateEndX + spaceAfterDate + telLabelWidth, y);
    y += 8;

    // Ligne 3: Email (juste sous Téléphone)
    doc.text('Email : ', dateEndX + spaceAfterDate, y);
    const emailLabelWidth = doc.getTextWidth('Email : ');
    doc.text(customer.email || '-', dateEndX + spaceAfterDate + emailLabelWidth, y);
    y += 8;

    // Ligne 4: Adresse (juste sous Email)
    const addressLabel = 'Adresse : ';
    doc.text(addressLabel, dateEndX + spaceAfterDate, y);
    const addressLabelWidth = doc.getTextWidth(addressLabel);
    const addressText = customer.address || '-';
    const maxAddressWidth = 70;
    if (doc.getTextWidth(addressText) > maxAddressWidth) {
      const splitAddress = doc.splitTextToSize(addressText, maxAddressWidth);
      doc.text(splitAddress, dateEndX + spaceAfterDate + addressLabelWidth, y);
    } else {
      doc.text(addressText, dateEndX + spaceAfterDate + addressLabelWidth, y);
    }
    y += 12;

    // ==================== TABLEAU DES ARTICLES ====================
    const colDescX = margins.left;
    const colQtyX = pageWidth - margins.right - 55;
    const colPriceX = pageWidth - margins.right - 35;
    const colTotalX = pageWidth - margins.right;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Description', colDescX, y);
    doc.text('Qté', colQtyX, y, { align: 'right' });
    doc.text('Prix unit.', colPriceX, y, { align: 'right' });
    doc.text('Total', colTotalX, y, { align: 'right' });
    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(colDescX, y, pageWidth - margins.right, y);
    y += 5;

    let currentY = y;
    if (displayItems.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('Aucun article', colDescX, currentY);
      currentY += 10;
    } else {
      for (let idx = 0; idx < displayItems.length; idx++) {
        const item = displayItems[idx];
        const productName = item.product?.name || item.product_name || '-';
        const description = item.description || '';
        const qty = item.quantity || 0;
        const price = item.unit_price || 0;
        const itemTotal = item.total || (qty * price);

        if (currentY > pageHeight - 80) {
          doc.addPage();
          currentY = margins.top;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('Description', colDescX, currentY);
          doc.text('Qté', colQtyX, currentY, { align: 'right' });
          doc.text('Prix unit.', colPriceX, currentY, { align: 'right' });
          doc.text('Total', colTotalX, currentY, { align: 'right' });
          currentY += 4;
          doc.line(colDescX, currentY, pageWidth - margins.right, currentY);
          currentY += 5;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(productName, colDescX, currentY);
        doc.text(qty.toString(), colQtyX, currentY, { align: 'right' });
        doc.text(formatCurrency(price), colPriceX, currentY, { align: 'right' });
        doc.text(formatCurrency(itemTotal), colTotalX, currentY, { align: 'right' });
        currentY += 5;

        if (description) {
          const descLines = doc.splitTextToSize(description, contentWidth - 10);
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(descLines, colDescX + 2, currentY);
          currentY += descLines.length * 4 + 2;
        }
        currentY += 3;
      }
    }
    y = currentY + 5;

    // ==================== MONTANTS ====================
    const amountBlockW = contentWidth * 0.4;
    const amountBlockX = pageWidth - margins.right - amountBlockW;
    let ay = y;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Montant hors taxes', amountBlockX + 3, ay);
    doc.text(formatNumber(subtotal), amountBlockX + amountBlockW - 5, ay, { align: 'right' });
    ay += 5;
    
    // Afficher la TVA seulement si elle est > 0
    if (taxRate > 0) {
      doc.text(`T.V.A. ${taxRate}%`, amountBlockX + 3, ay);
      doc.text(formatNumber(taxTotal), amountBlockX + amountBlockW - 5, ay, { align: 'right' });
      ay += 5;
    }
    
    if (discount > 0) {
      doc.text('Remise', amountBlockX + 3, ay);
      doc.text(`- ${formatNumber(discount)}`, amountBlockX + amountBlockW - 5, ay, { align: 'right' });
      ay += 5;
    }
    ay += 1;
    doc.setFont('helvetica', 'bold');
    doc.text('Total', amountBlockX + 3, ay);
    doc.text(formatNumber(finalTotal), amountBlockX + amountBlockW - 5, ay, { align: 'right' });
    ay += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Montant total en toutes lettres :', amountBlockX + 3, ay);
    doc.text(totalEnLettres, amountBlockX + amountBlockW - 5, ay, { align: 'right' });

    const leftHeight = 28;
    const rightHeight = (ay + 2) - y;
    const maxHeight = Math.max(leftHeight, rightHeight);
    y += maxHeight + 5;

    // ==================== SIGNATURE ENTREPRISE ====================
    const signatureY = y + 15;
    const signatureWidth = 80;
    const signatureX = pageWidth - margins.right - signatureWidth;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('L\'Entreprise', signatureX + (signatureWidth / 2), signatureY, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(company.name, signatureX + (signatureWidth / 2), signatureY + 8, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Signature et cachet', signatureX + (signatureWidth / 2), signatureY + 16, { align: 'center' });

    y = signatureY + 30;

    // ==================== NOTES ET CONDITIONS ====================
    if (quotation.notes && typeof quotation.notes === 'string' && quotation.notes.trim()) {
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(margins.left, y, contentWidth, 18, 'S');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('NOTES', margins.left + 4, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const splitNotes = doc.splitTextToSize(quotation.notes, contentWidth - 8);
      doc.text(splitNotes, margins.left + 4, y + 10);
      y += 24;
    }

    if (quotation.terms_conditions && typeof quotation.terms_conditions === 'string' && quotation.terms_conditions.trim()) {
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(margins.left, y, contentWidth, 18, 'S');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('CONDITIONS', margins.left + 4, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const splitTerms = doc.splitTextToSize(quotation.terms_conditions, contentWidth - 8);
      doc.text(splitTerms, margins.left + 4, y + 10);
      y += 24;
    }

    // ==================== PIED DE PAGE ====================
    const footerY = pageHeight - margins.bottom - 20;
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`${company.addressLine1} ${company.addressLine2} - ${company.phone} - ${company.cell}`, pageWidth / 2, footerY, { align: 'center' });
    doc.text(`${company.rc} - ${company.email}`, pageWidth / 2, footerY + 5, { align: 'center' });
    doc.text(`${company.bda} - ${company.bankAccount}`, pageWidth / 2, footerY + 10, { align: 'center' });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i}/${pageCount}`, pageWidth - margins.right, pageHeight - margins.bottom - 2, { align: 'right' });
    }

    doc.save(`Devis_${quotationNumber}.pdf`);
    return true;

  } catch (error) {
    console.error('Erreur QuotationPDF:', error);
    throw error;
  }
};

export default QuotationPDF;