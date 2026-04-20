// src/components/purchases/Fournisseurs.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Plus,
  Search,
  RefreshCw,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  Star,
  Edit,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  History,
  Award,
  Eye,
  Users
} from 'lucide-react'

const Fournisseurs = () => {
  const navigate = useNavigate()

  const [fournisseurs, setFournisseurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [fournisseurToDelete, setFournisseurToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterPreferred, setFilterPreferred] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState('company_name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const [stats, setStats] = useState({
    total: 0,
    actifs: 0,
    preferes: 0,
    noteMoyenne: 0
  })

  const supplierTypes = {
    manufacturer: 'Fabricant',
    distributor: 'Distributeur',
    wholesaler: 'Grossiste',
    importer: 'Importateur',
    service: 'Prestataire'
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchFournisseurs = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await AxiosInstance.get('/suppliers/')
      const data = response.data
      setFournisseurs(data)
      
      setStats({
        total: data.length,
        actifs: data.filter(f => f.is_active).length,
        preferes: data.filter(f => f.is_preferred).length,
        noteMoyenne: data.filter(f => f.rating).reduce((acc, f) => acc + f.rating, 0) / 
                     (data.filter(f => f.rating).length || 1)
      })
      
    } catch (error) {
      console.error('Erreur:', error)
      let errorMessage = 'Erreur lors du chargement des fournisseurs'
      if (error.response?.status === 401) errorMessage = 'Session expirée.'
      else if (error.code === 'ERR_NETWORK') errorMessage = 'Serveur inaccessible.'
      setError(errorMessage)
      showNotification(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFournisseurs()
  }, [])

  const handleDelete = async () => {
    if (!fournisseurToDelete) return
    try {
      await AxiosInstance.delete(`/suppliers/${fournisseurToDelete.id}/`)
      showNotification('Fournisseur supprimé', 'success')
      fetchFournisseurs()
      setShowDeleteModal(false)
      setFournisseurToDelete(null)
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

  const filteredFournisseurs = fournisseurs.filter(f => {
    const matchesSearch = 
      (f.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || f.supplier_type === filterType
    const matchesPreferred = !filterPreferred || 
      (filterPreferred === 'preferred' && f.is_preferred) ||
      (filterPreferred === 'non_preferred' && !f.is_preferred)
    return matchesSearch && matchesType && matchesPreferred
  })

  const sortedFournisseurs = [...filteredFournisseurs].sort((a, b) => {
    let aVal = (a[sortField] || '').toString().toLowerCase()
    let bVal = (b[sortField] || '').toString().toLowerCase()
    
    if (sortField === 'rating') {
      aVal = parseFloat(a[sortField]) || 0
      bVal = parseFloat(b[sortField]) || 0
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedFournisseurs.length / itemsPerPage)
  const paginatedFournisseurs = sortedFournisseurs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 opacity-40" />
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0)
    const emptyStars = 5 - fullStars
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-warning text-warning" />
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-base-content/30" />
        ))}
        <span className="text-sm text-base-content/60 ml-1">({(rating || 0).toFixed(1)})</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-3 lg:p-6">
        <div className="bg-error/10 border border-error/30 rounded-xl p-6 text-center max-w-2xl mx-auto">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-error" />
          <h2 className="text-xl font-bold text-error mb-2">Erreur de chargement</h2>
          <p className="text-base-content/70 mb-6">{error}</p>
          <button onClick={fetchFournisseurs} className="btn btn-primary gap-2">
            <RefreshCw className="w-4 h-4" /> Réessayer
          </button>
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
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ ...notification, show: false })}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" /> Fournisseurs
          </h1>
          <p className="text-sm lg:text-base text-base-content/60 mt-1">Gérez vos partenaires commerciaux</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={fetchFournisseurs} className="btn btn-outline btn-sm lg:btn-md gap-2">
            <RefreshCw className="w-4 h-4" /> <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button onClick={() => navigate('/fournisseurs/nouveau')} className="btn btn-primary btn-sm lg:btn-md gap-2">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-primary p-3 lg:p-4">
          <div className="stat-figure text-primary"><Building2 className="w-6 h-6" /></div>
          <div className="stat-title text-sm">Total</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-success p-3 lg:p-4">
          <div className="stat-figure text-success"><CheckCircle className="w-6 h-6" /></div>
          <div className="stat-title text-sm">Actifs</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.actifs}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-warning p-3 lg:p-4">
          <div className="stat-figure text-warning"><Star className="w-6 h-6 fill-warning" /></div>
          <div className="stat-title text-sm">Préférés</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.preferes}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-info p-3 lg:p-4">
          <div className="stat-figure text-info"><Award className="w-6 h-6" /></div>
          <div className="stat-title text-sm">Note moyenne</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.noteMoyenne.toFixed(1)}</div>
        </div>
      </div>

      {/* Filtres - Desktop */}
      <div className="hidden lg:flex bg-base-100 rounded-xl shadow-sm border border-base-300 p-4 items-center gap-3">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
          <input type="text" placeholder="Rechercher par code, société, contact, email..." className="input input-bordered w-full pl-10"
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} />
        </div>
        <select className="select select-bordered w-44" value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1) }}>
          <option value="">Tous les types</option>
          {Object.entries(supplierTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="select select-bordered w-40" value={filterPreferred} onChange={(e) => { setFilterPreferred(e.target.value); setCurrentPage(1) }}>
          <option value="">Tous</option>
          <option value="preferred">Préférés</option>
          <option value="non_preferred">Non préférés</option>
        </select>
        <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setFilterType(''); setFilterPreferred(''); setCurrentPage(1) }}>
          <Filter className="w-4 h-4" /> Réinitialiser
        </button>
      </div>

      {/* Filtres - Mobile */}
      <div className="lg:hidden">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input type="text" placeholder="Rechercher..." className="input input-bordered input-sm w-full pl-9"
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} />
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setShowMobileFilters(!showMobileFilters)}>
            <Filter className="w-4 h-4" /> Filtres
          </button>
        </div>
        {showMobileFilters && (
          <div className="mt-2 p-3 bg-base-100 rounded-lg border border-base-300 space-y-2">
            <select className="select select-bordered select-sm w-full" value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1) }}>
              <option value="">Tous types</option>
              {Object.entries(supplierTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select className="select select-bordered select-sm w-full" value={filterPreferred} onChange={(e) => { setFilterPreferred(e.target.value); setCurrentPage(1) }}>
              <option value="">Tous</option>
              <option value="preferred">Préférés</option>
              <option value="non_preferred">Non préférés</option>
            </select>
            <button className="btn btn-outline btn-sm w-full" onClick={() => { setSearchTerm(''); setFilterType(''); setFilterPreferred(''); setCurrentPage(1); setShowMobileFilters(false) }}>
              Réinitialiser
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
                <th><button className="flex items-center gap-1 font-semibold" onClick={() => handleSort('code')}>Code <SortIcon field="code" /></button></th>
                <th><button className="flex items-center gap-1 font-semibold" onClick={() => handleSort('company_name')}>Raison sociale <SortIcon field="company_name" /></button></th>
                <th>Contact</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Ville</th>
                <th>Type</th>
                <th><button className="flex items-center gap-1 font-semibold" onClick={() => handleSort('rating')}>Note <SortIcon field="rating" /></button></th>
                <th className="text-center">Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFournisseurs.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-base-content/50">Aucun fournisseur trouvé</td></tr>
              ) : (
                paginatedFournisseurs.map((f) => (
                  <tr key={f.id} className="hover">
                    <td className="font-mono">{f.code}</td>
                    <td className="font-medium">{f.company_name}</td>
                    <td>{f.contact_name}</td>
                    <td>{f.email}</td>
                    <td>{f.phone}</td>
                    <td>{f.city}</td>
                    <td><span className="badge badge-outline">{supplierTypes[f.supplier_type] || f.supplier_type}</span></td>
                    <td>{renderStars(f.rating)}</td>
                    <td className="text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <span className={`badge ${f.is_active ? 'badge-success' : 'badge-error'}`}>{f.is_active ? 'Actif' : 'Inactif'}</span>
                        {f.is_preferred && <span className="badge badge-warning gap-1"><Star className="w-3 h-3 fill-warning" />Préféré</span>}
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/fournisseurs/${f.id}`)}><Eye className="w-4 h-4" /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/fournisseurs/${f.id}/historique`)}><History className="w-4 h-4" /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/fournisseurs/${f.id}/modifier`)}><Edit className="w-4 h-4" /></button>
                        <button className="btn btn-ghost btn-sm text-error" onClick={() => { setFournisseurToDelete(f); setShowDeleteModal(true) }}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Liste - Mobile */}
      <div className="lg:hidden space-y-2">
        {paginatedFournisseurs.length === 0 ? (
          <div className="bg-base-100 rounded-xl p-8 text-center border border-base-300 text-base-content/50">Aucun fournisseur</div>
        ) : (
          paginatedFournisseurs.map((f) => (
            <div key={f.id} className={`bg-base-100 rounded-xl p-4 border-l-4 ${f.is_preferred ? 'border-warning' : f.is_active ? 'border-success' : 'border-gray-400'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-sm text-base-content/60">{f.code}</span>
                  <h3 className="font-bold text-base">{f.company_name}</h3>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`badge ${f.is_active ? 'badge-success' : 'badge-error'}`}>{f.is_active ? 'Actif' : 'Inactif'}</span>
                  {f.is_preferred && <span className="badge badge-warning gap-1"><Star className="w-3 h-3" /> Préféré</span>}
                </div>
              </div>
              <div className="text-sm space-y-1 mt-3">
                <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {f.contact_name}</div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {f.email}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {f.phone}</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {f.city}</div>
                <div className="flex items-center justify-between">
                  <span className="badge badge-outline">{supplierTypes[f.supplier_type]}</span>
                  {renderStars(f.rating)}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-base-200">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/fournisseurs/${f.id}`)}><Eye className="w-4 h-4" /> Voir</button>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/fournisseurs/${f.id}/modifier`)}><Edit className="w-4 h-4" /> Modifier</button>
                <button className="btn btn-ghost btn-sm text-error" onClick={() => { setFournisseurToDelete(f); setShowDeleteModal(true) }}><Trash2 className="w-4 h-4" /> Supprimer</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {sortedFournisseurs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-base-content/60">
            {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedFournisseurs.length)} sur {sortedFournisseurs.length} fournisseurs
          </div>
          <div className="flex items-center gap-2">
            <select className="select select-bordered select-sm w-20" value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}>
              <option value="10">10</option><option value="25">25</option><option value="50">50</option>
            </select>
            <div className="join">
              <button className="join-item btn btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" /></button>
              <span className="join-item btn btn-sm no-animation">{currentPage} / {totalPages}</span>
              <button className="join-item btn btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md">
            <div className="text-center">
              <div className="bg-error/10 text-error rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center"><AlertTriangle className="w-10 h-10" /></div>
              <h3 className="font-bold text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-base mb-2">Voulez-vous vraiment supprimer le fournisseur</p>
              <p className="text-xl font-bold text-error">"{fournisseurToDelete?.company_name}" ?</p>
              <p className="text-sm text-base-content/50 mt-3">Cette action est irréversible.</p>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn btn-error" onClick={handleDelete}><Trash2 className="w-4 h-4" /> Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Fournisseurs