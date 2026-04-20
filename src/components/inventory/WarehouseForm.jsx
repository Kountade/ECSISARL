// src/components/entrepots/WarehouseForm.jsx
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
  Warehouse,
  MapPin,
  Phone,
  Mail,
  Globe,
  Hash,
  Building2,
  User,
  Info
} from 'lucide-react'

const WarehouseForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [errors, setErrors] = useState({})
  const [managers, setManagers] = useState([])

  const WAREHOUSE_TYPES = [
    { value: 'main', label: 'Entrepôt principal', color: 'primary' },
    { value: 'secondary', label: 'Entrepôt secondaire', color: 'secondary' },
    { value: 'store', label: 'Magasin', color: 'accent' },
    { value: 'transit', label: 'Zone de transit', color: 'info' },
    { value: 'returns', label: 'Zone de retour', color: 'warning' },
    { value: 'quarantine', label: 'Zone de quarantaine', color: 'error' }
  ]

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    warehouse_type: 'main',
    address: '',
    city: '',
    postal_code: '',
    country: 'Sénégal',
    phone: '',
    email: '',
    manager: '',
    is_active: true,
    is_default: false
  })

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const usersRes = await AxiosInstance.get('/users/')
      setManagers(usersRes.data || [])

      if (isEditMode) {
        const warehouseRes = await AxiosInstance.get(`/warehouses/${id}/`)
        const warehouse = warehouseRes.data
        setFormData({
          code: warehouse.code || '',
          name: warehouse.name || '',
          warehouse_type: warehouse.warehouse_type || 'main',
          address: warehouse.address || '',
          city: warehouse.city || '',
          postal_code: warehouse.postal_code || '',
          country: warehouse.country || 'Sénégal',
          phone: warehouse.phone || '',
          email: warehouse.email || '',
          manager: warehouse.manager || '',
          is_active: warehouse.is_active !== undefined ? warehouse.is_active : true,
          is_default: warehouse.is_default || false
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

  const validateForm = () => {
    const newErrors = {}

    if (!formData.code || formData.code.trim() === '') {
      newErrors.code = 'Le code est obligatoire'
    } else if (formData.code.length < 2) {
      newErrors.code = 'Le code doit contenir au moins 2 caractères'
    }

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Le nom est obligatoire'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      const dataToSend = {
        ...formData,
        code: formData.code.trim(),
        name: formData.name.trim(),
        address: formData.address?.trim() || '',
        city: formData.city?.trim() || '',
        postal_code: formData.postal_code?.trim() || '',
        phone: formData.phone?.trim() || '',
        email: formData.email?.trim() || '',
        manager: formData.manager || null
      }

      if (isEditMode) {
        await AxiosInstance.put(`/warehouses/${id}/`, dataToSend)
        showNotification('Entrepôt modifié avec succès', 'success')
      } else {
        await AxiosInstance.post('/warehouses/', dataToSend)
        showNotification('Entrepôt créé avec succès', 'success')
      }
      
      setTimeout(() => navigate('/entrepots'), 1500)
      
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

  const getSelectedTypeColor = () => {
    const type = WAREHOUSE_TYPES.find(t => t.value === formData.warehouse_type)
    return type?.color || 'primary'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  const selectedTypeColor = getSelectedTypeColor()

  return (
    <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6 p-3 lg:p-6">
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
            onClick={() => navigate('/entrepots')}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-base-content flex items-center gap-2">
              <Warehouse className={`w-6 h-6 lg:w-7 lg:h-7 text-${selectedTypeColor}`} />
              {isEditMode ? 'Modifier l\'entrepôt' : 'Nouvel entrepôt'}
            </h1>
            <p className="text-xs lg:text-sm text-base-content/60">
              {isEditMode ? 'Modifiez les informations de l\'entrepôt' : 'Ajoutez un nouveau lieu de stockage'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/entrepots')}
            className="btn btn-outline btn-sm lg:btn-md gap-1 lg:gap-2"
          >
            <X className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Annuler</span>
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className={`btn btn-${selectedTypeColor} btn-sm lg:btn-md gap-1 lg:gap-2`}
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
                <span className="hidden sm:inline">{isEditMode ? 'Mettre à jour' : 'Créer'}</span>
                <span className="sm:hidden">Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Layout en grille 2 colonnes pour tout afficher sans scroll */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          
          {/* COLONNE GAUCHE */}
          <div className="space-y-4 lg:space-y-6">
            {/* Identification */}
            <div className="bg-base-100 rounded-xl lg:rounded-2xl shadow-sm border border-base-300 overflow-hidden">
              <div className={`p-3 lg:p-4 border-b border-base-300 bg-${selectedTypeColor}/10`}>
                <div className="flex items-center gap-2">
                  <Hash className={`w-4 h-4 lg:w-5 lg:h-5 text-${selectedTypeColor}`} />
                  <h2 className="text-sm lg:text-base font-bold text-base-content">Identification</h2>
                </div>
              </div>
              
              <div className="p-3 lg:p-4 space-y-3">
                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-xs lg:text-sm">
                      Code <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Ex: WH-001"
                    className={`input input-bordered input-sm w-full ${errors.code ? 'input-error' : ''}`}
                  />
                  {errors.code && (
                    <label className="label pt-1">
                      <span className="label-text-alt text-error text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.code}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-xs lg:text-sm">
                      Nom <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Entrepôt Principal Dakar"
                    className={`input input-bordered input-sm w-full ${errors.name ? 'input-error' : ''}`}
                  />
                  {errors.name && (
                    <label className="label pt-1">
                      <span className="label-text-alt text-error text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.name}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-xs lg:text-sm flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Type d'entrepôt
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      name="warehouse_type"
                      value={formData.warehouse_type}
                      onChange={handleInputChange}
                      className="select select-bordered select-sm w-full appearance-none"
                    >
                      {WAREHOUSE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div className="bg-base-100 rounded-xl lg:rounded-2xl shadow-sm border border-base-300 overflow-hidden">
              <div className={`p-3 lg:p-4 border-b border-base-300 bg-${selectedTypeColor}/10`}>
                <div className="flex items-center gap-2">
                  <MapPin className={`w-4 h-4 lg:w-5 lg:h-5 text-${selectedTypeColor}`} />
                  <h2 className="text-sm lg:text-base font-bold text-base-content">Adresse</h2>
                </div>
              </div>
              
              <div className="p-3 lg:p-4 space-y-3">
                <div className="form-control w-full">
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Adresse complète"
                    className="textarea textarea-bordered text-sm w-full h-16"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="form-control w-full">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Ville"
                      className="input input-bordered input-sm w-full"
                    />
                  </div>
                  <div className="form-control w-full">
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      placeholder="Code postal"
                      className="input input-bordered input-sm w-full"
                    />
                  </div>
                </div>

                <div className="form-control w-full">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-base-content/40" />
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Pays"
                      className="input input-bordered input-sm w-full pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE */}
          <div className="space-y-4 lg:space-y-6">
            {/* Contact */}
            <div className="bg-base-100 rounded-xl lg:rounded-2xl shadow-sm border border-base-300 overflow-hidden">
              <div className={`p-3 lg:p-4 border-b border-base-300 bg-${selectedTypeColor}/10`}>
                <div className="flex items-center gap-2">
                  <Phone className={`w-4 h-4 lg:w-5 lg:h-5 text-${selectedTypeColor}`} />
                  <h2 className="text-sm lg:text-base font-bold text-base-content">Contact</h2>
                </div>
              </div>
              
              <div className="p-3 lg:p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="form-control w-full">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-base-content/40" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Téléphone"
                        className="input input-bordered input-sm w-full pl-9"
                      />
                    </div>
                  </div>
                  <div className="form-control w-full">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-base-content/40" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        className={`input input-bordered input-sm w-full pl-9 ${errors.email ? 'input-error' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <label className="label pt-1">
                        <span className="label-text-alt text-error text-xs">{errors.email}</span>
                      </label>
                    )}
                  </div>
                </div>

                <div className="form-control w-full">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-base-content/40 z-10" />
                    <select
                      name="manager"
                      value={formData.manager}
                      onChange={handleInputChange}
                      className="select select-bordered select-sm w-full pl-9 appearance-none"
                    >
                      <option value="">Aucun responsable</option>
                      {managers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.email}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="bg-base-100 rounded-xl lg:rounded-2xl shadow-sm border border-base-300 overflow-hidden">
              <div className={`p-3 lg:p-4 border-b border-base-300 bg-${selectedTypeColor}/10`}>
                <h2 className="text-sm lg:text-base font-bold text-base-content">Options</h2>
              </div>
              
              <div className="p-3 lg:p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="label cursor-pointer p-0 gap-2">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="toggle toggle-success toggle-sm"
                      />
                      <span className="label-text font-medium text-xs lg:text-sm">Entrepôt actif</span>
                    </label>
                    <p className="text-xs text-base-content/50 mt-1 ml-8">
                      Visible dans les sélections
                    </p>
                  </div>
                  
                  <div>
                    <label className="label cursor-pointer p-0 gap-2">
                      <input
                        type="checkbox"
                        name="is_default"
                        checked={formData.is_default}
                        onChange={handleInputChange}
                        className="toggle toggle-warning toggle-sm"
                      />
                      <span className="label-text font-medium text-xs lg:text-sm">Par défaut</span>
                    </label>
                    <p className="text-xs text-base-content/50 mt-1 ml-8">
                      Sélectionné par défaut
                    </p>
                  </div>
                </div>

                {/* Résumé compact */}
                <div className="bg-base-200 rounded-lg p-3">
                  <h3 className="font-semibold text-xs mb-2">Résumé</h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <span className="text-base-content/60">Code:</span>
                    <span className="font-mono truncate">{formData.code || '-'}</span>
                    <span className="text-base-content/60">Nom:</span>
                    <span className="truncate">{formData.name || '-'}</span>
                    <span className="text-base-content/60">Type:</span>
                    <span className={`text-${selectedTypeColor} truncate`}>
                      {WAREHOUSE_TYPES.find(t => t.value === formData.warehouse_type)?.label || '-'}
                    </span>
                    <span className="text-base-content/60">Ville:</span>
                    <span className="truncate">{formData.city || '-'}</span>
                  </div>
                </div>

                {/* Info */}
                <div className={`alert py-2 bg-${selectedTypeColor}/10 border border-${selectedTypeColor}/20`}>
                  <Info className={`w-3 h-3 text-${selectedTypeColor}`} />
                  <span className="text-xs">Un seul entrepôt peut être défini comme défaut.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Barre d'actions flottante pour mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 p-3 shadow-lg z-40">
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/entrepots')}
            className="btn btn-outline btn-sm flex-1"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className={`btn btn-${selectedTypeColor} btn-sm flex-1`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                En cours...
              </>
            ) : (
              <>
                <Save className="w-3 h-3" />
                {isEditMode ? 'Mettre à jour' : 'Créer'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Ajouter l'icône ChevronDown manquante
const ChevronDown = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
)

export default WarehouseForm