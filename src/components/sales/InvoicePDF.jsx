// src/components/sales/InvoicePDF.jsx
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

    const formatNumber = (n) => {
      const num = parseFloat(n) || 0;
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };
    const formatCurrency = (amt) => `${formatNumber(amt)} CFA`;
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';

    const invoiceNumber = invoice.invoice_number || 'DBFAC-26-03-228';
    const invoiceDate = invoice.invoice_date || new Date().toISOString().split('T')[0];
    const dueDate = invoice.due_date || invoiceDate;
    const deliveryDate = invoice.delivery_date || invoiceDate;
    const subtotal = invoice.subtotal || 0;
    const taxRate = 0;
    const taxTotal = invoice.tax_total || 0;
    const total = invoice.total || 0;

    const items = invoice.sale?.items || invoice.items || [];
    const displayItems = items.length ? items : [
      { product_name: 'MikroTik HAP ax lite', description: 'Routeur 256 Mo RAM, ARM 800 MHz, 4 ports Gigabit, gain antenne 4,3 dBi', quantity: 1, unit_price: 0, total: 0 },
      { product_name: 'MikroTik HAP AX3', description: 'Routeur WiFi 6, 4 ports 1 Gbps (1 PoE out), 1 port 2,5 Gbps, antennes externes', quantity: 1, unit_price: 0, total: 0 }
    ];

    const totalEnLettres = nombreEnLettres(total);

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

    // ==================== EN-TÊTE (logo + infos) ====================
    const logoWidth = 30;
    const logoHeight = 15;
    if (logoData) {
      doc.addImage(logoData, 'PNG', margins.left, y, logoWidth, logoHeight);
    } else {
      doc.setFontSize(13); // augmenté
      doc.setFont('helvetica', 'bold');
      doc.text(company.name, margins.left, y + 6);
    }

    const textStartX = margins.left + logoWidth + 4;
    doc.setFontSize(9); // augmenté (était 8)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(company.name, textStartX, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(company.addressLine1, textStartX, y + 8);
    doc.text(company.addressLine2, textStartX, y + 12);
    doc.text(`Tél: ${company.phone}`, textStartX, y + 16);
    y = y + 31; // 15 mm d'espace après l'en-tête

    // ==================== TITRE ====================
    doc.setFontSize(20); // augmenté (était 16)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 0, 0);
    doc.text('FACTURE', margins.left, y);
    const factureWidth = doc.getTextWidth('FACTURE');
    doc.setTextColor(40, 40, 40);
    doc.text(` ${invoiceNumber}`, margins.left + factureWidth, y);
    y += 20; // espace après titre

    // ==================== DATES ====================
    doc.setFontSize(11); // augmenté (était 9)
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 0, 0);

    doc.text('Date de la facture : ', margins.left, y);
    const date1LabelWidth = doc.getTextWidth('Date de la facture : ');
    doc.text(formatDate(invoiceDate), margins.left + date1LabelWidth, y);

    doc.text('Date d\'échéance : ', margins.left + 70, y);
    const date2LabelWidth = doc.getTextWidth('Date d\'échéance : ');
    doc.text(formatDate(dueDate), margins.left + 70 + date2LabelWidth, y);

    doc.text('Date de livraison : ', margins.left + 140, y);
    const date3LabelWidth = doc.getTextWidth('Date de livraison : ');
    doc.text(formatDate(deliveryDate), margins.left + 140 + date3LabelWidth, y);
    y += 10;

    // ==================== TABLEAU DES ARTICLES ====================
    const colDescX = margins.left;
    const colQtyX = pageWidth - margins.right - 55;
    const colPriceX = pageWidth - margins.right - 35;
    const colTotalX = pageWidth - margins.right;

    doc.setFontSize(10); // augmenté (était 9)
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
    for (let idx = 0; idx < displayItems.length; idx++) {
      const item = displayItems[idx];
      const productName = item.product_name || '-';
      const description = item.description || '';
      const qty = item.quantity || 0;
      const price = item.unit_price || 0;
      const itemTotal = item.total || (qty * price);

      if (currentY > pageHeight - 80) { // ajusté pour police plus grande
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
      doc.setFontSize(9); // augmenté (était 8)
      doc.setTextColor(0, 0, 0);
      doc.text(productName, colDescX, currentY);
      doc.text(qty.toString(), colQtyX, currentY, { align: 'right' });
      doc.text(formatCurrency(price), colPriceX, currentY, { align: 'right' });
      doc.text(formatCurrency(itemTotal), colTotalX, currentY, { align: 'right' });
      currentY += 5;

      if (description) {
        const descLines = doc.splitTextToSize(description, contentWidth - 10);
        doc.setFontSize(8); // augmenté (était 7)
        doc.setTextColor(100, 100, 100);
        doc.text(descLines, colDescX + 2, currentY);
        currentY += descLines.length * 4 + 2; // ajusté pour police plus grande
      }
      currentY += 3;
    }
    y = currentY + 5;

    // ==================== COMMUNICATION DE PAIEMENT ET MONTANTS ====================
    doc.setFontSize(9); // augmenté (était 8)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Communication de paiement :', margins.left + 3, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceNumber, margins.left + 3, y + 11);
    doc.text('sur ce compte : CI1630120200000026823082 - GTBANK', margins.left + 3, y + 17);
    doc.text('Référence :', margins.left + 3, y + 23);
    doc.text(invoiceNumber, margins.left + 3 + 20, y + 23);

    const amountBlockW = contentWidth * 0.4;
    const amountBlockX = pageWidth - margins.right - amountBlockW;
    let ay = y + 5;
    doc.setFontSize(9); // augmenté (était 8)
    doc.setFont('helvetica', 'normal');
    doc.text('Montant hors taxes', amountBlockX + 3, ay);
    doc.text(formatNumber(subtotal), amountBlockX + amountBlockW - 5, ay, { align: 'right' });
    ay += 5;
    doc.text(`T.V.A. ${taxRate}%`, amountBlockX + 3, ay);
    doc.text(formatNumber(taxTotal), amountBlockX + amountBlockW - 5, ay, { align: 'right' });
    ay += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Total', amountBlockX + 3, ay);
    doc.text(formatNumber(total), amountBlockX + amountBlockW - 5, ay, { align: 'right' });
    ay += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8); // augmenté (était 7)
    doc.text('Montant total en toutes lettres :', amountBlockX + 3, ay);
    doc.text(totalEnLettres, amountBlockX + amountBlockW - 5, ay, { align: 'right' });

    const leftHeight = 28;
    const rightHeight = (ay + 2) - (y + 5);
    const maxHeight = Math.max(leftHeight, rightHeight);
    y += maxHeight + 5;

    // ==================== PIED DE PAGE (sans trait) ====================
    const footerY = pageHeight - margins.bottom - 20;
    doc.setFontSize(8); // augmenté (était 7)
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(company.slogan, pageWidth / 2, footerY, { align: 'center' });
    doc.text('Consultance - Intégration de Solutions - Vente d’équipements informatiques', pageWidth / 2, footerY + 4, { align: 'center' });
    doc.text(`18 BP 1057 ABIDJAN 18 - RCCM N°: ${company.rccm} - CC: ${company.cc}`, pageWidth / 2, footerY + 8, { align: 'center' });
    doc.text(`Email: ${company.email} - Tél: ${company.phone} / ${company.phone2} - Site : ${company.website}`, pageWidth / 2, footerY + 12, { align: 'center' });

    doc.save(`Facture_${invoiceNumber}.pdf`);
    return true;

  } catch (error) {
    console.error('Erreur InvoicePDF:', error);
    throw error;
  }
};

export default InvoicePDF;