// src/components/UserForm.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Save,
  X,
  Upload,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader2,
  User,
  Building2,
  Lock,
  Mail,
  Phone,
  MapPin,
  Home,
  Flag,
  Hash,
  Calendar,
  FileText,
  DollarSign,
  Briefcase,
  Image as ImageIcon,
  Trash2,
  ChevronDown,
  AtSign,
  Shield,
  Award
} from 'lucide-react'

const ROLE_CHOICES = [
  { value: 'super_admin', label: 'Administrateur général', icon: Shield },
  { value: 'commercial', label: 'Commercial', icon: Award }
]

const DEPARTMENT_CHOICES = [
  'direction', 'administration', 'comptabilite', 'rh', 'commercial', 'ventes',
  'achats', 'magasin', 'logistique', 'technique', 'marketing', 'informatique'
]

const CONTRACT_TYPES = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Intérim']

const UserForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    email: '', username: '', role: 'commercial', department: '', phone: '', address: '', city: '',
    country: 'France', postal_code: '', employee_id: '', hire_date: '', contract_type: '', salary: '',
    is_active: true, profile_picture: null, password: '', password_confirm: ''
  })

  const [imagePreview, setImagePreview] = useState(null)

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    if (!isEditMode) return
    setLoading(true)
    try {
      const res = await AxiosInstance.get(`/users/${id}/`)
      const user = res.data
      setFormData({
        email: user.email || '', username: user.username || '', role: user.role || 'commercial',
        department: user.department || '', phone: user.phone || '', address: user.address || '',
        city: user.city || '', country: user.country || 'France', postal_code: user.postal_code || '',
        employee_id: user.employee_id || '', hire_date: user.hire_date || '', contract_type: user.contract_type || '',
        salary: user.salary || '', is_active: user.is_active !== undefined ? user.is_active : true,
        profile_picture: user.profile_picture || null, password: '', password_confirm: ''
      })
      if (user.profile_picture) setImagePreview(user.profile_picture)
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

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'L\'email est obligatoire'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
    }
    
    if (!isEditMode && !formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire'
    }
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }
    
    if (formData.password && formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Les mots de passe ne correspondent pas'
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

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFile = (file) => {
    if (!file.type.match('image.*')) {
      showNotification('Veuillez sélectionner une image (JPG, PNG, GIF, WebP)', 'error')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showNotification('L\'image ne doit pas dépasser 5MB', 'error')
      return
    }
    
    setFormData(prev => ({ ...prev, profile_picture: file }))
    setImagePreview(URL.createObjectURL(file))
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, profile_picture: null }))
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showNotification('Veuillez corriger les erreurs du formulaire', 'error')
      return
    }

    setSubmitting(true)
    try {
      const payload = new FormData()
      Object.keys(formData).forEach(key => {
        if (key === 'password_confirm') return
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === 'profile_picture' && formData[key] instanceof File) {
            payload.append(key, formData[key])
          } else if (formData[key] !== '') {
            payload.append(key, formData[key])
          }
        }
      })

      if (isEditMode) {
        await AxiosInstance.put(`/users/${id}/`, payload)
        showNotification('Utilisateur modifié avec succès', 'success')
      } else {
        await AxiosInstance.post('/register/', payload)
        showNotification('Utilisateur créé avec succès', 'success')
      }
      setTimeout(() => navigate('/utilisateurs'), 1500)
    } catch (error) {
      console.error(error)
      let errorMsg = 'Erreur lors de l\'enregistrement'
      if (error.response?.data) {
        errorMsg = Object.entries(error.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ')
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

  const tabs = [
    { id: 'general', label: 'Informations générales', icon: User },
    { id: 'professional', label: 'Professionnel', icon: Briefcase },
    { id: 'security', label: 'Sécurité', icon: Lock }
  ]

  return (
    <div className="space-y-4 lg:space-y-6 p-3 lg:p-6">
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
            onClick={() => navigate('/utilisateurs')}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-base-content">
              {isEditMode ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </h1>
            <p className="text-xs lg:text-sm text-base-content/60">
              {isEditMode ? 'Modifiez les informations du compte' : 'Créez un nouveau compte utilisateur'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/utilisateurs')}
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
                <span className="hidden sm:inline">{isEditMode ? 'Mettre à jour' : 'Créer'}</span>
                <span className="sm:hidden">Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-100 p-1 rounded-xl shadow-sm border border-base-300">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`tab gap-2 text-sm lg:text-base ${activeTab === tab.id ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Tab: Informations générales */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="lg:col-span-2">
              <div className="bg-base-100 rounded-xl lg:rounded-2xl shadow-sm border border-base-300 overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-base-300 bg-base-200/50">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="p-1.5 lg:p-2 bg-primary/10 rounded-lg">
                      <User className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                    </div>
                    <h2 className="text-base lg:text-lg font-bold text-base-content">
                      Identité
                    </h2>
                  </div>
                </div>
                
                <div className="p-4 lg:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control w-full">
                      <label className="label pb-1">
                        <span className="label-text font-medium text-sm flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          Email <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="exemple@ecsi.fr"
                        className={`input input-bordered input-sm lg:input-md w-full ${errors.email ? 'input-error' : ''}`}
                      />
                      {errors.email && (
                        <label className="label pt-1">
                          <span className="label-text-alt text-error flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.email}
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="form-control w-full">
                      <label className="label pb-1">
                        <span className="label-text font-medium text-sm flex items-center gap-1">
                          <AtSign className="w-3 h-3" />
                          Nom d'utilisateur
                        </span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="prenom.nom"
                        className="input input-bordered input-sm lg:input-md w-full"
                      />
                    </div>

                    <div className="form-control w-full">
                      <label className="label pb-1">
                        <span className="label-text font-medium text-sm flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          Téléphone
                        </span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+33 6 12 34 56 78"
                        className="input input-bordered input-sm lg:input-md w-full"
                      />
                    </div>
                  </div>

                  <div className="form-control w-full">
                    <label className="label pb-1">
                      <span className="label-text font-medium text-sm flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        Adresse
                      </span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 rue Example"
                      className="textarea textarea-bordered text-sm w-full h-20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="form-control w-full">
                      <label className="label pb-1">
                        <span className="label-text font-medium text-sm">Ville</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Paris"
                        className="input input-bordered input-sm lg:input-md w-full"
                      />
                    </div>

                    <div className="form-control w-full">
                      <label className="label pb-1">
                        <span className="label-text font-medium text-sm">Code postal</span>
                      </label>
                      <input
                        type="text"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        placeholder="75001"
                        className="input input-bordered input-sm lg:input-md w-full"
                      />
                    </div>

                    <div className="form-control w-full">
                      <label className="label pb-1">
                        <span className="label-text font-medium text-sm flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          Pays
                        </span>
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="France"
                        className="input input-bordered input-sm lg:input-md w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-base-100 rounded-xl lg:rounded-2xl shadow-sm border border-base-300 overflow-hidden lg:sticky lg:top-20">
                <div className="p-4 lg:p-6 border-b border-base-300 bg-base-200/50">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="p-1.5 lg:p-2 bg-secondary/10 rounded-lg">
                      <ImageIcon className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
                    </div>
                    <h2 className="text-base lg:text-lg font-bold text-base-content">
                      Photo de profil
                    </h2>
                  </div>
                </div>
                
                <div className="p-4 lg:p-6">
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`
                      relative border-2 border-dashed rounded-xl p-4 lg:p-6 text-center transition-all duration-200
                      ${dragActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-base-300 hover:border-primary/50 bg-base-200/30'
                      }
                    `}
                  >
                    {imagePreview ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Aperçu"
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 btn btn-error btn-circle btn-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-base-content/60">
                          Cliquez ou déposez pour changer
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                          <User className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-sm lg:text-base font-medium mb-1">
                          Ajouter une photo
                        </p>
                        <p className="text-xs text-base-content/60 mb-3">
                          Glissez-déposez ou cliquez
                        </p>
                        <button
                          type="button"
                          onClick={() => document.getElementById('profile-picture-input').click()}
                          className="btn btn-outline btn-xs lg:btn-sm gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          Parcourir
                        </button>
                      </>
                    )}
                    
                    <input
                      id="profile-picture-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-base-content/60">
                      <CheckCircle className="w-3 h-3 text-success" />
                      <span>JPG, PNG, GIF, WebP</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-base-content/60">
                      <CheckCircle className="w-3 h-3 text-success" />
                      <span>Taille max: 5 MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Informations professionnelles */}
        {activeTab === 'professional' && (
          <div className="bg-base-100 rounded-xl lg:rounded-2xl shadow-sm border border-base-300 overflow-hidden">
            <div className="p-4 lg:p-6 border-b border-base-300 bg-base-200/50">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="p-1.5 lg:p-2 bg-info/10 rounded-lg">
                  <Briefcase className="w-4 h-4 lg:w-5 lg:h-5 text-info" />
                </div>
                <h2 className="text-base lg:text-lg font-bold text-base-content">
                  Informations professionnelles
                </h2>
              </div>
            </div>
            
            <div className="p-4 lg:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Rôle
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="select select-bordered select-sm lg:select-md w-full appearance-none"
                    >
                      {ROLE_CHOICES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                  </div>
                </div>

                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Département
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="select select-bordered select-sm lg:select-md w-full appearance-none"
                    >
                      <option value="">Aucun</option>
                      {DEPARTMENT_CHOICES.map(d => (
                        <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                  </div>
                </div>

                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      ID Employé
                    </span>
                  </label>
                  <input
                    type="text"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleInputChange}
                    placeholder="EMP001"
                    className="input input-bordered input-sm lg:input-md w-full"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Date d'embauche
                    </span>
                  </label>
                  <input
                    type="date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleInputChange}
                    className="input input-bordered input-sm lg:input-md w-full"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Type de contrat
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      name="contract_type"
                      value={formData.contract_type}
                      onChange={handleInputChange}
                      className="select select-bordered select-sm lg:select-md w-full appearance-none"
                    >
                      <option value="">Sélectionner</option>
                      {CONTRACT_TYPES.map(ct => (
                        <option key={ct} value={ct}>{ct}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                  </div>
                </div>

                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Salaire
                    </span>
                  </label>
                  <label className="input input-bordered input-sm lg:input-md flex items-center gap-2">
                    <span className="text-base-content/60">€</span>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      className="grow"
                    />
                  </label>
                </div>

                <div className="form-control sm:col-span-2">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="toggle toggle-success toggle-sm lg:toggle-md"
                    />
                    <span className="label-text font-medium text-sm">Compte actif</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Sécurité */}
        {activeTab === 'security' && (
          <div className="max-w-2xl">
            <div className="bg-base-100 rounded-xl lg:rounded-2xl shadow-sm border border-base-300 overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-base-300 bg-base-200/50">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="p-1.5 lg:p-2 bg-warning/10 rounded-lg">
                    <Lock className="w-4 h-4 lg:w-5 lg:h-5 text-warning" />
                  </div>
                  <h2 className="text-base lg:text-lg font-bold text-base-content">
                    Mot de passe
                  </h2>
                </div>
              </div>
              
              <div className="p-4 lg:p-6 space-y-4">
                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm">
                      {isEditMode ? "Nouveau mot de passe" : "Mot de passe"} 
                      {!isEditMode && <span className="text-error ml-1">*</span>}
                    </span>
                    {isEditMode && (
                      <span className="label-text-alt text-base-content/50">Laisser vide pour ne pas changer</span>
                    )}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`input input-bordered input-sm lg:input-md w-full ${errors.password ? 'input-error' : ''}`}
                  />
                  {errors.password && (
                    <label className="label pt-1">
                      <span className="label-text-alt text-error flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.password}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm">
                      Confirmer le mot de passe
                      {!isEditMode && <span className="text-error ml-1">*</span>}
                    </span>
                  </label>
                  <input
                    type="password"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`input input-bordered input-sm lg:input-md w-full ${errors.password_confirm ? 'input-error' : ''}`}
                  />
                  {errors.password_confirm && (
                    <label className="label pt-1">
                      <span className="label-text-alt text-error flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.password_confirm}
                      </span>
                    </label>
                  )}
                </div>

                <div className="alert alert-info mt-4">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">
                    Le mot de passe doit contenir au moins 6 caractères.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Barre d'actions flottante pour mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 p-3 shadow-lg z-40">
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/utilisateurs')}
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
                {isEditMode ? 'Mettre à jour' : 'Créer'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserForm