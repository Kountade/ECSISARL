// src/components/sales/InvoiceForm.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Save,
  X,
  ArrowLeft,
  Receipt,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  DollarSign,
  FileText
} from 'lucide-react'

const InvoiceForm = () => {
  const navigate = useNavigate()

  const [sales, setSales] = useState([])
  const [selectedSale, setSelectedSale] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    sale: '',
    due_date: '',
    notes: ''
  })
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  // Date par défaut : +30 jours
  const getDefaultDueDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().split('T')[0]
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const formatNumber = (number) => {
    if (!number) return '0'
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(number)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get('/sales/')
      console.log('Sales response:', response.data)
      
      // Filtrer les ventes sans facture (confirmed ou delivered)
      const salesWithoutInvoice = (response.data || []).filter(sale => 
        (sale.status === 'confirmed' || sale.status === 'delivered') && !sale.invoice
      )
      setSales(salesWithoutInvoice)
      setFormData(prev => ({ ...prev, due_date: getDefaultDueDate() }))
    } catch (error) {
      console.error('Error fetching sales:', error)
      showNotification('Erreur de chargement des ventes', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async () => {
    if (!formData.sale) {
      showNotification('Veuillez sélectionner une vente', 'error')
      return
    }

    setSubmitting(true)
    try {
      await AxiosInstance.post('/invoices/', {
        sale: parseInt(formData.sale),
        due_date: formData.due_date,
        notes: formData.notes || ''
      })
      showNotification('Facture créée avec succès', 'success')
      setTimeout(() => navigate('/factures'), 1500)
    } catch (error) {
      console.error('Error creating invoice:', error.response?.data)
      let errorMsg = 'Erreur lors de la création'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="w-full px-0">
        
        {/* Notification */}
        {notification.show && (
          <div className="fixed top-16 right-4 z-50 animate-slide-in">
            <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm`}>
              {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="font-semibold">{notification.message}</span>
              <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
            </div>
          </div>
        )}

        {/* Bouton retour */}
        <div className="px-4 sm:px-6 pt-4 pb-2">
          <Link to="/factures" className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Retour aux factures
          </Link>
        </div>

        {/* En-tête */}
        <div className="text-center px-4 sm:px-6 py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-3">
            <Receipt className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-base-content">Nouvelle facture</h2>
          <p className="text-base-content/60 text-sm mt-1">Créez une facture à partir d'une vente existante</p>
        </div>

        {/* Formulaire - Pleine largeur */}
        <div className="px-4 sm:px-6">
          <div className="card bg-base-100 shadow-xl border border-primary/20">
            <div className="card-body p-4 sm:p-6">
              
              {/* Sélection de la vente */}
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text font-medium">Vente <span className="text-error">*</span></span>
                </label>
                <select
                  value={formData.sale}
                  onChange={(e) => {
                    const sale = sales.find(s => s.id === parseInt(e.target.value))
                    setSelectedSale(sale)
                    setFormData({ ...formData, sale: e.target.value })
                  }}
                  className="select select-bordered w-full"
                >
                  <option value="">-- Sélectionner une vente --</option>
                  {sales.map(sale => (
                    <option key={sale.id} value={sale.id}>
                      {sale.sale_number} - {sale.customer_name} - {formatNumber(sale.total)} FCFA
                    </option>
                  ))}
                </select>
                {sales.length === 0 && (
                  <span className="text-warning text-xs mt-1">
                    ⚠️ Aucune vente disponible. Les ventes doivent être confirmées ou livrées.
                  </span>
                )}
              </div>

              {/* Détails de la vente sélectionnée */}
              {selectedSale && (
                <div className="bg-base-200 rounded-xl p-4 mb-4">
                  <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Détails de la vente
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-base-content/50">Client</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <p className="text-sm font-medium">{selectedSale.customer_name || 'Client'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/50">Date vente</p>
                      <p className="text-sm">{new Date(selectedSale.sale_date).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/50">Statut</p>
                      <span className="badge badge-primary badge-sm">{selectedSale.status_display || selectedSale.status}</span>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/50">Montant total</p>
                      <p className="text-sm font-bold text-primary">{formatNumber(selectedSale.total)} FCFA</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Date d'échéance */}
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text font-medium">Date d'échéance <span className="text-error">*</span></span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="input input-bordered w-full pl-10"
                  />
                </div>
                <label className="label">
                  <span className="label-text-alt text-base-content/50">Date limite de paiement (généralement 30 jours)</span>
                </label>
              </div>

              {/* Notes */}
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text font-medium">Notes</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="textarea textarea-bordered w-full"
                  placeholder="Informations complémentaires sur la facture..."
                />
              </div>

              {/* Récapitulatif */}
              <div className="bg-primary/5 rounded-xl p-4 mb-4">
                <h3 className="text-sm font-semibold text-primary mb-3">Récapitulatif</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-base-content/70">Vente sélectionnée:</span>
                    <span className="text-sm font-semibold">{selectedSale ? selectedSale.sale_number : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-base-content/70">Montant total:</span>
                    <span className="text-sm font-bold text-primary">{selectedSale ? `${formatNumber(selectedSale.total)} FCFA` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-base-content/70">Date d'échéance:</span>
                    <span className="text-sm">{formData.due_date ? new Date(formData.due_date).toLocaleDateString('fr-FR') : '—'}</span>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 mt-2">
                <Link to="/factures" className="btn btn-outline flex-1">Annuler</Link>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.sale || submitting}
                  className="btn btn-primary flex-1 gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Création...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Créer la facture
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default InvoiceForm