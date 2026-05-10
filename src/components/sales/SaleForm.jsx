// src/components/sales/SaleForm.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Save, Trash2, Plus, ArrowLeft, Package, DollarSign, Percent,
  AlertCircle, CheckCircle, Search, ChevronLeft, ChevronRight,
  Store, Truck, X, User, Building2, Calendar, MapPin, FileText,
  RefreshCw, ShoppingCart, TrendingUp, Minus, Filter, Layers
} from 'lucide-react';

const SaleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // États
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Formulaire
  const [formData, setFormData] = useState({
    customer: '',
    price_type: 'retail',
    warehouse: '',
    discount_rate: 0,
    shipping_cost: 0,
    delivery_date: '',
    shipping_address: '',
    notes: '',
    items: []
  });

  // UI
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);

  // Infos
  const [customerInfo, setCustomerInfo] = useState(null);
  const [warehouseInfo, setWarehouseInfo] = useState(null);

  // ========== UTILITAIRES ==========
  const formatMoney = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (date) => date ? new Date(date).toISOString().split('T')[0] : '';

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
  };

  // ========== CALCULS ==========
  const getProductPrice = useCallback((product) => {
    if (!product) return 0;
    if (formData.price_type === 'wholesale') {
      return parseFloat(product.wholesale_price) || parseFloat(product.sale_price) || 0;
    }
    return parseFloat(product.sale_price) || 0;
  }, [formData.price_type]);

  const checkStock = useCallback(async (productId) => {
    if (!productId || !formData.warehouse) return 0;
    try {
      const response = await AxiosInstance.get(`/products/${productId}/check_availability/`, {
        params: { warehouse_id: formData.warehouse, quantity: 1 }
      });
      return response.data.available_quantity || 0;
    } catch (error) {
      return 0;
    }
  }, [formData.warehouse]);

  const calculateTotals = useCallback(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const discount = subtotal * (formData.discount_rate / 100);
    const total = subtotal - discount + (formData.shipping_cost || 0);
    return { subtotal, discount, total };
  }, [formData.items, formData.discount_rate, formData.shipping_cost]);

  const { subtotal, discount, total } = calculateTotals();

  // ========== CHARGEMENT ==========
  const fetchData = async () => {
    setLoading(true);
    try {
      const [customersRes, productsRes, categoriesRes, warehousesRes] = await Promise.all([
        AxiosInstance.get('/customers/'),
        AxiosInstance.get('/products/'),
        AxiosInstance.get('/categories/').catch(() => ({ data: [] })),
        AxiosInstance.get('/warehouses/')
      ]);
      setCustomers(customersRes.data || []);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
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
            id: item.id,
            product: item.product?.id?.toString(),
            product_name: item.product?.name || '',
            product_reference: item.product?.reference || '',
            quantity: parseFloat(item.quantity) || 1,
            unit_price: parseFloat(item.unit_price) || 0
          }))
        });
        if (sale.customer) setCustomerInfo(sale.customer);
        if (sale.warehouse) setWarehouseInfo(sale.warehouse);
      }
    } catch (error) {
      console.error(error);
      showNotification('Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  useEffect(() => {
    if (formData.customer) {
      const customer = customers.find(c => c.id.toString() === formData.customer);
      setCustomerInfo(customer);
    }
  }, [formData.customer, customers]);

  useEffect(() => {
    if (formData.warehouse) {
      const warehouse = warehouses.find(w => w.id.toString() === formData.warehouse);
      setWarehouseInfo(warehouse);
    }
  }, [formData.warehouse, warehouses]);

  // ========== GESTION PRODUITS ==========
  const addProduct = async (product) => {
    if (!formData.warehouse) {
      showNotification('Veuillez d\'abord sélectionner un entrepôt', 'error');
      return;
    }

    const stock = await checkStock(product.id);
    if (stock <= 0) {
      showNotification(`Stock insuffisant pour ${product.name}`, 'error');
      return;
    }

    const existingIndex = formData.items.findIndex(i => i.product === product.id.toString());
    const price = getProductPrice(product);

    if (existingIndex >= 0) {
      const updated = [...formData.items];
      const newQty = updated[existingIndex].quantity + 1;
      if (newQty > stock) {
        showNotification(`Stock maximum atteint (${stock})`, 'warning');
        return;
      }
      updated[existingIndex].quantity = newQty;
      setFormData(prev => ({ ...prev, items: updated }));
      showNotification(`Quantité augmentée pour ${product.name}`, 'success');
    } else {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, {
          product: product.id.toString(),
          product_name: product.name,
          product_reference: product.reference || '-',
          quantity: 1,
          unit_price: price
        }]
      }));
      showNotification(`${product.name} ajouté`, 'success');
    }
    setShowProductSelector(false);
    setProductSearch('');
    setSelectedCategory('');
  };

  const removeItem = (index) => {
    const item = formData.items[index];
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    showNotification(`${item.product_name} retiré`, 'info');
  };

  const updateQuantity = async (index, newQty) => {
    const qty = parseFloat(newQty) || 0;
    if (qty <= 0) return;

    const item = formData.items[index];
    const stock = await checkStock(item.product);

    if (qty > stock) {
      showNotification(`Stock insuffisant (max ${stock})`, 'warning');
      return;
    }

    const updated = [...formData.items];
    updated[index].quantity = qty;
    setFormData(prev => ({ ...prev, items: updated }));
  };

  const handlePriceTypeChange = (type) => {
    if (type === formData.price_type) return;
    setFormData(prev => ({
      ...prev,
      price_type: type,
      items: prev.items.map(item => ({
        ...item,
        unit_price: getProductPrice(products.find(p => p.id.toString() === item.product))
      }))
    }));
    showNotification(`Mode ${type === 'wholesale' ? 'GROS' : 'DÉTAIL'} activé`, 'info');
  };

  // ========== VALIDATION & SOUMISSION ==========
  const validateForm = () => {
    if (!formData.customer) {
      showNotification('Sélectionnez un client', 'error');
      return false;
    }
    if (!formData.warehouse) {
      showNotification('Sélectionnez un entrepôt', 'error');
      return false;
    }
    if (formData.items.length === 0) {
      showNotification('Ajoutez au moins un produit', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

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
        unit_price: item.unit_price
      }))
    };

    try {
      if (isEditMode) {
        await AxiosInstance.put(`/sales/${id}/`, payload);
        showNotification('Vente modifiée avec succès', 'success');
        setTimeout(() => navigate('/ventes'), 1500);
      } else {
        await AxiosInstance.post('/sales/', payload);
        showNotification('Vente créée avec succès', 'success');
        // Redirection immédiate vers la liste des ventes
        setTimeout(() => navigate('/ventes'), 1000);
      }
    } catch (err) {
      console.error(err);
      let errorMsg = 'Erreur lors de l\'enregistrement';
      if (err.response?.data) {
        if (typeof err.response.data === 'object')
          errorMsg = Object.values(err.response.data).flat().join(', ');
        else
          errorMsg = err.response.data;
      }
      showNotification(errorMsg, 'error');
      setSubmitting(false);
    }
  };

  // ========== FILTRAGE PRODUITS ==========
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Filtre par recherche
    if (productSearch) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.reference?.toLowerCase().includes(productSearch.toLowerCase())
      );
    }
    
    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category?.toString() === selectedCategory);
    }
    
    return filtered.slice(0, 30);
  }, [products, productSearch, selectedCategory]);

  // Récupérer le nom de la catégorie
  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id.toString() === categoryId);
    return cat?.name || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Notification */}
        {notification.show && (
          <div className="fixed top-20 right-6 z-50 animate-slide-in">
            <div className={`alert shadow-lg ${notification.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{notification.message}</span>
              <button onClick={() => setNotification(prev => ({ ...prev, show: false }))} className="btn btn-sm btn-ghost">✕</button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/ventes" className="btn btn-ghost gap-2">
            <ArrowLeft size={18} /> Retour
          </Link>
          <button onClick={fetchData} className="btn btn-outline btn-sm gap-2">
            <RefreshCw size={16} /> Actualiser
          </button>
        </div>

        {/* Titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg mb-4">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Modifier la vente' : 'Nouvelle vente'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEditMode ? 'Modifiez les informations' : 'Remplissez le formulaire ci-dessous'}
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-6">
            
            {/* Ligne 1: Client + Entrepôt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <User size={16} className="text-primary" /> Client <span className="text-error">*</span>
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.customer}
                  onChange={e => setFormData({ ...formData, customer: e.target.value })}
                >
                  <option value="">Sélectionner un client</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.full_name || c.company_name}
                    </option>
                  ))}
                </select>
                {customerInfo && (
                  <div className="mt-2 text-xs text-gray-500 flex gap-3">
                    {customerInfo.email && <span>✉️ {customerInfo.email}</span>}
                    {customerInfo.phone && <span>📞 {customerInfo.phone}</span>}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Building2 size={16} className="text-primary" /> Entrepôt <span className="text-error">*</span>
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.warehouse}
                  onChange={e => setFormData({ ...formData, warehouse: e.target.value, items: [] })}
                >
                  <option value="">Sélectionner un entrepôt</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
                {warehouseInfo && warehouseInfo.location && (
                  <div className="mt-2 text-xs text-gray-500">📍 {warehouseInfo.location}</div>
                )}
              </div>
            </div>

            {/* Ligne 2: Type prix + Date livraison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <TrendingUp size={16} className="text-primary" /> Type de prix
                  </span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price_type"
                      value="retail"
                      checked={formData.price_type === 'retail'}
                      onChange={() => handlePriceTypeChange('retail')}
                      className="radio radio-primary"
                    />
                    <Store size={16} /> Détail
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price_type"
                      value="wholesale"
                      checked={formData.price_type === 'wholesale'}
                      onChange={() => handlePriceTypeChange('wholesale')}
                      className="radio radio-primary"
                    />
                    <Truck size={16} /> Gros
                  </label>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Calendar size={16} className="text-primary" /> Livraison souhaitée
                  </span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={formData.delivery_date}
                  onChange={e => setFormData({ ...formData, delivery_date: e.target.value })}
                  min={formatDate(new Date())}
                />
              </div>
            </div>

            {/* Adresse livraison */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <MapPin size={16} className="text-primary" /> Adresse de livraison
                </span>
              </label>
              <textarea
                rows={2}
                className="textarea textarea-bordered"
                placeholder="Adresse complète"
                value={formData.shipping_address}
                onChange={e => setFormData({ ...formData, shipping_address: e.target.value })}
              />
            </div>

            {/* SECTION PRODUITS */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package size={20} className="text-primary" />
                  Produits
                  {formData.items.length > 0 && (
                    <span className="badge badge-primary badge-sm">{formData.items.length} article(s)</span>
                  )}
                </h2>
                {formData.warehouse && (
                  <button
                    onClick={() => setShowProductSelector(true)}
                    className="btn btn-primary btn-sm gap-2"
                  >
                    <Plus size={16} /> Ajouter un produit
                  </button>
                )}
              </div>

              {!formData.warehouse && (
                <div className="alert alert-warning shadow-lg mb-4">
                  <AlertCircle size={20} />
                  <span>Veuillez d'abord sélectionner un entrepôt</span>
                </div>
              )}

              {/* Tableau des produits */}
              {formData.items.length > 0 && (
                <div className="overflow-x-auto border rounded-xl">
                  <table className="table w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-sm text-gray-700">
                        <th className="py-3 px-4">Produit</th>
                        <th className="py-3 px-4 text-center">Quantité</th>
                        <th className="py-3 px-4 text-right">Prix unit.</th>
                        <th className="py-3 px-4 text-right">Total</th>
                        <th className="py-3 px-4 text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium">{item.product_name}</div>
                            <div className="text-xs text-gray-400">Réf: {item.product_reference}</div>
                           </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => updateQuantity(idx, item.quantity - 1)}
                                className="btn btn-ghost btn-xs"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <input
                                type="number"
                                step="1"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(idx, e.target.value)}
                                className="input input-bordered input-sm w-20 text-center"
                              />
                              <button
                                onClick={() => updateQuantity(idx, item.quantity + 1)}
                                className="btn btn-ghost btn-xs"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                           </td>
                          <td className="py-3 px-4 text-right">{formatMoney(item.unit_price)}</td>
                          <td className="py-3 px-4 text-right font-semibold">
                            {formatMoney(item.quantity * item.unit_price)}
                           </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => removeItem(idx)}
                              className="btn btn-ghost btn-sm text-error"
                            >
                              <Trash2 size={16} />
                            </button>
                           </td>
                         </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t">
                      <tr className="font-semibold">
                        <td colSpan="3" className="py-3 px-4 text-right">Sous-total :</td>
                        <td className="py-3 px-4 text-right">{formatMoney(subtotal)}</td>
                        <td></td>
                       </tr>
                    </tfoot>
                   </table>
                </div>
              )}
            </div>

            {/* Remise et frais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Percent size={16} className="text-primary" /> Remise globale
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    className="input input-bordered w-full pr-12"
                    value={formData.discount_rate}
                    onChange={e => setFormData({ ...formData, discount_rate: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Truck size={16} className="text-primary" /> Frais de livraison
                  </span>
                </label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  className="input input-bordered"
                  value={formData.shipping_cost}
                  onChange={e => setFormData({ ...formData, shipping_cost: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <FileText size={16} className="text-primary" /> Notes
                </span>
              </label>
              <textarea
                rows={2}
                className="textarea textarea-bordered"
                placeholder="Informations complémentaires..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-5">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-gray-600 font-medium">Total TTC</span>
                  {discount > 0 && (
                    <div className="text-xs text-warning mt-1">Remise {formData.discount_rate}%</div>
                  )}
                </div>
                <div className="text-2xl font-bold text-primary">{formatMoney(total)}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link to="/ventes" className="btn btn-ghost">Annuler</Link>
              <button
                onClick={handleSubmit}
                disabled={submitting || !formData.customer || !formData.warehouse || formData.items.length === 0}
                className="btn btn-primary gap-2 min-w-[150px]"
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Save size={18} />
                )}
                {submitting ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Créer la vente')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALE PRODUIT AVEC CATÉGORIES */}
      {showProductSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Ajouter un produit</h2>
              </div>
              <button
                onClick={() => {
                  setShowProductSelector(false);
                  setProductSearch('');
                  setSelectedCategory('');
                }}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="p-4 border-b space-y-3">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou référence..."
                  className="input input-bordered w-full pl-10"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Filtre par catégorie */}
              {categories.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600 mr-2">Catégorie :</span>
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`badge ${!selectedCategory ? 'badge-primary' : 'badge-outline'} cursor-pointer px-3 py-2 text-sm`}
                  >
                    Tous
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id.toString())}
                      className={`badge ${selectedCategory === cat.id.toString() ? 'badge-primary' : 'badge-outline'} cursor-pointer px-3 py-2 text-sm`}
                    >
                      <Layers size={12} className="mr-1" />
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Liste des produits */}
            <div className="overflow-y-auto max-h-[50vh] p-4">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Aucun produit trouvé</p>
                  {productSearch && (
                    <p className="text-sm mt-2">Essayez une autre recherche</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredProducts.map(product => {
                    const price = getProductPrice(product);
                    const isInCart = formData.items.some(i => i.product === product.id.toString());
                    return (
                      <div
                        key={product.id}
                        onClick={() => addProduct(product)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isInCart
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold flex items-center gap-2">
                              {product.name}
                              {isInCart && <span className="badge badge-primary badge-xs">Ajouté</span>}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Réf: {product.reference || '-'}
                              {product.category && (
                                <span className="ml-2 badge badge-ghost badge-xs">
                                  {getCategoryName(product.category)}
                                </span>
                              )}
                            </div>
                            <div className="text-lg font-bold text-primary mt-2">{formatMoney(price)}</div>
                          </div>
                          <button className="btn btn-primary btn-sm gap-1">
                            <Plus size={16} /> Ajouter
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 text-center text-sm text-gray-500">
              {warehouseInfo && (
                <span>🏢 Stock depuis : {warehouseInfo.name} • Cliquez sur un produit pour l'ajouter</span>
              )}
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