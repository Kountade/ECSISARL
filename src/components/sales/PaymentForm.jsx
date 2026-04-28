// src/components/sales/PaymentForm.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Save,
  X,
  ArrowLeft,
  CreditCard,
  Receipt,
  Users,
  CheckCircle,
  AlertCircle,
  Printer,
  Download,
  Phone,
  Building2,
  DollarSign,
  QrCode
} from 'lucide-react'

const PaymentForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [invoices, setInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [createdPayment, setCreatedPayment] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  
  const [formData, setFormData] = useState({
    invoice: '',
    amount: '',
    payment_method: 'cash',
    reference: '',
    notes: ''
  })

  const paymentMethods = {
    cash: { label: 'Espèces', icon: DollarSign, color: 'success', description: 'Paiement en espèces comptant' },
    card: { label: 'Carte bancaire', icon: CreditCard, color: 'info', description: 'Paiement par carte bancaire (Visa, Mastercard)' },
    check: { label: 'Chèque', icon: Receipt, color: 'secondary', description: 'Paiement par chèque bancaire' },
    transfer: { label: 'Virement', icon: Building2, color: 'warning', description: 'Virement bancaire' },
    mobile_money: { label: 'Mobile Money', icon: Phone, color: 'error', description: 'Paiement via Mobile Money (Orange Money, Wave)' },
    other: { label: 'Autre', icon: QrCode, color: 'neutral', description: 'Autre mode de paiement' }
  }

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number)
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const invoicesRes = await AxiosInstance.get('/invoices/')
      const filteredInvoices = (invoicesRes.data || []).filter(
        inv => inv.status === 'sent' || inv.status === 'partially_paid' || inv.status === 'overdue'
      )
      setInvoices(filteredInvoices)
      
      const params = new URLSearchParams(location.search)
      const invoiceId = params.get('invoice')
      if (invoiceId) {
        const invoice = filteredInvoices.find(i => i.id === parseInt(invoiceId))
        if (invoice) {
          setSelectedInvoice(invoice)
          setFormData(prev => ({
            ...prev,
            invoice: invoice.id.toString(),
            amount: invoice.remaining_amount?.toString() || ''
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      showNotification('Erreur lors du chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [location.search])

  const handleInvoiceChange = (invoiceId) => {
    const invoice = invoices.find(i => i.id === parseInt(invoiceId))
    setSelectedInvoice(invoice)
    setFormData(prev => ({
      ...prev,
      invoice: invoiceId,
      amount: invoice?.remaining_amount?.toString() || ''
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.invoice) {
      showNotification('Veuillez sélectionner une facture', 'error')
      return false
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showNotification('Veuillez saisir un montant valide', 'error')
      return false
    }
    if (selectedInvoice && parseFloat(formData.amount) > selectedInvoice.remaining_amount) {
      showNotification(`Le montant ne peut pas dépasser ${formatNumber(selectedInvoice.remaining_amount)} €`, 'error')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const response = await AxiosInstance.post('/payments/', {
        invoice: parseInt(formData.invoice),
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        reference: formData.reference || '',
        notes: formData.notes || ''
      })
      
      showNotification('Paiement enregistré avec succès', 'success')
      setCreatedPayment(response.data)
      setShowReceipt(true)
      
      setFormData({
        invoice: '',
        amount: '',
        payment_method: 'cash',
        reference: '',
        notes: ''
      })
      setSelectedInvoice(null)
      fetchData()
    } catch (error) {
      console.error('Error saving payment:', error)
      let errorMsg = 'Erreur lors de l\'enregistrement du paiement'
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          const firstError = Object.values(error.response.data)[0]
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError
        } else {
          errorMsg = error.response.data
        }
      }
      showNotification(errorMsg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGenerateReceipt = () => {
    showNotification('Génération du reçu en cours...', 'info')
  }

  const handlePrintReceipt = () => {
    showNotification('Impression du reçu...', 'info')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement...
          </p>
        </div>
      </div>
    )
  }

  const selectedMethod = paymentMethods[formData.payment_method] || paymentMethods.cash
  const MethodIcon = selectedMethod.icon

  return (
    <div className="min-h-screen bg-base-200 py-4 sm:py-6 px-3 sm:px-4">
      <div className="w-full max-w-6xl mx-auto">
        
        {/* Notification */}
        {notification.show && (
          <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slide-in">
            <div className={`alert ${notification.type === 'success' ? 'alert-success' : notification.type === 'info' ? 'alert-info' : 'alert-error'} shadow-lg text-sm`}>
              {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="font-semibold">{notification.message}</span>
              <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
            </div>
          </div>
        )}

        {/* Bouton retour */}
        <div className="mb-4">
          <Link to="/paiements" className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Retour aux paiements
          </Link>
        </div>

        {/* En-tête */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-3">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-base-content">Nouveau paiement</h2>
          <p className="text-base-content/60 text-sm mt-1">Enregistrez un paiement client</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl border border-primary/20">
              <div className="card-body p-4 sm:p-6">
                <h3 className="text-md font-semibold text-primary flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5" /> Informations du paiement
                </h3>

                <div className="space-y-4">
                  {/* Sélection de la facture */}
                  <div className="form-control w-full">
                    <label className="label"><span className="label-text font-medium">Facture <span className="text-error">*</span></span></label>
                    <select value={formData.invoice} onChange={(e) => handleInvoiceChange(e.target.value)} className="select select-bordered w-full">
                      <option value="">-- Sélectionner une facture --</option>
                      {invoices.map(inv => (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoice_number} - {formatNumber(inv.remaining_amount)} € restant
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Détails de la facture sélectionnée */}
                  {selectedInvoice && (
                    <div className="bg-base-200 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-primary mb-3">Détails de la facture</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-base-content/50">Client:</span><p className="font-medium">{selectedInvoice.customer_name || selectedInvoice.sale?.customer_name || '-'}</p></div>
                        <div><span className="text-base-content/50">Échéance:</span><p>{selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString('fr-FR') : '-'}</p></div>
                        <div><span className="text-base-content/50">Total facture:</span><p className="font-semibold">{formatNumber(selectedInvoice.total)} €</p></div>
                        <div><span className="text-base-content/50">Déjà payé:</span><p className="text-success">{formatNumber(selectedInvoice.paid_amount)} €</p></div>
                        <div className="col-span-2"><span className="text-base-content/50">Reste à payer:</span><p className="font-bold text-primary">{formatNumber(selectedInvoice.remaining_amount)} €</p></div>
                      </div>
                    </div>
                  )}

                  {/* Montant */}
                  <div className="form-control w-full">
                    <label className="label"><span className="label-text font-medium">Montant <span className="text-error">*</span></span></label>
                    <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" /><input type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="0.00" className="input input-bordered w-full pl-10" /></div>
                    {selectedInvoice && <span className="text-xs text-base-content/50 mt-1">Maximum: {formatNumber(selectedInvoice.remaining_amount)} €</span>}
                  </div>

                  {/* Mode de paiement */}
                  <div className="form-control w-full">
                    <label className="label"><span className="label-text font-medium">Mode de paiement <span className="text-error">*</span></span></label>
                    <select name="payment_method" value={formData.payment_method} onChange={handleInputChange} className="select select-bordered w-full">
                      {Object.entries(paymentMethods).map(([key, config]) => (<option key={key} value={key}>{config.label}</option>))}
                    </select>
                  </div>

                  {/* Référence */}
                  <div className="form-control w-full">
                    <label className="label"><span className="label-text font-medium">Référence</span></label>
                    <input type="text" name="reference" value={formData.reference} onChange={handleInputChange} className="input input-bordered w-full" placeholder="N° de chèque, de virement, ou numéro de transaction" />
                    <label className="label"><span className="label-text-alt text-base-content/50">Optionnel - Utile pour le suivi</span></label>
                  </div>

                  {/* Notes */}
                  <div className="form-control w-full">
                    <label className="label"><span className="label-text font-medium">Notes</span></label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3" className="textarea textarea-bordered w-full" placeholder="Informations complémentaires..." />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl border border-primary/20 sticky top-4">
              <div className="card-body p-4 sm:p-6">
                <h3 className="text-md font-semibold text-primary flex items-center gap-2 mb-4">
                  <Receipt className="h-5 w-5" /> Résumé
                </h3>

                {selectedInvoice ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <Receipt className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-sm text-base-content/50">Facture</p>
                      <p className="font-bold text-lg">{selectedInvoice.invoice_number}</p>
                    </div>

                    <div className="bg-base-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-primary" /><span className="text-sm">Client</span></div>
                      <p className="font-medium">{selectedInvoice.customer_name || selectedInvoice.sale?.customer_name || '-'}</p>
                    </div>

                    <div className="bg-base-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2"><MethodIcon className="w-4 h-4 text-primary" /><span className="text-sm">Mode de paiement</span></div>
                      <p>{selectedMethod.label}</p>
                    </div>

                    <div className="bg-primary/5 rounded-lg p-4 text-center">
                      <p className="text-xs text-base-content/50">Montant à payer</p>
                      <p className="text-3xl font-bold text-primary">{formatNumber(parseFloat(formData.amount) || 0)} €</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-base-content/50">Total facture:</span><span>{formatNumber(selectedInvoice.total)} €</span></div>
                      <div className="flex justify-between"><span className="text-base-content/50">Déjà payé:</span><span className="text-success">{formatNumber(selectedInvoice.paid_amount)} €</span></div>
                      <div className="border-t border-base-200 pt-2 mt-2 flex justify-between font-bold">
                        <span>Reste après paiement:</span>
                        <span>{formatNumber(selectedInvoice.remaining_amount - (parseFloat(formData.amount) || 0))} €</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="w-12 h-12 mx-auto text-base-content/30 mb-2" />
                    <p className="text-base-content/50">Sélectionnez une facture</p>
                  </div>
                )}

                {/* Description du mode de paiement */}
                {formData.payment_method && (
                  <div className={`mt-4 p-3 rounded-lg bg-${selectedMethod.color}/10`}>
                    <div className="flex items-center gap-2">
                      <MethodIcon className={`w-4 h-4 text-${selectedMethod.color}`} />
                      <p className="text-xs">{selectedMethod.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3 mt-6">
          <Link to="/paiements" className="btn btn-outline">Annuler</Link>
          <button onClick={handleSubmit} disabled={submitting || !formData.invoice || !formData.amount} className="btn btn-primary gap-2">
            {submitting ? <span className="loading loading-spinner loading-sm"></span> : <Save className="w-4 h-4" />}
            {submitting ? 'Enregistrement...' : 'Enregistrer le paiement'}
          </button>
        </div>
      </div>

      {/* Modal Reçu */}
      {showReceipt && createdPayment && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Paiement enregistré !</h3>
            </div>
            <div className="p-4 text-center">
              <p className="font-bold text-lg">{createdPayment.payment_number}</p>
              <p className="text-2xl font-bold text-primary mt-2">{formatNumber(createdPayment.amount)} €</p>
              <p className="text-sm text-base-content/60 mt-1">Souhaitez-vous générer un reçu ?</p>
            </div>
            <div className="flex gap-2 p-4 bg-base-200">
              <button onClick={() => { setShowReceipt(false); navigate('/paiements') }} className="btn btn-ghost flex-1">Terminer</button>
              <button onClick={handlePrintReceipt} className="btn btn-outline flex-1 gap-1"><Printer className="w-4 h-4" /> Imprimer</button>
              <button onClick={handleGenerateReceipt} className="btn btn-primary flex-1 gap-1"><Download className="w-4 h-4" /> PDF</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  )
}

export default PaymentForm