// src/components/purchases/PurchaseOrderForm.jsx
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
  Truck,
  Package,
  Plus,
  Trash2,
  FileText,
  Warehouse,
  Clock,
  Info,
  ChevronDown
} from 'lucide-react'

const PurchaseOrderForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [errors, setErrors] = useState({})
  const [activeStep, setActiveStep] = useState(1)

  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])

  const [formData, setFormData] = useState({
    supplier: '',
    supplier_reference: '',
    expected_date: '',
    urgency: 'normal',
    warehouse: '',
    shipping_address: '',
    notes: '',
    internal_notes: '',
    terms_conditions: '',
    items: []
  })

  const urgencyTypes = {
    normal: { label: 'Normal', color: 'info' },
    urgent: { label: 'Urgent', color: 'warning' },
    very_urgent: { label: 'Très urgent', color: 'error' }
  }

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number)
  }

  const formatCurrency = (amount) => `${formatNumber(amount)} €`

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [suppliersRes, productsRes, warehousesRes] = await Promise.all([
        AxiosInstance.get('/suppliers/'),
        AxiosInstance.get('/products/'),
        AxiosInstance.get('/warehouses/').catch(() => ({ data: [] }))
      ])
      
      setSuppliers(suppliersRes.data)
      setProducts(productsRes.data)
      setWarehouses(warehousesRes.data || [])

      if (isEditMode) {
        const orderRes = await AxiosInstance.get(`/purchase-orders/${id}/`)
        const order = orderRes.data
        setFormData({
          supplier: order.supplier?.id?.toString() || order.supplier?.toString() || '',
          supplier_reference: order.supplier_reference || '',
          expected_date: order.expected_date || '',
          urgency: order.urgency || 'normal',
          warehouse: order.warehouse?.toString() || '',
          shipping_address: order.shipping_address || '',
          notes: order.notes || '',
          internal_notes: order.internal_notes || '',
          terms_conditions: order.terms_conditions || '',
          items: order.items?.map(item => ({
            id: item.id,
            product: item.product?.id?.toString() || item.product?.toString() || '',
            product_name: item.product_name || '',
            product_reference: item.product_reference || '',
            quantity_ordered: item.quantity_ordered,
            unit_price: item.unit_price,
            total: item.total
          })) || []
        })
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
      if (!formData.supplier) newErrors.supplier = 'Le fournisseur est obligatoire'
      if (!formData.expected_date) newErrors.expected_date = 'La date de livraison est obligatoire'
    }
    
    if (step === 2) {
      if (formData.items.length === 0) {
        newErrors.items = 'Ajoutez au moins un article'
      } else {
        const hasEmptyProduct = formData.items.some(item => !item.product)
        if (hasEmptyProduct) newErrors.items = 'Tous les articles doivent avoir un produit'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        product: '',
        product_name: '',
        product_reference: '',
        quantity_ordered: 1,
        unit_price: 0,
        total: 0
      }]
    })
    if (errors.items) setErrors(prev => ({ ...prev, items: null }))
  }

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items]

    if (field === 'product') {
      newItems[index].product = value
      const product = products.find(p => p.id === parseInt(value))
      if (product) {
        newItems[index].product_name = product.name
        newItems[index].product_reference = product.reference
        newItems[index].unit_price = product.purchase_price || 0
      }
    } else if (field === 'quantity_ordered') {
      newItems[index].quantity_ordered = parseInt(value) || 0
    } else if (field === 'unit_price') {
      newItems[index].unit_price = parseFloat(value) || 0
    }

    newItems[index].total = (newItems[index].quantity_ordered || 0) * (newItems[index].unit_price || 0)
    setFormData({ ...formData, items: newItems })
  }

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.total || 0), 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(1) || !validateStep(2)) {
      showNotification('Veuillez corriger les erreurs', 'error')
      return
    }

    setSubmitting(true)
    
    try {
      const dataToSend = {
        supplier: parseInt(formData.supplier),
        supplier_reference: formData.supplier_reference || '',
        expected_date: formData.expected_date,
        urgency: formData.urgency,
        shipping_address: formData.shipping_address || '',
        notes: formData.notes || '',
        internal_notes: formData.internal_notes || '',
        terms_conditions: formData.terms_conditions || '',
        items: formData.items.map(item => ({
          product: parseInt(item.product),
          quantity_ordered: parseInt(item.quantity_ordered),
          unit_price: parseFloat(item.unit_price)
        }))
      }

      if (formData.warehouse) dataToSend.warehouse = parseInt(formData.warehouse)

      if (isEditMode) {
        await AxiosInstance.put(`/purchase-orders/${id}/`, dataToSend)
        showNotification('Commande modifiée', 'success')
      } else {
        await AxiosInstance.post('/purchase-orders/', dataToSend)
        showNotification('Commande créée', 'success')
      }
      
      setTimeout(() => navigate('/commandes-fournisseurs'), 1500)
      
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
          <button onClick={() => navigate('/commandes-fournisseurs')} className="btn btn-ghost btn-sm btn-circle">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            {isEditMode ? 'Modifier la commande' : 'Nouvelle commande fournisseur'}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/commandes-fournisseurs')} className="btn btn-outline">Annuler</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditMode ? 'Mettre à jour' : 'Créer la commande'}
          </button>
        </div>
      </div>

      {/* Étapes */}
      <div className="flex items-center gap-3">
        <button 
          className={`btn ${activeStep === 1 ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => validateStep(1) && setActiveStep(1)}
        >
          1. Informations générales
        </button>
        <span className="text-base-content/40">→</span>
        <button 
          className={`btn ${activeStep === 2 ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => validateStep(1) && setActiveStep(2)}
        >
          2. Articles
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        {/* Étape 1 : Informations générales */}
        {activeStep === 1 && (
          <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4 lg:p-6 w-full">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" /> Informations générales
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Fournisseur <span className="text-error">*</span>
                  </span>
                </label>
                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className={`select select-bordered w-full ${errors.supplier ? 'select-error' : ''}`}
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.company_name}</option>)}
                </select>
                {errors.supplier && <span className="text-error text-sm mt-1">{errors.supplier}</span>}
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Référence fournisseur</span>
                </label>
                <input
                  type="text"
                  name="supplier_reference"
                  value={formData.supplier_reference}
                  onChange={handleInputChange}
                  placeholder="Optionnel"
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date de livraison <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  name="expected_date"
                  value={formData.expected_date}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full ${errors.expected_date ? 'input-error' : ''}`}
                />
                {errors.expected_date && <span className="text-error text-sm mt-1">{errors.expected_date}</span>}
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Urgence
                  </span>
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  {Object.entries(urgencyTypes).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-control w-full lg:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">
                    <Warehouse className="w-4 h-4 inline mr-1" />
                    Entrepôt de réception
                  </span>
                </label>
                <select
                  name="warehouse"
                  value={formData.warehouse}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Non spécifié</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                {warehouses.length === 0 && (
                  <span className="text-warning text-sm mt-1">Aucun entrepôt configuré</span>
                )}
              </div>

              <div className="form-control w-full lg:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">
                    <Truck className="w-4 h-4 inline mr-1" />
                    Adresse de livraison
                  </span>
                </label>
                <textarea
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Adresse complète de livraison"
                  className="textarea textarea-bordered w-full"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => validateStep(1) && setActiveStep(2)}
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* Étape 2 : Articles */}
        {activeStep === 2 && (
          <div className="space-y-4 w-full">
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4 lg:p-6 w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" /> Articles
                </h2>
                <button type="button" onClick={addItem} className="btn btn-outline gap-2">
                  <Plus className="w-4 h-4" /> Ajouter un article
                </button>
              </div>

              {errors.items && (
                <div className="alert alert-error mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <span>{errors.items}</span>
                </div>
              )}

              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-base-content/50">
                  <Package className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  Aucun article ajouté
                </div>
              ) : (
                <div className="space-y-3 w-full">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="bg-base-200 rounded-lg p-4 w-full">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                        <div className="lg:col-span-5">
                          <label className="text-sm text-base-content/60 mb-1 block">Produit</label>
                          <select
                            value={item.product}
                            onChange={(e) => updateItem(idx, 'product', e.target.value)}
                            className="select select-bordered w-full"
                          >
                            <option value="">Sélectionner un produit</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.reference})</option>)}
                          </select>
                        </div>
                        <div className="lg:col-span-2">
                          <label className="text-sm text-base-content/60 mb-1 block">Quantité</label>
                          <input
                            type="number"
                            value={item.quantity_ordered}
                            onChange={(e) => updateItem(idx, 'quantity_ordered', e.target.value)}
                            min="1"
                            className="input input-bordered w-full"
                          />
                        </div>
                        <div className="lg:col-span-2">
                          <label className="text-sm text-base-content/60 mb-1 block">Prix unitaire</label>
                          <label className="input input-bordered flex items-center gap-1">
                            <span className="text-base-content/60">€</span>
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                              step="0.01"
                              className="grow"
                            />
                          </label>
                        </div>
                        <div className="lg:col-span-2">
                          <label className="text-sm text-base-content/60 mb-1 block">Total</label>
                          <div className="h-12 flex items-center font-semibold text-lg">
                            {formatCurrency(item.total || 0)}
                          </div>
                        </div>
                        <div className="lg:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="btn btn-ghost text-error"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total commande</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>

            {/* Notes et conditions */}
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4 lg:p-6 w-full">
              <div className="grid grid-cols-1 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Notes
                    </span>
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="textarea textarea-bordered w-full"
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Notes internes</span>
                  </label>
                  <textarea
                    name="internal_notes"
                    value={formData.internal_notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="textarea textarea-bordered w-full"
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Conditions générales</span>
                  </label>
                  <textarea
                    name="terms_conditions"
                    value={formData.terms_conditions}
                    onChange={handleInputChange}
                    rows={2}
                    className="textarea textarea-bordered w-full"
                  />
                </div>
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
          <button onClick={() => navigate('/commandes-fournisseurs')} className="btn btn-outline flex-1">Annuler</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary flex-1">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditMode ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PurchaseOrderForm