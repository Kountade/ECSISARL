// src/components/inventory/Transferts.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import { generateTransferPDF } from './TransfertPDF';
import {
  Plus,
  Search,
  RefreshCw,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  Building2,
  Truck,
  Receipt,
  Send,
  Calendar,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  FileText,
  Warehouse,
  Clock,
  Package,
  Download,
  Loader2,
  ArrowRight,
  Ban,
  Check,
  Hourglass
} from 'lucide-react';

const Transferts = () => {
  const navigate = useNavigate();

  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transferToDelete, setTransferToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [downloadingPDF, setDownloadingPDF] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterFromWarehouse, setFilterFromWarehouse] = useState('');
  const [filterToWarehouse, setFilterToWarehouse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    in_transit: 0,
    completed: 0,
    cancelled: 0
  });

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'badge-ghost', icon: Edit },
    pending: { label: 'En attente', color: 'badge-warning', icon: Hourglass },
    in_transit: { label: 'En transit', color: 'badge-info', icon: Truck },
    partial: { label: 'Partiel', color: 'badge-warning', icon: Receipt },
    completed: { label: 'Terminé', color: 'badge-success', icon: Check },
    cancelled: { label: 'Annulé', color: 'badge-error', icon: Ban }
  };

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0;
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  const formatCurrency = (amount) => {
    return `${formatNumber(amount)} FCFA`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transfersRes, warehousesRes] = await Promise.all([
        AxiosInstance.get('/transfers/'),
        AxiosInstance.get('/warehouses/?is_active=true')
      ]);

      const transfersData = transfersRes.data || [];
      setTransfers(transfersData);
      setWarehouses(warehousesRes.data || []);

      setStats({
        total: transfersData.length,
        draft: transfersData.filter(t => t.status === 'draft').length,
        pending: transfersData.filter(t => t.status === 'pending').length,
        in_transit: transfersData.filter(t => t.status === 'in_transit').length,
        completed: transfersData.filter(t => t.status === 'completed').length,
        cancelled: transfersData.filter(t => t.status === 'cancelled').length
      });

    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur de chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadPDF = async (transfer) => {
    if (!transfer) return;
    setDownloadingPDF(transfer.id);
    try {
      await generateTransferPDF(transfer);
      showNotification('PDF téléchargé avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      showNotification('Erreur lors de la génération du PDF', 'error');
    } finally {
      setDownloadingPDF(null);
    }
  };

  const handleDelete = async () => {
    if (!transferToDelete) return;
    try {
      await AxiosInstance.delete(`/transfers/${transferToDelete.id}/`);
      showNotification('Transfert supprimé', 'success');
      fetchData();
      setShowDeleteModal(false);
      setTransferToDelete(null);
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const handleStartTransfer = async (transferId) => {
    try {
      await AxiosInstance.post(`/transfers/${transferId}/start/`);
      showNotification('Transfert démarré', 'success');
      fetchData();
    } catch (error) {
      showNotification('Erreur lors du démarrage', 'error');
    }
  };

  const handleCancelTransfer = async (transferId) => {
    try {
      await AxiosInstance.post(`/transfers/${transferId}/cancel/`);
      showNotification('Transfert annulé', 'success');
      fetchData();
    } catch (error) {
      showNotification('Erreur lors de l\'annulation', 'error');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch =
      (transfer.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transfer.from_warehouse?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transfer.to_warehouse?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transfer.waybill || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFrom = !filterFromWarehouse || transfer.from_warehouse?.id?.toString() === filterFromWarehouse;
    const matchesTo = !filterToWarehouse || transfer.to_warehouse?.id?.toString() === filterToWarehouse;
    const matchesStatus = !filterStatus || transfer.status === filterStatus;

    return matchesSearch && matchesFrom && matchesTo && matchesStatus;
  });

  const sortedTransfers = [...filteredTransfers].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';

    if (sortField === 'created_at' || sortField === 'transfer_date' || sortField === 'expected_date') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedTransfers.length / itemsPerPage);
  const paginatedTransfers = sortedTransfers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 opacity-40" />;
    return sortDirection === 'asc' ?
      <ChevronUp className="w-4 h-4" /> :
      <ChevronDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
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
            <Truck className="w-7 h-7 text-primary" /> Transferts entrepôts
          </h1>
          <p className="text-sm lg:text-base text-base-content/60 mt-1">Gérez les transferts de stock entre entrepôts</p>
        </div>

        <div className="flex gap-2">
          <button onClick={fetchData} className="btn btn-outline btn-sm lg:btn-md gap-2">
            <RefreshCw className="w-4 h-4" /> <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button onClick={() => navigate('/transferts/nouveau')} className="btn btn-primary btn-sm lg:btn-md gap-2">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nouveau transfert</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-primary p-3 lg:p-4">
          <div className="stat-figure text-primary"><Truck className="w-6 h-6" /></div>
          <div className="stat-title text-sm">Total</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-ghost p-3 lg:p-4">
          <div className="stat-figure text-ghost"><Edit className="w-6 h-6" /></div>
          <div className="stat-title text-sm">Brouillons</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.draft}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-warning p-3 lg:p-4">
          <div className="stat-figure text-warning"><Hourglass className="w-6 h-6" /></div>
          <div className="stat-title text-sm">En attente</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.pending}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-info p-3 lg:p-4">
          <div className="stat-figure text-info"><Truck className="w-6 h-6" /></div>
          <div className="stat-title text-sm">En transit</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.in_transit}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-success p-3 lg:p-4">
          <div className="stat-figure text-success"><Check className="w-6 h-6" /></div>
          <div className="stat-title text-sm">Terminés</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.completed}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-error p-3 lg:p-4 col-span-2 lg:col-span-1">
          <div className="stat-figure text-error"><Ban className="w-6 h-6" /></div>
          <div className="stat-title text-sm">Annulés</div>
          <div className="stat-value text-xl lg:text-2xl">{stats.cancelled}</div>
        </div>
      </div>

      {/* Filtres - Desktop */}
      <div className="hidden lg:flex bg-base-100 rounded-xl shadow-sm border border-base-300 p-4 items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
          <input type="text" placeholder="Rechercher..." className="input input-bordered w-full pl-10"
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
        </div>
        <select className="select select-bordered w-40" value={filterFromWarehouse} onChange={(e) => { setFilterFromWarehouse(e.target.value); setCurrentPage(1); }}>
          <option value="">Entrepôt source</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select className="select select-bordered w-40" value={filterToWarehouse} onChange={(e) => { setFilterToWarehouse(e.target.value); setCurrentPage(1); }}>
          <option value="">Entrepôt dest.</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select className="select select-bordered w-36" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
          <option value="">Tous statuts</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setFilterFromWarehouse(''); setFilterToWarehouse(''); setFilterStatus(''); setCurrentPage(1); }}>
          <Filter className="w-4 h-4" /> Réinitialiser
        </button>
      </div>

      {/* Filtres - Mobile */}
      <div className="lg:hidden">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input type="text" placeholder="Rechercher..." className="input input-bordered input-sm w-full pl-9"
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setShowMobileFilters(!showMobileFilters)}>
            <Filter className="w-4 h-4" /> Filtres
          </button>
        </div>
        {showMobileFilters && (
          <div className="mt-2 p-3 bg-base-100 rounded-lg border border-base-300 space-y-2">
            <select className="select select-bordered select-sm w-full" value={filterFromWarehouse} onChange={(e) => { setFilterFromWarehouse(e.target.value); setCurrentPage(1); }}>
              <option value="">Entrepôt source</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select className="select select-bordered select-sm w-full" value={filterToWarehouse} onChange={(e) => { setFilterToWarehouse(e.target.value); setCurrentPage(1); }}>
              <option value="">Entrepôt dest.</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select className="select select-bordered select-sm w-full" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
              <option value="">Tous statuts</option>
              {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button className="btn btn-outline btn-sm w-full" onClick={() => { setSearchTerm(''); setFilterFromWarehouse(''); setFilterToWarehouse(''); setFilterStatus(''); setCurrentPage(1); setShowMobileFilters(false); }}>
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
                <th><button className="flex items-center gap-1 font-semibold" onClick={() => handleSort('reference')}>Référence <SortIcon field="reference" /></button></th>
                <th>Source</th>
                <th><ArrowRight className="w-4 h-4 inline" /></th>
                <th>Destination</th>
                <th><button className="flex items-center gap-1 font-semibold" onClick={() => handleSort('created_at')}>Date <SortIcon field="created_at" /></button></th>
                <th className="text-center">Articles</th>
                <th className="text-center">Statut</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransfers.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-base-content/50">Aucun transfert trouvé</td></tr>
              ) : (
                paginatedTransfers.map((transfer) => {
                  const status = statusConfig[transfer.status] || statusConfig.draft;
                  const StatusIcon = status.icon;
                  const totalItems = transfer.items?.length || 0;
                  const totalQuantity = transfer.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

                  return (
                    <tr key={transfer.id} className="hover">
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar placeholder">
                            <div className="bg-primary/10 rounded-lg w-10 h-10">
                              <Truck className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{transfer.reference}</div>
                            {transfer.waybill && (
                              <div className="text-xs text-base-content/60">BL: {transfer.waybill}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Warehouse className="w-4 h-4 text-base-content/50" />
                          <span>{transfer.from_warehouse?.name || '-'}</span>
                        </div>
                      </td>
                      <td><ArrowRight className="w-4 h-4 text-primary" /></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Warehouse className="w-4 h-4 text-base-content/50" />
                          <span>{transfer.to_warehouse?.name || '-'}</span>
                        </div>
                      </td>
                      <td>{formatDate(transfer.created_at)}</td>
                      <td className="text-center">
                        <span className="badge badge-outline">{totalItems} article(s)</span>
                        <div className="text-xs text-base-content/60">{formatNumber(totalQuantity)} unités</div>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${status.color} gap-1`}>
                          <StatusIcon className="w-3 h-3" /> {status.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-center gap-1 flex-wrap">
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/transferts/${transfer.id}`)} title="Voir">
                            <Eye className="w-4 h-4" />
                          </button>

                          <button className="btn btn-ghost btn-sm text-primary" onClick={() => handleDownloadPDF(transfer)} disabled={downloadingPDF === transfer.id} title="Télécharger PDF">
                            {downloadingPDF === transfer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          </button>

                          {transfer.status === 'draft' && (
                            <>
                              <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/transferts/${transfer.id}/modifier`)} title="Modifier">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="btn btn-ghost btn-sm text-success" onClick={() => handleStartTransfer(transfer.id)} title="Démarrer">
                                <Send className="w-4 h-4" />
                              </button>
                              <button className="btn btn-ghost btn-sm text-error" onClick={() => { setTransferToDelete(transfer); setShowDeleteModal(true); }} title="Supprimer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {transfer.status === 'pending' && (
                            <button className="btn btn-ghost btn-sm text-success" onClick={() => handleStartTransfer(transfer.id)} title="Démarrer">
                              <Send className="w-4 h-4" />
                            </button>
                          )}

                          {['pending', 'in_transit', 'partial'].includes(transfer.status) && (
                            <button className="btn btn-ghost btn-sm text-error" onClick={() => handleCancelTransfer(transfer.id)} title="Annuler">
                              <Ban className="w-4 h-4" />
                            </button>
                          )}

                          {transfer.status === 'in_transit' && (
                            <button className="btn btn-ghost btn-sm text-success" onClick={() => navigate(`/transferts/${transfer.id}/reception`)} title="Réceptionner">
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Liste - Mobile */}
      <div className="lg:hidden space-y-2">
        {paginatedTransfers.length === 0 ? (
          <div className="bg-base-100 rounded-xl p-8 text-center border border-base-300 text-base-content/50">Aucun transfert</div>
        ) : (
          paginatedTransfers.map((transfer) => {
            const status = statusConfig[transfer.status] || statusConfig.draft;
            const StatusIcon = status.icon;
            const totalItems = transfer.items?.length || 0;

            return (
              <div key={transfer.id} className="bg-base-100 rounded-xl p-4 border border-base-300">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-5 h-5" />
                    <div>
                      <span className="font-bold">{transfer.reference}</span>
                      <p className="text-sm text-base-content/60">
                        {transfer.from_warehouse?.name} → {transfer.to_warehouse?.name}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${status.color}`}>{status.label}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div><span className="text-base-content/60">Date:</span> {formatDate(transfer.created_at)}</div>
                  <div><span className="text-base-content/60">Articles:</span> {totalItems}</div>
                  {transfer.waybill && <div className="col-span-2"><span className="text-base-content/60">BL:</span> {transfer.waybill}</div>}
                </div>

                <div className="flex flex-wrap justify-end gap-1 mt-3 pt-2 border-t border-base-200">
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/transferts/${transfer.id}`)}>
                    <Eye className="w-4 h-4" /> Voir
                  </button>
                  <button className="btn btn-ghost btn-sm text-primary" onClick={() => handleDownloadPDF(transfer)} disabled={downloadingPDF === transfer.id}>
                    {downloadingPDF === transfer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  </button>
                  {transfer.status === 'draft' && (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/transferts/${transfer.id}/modifier`)}>
                        <Edit className="w-4 h-4" /> Modifier
                      </button>
                      <button className="btn btn-ghost btn-sm text-error" onClick={() => { setTransferToDelete(transfer); setShowDeleteModal(true); }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {sortedTransfers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-base-content/60">
            {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedTransfers.length)} sur {sortedTransfers.length}
          </div>
          <div className="flex items-center gap-2">
            <select className="select select-bordered select-sm w-20" value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}>
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
              <p className="mb-2">Supprimer le transfert</p>
              <p className="text-xl font-bold text-error">"{transferToDelete?.reference}" ?</p>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn btn-error" onClick={handleDelete}><Trash2 className="w-4 h-4" /> Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transferts;