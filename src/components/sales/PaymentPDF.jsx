// src/components/sales/PaymentPDF.jsx
import jsPDF from 'jspdf';
import logoSvg from '../../assets/logo.svg';

// Fonction pour formater les nombres
const formatNumber = (n) => {
  const num = parseFloat(n) || 0;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Fonction pour formater la devise
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

// Configuration des modes de paiement
const paymentMethods = {
  cash: 'Espèces',
  card: 'Carte bancaire',
  check: 'Chèque',
  transfer: 'Virement',
  mobile_money: 'Mobile Money',
  other: 'Autre'
};

// Configuration des statuts
const statusLabels = {
  pending: 'En attente',
  completed: 'Complété',
  failed: 'Échoué',
  refunded: 'Remboursé'
};

// Couleurs selon statut
const statusColors = {
  pending: [237, 108, 2],    // orange
  completed: [46, 125, 50],   // vert
  failed: [211, 47, 47],      // rouge
  refunded: [117, 117, 117]   // gris
};

// Fonction pour convertir un montant en lettres (adaptée pour FCFA)
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
  return result.charAt(0).toUpperCase() + result.slice(1) + ' Francs CFA';
};

const PaymentPDF = async (payment) => {
  if (!payment || typeof payment !== 'object') {
    throw new Error('Données du paiement invalides');
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

    // Récupération des données du paiement
    const paymentNumber = payment.payment_number || 'PAY-000001';
    const amount = parseFloat(payment.amount) || 0;
    const paymentDate = payment.payment_date || new Date().toISOString().split('T')[0];
    const method = paymentMethods[payment.payment_method] || payment.payment_method || 'Autre';
    const status = payment.status || 'pending';
    const statusLabel = statusLabels[status] || status;
    const reference = payment.reference || '';
    const notes = payment.notes || '';
    const customerName = payment.customer_name || payment.customer?.full_name || 'Client';
    const invoiceNumber = payment.invoice_number || payment.invoice?.invoice_number || '-';

    const amountEnLettres = nombreEnLettres(amount);

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
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 0, 0);
    const title = 'REÇU DE PAIEMENT';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, y);
    y += 8;

    // Sous-titre
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    const subtitle = 'Document officiel - Reçu de paiement';
    const subtitleWidth = doc.getTextWidth(subtitle);
    doc.text(subtitle, (pageWidth - subtitleWidth) / 2, y);
    y += 12;

    // ==================== NUMÉRO DE PAIEMENT ====================
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`N° ${paymentNumber}`, pageWidth - margins.right, y, { align: 'right' });
    y += 10;

    // ==================== INFORMATIONS GÉNÉRALES ====================
    // Titre de section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 60, 63);
    doc.text('INFORMATIONS GÉNÉRALES', margins.left, y);
    y += 2;
    doc.setDrawColor(218, 74, 14);
    doc.setLineWidth(0.5);
    doc.line(margins.left, y, margins.left + 80, y);
    y += 6;

    // Informations
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);

    const infoRows = [
      ['Client :', customerName],
      ['Facture associée :', invoiceNumber],
      ['Date du paiement :', formatDate(paymentDate)],
      ['Mode de paiement :', method],
    ];

    if (reference) {
      infoRows.push(['Référence transaction :', reference]);
    }

    const col1Width = 55;
    const col2Width = 80;
    let tempY = y;

    infoRows.forEach(([label, value]) => {
      doc.text(label, margins.left, tempY);
      doc.text(value, margins.left + col1Width, tempY);
      tempY += 7;
    });
    y = tempY + 10;

    // ==================== MONTANT PAYÉ (SANS CADRE, SANS STATUT) ====================
    // Label "MONTANT PAYÉ"
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const amountLabel = 'MONTANT PAYÉ';
    const amountLabelWidth = doc.getTextWidth(amountLabel);
    doc.text(amountLabel, (pageWidth - amountLabelWidth) / 2, y);
    y += 10; // Espace de 10px entre le label et le montant

    // Montant en noir, sans gras, taille 26
    doc.setFontSize(26);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const amountText = `${formatNumber(amount)} FCFA`;
    const amountWidth = doc.getTextWidth(amountText);
    doc.text(amountText, (pageWidth - amountWidth) / 2, y);
    y += 12;

    // ==================== MONTANT EN LETTRES ====================
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80, 80, 80);
    const lettresText = `Soit la somme de : ${amountEnLettres}`;
    const lettresWidth = doc.getTextWidth(lettresText);
    doc.text(lettresText, (pageWidth - lettresWidth) / 2, y);
    y += 12;

    // ==================== NOTES ====================
    if (notes) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 60, 63);
      doc.text('COMMENTAIRES', margins.left, y);
      y += 2;
      doc.setDrawColor(218, 74, 14);
      doc.line(margins.left, y, margins.left + 60, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      const noteLines = doc.splitTextToSize(notes, pageWidth - margins.left - margins.right - 10);
      doc.text(noteLines, margins.left + 3, y);
      y += noteLines.length * 5 + 8;
    }

    // ==================== SIGNATURES ====================
    const signatureY = Math.max(y + 20, pageHeight - margins.bottom - 40);
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    
    // Ligne signature client
    doc.line(margins.left + 10, signatureY, margins.left + 80, signatureY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Signature du client', margins.left + 30, signatureY + 4);

    // Ligne signature ECSI
    doc.line(pageWidth - margins.right - 80, signatureY, pageWidth - margins.right - 10, signatureY);
    doc.text('Cachet et signature ECSI SARL', pageWidth - margins.right - 70, signatureY + 4);

    // ==================== PIED DE PAGE ====================
    const footerY = pageHeight - margins.bottom - 15;
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);

    // Ligne 1 : adresse + téléphone + cellulaire
    doc.text(
      `${company.addressLine1} ${company.addressLine2} - ${company.phone} - ${company.cell}`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );

    // Ligne 2 : RC + email
    doc.text(
      `${company.rc} - ${company.email}`,
      pageWidth / 2,
      footerY + 5,
      { align: 'center' }
    );

    // Ligne 3 : BDA + compte bancaire
    doc.text(
      `${company.bda} - ${company.bankAccount}`,
      pageWidth / 2,
      footerY + 10,
      { align: 'center' }
    );

    // Ligne 4 : Date de génération
    doc.setFontSize(6);
    doc.text(
      `Généré le ${formatDateTime(new Date())}`,
      pageWidth / 2,
      footerY + 16,
      { align: 'center' }
    );

    // ==================== SAUVEGARDE ====================
    doc.save(`Reçu_paiement_${paymentNumber}.pdf`);
    return true;

  } catch (error) {
    console.error('Erreur PaymentPDF:', error);
    throw error;
  }
};

export default PaymentPDF;