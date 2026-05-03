// src/components/sales/QuotationForm.jsx
import React, { useEffect, useState } from 'react'
import {
  Plus,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Warehouse,
  Users,
  Calendar,
  Package,
  FileText,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Info,
  Loader2
} from 'lucide-react'
import AxiosInstance from '../AxiosInstance'
import { useNavigate, useParams, Link } from 'react-router-dom'

const QuotationForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const darkCayn = '#003C3f'
  const vividOrange = '#DA4A0E'

  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [checkingStock, setCheckingStock] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const [formData, setFormData] = useState({
    customer: '',
    valid_until: '',
    notes: '',
    terms_conditions: '',
    items: []
  })

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number)
  }

  const checkStock = async (productId, warehouseId, quantity) => {
    if (!productId || !warehouseId) return null
    try {
      const response = await AxiosInstance.get(`/products/${productId}/stock/?warehouse=${warehouseId}`)
      const availableStock = response.data?.quantity || response.data?.stock || 0
      return {
        available: availableStock,
        sufficient: availableStock >= quantity,
        message: availableStock >= quantity
          ? `Stock suffisant: ${availableStock}`
          : `Stock insuffisant: ${availableStock} disponible, ${quantity} demandé`
      }
    } catch (error) {
      console.error('Error checking stock:', error)
      return { available: 0, sufficient: false, message: 'Impossible de vérifier le stock' }
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [customersRes, productsRes, warehousesRes] = await Promise.all([
        AxiosInstance.get('/customers/').catch(() => ({ data: [] })),
        AxiosInstance.get('/products/').catch(() => ({ data: [] })),
        AxiosInstance.get('/warehouses/').catch(() => ({ data: [] }))
      ])
      setCustomers(customersRes.data || [])
      setProducts(productsRes.data || [])
      setWarehouses(warehousesRes.data || [])

      if (isEditMode) {
        const quotationRes = await AxiosInstance.get(`/quotations/${id}/`)
        const q = quotationRes.data
        const itemsWithStock = await Promise.all(
          (q.items || []).map(async (item) => {
            const stockInfo = await checkStock(item.product?.id, item.warehouse?.id, item.quantity)
            return {
              product: item.product?.id?.toString() || '',
              product_name: item.product?.name || item.product_name || '',
              product_reference: item.product?.reference || item.product_reference || '',
              quantity: item.quantity || 1,
              unit_price: item.unit_price || 0,
              total: item.total || 0,
              warehouse: item.warehouse?.id?.toString() || '',
              warehouse_name: item.warehouse?.name || '',
              stock_info: stockInfo
            }
          })
        )
        setFormData({
          customer: q.customer?.id?.toString() || '',
          valid_until: q.valid_until || '',
          notes: q.notes || '',
          terms_conditions: q.terms_conditions || '',
          items: itemsWithStock
        })
      }
    } catch (error) {
      console.error(error)
      showNotification('Erreur lors du chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addItem = async () => {
    const defaultWarehouse = warehouses.find(w => w.is_default) || warehouses[0]
    const newItem = {
      product: '',
      product_name: '',
      product_reference: '',
      quantity: 1,
      unit_price: 0,
      total: 0,
      warehouse: defaultWarehouse?.id?.toString() || '',
      warehouse_name: defaultWarehouse?.name || '',
      stock_info: null
    }
    if (defaultWarehouse) {
      setCheckingStock(true)
      const stockInfo = await checkStock(null, defaultWarehouse.id, 1)
      newItem.stock_info = stockInfo
      setCheckingStock(false)
    }
    setFormData({ ...formData, items: [...formData.items, newItem] })
  }

  const updateItem = async (index, field, value) => {
    const newItems = [...formData.items]
    if (field === 'product') {
      newItems[index].product = value
      const product = products.find(p => p.id === parseInt(value))
      if (product) {
        newItems[index].product_name = product.name
        newItems[index].product_reference = product.reference
        newItems[index].unit_price = product.selling_price || product.purchase_price || 0
        if (newItems[index].warehouse) {
          setCheckingStock(true)
          const stockInfo = await checkStock(parseInt(value), parseInt(newItems[index].warehouse), newItems[index].quantity)
          newItems[index].stock_info = stockInfo
          setCheckingStock(false)
          if (stockInfo && !stockInfo.sufficient) showNotification(stockInfo.message, 'warning')
        }
      }
    } else if (field === 'warehouse') {
      newItems[index].warehouse = value
      const warehouse = warehouses.find(w => w.id === parseInt(value))
      newItems[index].warehouse_name = warehouse?.name || ''
      if (newItems[index].product) {
        setCheckingStock(true)
        const stockInfo = await checkStock(parseInt(newItems[index].product), parseInt(value), newItems[index].quantity)
        newItems[index].stock_info = stockInfo
        setCheckingStock(false)
        if (stockInfo && !stockInfo.sufficient) showNotification(stockInfo.message, 'warning')
      }
    } else if (field === 'quantity') {
      const newQuantity = parseInt(value) || 0
      newItems[index].quantity = newQuantity
      if (newItems[index].product && newItems[index].warehouse) {
        setCheckingStock(true)
        const stockInfo = await checkStock(parseInt(newItems[index].product), parseInt(newItems[index].warehouse), newQuantity)
        newItems[index].stock_info = stockInfo
        setCheckingStock(false)
        if (stockInfo && !stockInfo.sufficient) showNotification(stockInfo.message, 'warning')
      }
    } else if (field === 'unit_price') {
      newItems[index].unit_price = parseFloat(value) || 0
    }
    if (newItems[index].quantity && newItems[index].unit_price) {
      newItems[index].total = newItems[index].quantity * newItems[index].unit_price
    }
    setFormData({ ...formData, items: newItems })
  }

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.total || 0), 0)
  }

  const validateForm = () => {
    if (!formData.customer) {
      showNotification('Veuillez sélectionner un client', 'error')
      return false
    }
    if (!formData.valid_until) {
      showNotification('Veuillez saisir une date de validité', 'error')
      return false
    }
    if (formData.items.length === 0) {
      showNotification('Ajoutez au moins un produit', 'error')
      return false
    }
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i]
      if (!item.product) {
        showNotification(`Ligne ${i+1}: Veuillez sélectionner un produit`, 'error')
        return false
      }
      if (!item.warehouse) {
        showNotification(`Ligne ${i+1}: Veuillez sélectionner un entrepôt`, 'error')
        return false
      }
      if (item.quantity <= 0) {
        showNotification(`Ligne ${i+1}: La quantité doit être supérieure à 0`, 'error')
        return false
      }
      if (item.unit_price <= 0) {
        showNotification(`Ligne ${i+1}: Le prix unitaire doit être supérieur à 0`, 'error')
        return false
      }
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    setSubmitting(true)
    const dataToSend = {
      customer: parseInt(formData.customer),
      valid_until: formData.valid_until,
      notes: formData.notes || '',
      terms_conditions: formData.terms_conditions || '',
      items: formData.items.map(item => ({
        product: parseInt(item.product),
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price),
        warehouse: parseInt(item.warehouse)
      }))
    }
    try {
      if (isEditMode) {
        await AxiosInstance.put(`/quotations/${id}/`, dataToSend)
        showNotification('Devis modifié avec succès', 'success')
      } else {
        await AxiosInstance.post('/quotations/', dataToSend)
        showNotification('Devis créé avec succès', 'success')
      }
      setTimeout(() => navigate('/devis'), 2000)
    } catch (error) {
      console.error(error)
      let errorMsg = "Erreur lors de l'enregistrement"
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          const errors = []
          for (const [field, messages] of Object.entries(error.response.data)) {
            if (Array.isArray(messages)) errors.push(`${field}: ${messages.join(', ')}`)
            else errors.push(`${field}: ${messages}`)
          }
          errorMsg = errors.join('\n')
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600">Chargement du formulaire...</p>
        </div>
      </div>
    )
  }

  const total = calculateTotal()
  const totalTTC = total * 1.2

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 md:px-8">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : notification.type === 'error' ? 'alert-error' : 'alert-warning'} shadow-lg text-sm`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {isEditMode ? 'Modifier le devis' : 'Nouveau devis'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEditMode ? 'Modifiez les informations du devis' : 'Créez un nouveau devis pour votre client'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/devis" className="btn btn-outline gap-2">
              <ArrowLeft className="w-4 h-4" /> Annuler
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-primary gap-2"
              style={{ backgroundColor: darkCayn, borderColor: darkCayn }}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {submitting ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </div>

        {/* Stepper vertical DaisyUI */}
        <ul className="steps steps-vertical w-full">
          {/* Étape 1 */}
          <li className={`step ${activeStep >= 0 ? 'step-primary' : ''}`} onClick={() => setActiveStep(0)}>
            <div className="cursor-pointer">Informations générales</div>
          </li>
          <li className={`step ${activeStep >= 1 ? 'step-primary' : ''}`} onClick={() => setActiveStep(1)}>
            <div className="cursor-pointer">Articles</div>
          </li>
          <li className={`step ${activeStep >= 2 ? 'step-primary' : ''}`} onClick={() => setActiveStep(2)}>
            <div className="cursor-pointer">Finalisation</div>
          </li>
        </ul>

        <div className="mt-6">
          {/* Étape 1 */}
          {activeStep === 0 && (
            <div className="card bg-base-100 shadow-xl border border-gray-200">
              <div className="card-body">
                <h2 className="card-title text-xl flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Informations générales
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold">Client *</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      name="customer"
                      value={formData.customer}
                      onChange={handleInputChange}
                    >
                      <option value="">Sélectionner un client</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.full_name || c.company_name || c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold">Date de validité *</span>
                    </label>
                    <input
                      type="date"
                      name="valid_until"
                      value={formData.valid_until}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>
                </div>
                <div className="card-actions justify-end mt-6">
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveStep(1)}
                    disabled={!formData.customer || !formData.valid_until}
                  >
                    Suivant <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2 */}
          {activeStep === 1 && (
            <div className="card bg-base-100 shadow-xl border border-gray-200">
              <div className="card-body">
                <h2 className="card-title text-xl flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" /> Articles et entrepôts
                </h2>

                {checkingStock && (
                  <div className="alert alert-info shadow-lg my-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Vérification du stock en cours...</span>
                  </div>
                )}

                {formData.items.length === 0 ? (
                  <div className="text-center py-10">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-400">Aucun article ajouté</p>
                    <button onClick={addItem} className="btn btn-outline btn-primary mt-3 gap-2">
                      <Plus className="w-4 h-4" /> Ajouter un article
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="border rounded-xl p-4 bg-gray-50 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Produit *</span>
                            </label>
                            <select
                              className="select select-bordered w-full"
                              value={item.product}
                              onChange={(e) => updateItem(idx, 'product', e.target.value)}
                            >
                              <option value="">Sélectionner un produit</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.reference})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Entrepôt *</span>
                            </label>
                            <select
                              className="select select-bordered w-full"
                              value={item.warehouse}
                              onChange={(e) => updateItem(idx, 'warehouse', e.target.value)}
                            >
                              <option value="">Sélectionner un entrepôt</option>
                              {warehouses.map(w => (
                                <option key={w.id} value={w.id}>
                                  {w.name} {w.is_default && '(Défaut)'}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Quantité *</span>
                            </label>
                            <input
                              type="number"
                              className={`input input-bordered w-full ${item.stock_info && !item.stock_info.sufficient ? 'input-error' : ''}`}
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                              min="1"
                            />
                            {item.stock_info && !item.stock_info.sufficient && (
                              <label className="label">
                                <span className="label-text-alt text-error">{item.stock_info.message}</span>
                              </label>
                            )}
                          </div>
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Prix unitaire *</span>
                            </label>
                            <input
                              type="number"
                              className="input input-bordered w-full"
                              value={item.unit_price}
                              onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            {item.stock_info && item.stock_info.sufficient && (
                              <div className="badge badge-success gap-1">
                                <CheckCircle className="w-3 h-3" /> Stock OK
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 items-center">
                            <span className="font-bold text-primary">Total: {formatNumber(item.total)} €</span>
                            <button onClick={() => removeItem(idx)} className="btn btn-sm btn-ghost text-error">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={addItem} className="btn btn-outline btn-primary w-full gap-2 mt-2">
                      <Plus className="w-4 h-4" /> Ajouter un article
                    </button>

                    <div className="alert bg-primary/10 border-primary/30 mt-4">
                      <div className="flex justify-between w-full">
                        <span className="font-semibold">Total HT :</span>
                        <span className="font-bold text-lg">{formatNumber(total)} €</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="card-actions justify-between mt-6">
                  <button className="btn btn-outline" onClick={() => setActiveStep(0)}>
                    <ChevronLeft className="w-4 h-4" /> Retour
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveStep(2)}
                    disabled={formData.items.length === 0}
                  >
                    Suivant <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Étape 3 */}
          {activeStep === 2 && (
            <div className="card bg-base-100 shadow-xl border border-gray-200">
              <div className="card-body">
                <h2 className="card-title text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Finalisation
                </h2>

                <div className="space-y-4 mt-2">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Notes</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered"
                      rows="3"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Informations complémentaires pour le client"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Conditions générales</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered"
                      rows="3"
                      name="terms_conditions"
                      value={formData.terms_conditions}
                      onChange={handleInputChange}
                      placeholder="Conditions de vente, garanties, etc."
                    />
                  </div>

                  <div className="divider"></div>

                  <div className="bg-orange-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Total HT</span>
                      <span className="font-semibold">{formatNumber(total)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TVA (20%)</span>
                      <span className="font-semibold">{formatNumber(total * 0.2)} €</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-primary">Total TTC</span>
                        <span className="font-extrabold text-2xl text-primary">{formatNumber(totalTTC)} €</span>
                      </div>
                    </div>
                  </div>

                  {formData.items.some(item => item.stock_info && !item.stock_info.sufficient) && (
                    <div className="alert alert-warning shadow-lg">
                      <AlertCircle className="w-5 h-5" />
                      <span>Attention : Certains produits ont un stock insuffisant. La conversion en vente pourrait échouer.</span>
                    </div>
                  )}
                </div>

                <div className="card-actions justify-between mt-6">
                  <button className="btn btn-outline" onClick={() => setActiveStep(1)}>
                    <ChevronLeft className="w-4 h-4" /> Retour
                  </button>
                  <button
                    className="btn btn-primary gap-2"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {submitting ? 'Enregistrement...' : (isEditMode ? 'Modifier le devis' : 'Créer le devis')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
        .steps-vertical .step:before {
          content: "●";
        }
        .steps-vertical .step.step-primary:before {
          background-color: #003C3f;
          color: white;
        }
      `}</style>
    </div>
  )
}

export default QuotationForm