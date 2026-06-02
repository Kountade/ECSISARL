// src/components/sales/InvoicePDF.jsx
import jsPDF from 'jspdf';
import logoSvg from '../../assets/logo.svg';

/**
 * Convertit un nombre en toutes lettres (jusqu'à 999 999)
 */
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

/**
 * Génère une facture professionnelle style Mindtech
 * @param {Object} invoice - La facture (avec sale, items, etc.)
 */
const InvoicePDF = async (invoice) => {
  if (!invoice || typeof invoice !== 'object') {
    throw new Error('Données de la facture invalides');
  }

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margins = { left: 15, right: 15, top: 18, bottom: 18 };
    const contentWidth = pageWidth - margins.left - margins.right;
    let y = margins.top;

    // === Informations société (à adapter) ===
    const company = {
      name: 'MINDTECH',
      addressLine1: 'Cocody, Angré 8e Tranche, Cité Abri 2000',
      addressLine2: 'Abidjan Côte d’Ivoire',
      phone: '07 04 51 53 51',
      phone2: '07 08 15 17 19',
      email: 'info@mindtechcl.net',
      website: 'www.mindtechcl.net',
      rccm: 'CI-ABJ-03-2025-B13-00736',
      cc: '2243951 Z',
      slogan: 'EXPERTISE INFORMATIQUE - TELECOMMUNICATIONS - FORMATIONS'
    };

    // === Formatage ===
    const formatNumber = (n) => new Intl.NumberFormat('fr-FR').format(parseFloat(n) || 0);
    const formatCurrency = (amt) => `${formatNumber(amt)} CFA`;
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';

    // === Données de la facture ===
    const invoiceNumber = invoice.invoice_number || 'DBFAC-26-03-228';
    const invoiceDate = invoice.invoice_date || new Date().toISOString().split('T')[0];
    const dueDate = invoice.due_date || invoiceDate;
    const deliveryDate = invoice.delivery_date || invoiceDate;
    const subtotal = invoice.subtotal || 0;
    const taxRate = 0; // TVA 0% dans l'exemple
    const taxTotal = invoice.tax_total || 0;
    const total = invoice.total || 0;

    // Articles
    const items = invoice.sale?.items || invoice.items || [];
    // Si aucun article, on prend des exemples (à enlever en production)
    const displayItems = items.length ? items : [
      { 
        product_name: 'MikroTik HAP ax lite', 
        description: 'Routeur 256 Mo RAM, ARM 800 MHz, 4 ports Gigabit, gain antenne 4,3 dBi', 
        quantity: 1, 
        unit_price: 0, 
        total: 0 
      },
      { 
        product_name: 'MikroTik HAP AX3', 
        description: 'Routeur WiFi 6, 4 ports 1 Gbps (1 PoE out), 1 port 2,5 Gbps, antennes externes', 
        quantity: 1, 
        unit_price: 0, 
        total: 0 
      }
    ];

    const totalEnLettres = nombreEnLettres(total);

    // === Chargement du logo ===
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

    // ============================================================
    // 1. EN-TÊTE : logo à gauche, infos entreprise juste à côté
    // ============================================================
    const logoWidth = 30;
    const logoHeight = 15;
    if (logoData) {
      doc.addImage(logoData, 'PNG', margins.left, y, logoWidth, logoHeight);
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(company.name, margins.left, y + 6);
    }

    // Texte à côté du logo
    const textStartX = margins.left + logoWidth + 4;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(company.name, textStartX, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(company.addressLine1, textStartX, y + 8);
    doc.text(company.addressLine2, textStartX, y + 12);
    doc.text(`Tél: ${company.phone}`, textStartX, y + 16);
    y += 22;

    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(margins.left, y, pageWidth - margins.right, y);
    y += 5;

    // Titre Facture
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(`FACTURE ${invoiceNumber}`, pageWidth / 2, y, { align: 'center' });
    y += 7;
    doc.line(margins.left, y, pageWidth - margins.right, y);
    y += 8;

    // Dates
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Date de la facture : ${formatDate(invoiceDate)}`, margins.left, y);
    doc.text(`Date d'échéance : ${formatDate(dueDate)}`, margins.left + 70, y);
    doc.text(`Date de livraison : ${formatDate(deliveryDate)}`, margins.left + 140, y);
    y += 10;

    // ============================================================
    // 2. TABLEAU DES ARTICLES (sans bordures, alignements à droite)
    // ============================================================
    // Coordonnées des colonnes
    const colDescX = margins.left;
    const colQtyX = pageWidth - margins.right - 55;   // aligné à droite
    const colPriceX = pageWidth - margins.right - 35; // aligné à droite
    const colTotalX = pageWidth - margins.right;      // aligné à droite

    // En-tête du tableau (sans bordure)
    doc.setFontSize(9);
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

    let startY = y;
    let currentY = y;

    for (let idx = 0; idx < displayItems.length; idx++) {
      const item = displayItems[idx];
      const productName = item.product_name || '-';
      const description = item.description || '';
      const qty = item.quantity || 0;
      const price = item.unit_price || 0;
      const itemTotal = item.total || (qty * price);

      // Vérifier la place (gestion de saut de page)
      if (currentY > pageHeight - 70) {
        doc.addPage();
        currentY = margins.top;
        // Rétablir l'en-tête du tableau sur la nouvelle page
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Description', colDescX, currentY);
        doc.text('Qté', colQtyX, currentY, { align: 'right' });
        doc.text('Prix unit.', colPriceX, currentY, { align: 'right' });
        doc.text('Total', colTotalX, currentY, { align: 'right' });
        currentY += 4;
        doc.line(colDescX, currentY, pageWidth - margins.right, currentY);
        currentY += 5;
      }

      // Ligne produit
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(productName, colDescX, currentY);
      doc.text(qty.toString(), colQtyX, currentY, { align: 'right' });
      doc.text(formatCurrency(price), colPriceX, currentY, { align: 'right' });
      doc.text(formatCurrency(itemTotal), colTotalX, currentY, { align: 'right' });
      currentY += 5;

      // Ligne description (si présente)
      if (description) {
        const descLines = doc.splitTextToSize(description, contentWidth - 10);
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(descLines, colDescX + 2, currentY);
        currentY += descLines.length * 3.5;
        currentY += 2;
      }

      // Petit trait de séparation entre les produits (optionnel, sans bordure lourde)
      if (idx < displayItems.length - 1) {
        doc.setDrawColor(230, 230, 230);
        doc.line(colDescX, currentY - 1, pageWidth - margins.right, currentY - 1);
      }
      currentY += 3;
    }

    y = currentY + 5;

    // ============================================================
    // 3. COMMUNICATION DE PAIEMENT & MONTANTS
    // ============================================================
    const comBlockW = contentWidth * 0.55;
    const comBlockX = margins.left;
    const comBlockH = 30;
    doc.setFillColor(250, 250, 250);
    doc.rect(comBlockX, y, comBlockW, comBlockH, 'F');
    doc.setDrawColor(180, 180, 180);
    doc.rect(comBlockX, y, comBlockW, comBlockH, 'S');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Communication de paiement :', comBlockX + 3, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceNumber, comBlockX + 3, y + 11);
    doc.text('sur ce compte : CI1630120200000026823082 - GTBANK', comBlockX + 3, y + 17);
    doc.text('Référence :', comBlockX + 3, y + 23);
    doc.text(invoiceNumber, comBlockX + 3 + 20, y + 23);

    // Bloc montants (à droite)
    const amountBlockW = contentWidth * 0.4;
    const amountBlockX = pageWidth - margins.right - amountBlockW;
    doc.rect(amountBlockX, y, amountBlockW, comBlockH, 'S');
    let ay = y + 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Montant hors taxes', amountBlockX + 3, ay);
    doc.text(formatCurrency(subtotal), amountBlockX + amountBlockW - 5, ay, { align: 'right' });
    ay += 5;
    doc.text(`T.V.A. ${taxRate}%`, amountBlockX + 3, ay);
    doc.text(formatCurrency(taxTotal), amountBlockX + amountBlockW - 5, ay, { align: 'right' });
    ay += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Total', amountBlockX + 3, ay);
    doc.text(formatCurrency(total), amountBlockX + amountBlockW - 5, ay, { align: 'right' });
    y += comBlockH + 5;

    // Montant en toutes lettres
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Montant total en toutes lettres : ${totalEnLettres}`, margins.left, y);
    y += 10;

    // ============================================================
    // 4. PIED DE PAGE (infos légales)
    // ============================================================
    const footerY = pageHeight - margins.bottom - 25;
    doc.setDrawColor(200, 200, 200);
    doc.line(margins.left, footerY, pageWidth - margins.right, footerY);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(company.slogan, pageWidth / 2, footerY + 5, { align: 'center' });
    doc.text(`Consultance - Intégration de Solutions - Vente d’équipements informatiques`, pageWidth / 2, footerY + 9, { align: 'center' });
    doc.text(`18 BP 1057 ABIDJAN 18 - RCCM N°: ${company.rccm} - CC: ${company.cc}`, pageWidth / 2, footerY + 13, { align: 'center' });
    doc.text(`Email: ${company.email} - Tél: ${company.phone} / ${company.phone2} - Site : ${company.website}`, pageWidth / 2, footerY + 17, { align: 'center' });

    // Sauvegarde du PDF
    doc.save(`Facture_${invoiceNumber}.pdf`);
    return true;

  } catch (error) {
    console.error('Erreur InvoicePDF:', error);
    throw error;
  }
};

export default InvoicePDF;