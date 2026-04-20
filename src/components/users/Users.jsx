// src/components/Users.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  User,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Shield,
  Award,
  Mail,
  Building2,
  AtSign,
  ToggleLeft,
  ToggleRight,
  Users as UsersIcon
} from 'lucide-react'

const ROLE_LABELS = {
  super_admin: 'Administrateur général',
  commercial: 'Commercial'
}

const ROLE_COLORS = {
  super_admin: 'badge-error',
  commercial: 'badge-info'
}

const ROLE_ICONS = {
  super_admin: Shield,
  commercial: Award
}

const Users = () => {
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [sortField, setSortField] = useState('email')
  const [sortDirection, setSortDirection] = useState('asc')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [togglingUserId, setTogglingUserId] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    superAdmin: 0,
    commercial: 0
  })

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await AxiosInstance.get('/users/')
      const data = res.data
      setUsers(data)
      
      // Calculer les statistiques
      const total = data.length
      const active = data.filter(u => u.is_active).length
      const inactive = total - active
      const superAdmin = data.filter(u => u.role === 'super_admin').length
      const commercial = data.filter(u => u.role === 'commercial').length
      
      setStats({ total, active, inactive, superAdmin, commercial })
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement des utilisateurs', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleToggleActive = async (user) => {
    setTogglingUserId(user.id)
    try {
      const newStatus = !user.is_active
      await AxiosInstance.patch(`/users/${user.id}/`, { is_active: newStatus })
      
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u)
      )
      
      showNotification(`Utilisateur ${newStatus ? 'activé' : 'désactivé'}`, 'success')
    } catch (error) {
      console.error(error)
      showNotification('Erreur lors du changement de statut', 'error')
    } finally {
      setTogglingUserId(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    try {
      await AxiosInstance.delete(`/users/${userToDelete.id}/`)
      showNotification(`Utilisateur "${userToDelete.email}" supprimé`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setUserToDelete(null)
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

  const filteredAndSortedUsers = React.useMemo(() => {
    let filtered = users.filter(u => {
      const search = searchTerm.toLowerCase()
      const email = (u.email || '').toLowerCase()
      const username = (u.username || '').toLowerCase()
      const matchesSearch = email.includes(search) || username.includes(search)
      const matchesRole = !filterRole || u.role === filterRole
      const matchesActive = filterActive === '' || u.is_active === (filterActive === 'true')
      return matchesSearch && matchesRole && matchesActive
    })

    filtered.sort((a, b) => {
      let aVal = (a[sortField] || '').toLowerCase()
      let bVal = (b[sortField] || '').toLowerCase()
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [users, searchTerm, filterRole, filterActive, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getRoleBadge = (role) => {
    const Icon = ROLE_ICONS[role] || User
    return (
      <span className={`badge ${ROLE_COLORS[role] || 'badge-ghost'} gap-1`}>
        <Icon className="w-3 h-3" />
        {ROLE_LABELS[role] || role}
      </span>
    )
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-3 h-3" /> : 
      <ChevronDown className="w-3 h-3" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base font-medium text-base-content/70 animate-pulse">
            Chargement des utilisateurs...
          </p>
        </div>
      </div>
    )
  }

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
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
            Utilisateurs
          </h1>
          <p className="text-xs lg:text-sm text-base-content/60">
            Gérez les comptes et les accès
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={fetchData}
            className="btn btn-outline btn-sm lg:btn-md gap-1 lg:gap-2"
          >
            <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button 
            onClick={() => navigate('/utilisateurs/nouveau')}
            className="btn btn-primary btn-sm lg:btn-md gap-1 lg:gap-2"
          >
            <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Nouvel utilisateur</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-3">
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-primary">
            <UsersIcon className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Total</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.total}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-success">
            <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Actifs</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.active}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-error">
            <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Inactifs</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.inactive}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-error">
            <Shield className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Admins</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.superAdmin}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4 col-span-2 lg:col-span-1">
          <div className="stat-figure text-info">
            <Award className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Commerciaux</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.commercial}</div>
        </div>
      </div>

      {/* Filtres - Desktop */}
      <div className="hidden lg:block bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher par email ou nom..."
              className="input input-bordered input-sm w-full pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          
          <select 
            className="select select-bordered select-sm min-w-[150px]"
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">Tous les rôles</option>
            {Object.entries(ROLE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          
          <select 
            className="select select-bordered select-sm w-32"
            value={filterActive}
            onChange={(e) => {
              setFilterActive(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">Tous statuts</option>
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </select>
          
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => {
              setFilterRole('')
              setFilterActive('')
              setSearchTerm('')
              setCurrentPage(1)
            }}
          >
            <Filter className="w-3 h-3" />
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Filtres - Mobile */}
      <div className="lg:hidden">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="input input-bordered input-sm w-full pl-8 text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter className="w-3 h-3" />
            Filtres
          </button>
        </div>

        {showMobileFilters && (
          <div className="mt-2 p-3 bg-base-100 rounded-lg border border-base-300 space-y-2">
            <select 
              className="select select-bordered select-sm w-full"
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Tous les rôles</option>
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            
            <select 
              className="select select-bordered select-sm w-full"
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Tous les statuts</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
            
            <button 
              className="btn btn-outline btn-sm w-full"
              onClick={() => {
                setFilterRole('')
                setFilterActive('')
                setSearchTerm('')
                setCurrentPage(1)
                setShowMobileFilters(false)
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Tableau - Desktop */}
      <div className="hidden lg:block bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr className="bg-base-200">
                <th className="w-12"></th>
                <th>
                  <button 
                    className="flex items-center gap-1 hover:text-primary font-semibold"
                    onClick={() => handleSort('email')}
                  >
                    Email / Nom
                    <SortIcon field="email" />
                  </button>
                </th>
                <th>Rôle</th>
                <th>Département</th>
                <th className="text-center">Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(user => {
                const RoleIcon = ROLE_ICONS[user.role] || User
                return (
                  <tr key={user.id} className="hover">
                    <td>
                      {user.profile_picture ? (
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-full">
                            <img src={user.profile_picture} alt={user.email} />
                          </div>
                        </div>
                      ) : (
                        <div className="avatar placeholder">
                          <div className={`bg-${ROLE_COLORS[user.role]?.replace('badge-', '') || 'primary'}/20 text-${ROLE_COLORS[user.role]?.replace('badge-', '') || 'primary'} rounded-full w-10 h-10`}>
                            <RoleIcon className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="font-medium text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3 text-base-content/50" />
                        {user.email}
                      </div>
                      {user.username && (
                        <div className="text-xs text-base-content/60 flex items-center gap-1 mt-0.5">
                          <AtSign className="w-3 h-3" />
                          {user.username}
                        </div>
                      )}
                    </td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>
                      {user.department ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Building2 className="w-3 h-3 text-base-content/50" />
                          {user.department}
                        </span>
                      ) : (
                        <span className="text-base-content/40">-</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleToggleActive(user)}
                        disabled={togglingUserId === user.id}
                        className="btn btn-ghost btn-sm"
                      >
                        {togglingUserId === user.id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : user.is_active ? (
                          <ToggleRight className="w-6 h-6 text-success" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-base-content/40" />
                        )}
                      </button>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button 
                          className="btn btn-ghost btn-xs"
                          onClick={() => navigate(`/utilisateurs/${user.id}/modifier`)}
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button 
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => {
                            setUserToDelete(user)
                            setShowDeleteModal(true)
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredAndSortedUsers.length === 0 && (
          <div className="p-12 text-center">
            <UsersIcon className="w-16 h-16 mx-auto mb-3 text-base-content/30" />
            <p className="text-base font-medium text-base-content/50">
              Aucun utilisateur trouvé
            </p>
            <p className="text-sm text-base-content/40 mt-1">
              Essayez de modifier vos critères de recherche
            </p>
            <button 
              className="btn btn-primary btn-sm mt-4"
              onClick={() => navigate('/utilisateurs/nouveau')}
            >
              <Plus className="w-3 h-3" />
              Créer un utilisateur
            </button>
          </div>
        )}
      </div>

      {/* Liste - Mobile */}
      <div className="lg:hidden space-y-2">
        {paginatedUsers.length === 0 ? (
          <div className="bg-base-100 rounded-xl p-8 text-center border border-base-300">
            <UsersIcon className="w-12 h-12 mx-auto mb-2 text-base-content/30" />
            <p className="text-sm font-medium text-base-content/50">
              Aucun utilisateur trouvé
            </p>
            <button 
              className="btn btn-primary btn-sm mt-3"
              onClick={() => navigate('/utilisateurs/nouveau')}
            >
              <Plus className="w-3 h-3" />
              Créer
            </button>
          </div>
        ) : (
          paginatedUsers.map(user => {
            const RoleIcon = ROLE_ICONS[user.role] || User
            return (
              <div key={user.id} className="bg-base-100 rounded-xl p-3 border border-base-300 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {user.profile_picture ? (
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-full">
                          <img src={user.profile_picture} alt={user.email} />
                        </div>
                      </div>
                    ) : (
                      <div className={`avatar placeholder`}>
                        <div className={`bg-${ROLE_COLORS[user.role]?.replace('badge-', '') || 'primary'}/20 text-${ROLE_COLORS[user.role]?.replace('badge-', '') || 'primary'} rounded-full w-12 h-12`}>
                          <RoleIcon className="w-6 h-6" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm flex items-center gap-1">
                          <Mail className="w-3 h-3 text-base-content/50" />
                          {user.email}
                        </p>
                        {user.username && (
                          <p className="text-xs text-base-content/60 flex items-center gap-1 mt-0.5">
                            <AtSign className="w-3 h-3" />
                            {user.username}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleToggleActive(user)}
                        disabled={togglingUserId === user.id}
                        className="btn btn-ghost btn-xs"
                      >
                        {togglingUserId === user.id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : user.is_active ? (
                          <ToggleRight className="w-5 h-5 text-success" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-base-content/40" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      {getRoleBadge(user.role)}
                      {user.department && (
                        <span className="text-xs flex items-center gap-1 text-base-content/60">
                          <Building2 className="w-3 h-3" />
                          {user.department}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-base-200">
                  <button 
                    className="btn btn-ghost btn-xs"
                    onClick={() => navigate(`/utilisateurs/${user.id}/modifier`)}
                  >
                    <Edit className="w-3 h-3" />
                    <span className="text-xs">Modifier</span>
                  </button>
                  <button 
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => {
                      setUserToDelete(user)
                      setShowDeleteModal(true)
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="text-xs">Supprimer</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {filteredAndSortedUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs lg:text-sm text-base-content/60">
            {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)} sur {filteredAndSortedUsers.length} utilisateurs
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              className="select select-bordered select-xs lg:select-sm w-20 lg:w-28"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value))
                setCurrentPage(1)
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            
            <div className="join">
              <button 
                className="join-item btn btn-xs lg:btn-sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
              
              <span className="join-item btn btn-xs lg:btn-sm no-animation">
                {currentPage} / {totalPages}
              </span>
              
              <button 
                className="join-item btn btn-xs lg:btn-sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md">
            <div className="text-center">
              <div className="avatar placeholder mb-4">
                <div className="bg-error/10 text-error rounded-full w-16 h-16">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              </div>
              <h3 className="font-bold text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-base-content/70 text-sm">
                Voulez-vous vraiment supprimer l'utilisateur
              </p>
              <p className="text-lg font-bold text-error mt-2">
                "{userToDelete?.email}"
              </p>
              <p className="text-xs text-base-content/50 mt-3">
                Cette action est irréversible.
              </p>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-error btn-sm"
                onClick={handleDeleteUser}
              >
                <Trash2 className="w-3 h-3" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users