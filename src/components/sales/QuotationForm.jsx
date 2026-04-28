// src/components/sales/QuotationForm.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Users,
  Calendar,
  Package,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Printer,
  Send,
  Save as SaveIcon,
  RefreshCw,
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Clock,
  UserCheck,
  Percent,
  Truck,
  Info
} from 'lucide-react'

const QuotationForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [searchProduct, setSearchProduct] = useState('')
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null)

  const [formData, setFormData] = useState({
    customer: '',
    valid_until: '',
    notes: '',
    terms_conditions: '',
    discount_rate: 0,
    shipping_cost: 0,
    items: []
  })

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(number)
  }

  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [customersRes, productsRes] = await Promise.all([
        AxiosInstance.get('/customers/'),
        AxiosInstance.get('/products/')
      ])
      setCustomers(customersRes.data || [])
      setProducts(productsRes.data || [])

      if (isEditMode) {
        const quotationRes = await AxiosInstance.get(`/quotations/${id}/`)
        const q = quotationRes.data
        setFormData({
          customer: q.customer?.id?.toString() || '',
          valid_until: formatDateForInput(q.valid_until) || '',
          notes: q.notes || '',
          terms_conditions: q.terms_conditions || '',
          discount_rate: q.discount_rate || 0,
          shipping_cost: q.shipping_cost || 0,
          items: q.items?.map(item => ({
            id: item.id,
            product: item.product?.id?.toString() || '',
            product_name: item.product_name || '',
            product_reference: item.product_reference || '',
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
            total: item.total || 0
          })) || []
        })
        
        if (q.customer?.id) {
          const customerDetails = customersRes.data?.find(c => c.id === q.customer.id)
          setSelectedCustomerDetails(customerDetails)
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
  }, [id])

  const handleCustomerChange = (customerId) => {
    setFormData({ ...formData, customer: customerId })
    const customer = customers.find(c => c.id === parseInt(customerId))
    setSelectedCustomerDetails(customer)
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { 
        product: '', 
        product_name: '', 
        product_reference: '', 
        quantity: 1, 
        unit_price: 0, 
        total: 0 
      }]
    })
  }

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items]
    
    if (field === 'product') {
      newItems[index].product = value
      const product = products.find(p => p.id === parseInt(value))
      if (product) {
        newItems[index].product_name = product.name
        newItems[index].product_reference = product.reference
        newItems[index].unit_price = product.sale_price || product.price || 0
      }
    } else if (field === 'quantity') {
      newItems[index].quantity = parseInt(value) || 0
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

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.total || 0), 0)
  }

  const calculateDiscount = () => {
    return calculateSubtotal() * (formData.discount_rate / 100)
  }

  const calculateTax = () => {
    return (calculateSubtotal() - calculateDiscount()) * 0.2
  }

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax() + (formData.shipping_cost || 0)
  }

  const validateStep = (step) => {
    if (step === 0) {
      if (!formData.customer) {
        showNotification('Veuillez sélectionner un client', 'error')
        return false
      }
      if (!formData.valid_until) {
        showNotification('Veuillez saisir une date de validité', 'error')
        return false
      }
      return true
    }
    if (step === 1) {
      if (formData.items.length === 0) {
        showNotification('Ajoutez au moins un produit', 'error')
        return false
      }
      const hasEmptyProduct = formData.items.some(item => !item.product)
      if (hasEmptyProduct) {
        showNotification('Veuillez sélectionner un produit pour chaque ligne', 'error')
        return false
      }
      const hasInvalidQuantity = formData.items.some(item => item.quantity <= 0)
      if (hasInvalidQuantity) {
        showNotification('Les quantités doivent être supérieures à 0', 'error')
        return false
      }
      const hasInvalidPrice = formData.items.some(item => item.unit_price <= 0)
      if (hasInvalidPrice) {
        showNotification('Les prix unitaires doivent être supérieurs à 0', 'error')
        return false
      }
      return true
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(activeStep - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(1)) return

    setSubmitting(true)
    const dataToSend = {
      customer: parseInt(formData.customer),
      valid_until: formData.valid_until,
      notes: formData.notes || '',
      terms_conditions: formData.terms_conditions || '',
      discount_rate: formData.discount_rate || 0,
      shipping_cost: formData.shipping_cost || 0,
      items: formData.items.map(item => ({
        product: parseInt(item.product),
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price),
        discount_rate: 0,
        tax_rate: 20
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
      console.error('Error saving quotation:', error)
      let errorMsg = "Erreur lors de l'enregistrement"
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error
      } else if (typeof error.response?.data === 'object') {
        const errors = []
        for (const [field, messages] of Object.entries(error.response.data)) {
          if (Array.isArray(messages)) errors.push(`${field}: ${messages.join(', ')}`)
          else errors.push(`${field}: ${messages}`)
        }
        errorMsg = errors.join('\n')
      }
      showNotification(errorMsg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.reference?.toLowerCase().includes(searchProduct.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12"></div>
          <p className="text-base font-semibold text-gray-600">Chargement du formulaire...</p>
        </div>
      </div>
    )
  }

  const subtotal = calculateSubtotal()
  const discount = calculateDiscount()
  const tax = calculateTax()
  const shipping = formData.shipping_cost || 0
  const total = calculateTotal()

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-xl text-sm min-w-[300px]`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="font-medium">{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      {/* Header - sans gradient */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/devis" className="btn btn-ghost btn-sm gap-2">
                <ArrowLeft className="w-4 h-4" /> Retour
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                  {isEditMode ? 'Modifier le devis' : 'Nouveau devis'}
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  {isEditMode ? 'Modifiez les informations du document' : 'Créez un document professionnel pour votre client'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => window.location.reload()} className="btn btn-outline btn-sm gap-2">
                <RefreshCw className="w-4 h-4" /> Actualiser
              </button>
              <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary btn-sm gap-2 shadow-sm">
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditMode ? 'Mettre à jour' : 'Créer le devis'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal - 100% large */}
      <div className="max-w-full mx-auto px-6 py-6 w-full">
        
        {/* Progress Steps - Style sobre */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className={`flex items-center gap-3 ${activeStep >= 0 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${activeStep >= 0 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                  1
                </div>
                <div>
                  <p className="text-xs text-gray-500">Étape 1</p>
                  <p className="font-semibold">Client & Validité</p>
                </div>
              </div>
              <div className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${activeStep >= 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              
              <div className={`flex items-center gap-3 ${activeStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${activeStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </div>
                <div>
                  <p className="text-xs text-gray-500">Étape 2</p>
                  <p className="font-semibold">Articles & Prix</p>
                </div>
              </div>
              <div className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${activeStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              
              <div className={`flex items-center gap-3 ${activeStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${activeStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                  3
                </div>
                <div>
                  <p className="text-xs text-gray-500">Étape 3</p>
                  <p className="font-semibold">Finalisation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Informations générales */}
        {activeStep === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-8 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                Informations générales
              </h2>
              <p className="text-sm text-gray-500 mt-1 ml-14">Identifiez le client et définissez la validité du devis</p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Colonne gauche */}
                <div className="space-y-6">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-gray-700">Client <span className="text-error">*</span></span>
                    </label>
                    <select
                      className="select select-bordered w-full h-12 bg-gray-50 focus:bg-white transition-colors"
                      value={formData.customer}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                    >
                      <option value="">Sélectionner un client</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.full_name || c.company_name || c.name} - {c.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-gray-700">Date de validité <span className="text-error">*</span></span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        className="input input-bordered w-full pl-10 h-12 bg-gray-50 focus:bg-white"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Le devis expirera après cette date</p>
                  </div>
                </div>

                {/* Colonne droite - Infos client sélectionné */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary" />
                    Informations client
                  </h3>
                  {selectedCustomerDetails ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{selectedCustomerDetails.full_name || selectedCustomerDetails.company_name}</p>
                          {selectedCustomerDetails.email && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Mail className="w-3 h-3" /> {selectedCustomerDetails.email}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedCustomerDetails.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600">{selectedCustomerDetails.phone}</p>
                        </div>
                      )}
                      {selectedCustomerDetails.address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-600">{selectedCustomerDetails.address}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-400">Aucun client sélectionné</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-4 border-t border-gray-100">
                <button
                  onClick={handleNext}
                  disabled={!formData.customer || !formData.valid_until}
                  className="btn btn-primary px-8 py-3 gap-3 shadow-sm disabled:opacity-50"
                >
                  Étape suivante <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Articles */}
        {activeStep === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-8 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                Articles et prestations
              </h2>
              <p className="text-sm text-gray-500 mt-1 ml-14">Ajoutez les produits ou services facturés</p>
            </div>

            <div className="p-8">
              {/* Barre de recherche produits */}
              <div className="mb-6 flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un produit par nom ou référence..."
                    className="input input-bordered w-full pl-10 h-11"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                  />
                </div>
                <button onClick={addItem} className="btn btn-primary gap-2 px-6">
                  <Plus className="w-4 h-4" /> Nouvel article
                </button>
              </div>

              {/* Tableau des articles */}
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
                      <th className="text-sm font-semibold py-3">Produit / Service</th>
                      <th className="text-sm font-semibold text-center w-24">Qté</th>
                      <th className="text-sm font-semibold text-right w-32">Prix unitaire</th>
                      <th className="text-sm font-semibold text-right w-32">Total HT</th>
                      <th className="text-sm font-semibold text-center w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-12">
                          <Package className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                          <p className="text-gray-400 font-medium">Aucun article ajouté</p>
                          <p className="text-sm text-gray-400 mt-1">Cliquez sur "Nouvel article" pour commencer</p>
                        </td>
                      </tr>
                    ) : (
                      formData.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                          <td className="py-3">
                            <select
                              className="select select-bordered w-full max-w-md"
                              value={item.product}
                              onChange={(e) => updateItem(idx, 'product', e.target.value)}
                            >
                              <option value="">Sélectionner un produit</option>
                              {filteredProducts.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.reference})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="text-center">
                            <input
                              type="number"
                              className="input input-bordered w-20 text-center"
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                              min="1"
                            />
                          </td>
                          <td className="text-right">
                            <div className="relative inline-block">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">FCFA</span>
                              <input
                                type="number"
                                className="input input-bordered w-32 pl-14 text-right"
                                value={item.unit_price}
                                onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                                min="0"
                                step="1"
                              />
                            </div>
                          </td>
                          <td className="text-right">
                            <span className="font-semibold text-primary">{formatNumber(item.total)} FCFA</span>
                          </td>
                          <td className="text-center">
                            <button onClick={() => removeItem(idx)} className="btn btn-ghost btn-sm text-error">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Résumé rapide */}
              {formData.items.length > 0 && (
                <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total HT des articles</span>
                    <span className="font-semibold text-lg">{formatNumber(subtotal)} FCFA</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
                <button onClick={handleBack} className="btn btn-outline px-8 gap-2">
                  <ChevronLeft className="w-4 h-4" /> Retour
                </button>
                <button
                  onClick={handleNext}
                  disabled={formData.items.length === 0}
                  className="btn btn-primary px-8 py-3 gap-3 shadow-sm disabled:opacity-50"
                >
                  Étape suivante <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Finalisation */}
        {activeStep === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-8 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                Finalisation du devis
              </h2>
              <p className="text-sm text-gray-500 mt-1 ml-14">Ajoutez les conditions et vérifiez les montants</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Colonne gauche - Notes et conditions */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-gray-700">Notes internes</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-28 bg-gray-50 focus:bg-white"
                      name="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Informations complémentaires visibles sur le devis..."
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-gray-700">Conditions générales</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-32 bg-gray-50 focus:bg-white"
                      name="terms_conditions"
                      value={formData.terms_conditions}
                      onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                      placeholder="Conditions de vente, garanties, délais de livraison, pénalités de retard..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold text-gray-700 flex items-center gap-2">
                          <Percent className="w-4 h-4" /> Remise (%)
                        </span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered"
                        value={formData.discount_rate}
                        onChange={(e) => setFormData({ ...formData, discount_rate: parseFloat(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        step="1"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold text-gray-700 flex items-center gap-2">
                          <Truck className="w-4 h-4" /> Frais de livraison (FCFA)
                        </span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered"
                        value={formData.shipping_cost}
                        onChange={(e) => setFormData({ ...formData, shipping_cost: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="100"
                      />
                    </div>
                  </div>
                </div>

                {/* Colonne droite - Récapitulatif financier */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-5 pb-3 border-b border-gray-200 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Récapitulatif
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total HT</span>
                      <span className="font-semibold">{formatNumber(subtotal)} FCFA</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="flex items-center gap-1">Remise ({formData.discount_rate}%)</span>
                        <span>- {formatNumber(discount)} FCFA</span>
                      </div>
                    )}
                    
                    {shipping > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Frais de livraison</span>
                        <span>{formatNumber(shipping)} FCFA</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">TVA (20%)</span>
                      <span>{formatNumber(tax)} FCFA</span>
                    </div>
                    
                    <div className="border-t-2 border-dashed border-gray-300 pt-4 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800">Total TTC</span>
                        <span className="text-2xl font-bold text-primary">{formatNumber(total)} FCFA</span>
                      </div>
                    </div>

                    <div className="bg-primary/5 rounded-lg p-3 mt-4 flex items-start gap-2">
                      <Info className="w-4 h-4 text-primary mt-0.5" />
                      <p className="text-xs text-gray-600">Le devis est valable 30 jours à compter de la date d'émission. Les prix s'entendent hors taxes.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
                <button onClick={handleBack} className="btn btn-outline px-8 gap-2">
                  <ChevronLeft className="w-4 h-4" /> Retour
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn btn-primary px-10 py-3 gap-3 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="w-5 h-5" />
                      {isEditMode ? 'Mettre à jour le devis' : 'Créer le devis'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
        
        /* Scrollbar personnalisée */
        .overflow-x-auto::-webkit-scrollbar {
          height: 6px;
        }
        .overflow-x-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  )
}

export default QuotationForm