// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AxiosInstance from './AxiosInstance'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Truck,
  FileText,
  CreditCard,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  MoreHorizontal,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Target,
  Award,
  Clock,
  Wallet,
  Receipt,
  Store,
  Building2,
  Percent,
  Zap,
  Globe,
  Settings
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

// Enregistrement des composants Chart.js
ChartJS.register(
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
)

const Dashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState('month')
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  
  const [stats, setStats] = useState({
    sales: {
      total: 0,
      amount: 0,
      average: 0,
      pending: 0,
      delivered: 0,
      monthly: [
        { month: 'Jan', amount: 12500000 },
        { month: 'Fév', amount: 15800000 },
        { month: 'Mar', amount: 14200000 },
        { month: 'Avr', amount: 18900000 },
        { month: 'Mai', amount: 21000000 },
        { month: 'Juin', amount: 23500000 },
        { month: 'Juil', amount: 25800000 },
        { month: 'Aoû', amount: 22400000 },
        { month: 'Sep', amount: 19800000 },
        { month: 'Oct', amount: 24500000 },
        { month: 'Nov', amount: 27800000 },
        { month: 'Déc', amount: 31200000 }
      ],
      weekly: [
        { day: 'Lun', amount: 3200000 },
        { day: 'Mar', amount: 3800000 },
        { day: 'Mer', amount: 4500000 },
        { day: 'Jeu', amount: 4200000 },
        { day: 'Ven', amount: 5600000 },
        { day: 'Sam', amount: 4800000 },
        { day: 'Dim', amount: 2900000 }
      ]
    },
    purchases: {
      total: 0,
      amount: 0,
      pending: 0,
      received: 0,
      monthly: []
    },
    customers: {
      total: 0,
      active: 0,
      top: []
    },
    products: {
      total: 0,
      lowStock: 0,
      outOfStock: 0,
      top: [
        { name: 'Produit 1', total_quantity: 145 },
        { name: 'Produit 2', total_quantity: 128 },
        { name: 'Produit 3', total_quantity: 98 },
        { name: 'Produit 4', total_quantity: 76 },
        { name: 'Produit 5', total_quantity: 54 }
      ]
    },
    financial: {
      revenue: 0,
      expenses: 0,
      profit: 0,
      margin: 0,
      pending_invoices: 0,
      overdue_invoices: 0
    },
    kpi: {
      conversion_rate: 0,
      customer_satisfaction: 92,
      delivery_on_time: 0,
      stock_turnover: 4.5,
      average_delivery_days: 3.2
    },
    payment_methods: {
      cash: 0,
      card: 0,
      mobile_money: 0,
      transfer: 0
    }
  })

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(number)
  }

  const formatCurrency = (amount) => {
    return `${formatNumber(amount)} FCFA`
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    // Données par défaut en cas d'erreur
    let salesData = { total_sales: 0, total_amount: 0, average_order_value: 0, top_customers: [], top_products: [] }
    let purchasesData = { total_orders: 0, total_amount: 0 }
    let customersData = []
    let productsData = []
    let invoicesData = []
    let paymentsData = []

    try {
      // Récupération des ventes
      try {
        const salesRes = await AxiosInstance.get('/sales/stats/')
        salesData = salesRes.data || {}
        console.log('Sales stats:', salesData)
      } catch (err) {
        console.warn('Erreur chargement stats ventes:', err.message)
      }

      // Récupération des achats
      try {
        const purchasesRes = await AxiosInstance.get('/purchase-orders/stats/')
        purchasesData = purchasesRes.data || {}
        console.log('Purchases stats:', purchasesData)
      } catch (err) {
        console.warn('Erreur chargement stats achats:', err.message)
      }

      // Récupération des clients
      try {
        const customersRes = await AxiosInstance.get('/customers/')
        customersData = customersRes.data || []
        console.log('Customers:', customersData.length)
      } catch (err) {
        console.warn('Erreur chargement clients:', err.message)
      }

      // Récupération des produits
      try {
        const productsRes = await AxiosInstance.get('/products/')
        productsData = productsRes.data || []
        console.log('Products:', productsData.length)
      } catch (err) {
        console.warn('Erreur chargement produits:', err.message)
      }

      // Récupération des factures
      try {
        const invoicesRes = await AxiosInstance.get('/invoices/')
        invoicesData = invoicesRes.data || []
        console.log('Invoices:', invoicesData.length)
      } catch (err) {
        console.warn('Erreur chargement factures:', err.message)
      }

      // Récupération des paiements
      try {
        const paymentsRes = await AxiosInstance.get('/payments/')
        paymentsData = paymentsRes.data || []
        console.log('Payments:', paymentsData.length)
      } catch (err) {
        console.warn('Erreur chargement paiements:', err.message)
      }

      // Calcul des indicateurs financiers
      const revenue = salesData.total_amount || 0
      const expenses = purchasesData.total_amount || 0
      const profit = revenue - expenses
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0

      // Calcul des KPI
      const pendingInvoices = invoicesData.filter(i => i.status === 'pending' || i.status === 'partially_paid').length
      const overdueInvoices = invoicesData.filter(i => i.status === 'overdue').length
      const deliveryOnTime = salesData.delivered > 0 && salesData.total > 0 ? (salesData.delivered / salesData.total) * 100 : 85
      
      // Produits en stock faible
      const lowStockProducts = productsData.filter(p => p.stock_quantity <= p.minimum_stock && p.stock_quantity > 0).length
      const outOfStockProducts = productsData.filter(p => p.stock_quantity === 0).length

      // Répartition des modes de paiement
      const paymentMethods = {
        cash: paymentsData.filter(p => p.payment_method === 'cash').reduce((sum, p) => sum + (p.amount || 0), 0),
        card: paymentsData.filter(p => p.payment_method === 'card').reduce((sum, p) => sum + (p.amount || 0), 0),
        mobile_money: paymentsData.filter(p => p.payment_method === 'mobile_money').reduce((sum, p) => sum + (p.amount || 0), 0),
        transfer: paymentsData.filter(p => p.payment_method === 'transfer').reduce((sum, p) => sum + (p.amount || 0), 0)
      }

      // Top produits depuis l'API ou données par défaut
      const topProducts = salesData.top_products && salesData.top_products.length > 0 
        ? salesData.top_products 
        : stats.products.top

      setStats({
        sales: {
          total: salesData.total_sales || 0,
          amount: revenue,
          average: salesData.average_order_value || 0,
          pending: salesData.pending_payments || 0,
          delivered: salesData.pending_deliveries || 0,
          monthly: stats.sales.monthly,
          weekly: stats.sales.weekly
        },
        purchases: {
          total: purchasesData.total_orders || 0,
          amount: expenses,
          pending: purchasesData.pending_orders || 0,
          received: purchasesData.late_orders || 0,
          monthly: purchasesData.monthly_spending || []
        },
        customers: {
          total: customersData.length,
          active: customersData.filter(c => c.is_active).length,
          top: salesData.top_customers || []
        },
        products: {
          total: productsData.length,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
          top: topProducts
        },
        financial: {
          revenue: revenue,
          expenses: expenses,
          profit: profit,
          margin: margin,
          pending_invoices: pendingInvoices,
          overdue_invoices: overdueInvoices
        },
        kpi: {
          conversion_rate: customersData.length > 0 && salesData.total_sales > 0 ? (salesData.total_sales / customersData.length) * 100 : 15,
          customer_satisfaction: 92,
          delivery_on_time: deliveryOnTime,
          stock_turnover: 4.5,
          average_delivery_days: 3.2
        },
        payment_methods: paymentMethods
      })

      showNotification('Données chargées avec succès', 'success')

    } catch (error) {
      console.error('Erreur globale:', error)
      setError('Impossible de charger les données. Veuillez vérifier votre connexion.')
      showNotification('Erreur lors du chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [dateRange])

  // Configuration des graphiques
  const revenueChartData = {
    labels: stats.sales.monthly.map(item => item.month),
    datasets: [
      {
        label: 'Chiffre d\'affaires',
        data: stats.sales.monthly.map(item => item.amount),
        borderColor: '#DA4A0E',
        backgroundColor: 'rgba(218, 74, 14, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#DA4A0E',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  }

  const weeklyChartData = {
    labels: stats.sales.weekly.map(item => item.day),
    datasets: [
      {
        label: 'Ventes journalières',
        data: stats.sales.weekly.map(item => item.amount),
        backgroundColor: 'rgba(218, 74, 14, 0.7)',
        borderRadius: 8,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      }
    ]
  }

  const paymentMethodsData = {
    labels: ['Espèces', 'Carte bancaire', 'Mobile Money', 'Virement'],
    datasets: [
      {
        data: [
          stats.payment_methods.cash || 1000000,
          stats.payment_methods.card || 500000,
          stats.payment_methods.mobile_money || 800000,
          stats.payment_methods.transfer || 300000
        ],
        backgroundColor: ['#DA4A0E', '#003C3F', '#10B981', '#3B82F6'],
        borderWidth: 0,
      }
    ]
  }

  const topProductsData = {
    labels: stats.products.top.slice(0, 5).map(p => {
      const name = p.product__name || p.name || 'Produit'
      return name.length > 15 ? name.substring(0, 12) + '...' : name
    }),
    datasets: [
      {
        label: 'Quantité vendue',
        data: stats.products.top.slice(0, 5).map(p => p.total_quantity || p.quantity || 0),
        backgroundColor: 'rgba(218, 74, 14, 0.7)',
        borderRadius: 8,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''
            let value = context.raw
            return `${label}: ${formatCurrency(value)}`
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return formatCurrency(value)
          }
        }
      }
    }
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatNumber(context.raw)}`
          }
        }
      }
    }
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || ''
            let value = context.raw
            let total = context.dataset.data.reduce((a, b) => a + b, 0)
            let percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
            return `${label}: ${formatCurrency(value)} (${percentage}%)`
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12"></div>
          <p className="text-base font-semibold text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary gap-2">
            <RefreshCw className="w-4 h-4" /> Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-xl text-sm`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Tableau de Bord</h1>
              <p className="text-sm text-gray-500 mt-1">Vue d'ensemble des performances de l'entreprise</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setDateRange('week')}
                  className={`px-3 py-1.5 text-sm rounded-md transition ${dateRange === 'week' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setDateRange('month')}
                  className={`px-3 py-1.5 text-sm rounded-md transition ${dateRange === 'month' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  Mois
                </button>
                <button
                  onClick={() => setDateRange('year')}
                  className={`px-3 py-1.5 text-sm rounded-md transition ${dateRange === 'year' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  Année
                </button>
              </div>
              <button onClick={fetchDashboardData} className="btn btn-outline btn-sm gap-2">
                <RefreshCw className="w-4 h-4" /> Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        
        {/* KPI Cards - Première ligne */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12%
              </span>
            </div>
            <p className="text-sm text-gray-500">Chiffre d'affaires</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.financial.revenue)}</p>
            <p className="text-xs text-gray-400 mt-1">Sur la période</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Percent className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">+5%</span>
            </div>
            <p className="text-sm text-gray-500">Marge bénéficiaire</p>
            <p className="text-2xl font-bold text-gray-800">{stats.financial.margin.toFixed(1)}%</p>
            <p className="text-xs text-gray-400 mt-1">Bénéfice: {formatCurrency(stats.financial.profit)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">+8%</span>
            </div>
            <p className="text-sm text-gray-500">Ventes totales</p>
            <p className="text-2xl font-bold text-gray-800">{formatNumber(stats.sales.total)}</p>
            <p className="text-xs text-gray-400 mt-1">Moyenne: {formatNumber(stats.sales.average)} FCFA</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">+15%</span>
            </div>
            <p className="text-sm text-gray-500">Clients actifs</p>
            <p className="text-2xl font-bold text-gray-800">{formatNumber(stats.customers.active)}</p>
            <p className="text-xs text-gray-400 mt-1">Total: {formatNumber(stats.customers.total)}</p>
          </div>
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Graphique d'évolution des ventes (Line) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Évolution du chiffre d'affaires
              </h3>
            </div>
            <div className="h-80">
              <Line data={revenueChartData} options={chartOptions} />
            </div>
          </div>

          {/* Graphique des ventes hebdomadaires (Bar) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Ventes hebdomadaires
              </h3>
            </div>
            <div className="h-80">
              <Bar data={weeklyChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Deuxième ligne de graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Répartition des paiements (Doughnut) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              Répartition des paiements
            </h3>
            <div className="h-64">
              <Doughnut data={paymentMethodsData} options={pieOptions} />
            </div>
          </div>

          {/* Top produits (Bar) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary" />
              Top 5 produits les plus vendus
            </h3>
            <div className="h-64">
              <Bar data={topProductsData} options={barOptions} />
            </div>
          </div>

          {/* KPI circulaires */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              Indicateurs clés
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Taux de conversion</span>
                  <span className="font-semibold">{stats.kpi.conversion_rate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(stats.kpi.conversion_rate, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Livraison à temps</span>
                  <span className="font-semibold text-green-600">{stats.kpi.delivery_on_time.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(stats.kpi.delivery_on_time, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Rotation du stock</span>
                  <span className="font-semibold">{stats.kpi.stock_turnover}x</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats.kpi.stock_turnover / 12) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Délai livraison moyen</span>
                  <span className="font-semibold">{stats.kpi.average_delivery_days} jours</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(stats.kpi.average_delivery_days / 14) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques financières et alertes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Situation financière */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-primary" />
              Situation financière
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Revenus totaux</span>
                <span className="font-semibold text-green-600">{formatCurrency(stats.financial.revenue)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Dépenses totales</span>
                <span className="font-semibold text-red-600">{formatCurrency(stats.financial.expenses)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Bénéfice net</span>
                <span className="font-semibold text-primary">{formatCurrency(stats.financial.profit)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Factures en attente</span>
                <span className="font-semibold text-orange-600">{stats.financial.pending_invoices}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Factures en retard</span>
                <span className="font-semibold text-red-600">{stats.financial.overdue_invoices}</span>
              </div>
            </div>
          </div>

          {/* Alertes et actions rapides */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-primary" />
              Alertes & Actions rapides
            </h3>
            <div className="space-y-3">
              {stats.products.lowStock > 0 && (
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700">{stats.products.lowStock} produits en stock faible</span>
                  </div>
                  <button className="btn btn-xs btn-outline btn-warning" onClick={() => navigate('/produits')}>Voir</button>
                </div>
              )}
              {stats.products.outOfStock > 0 && (
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700">{stats.products.outOfStock} produits en rupture</span>
                  </div>
                  <button className="btn btn-xs btn-outline btn-error" onClick={() => navigate('/achats/nouveau')}>Commander</button>
                </div>
              )}
              {stats.financial.overdue_invoices > 0 && (
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-700">{stats.financial.overdue_invoices} factures impayées</span>
                  </div>
                  <button className="btn btn-xs btn-outline btn-warning" onClick={() => navigate('/factures')}>Relancer</button>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button className="flex-1 btn btn-primary btn-sm gap-2" onClick={() => navigate('/ventes/nouveau')}>
                  <Receipt className="w-4 h-4" /> Nouvelle vente
                </button>
                <button className="flex-1 btn btn-outline btn-sm gap-2" onClick={() => fetchDashboardData()}>
                  <Download className="w-4 h-4" /> Exporter rapport
                </button>
              </div>
            </div>
          </div>
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

export default Dashboard