// src/components/clients/Customers.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  Eye,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  DollarSign,
  CreditCard,
  Building2,
  User,
  Briefcase,
  Landmark,
  Store,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  XCircle
} from 'lucide-react'

const Customers = () => {
  const navigate = useNavigate()

  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [sortField, setSortField] = useState('code')
  const [sortDirection, setSortDirection] = useState('asc')
  const [showFilters, setShowFilters] = useState(false)

  const customerTypes = {
    individual: { label: 'Particulier', icon: User, color: 'primary' },
    company: { label: 'Entreprise', icon: Building2, color: 'secondary' },
    government: { label: 'Administration', icon: Landmark, color: 'info' },
    reseller: { label: 'Revendeur', icon: Store, color: 'warning' }
  }

  const formatNumber = (number) => {
    if (!number) return '0,00'
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number)
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get('/customers/')
      setCustomers(response.data || [])
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement des clients', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return
    try {
      await AxiosInstance.delete(`/customers/${customerToDelete.id}/`)
      showNotification('Client supprimé avec succès', 'success')
      fetchData()
      setShowDeleteModal(false)
      setCustomerToDelete(null)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const search = searchTerm.toLowerCase()
    const name = (customer.full_name || customer.company_name || '').toLowerCase()
    const code = (customer.code || '').toLowerCase()
    const email = (customer.email || '').toLowerCase()
    const matchesSearch = name.includes(search) || code.includes(search) || email.includes(search)
    const matchesType = !filterType || customer.customer_type === filterType
    const matchesStatus = !filterStatus || (filterStatus === 'active' ? customer.is_active : !customer.is_active)
    return matchesSearch && matchesType && matchesStatus
  })

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aVal = a[sortField] || ''
    let bVal = b[sortField] || ''
    if (sortField === 'total_spent') {
      aVal = parseFloat(aVal) || 0
      bVal = parseFloat(bVal) || 0
    } else if (sortField === 'full_name') {
      aVal = (a.full_name || a.company_name || '').toLowerCase()
      bVal = (b.full_name || b.company_name || '').toLowerCase()
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage)
  const paginatedCustomers = sortedCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.is_active).length,
    inactive: customers.filter(c => !c.is_active).length,
    totalSpent: customers.reduce((sum, c) => sum + (parseFloat(c.total_spent) || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12"></div>
          <p className="text-base font-semibold text-gray-600">Chargement des clients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-gray-100 min-h-screen">
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
          <p className="text-sm text-gray-500">Gérez votre portefeuille clients ({stats.total} au total)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn btn-outline btn-sm gap-2">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={() => navigate('/clients/nouveau')} className="btn btn-primary btn-sm gap-2">
            <UserPlus className="w-4 h-4" /> Nouveau client
          </button>
        </div>
      </div>

      {/* Cartes statistiques (style NotificationsPage) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-primary">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-sm text-gray-600 font-medium">Total clients</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-success">
          <div className="text-2xl font-bold text-success">{stats.active}</div>
          <div className="text-sm text-gray-600 font-medium">Actifs</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-error">
          <div className="text-2xl font-bold text-error">{stats.inactive}</div>
          <div className="text-sm text-gray-600 font-medium">Inactifs</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-warning">
          <div className="text-2xl font-bold text-warning drop-shadow-sm">{formatNumber(stats.totalSpent)} €</div>
          <div className="text-sm text-gray-600 font-medium">CA total</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="label text-xs font-semibold text-gray-600 mb-1">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nom, code, email..."
                className="input input-bordered w-full pl-9 py-2 h-10 text-sm"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              />
            </div>
          </div>
          <div className="w-44">
            <label className="label text-xs font-semibold text-gray-600 mb-1">Type</label>
            <select
              className="select select-bordered w-full h-10 text-sm"
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1) }}
            >
              <option value="">Tous</option>
              <option value="individual">Particuliers</option>
              <option value="company">Entreprises</option>
              <option value="government">Administrations</option>
              <option value="reseller">Revendeurs</option>
            </select>
          </div>
          <div className="w-40">
            <label className="label text-xs font-semibold text-gray-600 mb-1">Statut</label>
            <select
              className="select select-bordered w-full h-10 text-sm"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}
            >
              <option value="">Tous</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
          <div>
            <button
              className="btn btn-outline h-10 px-5 gap-2 text-sm"
              onClick={() => { setFilterType(''); setFilterStatus(''); setSearchTerm(''); setCurrentPage(1) }}
            >
              <Filter className="w-4 h-4" /> Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des clients */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {paginatedCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucun client trouvé</p>
            <button className="btn btn-primary btn-sm mt-4" onClick={() => navigate('/clients/nouveau')}>
              <UserPlus className="w-4 h-4" /> Nouveau client
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-sm font-semibold text-gray-700">
                    <th className="py-3 px-4"><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('code')}>Code <ArrowUpDown className="w-4 h-4" /></button></th>
                    <th className="py-3 px-4"><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('full_name')}>Client <ArrowUpDown className="w-4 h-4" /></button></th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Localisation</th>
                    <th className="py-3 px-4 text-right"><button className="flex items-center gap-1 hover:text-primary justify-end" onClick={() => handleSort('total_spent')}>CA <ArrowUpDown className="w-4 h-4" /></button></th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.map((customer) => {
                    const typeInfo = customerTypes[customer.customer_type] || customerTypes.individual
                    const TypeIcon = typeInfo.icon
                    const displayName = customer.full_name || customer.company_name
                    const isActive = customer.is_active !== false
                    const badgeColor = typeInfo.color
                    return (
                      <tr key={customer.id} className="border-b hover:bg-gray-50 text-sm">
                        <td className="py-3 px-4 font-mono text-sm font-semibold">{customer.code}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full bg-${badgeColor}/10 flex items-center justify-center`}>
                              <TypeIcon className={`w-4 h-4 text-${badgeColor}`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{displayName}</p>
                              {customer.company_name && customer.customer_type === 'individual' && (
                                <p className="text-xs text-gray-500">{customer.company_name}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4"><span className={`badge badge-${badgeColor} badge-sm text-xs`}>{typeInfo.label}</span></td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm"><Mail className="w-3.5 h-3.5 text-gray-400" /><span className="truncate max-w-[180px]">{customer.email}</span></div>
                            <div className="flex items-center gap-1 text-sm"><Phone className="w-3.5 h-3.5 text-gray-400" />{customer.phone}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{customer.city || '-'}</td>
                        <td className="py-3 px-4 text-right font-semibold">{formatNumber(customer.total_spent)} €</td>
                        <td className="py-3 px-4">
                          {isActive ? (
                            <span className="badge badge-success badge-sm gap-1"><CheckCircle className="w-3 h-3" /> Actif</span>
                          ) : (
                            <span className="badge badge-ghost badge-sm gap-1"><XCircle className="w-3 h-3" /> Inactif</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => navigate(`/clients/${customer.id}`)} className="btn btn-ghost btn-sm" title="Détails"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => navigate(`/clients/${customer.id}/modifier`)} className="btn btn-ghost btn-sm text-primary" title="Modifier"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => { setCustomerToDelete(customer); setShowDeleteModal(true) }} className="btn btn-ghost btn-sm text-error" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr className="text-sm font-semibold">
                    <td colSpan="5" className="py-3 px-4 text-right">Total :</td>
                    <td className="py-3 px-4 text-right font-bold">{formatNumber(sortedCustomers.reduce((s, c) => s + (parseFloat(c.total_spent) || 0), 0))} €</td>
                    <td colSpan="2" className="py-3 px-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap justify-between items-center gap-3">
                <div className="text-sm text-gray-500">
                  {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedCustomers.length)} sur {sortedCustomers.length}
                </div>
                <div className="flex items-center gap-3">
                  <select
                    className="select select-bordered select-sm w-20 text-sm"
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <div className="join">
                    <button
                      className="join-item btn btn-sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum = i + 1
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = currentPage - 2 + i
                        if (pageNum > totalPages) return null
                      }
                      return (
                        <button
                          key={i}
                          className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button
                      className="join-item btn btn-sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal suppression */}
      {showDeleteModal && customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-error" />
            </div>
            <h3 className="text-xl font-bold mb-2">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le client <strong className="text-error">"{customerToDelete.full_name || customerToDelete.company_name}"</strong> ? Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline">Annuler</button>
              <button onClick={handleDeleteCustomer} className="btn btn-error">Supprimer</button>
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

export default Customers