// src/components/notifications/NotificationsPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  ArrowLeft,
  Package,
  DollarSign,
  ClipboardList,
  Calendar,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Truck,
  Clock
} from 'lucide-react';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    stocksFaibles: [],
    ventesImpayees: [],
    commandesAApprouver: [],
    absencesEnAttente: [],
    achatsALivrer: [],
    alertsCount: []
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllNotifications = async () => {
    setRefreshing(true);
    try {
      // Stocks faibles
      const stocksRes = await AxiosInstance.get('/products/low_stock/').catch(() => ({ data: [] }));
      let lowStockData = stocksRes.data || [];
      lowStockData = lowStockData.filter(p => p.minimum_stock > 0);
      
      // Ventes impayées
      const ventesImpRes = await AxiosInstance.get('/sale-orders/?payment_status=pending').catch(() => ({ data: [] }));
      
      // Commandes à approuver
      const cmdRes = await AxiosInstance.get('/sale-orders/?status=pending_approval').catch(() => ({ data: [] }));
      
      // Absences en attente
      const absRes = await AxiosInstance.get('/leaves/?status=pending').catch(() => ({ data: [] }));
      
      // Commandes fournisseurs confirmées
      const achRes = await AxiosInstance.get('/purchase-orders/?status=confirmed').catch(() => ({ data: [] }));
      
      // Alertes d'achat
      const alertsRes = await AxiosInstance.get('/alerts/').catch(() => ({ data: [] }));

      setNotifications({
        stocksFaibles: lowStockData,
        ventesImpayees: ventesImpRes.data || [],
        commandesAApprouver: cmdRes.data || [],
        absencesEnAttente: absRes.data || [],
        achatsALivrer: achRes.data || [],
        alertsCount: alertsRes.data || []
      });
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  const totalCount = 
    notifications.stocksFaibles.length +
    notifications.ventesImpayees.length +
    notifications.commandesAApprouver.length +
    notifications.absencesEnAttente.length +
    notifications.achatsALivrer.length +
    notifications.alertsCount.length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* En-tête pleine largeur */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="btn btn-ghost btn-sm gap-2">
                <ArrowLeft className="w-4 h-4" /> Retour
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Centre de notifications</h1>
                <p className="text-sm text-gray-500">Toutes les alertes système en un seul endroit</p>
              </div>
            </div>
            <button 
              onClick={fetchAllNotifications} 
              disabled={refreshing}
              className="btn btn-outline btn-sm gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal - pleine largeur */}
      <div className="p-6">
        {/* Cartes récapitulatives */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-orange-500 hover:shadow-md transition">
            <div className="text-2xl font-bold text-orange-600">{notifications.stocksFaibles.length}</div>
            <div className="text-sm text-gray-600 font-medium">Stocks faibles</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-red-500 hover:shadow-md transition">
            <div className="text-2xl font-bold text-red-600">{notifications.ventesImpayees.length}</div>
            <div className="text-sm text-gray-600 font-medium">Ventes impayées</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-blue-500 hover:shadow-md transition">
            <div className="text-2xl font-bold text-blue-600">{notifications.commandesAApprouver.length}</div>
            <div className="text-sm text-gray-600 font-medium">Commandes à approuver</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-green-500 hover:shadow-md transition">
            <div className="text-2xl font-bold text-green-600">{notifications.absencesEnAttente.length}</div>
            <div className="text-sm text-gray-600 font-medium">Congés en attente</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-purple-500 hover:shadow-md transition">
            <div className="text-2xl font-bold text-purple-600">{notifications.achatsALivrer.length}</div>
            <div className="text-sm text-gray-600 font-medium">Commandes à livrer</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-yellow-500 hover:shadow-md transition">
            <div className="text-2xl font-bold text-yellow-600">{notifications.alertsCount.length}</div>
            <div className="text-sm text-gray-600 font-medium">Alertes achats</div>
          </div>
        </div>

        {/* Liste des notifications */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : totalCount === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <CheckCircle className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">Aucune notification</h3>
            <p className="text-gray-400">Tous les indicateurs sont au vert</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stocks faibles */}
            {notifications.stocksFaibles.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-orange-200">
                <div className="bg-orange-50 px-6 py-3 border-b border-orange-200 flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-600" />
                  <h2 className="font-semibold text-orange-800">Stocks faibles ({notifications.stocksFaibles.length})</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {notifications.stocksFaibles.map(product => (
                    <div key={product.id} className="px-6 py-4 hover:bg-gray-50 flex flex-wrap justify-between items-center gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-500">Réf: {product.reference} | Stock: {product.stock_quantity} / Seuil: {product.minimum_stock}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/produits/${product.id}`)} 
                        className="btn btn-sm btn-outline"
                      >
                        Voir produit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ventes impayées */}
            {notifications.ventesImpayees.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-red-200">
                <div className="bg-red-50 px-6 py-3 border-b border-red-200 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  <h2 className="font-semibold text-red-800">Ventes impayées ({notifications.ventesImpayees.length})</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {notifications.ventesImpayees.map(sale => (
                    <div key={sale.id} className="px-6 py-4 hover:bg-gray-50 flex flex-wrap justify-between items-center gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Commande #{sale.sale_number}</p>
                        <p className="text-sm text-gray-500">Client: {sale.customer_name} | Montant: {sale.total?.toLocaleString()} FCFA</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/ventes/${sale.id}`)} 
                        className="btn btn-sm btn-outline"
                      >
                        Voir vente
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Commandes à approuver */}
            {notifications.commandesAApprouver.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-200">
                <div className="bg-blue-50 px-6 py-3 border-b border-blue-200 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  <h2 className="font-semibold text-blue-800">Commandes à approuver ({notifications.commandesAApprouver.length})</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {notifications.commandesAApprouver.map(order => (
                    <div key={order.id} className="px-6 py-4 hover:bg-gray-50 flex flex-wrap justify-between items-center gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Commande #{order.order_number}</p>
                        <p className="text-sm text-gray-500">Client: {order.customer_name}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/ventes/${order.id}`)} 
                        className="btn btn-sm btn-outline"
                      >
                        Voir commande
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Demandes de congé */}
            {notifications.absencesEnAttente.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-green-200">
                <div className="bg-green-50 px-6 py-3 border-b border-green-200 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <h2 className="font-semibold text-green-800">Demandes de congé ({notifications.absencesEnAttente.length})</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {notifications.absencesEnAttente.map(leave => (
                    <div key={leave.id} className="px-6 py-4 hover:bg-gray-50 flex flex-wrap justify-between items-center gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{leave.employee_name || leave.user?.name || 'Employé'}</p>
                        <p className="text-sm text-gray-500">Du {leave.start_date} au {leave.end_date}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/conges/${leave.id}`)} 
                        className="btn btn-sm btn-outline"
                      >
                        Traiter
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Commandes fournisseurs à livrer */}
            {notifications.achatsALivrer.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-purple-200">
                <div className="bg-purple-50 px-6 py-3 border-b border-purple-200 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-600" />
                  <h2 className="font-semibold text-purple-800">Commandes à livrer ({notifications.achatsALivrer.length})</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {notifications.achatsALivrer.map(order => (
                    <div key={order.id} className="px-6 py-4 hover:bg-gray-50 flex flex-wrap justify-between items-center gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Commande #{order.order_number}</p>
                        <p className="text-sm text-gray-500">Fournisseur: {order.supplier_name} | Livraison prévue: {order.expected_date}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/commandes-fournisseurs/${order.id}`)} 
                        className="btn btn-sm btn-outline"
                      >
                        Voir commande
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alertes achats */}
            {notifications.alertsCount.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-yellow-200">
                <div className="bg-yellow-50 px-6 py-3 border-b border-yellow-200 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <h2 className="font-semibold text-yellow-800">Alertes achats ({notifications.alertsCount.length})</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {notifications.alertsCount.map(alert => (
                    <div key={alert.id} className="px-6 py-4 hover:bg-gray-50 flex flex-wrap justify-between items-center gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{alert.alert_type_display || alert.alert_type}</p>
                        <p className="text-sm text-gray-500">{alert.message}</p>
                      </div>
                      <button 
                        onClick={() => navigate('/purchase-alerts')} 
                        className="btn btn-sm btn-outline"
                      >
                        Gérer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;