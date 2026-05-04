// src/components/purchases/PurchaseAlerts.jsx
import React, { useEffect, useState } from 'react'
import AxiosInstance from '../AxiosInstance'
import {
  AlertCircle, CheckCircle, RefreshCw, Filter, X,
  Package, Truck, TrendingUp, Clock, DollarSign,
  CheckSquare, Calendar, AlertTriangle
} from 'lucide-react'

const PurchaseAlerts = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [resolvingId, setResolvingId] = useState(null)
  const [filters, setFilters] = useState({ alert_type: '', product: '', supplier: '' })
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const alertTypes = [
    { value: '', label: 'Tous' },
    { value: 'reorder', label: 'Réapprovisionnement' },
    { value: 'delivery_delay', label: 'Retard de livraison' },
    { value: 'supplier_outage', label: 'Rupture fournisseur' },
    { value: 'price_increase', label: 'Augmentation prix' },
    { value: 'minimum_order', label: 'Seuil minimum' }
  ]

  const showNotification = (msg, type = 'success') => {
    setNotification({ show: true, message: msg, type })
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000)
  }

  const fetchProducts = async () => {
    try {
      const res = await AxiosInstance.get('/products/')
      setProducts(res.data || [])
    } catch (err) { console.warn(err) }
  }

  const fetchSuppliers = async () => {
    try {
      const res = await AxiosInstance.get('/suppliers/')
      setSuppliers(res.data || [])
    } catch (err) { console.warn(err) }
  }

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.alert_type) params.append('alert_type', filters.alert_type)
      if (filters.product) params.append('product', filters.product)
      if (filters.supplier) params.append('supplier', filters.supplier)
      const res = await AxiosInstance.get(`/alerts/?${params.toString()}`)
      setAlerts(res.data || [])
    } catch (err) {
      console.error('Erreur chargement alertes:', err)
      showNotification('Erreur chargement alertes', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchSuppliers()
    fetchAlerts()
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [filters])

  const resolveAlert = async (id) => {
    setResolvingId(id)
    try {
      await AxiosInstance.post(`/alerts/${id}/resolve/`)
      showNotification('Alerte résolue', 'success')
      fetchAlerts()
    } catch (err) {
      showNotification('Erreur lors de la résolution', 'error')
    } finally {
      setResolvingId(null)
    }
  }

  const resetFilters = () => {
    setFilters({ alert_type: '', product: '', supplier: '' })
    setShowFilters(false)
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'reorder': return <Package className="w-5 h-5 text-orange-500" />
      case 'delivery_delay': return <Clock className="w-5 h-5 text-red-500" />
      case 'supplier_outage': return <Truck className="w-5 h-5 text-red-500" />
      case 'price_increase': return <TrendingUp className="w-5 h-5 text-yellow-500" />
      case 'minimum_order': return <DollarSign className="w-5 h-5 text-blue-500" />
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getAlertTypeLabel = (type) => alertTypes.find(t => t.value === type)?.label || type

  return (
    <div className="min-h-screen bg-gray-100">
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification(prev => ({ ...prev, show: false }))}>✕</button>
          </div>
        </div>
      )}

      <div className="bg-white border-b sticky top-0 z-20 shadow-sm px-6 py-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Alertes d'achat</h1>
            <p className="text-sm text-gray-500">
              Commandes en retard, réapprovisionnement, ruptures fournisseurs...
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className="btn btn-sm btn-outline gap-1">
              <Filter className="w-4 h-4" /> Filtres
            </button>
            <button onClick={fetchAlerts} className="btn btn-sm btn-outline gap-1">
              <RefreshCw className="w-4 h-4" /> Actualiser
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select className="select select-bordered" value={filters.alert_type} onChange={e => setFilters({...filters, alert_type: e.target.value})}>
                {alertTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <select className="select select-bordered" value={filters.product} onChange={e => setFilters({...filters, product: e.target.value})}>
                <option value="">Tous produits</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select className="select select-bordered" value={filters.supplier} onChange={e => setFilters({...filters, supplier: e.target.value})}>
                <option value="">Tous fournisseurs</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.company_name}</option>)}
              </select>
            </div>
            <div className="flex justify-end mt-3">
              <button onClick={resetFilters} className="btn btn-ghost btn-sm gap-1"><X className="w-4 h-4" /> Réinitialiser</button>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="loading loading-spinner loading-lg"></div></div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400">Aucune alerte active</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {alerts.map(alert => (
              <div key={alert.id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex gap-3 flex-1">
                    {getAlertIcon(alert.alert_type)}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800">{alert.product_name || 'Commande'}</h3>
                        <span className="badge badge-outline text-xs">{getAlertTypeLabel(alert.alert_type)}</span>
                        {alert.supplier_name && <span className="badge badge-ghost text-xs">{alert.supplier_name}</span>}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{alert.message}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                        <span>Créée le: {new Date(alert.created_at).toLocaleDateString()}</span>
                        {alert.alert_type === 'reorder' && alert.current_stock !== undefined && (
                          <span>Stock: {alert.current_stock} / Seuil: {alert.reorder_point}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    disabled={resolvingId === alert.id}
                    className="btn btn-sm btn-success gap-1"
                  >
                    {resolvingId === alert.id ? <span className="loading loading-spinner loading-xs"></span> : <CheckSquare className="w-4 h-4" />}
                    Résoudre
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  )
}

export default PurchaseAlerts