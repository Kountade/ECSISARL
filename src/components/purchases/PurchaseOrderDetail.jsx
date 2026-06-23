// src/components/purchases/PurchaseOrderDetail.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import { generateOrderPDF } from './PurchaseOrderPDF';
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
  Mail,
  Phone,
  MapPin,
  Award,
  X,
  Download,
  Loader2,
  Clock,
  Warehouse,
  Eye
} from 'lucide-react';

const PurchaseOrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const statusConfig = {
    draft: { label: 'En attente', color: 'badge-warning', icon: Edit },
    sent: { label: 'Envoyée', color: 'badge-info', icon: Send },
    confirmed: { label: 'Confirmée', color: 'badge-primary', icon: CheckCircle },
    in_transit: { label: 'En transit', color: 'badge-warning', icon: Truck },
    partially_received: { label: 'Partiel', color: 'badge-warning', icon: Receipt },
    received: { label: 'Reçue', color: 'badge-success', icon: CheckCircle },
    cancelled: { label: 'Annulée', color: 'badge-error', icon: X },
    rejected: { label: 'Rejetée', color: 'badge-error', icon: X }
  };

  const urgencyConfig = {
    normal: { label: 'Normal', color: 'badge-info' },
    urgent: { label: 'Urgent', color: 'badge-warning' },
    very_urgent: { label: 'Très urgent', color: 'badge-error' }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0;
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  const formatCurrency = (amount) => {
    return `${formatNumber(amount)} €`;
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get(`/purchase-orders/${id}/`);
      setOrder(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur de chargement de la commande', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!order) return;
    setGeneratingPDF(true);
    try {
      await generateOrderPDF(order);
      showNotification('PDF téléchargé avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      showNotification('Erreur lors de la génération du PDF', 'error');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleSendOrder = async () => {
    try {
      await AxiosInstance.post(`/purchase-orders/${id}/send/`);
      showNotification('Commande envoyée', 'success');
      fetchData();
    } catch (error) {
      showNotification('Erreur lors de l\'envoi', 'error');
    }
  };

  const handleConfirmOrder = async () => {
    try {
      await AxiosInstance.post(`/purchase-orders/${id}/confirm/`);
      showNotification('Commande confirmée', 'success');
      fetchData();
    } catch (error) {
      showNotification('Erreur lors de la confirmation', 'error');
    }
  };

  const handleCancelOrder = async () => {
    try {
      await AxiosInstance.post(`/purchase-orders/${id}/cancel/`);
      showNotification('Commande annulée', 'success');
      fetchData();
    } catch (error) {
      showNotification('Erreur lors de l\'annulation', 'error');
    }
  };

  const getProgress = () => {
    if (!order?.items) return 0;
    const total = order.items.reduce((acc, i) => acc + (i.quantity_ordered || 0), 0);
    const received = order.items.reduce((acc, i) => acc + (i.quantity_received || 0), 0);
    return total > 0 ? (received / total) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-error" />
          <h2 className="text-xl font-bold mb-2">Commande non trouvée</h2>
          <button onClick={() => navigate('/commandes-fournisseurs')} className="btn btn-primary">
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.draft;
  const urgency = urgencyConfig[order.urgency] || urgencyConfig.normal;
  const StatusIcon = status.icon;
  const progress = getProgress();
  const isLate = order.expected_date && new Date(order.expected_date) < new Date() && 
    !['received', 'cancelled'].includes(order.status);

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
          <button onClick={() => navigate('/commandes-fournisseurs')} className="btn btn-ghost btn-sm btn-circle">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
              <Receipt className="w-6 h-6 text-primary" />
              Commande {order.order_number}
            </h1>
            <p className="text-sm text-base-content/60 mt-1">
              Détails de la commande fournisseur
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button onClick={fetchData} className="btn btn-outline btn-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {order.status === 'draft' && (
            <>
              <button onClick={() => navigate(`/commandes/${id}/modifier`)} className="btn btn-outline btn-sm">
                <Edit className="w-4 h-4" /> Modifier
              </button>
              <button onClick={handleSendOrder} className="btn btn-primary btn-sm">
                <Send className="w-4 h-4" /> Envoyer
              </button>
            </>
          )}
          
          {order.status === 'sent' && (
            <button onClick={handleConfirmOrder} className="btn btn-success btn-sm">
              <CheckCircle className="w-4 h-4" /> Confirmer
            </button>
          )}
          
          {['confirmed', 'in_transit', 'partially_received'].includes(order.status) && (
            <button onClick={() => navigate(`/commandes/${id}/reception`)} className="btn btn-primary btn-sm">
              <Truck className="w-4 h-4" /> Réception
            </button>
          )}
          
          {order.status === 'in_transit' && (
            <button onClick={handleCancelOrder} className="btn btn-error btn-sm">
              <X className="w-4 h-4" /> Annuler
            </button>
          )}
          
          <button 
            onClick={handleDownloadPDF} 
            className="btn btn-primary btn-sm"
            disabled={generatingPDF}
          >
            {generatingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Télécharger PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-primary p-3">
          <div className="stat-figure text-primary"><Receipt className="w-5 h-5" /></div>
          <div className="stat-title text-xs">Numéro</div>
          <div className="stat-value text-base">{order.order_number}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-info p-3">
          <div className="stat-figure text-info"><Package className="w-5 h-5" /></div>
          <div className="stat-title text-xs">Articles</div>
          <div className="stat-value text-base">{order.items?.length || 0}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-warning p-3">
          <div className="stat-figure text-warning"><Clock className="w-5 h-5" /></div>
          <div className="stat-title text-xs">Statut</div>
          <div className="stat-value text-sm">
            <span className={`badge ${status.color}`}>{status.label}</span>
          </div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-success p-3">
          <div className="stat-figure text-success"><Award className="w-5 h-5" /></div>
          <div className="stat-title text-xs">Urgence</div>
          <div className="stat-value text-sm">
            <span className={`badge ${urgency.color}`}>{urgency.label}</span>
          </div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-secondary p-3 col-span-2 lg:col-span-1">
          <div className="stat-figure text-secondary"><FileText className="w-5 h-5" /></div>
          <div className="stat-title text-xs">Montant total</div>
          <div className="stat-value text-base">{formatCurrency(order.total || 0)}</div>
        </div>
      </div>

      {/* Informations générales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fournisseur */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Fournisseur
          </h2>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base-content/60">Nom:</span>
              <span className="font-medium">{order.supplier_name || order.supplier?.company_name || '-'}</span>
            </div>
            
            {order.supplier?.phone && (
              <div className="flex justify-between">
                <span className="text-base-content/60">Téléphone:</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-base-content/50" />
                  {order.supplier.phone}
                </span>
              </div>
            )}
            
            {order.supplier?.email && (
              <div className="flex justify-between">
                <span className="text-base-content/60">Email:</span>
                <a href={`mailto:${order.supplier.email}`} className="link link-primary">
                  {order.supplier.email}
                </a>
              </div>
            )}
            
            {order.supplier?.address && (
              <div className="flex justify-between">
                <span className="text-base-content/60">Adresse:</span>
                <span className="text-sm">{order.supplier.address}, {order.supplier.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Informations commande */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-info" />
            Informations commande
          </h2>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base-content/60">Date commande:</span>
              <span className="font-medium">{formatDate(order.order_date)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-base-content/60">Livraison prévue:</span>
              <div className="flex items-center gap-1">
                <span>{formatDate(order.expected_date)}</span>
                {isLate && <span className="badge badge-error badge-xs">Retard</span>}
              </div>
            </div>
            
            <div className="flex justify-between">
              <span className="text-base-content/60">Réf. fournisseur:</span>
              <span>{order.supplier_reference || '-'}</span>
            </div>
            
            {order.warehouse && (
              <div className="flex justify-between">
                <span className="text-base-content/60">Entrepôt:</span>
                <span className="flex items-center gap-1">
                  <Warehouse className="w-4 h-4 text-base-content/50" />
                  {order.warehouse_name || order.warehouse?.name || '-'}
                </span>
              </div>
            )}
            
            {order.created_at && (
              <div className="flex justify-between">
                <span className="text-base-content/60">Créé le:</span>
                <span>{formatDateTime(order.created_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progression */}
      {['sent', 'confirmed', 'in_transit', 'partially_received'].includes(order.status) && (
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

      {/* Articles */}
      <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
        <div className="p-4 border-b border-base-300 bg-base-200/50">
          <h2 className="font-bold text-base flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Articles commandés
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr className="bg-base-200">
                <th>Produit</th>
                <th>Référence</th>
                <th className="text-center">Quantité commandée</th>
                <th className="text-center">Quantité reçue</th>
                <th className="text-right">Prix unitaire</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-base-content/50">
                    Aucun article dans cette commande
                  </td>
                </tr>
              ) : (
                order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-medium">{item.product_name || '-'}</td>
                    <td>{item.product_reference || '-'}</td>
                    <td className="text-center">{item.quantity_ordered}</td>
                    <td className="text-center">{item.quantity_received || 0}</td>
                    <td className="text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="text-right font-semibold">{formatCurrency(item.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-base-200">
              <tr className="font-bold">
                <td colSpan={5} className="text-right">Total</td>
                <td className="text-right">{formatCurrency(order.total || 0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
          <div className="p-4 border-b border-base-300 bg-base-200/50">
            <h2 className="font-bold text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Notes
            </h2>
          </div>
          <div className="p-4">
            <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
          </div>
        </div>
      )}

      {order.internal_notes && (
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
          <div className="p-4 border-b border-base-300 bg-base-200/50">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Eye className="w-5 h-5 text-warning" />
              Notes internes
            </h2>
          </div>
          <div className="p-4">
            <p className="text-sm whitespace-pre-wrap">{order.internal_notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderDetail;