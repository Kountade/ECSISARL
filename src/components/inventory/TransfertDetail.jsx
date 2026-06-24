// src/components/inventory/TransfertDetail.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import { generateTransferPDF } from './TransfertPDF';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Package,
  Receipt,
  FileText,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Truck,
  Send,
  Edit,
  Trash2,
  RefreshCw,
  X,
  Download,
  Loader2,
  Warehouse,
  ArrowRight,
  Ban,
  Check,
  Hourglass,
  User,
  Clock,
  ArrowRightCircle,
  Warehouse as WarehouseIcon,
  Home,
  Factory
} from 'lucide-react';

const TransfertDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveItems, setReceiveItems] = useState([]);

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'badge-ghost', icon: Edit },
    pending: { label: 'En attente', color: 'badge-warning', icon: Hourglass },
    in_transit: { label: 'En transit', color: 'badge-info', icon: Truck },
    partial: { label: 'Partiel', color: 'badge-warning', icon: Receipt },
    completed: { label: 'Terminé', color: 'badge-success', icon: Check },
    cancelled: { label: 'Annulé', color: 'badge-error', icon: Ban }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
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

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get(`/transfers/${id}/`);
      const data = response.data;
      setTransfer(data);
      
      if (data.items && data.items.length > 0) {
        setReceiveItems(data.items.map(item => ({
          id: item.id,
          product_name: item.product_name || 'Produit',
          quantity: item.quantity || 0,
          quantity_received: item.quantity_received || 0,
          remaining: (item.quantity || 0) - (item.quantity_received || 0),
          to_receive: (item.quantity || 0) - (item.quantity_received || 0)
        })));
      } else {
        setReceiveItems([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.response?.data?.detail || 'Erreur de chargement du transfert');
      showNotification('Erreur de chargement du transfert', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    } else {
      setError('ID de transfert manquant');
      setLoading(false);
    }
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!transfer) return;
    setGeneratingPDF(true);
    try {
      await generateTransferPDF(transfer);
      showNotification('PDF téléchargé avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      showNotification('Erreur lors de la génération du PDF', 'error');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleStartTransfer = async () => {
    if (!transfer) return;
    try {
      await AxiosInstance.post(`/transfers/${id}/start/`);
      showNotification('Transfert démarré', 'success');
      fetchData();
    } catch (error) {
      showNotification('Erreur lors du démarrage', 'error');
    }
  };

  const handleCancelTransfer = async () => {
    if (!transfer) return;
    try {
      await AxiosInstance.post(`/transfers/${id}/cancel/`);
      showNotification('Transfert annulé', 'success');
      fetchData();
    } catch (error) {
      showNotification('Erreur lors de l\'annulation', 'error');
    }
  };

  const handleReceiveTransfer = async () => {
    const itemsToReceive = receiveItems.filter(item => item.to_receive > 0);
    if (itemsToReceive.length === 0) {
      showNotification('Aucun article à réceptionner', 'error');
      return;
    }

    try {
      await AxiosInstance.post(`/transfers/${id}/receive/`, {
        items: itemsToReceive.map(item => ({
          id: item.id,
          quantity_received: item.to_receive
        }))
      });
      showNotification('Transfert réceptionné avec succès', 'success');
      setShowReceiveModal(false);
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors de la réception', 'error');
    }
  };

  const updateReceiveQuantity = (index, value) => {
    const newItems = [...receiveItems];
    const max = newItems[index].remaining || 0;
    const val = parseInt(value) || 0;
    newItems[index].to_receive = Math.min(Math.max(0, val), max);
    setReceiveItems(newItems);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !transfer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-error" />
          <h2 className="text-xl font-bold mb-2">Erreur</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Transfert non trouvé'}</p>
          <button onClick={() => navigate('/transferts')} className="btn btn-primary">
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const status = statusConfig[transfer.status] || statusConfig.draft;
  const StatusIcon = status.icon;
  const totalItems = transfer.items?.length || 0;
  const totalQuantity = transfer.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const totalReceived = transfer.items?.reduce((sum, item) => sum + (item.quantity_received || 0), 0) || 0;
  const progress = totalQuantity > 0 ? (totalReceived / totalQuantity) * 100 : 0;
  const totalValue = transfer.items?.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0) || 0;

  return (
    <div className="w-full px-3 lg:px-6 py-3 space-y-4">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 lg:top-20 right-3 lg:right-6 z-50 animate-slideDown w-[calc(100%-1.5rem)] lg:w-auto max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm">{notification.message}</span>
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ ...notification, show: false })}>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/transferts')} className="btn btn-ghost btn-sm btn-circle">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
              <Truck className="w-6 h-6 text-primary" />
              Transfert {transfer.reference || 'N/A'}
            </h1>
            <p className="text-sm text-base-content/60 mt-1">
              Détails du transfert entre entrepôts
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={fetchData} className="btn btn-outline btn-sm">
            <RefreshCw className="w-4 h-4" />
          </button>

          {transfer.status === 'draft' && (
            <>
              <button onClick={() => navigate(`/transferts/${id}/modifier`)} className="btn btn-outline btn-sm">
                <Edit className="w-4 h-4" /> Modifier
              </button>
              <button onClick={handleStartTransfer} className="btn btn-primary btn-sm">
                <Send className="w-4 h-4" /> Démarrer
              </button>
            </>
          )}

          {transfer.status === 'pending' && (
            <button onClick={handleStartTransfer} className="btn btn-primary btn-sm">
              <Send className="w-4 h-4" /> Démarrer
            </button>
          )}

          {transfer.status === 'in_transit' && (
            <button onClick={() => setShowReceiveModal(true)} className="btn btn-success btn-sm">
              <Check className="w-4 h-4" /> Réceptionner
            </button>
          )}

          {['pending', 'in_transit', 'partial'].includes(transfer.status) && (
            <button onClick={handleCancelTransfer} className="btn btn-error btn-sm">
              <Ban className="w-4 h-4" /> Annuler
            </button>
          )}

          <button onClick={handleDownloadPDF} className="btn btn-primary btn-sm" disabled={generatingPDF}>
            {generatingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Télécharger PDF
          </button>
        </div>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-primary p-3">
          <div className="stat-figure text-primary"><Truck className="w-5 h-5" /></div>
          <div className="stat-title text-xs">Référence</div>
          <div className="stat-value text-base">{transfer.reference || '-'}</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-info p-3">
          <div className="stat-figure text-info"><Package className="w-5 h-5" /></div>
          <div className="stat-title text-xs">Articles</div>
          <div className="stat-value text-base">{totalItems}</div>
          <div className="stat-desc text-xs">{formatNumber(totalQuantity)} unités</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-warning p-3">
          <div className="stat-figure text-warning"><Clock className="w-5 h-5" /></div>
          <div className="stat-title text-xs">Statut</div>
          <div className="stat-value text-sm">
            <span className={`badge ${status.color} gap-1`}>
              <StatusIcon className="w-3 h-3" /> {status.label}
            </span>
          </div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-success p-3">
          <div className="stat-figure text-success"><Check className="w-5 h-5" /></div>
          <div className="stat-title text-xs">Progression</div>
          <div className="stat-value text-base">{Math.round(progress)}%</div>
          <div className="stat-desc text-xs">{formatNumber(totalReceived)} / {formatNumber(totalQuantity)} reçus</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-secondary p-3 col-span-2 lg:col-span-1">
          <div className="stat-figure text-secondary"><FileText className="w-5 h-5" /></div>
          <div className="stat-title text-xs">Valeur totale</div>
          <div className="stat-value text-sm">{formatCurrency(totalValue)}</div>
        </div>
      </div>

      {/* Progression */}
      {['in_transit', 'partial'].includes(transfer.status) && (
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <Truck className="w-5 h-5 text-warning" />
            Progression de la réception
          </h2>
          <div className="w-full">
            <progress className="progress progress-primary w-full" value={progress} max="100"></progress>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-base-content/60">Reçu</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PARCOURS AVEC ICÔNES LUCILE ==================== */}
      <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
        <h2 className="font-bold text-base mb-4 flex items-center gap-2">
          <ArrowRightCircle className="w-5 h-5 text-primary" />
          Parcours du transfert
        </h2>

        <div className="flex items-center justify-between gap-4">
          {/* Entrepôt source */}
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <WarehouseIcon className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="font-semibold text-base">
              {transfer.from_warehouse?.name || '-'}
            </div>
            <div className="text-sm text-base-content/60">
              {transfer.from_warehouse?.code || '-'}
            </div>
            <div className="text-xs text-base-content/50 mt-1">
              {transfer.from_warehouse?.city || ''} {transfer.from_warehouse?.country || ''}
            </div>
          </div>

          {/* Flèche de transfert */}
          <div className="flex flex-col items-center px-4">
            <div className="relative">
              <div className="w-20 h-0.5 bg-primary/30 absolute top-1/2 -translate-y-1/2"></div>
              <ArrowRightCircle className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <div className="text-xs font-medium text-primary mt-1">TRANSFERT</div>
            <div className="text-xs text-base-content/50">
              {formatDate(transfer.created_at)}
            </div>
          </div>

          {/* Entrepôt destination */}
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center border-2 border-success/20">
                <Building2 className="w-8 h-8 text-success" />
              </div>
            </div>
            <div className="font-semibold text-base">
              {transfer.to_warehouse?.name || '-'}
            </div>
            <div className="text-sm text-base-content/60">
              {transfer.to_warehouse?.code || '-'}
            </div>
            <div className="text-xs text-base-content/50 mt-1">
              {transfer.to_warehouse?.city || ''} {transfer.to_warehouse?.country || ''}
            </div>
          </div>
        </div>

        {/* Statut du transfert */}
        <div className="mt-4 text-center">
          <span className={`badge ${status.color} gap-1 text-sm py-2 px-4`}>
            <StatusIcon className="w-4 h-4" />
            Statut: {status.label}
          </span>
          {transfer.waybill && (
            <span className="badge badge-outline ml-2 text-sm py-2 px-4">
              BL: {transfer.waybill}
            </span>
          )}
        </div>
      </div>

      {/* Informations générales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-info" />
            Informations
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base-content/60">Date de création:</span>
              <span>{formatDateTime(transfer.created_at)}</span>
            </div>
            {transfer.expected_date && (
              <div className="flex justify-between">
                <span className="text-base-content/60">Date prévue:</span>
                <span>{formatDate(transfer.expected_date)}</span>
              </div>
            )}
            {transfer.completed_date && (
              <div className="flex justify-between">
                <span className="text-base-content/60">Date de completion:</span>
                <span>{formatDate(transfer.completed_date)}</span>
              </div>
            )}
            {transfer.waybill && (
              <div className="flex justify-between">
                <span className="text-base-content/60">Bon de livraison:</span>
                <span className="font-mono">{transfer.waybill}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-base-content/60">Créé par:</span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4 text-base-content/50" />
                {transfer.created_by?.email || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Résumé des quantités */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Résumé des quantités
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-base-200 rounded-lg">
              <span className="text-base-content/60">Quantité totale</span>
              <span className="font-bold">{formatNumber(totalQuantity)} unités</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-success/10 rounded-lg">
              <span className="text-success">✓ Quantité reçue</span>
              <span className="font-bold text-success">{formatNumber(totalReceived)} unités</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-warning/10 rounded-lg">
              <span className="text-warning">⏳ Quantité restante</span>
              <span className="font-bold text-warning">{formatNumber(totalQuantity - totalReceived)} unités</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-primary/10 rounded-lg">
              <span className="text-primary">💰 Valeur totale</span>
              <span className="font-bold text-primary">{formatCurrency(totalValue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
        <div className="p-4 border-b border-base-300 bg-base-200/50">
          <h2 className="font-bold text-base flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Articles du transfert
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr className="bg-base-200">
                <th>Produit</th>
                <th>Référence</th>
                <th className="text-center">Quantité</th>
                <th className="text-center">Reçu</th>
                <th className="text-center">Restant</th>
                <th className="text-right">Prix unitaire</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {!transfer.items || transfer.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-base-content/50">
                    Aucun article dans ce transfert
                  </td>
                </tr>
              ) : (
                transfer.items.map((item, idx) => {
                  const remaining = (item.quantity || 0) - (item.quantity_received || 0);
                  return (
                    <tr key={idx}>
                      <td className="font-medium">{item.product_name || '-'}</td>
                      <td>{item.product_reference || '-'}</td>
                      <td className="text-center">{item.quantity || 0}</td>
                      <td className="text-center">{item.quantity_received || 0}</td>
                      <td className="text-center">
                        <span className={remaining > 0 ? 'text-warning font-semibold' : 'text-success'}>
                          {remaining}
                        </span>
                      </td>
                      <td className="text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="text-right font-semibold">{formatCurrency((item.quantity || 0) * (item.unit_price || 0))}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-base-200">
              <tr className="font-bold">
                <td colSpan={6} className="text-right">Total</td>
                <td className="text-right">{formatCurrency(totalValue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes */}
      {transfer.notes && (
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
          <div className="p-4 border-b border-base-300 bg-base-200/50">
            <h2 className="font-bold text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Notes
            </h2>
          </div>
          <div className="p-4">
            <p className="text-sm whitespace-pre-wrap">{transfer.notes}</p>
          </div>
        </div>
      )}

      {/* Modal Réception */}
      {showReceiveModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Check className="w-6 h-6 text-success" />
              Réceptionner le transfert
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {receiveItems.length === 0 ? (
                <div className="text-center py-4 text-base-content/50">
                  Aucun article à réceptionner
                </div>
              ) : (
                receiveItems.map((item, idx) => (
                  <div key={idx} className="bg-base-200 rounded-lg p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1">
                        <div className="font-medium">{item.product_name || 'Produit'}</div>
                        <div className="text-sm text-base-content/60">
                          Quantité totale: {item.quantity || 0} | Reçu: {item.quantity_received || 0} | Restant: {item.remaining || 0}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm">À recevoir:</label>
                        <input
                          type="number"
                          min="0"
                          max={item.remaining || 0}
                          value={item.to_receive || 0}
                          onChange={(e) => updateReceiveQuantity(idx, e.target.value)}
                          className="input input-bordered input-sm w-24"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowReceiveModal(false)}>
                Annuler
              </button>
              <button 
                className="btn btn-success" 
                onClick={handleReceiveTransfer}
                disabled={receiveItems.every(item => item.to_receive === 0)}
              >
                <Check className="w-4 h-4" /> Réceptionner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransfertDetail;