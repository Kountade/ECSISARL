// src/components/sales/SaleForm.jsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Save, Trash2, Plus, ArrowLeft, Package, AlertCircle, CheckCircle, Search,
  Store, Truck, X, User, Building2, Calendar, MapPin, FileText, RefreshCw,
  ShoppingCart, TrendingUp, Minus, Filter, Layers, Percent  // ← AJOUT DE Percent
} from 'lucide-react';

// ------------------------------------------------------------
// 1. FONCTION UTILITAIRE
// ------------------------------------------------------------
function formatMoney(amount) {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

// ------------------------------------------------------------
// 2. NOTIFICATION
// ------------------------------------------------------------
const Notification = ({ show, message, type, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed top-20 right-6 z-50 animate-slide-in">
      <div className={`alert shadow-lg ${type === 'success' ? 'alert-success' : 'alert-error'}`}>
        {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span>{message}</span>
        <button onClick={onClose} className="btn btn-sm btn-ghost">✕</button>
      </div>
    </div>
  );
};

// ------------------------------------------------------------
// 3. MODALE PRODUIT (version pro avec bouton fermeture explicite)
// ------------------------------------------------------------
const ProductSelectorModal = ({ isOpen, onClose, products, categories, warehouseInfo, formData, getProductPrice, onAddProduct }) => {
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const modalRef = useRef();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (productSearch) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.reference?.toLowerCase().includes(productSearch.toLowerCase())
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category?.toString() === selectedCategory);
    }
    return filtered.slice(0, 30);
  }, [products, productSearch, selectedCategory]);

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id.toString() === categoryId);
    return cat?.name || '';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/40 transition-all duration-300"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all duration-300 animate-fadeInUp" ref={modalRef}>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Ajouter un produit</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="relative mb-5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="input input-bordered w-full pl-10 pr-4 py-3 rounded-xl border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all"
              placeholder="Rechercher par nom, référence..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              autoFocus
            />
          </div>
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600 mr-1">Catégories :</span>
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  !selectedCategory ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id.toString())}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                    selectedCategory === cat.id.toString()
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Layers size={14} />
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-y-auto max-h-[55vh] p-6 bg-white">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
              <p className="text-sm text-gray-400 mt-1">Essayez de modifier votre recherche</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => {
                const price = getProductPrice(product);
                const isInCart = formData.items.some(i => i.product === product.id.toString());
                return (
                  <div
                    key={product.id}
                    onClick={() => onAddProduct(product)}
                    className={`group relative bg-white rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden hover:shadow-lg ${
                      isInCart ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-100 hover:border-indigo-200 hover:shadow-md'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                            {product.name}
                          </h3>
                          <div className="text-xs text-gray-400 mt-1">Réf: {product.reference || '---'}</div>
                          {product.category && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {getCategoryName(product.category)}
                              </span>
                            </div>
                          )}
                        </div>
                        {isInCart && <span className="badge badge-success badge-sm text-white border-0">Ajouté</span>}
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-xl font-bold text-indigo-600">{formatMoney(price)}</span>
                        <button className="btn btn-sm btn-primary gap-1 rounded-full shadow-sm">
                          <Plus size={16} /> Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pied de page avec bouton Fermer explicite */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-500">🏢 {warehouseInfo?.name || 'Entrepôt non sélectionné'}</span>
          <button
            onClick={onClose}
            className="btn btn-sm btn-outline gap-2"
          >
            <X size={16} /> Fermer
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.2s ease-out; }
      `}</style>
    </div>
  );
};

// ------------------------------------------------------------
// 4. TABLEAU DES PRODUITS
// ------------------------------------------------------------
const ProductTable = ({ items, onUpdateQuantity, onRemoveItem }) => {
  if (items.length === 0) return null;
  return (
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
          {items.map((item, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="font-medium">{item.product_name}</div>
                <div className="text-xs text-gray-400">Réf: {item.product_reference}</div>
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => onUpdateQuantity(idx, item.quantity - 1)} className="btn btn-ghost btn-xs" disabled={item.quantity <= 1}>
                    <Minus size={14} />
                  </button>
                  <input type="number" step="1" min="1" value={item.quantity} onChange={(e) => onUpdateQuantity(idx, e.target.value)} className="input input-bordered input-sm w-20 text-center" />
                  <button onClick={() => onUpdateQuantity(idx, item.quantity + 1)} className="btn btn-ghost btn-xs">
                    <Plus size={14} />
                  </button>
                </div>
              </td>
              <td className="py-3 px-4 text-right">{formatMoney(item.unit_price)}</td>
              <td className="py-3 px-4 text-right font-semibold">{formatMoney(item.quantity * item.unit_price)}</td>
              <td className="py-3 px-4 text-center">
                <button onClick={() => onRemoveItem(idx)} className="btn btn-ghost btn-sm text-error">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 border-t">
          <tr className="font-semibold">
            <td colSpan="3" className="py-3 px-4 text-right">Sous-total :</td>
            <td className="py-3 px-4 text-right">{formatMoney(items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0))}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

// ------------------------------------------------------------
// 5. CARTE DES TOTAUX
// ------------------------------------------------------------
const TotalsCard = ({ subtotal, discount, total, discountRate }) => (
  <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-5">
    <div className="flex justify-between items-center">
      <div>
        <span className="text-gray-600 font-medium">Total TTC</span>
        {discount > 0 && <div className="text-xs text-warning mt-1">Remise {discountRate}%</div>}
      </div>
      <div className="text-2xl font-bold text-primary">{formatMoney(total)}</div>
    </div>
  </div>
);

// ------------------------------------------------------------
// 6. COMPOSANT PRINCIPAL
// ------------------------------------------------------------
const SaleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    customer: '', price_type: 'retail', warehouse: '', discount_rate: 0, shipping_cost: 0,
    delivery_date: '', shipping_address: '', notes: '', items: []
  });

  const [showProductSelector, setShowProductSelector] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [warehouseInfo, setWarehouseInfo] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
  };

  const getProductPrice = useCallback((product) => {
    if (!product) return 0;
    if (formData.price_type === 'wholesale') {
      return parseFloat(product.wholesale_price) || parseFloat(product.sale_price) || 0;
    }
    return parseFloat(product.sale_price) || 0;
  }, [formData.price_type]);

  const checkStock = useCallback(async (productId, quantity = 1) => {
    if (!productId || !formData.warehouse) return 0;
    try {
      const response = await AxiosInstance.get(`/products/${productId}/check_availability/`, {
        params: { warehouse_id: formData.warehouse, quantity }
      });
      return response.data.available_quantity || 0;
    } catch { return 0; }
  }, [formData.warehouse]);

  const calculateTotals = useCallback(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const discount = subtotal * (formData.discount_rate / 100);
    const total = subtotal - discount + (formData.shipping_cost || 0);
    return { subtotal, discount, total };
  }, [formData.items, formData.discount_rate, formData.shipping_cost]);

  const { subtotal, discount, total } = calculateTotals();

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
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  useEffect(() => {
    setCustomerInfo(customers.find(c => c.id.toString() === formData.customer));
  }, [formData.customer, customers]);

  useEffect(() => {
    setWarehouseInfo(warehouses.find(w => w.id.toString() === formData.warehouse));
  }, [formData.warehouse, warehouses]);

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
    const stock = await checkStock(item.product, qty);
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

  const validateForm = () => {
    if (!formData.customer) { showNotification('Sélectionnez un client', 'error'); return false; }
    if (!formData.warehouse) { showNotification('Sélectionnez un entrepôt', 'error'); return false; }
    if (formData.items.length === 0) { showNotification('Ajoutez au moins un produit', 'error'); return false; }
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
      items: formData.items.map(item => ({ product: parseInt(item.product), quantity: item.quantity, unit_price: item.unit_price }))
    };
    try {
      if (isEditMode) {
        await AxiosInstance.put(`/sales/${id}/`, payload);
        showNotification('Vente modifiée avec succès', 'success');
        setTimeout(() => navigate('/ventes'), 1500);
      } else {
        await AxiosInstance.post('/sales/', payload);
        showNotification('Vente créée avec succès', 'success');
        setTimeout(() => navigate('/ventes'), 1000);
      }
    } catch (err) {
      console.error(err);
      let errorMsg = 'Erreur lors de l\'enregistrement';
      if (err.response?.data) {
        if (typeof err.response.data === 'object') errorMsg = Object.values(err.response.data).flat().join(', ');
        else errorMsg = err.response.data;
      }
      showNotification(errorMsg, 'error');
      setSubmitting(false);
    }
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
        <Notification show={notification.show} message={notification.message} type={notification.type} onClose={() => setNotification(prev => ({ ...prev, show: false }))} />

        <div className="flex justify-between items-center mb-6">
          <Link to="/ventes" className="btn btn-ghost gap-2"><ArrowLeft size={18} /> Retour</Link>
          <button onClick={fetchData} className="btn btn-outline btn-sm gap-2"><RefreshCw size={16} /> Actualiser</button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg mb-4"><ShoppingCart className="w-8 h-8 text-white" /></div>
          <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Modifier la vente' : 'Nouvelle vente'}</h1>
          <p className="text-gray-500 text-sm mt-1">{isEditMode ? 'Modifiez les informations' : 'Remplissez le formulaire ci-dessous'}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold flex items-center gap-2"><User size={16} className="text-primary" /> Client <span className="text-error">*</span></span></label>
                <select className="select select-bordered w-full" value={formData.customer} onChange={e => setFormData({ ...formData, customer: e.target.value })}>
                  <option value="">Sélectionner un client</option>
                  {customers.map(c => (<option key={c.id} value={c.id}>{c.code} - {c.full_name || c.company_name}</option>))}
                </select>
                {customerInfo && (<div className="mt-2 text-xs text-gray-500 flex gap-3">{customerInfo.email && <span>✉️ {customerInfo.email}</span>}{customerInfo.phone && <span>📞 {customerInfo.phone}</span>}</div>)}
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold flex items-center gap-2"><Building2 size={16} className="text-primary" /> Entrepôt <span className="text-error">*</span></span></label>
                <select className="select select-bordered w-full" value={formData.warehouse} onChange={e => setFormData({ ...formData, warehouse: e.target.value, items: [] })}>
                  <option value="">Sélectionner un entrepôt</option>
                  {warehouses.map(w => (<option key={w.id} value={w.id}>{w.name}</option>))}
                </select>
                {warehouseInfo?.location && (<div className="mt-2 text-xs text-gray-500">📍 {warehouseInfo.location}</div>)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold flex items-center gap-2"><TrendingUp size={16} className="text-primary" /> Type de prix</span></label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="price_type" value="retail" checked={formData.price_type === 'retail'} onChange={() => handlePriceTypeChange('retail')} className="radio radio-primary" /><Store size={16} /> Détail</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="price_type" value="wholesale" checked={formData.price_type === 'wholesale'} onChange={() => handlePriceTypeChange('wholesale')} className="radio radio-primary" /><Truck size={16} /> Gros</label>
                </div>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold flex items-center gap-2"><Calendar size={16} className="text-primary" /> Livraison souhaitée</span></label>
                <input type="date" className="input input-bordered" value={formData.delivery_date} onChange={e => setFormData({ ...formData, delivery_date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold flex items-center gap-2"><MapPin size={16} className="text-primary" /> Adresse de livraison</span></label>
              <textarea rows={2} className="textarea textarea-bordered" placeholder="Adresse complète" value={formData.shipping_address} onChange={e => setFormData({ ...formData, shipping_address: e.target.value })} />
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Package size={20} className="text-primary" /> Produits {formData.items.length > 0 && <span className="badge badge-primary badge-sm">{formData.items.length} article(s)</span>}</h2>
                {formData.warehouse && (<button onClick={() => setShowProductSelector(true)} className="btn btn-primary btn-sm gap-2"><Plus size={16} /> Ajouter un produit</button>)}
              </div>
              {!formData.warehouse && (<div className="alert alert-warning shadow-lg mb-4"><AlertCircle size={20} /><span>Veuillez d'abord sélectionner un entrepôt</span></div>)}
              <ProductTable items={formData.items} onUpdateQuantity={updateQuantity} onRemoveItem={removeItem} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold flex items-center gap-2"><Percent size={16} className="text-primary" /> Remise globale</span></label>
                  <div className="relative"><input type="number" step="1" min="0" max="100" className="input input-bordered w-full pr-12" value={formData.discount_rate} onChange={e => setFormData({ ...formData, discount_rate: parseFloat(e.target.value) || 0 })} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span></div>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold flex items-center gap-2"><Truck size={16} className="text-primary" /> Frais de livraison</span></label>
                  <input type="number" step="100" min="0" className="input input-bordered" value={formData.shipping_cost} onChange={e => setFormData({ ...formData, shipping_cost: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-semibold flex items-center gap-2"><FileText size={16} className="text-primary" /> Notes</span></label>
                <textarea rows={2} className="textarea textarea-bordered" placeholder="Informations complémentaires..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>

              <TotalsCard subtotal={subtotal} discount={discount} total={total} discountRate={formData.discount_rate} />

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link to="/ventes" className="btn btn-ghost">Annuler</Link>
                <button onClick={handleSubmit} disabled={submitting || !formData.customer || !formData.warehouse || formData.items.length === 0} className="btn btn-primary gap-2 min-w-[150px]">
                  {submitting ? <span className="loading loading-spinner loading-sm"></span> : <Save size={18} />}
                  {submitting ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Créer la vente')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductSelectorModal
        isOpen={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        products={products}
        categories={categories}
        warehouseInfo={warehouseInfo}
        formData={formData}
        getProductPrice={getProductPrice}
        onAddProduct={addProduct}
      />

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default SaleForm;