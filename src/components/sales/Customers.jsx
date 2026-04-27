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
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des clients...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 bg-base-200 min-h-screen">
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="font-semibold">{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Clients
          </h1>
          <p className="text-xs text-base-content/60">Gérez votre portefeuille clients ({stats.total} au total)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn btn-sm btn-outline gap-1"><RefreshCw className="w-3 h-3" /> Actualiser</button>
          <button onClick={() => navigate('/clients/nouveau')} className="btn btn-sm btn-primary gap-1"><UserPlus className="w-3 h-3" /> Nouveau client</button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-primary"><Users className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Total</div>
          <div className="stat-value text-xl font-black">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-success"><CheckCircle className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Actifs</div>
          <div className="stat-value text-xl font-black">{stats.active}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-error"><XCircle className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">Inactifs</div>
          <div className="stat-value text-xl font-black">{stats.inactive}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2">
          <div className="stat-figure text-warning"><DollarSign className="w-5 h-5" /></div>
          <div className="stat-title text-xs font-semibold">CA total</div>
          <div className="stat-value text-sm font-black truncate">{formatNumber(stats.totalSpent)} €</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-base-content/40" />
            <input type="text" placeholder="Rechercher par nom, code, email..." className="input input-bordered w-full pl-8 text-sm input-sm" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-outline btn-sm sm:hidden gap-1"><Filter className="w-3 h-3" /> Filtres</button>
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex gap-2`}>
            <select className="select select-bordered select-sm w-32" value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1) }}>
              <option value="">Tous types</option>
              <option value="individual">Particuliers</option>
              <option value="company">Entreprises</option>
              <option value="government">Administrations</option>
              <option value="reseller">Revendeurs</option>
            </select>
            <select className="select select-bordered select-sm w-28" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}>
              <option value="">Tous statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
            <button className="btn btn-outline btn-sm gap-1" onClick={() => { setFilterType(''); setFilterStatus(''); setSearchTerm(''); setCurrentPage(1) }}><Filter className="w-3 h-3" /> Réinit</button>
          </div>
        </div>
      </div>

      {/* Tableau des clients */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
        {paginatedCustomers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-base-content/30" />
            <p className="font-semibold text-base-content/50">Aucun client trouvé</p>
            <button className="btn btn-sm btn-primary mt-3" onClick={() => navigate('/clients/nouveau')}><UserPlus className="w-3 h-3" /> Nouveau client</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table table-xs w-full">
                <thead>
                  <tr className="text-xs">
                    <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('code')}>Code<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('full_name')}>Client<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th>Type</th>
                    <th>Contact</th>
                    <th>Localisation</th>
                    <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('total_spent')}>CA<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th>Statut</th>
                    <th className="text-center">Actions</th>
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
                      <tr key={customer.id} className="hover">
                        <td className="font-mono text-xs font-semibold">{customer.code}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full bg-${badgeColor}/10 flex items-center justify-center`}>
                              <TypeIcon className={`w-3.5 h-3.5 text-${badgeColor}`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{displayName}</p>
                              {customer.company_name && customer.customer_type === 'individual' && (
                                <p className="text-xs text-base-content/50">{customer.company_name}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td><span className={`badge badge-${badgeColor} badge-xs`}>{typeInfo.label}</span></td>
                        <td>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-xs"><Mail className="w-3 h-3 text-primary" /><span className="truncate max-w-[150px]">{customer.email}</span></div>
                            <div className="flex items-center gap-1 text-xs"><Phone className="w-3 h-3 text-primary" />{customer.phone}</div>
                          </div>
                        </td>
                        <td className="text-xs">{customer.city || '-'}</td>
                        <td className="text-xs font-semibold">{formatNumber(customer.total_spent)} €</td>
                        <td>
                          {isActive ? (
                            <span className="badge badge-success badge-xs gap-1"><CheckCircle className="w-2.5 h-2.5" /> Actif</span>
                          ) : (
                            <span className="badge badge-ghost badge-xs gap-1"><XCircle className="w-2.5 h-2.5" /> Inactif</span>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => navigate(`/clients/${customer.id}`)} className="btn btn-ghost btn-xs" title="Détails"><Eye className="w-3.5 h-3.5" /></button>
                            <button onClick={() => navigate(`/clients/${customer.id}/modifier`)} className="btn btn-ghost btn-xs text-primary" title="Modifier"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => { setCustomerToDelete(customer); setShowDeleteModal(true) }} className="btn btn-ghost btn-xs text-error" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-base-100 border-t-2">
                  <tr className="text-xs font-bold">
                    <td colSpan="5" className="text-right">Total:</td>
                    <td className="font-bold">{formatNumber(sortedCustomers.reduce((s, c) => s + (parseFloat(c.total_spent) || 0), 0))} €</td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-3 border-t border-base-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="text-xs text-base-content/60">
                    {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedCustomers.length)} sur {sortedCustomers.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <select className="select select-bordered select-xs w-20" value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                    <div className="join">
                      <button className="join-item btn btn-xs" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="w-3 h-3" /></button>
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum = i + 1
                        if (totalPages > 5 && currentPage > 3) {
                          pageNum = currentPage - 2 + i
                          if (pageNum > totalPages) return null
                        }
                        return (
                          <button key={i} className={`join-item btn btn-xs ${currentPage === pageNum ? 'btn-primary' : ''}`} onClick={() => setCurrentPage(pageNum)}>
                            {pageNum}
                          </button>
                        )
                      })}
                      <button className="join-item btn btn-xs" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Suppression */}
      {showDeleteModal && customerToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4">
            <div className="text-center mb-3">
              <div className="avatar placeholder mb-2"><div className="bg-error/10 text-error rounded-full w-12 h-12"><AlertCircle className="w-6 h-6" /></div></div>
              <h3 className="font-bold text-base mb-1">Confirmer la suppression</h3>
              <p className="text-xs text-base-content/70">Supprimer "{customerToDelete.full_name || customerToDelete.company_name}" ?</p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn btn-sm btn-error flex-1" onClick={handleDeleteCustomer}>Supprimer</button>
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