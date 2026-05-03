// src/components/sales/SalesReport.jsx
import React, { useEffect, useState } from 'react'
import AxiosInstance from '../AxiosInstance'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package,
  AlertCircle, CheckCircle, BarChart3, Filter, X,
  Download, RefreshCw, Eye, Printer, PieChart
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement, Filler
)

const SalesReport = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [sales, setSales] = useState([])
  const [stats, setStats] = useState({
    total_sales: 0,
    total_amount: 0,
    average_order_value: 0,
    pending_payments: 0,
    pending_deliveries: 0,
    top_products: [],
    top_customers: [],
    monthly_revenue: []
  })
  const [customers, setCustomers] = useState([])
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    customer: ''           // plus de statut de vente
  })
  const [showFilters, setShowFilters] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA'
  const formatNumber = (n) => new Intl.NumberFormat('fr-FR').format(n || 0)

  const showNotification = (msg, type = 'success') => {
    setNotification({ show: true, message: msg, type })
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000)
  }

  // Charger uniquement les clients actifs
  const fetchActiveCustomers = async () => {
    try {
      const res = await AxiosInstance.get('/customers/?is_active=true')
      setCustomers(res.data || [])
    } catch (err) {
      console.warn('Erreur chargement clients actifs', err)
      // fallback: charger tous puis filtrer
      const fallback = await AxiosInstance.get('/customers/')
      setCustomers((fallback.data || []).filter(c => c.is_active))
    }
  }

  const fetchStats = async () => {
    try {
      const res = await AxiosInstance.get('/sales/stats/')
      setStats(res.data)
    } catch (err) {
      showNotification('Impossible de charger les statistiques', 'error')
    }
  }

  const fetchSales = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      if (filters.customer) params.append('customer', filters.customer)
      // Pas de paramètre status
      const res = await AxiosInstance.get(`/sales/?${params.toString()}`)
      setSales(res.data || [])
    } catch (err) {
      showNotification('Erreur lors du chargement des ventes', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveCustomers()
    fetchStats()
    fetchSales()
  }, [])

  useEffect(() => {
    fetchSales()
  }, [filters])

  const resetFilters = () => {
    setFilters({ start_date: '', end_date: '', customer: '' })
    setShowFilters(false)
  }

  const exportToCSV = () => {
    setExporting(true)
    try {
      const headers = ['N° Vente', 'Client', 'Date', 'Statut', 'Montant (FCFA)']
      const rows = sales.map(sale => [
        sale.sale_number,
        sale.customer_name,
        new Date(sale.sale_date).toLocaleDateString(),
        sale.status_display,
        sale.total
      ])
      const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n')
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.href = url
      link.setAttribute('download', `rapport_ventes_${new Date().toISOString().slice(0,10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      showNotification('Export CSV réussi', 'success')
    } catch (err) {
      showNotification('Erreur export', 'error')
    } finally {
      setExporting(false)
    }
  }

  const handlePrint = () => window.print()

  // Graphiques
  const monthlyData = stats.monthly_revenue || []
  const revenueChartData = {
    labels: monthlyData.map(m => m.month),
    datasets: [{
      label: 'CA (FCFA)',
      data: monthlyData.map(m => m.total),
      borderColor: '#DA4A0E',
      backgroundColor: 'rgba(218, 74, 14, 0.05)',
      fill: true,
      tension: 0.3
    }]
  }

  const topProducts = (stats.top_products || []).slice(0, 5)
  const topProductsData = {
    labels: topProducts.map(p => p.product__name || p.name || 'Produit'),
    datasets: [{
      label: 'Quantité vendue',
      data: topProducts.map(p => p.total_quantity || p.quantity || 0),
      backgroundColor: '#003C3F',
      borderRadius: 6
    }]
  }

  // Répartition par statut
  const statusCount = {}
  sales.forEach(sale => { statusCount[sale.status] = (statusCount[sale.status] || 0) + 1 })
  const statusLabels = {
    draft: 'Brouillon', confirmed: 'Confirmée', in_preparation: 'En préparation',
    shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée'
  }
  const pieData = {
    labels: Object.keys(statusCount).map(s => statusLabels[s] || s),
    datasets: [{
      data: Object.values(statusCount),
      backgroundColor: ['#DA4A0E', '#003C3F', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6']
    }]
  }

  // Tendances
  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
  const salesLastMonth = sales.filter(s => new Date(s.sale_date) >= lastMonth).length
  const revenueLastMonth = sales.filter(s => new Date(s.sale_date) >= lastMonth).reduce((sum, s) => sum + (s.total || 0), 0)
  const trendSales = stats.total_sales > 0 ? ((salesLastMonth / stats.total_sales) * 100).toFixed(1) : 0
  const trendRevenue = stats.total_amount > 0 ? ((revenueLastMonth / stats.total_amount) * 100).toFixed(1) : 0

  if (loading && sales.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center"><div className="loading loading-spinner loading-lg text-primary"></div><p className="mt-4">Chargement...</p></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification(prev => ({ ...prev, show: false }))} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm px-6 py-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div><h1 className="text-2xl font-bold">Rapport des ventes</h1><p className="text-sm text-gray-500">Analyse des performances commerciales</p></div>
          <div className="flex gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className="btn btn-sm btn-outline gap-1"><Filter className="w-4 h-4" /> Filtres</button>
            <button onClick={fetchSales} className="btn btn-sm btn-outline gap-1"><RefreshCw className="w-4 h-4" /> Actualiser</button>
            <button onClick={exportToCSV} disabled={exporting} className="btn btn-sm btn-outline gap-1"><Download className="w-4 h-4" /> CSV</button>
            <button onClick={handlePrint} className="btn btn-sm btn-outline gap-1"><Printer className="w-4 h-4" /> Imprimer</button>
          </div>
        </div>

        {/* Filtres simplifiés : date et client */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">Date début</label>
                <input type="date" className="input input-bordered" value={filters.start_date} onChange={e => setFilters({...filters, start_date: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label">Date fin</label>
                <input type="date" className="input input-bordered" value={filters.end_date} onChange={e => setFilters({...filters, end_date: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label">Client</label>
                <select className="select select-bordered" value={filters.customer} onChange={e => setFilters({...filters, customer: e.target.value})}>
                  <option value="">Tous les clients</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.full_name || c.company_name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button onClick={resetFilters} className="btn btn-ghost btn-sm gap-1"><X className="w-4 h-4" /> Réinitialiser</button>
            </div>
          </div>
        )}
      </div>

      {/* Corps */}
      <div className="p-6">
        {/* Cartes KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-l-primary">
            <div className="flex justify-between"><div><p className="text-gray-500">Chiffre d'affaires</p><p className="text-2xl font-bold">{formatCurrency(stats.total_amount)}</p></div><TrendingUp className={`w-6 h-6 ${trendRevenue>=0?'text-green-500':'text-red-500'}`} /></div>
            <div className="mt-2 text-xs">{trendRevenue>=0?'+':''}{trendRevenue}% vs mois précédent</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-l-blue-500">
            <div><p className="text-gray-500">Nombre de ventes</p><p className="text-2xl font-bold">{formatNumber(stats.total_sales)}</p></div>
            <div className="mt-2 text-xs">{trendSales>=0?'+':''}{trendSales}% vs mois précédent</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-l-green-500">
            <div><p className="text-gray-500">Panier moyen</p><p className="text-2xl font-bold">{formatCurrency(stats.average_order_value)}</p></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-l-orange-500">
            <div><p className="text-gray-500">Clients actifs</p><p className="text-2xl font-bold">{customers.length}</p></div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5"><h2 className="font-semibold text-lg mb-4 flex gap-2"><BarChart3 className="text-primary"/> Évolution mensuelle du CA</h2><div className="h-72"><Line data={revenueChartData} options={{responsive:true, maintainAspectRatio:false}}/></div></div>
          <div className="bg-white rounded-xl shadow-sm p-5"><h2 className="font-semibold text-lg mb-4 flex gap-2"><Package className="text-primary"/> Top 5 produits</h2><div className="h-72"><Bar data={topProductsData} options={{indexAxis:'y', responsive:true, maintainAspectRatio:false}}/></div></div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5"><h2 className="font-semibold text-lg mb-4 flex gap-2"><PieChart className="text-primary"/> Répartition par statut</h2><div className="h-64"><Doughnut data={pieData} options={{cutout:'60%'}}/></div></div>
          <div className="bg-white rounded-xl shadow-sm p-5"><h2 className="font-semibold text-lg mb-4 flex gap-2"><Users className="text-primary"/> Meilleurs clients</h2><div className="space-y-2">{(stats.top_customers||[]).slice(0,5).map((c,i)=> <div key={c.id} className="flex justify-between border-b py-2"><span>{i+1}. {c.name}</span><span className="font-bold">{formatCurrency(c.total_spent)}</span></div>)}</div></div>
        </div>

        {/* Tableau des ventes */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b flex justify-between"><h2 className="font-semibold">Détail des transactions</h2><span className="text-sm text-gray-400">{sales.length} enregistrement(s)</span></div>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-gray-50"><tr><th>N° Vente</th><th>Client</th><th>Date</th><th>Statut</th><th className="text-right">Montant</th><th className="text-center">Action</th></tr></thead>
              <tbody>
                {sales.length===0 ? <tr><td colSpan="6" className="text-center py-10">Aucune vente trouvée</td></tr> : sales.map(sale=>(
                  <tr key={sale.id}>
                    <td className="font-mono">{sale.sale_number}</td>
                    <td>{sale.customer_name}</td>
                    <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                    <td><span className="badge badge-sm badge-outline">{sale.status_display}</span></td>
                    <td className="text-right font-semibold">{formatCurrency(sale.total)}</td>
                    <td className="text-center"><button onClick={()=>navigate(`/ventes/${sale.id}`)} className="btn btn-xs btn-ghost"><Eye className="w-4 h-4"/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
        @media print { .btn, .fixed, .no-print { display: none !important; } }
      `}</style>
    </div>
  )
}

export default SalesReport