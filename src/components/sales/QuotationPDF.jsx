// src/components/sales/QuotationPDF.jsx
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoSvg from '../../assets/logo.svg'

const QuotationPDF = async (quotation) => {
  if (!quotation || typeof quotation !== 'object') {
    throw new Error('Données du devis invalides')
  }

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    // === MARGES IDENTIQUES À Ventes.jsx ===
    const pageWidth = 210
    const margins = { left: 10, right: 10, top: 15, bottom: 20 }
    const contentWidth = pageWidth - margins.left - margins.right // = 190 mm
    let yPosition = margins.top // 15 mm

    // === FONCTIONS DE FORMAT (reprises de Ventes) ===
    const formatNumber = (n) => {
      const num = parseFloat(n) || 0
      // 2 décimales comme dans Ventes
      return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
    }
    const formatCurrency = (amount) => `${formatNumber(amount)} FCFA`
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      try {
        return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
      } catch { return '-' }
    }

    // === CHARGEMENT DU LOGO (même logique que Ventes) ===
    const loadLogoAsImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, img.width, img.height)
          const dataURL = canvas.toDataURL('image/png')
          resolve(dataURL)
        }
        img.onerror = (err) => {
          console.warn('Logo non chargé', err)
          reject(err)
        }
        img.src = src
      })
    }

    let logoDataURL = null
    try {
      logoDataURL = await loadLogoAsImage(logoSvg)
    } catch (err) {
      console.warn('Logo non chargé, poursuite sans logo')
    }

    // === EN-TÊTE (reprise des dimensions Ventes) ===
    // Logo : largeur 50, hauteur 25 (comme Ventes)
    const logoWidth = 50
    const logoHeight = 25
    const logoX = margins.left
    const logoY = yPosition

    if (logoDataURL) {
      doc.addImage(logoDataURL, 'PNG', logoX, logoY, logoWidth, logoHeight)
    } else {
      // Fallback texte comme dans Ventes
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('GALSEN', logoX + (logoWidth / 2), logoY + 8, { align: 'center' })
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('GALSEN SHOP', logoX + (logoWidth / 2), logoY + 14, { align: 'center' })
      doc.text('Stock', logoX + (logoWidth / 2), logoY + 19, { align: 'center' })
    }

    // Cadre "INFORMATION DE LA SOCIÉTÉ" (identique à Ventes)
    const infoSocieteY = yPosition + 2
    const infoSocieteX = pageWidth - margins.right - 95 // largeur 97, donc x = 210-10-95 = 105
    const infoBoxWidth = 97
    const infoBoxHeight = 40

    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.rect(infoSocieteX, infoSocieteY - 2, infoBoxWidth, infoBoxHeight, 'S')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('INFORMATION DE LA SOCIÉTÉ', infoSocieteX + (infoBoxWidth / 2), infoSocieteY + 4, { align: 'center' })
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.2)
    doc.line(infoSocieteX + 8, infoSocieteY + 6, infoSocieteX + infoBoxWidth - 8, infoSocieteY + 6)

    let infoY = infoSocieteY + 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setFont('helvetica', 'bold')
    doc.text('Nom:', infoSocieteX + 6, infoY)
    doc.setFont('helvetica', 'normal')
    doc.text('ECSISARL', infoSocieteX + 18, infoY)
    infoY += 5
    doc.setFont('helvetica', 'bold')
    doc.text('Adresse:', infoSocieteX + 6, infoY)
    doc.setFont('helvetica', 'normal')
    doc.text('Dakar, Sénégal', infoSocieteX + 25, infoY)
    infoY += 5
    doc.setFont('helvetica', 'bold')
    doc.text('Tél:', infoSocieteX + 6, infoY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.text('+221 33 123 45 67', infoSocieteX + 14, infoY)
    doc.setFontSize(10)
    infoY += 7
    doc.setFont('helvetica', 'bold')
    doc.text('Email:', infoSocieteX + 6, infoY)
    doc.setFont('helvetica', 'normal')
    doc.text('contact@ecsisarl.com', infoSocieteX + 20, infoY)

    // Ajuster yPosition après l'en-tête (comme dans Ventes)
    yPosition = Math.max(infoSocieteY + infoBoxHeight + 5, yPosition + 35)

    // Ligne de séparation fine
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.2)
    doc.line(margins.left, yPosition, pageWidth - margins.right, yPosition)
    yPosition += 8

    // Titre "DEVIS" (au lieu de FACTURE VENTE)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('DEVIS', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 6

    // === SECTION CLIENT / DÉTAILS DU DEVIS (identique à la section facture de Ventes) ===
    const sectionTop = yPosition
    const sectionHeight = 35
    const sectionLeftWidth = contentWidth * 0.6  // 114 mm
    const sectionRightWidth = contentWidth * 0.4 // 76 mm

    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.3)
    doc.rect(margins.left, sectionTop, contentWidth, sectionHeight, 'S')
    doc.line(margins.left + sectionLeftWidth, sectionTop, margins.left + sectionLeftWidth, sectionTop + sectionHeight)

    // Partie gauche – Client
    let clientY = sectionTop + 5
    const clientLeftMargin = margins.left + 5
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('INFORMATIONS CLIENT', clientLeftMargin, clientY)
    clientY += 8

    doc.setFontSize(10)
    const customer = quotation.customer || {}
    doc.setFont('helvetica', 'bold')
    doc.text('Dénomination :', clientLeftMargin, clientY)
    doc.setFont('helvetica', 'normal')
    doc.text(customer.full_name || customer.company_name || '-', clientLeftMargin + 28, clientY)
    clientY += 5

    doc.setFont('helvetica', 'bold')
    doc.text('Adresse :', clientLeftMargin, clientY)
    doc.setFont('helvetica', 'normal')
    doc.text(customer.address || '-', clientLeftMargin + 28, clientY)
    clientY += 5

    doc.setFont('helvetica', 'bold')
    doc.text('Téléphone :', clientLeftMargin, clientY)
    doc.setFont('helvetica', 'normal')
    doc.text(customer.phone || '-', clientLeftMargin + 28, clientY)
    clientY += 5

    doc.setFont('helvetica', 'bold')
    doc.text('Email :', clientLeftMargin, clientY)
    doc.setFont('helvetica', 'normal')
    doc.text(customer.email || '-', clientLeftMargin + 28, clientY)

    // Partie droite – Détails du devis
    let factureY = sectionTop + 8
    const factureLeftMargin = margins.left + sectionLeftWidth + 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('DATE :', factureLeftMargin, factureY)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDate(quotation.quotation_date), factureLeftMargin + 20, factureY)
    factureY += 5

    doc.setFont('helvetica', 'bold')
    doc.text('N° DEVIS :', factureLeftMargin, factureY)
    doc.setFont('helvetica', 'normal')
    doc.text(quotation.quotation_number || 'N/A', factureLeftMargin + 30, factureY)
    factureY += 5

    doc.setFont('helvetica', 'bold')
    doc.text('VALIDITÉ :', factureLeftMargin, factureY)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDate(quotation.valid_until), factureLeftMargin + 30, factureY)

    yPosition = sectionTop + sectionHeight + 15

    // === TABLEAU DES ARTICLES (exactement les mêmes largeurs que Ventes) ===
    const colWidths = {
      designation: 70,   // élargi car pas de colonne "code"
      reference: 35,
      qte: 20,
      pu: 30,
      total: 35
    }
    // Ajustement pour correspondre à 190 mm
    const totalCols = colWidths.designation + colWidths.reference + colWidths.qte + colWidths.pu + colWidths.total // = 190
    const colPositions = {
      designation: margins.left,
      reference: margins.left + colWidths.designation,
      qte: margins.left + colWidths.designation + colWidths.reference,
      pu: margins.left + colWidths.designation + colWidths.reference + colWidths.qte,
      total: margins.left + colWidths.designation + colWidths.reference + colWidths.qte + colWidths.pu
    }

    const ligneHeight = 8
    const tableTop = yPosition

    // En-tête du tableau
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.rect(margins.left, tableTop, contentWidth, ligneHeight, 'S')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    // Bordures verticales
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.2)
    doc.line(colPositions.reference, tableTop, colPositions.reference, tableTop + ligneHeight)
    doc.line(colPositions.qte, tableTop, colPositions.qte, tableTop + ligneHeight)
    doc.line(colPositions.pu, tableTop, colPositions.pu, tableTop + ligneHeight)
    doc.line(colPositions.total, tableTop, colPositions.total, tableTop + ligneHeight)

    const headerTextY = tableTop + 5
    doc.text('DÉSIGNATION', colPositions.designation + (colWidths.designation / 2), headerTextY, { align: 'center' })
    doc.text('RÉFÉRENCE', colPositions.reference + (colWidths.reference / 2), headerTextY, { align: 'center' })
    doc.text('QTÉ', colPositions.qte + (colWidths.qte / 2), headerTextY, { align: 'center' })
    doc.text('PRIX U.', colPositions.pu + (colWidths.pu / 2), headerTextY, { align: 'center' })
    doc.text('TOTAL HT', colPositions.total + (colWidths.total / 2), headerTextY, { align: 'center' })

    yPosition = tableTop + ligneHeight

    // Lignes de produits
    const items = Array.isArray(quotation.items) ? quotation.items : []
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)

    if (items.length > 0) {
      items.forEach((item, index) => {
        if (yPosition + ligneHeight > 270) {
          doc.addPage()
          yPosition = margins.top + 15
          // Redessiner l'en-tête
          doc.setDrawColor(0, 0, 0)
          doc.setLineWidth(0.5)
          doc.rect(margins.left, yPosition, contentWidth, ligneHeight, 'S')
          doc.setTextColor(0, 0, 0)
          doc.setFont('helvetica', 'bold')
          doc.text('DÉSIGNATION', colPositions.designation + (colWidths.designation / 2), yPosition + 5, { align: 'center' })
          doc.text('RÉFÉRENCE', colPositions.reference + (colWidths.reference / 2), yPosition + 5, { align: 'center' })
          doc.text('QTÉ', colPositions.qte + (colWidths.qte / 2), yPosition + 5, { align: 'center' })
          doc.text('PRIX U.', colPositions.pu + (colWidths.pu / 2), yPosition + 5, { align: 'center' })
          doc.text('TOTAL HT', colPositions.total + (colWidths.total / 2), yPosition + 5, { align: 'center' })
          doc.setDrawColor(0, 0, 0)
          doc.setLineWidth(0.2)
          doc.line(colPositions.reference, yPosition, colPositions.reference, yPosition + ligneHeight)
          doc.line(colPositions.qte, yPosition, colPositions.qte, yPosition + ligneHeight)
          doc.line(colPositions.pu, yPosition, colPositions.pu, yPosition + ligneHeight)
          doc.line(colPositions.total, yPosition, colPositions.total, yPosition + ligneHeight)
          yPosition += ligneHeight
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(0, 0, 0)
        }

        const qty = parseFloat(item.quantity) || 0
        const price = parseFloat(item.unit_price) || 0
        const total = parseFloat(item.total) || (qty * price)
        const subtotal = parseFloat(item.subtotal) || (total / 1.2)

        const designation = (item.product?.name || item.product_name || '-').substring(0, 50)
        const reference = (item.product?.reference || item.product_reference || '-').substring(0, 30)

        doc.setDrawColor(0, 0, 0)
        doc.setLineWidth(0.1)
        doc.rect(margins.left, yPosition, contentWidth, ligneHeight, 'S')
        doc.line(colPositions.reference, yPosition, colPositions.reference, yPosition + ligneHeight)
        doc.line(colPositions.qte, yPosition, colPositions.qte, yPosition + ligneHeight)
        doc.line(colPositions.pu, yPosition, colPositions.pu, yPosition + ligneHeight)
        doc.line(colPositions.total, yPosition, colPositions.total, yPosition + ligneHeight)

        const cellPaddingY = 5
        doc.text(designation, colPositions.designation + 3, yPosition + cellPaddingY)
        doc.text(reference, colPositions.reference + 3, yPosition + cellPaddingY)
        doc.text(formatNumber(qty), colPositions.qte + (colWidths.qte / 2), yPosition + cellPaddingY, { align: 'center' })
        doc.text(`${formatNumber(price)} FCFA`, colPositions.pu + colWidths.pu - 3, yPosition + cellPaddingY, { align: 'right' })
        doc.setFont('helvetica', 'bold')
        doc.text(`${formatNumber(subtotal)} FCFA`, colPositions.total + colWidths.total - 5, yPosition + cellPaddingY, { align: 'right' })
        doc.setFont('helvetica', 'normal')

        yPosition += ligneHeight
      })
    } else {
      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.1)
      doc.rect(margins.left, yPosition, contentWidth, ligneHeight, 'S')
      doc.setTextColor(150, 150, 150)
      doc.text('Aucun article dans ce devis', margins.left + contentWidth / 2, yPosition + 5, { align: 'center' })
      yPosition += ligneHeight
    }

    yPosition += 5
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.2)
    doc.line(margins.left, yPosition, pageWidth - margins.right, yPosition)
    yPosition += 10

    // === TOTAUX (identique à Ventes) ===
    let subtotal = 0, taxTotal = 0, total = 0
    if (items.length) {
      items.forEach(item => {
        const qty = parseFloat(item.quantity) || 0
        const price = parseFloat(item.unit_price) || 0
        const itemTotal = parseFloat(item.total) || (qty * price)
        const itemSubtotal = parseFloat(item.subtotal) || (itemTotal / 1.2)
        const itemTax = parseFloat(item.tax_amount) || (itemTotal - itemSubtotal)
        subtotal += itemSubtotal
        taxTotal += itemTax
        total += itemTotal
      })
    } else {
      subtotal = parseFloat(quotation.subtotal) || 0
      taxTotal = parseFloat(quotation.tax_total) || 0
      total = parseFloat(quotation.total) || 0
    }
    const discount = parseFloat(quotation.discount) || 0
    const finalTotal = total - discount

    const totalSectionTop = yPosition
    const totalColX = pageWidth - margins.right - 95
    const totalColWidth = 95
    doc.setFontSize(11)
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    const totalBoxHeight = discount > 0 ? 52 : 42
    doc.rect(totalColX, totalSectionTop, totalColWidth, totalBoxHeight, 'S')

    let currentY = totalSectionTop + 12
    for (let i = 0; i < 3; i++) {
      doc.line(totalColX + 2, currentY, totalColX + totalColWidth - 2, currentY)
      currentY += 10.5
    }
    yPosition = totalSectionTop + 9

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('SOUS-TOTAL HT:', totalColX + 8, yPosition)
    doc.setFontSize(12)
    doc.text(`${formatCurrency(subtotal)}`, totalColX + totalColWidth - 8, yPosition, { align: 'right' })
    yPosition += 10.5

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    const montantTotalLabel = 'MONTANT TOTAL:'
    doc.text(montantTotalLabel, totalColX + 8, yPosition)
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`${formatCurrency(finalTotal)}`, totalColX + totalColWidth - 20, yPosition, { align: 'right' })
    yPosition += 8.5

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    doc.text('TVA (20%) :', totalColX + 8, yPosition)
    doc.setFontSize(11)
    doc.text(`${formatCurrency(taxTotal)}`, totalColX + totalColWidth - 20, yPosition, { align: 'right' })
    yPosition += 10.5

    if (discount > 0) {
      doc.text('REMISE :', totalColX + 8, yPosition)
      doc.text(`- ${formatCurrency(discount)}`, totalColX + totalColWidth - 20, yPosition, { align: 'right' })
      yPosition += 10.5
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('TOTAL TTC :', totalColX + 8, yPosition)
    doc.text(`${formatCurrency(finalTotal)}`, totalColX + totalColWidth - 20, yPosition, { align: 'right' })

    yPosition = totalSectionTop + totalBoxHeight + 20

    // === NOTES ET CONDITIONS (optionnelles, comme dans Ventes) ===
    if (quotation.notes && typeof quotation.notes === 'string') {
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.2)
      doc.rect(margins.left, yPosition, contentWidth, 18, 'S')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('NOTES', margins.left + 4, yPosition + 5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      const splitNotes = doc.splitTextToSize(quotation.notes, contentWidth - 8)
      doc.text(splitNotes, margins.left + 4, yPosition + 10)
      yPosition += 24
    }
    if (quotation.terms_conditions && typeof quotation.terms_conditions === 'string') {
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.2)
      doc.rect(margins.left, yPosition, contentWidth, 22, 'S')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('CONDITIONS GÉNÉRALES', margins.left + 4, yPosition + 5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      const splitTerms = doc.splitTextToSize(quotation.terms_conditions, contentWidth - 8)
      doc.text(splitTerms, margins.left + 4, yPosition + 10)
      yPosition += 28
    }

    // === SIGNATURES (comme dans Ventes) ===
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.2)
    doc.line(margins.left, yPosition - 5, pageWidth - margins.right, yPosition - 5)
    yPosition += 5

    const signatureWidth = (contentWidth / 2) - 10 // = 85 mm
    const signatureHeight = 40

    // Signature client
    const signatureClientX = margins.left
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.rect(signatureClientX, yPosition, signatureWidth, signatureHeight, 'S')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Le Client', signatureClientX + (signatureWidth / 2), yPosition + 8, { align: 'center' })
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.2)
    doc.line(signatureClientX + 15, yPosition + 10, signatureClientX + signatureWidth - 15, yPosition + 10)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const clientName = customer.full_name || customer.company_name || 'Nom du client'
    doc.text(clientName, signatureClientX + (signatureWidth / 2), yPosition + 22, { align: 'center' })
    const signatureLineY = yPosition + 30
    const signatureLineLength = signatureWidth - 30
    doc.line(
      signatureClientX + (signatureWidth / 2) - (signatureLineLength / 2),
      signatureLineY,
      signatureClientX + (signatureWidth / 2) + (signatureLineLength / 2),
      signatureLineY
    )
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text('Signature et cachet', signatureClientX + (signatureWidth / 2), signatureLineY + 6, { align: 'center' })

    // Signature entreprise
    const signatureEntrepriseX = margins.left + signatureWidth + 20
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.rect(signatureEntrepriseX, yPosition, signatureWidth, signatureHeight, 'S')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('L\'Entreprise', signatureEntrepriseX + (signatureWidth / 2), yPosition + 8, { align: 'center' })
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.2)
    doc.line(signatureEntrepriseX + 15, yPosition + 10, signatureEntrepriseX + signatureWidth - 15, yPosition + 10)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('ECSISARL', signatureEntrepriseX + (signatureWidth / 2), yPosition + 22, { align: 'center' })
    doc.line(
      signatureEntrepriseX + (signatureWidth / 2) - (signatureLineLength / 2),
      signatureLineY,
      signatureEntrepriseX + (signatureWidth / 2) + (signatureLineLength / 2),
      signatureLineY
    )
    doc.text('Signature et cachet', signatureEntrepriseX + (signatureWidth / 2), signatureLineY + 6, { align: 'center' })

    yPosition += signatureHeight + 15

    // === PIED DE PAGE (identique Ventes) ===
    const footerY = Math.max(yPosition, 270)
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.2)
    doc.line(margins.left, footerY - 5, pageWidth - margins.right, footerY - 5)
    doc.text('ECSISARL ERP - Solution ERP intégrée', pageWidth / 2, footerY, { align: 'center' })
    doc.text('Devis valable 30 jours', pageWidth / 2, footerY + 4, { align: 'center' })
    doc.text(`Document généré le ${formatDate(new Date().toISOString())}`, pageWidth / 2, footerY + 8, { align: 'center' })

    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setTextColor(150, 150, 150)
      doc.text(`Page ${i}/${pageCount}`, pageWidth - margins.right, 290, { align: 'right' })
    }

    doc.save(`Devis_${quotation.quotation_number || 'document'}.pdf`)
    return true

  } catch (error) {
    console.error('Erreur dans QuotationPDF:', error)
    throw error
  }
}

export default QuotationPDF
