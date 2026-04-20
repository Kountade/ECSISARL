// src/components/purchases/FournisseurForm.jsx
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
  Phone,
  Mail,
  MapPin,
  Globe,
  Hash,
  Users,
  CreditCard,
  DollarSign,
  Clock,
  FileText,
  Info,
  Star
} from 'lucide-react'

const ChevronDown = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
)

const FournisseurForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [errors, setErrors] = useState({})

  const supplierTypes = {
    manufacturer: 'Fabricant',
    distributor: 'Distributeur',
    wholesaler: 'Grossiste',
    importer: 'Importateur',
    service: 'Prestataire'
  }

  const paymentTerms = {
    immediate: 'Paiement immédiat',
    '15_days': '15 jours',
    '30_days': '30 jours',
    '45_days': '45 jours',
    '60_days': '60 jours',
    end_of_month: 'Fin de mois'
  }

  const deliveryTerms = {
    exw: 'EXW - Départ usine',
    fca: 'FCA - Franco transporteur',
    fob: 'FOB - Franco à bord',
    cif: 'CIF - Coût, assurance et fret',
    dap: 'DAP - Rendu au lieu de destination',
    ddp: 'DDP - Droits acquittés'
  }

  const currencies = ['XOF', 'EUR', 'USD', 'GBP', 'CNY']

  const [formData, setFormData] = useState({
    code: '', company_name: '', contact_name: '', email: '', phone: '',
    address: '', city: '', country: 'Sénégal', supplier_type: 'distributor',
    registration_number: '', tax_id: '', contact_title: '', mobile: '', fax: '',
    website: '', address_line2: '', state: '', postal_code: '',
    bank_name: '', bank_account: '', bank_swift: '', bank_iban: '',
    payment_terms: '30_days', delivery_terms: 'exw', currency: 'XOF',
    lead_time_days: 7, minimum_order_amount: '', discount_rate: '',
    is_active: true, is_preferred: false, notes: '', internal_notes: ''
  })

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    if (!isEditMode) return
    setLoading(true)
    try {
      const response = await AxiosInstance.get(`/suppliers/${id}/`)
      const data = response.data
      setFormData({
        code: data.code || '', company_name: data.company_name || '',
        contact_name: data.contact_name || '', email: data.email || '',
        phone: data.phone || '', address: data.address || '', city: data.city || '',
        country: data.country || 'Sénégal', supplier_type: data.supplier_type || 'distributor',
        registration_number: data.registration_number || '', tax_id: data.tax_id || '',
        contact_title: data.contact_title || '', mobile: data.mobile || '',
        fax: data.fax || '', website: data.website || '',
        address_line2: data.address_line2 || '', state: data.state || '',
        postal_code: data.postal_code || '', bank_name: data.bank_name || '',
        bank_account: data.bank_account || '', bank_swift: data.bank_swift || '',
        bank_iban: data.bank_iban || '', payment_terms: data.payment_terms || '30_days',
        delivery_terms: data.delivery_terms || 'exw', currency: data.currency || 'XOF',
        lead_time_days: data.lead_time_days || 7,
        minimum_order_amount: data.minimum_order_amount || '',
        discount_rate: data.discount_rate || '',
        is_active: data.is_active !== undefined ? data.is_active : true,
        is_preferred: data.is_preferred || false,
        notes: data.notes || '', internal_notes: data.internal_notes || ''
      })
    } catch (error) {
      showNotification('Erreur de chargement', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.code?.trim()) newErrors.code = 'Code obligatoire'
    if (!formData.company_name?.trim()) newErrors.company_name = 'Raison sociale obligatoire'
    if (!formData.contact_name?.trim()) newErrors.contact_name = 'Contact obligatoire'
    if (!formData.email?.trim()) newErrors.email = 'Email obligatoire'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide'
    if (!formData.phone?.trim()) newErrors.phone = 'Téléphone obligatoire'
    if (!formData.address?.trim()) newErrors.address = 'Adresse obligatoire'
    if (!formData.city?.trim()) newErrors.city = 'Ville obligatoire'
    if (!formData.country?.trim()) newErrors.country = 'Pays obligatoire'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) { showNotification('Corrigez les erreurs', 'error'); return }
    setSubmitting(true)
    try {
      const dataToSend = { ...formData }
      if (isEditMode) {
        await AxiosInstance.put(`/suppliers/${id}/`, dataToSend)
        showNotification('Fournisseur modifié', 'success')
      } else {
        await AxiosInstance.post('/suppliers/', dataToSend)
        showNotification('Fournisseur créé', 'success')
      }
      setTimeout(() => navigate('/fournisseurs'), 1500)
    } catch (error) {
      showNotification('Erreur d\'enregistrement', 'error')
    } finally { setSubmitting(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  return (
    <div className="w-full px-3 lg:px-6 py-3 space-y-3">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 lg:top-20 right-3 lg:right-6 z-50 animate-slideDown max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm">{notification.message}</span>
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ ...notification, show: false })}>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête compact */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/fournisseurs')} className="btn btn-ghost btn-sm btn-circle">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg lg:text-xl font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {isEditMode ? 'Modifier' : 'Nouveau fournisseur'}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/fournisseurs')} className="btn btn-outline btn-sm">Annuler</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary btn-sm">
            {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            {isEditMode ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Layout en 3 colonnes pour tout afficher */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          
          {/* COLONNE 1 - Identification & Contact */}
          <div className="space-y-3">
            {/* Identification */}
            <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-3">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-1"><Hash className="w-4 h-4 text-primary" />Identification</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium">Code <span className="text-error">*</span></label>
                  <input type="text" name="code" value={formData.code} onChange={handleInputChange} 
                    className={`input input-bordered input-xs w-full ${errors.code ? 'input-error' : ''}`} />
                </div>
                <div>
                  <label className="text-xs font-medium">Raison sociale <span className="text-error">*</span></label>
                  <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} 
                    className={`input input-bordered input-xs w-full ${errors.company_name ? 'input-error' : ''}`} />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="text-xs font-medium">N° TVA</label>
                    <input type="text" name="tax_id" value={formData.tax_id} onChange={handleInputChange} className="input input-bordered input-xs w-full" />
                  </div>
                  <div>
                    <label className="text-xs font-medium">N° RC</label>
                    <input type="text" name="registration_number" value={formData.registration_number} onChange={handleInputChange} className="input input-bordered input-xs w-full" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium">Type</label>
                  <select name="supplier_type" value={formData.supplier_type} onChange={handleInputChange} className="select select-bordered select-xs w-full">
                    {Object.entries(supplierTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-3">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-1"><Users className="w-4 h-4 text-primary" />Contact</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="text-xs font-medium">Nom <span className="text-error">*</span></label>
                    <input type="text" name="contact_name" value={formData.contact_name} onChange={handleInputChange} 
                      className={`input input-bordered input-xs w-full ${errors.contact_name ? 'input-error' : ''}`} />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Fonction</label>
                    <input type="text" name="contact_title" value={formData.contact_title} onChange={handleInputChange} className="input input-bordered input-xs w-full" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium flex items-center gap-1"><Mail className="w-3 h-3" />Email <span className="text-error">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} 
                    className={`input input-bordered input-xs w-full ${errors.email ? 'input-error' : ''}`} />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="text-xs font-medium flex items-center gap-1"><Phone className="w-3 h-3" />Tél <span className="text-error">*</span></label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} 
                      className={`input input-bordered input-xs w-full ${errors.phone ? 'input-error' : ''}`} />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Mobile</label>
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} className="input input-bordered input-xs w-full" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium flex items-center gap-1"><Globe className="w-3 h-3" />Site web</label>
                  <input type="url" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://..." className="input input-bordered input-xs w-full" />
                </div>
                <div>
                  <label className="text-xs font-medium">Fax</label>
                  <input type="text" name="fax" value={formData.fax} onChange={handleInputChange} className="input input-bordered input-xs w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* COLONNE 2 - Adresse & Bancaire */}
          <div className="space-y-3">
            {/* Adresse */}
            <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-3">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" />Adresse</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium">Adresse <span className="text-error">*</span></label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} 
                    className={`input input-bordered input-xs w-full ${errors.address ? 'input-error' : ''}`} />
                </div>
                <div>
                  <label className="text-xs font-medium">Complément</label>
                  <input type="text" name="address_line2" value={formData.address_line2} onChange={handleInputChange} className="input input-bordered input-xs w-full" />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="text-xs font-medium">Ville <span className="text-error">*</span></label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} 
                      className={`input input-bordered input-xs w-full ${errors.city ? 'input-error' : ''}`} />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Code postal</label>
                    <input type="text" name="postal_code" value={formData.postal_code} onChange={handleInputChange} className="input input-bordered input-xs w-full" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="text-xs font-medium">Région</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="input input-bordered input-xs w-full" />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Pays <span className="text-error">*</span></label>
                    <input type="text" name="country" value={formData.country} onChange={handleInputChange} 
                      className={`input input-bordered input-xs w-full ${errors.country ? 'input-error' : ''}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bancaire */}
            <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-3">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-1"><CreditCard className="w-4 h-4 text-primary" />Bancaire</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-1">
                  <div><label className="text-xs font-medium">Banque</label><input type="text" name="bank_name" value={formData.bank_name} onChange={handleInputChange} className="input input-bordered input-xs w-full" /></div>
                  <div><label className="text-xs font-medium">N° compte</label><input type="text" name="bank_account" value={formData.bank_account} onChange={handleInputChange} className="input input-bordered input-xs w-full" /></div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div><label className="text-xs font-medium">SWIFT</label><input type="text" name="bank_swift" value={formData.bank_swift} onChange={handleInputChange} className="input input-bordered input-xs w-full" /></div>
                  <div><label className="text-xs font-medium">IBAN</label><input type="text" name="bank_iban" value={formData.bank_iban} onChange={handleInputChange} className="input input-bordered input-xs w-full" /></div>
                </div>
              </div>
            </div>
          </div>

          {/* COLONNE 3 - Commercial, Notes & Options */}
          <div className="space-y-3">
            {/* Commercial */}
            <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-3">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-1"><DollarSign className="w-4 h-4 text-primary" />Commercial</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="text-xs font-medium">Paiement</label>
                    <select name="payment_terms" value={formData.payment_terms} onChange={handleInputChange} className="select select-bordered select-xs w-full">
                      {Object.entries(paymentTerms).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Livraison</label>
                    <select name="delivery_terms" value={formData.delivery_terms} onChange={handleInputChange} className="select select-bordered select-xs w-full">
                      {Object.entries(deliveryTerms).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div>
                    <label className="text-xs font-medium">Devise</label>
                    <select name="currency" value={formData.currency} onChange={handleInputChange} className="select select-bordered select-xs w-full">
                      {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" />Délai</label>
                    <input type="number" name="lead_time_days" value={formData.lead_time_days} onChange={handleInputChange} className="input input-bordered input-xs w-full" />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Remise %</label>
                    <input type="number" name="discount_rate" value={formData.discount_rate} onChange={handleInputChange} className="input input-bordered input-xs w-full" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium">Min commande</label>
                  <label className="input input-bordered input-xs flex items-center gap-1">
                    <span className="text-base-content/60">{formData.currency}</span>
                    <input type="number" name="minimum_order_amount" value={formData.minimum_order_amount} onChange={handleInputChange} className="grow" />
                  </label>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-3">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-1"><FileText className="w-4 h-4 text-primary" />Notes</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium">Publiques</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={2} className="textarea textarea-bordered text-xs w-full" />
                </div>
                <div>
                  <label className="text-xs font-medium">Internes</label>
                  <textarea name="internal_notes" value={formData.internal_notes} onChange={handleInputChange} rows={2} className="textarea textarea-bordered text-xs w-full" />
                </div>
              </div>
            </div>

            {/* Options & Résumé */}
            <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-3">
              <h3 className="font-bold text-sm mb-2">Options</h3>
              <div className="flex items-center justify-between mb-2">
                <label className="label cursor-pointer p-0 gap-1">
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="toggle toggle-success toggle-xs" />
                  <span className="text-xs">Actif</span>
                </label>
                <label className="label cursor-pointer p-0 gap-1">
                  <input type="checkbox" name="is_preferred" checked={formData.is_preferred} onChange={handleInputChange} className="toggle toggle-warning toggle-xs" />
                  <span className="text-xs flex items-center gap-1"><Star className="w-3 h-3 fill-warning" />Préféré</span>
                </label>
              </div>
              
              {/* Résumé compact */}
              <div className="bg-base-200 rounded p-2 text-xs">
                <div className="grid grid-cols-2 gap-x-1">
                  <span className="text-base-content/60">Code:</span><span className="truncate">{formData.code || '-'}</span>
                  <span className="text-base-content/60">Société:</span><span className="truncate">{formData.company_name || '-'}</span>
                  <span className="text-base-content/60">Contact:</span><span className="truncate">{formData.contact_name || '-'}</span>
                  <span className="text-base-content/60">Email:</span><span className="truncate">{formData.email || '-'}</span>
                </div>
              </div>
              
              <div className="alert py-1 mt-2 bg-info/10 border-info/20">
                <Info className="w-3 h-3 text-info" />
                <span className="text-xs"><span className="text-error">*</span> Champs obligatoires</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Barre mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t p-3 shadow-lg z-40">
        <div className="flex gap-2">
          <button onClick={() => navigate('/fournisseurs')} className="btn btn-outline btn-sm flex-1">Annuler</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary btn-sm flex-1">
            {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            {isEditMode ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FournisseurForm