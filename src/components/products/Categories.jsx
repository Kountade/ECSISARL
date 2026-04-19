// src/components/Categories.jsx
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
  Tags,
  X,
  AlertCircle,
  CheckCircle,
  Package,
  Eye,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  FolderTree,
  Folder,
  FolderOpen,
  Layers,
  AlertTriangle,
  ArrowUpDown,
  Image as ImageIcon,
  ExternalLink,
  Grid,
  BarChart3
} from 'lucide-react'

const Categories = () => {
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [viewMode, setViewMode] = useState('grid') // 'grid' ou 'table'
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withProducts: 0,
    parentCategories: 0,
    subCategories: 0
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get('/categories/')
      setCategories(response.data)
      
      // Calculer les statistiques
      const total = response.data.length
      const active = response.data.filter(c => c.is_active).length
      const inactive = total - active
      const withProducts = response.data.filter(c => (c.products_count || 0) > 0).length
      const parentCategories = response.data.filter(c => !c.parent).length
      const subCategories = total - parentCategories
      
      setStats({ 
        total, 
        active, 
        inactive, 
        withProducts, 
        parentCategories, 
        subCategories 
      })
      
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement des catégories', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return
    try {
      await AxiosInstance.delete(`/categories/${categoryToDelete.id}/`)
      showNotification(`Catégorie "${categoryToDelete.name}" supprimée avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setCategoryToDelete(null)
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

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // Construire l'arborescence des catégories
  const buildCategoryTree = (categories, parentId = null) => {
    return categories
      .filter(cat => cat.parent === parentId)
      .map(cat => ({
        ...cat,
        children: buildCategoryTree(categories, cat.id)
      }))
  }

  // Filtrage et tri des catégories
  const filteredAndSortedCategories = React.useMemo(() => {
    let filtered = categories.filter(category => {
      const search = searchTerm.toLowerCase()
      const name = (category.name || '').toLowerCase()
      const description = (category.description || '').toLowerCase()
      const matchesSearch = name.includes(search) || description.includes(search)
      const matchesActive = filterActive === '' || category.is_active === (filterActive === 'true')
      return matchesSearch && matchesActive
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (sortField === 'products_count' || sortField === 'subcategories_count') {
        aVal = parseInt(aVal) || 0
        bVal = parseInt(bVal) || 0
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [categories, searchTerm, filterActive, sortField, sortDirection])

  const categoryTree = buildCategoryTree(filteredAndSortedCategories)

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCategories.length / itemsPerPage)
  const paginatedCategories = filteredAndSortedCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <div className="badge badge-success gap-1">
        <CheckCircle className="w-3 h-3" />
        Actif
      </div>
    ) : (
      <div className="badge badge-ghost gap-1">
        <AlertCircle className="w-3 h-3" />
        Inactif
      </div>
    )
  }

  const renderCategoryTree = (categories, level = 0) => {
    return categories.map(category => (
      <div key={category.id} className="space-y-2">
        <div 
          className={`flex items-center gap-4 p-4 bg-base-100 rounded-xl border border-base-300 hover:shadow-md transition-all duration-200 ${
            level > 0 ? 'ml-8' : ''
          }`}
          style={{ marginLeft: `${level * 2}rem` }}
        >
          {/* Icône d'expansion pour les sous-catégories */}
          {category.children && category.children.length > 0 ? (
            <button
              onClick={() => toggleExpand(category.id)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              {expandedCategories.includes(category.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-8"></div>
          )}

          {/* Image */}
          <div className="flex-shrink-0">
            {category.image ? (
              <div className="avatar">
                <div className="w-12 h-12 rounded-xl">
                  <img src={category.image} alt={category.name} className="object-cover" />
                </div>
              </div>
            ) : (
              <div className="avatar placeholder">
                <div className="bg-primary/10 text-primary rounded-xl w-12 h-12">
                  {category.parent ? (
                    <Folder className="w-6 h-6" />
                  ) : (
                    <FolderOpen className="w-6 h-6" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Informations */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-lg text-base-content">{category.name}</h3>
              {getStatusBadge(category.is_active)}
              {!category.parent && (
                <span className="badge badge-primary badge-sm">Parent</span>
              )}
            </div>
            <p className="text-sm text-base-content/70 line-clamp-2">
              {category.description || 'Aucune description'}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-xs text-base-content/60">
                <Package className="w-3 h-3" />
                {category.products_count || 0} produit(s)
              </div>
              <div className="flex items-center gap-1 text-xs text-base-content/60">
                <Layers className="w-3 h-3" />
                {category.subcategories_count || 0} sous-catégorie(s)
              </div>
              {category.parent_name && (
                <div className="flex items-center gap-1 text-xs text-base-content/60">
                  <FolderTree className="w-3 h-3" />
                  Parent: {category.parent_name}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedCategory(category)
                setShowDetailsModal(true)
              }}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/categories/${category.id}/modifier`)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCategoryToDelete(category)
                setShowDeleteModal(true)
              }}
              className="btn btn-ghost btn-sm btn-circle text-error"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sous-catégories */}
        {expandedCategories.includes(category.id) && category.children && category.children.length > 0 && (
          <div className="border-l-2 border-primary/20 ml-4">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des catégories...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-semibold">{notification.message}</span>
            <button 
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-base-content mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Catégories
          </h1>
          <p className="text-base text-base-content/60">
            Organisez vos produits par catégories hiérarchiques
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={fetchData}
            className="btn btn-outline gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button 
            onClick={() => navigate('/categories/nouveau')}
            className="btn btn-primary gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle catégorie
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-primary">
            <FolderTree className="w-8 h-8" />
          </div>
          <div className="stat-title text-sm font-semibold">Total</div>
          <div className="stat-value text-2xl font-black">{stats.total}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-success">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="stat-title text-sm font-semibold">Actives</div>
          <div className="stat-value text-2xl font-black">{stats.active}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-info">
            <Folder className="w-8 h-8" />
          </div>
          <div className="stat-title text-sm font-semibold">Parents</div>
          <div className="stat-value text-2xl font-black">{stats.parentCategories}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-secondary">
            <Layers className="w-8 h-8" />
          </div>
          <div className="stat-title text-sm font-semibold">Sous-cat.</div>
          <div className="stat-value text-2xl font-black">{stats.subCategories}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-warning">
            <Package className="w-8 h-8" />
          </div>
          <div className="stat-title text-sm font-semibold">Avec produits</div>
          <div className="stat-value text-2xl font-black">{stats.withProducts}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-accent">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="stat-title text-sm font-semibold">Taux actif</div>
          <div className="stat-value text-2xl font-black">
            {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(0) : 0}%
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-300 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher par nom ou description..."
                className="input input-bordered w-full pl-12"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select 
              className="select select-bordered min-w-[150px]"
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
              className="btn btn-outline"
              onClick={() => {
                setFilterActive('')
                setSearchTerm('')
                setCurrentPage(1)
              }}
            >
              <Filter className="w-4 h-4" />
              Réinitialiser
            </button>
            
            <div className="join">
              <button 
                className={`join-item btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                className={`join-item btn ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('table')}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                className={`join-item btn ${viewMode === 'tree' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('tree')}
              >
                <FolderTree className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSortedCategories.length === 0 ? (
          <div className="p-12 text-center">
            <FolderTree className="w-20 h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-xl font-semibold text-base-content/50">
              Aucune catégorie trouvée
            </p>
            <p className="text-base text-base-content/40 mt-2">
              Essayez de modifier vos critères de recherche ou créez une nouvelle catégorie
            </p>
            <button 
              className="btn btn-primary mt-6 gap-2"
              onClick={() => navigate('/categories/nouveau')}
            >
              <Plus className="w-4 h-4" />
              Créer une catégorie
            </button>
          </div>
        ) : viewMode === 'tree' ? (
          /* Vue Arborescence */
          <div className="p-6 space-y-4">
            {renderCategoryTree(categoryTree)}
          </div>
        ) : viewMode === 'grid' ? (
          /* Vue Grille */
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedCategories.map((category) => (
                <div 
                  key={category.id} 
                  className="bg-base-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-base-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {category.image ? (
                        <div className="avatar">
                          <div className="w-14 h-14 rounded-xl">
                            <img src={category.image} alt={category.name} className="object-cover" />
                          </div>
                        </div>
                      ) : (
                        <div className="avatar placeholder">
                          <div className="bg-primary/10 text-primary rounded-xl w-14 h-14">
                            {category.parent ? (
                              <Folder className="w-7 h-7" />
                            ) : (
                              <FolderOpen className="w-7 h-7" />
                            )}
                          </div>
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg text-base-content">{category.name}</h3>
                        {getStatusBadge(category.is_active)}
                      </div>
                    </div>
                    
                    <div className="dropdown dropdown-end">
                      <button className="btn btn-ghost btn-sm btn-circle">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li>
                          <button onClick={() => {
                            setSelectedCategory(category)
                            setShowDetailsModal(true)
                          }}>
                            <Eye className="w-4 h-4" />
                            Voir détails
                          </button>
                        </li>
                        <li>
                          <button onClick={() => navigate(`/categories/${category.id}/modifier`)}>
                            <Edit className="w-4 h-4" />
                            Modifier
                          </button>
                        </li>
                        <li>
                          <button 
                            className="text-error"
                            onClick={() => {
                              setCategoryToDelete(category)
                              setShowDeleteModal(true)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <p className="text-sm text-base-content/70 mb-4 line-clamp-2">
                    {category.description || 'Aucune description'}
                  </p>
                  
                  <div className="space-y-2">
                    {category.parent_name && (
                      <div className="flex items-center gap-2 text-xs text-base-content/60">
                        <FolderTree className="w-3 h-3" />
                        Parent: {category.parent_name}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-base-content/60">
                        <Package className="w-3 h-3" />
                        Produits
                      </div>
                      <span className="badge">
                        {category.products_count || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-base-content/60">
                        <Layers className="w-3 h-3" />
                        Sous-catégories
                      </div>
                      <span className="badge">
                        {category.subcategories_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Vue Tableau */
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>
                    <button 
                      className="flex items-center gap-1 hover:text-primary"
                      onClick={() => handleSort('name')}
                    >
                      Nom
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th>Description</th>
                  <th>Catégorie parente</th>
                  <th>
                    <button 
                      className="flex items-center gap-1 hover:text-primary"
                      onClick={() => handleSort('products_count')}
                    >
                      Produits
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th>
                    <button 
                      className="flex items-center gap-1 hover:text-primary"
                      onClick={() => handleSort('subcategories_count')}
                    >
                      Sous-cat.
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((category) => (
                  <tr key={category.id} className="hover">
                    <td>
                      {category.image ? (
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-lg">
                            <img src={category.image} alt={category.name} />
                          </div>
                        </div>
                      ) : (
                        <div className="avatar placeholder">
                          <div className="bg-primary/10 text-primary rounded-lg w-10 h-10">
                            {category.parent ? (
                              <Folder className="w-5 h-5" />
                            ) : (
                              <FolderOpen className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="font-semibold">{category.name}</td>
                    <td className="max-w-xs truncate text-base-content/70">
                      {category.description || '-'}
                    </td>
                    <td>
                      {category.parent ? category.parent_name || `ID: ${category.parent}` : '-'}
                    </td>
                    <td>
                      <span className="badge">
                        {category.products_count || 0}
                      </span>
                    </td>
                    <td>
                      <span className="badge">
                        {category.subcategories_count || 0}
                      </span>
                    </td>
                    <td>{getStatusBadge(category.is_active)}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button 
                          className="btn btn-ghost btn-xs"
                          onClick={() => {
                            setSelectedCategory(category)
                            setShowDetailsModal(true)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="btn btn-ghost btn-xs"
                          onClick={() => navigate(`/categories/${category.id}/modifier`)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => {
                            setCategoryToDelete(category)
                            setShowDeleteModal(true)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredAndSortedCategories.length > 0 && viewMode !== 'tree' && (
          <div className="p-4 border-t border-base-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-base-content/60">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedCategories.length)} sur{' '}
                {filteredAndSortedCategories.length} catégories
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  className="select select-bordered select-sm"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value))
                    setCurrentPage(1)
                  }}
                >
                  <option value="12">12 par page</option>
                  <option value="24">24 par page</option>
                  <option value="48">48 par page</option>
                  <option value="96">96 par page</option>
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
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
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
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="text-center mb-6">
              <div className="avatar placeholder mb-4">
                <div className="bg-error/10 text-error rounded-full w-20 h-20">
                  <AlertTriangle className="w-10 h-10" />
                </div>
              </div>
              <h3 className="font-bold text-2xl mb-2">Confirmer la suppression</h3>
              <p className="text-base-content/70">
                Voulez-vous vraiment supprimer la catégorie
              </p>
              <p className="text-xl font-bold text-error mt-2">
                "{categoryToDelete?.name}" ?
              </p>
              <p className="text-sm text-base-content/50 mt-4">
                Cette action est irréversible. Les sous-catégories et produits associés pourraient être affectés.
              </p>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-error"
                onClick={handleDeleteCategory}
              >
                <Trash2 className="w-4 h-4" />
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetailsModal && selectedCategory && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-2xl">Détails de la catégorie</h3>
              <button 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowDetailsModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-6 mb-6">
                {selectedCategory.image ? (
                  <div className="avatar">
                    <div className="w-24 h-24 rounded-xl">
                      <img src={selectedCategory.image} alt={selectedCategory.name} />
                    </div>
                  </div>
                ) : (
                  <div className="avatar placeholder">
                    <div className="bg-primary/10 text-primary rounded-xl w-24 h-24">
                      {selectedCategory.parent ? (
                        <Folder className="w-12 h-12" />
                      ) : (
                        <FolderOpen className="w-12 h-12" />
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-2xl mb-2">{selectedCategory.name}</h4>
                  {getStatusBadge(selectedCategory.is_active)}
                </div>
              </div>
              
              <div className="divider">Informations</div>
              
              <div className="space-y-3">
                {selectedCategory.description && (
                  <div>
                    <label className="text-sm font-semibold text-base-content/60">Description</label>
                    <p className="mt-1">{selectedCategory.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-base-content/60">Catégorie parente</label>
                    <p className="mt-1">{selectedCategory.parent_name || 'Aucune (catégorie racine)'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-base-content/60">Date de création</label>
                    <p className="mt-1">
                      {selectedCategory.created_at ? new Date(selectedCategory.created_at).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-base-content/60">Produits associés</label>
                    <p className="text-2xl font-bold mt-1">{selectedCategory.products_count || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-base-content/60">Sous-catégories</label>
                    <p className="text-2xl font-bold mt-1">{selectedCategory.subcategories_count || 0}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowDetailsModal(false)
                  navigate(`/categories/${selectedCategory.id}/modifier`)
                }}
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
              <button 
                className="btn btn-ghost"
                onClick={() => setShowDetailsModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories