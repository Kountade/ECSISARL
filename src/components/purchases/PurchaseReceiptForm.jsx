// src/components/purchases/PurchaseReceiptForm.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Save,
  X,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Building2,
  Calendar,
  Package,
  Receipt,
  FileText,
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
  ClipboardCheck,
  Hash
} from 'lucide-react'

const PurchaseReceiptForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [errors, setErrors] = useState({})
  const [activeStep, setActiveStep] = useState(1)

  const [availableOrders, setAvailableOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [expandedItems, setExpandedItems] = useState([])

  const [formData, setFormData] = useState({
    purchase_order: '',
    notes: '',
    items: []
  })

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'badge-ghost' },
    sent: { label: 'Envoyée', color: 'badge-info' },
    confirmed: { label: 'Confirmée', color: 'badge-primary' },
    in_transit: { label: 'En transit', color: 'badge-warning' },
    partially_received: { label: 'Partiel', color: 'badge-warning' },
    received: { label: 'Reçue', color: 'badge-success' }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const availableRes = await AxiosInstance.get('/purchase-receipts/available_orders/')
      setAvailableOrders(availableRes.data || [])

      if (isEditMode) {
        const receiptRes = await AxiosInstance.get(`/purchase-receipts/${id}/`)
        const receipt = receiptRes.data
        setFormData({
          purchase_order: receipt.purchase_order?.id?.toString() || '',
          notes: receipt.notes || '',
          items: receipt.items?.map(item => ({
            id: item.id,
            order_item: item.order_item,
            product_name: item.order_item?.product_name || item.product_name,
            product_reference: item.order_item?.product_reference || item.product_reference,
            quantity_ordered: item.quantity_ordered || 0,
            quantity_received: item.quantity_received || 0,
            to_receive: (item.quantity_ordered || 0) - (item.quantity_received || 0),
            quantity: item.quantity || 0,
            quality_checked: item.quality_checked || false,
            quality_ok: item.quality_ok !== undefined ? item.quality_ok : true,
            quality_notes: item.quality_notes || '',
            lot_number: item.lot_number || '',
            expiry_date: item.expiry_date || '',
            notes: item.notes || ''
          })) || []
        })
        if (receipt.purchase_order) {
          setSelectedOrder(receipt.purchase_order)
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
      showNotification('Erreur de chargement', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const validateStep = (step) => {
    const newErrors = {}
    
    if (step === 1) {
      if (!formData.purchase_order) {
        newErrors.purchase_order = 'Veuillez sélectionner une commande'
      }
    }
    
    if (step === 2) {
      const itemsWithQuantity = formData.items.filter(item => item.quantity > 0)
      if (itemsWithQuantity.length === 0) {
        newErrors.items = 'Aucune quantité à recevoir'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOrderChange = (orderId) => {
    const order = availableOrders.find(o => o.id === parseInt(orderId))
    
    if (order && order.items && order.items.length > 0) {
      setSelectedOrder(order)
      setFormData({
        ...formData,
        purchase_order: orderId,
        items: order.items.map(item => ({
          order_item: item.id,
          product_name: item.product_name,
          product_reference: item.product_reference,
          quantity_ordered: item.quantity_ordered,
          quantity_received: item.quantity_received || 0,
          to_receive: item.quantity_ordered - (item.quantity_received || 0),
          quantity: 0,
          quality_checked: false,
          quality_ok: true,
          quality_notes: '',
          lot_number: '',
          expiry_date: '',
          notes: ''
        }))
      })
      setExpandedItems(order.items.map(() => false))
    } else {
      showNotification('Cette commande ne contient aucun article', 'warning')
    }
    
    if (errors.purchase_order) setErrors(prev => ({ ...prev, purchase_order: null }))
  }

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items]

    if (field === 'quantity') {
      const maxQuantity = newItems[index].to_receive
      const newValue = Math.min(parseInt(value) || 0, maxQuantity)
      newItems[index].quantity = newValue
      newItems[index].quality_checked = newValue > 0
    } else if (field === 'quality_ok') {
      newItems[index].quality_ok = value
      newItems[index].quality_checked = true
    } else {
      newItems[index][field] = value
    }

    setFormData({ ...formData, items: newItems })
    if (errors.items) setErrors(prev => ({ ...prev, items: null }))
  }

  const toggleExpandItem = (index) => {
    const newExpanded = [...expandedItems]
    newExpanded[index] = !newExpanded[index]
    setExpandedItems(newExpanded)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(1) || !validateStep(2)) {
      showNotification('Veuillez corriger les erreurs', 'error')
      return
    }

    setSubmitting(true)
    
    try {
      const itemsToReceive = formData.items
        .filter(item => item.quantity > 0)
        .map(item => ({
          order_item: item.order_item,
          quantity: item.quantity,
          quality_checked: item.quality_checked,
          quality_ok: item.quality_ok,
          quality_notes: item.quality_notes || '',
          lot_number: item.lot_number || '',
          expiry_date: item.expiry_date || null,
          notes: item.notes || ''
        }))

      const dataToSend = {
        purchase_order: parseInt(formData.purchase_order),
        notes: formData.notes || '',
        items: itemsToReceive
      }

      if (isEditMode) {
        await AxiosInstance.put(`/purchase-receipts/${id}/`, dataToSend)
        showNotification('Réception modifiée', 'success')
      } else {
        await AxiosInstance.post('/purchase-receipts/', dataToSend)
        showNotification('Réception enregistrée', 'success')
      }
      
      setTimeout(() => navigate('/receptions'), 1500)
      
    } catch (error) {
      console.error('Erreur:', error)
      let errorMsg = 'Erreur d\'enregistrement'
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMsg = Object.entries(error.response.data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(' | ')
        } else {
          errorMsg = error.response.data
        }
      }
      showNotification(errorMsg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const getTotalQuantity = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  }

  const getConformingCount = () => {
    return formData.items.filter(item => item.quantity > 0 && item.quality_ok).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  return (
    <div className="w-full px-3 lg:px-6 py-3 space-y-4">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 lg:top-20 right-3 lg:right-6 z-50 animate-slideDown w-[calc(100%-1.5rem)] lg:w-auto max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm">{notification.message}</span>
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ ...notification, show: false })}>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/receptions')} className="btn btn-ghost btn-sm btn-circle">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary" />
            {isEditMode ? 'Modifier la réception' : 'Nouvelle réception'}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/receptions')} className="btn btn-outline">Annuler</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditMode ? 'Mettre à jour' : 'Valider la réception'}
          </button>
        </div>
      </div>

      {/* Étapes */}
      <div className="flex items-center gap-3">
        <button 
          className={`btn ${activeStep === 1 ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => validateStep(1) && setActiveStep(1)}
        >
          1. Sélection commande
        </button>
        <span className="text-base-content/40">→</span>
        <button 
          className={`btn ${activeStep === 2 ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => validateStep(1) && setActiveStep(2)}
        >
          2. Saisie et qualité
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        {/* Étape 1 : Sélection commande */}
        {activeStep === 1 && (
          <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4 lg:p-6 w-full">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Sélection de la commande
            </h2>
            
            <div className="max-w-2xl">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">
                    Commande d'achat <span className="text-error">*</span>
                  </span>
                </label>
                <select
                  value={formData.purchase_order}
                  onChange={(e) => handleOrderChange(e.target.value)}
                  className={`select select-bordered w-full ${errors.purchase_order ? 'select-error' : ''}`}
                  disabled={isEditMode}
                >
                  <option value="">Sélectionner une commande</option>
                  {availableOrders.map(order => {
                    const status = statusConfig[order.status] || statusConfig.draft
                    return (
                      <option key={order.id} value={order.id}>
                        {order.order_number} - {order.supplier_name} ({order.items?.length || 0} article(s)) - {status.label}
                      </option>
                    )
                  })}
                </select>
                {errors.purchase_order && <span className="text-error text-sm mt-1">{errors.purchase_order}</span>}
              </div>

              {selectedOrder && (
                <div className="mt-6 p-4 bg-base-200 rounded-lg">
                  <h3 className="font-semibold mb-3">Détails de la commande</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-base-content/60">Numéro:</span>
                      <span className="ml-2 font-medium">{selectedOrder.order_number}</span>
                    </div>
                    <div>
                      <span className="text-base-content/60">Fournisseur:</span>
                      <span className="ml-2 font-medium">{selectedOrder.supplier_name}</span>
                    </div>
                    <div>
                      <span className="text-base-content/60">Date commande:</span>
                      <span className="ml-2">{formatDate(selectedOrder.order_date)}</span>
                    </div>
                    <div>
                      <span className="text-base-content/60">Livraison prévue:</span>
                      <span className="ml-2">{formatDate(selectedOrder.expected_date)}</span>
                    </div>
                    <div>
                      <span className="text-base-content/60">Statut:</span>
                      <span className={`badge ml-2 ${statusConfig[selectedOrder.status]?.color || 'badge-ghost'}`}>
                        {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-base-content/60">Articles:</span>
                      <span className="ml-2">{selectedOrder.items?.length || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {availableOrders.length === 0 && (
                <div className="alert alert-warning mt-4">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Aucune commande en attente de réception</span>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => validateStep(1) && setActiveStep(2)}
                disabled={!formData.purchase_order}
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* Étape 2 : Saisie et qualité */}
        {activeStep === 2 && (
          <div className="space-y-4 w-full">
            {/* Saisie des quantités */}
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4 lg:p-6 w-full">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5 text-primary" /> Saisie des quantités reçues
              </h2>
              
              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-base-content/50">Aucun article dans cette commande</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr className="bg-base-200">
                        <th>Produit</th>
                        <th className="text-center">Commandé</th>
                        <th className="text-center">Déjà reçu</th>
                        <th className="text-center">À recevoir</th>
                        <th className="text-center">Quantité reçue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="font-medium">{item.product_name}</div>
                            <div className="text-xs text-base-content/60">{item.product_reference}</div>
                          </td>
                          <td className="text-center">
                            <span className="badge badge-outline">{item.quantity_ordered}</span>
                          </td>
                          <td className="text-center">
                            <span className="badge badge-info">{item.quantity_received}</span>
                          </td>
                          <td className="text-center">
                            <span className="badge badge-warning">{item.to_receive}</span>
                          </td>
                          <td className="text2-center">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                              min="0"
                              max={item.to_receive}
                              className="input input-bordered input-sm w-24 text-center"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {errors.items && (
                <div className="alert alert-error mt-4">
                  <AlertCircle className="w-5 h-5" />
                  <span>{errors.items}</span>
                </div>
              )}

              <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total reçu</span>
                  <span className="text-xl font-bold text-primary">{getTotalQuantity()} unité(s)</span>
                </div>
              </div>
            </div>

            {/* Contrôle qualité */}
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4 lg:p-6 w-full">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardCheck className="w-5 h-5 text-success" />
                <h2 className="font-bold text-lg">Contrôle qualité</h2>
                <span className="badge badge-success ml-2">{getConformingCount()} conformes</span>
              </div>
              
              {formData.items.filter(item => item.quantity > 0).length === 0 ? (
                <div className="text-center py-4 text-base-content/50">
                  Aucun article avec quantité &gt; 0
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.items.filter(item => item.quantity > 0).map((item, idx) => {
                    const originalIdx = formData.items.findIndex(i => i.order_item === item.order_item)
                    const isExpanded = expandedItems[originalIdx]
                    
                    return (
                      <div key={idx} className="border border-base-300 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleExpandItem(originalIdx)}
                          className="w-full flex items-center justify-between p-3 hover:bg-base-200 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-base-content/50" />
                            <div className="text-left">
                              <div className="font-medium">{item.product_name}</div>
                              <div className="text-xs text-base-content/60">Reçu: {item.quantity} unité(s)</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`badge ${item.quality_ok ? 'badge-success' : 'badge-error'}`}>
                              {item.quality_ok ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              {item.quality_ok ? 'Conforme' : 'Non conforme'}
                            </span>
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </button>
                        
                        {isExpanded && (
                          <div className="p-4 bg-base-200 border-t border-base-300 space-y-3">
                            <div className="form-control">
                              <label className="label cursor-pointer justify-start gap-3 p-0">
                                <input
                                  type="checkbox"
                                  checked={item.quality_ok}
                                  onChange={(e) => updateItem(originalIdx, 'quality_ok', e.target.checked)}
                                  className="toggle toggle-success"
                                />
                                <span className="label-text font-medium">Produit conforme</span>
                              </label>
                            </div>
                            
                            <div className="form-control">
                              <label className="label pb-1">
                                <span className="label-text text-sm">Notes qualité</span>
                              </label>
                              <textarea
                                value={item.quality_notes}
                                onChange={(e) => updateItem(originalIdx, 'quality_notes', e.target.value)}
                                placeholder="Décrivez les éventuels problèmes..."
                                rows={2}
                                className="textarea textarea-bordered w-full"
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="form-control">
                                <label className="label pb-1">
                                  <span className="label-text text-sm">Numéro de lot</span>
                                </label>
                                <input
                                  type="text"
                                  value={item.lot_number}
                                  onChange={(e) => updateItem(originalIdx, 'lot_number', e.target.value)}
                                  placeholder="Lot n°..."
                                  className="input input-bordered w-full"
                                />
                              </div>
                              <div className="form-control">
                                <label className="label pb-1">
                                  <span className="label-text text-sm flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Date d'expiration
                                  </span>
                                </label>
                                <input
                                  type="date"
                                  value={item.expiry_date}
                                  onChange={(e) => updateItem(originalIdx, 'expiry_date', e.target.value)}
                                  className="input input-bordered w-full"
                                />
                              </div>
                            </div>
                            
                            <div className="form-control">
                              <label className="label pb-1">
                                <span className="label-text text-sm">Notes supplémentaires</span>
                              </label>
                              <input
                                type="text"
                                value={item.notes}
                                onChange={(e) => updateItem(originalIdx, 'notes', e.target.value)}
                                className="input input-bordered w-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Notes générales */}
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4 lg:p-6 w-full">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notes générales
                  </span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes générales pour cette réception..."
                  rows={3}
                  className="textarea textarea-bordered w-full"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setActiveStep(1)}
              >
                ← Retour
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Barre mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t p-3 shadow-lg z-40">
        <div className="flex gap-2">
          <button onClick={() => navigate('/receptions')} className="btn btn-outline flex-1">Annuler</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary flex-1">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditMode ? 'Mettre à jour' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PurchaseReceiptForm