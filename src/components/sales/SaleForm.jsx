// src/components/sales/SaleForm.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Save,
  X,
  Trash2,
  Plus,
  ArrowLeft,
  Package,
  DollarSign,
  Percent,
  AlertCircle,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const SaleForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const [formData, setFormData] = useState({
    customer: '',
    warehouse: '',
    delivery_date: '',
    shipping_address: '',
    notes: '',
    discount_rate: 0,
    shipping_cost: 0,
    items: []
  })

  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productSearch, setProductSearch] = useState('')
  const [tempItem, setTempItem] = useState({
    product: '',
    quantity: 1,
    unit_price: 0
  })

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
      const [customersRes, productsRes, warehousesRes] = await Promise.all([
        AxiosInstance.get('/customers/').catch(() => ({ data: [] })),
        AxiosInstance.get('/products/').catch(() => ({ data: [] })),
        AxiosInstance.get('/warehouses/').catch(() => ({ data: [] }))
      ])
      setCustomers(customersRes.data || [])
      setProducts(productsRes.data || [])
      setWarehouses(warehousesRes.data || [])

      if (isEditMode) {
        const saleRes = await AxiosInstance.get(`/sales/${id}/`).catch(() => ({ data: null }))
        if (saleRes.data) {
          const sale = saleRes.data
          setFormData({
            customer: sale.customer?.id?.toString() || '',
            warehouse: sale.warehouse?.id?.toString() || '',
            delivery_date: sale.delivery_date || '',
            shipping_address: sale.shipping_address || '',
            notes: sale.notes || '',
            discount_rate: sale.discount_rate || 0,
            shipping_cost: sale.shipping_cost || 0,
            items: sale.items?.map(item => ({
              product: item.product?.id?.toString() || '',
              product_name: item.product_name || '',
              product_reference: item.product_reference || '',
              quantity: item.quantity || 1,
              unit_price: item.unit_price || 0,
              total: item.total || 0
            })) || []
          })
        }
      }
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement', 'error')
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

  const addItem = () => {
    if (!selectedProduct) {
      showNotification('Veuillez sélectionner un produit', 'error')
      return
    }
    if (tempItem.quantity <= 0) {
      showNotification('La quantité doit être supérieure à 0', 'error')
      return
    }
    if (tempItem.unit_price <= 0) {
      showNotification('Le prix unitaire doit être supérieur à 0', 'error')
      return
    }

    const newItem = {
      product: selectedProduct.id.toString(),
      product_name: selectedProduct.name,
      product_reference: selectedProduct.reference || '-',
      quantity: tempItem.quantity,
      unit_price: tempItem.unit_price,
      total: tempItem.quantity * tempItem.unit_price
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))

    setSelectedProduct(null)
    setTempItem({ product: '', quantity: 1, unit_price: 0 })
    setProductSearch('')
    setShowProductModal(false)
  }

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items]
    if (field === 'quantity') {
      newItems[index].quantity = parseInt(value) || 0
    } else if (field === 'unit_price') {
      newItems[index].unit_price = parseFloat(value) || 0
    }
    if (newItems[index].quantity && newItems[index].unit_price) {
      newItems[index].total = newItems[index].quantity * newItems[index].unit_price
    }
    setFormData(prev => ({ ...prev, items: newItems }))
  }

  const removeItem = (index) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0)
    const discount = subtotal * (formData.discount_rate / 100)
    const total = subtotal - discount + (formData.shipping_cost || 0)
    return { subtotal, discount, total }
  }

  const { subtotal, discount, total } = calculateTotals()

  const validateStep = () => {
    if (activeStep === 0 && !formData.customer) {
      showNotification('Veuillez sélectionner un client', 'error')
      return false
    }
    if (activeStep === 1 && formData.items.length === 0) {
      showNotification('Veuillez ajouter au moins un produit', 'error')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (formData.items.length === 0) {
      showNotification('Ajoutez au moins un produit', 'error')
      return
    }

    setSubmitting(true)
    const dataToSend = {
      customer: parseInt(formData.customer),
      warehouse: formData.warehouse ? parseInt(formData.warehouse) : null,
      delivery_date: formData.delivery_date || null,
      shipping_address: formData.shipping_address,
      notes: formData.notes,
      discount_rate: parseFloat(formData.discount_rate) || 0,
      shipping_cost: parseFloat(formData.shipping_cost) || 0,
      items: formData.items.map(item => ({
        product: parseInt(item.product),
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price)
      }))
    }

    try {
      if (isEditMode) {
        await AxiosInstance.put(`/sales/${id}/`, dataToSend)
        showNotification('Vente modifiée avec succès', 'success')
      } else {
        await AxiosInstance.post('/sales/', dataToSend)
        showNotification('Vente créée avec succès', 'success')
      }
      setTimeout(() => navigate('/ventes'), 1500)
    } catch (error) {
      console.error(error)
      let errorMsg = 'Erreur lors de l\'enregistrement'
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error
      }
      showNotification(errorMsg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    (product.reference || '').toLowerCase().includes(productSearch.toLowerCase())
  )

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

  return (
    <div className="min-h-screen bg-base-200 py-4 sm:py-6 px-3 sm:px-4">
      <div className="w-full max-w-4xl mx-auto">
        
        {/* Notification */}
        {notification.show && (
          <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slide-in">
            <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm`}>
              {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="font-semibold">{notification.message}</span>
              <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
            </div>
          </div>
        )}

        {/* Bouton retour */}
        <div className="mb-4">
          <Link to="/ventes" className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Retour à la liste
          </Link>
        </div>

        {/* En-tête */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-3">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-base-content">
            {isEditMode ? 'Modifier la vente' : 'Nouvelle vente'}
          </h2>
          <p className="text-base-content/60 text-sm mt-1">
            {isEditMode ? 'Modifiez les informations de la vente' : 'Créez une nouvelle vente'}
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-6">
          <ul className="steps steps-vertical lg:steps-horizontal w-full">
            <li className={`step ${activeStep >= 0 ? 'step-primary' : ''}`}>Informations</li>
            <li className={`step ${activeStep >= 1 ? 'step-primary' : ''}`}>Articles</li>
            <li className={`step ${activeStep >= 2 ? 'step-primary' : ''}`}>Finalisation</li>
          </ul>
        </div>

        <div className="card bg-base-100 shadow-xl border border-primary/20">
          <div className="card-body p-4 sm:p-6">
            
            {/* Étape 1: Informations générales */}
            {activeStep === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control w-full">
                    <label className="label"><span className="label-text font-medium">Client <span className="text-error">*</span></span></label>
                    <select name="customer" value={formData.customer} onChange={handleInputChange} className="select select-bordered w-full">
                      <option value="">-- Sélectionner un client --</option>
                      {customers.map(c => (<option key={c.id} value={c.id}>{c.full_name || c.company_name}</option>))}
                    </select>
                  </div>
                  <div className="form-control w-full">
                    <label className="label"><span className="label-text font-medium">Entrepôt</span></label>
                    <select name="warehouse" value={formData.warehouse} onChange={handleInputChange} className="select select-bordered w-full">
                      <option value="">Non spécifié</option>
                      {warehouses.map(w => (<option key={w.id} value={w.id}>{w.name}</option>))}
                    </select>
                  </div>
                </div>

                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">Date de livraison</span></label>
                  <input type="date" name="delivery_date" value={formData.delivery_date} onChange={handleInputChange} className="input input-bordered w-full" />
                </div>

                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">Adresse de livraison</span></label>
                  <textarea name="shipping_address" value={formData.shipping_address} onChange={handleInputChange} rows="2" className="textarea textarea-bordered w-full" placeholder="Adresse de livraison" />
                </div>

                <div className="flex justify-end mt-4">
                  <button onClick={handleNext} className="btn btn-primary gap-2">Suivant <ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}

            {/* Étape 2: Articles */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-semibold text-primary">Articles commandés</h3>
                  <button onClick={() => setShowProductModal(true)} className="btn btn-sm btn-primary gap-1"><Plus className="w-4 h-4" /> Ajouter</button>
                </div>

                {formData.items.length === 0 ? (
                  <div className="text-center py-8 bg-base-200 rounded-xl">
                    <Package className="w-12 h-12 mx-auto text-base-content/30 mb-2" />
                    <p className="text-base-content/50">Aucun article</p>
                    <button onClick={() => setShowProductModal(true)} className="btn btn-xs btn-primary mt-2">Ajouter un produit</button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-sm">
                      <thead className="bg-base-200">
                        <tr className="text-xs">
                          <th>Produit</th>
                          <th>Référence</th>
                          <th className="text-center">Qté</th>
                          <th className="text-right">Prix</th>
                          <th className="text-right">Total</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, idx) => (
                          <tr key={idx} className="hover">
                            <td className="font-medium text-sm">{item.product_name}</td>
                            <td className="text-xs">{item.product_reference}</td>
                            <td className="text-center"><input type="number" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} min="1" className="input input-bordered input-xs w-20 text-center" /></td>
                            <td className="text-right"><input type="number" value={item.unit_price} onChange={(e) => updateItem(idx, 'unit_price', e.target.value)} min="0" step="1" className="input input-bordered input-xs w-24 text-right" /></td>
                            <td className="text-right font-semibold">{formatNumber(item.total)} €</td>
                            <td className="text-center"><button onClick={() => removeItem(idx)} className="btn btn-ghost btn-xs text-error"><Trash2 className="w-3 h-3" /></button></td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="4" className="text-right font-bold">Sous-total</td>
                          <td className="text-right font-bold">{formatNumber(subtotal)} €</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                <div className="flex justify-between mt-4">
                  <button onClick={handleBack} className="btn btn-outline gap-2"><ChevronLeft className="w-4 h-4" /> Retour</button>
                  <button onClick={handleNext} className="btn btn-primary gap-2">Suivant <ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}

            {/* Étape 3: Finalisation */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control w-full">
                    <label className="label"><span className="label-text font-medium">Remise (%)</span></label>
                    <div className="relative"><Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" /><input type="number" name="discount_rate" value={formData.discount_rate} onChange={handleInputChange} min="0" max="100" step="0.5" className="input input-bordered w-full pl-10" placeholder="0" /></div>
                  </div>
                  <div className="form-control w-full">
                    <label className="label"><span className="label-text font-medium">Frais de livraison</span></label>
                    <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" /><input type="number" name="shipping_cost" value={formData.shipping_cost} onChange={handleInputChange} min="0" className="input input-bordered w-full pl-10" placeholder="0" /></div>
                  </div>
                </div>

                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">Notes</span></label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3" className="textarea textarea-bordered w-full" placeholder="Notes supplémentaires..." />
                </div>

                <div className="bg-primary/5 rounded-xl p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>Sous-total:</span><span>{formatNumber(subtotal)} €</span></div>
                    {discount > 0 && <div className="flex justify-between text-warning"><span>Remise ({formData.discount_rate}%):</span><span>-{formatNumber(discount)} €</span></div>}
                    {formData.shipping_cost > 0 && <div className="flex justify-between"><span>Frais de livraison:</span><span>{formatNumber(formData.shipping_cost)} €</span></div>}
                    <div className="border-t border-primary/20 pt-2 mt-2"><div className="flex justify-between font-bold text-primary"><span>Total TTC:</span><span className="text-xl">{formatNumber(total)} €</span></div></div>
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <button onClick={handleBack} className="btn btn-outline gap-2"><ChevronLeft className="w-4 h-4" /> Retour</button>
                  <div className="flex gap-2">
                    <Link to="/ventes" className="btn btn-ghost">Annuler</Link>
                    <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary gap-2">
                      {submitting ? <span className="loading loading-spinner loading-sm"></span> : <Save className="w-4 h-4" />}
                      {submitting ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Créer')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Ajout Produit */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-gradient-to-r from-primary to-primary/80 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2"><Package className="h-6 w-6 text-white" /><h2 className="text-xl font-bold text-white">Ajouter un produit</h2></div>
              <button onClick={() => { setShowProductModal(false); setSelectedProduct(null); setProductSearch('') }} className="text-white hover:text-white/80"><X className="h-6 w-6" /></button>
            </div>
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 border-r border-base-200 p-4 overflow-y-auto max-h-[calc(90vh-70px)]">
                <div className="relative mb-3"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" /><input type="text" placeholder="Rechercher un produit..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="input input-bordered w-full pl-10" autoFocus /></div>
                <div className="space-y-2">
                  {filteredProducts.slice(0, 20).map(product => (
                    <button key={product.id} onClick={() => setSelectedProduct(product)} className={`w-full text-left p-3 rounded-lg border transition-all ${selectedProduct?.id === product.id ? 'border-primary bg-primary/10' : 'border-base-200 hover:border-primary/50'}`}>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-base-content/50">Réf: {product.reference} - Prix: {formatNumber(product.selling_price || product.purchase_price || 0)} €</div>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && productSearch && (
                    <div className="text-center py-4"><p className="text-base-content/50">Aucun produit trouvé</p></div>
                  )}
                </div>
              </div>
              <div className="w-full lg:w-80 p-4 bg-base-200/50">
                {selectedProduct ? (
                  <div className="space-y-3">
                    <div className="bg-base-100 rounded-lg p-3"><h4 className="font-bold">{selectedProduct.name}</h4><p className="text-xs text-base-content/50">Réf: {selectedProduct.reference}</p></div>
                    <div className="form-control"><label className="label"><span className="label-text font-medium">Quantité</span></label><input type="number" value={tempItem.quantity} onChange={(e) => setTempItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))} min="1" className="input input-bordered w-full" /></div>
                    <div className="form-control"><label className="label"><span className="label-text font-medium">Prix unitaire</span></label><input type="number" value={tempItem.unit_price} onChange={(e) => setTempItem(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))} min="0" step="1" className="input input-bordered w-full" /></div>
                    <div className="bg-primary/5 rounded-lg p-2"><div className="flex justify-between font-bold"><span>Total:</span><span>{formatNumber(tempItem.quantity * tempItem.unit_price)} €</span></div></div>
                    <button onClick={addItem} className="btn btn-primary w-full gap-2"><Plus className="w-4 h-4" /> Ajouter</button>
                  </div>
                ) : (
                  <div className="text-center py-8"><Package className="w-12 h-12 mx-auto text-base-content/20 mb-2" /><p className="text-base-content/50">Sélectionnez un produit</p></div>
                )}
              </div>
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

export default SaleForm