// src/components/sales/SaleForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Save, Trash2, Plus, ArrowLeft, Package, DollarSign, Percent,
  AlertCircle, CheckCircle, Search, ChevronLeft, ChevronRight,
  Store, Truck, X
} from 'lucide-react';

const SaleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // États
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Formulaire principal
  const [formData, setFormData] = useState({
    customer: '',
    price_type: 'retail',      // 'retail' ou 'wholesale'
    warehouse: '',
    discount_rate: 0,
    shipping_cost: 0,
    delivery_date: '',
    shipping_address: '',
    notes: '',
    items: []                   // chaque item : product, product_name, quantity, unit_price, warehouse_id, warehouse_name
  });

  // Modale d'ajout produit
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tempWarehouseId, setTempWarehouseId] = useState('');
  const [tempQuantity, setTempQuantity] = useState(1);
  const [stockInfo, setStockInfo] = useState({ disponible: 0 });

  // ========== Utilitaires ==========
  const formatMoney = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(num);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
  };

  // Récupérer le prix selon le type de vente
  const getProductPrice = (product, priceType) => {
    if (!product) return 0;
    if (priceType === 'wholesale') {
      return parseFloat(product.wholesale_price) || parseFloat(product.sale_price) || 0;
    }
    return parseFloat(product.sale_price) || 0;
  };

  // Vérifier la disponibilité via l'endpoint check_availability
  const checkStock = async (productId, warehouseId) => {
    if (!productId || !warehouseId) return { disponible: 0 };
    try {
      const response = await AxiosInstance.get(`/products/${productId}/check_availability/`, {
        params: { warehouse_id: warehouseId, quantity: 1 }
      });
      return { disponible: response.data.available_quantity || 0 };
    } catch (error) {
      console.error('Erreur vérification stock', error);
      return { disponible: 0 };
    }
  };

  // ========== Chargement initial ==========
  const fetchData = async () => {
    setLoading(true);
    try {
      const [customersRes, productsRes, warehousesRes] = await Promise.all([
        AxiosInstance.get('/customers/'),
        AxiosInstance.get('/products/'),
        AxiosInstance.get('/warehouses/')
      ]);
      setCustomers(customersRes.data || []);
      setProducts(productsRes.data || []);
      setWarehouses(warehousesRes.data || []);

      if (isEditMode) {
        const saleRes = await AxiosInstance.get(`/sales/${id}/`);
        const sale = saleRes.data;
        setFormData({
          customer: sale.customer?.id?.toString() || '',
          price_type: sale.price_type || 'retail',
          warehouse: sale.warehouse?.id?.toString() || '',
          discount_rate: parseFloat(sale.discount_rate) || 0,
          shipping_cost: parseFloat(sale.shipping_cost) || 0,
          delivery_date: sale.delivery_date || '',
          shipping_address: sale.shipping_address || '',
          notes: sale.notes || '',
          items: (sale.items || []).map(item => ({
            product: item.product?.id?.toString(),
            product_name: item.product?.name || '',
            quantity: parseFloat(item.quantity) || 1,
            unit_price: parseFloat(item.unit_price) || 0,
            warehouse_id: sale.warehouse?.id?.toString() || '',
            warehouse_name: sale.warehouse?.name || ''
          }))
        });
      }
    } catch (error) {
      console.error(error);
      showNotification('Erreur de chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // ========== Changement type de prix ==========
  const handlePriceTypeChange = (type) => {
    if (type === formData.price_type) return;
    setFormData(prev => ({ ...prev, price_type: type, items: [] }));
    setSelectedProduct(null);
    showNotification(`Type de prix changé à ${type === 'wholesale' ? 'Gros' : 'Détail'}. Les produits ont été réinitialisés.`, 'info');
  };

  // ========== Gestion de la modale produit ==========
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setTempWarehouseId('');
    setTempQuantity(1);
    setStockInfo({ disponible: 0 });
  };

  const handleWarehouseChange = async (e) => {
    const whId = e.target.value;
    setTempWarehouseId(whId);
    if (selectedProduct && whId) {
      const stock = await checkStock(selectedProduct.id, whId);
      setStockInfo(stock);
    } else {
      setStockInfo({ disponible: 0 });
    }
  };

  const addItem = () => {
    if (!selectedProduct) return showNotification('Sélectionnez un produit', 'error');
    if (!tempWarehouseId) return showNotification('Choisissez un entrepôt', 'error');
    if (tempQuantity <= 0) return showNotification('Quantité invalide', 'error');
    if (tempQuantity > stockInfo.disponible)
      return showNotification(`Stock insuffisant (max ${stockInfo.disponible})`, 'error');

    const warehouse = warehouses.find(w => w.id.toString() === tempWarehouseId);
    const price = getProductPrice(selectedProduct, formData.price_type);

    const newItem = {
      product: selectedProduct.id.toString(),
      product_name: selectedProduct.name,
      quantity: tempQuantity,
      unit_price: price,
      warehouse_id: tempWarehouseId,
      warehouse_name: warehouse?.name || 'Inconnu'
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));

    // Réinitialiser la modale
    setSelectedProduct(null);
    setTempWarehouseId('');
    setTempQuantity(1);
    setProductSearch('');
    setShowProductModal(false);
    setStockInfo({ disponible: 0 });
  };

  const removeItem = (index) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const updateQuantity = async (index, newQty) => {
    const qty = parseFloat(newQty) || 0;
    if (qty <= 0) return;
    const item = formData.items[index];
    const stock = await checkStock(item.product, item.warehouse_id);
    if (qty > stock.disponible) {
      showNotification(`Stock insuffisant (max ${stock.disponible})`, 'warning');
      return;
    }
    const updated = [...formData.items];
    updated[index].quantity = qty;
    setFormData(prev => ({ ...prev, items: updated }));
  };

  // ========== Calcul des totaux ==========
  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const discount = subtotal * (formData.discount_rate / 100);
    const total = subtotal - discount + (formData.shipping_cost || 0);
    return { subtotal, discount, total };
  };
  const { subtotal, discount, total } = calculateTotals();

  // ========== Validation d'étape ==========
  const validateStep = () => {
    if (activeStep === 0) {
      if (!formData.customer) {
        showNotification('Veuillez sélectionner un client', 'error');
        return false;
      }
      if (!formData.warehouse) {
        showNotification('Veuillez sélectionner un entrepôt', 'error');
        return false;
      }
      return true;
    }
    if (activeStep === 1 && formData.items.length === 0) {
      showNotification('Ajoutez au moins un produit', 'error');
      return false;
    }
    return true;
  };

  const handleNext = () => validateStep() && setActiveStep(prev => prev + 1);
  const handleBack = () => setActiveStep(prev => prev - 1);

  // ========== Soumission ==========
  const handleSubmit = async () => {
    if (formData.items.length === 0) {
      showNotification('Ajoutez au moins un produit', 'error');
      return;
    }
    if (!formData.warehouse) {
      showNotification('Veuillez sélectionner un entrepôt', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      customer: parseInt(formData.customer),
      price_type: formData.price_type,
      warehouse: parseInt(formData.warehouse),
      discount_rate: parseFloat(formData.discount_rate) || 0,
      shipping_cost: parseFloat(formData.shipping_cost) || 0,
      delivery_date: formData.delivery_date || null,
      shipping_address: formData.shipping_address,
      notes: formData.notes,
      items: formData.items.map(item => ({
        product: parseInt(item.product),
        quantity: item.quantity,
        unit_price: item.unit_price   // ← CORRECTION : envoi du prix unitaire
      }))
    };

    try {
      if (isEditMode) {
        await AxiosInstance.patch(`/sales/${id}/`, payload);
        showNotification('Vente modifiée avec succès', 'success');
      } else {
        await AxiosInstance.post('/sales/', payload);
        showNotification('Vente créée avec succès', 'success');
      }
      setTimeout(() => navigate('/ventes'), 1500);
    } catch (err) {
      console.error(err);
      let errorMsg = 'Erreur serveur';
      if (err.response?.data) {
        if (typeof err.response.data === 'object')
          errorMsg = JSON.stringify(err.response.data, null, 2);
        else
          errorMsg = err.response.data;
      }
      showNotification(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrage des produits pour la recherche
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.reference || '').toLowerCase().includes(productSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="text-center"><div className="loading loading-spinner loading-lg text-primary"></div><p>Chargement...</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Notification */}
        {notification.show && (
          <div className="fixed top-16 right-6 z-50 animate-slide-in">
            <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
              {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{notification.message}</span>
              <button onClick={() => setNotification(prev => ({ ...prev, show: false }))} className="btn btn-sm btn-ghost">✕</button>
            </div>
          </div>
        )}

        <div className="mb-4 flex justify-between items-center">
          <Link to="/ventes" className="btn btn-ghost gap-2"><ArrowLeft size={18} /> Retour</Link>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-3">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">{isEditMode ? 'Modifier la vente' : 'Nouvelle vente'}</h2>
        </div>

        {/* Stepper */}
        <ul className="steps steps-vertical lg:steps-horizontal w-full mb-8">
          <li className={`step ${activeStep >= 0 ? 'step-primary' : ''}`}>Client & Type</li>
          <li className={`step ${activeStep >= 1 ? 'step-primary' : ''}`}>Produits</li>
          <li className={`step ${activeStep >= 2 ? 'step-primary' : ''}`}>Finalisation</li>
        </ul>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-6">
            {/* Étape 1 : Client, type de prix, entrepôt */}
            {activeStep === 0 && (
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label font-medium">Client *</label>
                  <select className="select select-bordered" value={formData.customer} onChange={e => setFormData({ ...formData, customer: e.target.value })}>
                    <option value="">-- Sélectionner --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name || c.company_name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label font-medium">Type de prix</label>
                  <div className="flex gap-6">
                    <label className="label cursor-pointer gap-2">
                      <input type="radio" name="price_type" value="retail" checked={formData.price_type === 'retail'} onChange={() => handlePriceTypeChange('retail')} className="radio radio-primary" />
                      <Store size={18} /> Détail
                    </label>
                    <label className="label cursor-pointer gap-2">
                      <input type="radio" name="price_type" value="wholesale" checked={formData.price_type === 'wholesale'} onChange={() => handlePriceTypeChange('wholesale')} className="radio radio-primary" />
                      <Truck size={18} /> Gros
                    </label>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label font-medium">Entrepôt *</label>
                  <select className="select select-bordered" value={formData.warehouse} onChange={e => setFormData({ ...formData, warehouse: e.target.value })}>
                    <option value="">-- Sélectionner un entrepôt --</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label font-medium">Date de livraison</label>
                  <input type="date" className="input input-bordered" value={formData.delivery_date} onChange={e => setFormData({ ...formData, delivery_date: e.target.value })} />
                </div>

                <div className="form-control">
                  <label className="label font-medium">Adresse de livraison</label>
                  <textarea rows="2" className="textarea textarea-bordered" value={formData.shipping_address} onChange={e => setFormData({ ...formData, shipping_address: e.target.value })} />
                </div>

                <div className="flex justify-end">
                  <button onClick={handleNext} className="btn btn-primary gap-2">Suivant <ChevronRight size={18} /></button>
                </div>
              </div>
            )}

            {/* Étape 2 : Produits */}
            {activeStep === 1 && (
              <div className="space-y-6">
                {formData.items.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-3">Articles sélectionnés</h3>
                    <div className="overflow-x-auto">
                      <table className="table table-sm">
                        <thead>
                          <tr><th>Produit</th><th>Entrepôt</th><th className="text-center">Qté</th><th className="text-right">Prix unit.</th><th className="text-right">Total</th><th></th></tr>
                        </thead>
                        <tbody>
                          {formData.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="font-medium">{item.product_name}</td>
                              <td>{item.warehouse_name}</td>
                              <td className="text-center">
                                <input type="number" step="0.01" min="0.01" value={item.quantity} onChange={(e) => updateQuantity(idx, e.target.value)} className="input input-bordered input-sm w-24 text-center" />
                              </td>
                              <td className="text-right">{formatMoney(item.unit_price)}</td>
                              <td className="text-right">{formatMoney(item.quantity * item.unit_price)}</td>
                              <td><button onClick={() => removeItem(idx)} className="btn btn-ghost btn-sm text-error"><Trash2 size={16} /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <button onClick={() => setShowProductModal(true)} className="btn btn-primary gap-2"><Plus size={18} /> Ajouter un produit</button>

                <div className="flex justify-between">
                  <button onClick={handleBack} className="btn btn-outline gap-2"><ChevronLeft size={18} /> Retour</button>
                  <button onClick={handleNext} className="btn btn-primary gap-2" disabled={formData.items.length === 0}>Suivant <ChevronRight size={18} /></button>
                </div>
              </div>
            )}

            {/* Étape 3 : Finalisation */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label font-medium">Remise (%)</label>
                    <input type="number" step="0.1" min="0" max="100" className="input input-bordered" value={formData.discount_rate} onChange={e => setFormData({ ...formData, discount_rate: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="form-control">
                    <label className="label font-medium">Frais de livraison</label>
                    <input type="number" step="0.01" min="0" className="input input-bordered" value={formData.shipping_cost} onChange={e => setFormData({ ...formData, shipping_cost: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label font-medium">Notes</label>
                  <textarea rows="3" className="textarea textarea-bordered" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                </div>

                <div className="bg-primary/5 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between"><span>Sous-total :</span><span>{formatMoney(subtotal)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-warning"><span>Remise ({formData.discount_rate}%) :</span><span>-{formatMoney(discount)}</span></div>}
                  {formData.shipping_cost > 0 && <div className="flex justify-between"><span>Frais de livraison :</span><span>{formatMoney(formData.shipping_cost)}</span></div>}
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-primary text-lg"><span>Total TTC :</span><span>{formatMoney(total)}</span></div>
                </div>

                <div className="flex justify-between">
                  <button onClick={handleBack} className="btn btn-outline gap-2"><ChevronLeft size={18} /> Retour</button>
                  <div className="flex gap-2">
                    <Link to="/ventes" className="btn btn-ghost">Annuler</Link>
                    <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary gap-2">
                      {submitting ? <span className="loading loading-spinner loading-sm"></span> : <Save size={18} />}
                      {submitting ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Créer')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALE D'AJOUT DE PRODUIT */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-primary p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Ajouter un produit</h2>
              <button onClick={() => setShowProductModal(false)} className="text-white"><X size={24} /></button>
            </div>
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-4 border-r overflow-y-auto max-h-[60vh]">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Rechercher..." className="input input-bordered w-full pl-10" value={productSearch} onChange={e => setProductSearch(e.target.value)} autoFocus />
                </div>
                <div className="space-y-2">
                  {filteredProducts.slice(0, 30).map(p => (
                    <div key={p.id} onClick={() => handleSelectProduct(p)} className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedProduct?.id === p.id ? 'border-primary bg-primary/10' : 'hover:border-primary/50'}`}>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-gray-500">Réf: {p.reference || '-'}</div>
                      <div className="text-xs mt-1">
                        <span className="text-primary">Gros: {formatMoney(p.wholesale_price)}</span> | Détail: {formatMoney(p.sale_price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-80 p-4 bg-base-200">
                {selectedProduct ? (
                  <div className="space-y-3">
                    <h3 className="font-bold">{selectedProduct.name}</h3>
                    <select className="select select-bordered w-full" value={tempWarehouseId} onChange={handleWarehouseChange}>
                      <option value="">Entrepôt</option>
                      {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                    <input type="number" step="0.01" min="0.01" className="input input-bordered w-full" placeholder="Quantité" value={tempQuantity} onChange={e => setTempQuantity(parseFloat(e.target.value) || 0)} />
                    {tempWarehouseId && (
                      <div className="text-sm">Stock disponible: <span className={tempQuantity > stockInfo.disponible ? 'text-error' : 'text-success'}>{stockInfo.disponible}</span></div>
                    )}
                    <div className="text-sm">Prix unitaire ({formData.price_type === 'wholesale' ? 'gros' : 'détail'}): <strong>{formatMoney(getProductPrice(selectedProduct, formData.price_type))}</strong></div>
                    <button onClick={addItem} disabled={!tempWarehouseId || tempQuantity <= 0 || tempQuantity > stockInfo.disponible} className="btn btn-primary w-full gap-2"><Plus size={18} /> Ajouter</button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">Sélectionnez un produit</div>
                )}
              </div>
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
  );
};

export default SaleForm;