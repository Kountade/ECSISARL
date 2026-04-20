// src/components/inventory/StockForm.jsx
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
  Package,
  Warehouse,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  FileText,
  Hash,
  DollarSign,
  Calendar,
  Info
} from 'lucide-react'

const StockForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [errors, setErrors] = useState({})

  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [locations, setLocations] = useState([])
  const [fromLocations, setFromLocations] = useState([])
  const [toLocations, setToLocations] = useState([])

  const [formData, setFormData] = useState({
    product: '',
    variant: '',
    movement_type: 'in',
    reference_type: 'manual',
    quantity: 1,
    unit_price: '',
    from_warehouse: '',
    to_warehouse: '',
    from_location: '',
    to_location: '',
    movement_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const movementTypes = [
    { value: 'in', label: 'Entrée en stock', icon: TrendingUp, color: 'success' },
    { value: 'out', label: 'Sortie de stock', icon: TrendingDown, color: 'error' },
    { value: 'transfer', label: 'Transfert', icon: ArrowLeftRight, color: 'info' },
    { value: 'adjustment', label: 'Ajustement', icon: Package, color: 'warning' },
    { value: 'return', label: 'Retour fournisseur', icon: ArrowLeftRight, color: 'primary' },
    { value: 'return_customer', label: 'Retour client', icon: ArrowLeftRight, color: 'secondary' }
  ]

  const referenceTypes = [
    { value: 'manual', label: 'Manuel' },
    { value: 'purchase', label: 'Achat' },
    { value: 'sale', label: 'Vente' },
    { value: 'transfer', label: 'Transfert' },
    { value: 'inventory', label: 'Inventaire' },
    { value: 'production', label: 'Production' }
  ]

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsRes, warehousesRes, locationsRes] = await Promise.all([
        AxiosInstance.get('/products/'),
        AxiosInstance.get('/warehouses/'),
        AxiosInstance.get('/locations/')
      ])
      
      setProducts(productsRes.data)
      setWarehouses(warehousesRes.data)
      setLocations(locationsRes.data)

      if (isEditMode) {
        const movementRes = await AxiosInstance.get(`/stock-movements/${id}/`)
        const movement = movementRes.data
        
        setFormData({
          product: movement.product || '',
          variant: movement.variant || '',
          movement_type: movement.movement_type || 'in',
          reference_type: movement.reference_type || 'manual',
          quantity: movement.quantity || 1,
          unit_price: movement.unit_price || '',
          from_warehouse: movement.from_warehouse || '',
          to_warehouse: movement.to_warehouse || '',
          from_location: movement.from_location || '',
          to_location: movement.to_location || '',
          movement_date: movement.movement_date?.split('T')[0] || new Date().toISOString().split('T')[0],
          notes: movement.notes || ''
        })
      }
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  // Filtrer les emplacements selon l'entrepôt source
  useEffect(() => {
    if (formData.from_warehouse) {
      const filtered = locations.filter(l => l.warehouse === parseInt(formData.from_warehouse))
      setFromLocations(filtered)
    } else {
      setFromLocations([])
    }
  }, [formData.from_warehouse, locations])

  // Filtrer les emplacements selon l'entrepôt destination
  useEffect(() => {
    if (formData.to_warehouse) {
      const filtered = locations.filter(l => l.warehouse === parseInt(formData.to_warehouse))
      setToLocations(filtered)
    } else {
      setToLocations([])
    }
  }, [formData.to_warehouse, locations])

  // Mettre à jour le prix unitaire quand le produit change
  useEffect(() => {
    if (formData.product) {
      const selectedProduct = products.find(p => p.id === parseInt(formData.product))
      if (selectedProduct) {
        setFormData(prev => ({
          ...prev,
          unit_price: selectedProduct.purchase_price || 0
        }))
      }
    }
  }, [formData.product, products])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.product) {
      newErrors.product = 'Le produit est obligatoire'
    }
    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'La quantité doit être supérieure à 0'
    }
    if (!formData.unit_price || parseFloat(formData.unit_price) < 0) {
      newErrors.unit_price = 'Le prix unitaire doit être valide'
    }

    if (formData.movement_type === 'transfer') {
      if (!formData.from_warehouse) {
        newErrors.from_warehouse = 'L\'entrepôt source est obligatoire'
      }
      if (!formData.to_warehouse) {
        newErrors.to_warehouse = 'L\'entrepôt destination est obligatoire'
      }
      if (formData.from_warehouse && formData.to_warehouse && 
          formData.from_warehouse === formData.to_warehouse) {
        newErrors.to_warehouse = 'Les entrepôts doivent être différents'
      }
    } else if (formData.movement_type === 'in' || formData.movement_type === 'return') {
      if (!formData.to_warehouse) {
        newErrors.to_warehouse = 'L\'entrepôt de destination est obligatoire'
      }
    } else if (formData.movement_type === 'out' || formData.movement_type === 'return_customer') {
      if (!formData.from_warehouse) {
        newErrors.from_warehouse = 'L\'entrepôt source est obligatoire'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showNotification('Veuillez corriger les erreurs du formulaire', 'error')
      return
    }

    setSubmitting(true)
    
    try {
      const payload = {
        product: parseInt(formData.product),
        movement_type: formData.movement_type,
        reference_type: formData.reference_type,
        quantity: parseInt(formData.quantity),
        unit_price: parseFloat(formData.unit_price) || 0,
        movement_date: formData.movement_date,
        notes: formData.notes || ''
      }

      if (formData.variant) {
        payload.variant = parseInt(formData.variant)
      }
      if (formData.from_warehouse) {
        payload.from_warehouse = parseInt(formData.from_warehouse)
      }
      if (formData.to_warehouse) {
        payload.to_warehouse = parseInt(formData.to_warehouse)
      }
      if (formData.from_location) {
        payload.from_location = parseInt(formData.from_location)
      }
      if (formData.to_location) {
        payload.to_location = parseInt(formData.to_location)
      }

      if (isEditMode) {
        await AxiosInstance.put(`/stock-movements/${id}/`, payload)
        showNotification('Mouvement modifié avec succès', 'success')
      } else {
        await AxiosInstance.post('/stock-movements/', payload)
        showNotification('Mouvement créé avec succès', 'success')
      }
      
      setTimeout(() => navigate('/stocks'), 1500)
      
    } catch (error) {
      console.error('Erreur:', error)
      let errorMsg = 'Erreur lors de l\'enregistrement'
      
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMsg = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
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

  const getSelectedMovementType = () => {
    return movementTypes.find(t => t.value === formData.movement_type) || movementTypes[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  const selectedMovement = getSelectedMovementType()
  const MovementIcon = selectedMovement.icon

  return (
    <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6 p-3 lg:p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 lg:top-20 right-3 lg:right-6 z-50 animate-slideDown w-[calc(100%-1.5rem)] lg:w-auto max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            ) : (
              <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            )}
            <span className="text-sm lg:text-base font-medium">{notification.message}</span>
            <button 
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/stocks')}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-base-content">
              {isEditMode ? 'Modifier le mouvement' : 'Nouveau mouvement de stock'}
            </h1>
            <p className="text-xs lg:text-sm text-base-content/60">
              Enregistrez une entrée, sortie ou transfert de stock
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/stocks')}
            className="btn btn-outline btn-sm lg:btn-md gap-1 lg:gap-2"
          >
            <X className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Annuler</span>
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary btn-sm lg:btn-md gap-1 lg:gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                <span className="hidden sm:inline">Enregistrement...</span>
                <span className="sm:hidden">En cours...</span>
              </>
            ) : (
              <>
                <Save className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">{isEditMode ? 'Mettre à jour' : 'Enregistrer'}</span>
                <span className="sm:hidden">Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-base-100 rounded-xl lg:rounded-2xl shadow-sm border border-base-300 overflow-hidden">
          <div className={`p-4 lg:p-6 border-b border-base-300 bg-${selectedMovement.color}/10`}>
            <div className="flex items-center gap-2 lg:gap-3">
              <div className={`p-1.5 lg:p-2 bg-${selectedMovement.color}/20 rounded-lg`}>
                <MovementIcon className={`w-4 h-4 lg:w-5 lg:h-5 text-${selectedMovement.color}`} />
              </div>
              <h2 className="text-base lg:text-lg font-bold text-base-content">
                Informations du mouvement
              </h2>
            </div>
          </div>
          
          <div className="p-4 lg:p-6 space-y-4 lg:space-y-5">
            {/* Type de mouvement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm">
                    Type de mouvement <span className="text-error">*</span>
                  </span>
                </label>
                <div className="relative">
                  <select
                    name="movement_type"
                    value={formData.movement_type}
                    onChange={handleInputChange}
                    className={`select select-bordered select-sm lg:select-md w-full appearance-none ${errors.movement_type ? 'select-error' : ''}`}
                  >
                    {movementTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                </div>
              </div>

              <div className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm">Type de référence</span>
                </label>
                <div className="relative">
                  <select
                    name="reference_type"
                    value={formData.reference_type}
                    onChange={handleInputChange}
                    className="select select-bordered select-sm lg:select-md w-full appearance-none"
                  >
                    {referenceTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Produit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Produit <span className="text-error">*</span>
                  </span>
                </label>
                <div className="relative">
                  <select
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    className={`select select-bordered select-sm lg:select-md w-full appearance-none ${errors.product ? 'select-error' : ''}`}
                  >
                    <option value="">Sélectionner un produit</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.reference})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                </div>
                {errors.product && (
                  <label className="label pt-1">
                    <span className="label-text-alt text-error flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.product}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Quantité <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className={`input input-bordered input-sm lg:input-md w-full ${errors.quantity ? 'input-error' : ''}`}
                />
                {errors.quantity && (
                  <label className="label pt-1">
                    <span className="label-text-alt text-error flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.quantity}
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Prix et date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Prix unitaire (FCFA)
                  </span>
                </label>
                <input
                  type="number"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`input input-bordered input-sm lg:input-md w-full ${errors.unit_price ? 'input-error' : ''}`}
                />
                {errors.unit_price && (
                  <label className="label pt-1">
                    <span className="label-text-alt text-error flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.unit_price}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Date du mouvement
                  </span>
                </label>
                <input
                  type="date"
                  name="movement_date"
                  value={formData.movement_date}
                  onChange={handleInputChange}
                  className="input input-bordered input-sm lg:input-md w-full"
                />
              </div>
            </div>

            {/* Entrepôts selon le type de mouvement */}
            {(formData.movement_type === 'transfer') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm flex items-center gap-1">
                      <Warehouse className="w-3 h-3" />
                      Entrepôt source <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      name="from_warehouse"
                      value={formData.from_warehouse}
                      onChange={handleInputChange}
                      className={`select select-bordered select-sm lg:select-md w-full appearance-none ${errors.from_warehouse ? 'select-error' : ''}`}
                    >
                      <option value="">Sélectionner</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                  </div>
                  {errors.from_warehouse && (
                    <label className="label pt-1">
                      <span className="label-text-alt text-error">{errors.from_warehouse}</span>
                    </label>
                  )}
                </div>

                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm flex items-center gap-1">
                      <Warehouse className="w-3 h-3" />
                      Entrepôt destination <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      name="to_warehouse"
                      value={formData.to_warehouse}
                      onChange={handleInputChange}
                      className={`select select-bordered select-sm lg:select-md w-full appearance-none ${errors.to_warehouse ? 'select-error' : ''}`}
                    >
                      <option value="">Sélectionner</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                  </div>
                  {errors.to_warehouse && (
                    <label className="label pt-1">
                      <span className="label-text-alt text-error">{errors.to_warehouse}</span>
                    </label>
                  )}
                </div>
              </div>
            )}

            {(formData.movement_type === 'in' || formData.movement_type === 'return') && (
              <div className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm flex items-center gap-1">
                    <Warehouse className="w-3 h-3" />
                    Entrepôt de destination <span className="text-error">*</span>
                  </span>
                </label>
                <div className="relative">
                  <select
                    name="to_warehouse"
                    value={formData.to_warehouse}
                    onChange={handleInputChange}
                    className={`select select-bordered select-sm lg:select-md w-full appearance-none ${errors.to_warehouse ? 'select-error' : ''}`}
                  >
                    <option value="">Sélectionner</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                </div>
                {errors.to_warehouse && (
                  <label className="label pt-1">
                    <span className="label-text-alt text-error">{errors.to_warehouse}</span>
                  </label>
                )}
              </div>
            )}

            {(formData.movement_type === 'out' || formData.movement_type === 'return_customer') && (
              <div className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm flex items-center gap-1">
                    <Warehouse className="w-3 h-3" />
                    Entrepôt source <span className="text-error">*</span>
                  </span>
                </label>
                <div className="relative">
                  <select
                    name="from_warehouse"
                    value={formData.from_warehouse}
                    onChange={handleInputChange}
                    className={`select select-bordered select-sm lg:select-md w-full appearance-none ${errors.from_warehouse ? 'select-error' : ''}`}
                  >
                    <option value="">Sélectionner</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                </div>
                {errors.from_warehouse && (
                  <label className="label pt-1">
                    <span className="label-text-alt text-error">{errors.from_warehouse}</span>
                  </label>
                )}
              </div>
            )}

            {/* Emplacements (optionnels) */}
            {formData.from_warehouse && fromLocations.length > 0 && (
              <div className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm">Emplacement source</span>
                </label>
                <div className="relative">
                  <select
                    name="from_location"
                    value={formData.from_location}
                    onChange={handleInputChange}
                    className="select select-bordered select-sm lg:select-md w-full appearance-none"
                  >
                    <option value="">Sélectionner un emplacement</option>
                    {fromLocations.map(l => (
                      <option key={l.id} value={l.id}>{l.code} - {l.description || ''}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                </div>
              </div>
            )}

            {formData.to_warehouse && toLocations.length > 0 && (
              <div className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm">Emplacement destination</span>
                </label>
                <div className="relative">
                  <select
                    name="to_location"
                    value={formData.to_location}
                    onChange={handleInputChange}
                    className="select select-bordered select-sm lg:select-md w-full appearance-none"
                  >
                    <option value="">Sélectionner un emplacement</option>
                    {toLocations.map(l => (
                      <option key={l.id} value={l.id}>{l.code} - {l.description || ''}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="form-control w-full">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Notes
                </span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Informations complémentaires..."
                className="textarea textarea-bordered text-sm w-full h-24"
              />
            </div>

            {/* Information */}
            <div className="alert alert-info mt-4">
              <Info className="w-4 h-4" />
              <span className="text-sm">
                Total du mouvement : <strong>{formatCurrency(formData.quantity * (formData.unit_price || 0))}</strong>
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* Barre d'actions flottante pour mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 p-3 shadow-lg z-40">
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/stocks')}
            className="btn btn-outline btn-sm flex-1"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary btn-sm flex-1"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                En cours...
              </>
            ) : (
              <>
                <Save className="w-3 h-3" />
                {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Fonction utilitaire pour le formatage
const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num) + ' FCFA'
}

// Ajouter l'icône ChevronDown manquante
const ChevronDown = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
)

export default StockForm