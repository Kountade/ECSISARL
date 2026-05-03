// src/components/sales/Quotations.jsx
import React, { useEffect, useState } from 'react'
import {
  Plus,
  Trash2,
  Search,
  Users,
  RefreshCw,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Send,
  Check,
  Warehouse,
  Home,
  Store,
  Loader2,
  Receipt,
  X
} from 'lucide-react'
import AxiosInstance from '../AxiosInstance'
import { useNavigate, Link } from 'react-router-dom'

const Quotations = () => {
  const navigate = useNavigate()
  const darkCayn = '#003C3f'
  const vividOrange = '#DA4A0E'

  const [quotations, setQuotations] = useState([])
  const [customers, setCustomers] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState(null)
  const [approvingId, setApprovingId] = useState(null)
  const [rejectingId, setRejectingId] = useState(null)
  const [convertingId, setConvertingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCustomer, setFilterCustomer] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [quotationToDelete, setQuotationToDelete] = useState(null)
  const [showWarehouseModal, setShowWarehouseModal] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [convertingQuotationId, setConvertingQuotationId] = useState(null)
  const [loadingWarehouses, setLoadingWarehouses] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'default' },
    sent: { label: 'Envoyé', color: 'info' },
    approved: { label: 'Approuvé', color: 'success' },
    rejected: { label: 'Rejeté', color: 'error' },
    expired: { label: 'Expiré', color: 'warning' },
    converted: { label: 'Converti', color: 'primary' }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number)
  }

  const calculateQuotationTotal = (quotation) => {
    if (quotation.total && quotation.total > 0) return quotation.total
    if (quotation.items && quotation.items.length > 0) {
      return quotation.items.reduce((sum, item) => {
        return sum + (parseFloat(item.total) || (parseFloat(item.quantity) * parseFloat(item.unit_price)) || 0)
      }, 0)
    }
    return 0
  }

  const fetchWarehouses = async () => {
    setLoadingWarehouses(true)
    try {
      const response = await AxiosInstance.get('/warehouses/')
      setWarehouses(response.data || [])
      const defaultWarehouse = response.data?.find(w => w.is_default === true) || response.data?.[0]
      if (defaultWarehouse) setSelectedWarehouse(defaultWarehouse)
    } catch (error) {
      console.error(error)
      showNotification('Erreur lors du chargement des entrepôts', 'error')
    } finally {
      setLoadingWarehouses(false)
    }
  }

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      AxiosInstance.get('/quotations/').catch(() => ({ data: [] })),
      AxiosInstance.get('/customers/').catch(() => ({ data: [] }))
    ])
      .then(async ([quotationsRes, customersRes]) => {
        let quotationsData = quotationsRes.data || []
        const enhancedQuotations = await Promise.all(
          quotationsData.map(async (q) => {
            if (q.total && q.total > 0) return q
            try {
              const detailRes = await AxiosInstance.get(`/quotations/${q.id}/`)
              const detail = detailRes.data
              const calculatedTotal = detail.items?.reduce((sum, item) => {
                return sum + (parseFloat(item.total) || (parseFloat(item.quantity) * parseFloat(item.unit_price)) || 0)
              }, 0) || 0
              return { ...q, total: calculatedTotal, items: detail.items }
            } catch {
              return q
            }
          })
        )
        setQuotations(enhancedQuotations)
        setCustomers(customersRes.data || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        showNotification('Erreur lors du chargement des données', 'error')
        setLoading(false)
      })
  }

  useEffect(() => { fetchData() }, [])

  const handleSendQuotation = async (id) => {
    setSendingId(id)
    try {
      const response = await AxiosInstance.post(`/quotations/${id}/send/`)
      showNotification(response.data.message || 'Devis envoyé avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors de l\'envoi', 'error')
    } finally {
      setSendingId(null)
    }
  }

  const handleApproveQuotation = async (id) => {
    setApprovingId(id)
    try {
      const response = await AxiosInstance.post(`/quotations/${id}/approve/`)
      showNotification(response.data.message || 'Devis approuvé avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors de l\'approbation', 'error')
    } finally {
      setApprovingId(null)
    }
  }

  const handleRejectQuotation = async (id) => {
    setRejectingId(id)
    try {
      const response = await AxiosInstance.post(`/quotations/${id}/reject/`)
      showNotification(response.data.message || 'Devis rejeté', 'success')
      fetchData()
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors du rejet', 'error')
    } finally {
      setRejectingId(null)
    }
  }

  const handleDeleteQuotation = async () => {
    if (!quotationToDelete) return
    try {
      await AxiosInstance.delete(`/quotations/${quotationToDelete.id}/`)
      showNotification('Devis supprimé avec succès', 'success')
      fetchData()
      setShowDeleteModal(false)
      setQuotationToDelete(null)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  const handleConvertToSale = async (id) => {
    setConvertingQuotationId(id)
    await fetchWarehouses()
    setShowWarehouseModal(true)
  }

  const confirmConvertToSale = async () => {
    if (!selectedWarehouse) {
      showNotification('Veuillez sélectionner un entrepôt', 'error')
      return
    }
    setConvertingId(convertingQuotationId)
    setShowWarehouseModal(false)
    try {
      const response = await AxiosInstance.post(`/quotations/${convertingQuotationId}/convert_to_sale/`, {
        warehouse: selectedWarehouse.id
      })
      showNotification(response.data.message || 'Devis converti en vente avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors de la conversion', 'error')
    } finally {
      setConvertingId(null)
      setConvertingQuotationId(null)
    }
  }

  // Filtrage et pagination
  const filteredQuotations = quotations.filter(q => {
    const search = searchTerm.toLowerCase()
    const matchesSearch = (q.quotation_number?.toLowerCase() || '').includes(search) ||
                          (q.customer_name?.toLowerCase() || '').includes(search)
    const matchesCustomer = !filterCustomer || q.customer?.toString() === filterCustomer
    const matchesStatus = !filterStatus || q.status === filterStatus
    return matchesSearch && matchesCustomer && matchesStatus
  })
  const paginatedQuotations = filteredQuotations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const pageCount = Math.ceil(filteredQuotations.length / rowsPerPage)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des devis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 md:px-8 py-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : notification.type === 'error' ? 'alert-error' : 'alert-warning'} shadow-lg text-sm`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Devis</h1>
          <p className="text-gray-500 mt-1">Gérez vos devis clients</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="btn btn-outline gap-2">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <Link to="/devis/nouveau" className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" /> Nouveau devis
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="card bg-base-100 shadow-lg mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Recherche</span></label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="N° devis, client..."
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Client</span></label>
            <select
              className="select select-bordered w-full"
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
            >
              <option value="">Tous les clients</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.full_name || c.company_name || c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Statut</span></label>
            <select
              className="select select-bordered w-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
          <div className="form-control justify-end">
            <button
              className="btn btn-outline mt-8 gap-2"
              onClick={() => { setFilterCustomer(''); setFilterStatus(''); setSearchTerm('') }}
            >
              <Filter className="w-4 h-4" /> Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des devis */}
      <div className="card bg-base-100 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th>N° DEVIS</th>
                <th>CLIENT</th>
                <th>DATE</th>
                <th>VALIDITÉ</th>
                <th>STATUT</th>
                <th className="text-right">MONTANT</th>
                <th className="text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedQuotations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <Receipt className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-400">
                      {searchTerm || filterCustomer || filterStatus ? 'Aucun devis trouvé' : 'Aucun devis enregistré'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedQuotations.map((q) => {
                  const status = statusConfig[q.status] || statusConfig.draft
                  const isExpired = new Date(q.valid_until) < new Date() && q.status !== 'converted'
                  const displayTotal = q.total || calculateQuotationTotal(q) || 0
                  let badgeColor = ''
                  if (status.color === 'success') badgeColor = 'badge-success'
                  else if (status.color === 'warning') badgeColor = 'badge-warning'
                  else if (status.color === 'error') badgeColor = 'badge-error'
                  else if (status.color === 'info') badgeColor = 'badge-info'
                  else if (status.color === 'primary') badgeColor = 'badge-primary'
                  else badgeColor = 'badge-ghost'

                  return (
                    <tr key={q.id} className="hover:bg-gray-50 transition">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                              <Receipt className="w-5 h-5" />
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{q.quotation_number}</div>
                            <div className="text-xs text-gray-500">{q.items_count || 0} produit(s)</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{q.customer_name}</span>
                        </div>
                      </td>
                      <td>{new Date(q.quotation_date).toLocaleDateString('fr-FR')}</td>
                      <td className={isExpired ? 'text-error' : ''}>
                        {new Date(q.valid_until).toLocaleDateString('fr-FR')}
                      </td>
                      <td>
                        <div className={`badge ${badgeColor} badge-sm`}>{status.label}</div>
                      </td>
                      <td className="text-right font-bold text-primary">{formatNumber(displayTotal)} €</td>
                      <td>
                        <div className="flex justify-center gap-2">
                          {/* Voir détail */}
                          <button
                            onClick={() => navigate(`/devis/${q.id}/detail`)}
                            className="btn btn-ghost btn-sm tooltip"
                            data-tip="Voir le détail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Modifier */}
                          <button
                            onClick={() => navigate(`/devis/${q.id}/edit`)}
                            className="btn btn-ghost btn-sm tooltip"
                            data-tip="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {q.status === 'draft' && (
                            <>
                              <button
                                onClick={() => handleSendQuotation(q.id)}
                                disabled={sendingId === q.id}
                                className="btn btn-ghost btn-sm text-info tooltip"
                                data-tip="Envoyer"
                              >
                                {sendingId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => { setQuotationToDelete(q); setShowDeleteModal(true) }}
                                className="btn btn-ghost btn-sm text-error tooltip"
                                data-tip="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {q.status === 'sent' && (
                            <>
                              <button
                                onClick={() => handleApproveQuotation(q.id)}
                                disabled={approvingId === q.id}
                                className="btn btn-ghost btn-sm text-success tooltip"
                                data-tip="Approuver"
                              >
                                {approvingId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleRejectQuotation(q.id)}
                                disabled={rejectingId === q.id}
                                className="btn btn-ghost btn-sm text-error tooltip"
                                data-tip="Rejeter"
                              >
                                {rejectingId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                              </button>
                            </>
                          )}

                          {q.status === 'approved' && (
                            <button
                              onClick={() => handleConvertToSale(q.id)}
                              disabled={convertingId === q.id}
                              className="btn btn-ghost btn-sm text-success tooltip"
                              data-tip="Convertir en vente"
                            >
                              {convertingId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm">Lignes par page :</span>
            <select
              className="select select-bordered select-sm w-20"
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0) }}
            >
              {[5, 10, 25, 50].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="join">
            <button
              className="join-item btn btn-sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              «
            </button>
            <span className="join-item btn btn-sm">Page {page + 1} / {pageCount || 1}</span>
            <button
              className="join-item btn btn-sm"
              disabled={page >= pageCount - 1}
              onClick={() => setPage(page + 1)}
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-error" />
            </div>
            <h3 className="text-xl font-bold mb-2">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le devis <strong className="text-orange-600">"{quotationToDelete?.quotation_number}"</strong> ? Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline">Annuler</button>
              <button onClick={handleDeleteQuotation} className="btn btn-error">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal sélection entrepôt pour conversion */}
      {showWarehouseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Warehouse className="w-5 h-5" /> Sélectionner l'entrepôt
              </h3>
              <button onClick={() => setShowWarehouseModal(false)} className="btn btn-sm btn-ghost">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Choisissez l'entrepôt qui sera utilisé pour la vente.</p>
            </div>
            {loadingWarehouses ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : warehouses.length === 0 ? (
              <div className="alert alert-warning">Aucun entrepôt trouvé. Veuillez d'abord créer un entrepôt.</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {warehouses.map((wh) => (
                  <label
                    key={wh.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedWarehouse?.id === wh.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="warehouse"
                      value={wh.id}
                      checked={selectedWarehouse?.id === wh.id}
                      onChange={() => setSelectedWarehouse(wh)}
                      className="radio radio-primary mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {wh.is_default ? <Home className="w-4 h-4 text-primary" /> : <Store className="w-4 h-4" />}
                        <span className="font-semibold">{wh.name}</span>
                        {wh.is_default && <span className="badge badge-primary badge-sm">Par défaut</span>}
                      </div>
                      {wh.location && <p className="text-xs text-gray-500 mt-1">{wh.location}</p>}
                    </div>
                  </label>
                ))}
              </div>
            )}
            {!loadingWarehouses && warehouses.length > 0 && selectedWarehouse && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg text-sm">
                <strong>Entrepôt sélectionné :</strong> {selectedWarehouse.name} {selectedWarehouse.is_default && '(Par défaut)'}
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6 pt-3 border-t">
              <button onClick={() => setShowWarehouseModal(false)} className="btn btn-outline">Annuler</button>
              <button
                onClick={confirmConvertToSale}
                disabled={!selectedWarehouse || loadingWarehouses}
                className="btn btn-primary gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Convertir en vente
              </button>
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

export default Quotations