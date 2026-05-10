// src/components/sales/SaleDetail.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  DollarSign,
  Calendar,
  MapPin,
  User,
  Building2,
  Phone,
  Mail,
  FileText,
  RefreshCw,
  Printer,
  Download,
  Send,
  CreditCard,
  AlertCircle,
  Eye,
  Clock,
  Shield,
  CheckSquare
} from 'lucide-react';

const SaleDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Configuration des statuts
  const statusConfig = {
    draft: { label: 'Brouillon', color: 'neutral', icon: FileText, bg: 'bg-neutral/10', text: 'text-neutral' },
    confirmed: { label: 'Confirmée', color: 'primary', icon: CheckCircle, bg: 'bg-primary/10', text: 'text-primary' },
    in_preparation: { label: 'En préparation', color: 'info', icon: Package, bg: 'bg-info/10', text: 'text-info' },
    shipped: { label: 'Expédiée', color: 'warning', icon: Truck, bg: 'bg-warning/10', text: 'text-warning' },
    delivered: { label: 'Livrée', color: 'success', icon: CheckCircle, bg: 'bg-success/10', text: 'text-success' },
    partially_delivered: { label: 'Partiellement livrée', color: 'warning', icon: Truck, bg: 'bg-warning/10', text: 'text-warning' },
    cancelled: { label: 'Annulée', color: 'error', icon: XCircle, bg: 'bg-error/10', text: 'text-error' },
    returned: { label: 'Retournée', color: 'error', icon: XCircle, bg: 'bg-error/10', text: 'text-error' }
  };

  const paymentStatusConfig = {
    pending: { label: 'En attente', color: 'warning', icon: Clock },
    partially_paid: { label: 'Partiellement payé', color: 'info', icon: CreditCard },
    paid: { label: 'Payé', color: 'success', icon: CheckCircle },
    overdue: { label: 'En retard', color: 'error', icon: AlertCircle },
    refunded: { label: 'Remboursé', color: 'neutral', icon: RefreshCw }
  };

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0;
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(number);
  };

  const formatCurrency = (amount) => `${formatNumber(amount)} FCFA`;
  
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

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
  };

  const fetchSale = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get(`/sales/${id}/`);
      setSale(response.data);
    } catch (error) {
      console.error(error);
      showNotification('Erreur lors du chargement des détails', 'error');
      navigate('/ventes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSale();
  }, [id]);

  const handleConfirmSale = async () => {
    setLoadingAction(true);
    try {
      await AxiosInstance.post(`/sales/${id}/confirm/`);
      showNotification('Vente confirmée avec succès', 'success');
      fetchSale();
      setShowConfirmModal(false);
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors de la confirmation', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCancelSale = async () => {
    setLoadingAction(true);
    try {
      await AxiosInstance.post(`/sales/${id}/cancel/`);
      showNotification('Vente annulée', 'success');
      fetchSale();
      setShowCancelModal(false);
    } catch (error) {
      showNotification('Erreur lors de l\'annulation', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteSale = async () => {
    setLoadingAction(true);
    try {
      await AxiosInstance.delete(`/sales/${id}/`);
      showNotification('Vente supprimée avec succès', 'success');
      setTimeout(() => navigate('/ventes'), 1500);
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
      setLoadingAction(false);
      setShowDeleteModal(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12"></div>
          <p className="text-base font-semibold text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!sale) return null;

  const status = statusConfig[sale.status] || statusConfig.draft;
  const StatusIcon = status.icon;
  const paymentStatus = paymentStatusConfig[sale.payment_status] || paymentStatusConfig.pending;
  const PaymentIcon = paymentStatus.icon;
  const customer = sale.customer || {};

  // Calcul des totaux
  const subtotal = sale.subtotal || 0;
  const discount = sale.discount || 0;
  const shippingCost = sale.shipping_cost || 0;
  const total = sale.total || 0;

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Notification */}
        {notification.show && (
          <div className="fixed top-20 right-6 z-50 animate-slide-in">
            <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm`}>
              {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{notification.message}</span>
              <button onClick={() => setNotification(prev => ({ ...prev, show: false }))} className="btn btn-sm btn-ghost">✕</button>
            </div>
          </div>
        )}

        {/* En-tête */}
        <div className="mb-4 flex flex-wrap justify-between items-center gap-3">
          <Link to="/ventes" className="btn btn-ghost gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="btn btn-outline btn-sm gap-2">
              <Printer className="w-4 h-4" /> Imprimer
            </button>
            <button onClick={fetchSale} className="btn btn-outline btn-sm gap-2">
              <RefreshCw className="w-4 h-4" /> Actualiser
            </button>
            {sale.status === 'draft' && (
              <>
                <button onClick={() => navigate(`/ventes/${id}/modifier`)} className="btn btn-info btn-sm gap-2">
                  <Edit className="w-4 h-4" /> Modifier
                </button>
                <button onClick={() => setShowConfirmModal(true)} className="btn btn-success btn-sm gap-2">
                  <CheckCircle className="w-4 h-4" /> Confirmer
                </button>
                <button onClick={() => setShowDeleteModal(true)} className="btn btn-error btn-sm gap-2">
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </>
            )}
            {sale.status === 'confirmed' && (
              <button onClick={() => setShowCancelModal(true)} className="btn btn-error btn-sm gap-2">
                <XCircle className="w-4 h-4" /> Annuler
              </button>
            )}
          </div>
        </div>

        {/* Titre */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${status.bg} mb-3`}>
            <StatusIcon className={`w-8 h-8 ${status.text}`} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Vente {sale.sale_number}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Créée le {formatDateTime(sale.created_at)} par {sale.created_by?.email || '-'}
          </p>
        </div>

        {/* Cartes d'info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Client */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-primary">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <User className="w-5 h-5" />
                  <h3 className="font-semibold">Client</h3>
                </div>
                <p className="font-medium text-gray-900">{customer.full_name || customer.company_name || '-'}</p>
                {customer.email && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3" /> {customer.email}
                  </p>
                )}
                {customer.phone && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {customer.phone}
                  </p>
                )}
                {(customer.city || customer.country) && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {customer.city}, {customer.country}
                  </p>
                )}
              </div>
              {customer.customer_type_display && (
                <span className="badge badge-outline text-xs">{customer.customer_type_display}</span>
              )}
            </div>
          </div>

          {/* Entrepôt & Livraison */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-info">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-info">
                  <Building2 className="w-5 h-5" />
                  <h3 className="font-semibold">Entrepôt & Livraison</h3>
                </div>
                <p className="font-medium text-gray-900">{sale.warehouse?.name || '-'}</p>
                {sale.delivery_date && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" /> Livraison prévue: {formatDate(sale.delivery_date)}
                  </p>
                )}
                {sale.delivered_date && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Livrée le {formatDate(sale.delivered_date)}
                  </p>
                )}
                {sale.shipping_address && (
                  <p className="text-sm text-gray-500 mt-1 max-w-xs">{sale.shipping_address}</p>
                )}
              </div>
              <span className="badge badge-info text-xs">{sale.warehouse?.name || 'N/A'}</span>
            </div>
          </div>

          {/* Paiement */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-success">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-success">
                  <DollarSign className="w-5 h-5" />
                  <h3 className="font-semibold">Paiement</h3>
                </div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(total)}</p>
                <div className="mt-2">
                  <span className={`badge badge-${paymentStatus.color} badge-sm gap-1`}>
                    <PaymentIcon className="w-3 h-3" /> {paymentStatus.label}
                  </span>
                </div>
                {sale.invoice?.paid_amount > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Payé: {formatCurrency(sale.invoice.paid_amount || 0)}
                  </p>
                )}
                {sale.invoice?.remaining_amount > 0 && (
                  <p className="text-sm text-warning">
                    Reste à payer: {formatCurrency(sale.invoice.remaining_amount)}
                  </p>
                )}
              </div>
              {sale.invoice && sale.payment_status !== 'paid' && (
                <Link to={`/paiements/nouveau?invoice=${sale.invoice.id}`} className="btn btn-primary btn-sm gap-1">
                  <CreditCard className="w-3 h-3" /> Payer
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Deuxième ligne de cartes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-3 text-center border-t-4 border-primary">
            <div className="text-2xl font-bold text-primary">{sale.items?.length || 0}</div>
            <div className="text-xs text-gray-500">Produits</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center border-t-4 border-info">
            <div className="text-2xl font-bold text-info">{sale.deliveries?.length || 0}</div>
            <div className="text-xs text-gray-500">Livraisons</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center border-t-4 border-success">
            <div className="text-2xl font-bold text-success">{sale.invoice?.payments?.length || 0}</div>
            <div className="text-xs text-gray-500">Paiements</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center border-t-4 border-warning">
            <div className="text-2xl font-bold text-warning">{sale.returns?.length || 0}</div>
            <div className="text-xs text-gray-500">Retours</div>
          </div>
        </div>

        {/* Détails de la vente */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-800">Détail des produits</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50">
                <tr className="text-sm font-semibold text-gray-700">
                  <th className="py-3 px-4">Produit</th>
                  <th className="py-3 px-4 text-center">Quantité</th>
                  <th className="py-3 px-4 text-center">Livrée</th>
                  <th className="py-3 px-4 text-center">Retournée</th>
                  <th className="py-3 px-4 text-right">Prix unit.</th>
                  <th className="py-3 px-4 text-right">Remise</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(sale.items || []).map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-xs text-gray-400">Réf: {item.product_reference}</div>
                    </td>
                    <td className="text-center">{formatNumber(item.quantity)}</td>
                    <td className="text-center text-success">{formatNumber(item.quantity_delivered || 0)}</td>
                    <td className="text-center text-warning">{formatNumber(item.quantity_returned || 0)}</td>
                    <td className="text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="text-right">{item.discount_rate || 0}%</td>
                    <td className="text-right font-semibold">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t">
                <tr>
                  <td colSpan="5" className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-right font-medium">Sous-total:</td>
                  <td className="py-3 px-4 text-right font-medium">{formatCurrency(subtotal)}</td>
                </tr>
                {discount > 0 && (
                  <tr>
                    <td colSpan="5"></td>
                    <td className="py-2 px-4 text-right text-warning">Remise ({sale.discount_rate || 0}%):</td>
                    <td className="py-2 px-4 text-right text-warning">-{formatCurrency(discount)}</td>
                  </tr>
                )}
                {shippingCost > 0 && (
                  <tr>
                    <td colSpan="5"></td>
                    <td className="py-2 px-4 text-right">Livraison:</td>
                    <td className="py-2 px-4 text-right">{formatCurrency(shippingCost)}</td>
                  </tr>
                )}
                <tr className="font-bold text-primary">
                  <td colSpan="5"></td>
                  <td className="py-3 px-4 text-right text-base">Total TTC:</td>
                  <td className="py-3 px-4 text-right text-base">{formatCurrency(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notes */}
        {sale.notes && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex items-center gap-2 mb-3 text-gray-700">
              <FileText className="w-4 h-4" />
              <h3 className="font-semibold">Notes</h3>
            </div>
            <p className="text-gray-600 text-sm">{sale.notes}</p>
          </div>
        )}

        {/* Informations supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Livraisons */}
          {sale.deliveries && sale.deliveries.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-5 py-3 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-info" />
                  <h3 className="font-semibold text-gray-800">Livraisons</h3>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {sale.deliveries.map((delivery, idx) => (
                  <div key={idx} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{delivery.delivery_number}</p>
                        <p className="text-sm text-gray-500">Date: {formatDate(delivery.delivery_date)}</p>
                        {delivery.tracking_number && (
                          <p className="text-sm text-gray-500">Tracking: {delivery.tracking_number}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{delivery.items?.length || 0} article(s)</p>
                      </div>
                      <span className="badge badge-sm">{delivery.status_display}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paiements */}
          {sale.invoice?.payments && sale.invoice.payments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-5 py-3 bg-gray-50">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-success" />
                  <h3 className="font-semibold text-gray-800">Historique des paiements</h3>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {sale.invoice.payments.map((payment, idx) => (
                  <div key={idx} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-success">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-gray-500">Méthode: {payment.payment_method_display}</p>
                        <p className="text-xs text-gray-400">Date: {formatDate(payment.payment_date)}</p>
                      </div>
                      <span className="badge badge-success badge-sm">Complété</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modale de confirmation */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-2">Confirmer la vente</h3>
              <p className="text-gray-600 mb-4">
                Êtes-vous sûr de vouloir confirmer la vente <strong>"{sale.sale_number}"</strong> ?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                <p><strong>Client :</strong> {customer.full_name || customer.company_name}</p>
                <p><strong>Montant :</strong> {formatCurrency(total)}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowConfirmModal(false)} className="btn btn-outline">Annuler</button>
                <button onClick={handleConfirmSale} disabled={loadingAction} className="btn btn-success gap-2">
                  {loadingAction && <span className="loading loading-spinner loading-sm"></span>}
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modale d'annulation */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-xl font-bold mb-2">Annuler la vente</h3>
              <p className="text-gray-600 mb-4">
                Êtes-vous sûr de vouloir annuler la vente <strong>"{sale.sale_number}"</strong> ?
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowCancelModal(false)} className="btn btn-outline">Retour</button>
                <button onClick={handleCancelSale} disabled={loadingAction} className="btn btn-warning gap-2">
                  {loadingAction && <span className="loading loading-spinner loading-sm"></span>}
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modale de suppression */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-error" />
              </div>
              <h3 className="text-xl font-bold mb-2">Supprimer la vente</h3>
              <p className="text-gray-600 mb-4">
                Êtes-vous sûr de vouloir supprimer la vente <strong className="text-error">"{sale.sale_number}"</strong> ?
              </p>
              <p className="text-xs text-gray-500 mb-6">Cette action est irréversible.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline">Annuler</button>
                <button onClick={handleDeleteSale} disabled={loadingAction} className="btn btn-error gap-2">
                  {loadingAction && <span className="loading loading-spinner loading-sm"></span>}
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
        
        @media print {
          .btn, .fixed, .alert, .modal {
            display: none !important;
          }
          body {
            background: white;
            padding: 0;
            margin: 0;
          }
          .min-h-screen {
            min-height: auto;
          }
          .shadow-sm {
            box-shadow: none;
          }
          .border {
            border: 1px solid #e5e7eb;
          }
        }
      `}</style>
    </div>
  );
};

export default SaleDetail;