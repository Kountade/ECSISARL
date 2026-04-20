// src/components/entrepots/Warehouses.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Plus,
  Search,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle,
  Warehouse,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Building2,
  Globe,
  Hash,
  Filter,
  Eye,
  Package
} from 'lucide-react'

const Warehouses = () => {
  const navigate = useNavigate()
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [warehouseToDelete, setWarehouseToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(9)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const WAREHOUSE_TYPES = [
    { value: 'main', label: 'Entrepôt principal', color: 'primary' },
    { value: 'secondary', label: 'Entrepôt secondaire', color: 'secondary' },
    { value: 'store', label: 'Magasin', color: 'accent' },
    { value: 'transit', label: 'Zone de transit', color: 'info' },
    { value: 'returns', label: 'Zone de retour', color: 'warning' },
    { value: 'quarantine', label: 'Zone de quarantaine', color: 'error' }
  ]

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    main: 0,
    default: 0
  })

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const getWarehouseTypeLabel = (type) => {
    const typeObj = WAREHOUSE_TYPES.find(t => t.value === type)
    return typeObj?.label || type || 'Non spécifié'
  }

  const getWarehouseTypeColor = (type) => {
    const typeObj = WAREHOUSE_TYPES.find(t => t.value === type)
    return typeObj?.color || 'ghost'
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await AxiosInstance.get('/warehouses/')
      const data = response.data
      
      const processedData = data.map(warehouse => ({
        ...warehouse,
        warehouse_type: warehouse.warehouse_type || 'main'
      }))
      
      setWarehouses(processedData)
      
      setStats({
        total: processedData.length,
        active: processedData.filter(w => w.is_active).length,
        main: processedData.filter(w => w.warehouse_type === 'main').length,
        default: processedData.filter(w => w.is_default).length
      })
      
    } catch (err) {
      console.error('Error fetching warehouses:', err)
      let errorMessage = 'Erreur lors du chargement des entrepôts'
      
      if (err.response?.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.'
      } else if (err.response?.status === 404) {
        errorMessage = 'API des entrepôts non trouvée.'
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      } else if (!err.response) {
        errorMessage = 'Impossible de contacter le serveur.'
      }
      
      setError(errorMessage)
      showNotification(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async () => {
    if (!warehouseToDelete) return
    
    try {
      await AxiosInstance.delete(`/warehouses/${warehouseToDelete.id}/`)
      showNotification('Entrepôt supprimé avec succès', 'success')
      fetchData()
      setShowDeleteModal(false)
      setWarehouseToDelete(null)
    } catch (err) {
      console.error('Erreur:', err)
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  const filteredWarehouses = warehouses.filter(w => {
    const matchesSearch = (w.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (w.code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (w.city?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesType = !filterType || w.warehouse_type === filterType
    const matchesActive = filterActive === '' || w.is_active === (filterActive === 'true')
    
    return matchesSearch && matchesType && matchesActive
  })

  const totalPages = Math.ceil(filteredWarehouses.length / itemsPerPage)
  const paginatedWarehouses = filteredWarehouses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base font-medium text-base-content/70 animate-pulse">
            Chargement des entrepôts...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-3 lg:p-6">
        <div className="bg-error/10 border border-error/30 rounded-xl p-6 lg:p-8 text-center max-w-2xl mx-auto">
          <AlertTriangle className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 text-error" />
          <h2 className="text-xl lg:text-2xl font-bold text-error mb-2">
            Erreur de chargement
          </h2>
          <p className="text-base-content/70 mb-4 whitespace-pre-wrap">
            {error}
          </p>
          <p className="text-sm text-base-content/60 mb-6">
            Vérifiez que le backend est lancé et que les migrations sont à jour.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={fetchData} className="btn btn-primary gap-2">
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </button>
            <button 
              onClick={() => window.open('http://127.0.0.1:8000/admin', '_blank')}
              className="btn btn-outline gap-2"
            >
              <Eye className="w-4 h-4" />
              Voir l'admin
            </button>
          </div>
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
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content flex items-center gap-2">
            <Warehouse className="w-7 h-7 lg:w-8 lg:h-8 text-primary" />
            Gestion des Entrepôts
          </h1>
          <p className="text-xs lg:text-sm text-base-content/60 mt-1">
            Gérez vos différents lieux de stockage
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
          {/* Redirection vers /entrepots/nouveau */}
          <button 
            onClick={() => navigate('/entrepots/nouveau')}
            className="btn btn-primary btn-sm lg:btn-md gap-1 lg:gap-2"
          >
            <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Nouvel entrepôt</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-primary">
            <Warehouse className="w-5 h-5 lg:w-6 lg:h-6" />
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
          <div className="stat-figure text-info">
            <Building2 className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Principaux</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.main}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-warning">
            <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Par défaut</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.default}</div>
        </div>
      </div>

      {/* Filtres - Desktop */}
      <div className="hidden lg:block bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher par code, nom, ville..."
              className="input input-bordered input-sm w-full pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          
          <select 
            className="select select-bordered select-sm min-w-[180px]"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">Tous les types</option>
            {WAREHOUSE_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
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
              setSearchTerm('')
              setFilterType('')
              setFilterActive('')
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
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Tous les types</option>
              {WAREHOUSE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
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
                setSearchTerm('')
                setFilterType('')
                setFilterActive('')
                setCurrentPage(1)
                setShowMobileFilters(false)
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Grille des entrepôts */}
      {filteredWarehouses.length === 0 ? (
        <div className="bg-base-100 rounded-xl p-8 lg:p-12 text-center border border-base-300">
          <Warehouse className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-3 text-base-content/30" />
          <p className="text-base lg:text-lg font-medium text-base-content/50">
            {searchTerm || filterType || filterActive ? 'Aucun entrepôt trouvé' : 'Aucun entrepôt enregistré'}
          </p>
          {!searchTerm && !filterType && !filterActive && (
            <button 
              className="btn btn-primary btn-sm lg:btn-md mt-4 gap-2"
              onClick={() => navigate('/entrepots/nouveau')}
            >
              <Plus className="w-4 h-4" />
              Ajouter un entrepôt
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {paginatedWarehouses.map((warehouse) => {
            const typeColor = getWarehouseTypeColor(warehouse.warehouse_type)
            
            return (
              <div 
                key={warehouse.id} 
                className={`bg-base-100 rounded-xl lg:rounded-2xl shadow-lg border-l-4 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  warehouse.is_default 
                    ? 'border-success' 
                    : warehouse.is_active 
                      ? 'border-primary' 
                      : 'border-gray-400'
                }`}
              >
                <div className="p-4 lg:p-5">
                  {/* Badges */}
                  <div className="flex justify-end gap-2 mb-2">
                    {warehouse.is_default && (
                      <span className="badge badge-success badge-sm">Défaut</span>
                    )}
                    {!warehouse.is_active && (
                      <span className="badge badge-error badge-sm">Inactif</span>
                    )}
                  </div>
                  
                  {/* En-tête */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`avatar placeholder`}>
                      <div className={`bg-${typeColor}/10 rounded-xl w-14 h-14 lg:w-16 lg:h-16`}>
                        <Warehouse className={`w-7 h-7 lg:w-8 lg:h-8 text-${typeColor}`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base lg:text-lg truncate">{warehouse.name}</h3>
                      <p className="text-xs text-base-content/60 flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {warehouse.code}
                      </p>
                      <span className={`badge badge-${typeColor} badge-xs mt-1`}>
                        {getWarehouseTypeLabel(warehouse.warehouse_type)}
                      </span>
                    </div>
                  </div>

                  <div className="divider my-2"></div>

                  {/* Localisation */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-base-content/50 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm">{warehouse.address || 'Adresse non renseignée'}</p>
                        {(warehouse.city || warehouse.postal_code) && (
                          <p className="text-xs text-base-content/60">
                            {warehouse.city} {warehouse.postal_code}
                          </p>
                        )}
                        {warehouse.country && (
                          <p className="text-xs text-base-content/60 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {warehouse.country}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  {(warehouse.phone || warehouse.email) && (
                    <>
                      <div className="divider my-2"></div>
                      <div className="space-y-1.5">
                        {warehouse.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-base-content/50" />
                            <span>{warehouse.phone}</span>
                          </div>
                        )}
                        {warehouse.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-base-content/50" />
                            <span className="truncate">{warehouse.email}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-1 mt-4 pt-2 border-t border-base-200">
                    <button 
                      className="btn btn-ghost btn-xs"
                      onClick={() => navigate(`/entrepots/${warehouse.id}/modifier`)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => {
                        setWarehouseToDelete(warehouse)
                        setShowDeleteModal(true)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {filteredWarehouses.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs lg:text-sm text-base-content/60">
            {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredWarehouses.length)} sur {filteredWarehouses.length} entrepôts
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
              <option value="9">9</option>
              <option value="18">18</option>
              <option value="27">27</option>
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
                Êtes-vous sûr de vouloir supprimer l'entrepôt
              </p>
              <p className="text-lg font-bold text-error mt-2">
                "{warehouseToDelete?.name}"
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
                onClick={handleDelete}
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

export default Warehouses