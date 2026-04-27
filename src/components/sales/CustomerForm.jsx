// src/components/clients/CustomerForm.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Save, X, Trash2, Plus, MapPin, Phone, Mail, Building2,
  User, Briefcase, CreditCard, AlertCircle, CheckCircle,
  Edit, ArrowLeft, Home, Globe, Hash, Percent, DollarSign,
  Shield, FileText, Users, Lock, UserPlus
} from 'lucide-react'

const CustomerForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [openAddressDialog, setOpenAddressDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const [formData, setFormData] = useState({
    code: '',
    customer_type: 'individual',
    company_name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Sénégal',
    registration_number: '',
    tax_id: '',
    payment_terms: 'cash',
    credit_limit: 0,
    discount_rate: 0,
    is_active: true,
    is_blocked: false,
    blocking_reason: '',
    notes: '',
    internal_notes: ''
  })

  const [addresses, setAddresses] = useState([])
  const [addressForm, setAddressForm] = useState({
    address_type: 'both',
    address: '',
    city: '',
    postal_code: '',
    country: 'Sénégal',
    is_default: false
  })

  const customerTypes = {
    individual: { label: 'Particulier', icon: User, color: 'primary' },
    company: { label: 'Entreprise', icon: Building2, color: 'secondary' },
    government: { label: 'Administration', icon: Shield, color: 'info' },
    reseller: { label: 'Revendeur', icon: Users, color: 'warning' }
  }

  const paymentTerms = {
    cash: 'Comptant',
    '15_days': '15 jours',
    '30_days': '30 jours',
    '45_days': '45 jours',
    '60_days': '60 jours',
    end_of_month: 'Fin de mois'
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      if (isEditMode) {
        const [customerRes, addressesRes] = await Promise.all([
          AxiosInstance.get(`/customers/${id}/`),
          AxiosInstance.get(`/customers/${id}/addresses/`).catch(() => ({ data: [] }))
        ])
        const customer = customerRes.data
        setFormData({
          code: customer.code || '',
          customer_type: customer.customer_type || 'individual',
          company_name: customer.company_name || '',
          first_name: customer.first_name || '',
          last_name: customer.last_name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          mobile: customer.mobile || '',
          address: customer.address || '',
          city: customer.city || '',
          postal_code: customer.postal_code || '',
          country: customer.country || 'Sénégal',
          registration_number: customer.registration_number || '',
          tax_id: customer.tax_id || '',
          payment_terms: customer.payment_terms || 'cash',
          credit_limit: customer.credit_limit || 0,
          discount_rate: customer.discount_rate || 0,
          is_active: customer.is_active !== undefined ? customer.is_active : true,
          is_blocked: customer.is_blocked || false,
          blocking_reason: customer.blocking_reason || '',
          notes: customer.notes || '',
          internal_notes: customer.internal_notes || ''
        })
        setAddresses(addressesRes.data || [])
      }
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAddAddress = async () => {
    if (!addressForm.address) {
      showNotification('L\'adresse est obligatoire', 'error')
      return
    }

    try {
      if (editingAddress) {
        await AxiosInstance.put(`/customer-addresses/${editingAddress.id}/`, addressForm)
        showNotification('Adresse modifiée', 'success')
      } else {
        await AxiosInstance.post(`/customers/${id}/addresses/`, addressForm)
        showNotification('Adresse ajoutée', 'success')
      }
      fetchData()
      setOpenAddressDialog(false)
      setEditingAddress(null)
      setAddressForm({ address_type: 'both', address: '', city: '', postal_code: '', country: 'Sénégal', is_default: false })
    } catch (error) {
      showNotification('Erreur', 'error')
    }
  }

  const handleDeleteAddress = async (addressId) => {
    try {
      await AxiosInstance.delete(`/customer-addresses/${addressId}/`)
      showNotification('Adresse supprimée', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur', 'error')
    }
  }

  const handleSubmit = async () => {
    if (!formData.code) {
      showNotification('Le code est obligatoire', 'error')
      return
    }
    if (!formData.email) {
      showNotification('L\'email est obligatoire', 'error')
      return
    }
    if (!formData.phone) {
      showNotification('Le téléphone est obligatoire', 'error')
      return
    }

    setSubmitting(true)
    try {
      if (isEditMode) {
        await AxiosInstance.put(`/customers/${id}/`, formData)
        showNotification('Client modifié avec succès', 'success')
      } else {
        await AxiosInstance.post('/customers/', formData)
        showNotification('Client créé avec succès', 'success')
      }
      setTimeout(() => navigate('/clients'), 1500)
    } catch (error) {
      console.error(error)
      let errorMsg = 'Erreur'
      if (error.response?.data) {
        const firstError = Object.values(error.response.data)[0]
        errorMsg = Array.isArray(firstError) ? firstError[0] : firstError
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
    <div className="min-h-screen bg-base-200 p-4">
      <div className="w-full max-w-7xl mx-auto">
        
        {/* Notification */}
        {notification.show && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm`}>
              {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="font-semibold">{notification.message}</span>
              <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
            </div>
          </div>
        )}

        {/* Bouton retour */}
        <div className="mb-3">
          <Link to="/clients" className="btn btn-ghost btn-sm gap-1 text-base-content/70 hover:text-primary">
            <ArrowLeft className="w-3 h-3" /> Retour
          </Link>
        </div>

        {/* Carte principale */}
        <div className="card bg-base-100 shadow-xl border border-primary/20">
          <div className="card-body p-4">
            
            {/* En-tête compact */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-base-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-base-content">
                  {isEditMode ? 'Modifier le client' : 'Nouveau client'}
                </h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate('/clients')} className="btn btn-sm btn-outline gap-1">
                  <X className="w-3 h-3" /> Annuler
                </button>
                <button onClick={handleSubmit} disabled={submitting} className="btn btn-sm btn-primary gap-1">
                  {submitting ? <span className="loading loading-spinner loading-xs"></span> : <Save className="w-3 h-3" />}
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>

            {/* Formulaire compact - 2 colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Colonne gauche */}
              <div className="space-y-3">
                {/* Code et Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label py-0"><span className="label-text text-xs font-medium">Code <span className="text-error">*</span></span></label>
                    <input type="text" name="code" value={formData.code} onChange={handleInputChange} className="input input-bordered input-sm w-full" placeholder="CLT-001" />
                  </div>
                  <div className="form-control">
                    <label className="label py-0"><span className="label-text text-xs font-medium">Type</span></label>
                    <select name="customer_type" value={formData.customer_type} onChange={handleInputChange} className="select select-bordered select-sm w-full">
                      {Object.entries(customerTypes).map(([key, val]) => (<option key={key} value={key}>{val.label}</option>))}
                    </select>
                  </div>
                </div>

                {/* Nom / Prénom ou Raison sociale */}
                {formData.customer_type === 'company' ? (
                  <div className="form-control">
                    <label className="label py-0"><span className="label-text text-xs font-medium">Raison sociale</span></label>
                    <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} className="input input-bordered input-sm w-full" placeholder="Nom de l'entreprise" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-control"><label className="label py-0"><span className="label-text text-xs font-medium">Prénom</span></label><input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className="input input-bordered input-sm w-full" placeholder="Prénom" /></div>
                    <div className="form-control"><label className="label py-0"><span className="label-text text-xs font-medium">Nom</span></label><input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className="input input-bordered input-sm w-full" placeholder="Nom" /></div>
                  </div>
                )}

                {/* Contact */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-control"><label className="label py-0"><span className="label-text text-xs font-medium flex items-center gap-1">Email <span className="text-error">*</span></span></label><div className="relative"><Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-base-content/40" /><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input input-bordered input-sm w-full pl-7" placeholder="client@email.com" /></div></div>
                  <div className="form-control"><label className="label py-0"><span className="label-text text-xs font-medium flex items-center gap-1">Téléphone <span className="text-error">*</span></span></label><div className="relative"><Phone className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-base-content/40" /><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="input input-bordered input-sm w-full pl-7" placeholder="+221 33 123 45 67" /></div></div>
                </div>

                <div className="form-control"><label className="label py-0"><span className="label-text text-xs font-medium">Mobile</span></label><div className="relative"><Phone className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-base-content/40" /><input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} className="input input-bordered input-sm w-full pl-7" placeholder="+221 77 123 45 67" /></div></div>

                {/* Infos entreprise */}
                {formData.customer_type === 'company' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-control"><label className="label py-0"><span className="label-text text-xs font-medium">N° RC/RCCM</span></label><input type="text" name="registration_number" value={formData.registration_number} onChange={handleInputChange} className="input input-bordered input-sm w-full" placeholder="N° RC" /></div>
                    <div className="form-control"><label className="label py-0"><span className="label-text text-xs font-medium">N° TVA/IFU</span></label><input type="text" name="tax_id" value={formData.tax_id} onChange={handleInputChange} className="input input-bordered input-sm w-full" placeholder="N° TVA" /></div>
                  </div>
                )}

                {/* Conditions commerciales */}
                <div className="bg-base-200 rounded-lg p-2">
                  <p className="text-xs font-semibold text-primary mb-2">Conditions commerciales</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="form-control"><label className="label py-0"><span className="label-text text-xs">Paiement</span></label><select name="payment_terms" value={formData.payment_terms} onChange={handleInputChange} className="select select-bordered select-xs w-full">{Object.entries(paymentTerms).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}</select></div>
                    <div className="form-control"><label className="label py-0"><span className="label-text text-xs">Crédit (€)</span></label><input type="number" name="credit_limit" value={formData.credit_limit} onChange={handleInputChange} className="input input-bordered input-xs w-full" placeholder="0" /></div>
                    <div className="form-control"><label className="label py-0"><span className="label-text text-xs">Remise %</span></label><input type="number" name="discount_rate" value={formData.discount_rate} onChange={handleInputChange} className="input input-bordered input-xs w-full" step="0.5" placeholder="0" /></div>
                  </div>
                </div>
              </div>

              {/* Colonne droite */}
              <div className="space-y-3">
                {/* Adresse */}
                <div className="bg-base-200 rounded-lg p-2">
                  <p className="text-xs font-semibold text-primary mb-2">Adresse principale</p>
                  <div className="form-control mb-2"><textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" className="textarea textarea-bordered textarea-xs w-full" placeholder="Adresse" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="form-control"><input type="text" name="city" value={formData.city} onChange={handleInputChange} className="input input-bordered input-xs w-full" placeholder="Ville" /></div>
                    <div className="form-control"><input type="text" name="postal_code" value={formData.postal_code} onChange={handleInputChange} className="input input-bordered input-xs w-full" placeholder="Code postal" /></div>
                  </div>
                  <div className="form-control mt-2"><div className="relative"><Globe className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-base-content/40" /><input type="text" name="country" value={formData.country} onChange={handleInputChange} className="input input-bordered input-xs w-full pl-7" placeholder="Pays" /></div></div>
                </div>

                {/* Statut */}
                <div className="bg-base-200 rounded-lg p-2">
                  <p className="text-xs font-semibold text-primary mb-2">Statut</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="checkbox checkbox-success checkbox-xs" /><span className="text-xs">Actif</span></label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" name="is_blocked" checked={formData.is_blocked} onChange={handleInputChange} className="checkbox checkbox-error checkbox-xs" /><span className="text-xs">Bloqué</span></label>
                  </div>
                  {formData.is_blocked && (
                    <div className="form-control mt-2"><textarea name="blocking_reason" value={formData.blocking_reason} onChange={handleInputChange} rows="1" className="textarea textarea-bordered textarea-xs w-full" placeholder="Raison du blocage" /></div>
                  )}
                </div>

                {/* Notes */}
                <div className="bg-base-200 rounded-lg p-2">
                  <p className="text-xs font-semibold text-primary mb-2">Notes</p>
                  <div className="form-control mb-2"><textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="2" className="textarea textarea-bordered textarea-xs w-full" placeholder="Notes publiques" /></div>
                  <div className="form-control"><textarea name="internal_notes" value={formData.internal_notes} onChange={handleInputChange} rows="1" className="textarea textarea-bordered textarea-xs w-full text-info/70" placeholder="Notes internes" /></div>
                </div>

                {/* Adresses supplémentaires (mode édition) */}
                {isEditMode && addresses.length > 0 && (
                  <div className="bg-base-200 rounded-lg p-2">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-semibold text-primary">Adresses supplémentaires</p>
                      <button onClick={() => setOpenAddressDialog(true)} className="btn btn-xs btn-ghost text-primary gap-0"><Plus className="w-3 h-3" /> Ajouter</button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="flex justify-between items-center p-1 bg-base-100 rounded text-xs">
                          <div className="truncate flex-1"><span className="badge badge-xs mr-1">{addr.address_type === 'billing' ? 'Fact' : addr.address_type === 'shipping' ? 'Liv' : 'Mix'}</span>{addr.city}</div>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingAddress(addr); setAddressForm(addr); setOpenAddressDialog(true) }} className="btn btn-ghost btn-xs text-primary"><Edit className="w-3 h-3" /></button>
                            <button onClick={() => handleDeleteAddress(addr.id)} className="btn btn-ghost btn-xs text-error"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isEditMode && addresses.length === 0 && (
                  <button onClick={() => setOpenAddressDialog(true)} className="btn btn-xs btn-outline w-full gap-1"><Plus className="w-3 h-3" /> Ajouter une adresse</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ajout/Modification Adresse */}
      {openAddressDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-base-100 rounded-xl shadow-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-3 rounded-t-xl flex justify-between items-center">
              <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-white" /><h2 className="text-lg font-bold text-white">{editingAddress ? 'Modifier l\'adresse' : 'Nouvelle adresse'}</h2></div>
              <button onClick={() => { setOpenAddressDialog(false); setEditingAddress(null) }} className="text-white hover:text-white/80"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <select name="address_type" value={addressForm.address_type} onChange={handleAddressChange} className="select select-bordered select-sm w-full"><option value="billing">Facturation</option><option value="shipping">Livraison</option><option value="both">Les deux</option></select>
              <textarea name="address" value={addressForm.address} onChange={handleAddressChange} rows="2" className="textarea textarea-bordered textarea-sm w-full" placeholder="Adresse *" />
              <div className="grid grid-cols-2 gap-2"><input type="text" name="city" value={addressForm.city} onChange={handleAddressChange} className="input input-bordered input-sm" placeholder="Ville" /><input type="text" name="postal_code" value={addressForm.postal_code} onChange={handleAddressChange} className="input input-bordered input-sm" placeholder="Code postal" /></div>
              <input type="text" name="country" value={addressForm.country} onChange={handleAddressChange} className="input input-bordered input-sm w-full" placeholder="Pays" />
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="is_default" checked={addressForm.is_default} onChange={handleAddressChange} className="checkbox checkbox-primary checkbox-xs" /><span className="text-xs">Adresse par défaut</span></label>
            </div>
            <div className="flex gap-2 p-3 bg-base-200 rounded-b-xl">
              <button onClick={() => { setOpenAddressDialog(false); setEditingAddress(null) }} className="btn btn-sm btn-ghost flex-1">Annuler</button>
              <button onClick={handleAddAddress} className="btn btn-sm btn-primary flex-1">{editingAddress ? 'Modifier' : 'Ajouter'}</button>
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

export default CustomerForm