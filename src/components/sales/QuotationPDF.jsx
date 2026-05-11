// src/components/sales/QuotationPDF.jsx
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// Chemin absolu vers le logo (dossier public)
const LOGO_URL = '/logo.jpeg'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    paddingBottom: 15
  },
  companyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: 'contain'
  },
  companyInfo: {
    flexDirection: 'column'
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2
  },
  companySub: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 1
  },
  docBox: {
    alignItems: 'flex-end'
  },
  docTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4
  },
  docNumber: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 4
  },
  statusBadge: {
    borderWidth: 1,
    borderColor: '#999999',
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4
  },
  statusText: {
    fontSize: 9,
    color: '#333333',
    fontWeight: 'bold'
  },
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
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    paddingBottom: 4,
    marginBottom: 8
  },
  infoLine: {
    flexDirection: 'row',
    marginBottom: 4,
    fontSize: 9
  },
  infoLabel: {
    width: 70,
    fontWeight: 'bold',
    color: '#555555'
  },
  infoValue: {
    flex: 1,
    color: '#000000'
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EEEEEE',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC'
  },
  tableHeaderCell: {
    paddingVertical: 8,
    paddingHorizontal: 5
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333333'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDDDDD'
  },
  tableCell: {
    paddingVertical: 6,
    paddingHorizontal: 5
  },
  tableCellText: {
    fontSize: 8,
    color: '#000000'
  },
  colProduct: { width: '40%' },
  colRef: { width: '20%' },
  colQty: { width: '12%', textAlign: 'center' },
  colPrice: { width: '13%', textAlign: 'right' },
  colTotal: { width: '15%', textAlign: 'right' },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
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
    paddingRight: 10,
    color: '#555555'
  },
  totalValue: {
    width: 100,
    fontSize: 9,
    textAlign: 'right',
    color: '#000000'
  },
  grandTotalLine: {
    flexDirection: 'row',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#999999',
    width: 250
  },
  grandTotalLabel: {
    width: 120,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingRight: 10,
    color: '#000000'
  },
  grandTotalValue: {
    width: 100,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#000000'
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 7,
    color: '#999999',
    marginBottom: 2
  },
  notesBox: {
    marginTop: 15,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE'
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4
  },
  notesText: {
    fontSize: 8,
    color: '#555555',
    lineHeight: 1.4
  }
})

const QuotationPDF = ({ quotation }) => {
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

  let subtotal = 0, taxTotal = 0, total = 0
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
        <View style={styles.header}>
          <View style={styles.companyBox}>
            <Image src={LOGO_URL} style={styles.logo} />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>ECSISARL</Text>
              <Text style={styles.companySub}> Telephone: </Text>
              <Text style={styles.companySub}>Email: ecsisarlinfo@gmail.com </Text>
            </View>
          </View>
          <View style={styles.docBox}>
            <Text style={styles.docTitle}>DEVIS</Text>
            <Text style={styles.docNumber}>N° {quotation.quotation_number}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{getStatusLabel(quotation.status)}</Text>
            </View>
          </View>
        </View>

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
                <Text style={styles.infoLabel}>Tél :</Text>
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
              <Text style={styles.infoLabel}>Date :</Text>
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

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={[styles.tableHeaderCell, styles.colProduct]}>
              <Text style={styles.tableHeaderText}>DÉSIGNATION</Text>
            </View>
            <View style={[styles.tableHeaderCell, styles.colRef]}>
              <Text style={styles.tableHeaderText}>RÉFÉRENCE</Text>
            </View>
            <View style={[styles.tableHeaderCell, styles.colQty]}>
              <Text style={[styles.tableHeaderText, styles.textCenter]}>QTÉ</Text>
            </View>
            <View style={[styles.tableHeaderCell, styles.colPrice]}>
              <Text style={[styles.tableHeaderText, styles.textRight]}>PRIX U.</Text>
            </View>
            <View style={[styles.tableHeaderCell, styles.colTotal]}>
              <Text style={[styles.tableHeaderText, styles.textRight]}>TOTAL HT</Text>
            </View>
          </View>

          {items.map((item, idx) => {
            const qty = parseFloat(item.quantity) || 0
            const price = parseFloat(item.unit_price) || 0
            const itemTotal = parseFloat(item.total) || (qty * price)
            const itemSubtotal = parseFloat(item.subtotal) || (itemTotal / 1.2)

            return (
              <View key={idx} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.colProduct]}>
                  <Text style={styles.tableCellText}>{item.product?.name || item.product_name || '-'}</Text>
                </View>
                <View style={[styles.tableCell, styles.colRef]}>
                  <Text style={styles.tableCellText}>{item.product?.reference || item.product_reference || '-'}</Text>
                </View>
                <View style={[styles.tableCell, styles.colQty]}>
                  <Text style={[styles.tableCellText, styles.textCenter]}>{formatNumber(qty)}</Text>
                </View>
                <View style={[styles.tableCell, styles.colPrice]}>
                  <Text style={[styles.tableCellText, styles.textRight]}>{formatNumber(price)} FCFA</Text>
                </View>
                <View style={[styles.tableCell, styles.colTotal]}>
                  <Text style={[styles.tableCellText, styles.textRight]}>{formatNumber(itemSubtotal)} FCFA</Text>
                </View>
              </View>
            )
          })}

          {items.length === 0 && (
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, { width: '100%' }]}>
                <Text style={[styles.tableCellText, styles.textCenter]}>Aucun article</Text>
              </View>
            </View>
          )}
        </View>

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

        {quotation.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>📝 NOTES</Text>
            <Text style={styles.notesText}>{quotation.notes}</Text>
          </View>
        )}

        {quotation.terms_conditions && (
          <View style={[styles.notesBox, { marginTop: 8 }]}>
            <Text style={styles.notesTitle}>📋 CONDITIONS GÉNÉRALES</Text>
            <Text style={styles.notesText}>{quotation.terms_conditions}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>GALSENSHOP ERP - Solution ERP intégrée</Text>
          <Text style={styles.footerText}>Devis valable 30 jours</Text>
          <Text style={styles.footerText}>Document généré le {formatDate(new Date().toISOString())}</Text>
        </View>
      </Page>
    </Document>
  )
}

export default QuotationPDF