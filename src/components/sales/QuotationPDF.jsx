// src/components/sales/QuotationPDF.jsx
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Enregistrement des polices
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0e.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/opensans/v18/mem5YaGs126MiZpBA-UN7rgOUuhp.ttf', fontWeight: 'bold' }
  ]
})

// Styles professionnels noir et blanc
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  // En-tête
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 15
  },
  companyBox: {
    flex: 1
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4
  },
  companySub: {
    fontSize: 10,
    color: '#444444',
    marginBottom: 2
  },
  docBox: {
    alignItems: 'flex-end'
  },
  docTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4
  },
  docNumber: {
    fontSize: 12,
    color: '#555555',
    marginBottom: 4
  },
  statusBadge: {
    backgroundColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    marginTop: 4
  },
  statusText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  // Sections d'informations
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    marginTop: 10
  },
  infoBox: {
    width: '48%'
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    paddingBottom: 4,
    marginBottom: 8,
    letterSpacing: 1
  },
  infoLine: {
    flexDirection: 'row',
    marginBottom: 4,
    fontSize: 9
  },
  infoLabel: {
    width: 70,
    fontWeight: 'bold',
    color: '#333333'
  },
  infoValue: {
    flex: 1,
    color: '#000000'
  },
  // Tableau des produits
  table: {
    marginTop: 10,
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    paddingVertical: 6,
    paddingHorizontal: 5
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDDDDD',
    paddingVertical: 5,
    paddingHorizontal: 5
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDDDDD',
    paddingVertical: 5,
    paddingHorizontal: 5
  },
  colProduct: { width: '40%', fontSize: 8 },
  colRef: { width: '20%', fontSize: 8 },
  colQty: { width: '12%', fontSize: 8, textAlign: 'center' },
  colPrice: { width: '13%', fontSize: 8, textAlign: 'right' },
  colTotal: { width: '15%', fontSize: 8, textAlign: 'right' },
  // Totaux
  totalsBox: {
    marginTop: 10,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    paddingTop: 10
  },
  totalLine: {
    flexDirection: 'row',
    marginBottom: 4,
    width: 250
  },
  totalLabel: {
    width: 120,
    fontSize: 9,
    textAlign: 'right',
    paddingRight: 10
  },
  totalValue: {
    width: 100,
    fontSize: 9,
    textAlign: 'right'
  },
  grandTotalLine: {
    flexDirection: 'row',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#000000',
    width: 250
  },
  grandTotalLabel: {
    width: 120,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingRight: 10
  },
  grandTotalValue: {
    width: 100,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'right'
  },
  // Footer
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 7,
    color: '#888888',
    marginBottom: 2
  },
  // Notes section
  notesBox: {
    marginTop: 15,
    padding: 8,
    backgroundColor: '#F5F5F5'
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4
  },
  notesText: {
    fontSize: 8,
    color: '#555555',
    lineHeight: 1.4
  }
})

export const QuotationPDF = ({ quotation }) => {
  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      draft: 'BROUILLON',
      sent: 'ENVOYÉ',
      approved: 'APPROUVÉ',
      rejected: 'REJETÉ',
      expired: 'EXPIRÉ',
      converted: 'CONVERTI'
    }
    return statusMap[status] || status.toUpperCase()
  }

  const customer = quotation.customer || {}
  const items = quotation.items || []

  // Calcul des totaux
  let subtotal = 0
  let taxTotal = 0
  let total = 0

  if (items.length > 0) {
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ===== EN-TÊTE ===== */}
        <View style={styles.header}>
          <View style={styles.companyBox}>
            <Text style={styles.companyName}>GALSENSHOP ERP</Text>
            <Text style={styles.companySub}>Système de gestion intégré</Text>
            <Text style={styles.companySub}>Solution ERP professionnelle</Text>
          </View>
          <View style={styles.docBox}>
            <Text style={styles.docTitle}>DEVIS</Text>
            <Text style={styles.docNumber}>N° {quotation.quotation_number}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{getStatusLabel(quotation.status)}</Text>
            </View>
          </View>
        </View>

        {/* ===== INFORMATIONS ===== */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.sectionTitle}>CLIENT</Text>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Nom :</Text>
              <Text style={styles.infoValue}>{customer.full_name || customer.company_name || '-'}</Text>
            </View>
            {customer.email && (
              <View style={styles.infoLine}>
                <Text style={styles.infoLabel}>Email :</Text>
                <Text style={styles.infoValue}>{customer.email}</Text>
              </View>
            )}
            {customer.phone && (
              <View style={styles.infoLine}>
                <Text style={styles.infoLabel}>Téléphone :</Text>
                <Text style={styles.infoValue}>{customer.phone}</Text>
              </View>
            )}
            {customer.address && (
              <View style={styles.infoLine}>
                <Text style={styles.infoLabel}>Adresse :</Text>
                <Text style={styles.infoValue}>{customer.address}</Text>
              </View>
            )}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.sectionTitle}>DÉTAILS DEVIS</Text>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Date devis :</Text>
              <Text style={styles.infoValue}>{formatDate(quotation.quotation_date)}</Text>
            </View>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Validité :</Text>
              <Text style={styles.infoValue}>{formatDate(quotation.valid_until)}</Text>
            </View>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Créé par :</Text>
              <Text style={styles.infoValue}>{quotation.created_by?.email || '-'}</Text>
            </View>
          </View>
        </View>

        {/* ===== TABLEAU DES PRODUITS ===== */}
        <View style={styles.table}>
          {/* En-tête du tableau */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colProduct]}>DÉSIGNATION</Text>
            <Text style={[styles.tableHeaderText, styles.colRef]}>RÉFÉRENCE</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>QTE</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>PRIX U.</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>TOTAL HT</Text>
          </View>

          {/* Lignes des produits */}
          {items.map((item, idx) => {
            const qty = parseFloat(item.quantity) || 0
            const price = parseFloat(item.unit_price) || 0
            const itemTotal = parseFloat(item.total) || (qty * price)
            const itemSubtotal = parseFloat(item.subtotal) || (itemTotal / 1.2)
            const rowStyle = idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt

            return (
              <View key={idx} style={rowStyle}>
                <Text style={styles.colProduct}>{item.product?.name || item.product_name || '-'}</Text>
                <Text style={styles.colRef}>{item.product?.reference || item.product_reference || '-'}</Text>
                <Text style={styles.colQty}>{formatNumber(qty)}</Text>
                <Text style={styles.colPrice}>{formatNumber(price)} FCFA</Text>
                <Text style={styles.colTotal}>{formatNumber(itemSubtotal)} FCFA</Text>
              </View>
            )
          })}

          {/* Message si aucun produit */}
          {items.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.colProduct, { textAlign: 'center' }]}>Aucun article</Text>
            </View>
          )}
        </View>

        {/* ===== TOTAUX ===== */}
        <View style={styles.totalsBox}>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>SOUS-TOTAL HT :</Text>
            <Text style={styles.totalValue}>{formatNumber(subtotal)} FCFA</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>TVA (20%) :</Text>
            <Text style={styles.totalValue}>{formatNumber(taxTotal)} FCFA</Text>
          </View>
          {discount > 0 && (
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>REMISE :</Text>
              <Text style={styles.totalValue}>- {formatNumber(discount)} FCFA</Text>
            </View>
          )}
          <View style={styles.grandTotalLine}>
            <Text style={styles.grandTotalLabel}>TOTAL TTC :</Text>
            <Text style={styles.grandTotalValue}>{formatNumber(finalTotal)} FCFA</Text>
          </View>
        </View>

        {/* ===== NOTES ===== */}
        {quotation.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>📝 NOTES</Text>
            <Text style={styles.notesText}>{quotation.notes}</Text>
          </View>
        )}

        {/* ===== CONDITIONS GÉNÉRALES ===== */}
        {quotation.terms_conditions && (
          <View style={[styles.notesBox, { marginTop: 8 }]}>
            <Text style={styles.notesTitle}>📋 CONDITIONS GÉNÉRALES</Text>
            <Text style={styles.notesText}>{quotation.terms_conditions}</Text>
          </View>
        )}

        {/* ===== FOOTER ===== */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ECSISARL</Text>
          <Text style={styles.footerText}>Devis valable 30 jours à compter de la date d'émission</Text>
          <Text style={styles.footerText}>Document généré le {formatDate(new Date().toISOString())}</Text>
        </View>
      </Page>
    </Document>
  )
}