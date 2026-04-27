// src/components/clients/CustomerDetails.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft,
  Edit,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Receipt,
  ShoppingBag,
  DollarSign,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Users,
  Briefcase,
  Landmark,
  Store,
  FileText,
  Calendar,
  TrendingUp,
  Wallet
} from 'lucide-react'

const CustomerDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [customer, setCustomer] = useState(null)
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const customerTypes = {
    individual: { label: 'Particulier', icon: User, color: 'primary' },
    company: { label: 'Entreprise', icon: Building2, color: 'secondary' },
    government: { label: 'Administration', icon: Landmark, color: 'info' },
    reseller: { label: 'Revendeur', icon: Store, color: 'warning' }
  }

  const paymentTerms = {
    cash: 'Comptant',
    '15_days': '15 jours',
    '30_days': '30 jours',
    '45_days': '45 jours',
    '60_days': '60 jours',
    end_of_month: 'Fin de mois'
  }

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'neutral', icon: FileText },
    confirmed: { label: 'Confirmée', color: 'primary', icon: CheckCircle },
    delivered: { label: 'Livrée', color: 'success', icon: CheckCircle },
    cancelled: { label: 'Annulée', color: 'error', icon: AlertCircle }
  }

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
      const [customerRes, salesRes] = await Promise.all([
        AxiosInstance.get(`/customers/${id}/`),
        AxiosInstance.get(`/customers/${id}/sales/`).catch(() => ({ data: [] }))
      ])
      setCustomer(customerRes.data)
      setSales(salesRes.data || [])
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

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

  if (!customer) return null

  const typeInfo = customerTypes[customer.customer_type] || customerTypes.individual
  const TypeIcon = typeInfo.icon
  const displayName = customer.full_name || customer.company_name
  const isActive = customer.is_active !== false

  return (
    <div className="min-h-screen bg-base-200 py-4 sm:py-6 px-3 sm:px-4">
      <div className="w-full max-w-6xl mx-auto">
        
        {/* Notification */}
        {notification.show && (
          <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slide-in">
            <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm sm:text-base`}>
              {notification.type === 'success' ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
              <span className="font-semibold">{notification.message}</span>
              <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
            </div>
          </div>
        )}

        {/* Bouton retour */}
        <div className="mb-4">
          <Link to="/clients" className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à la liste
          </Link>
        </div>

        {/* En-tête */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white">{displayName}</h1>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className={`badge badge-${typeInfo.color} badge-sm gap-1`}>
                      <TypeIcon className="w-3 h-3" /> {typeInfo.label}
                    </span>
                    {!isActive && <span className="badge badge-error badge-sm">Inactif</span>}
                    {customer.is_blocked && <span className="badge badge-error badge-sm">Bloqué</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => navigate(`/clients/${id}/modifier`)} className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-none gap-2">
                <Edit className="w-4 h-4" /> Modifier
              </button>
            </div>
          </div>
        </div>

        {/* Grille des informations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          
          {/* Informations générales */}
          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <User className="w-4 h-4" /> Informations générales
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-base-100">
                <span className="text-base-content/50">Code</span>
                <span className="font-semibold">{customer.code}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-base-100">
                <span className="text-base-content/50">Type</span>
                <span>{typeInfo.label}</span>
              </div>
              {customer.company_name && (
                <div className="flex justify-between py-1 border-b border-base-100">
                  <span className="text-base-content/50">Raison sociale</span>
                  <span>{customer.company_name}</span>
                </div>
              )}
              {customer.first_name && (
                <>
                  <div className="flex justify-between py-1 border-b border-base-100">
                    <span className="text-base-content/50">Prénom</span>
                    <span>{customer.first_name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-base-100">
                    <span className="text-base-content/50">Nom</span>
                    <span>{customer.last_name}</span>
                  </div>
                </>
              )}
              {customer.registration_number && (
                <div className="flex justify-between py-1 border-b border-base-100">
                  <span className="text-base-content/50">N° RC/RCCM</span>
                  <span className="text-sm">{customer.registration_number}</span>
                </div>
              )}
              {customer.tax_id && (
                <div className="flex justify-between py-1 border-b border-base-100">
                  <span className="text-base-content/50">N° TVA/IFU</span>
                  <span className="text-sm">{customer.tax_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Contact
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span>{customer.phone}</span>
              </div>
              {customer.mobile && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{customer.mobile}</span>
                </div>
              )}
            </div>
          </div>

          {/* Adresse principale */}
          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Adresse principale
            </h3>
            <p className="text-sm">{customer.address}</p>
            <p className="text-sm">{customer.city} {customer.postal_code}</p>
            <p className="text-sm">{customer.country}</p>
          </div>

          {/* Conditions commerciales */}
          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Conditions commerciales
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-base-100">
                <span className="text-base-content/50">Paiement</span>
                <span>{paymentTerms[customer.payment_terms]}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-base-100">
                <span className="text-base-content/50">Limite de crédit</span>
                <span className="font-semibold">{formatNumber(customer.credit_limit)} €</span>
              </div>
              <div className="flex justify-between py-1 border-b border-base-100">
                <span className="text-base-content/50">Remise</span>
                <span>{customer.discount_rate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 mb-6 overflow-hidden">
          <div className="p-4 border-b border-base-200">
            <h3 className="text-md font-semibold text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Statistiques
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-base-200">
            <div className="p-4 text-center">
              <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-2">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-base-content">{customer.total_orders || 0}</p>
              <p className="text-xs text-base-content/50">Commandes</p>
            </div>
            <div className="p-4 text-center">
              <div className="inline-flex p-3 rounded-xl bg-success/10 mb-2">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
              <p className="text-2xl font-bold text-success">{formatNumber(customer.total_spent)} €</p>
              <p className="text-xs text-base-content/50">Total dépensé</p>
            </div>
            <div className="p-4 text-center">
              <div className="inline-flex p-3 rounded-xl bg-error/10 mb-2">
                <Wallet className="w-6 h-6 text-error" />
              </div>
              <p className="text-2xl font-bold text-error">{formatNumber(customer.outstanding_balance)} €</p>
              <p className="text-xs text-base-content/50">Solde dû</p>
            </div>
          </div>
        </div>

        {/* Historique des commandes */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 overflow-hidden">
          <div className="p-4 border-b border-base-200">
            <h3 className="text-md font-semibold text-primary flex items-center gap-2">
              <Receipt className="w-5 h-5" /> Historique des commandes
            </h3>
          </div>
          {sales.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto text-base-content/30 mb-2" />
              <p className="text-base-content/50">Aucune commande</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead className="bg-base-200">
                  <tr className="text-sm">
                    <th>N° commande</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th className="text-right">Montant</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => {
                    const status = statusConfig[sale.status] || statusConfig.draft
                    const StatusIcon = status.icon
                    return (
                      <tr key={sale.id} className="hover">
                        <td className="font-mono text-sm">{sale.sale_number}</td>
                        <td>{new Date(sale.sale_date).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <div className={`badge badge-${status.color} gap-1`}>
                            <StatusIcon className="w-3 h-3" /> {status.label}
                          </div>
                        </td>
                        <td className="text-right font-semibold">{formatNumber(sale.total)} €</td>
                        <td className="text-center">
                          <button onClick={() => navigate(`/ventes/${sale.id}`)} className="btn btn-xs btn-ghost text-primary">
                            Voir
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-base-100 border-t-2">
                  <tr className="font-bold">
                    <td colSpan="3" className="text-right">Total</td>
                    <td className="text-right">{formatNumber(sales.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0))} €</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
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
      `}</style>
    </div>
  )
}

export default CustomerDetails