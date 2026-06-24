// src/components/inventory/TransfertForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Save,
  X,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Building2,
  Calendar,
  Truck,
  Package,
  Plus,
  Trash2,
  FileText,
  Warehouse,
  ArrowRight,
  Info,
  Search
} from 'lucide-react';

const TransfertForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [errors, setErrors] = useState({});

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');

  const [formData, setFormData] = useState({
    from_warehouse: '',
    to_warehouse: '',
    expected_date: '',
    waybill: '',
    notes: '',
    items: []
  });

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
    try {
      const [warehousesRes, productsRes] = await Promise.all([
        AxiosInstance.get('/warehouses/?is_active=true'),
        AxiosInstance.get('/products/')
      ]);

      setWarehouses(warehousesRes.data || []);
      setProducts(productsRes.data || []);
      setFilteredProducts(productsRes.data || []);

      if (isEditMode) {
        const transferRes = await AxiosInstance.get(`/transfers/${id}/`);
        const transfer = transferRes.data;
        setFormData({
          from_warehouse: transfer.from_warehouse?.id?.toString() || '',
          to_warehouse: transfer.to_warehouse?.id?.toString() || '',
          expected_date: transfer.expected_date || '',
          waybill: transfer.waybill || '',
          notes: transfer.notes || '',
          items: transfer.items?.map(item => ({
            product: item.product?.id?.toString() || '',
            product_name: item.product_name || '',
            product_reference: item.product_reference || '',
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
            total: (item.quantity || 0) * (item.unit_price || 0)
          })) || []
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (searchProduct) {
      setFilteredProducts(
        products.filter(p =>
          p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
          p.reference.toLowerCase().includes(searchProduct.toLowerCase())
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [searchProduct, products]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        product: '',
        product_name: '',
        product_reference: '',
        quantity: 1,
        unit_price: 0,
        total: 0
      }]
    });
    if (errors.items) setErrors(prev => ({ ...prev, items: null }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];

    if (field === 'product') {
      newItems[index].product = value;
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        newItems[index].product_name = product.name;
        newItems[index].product_reference = product.reference;
        newItems[index].unit_price = product.purchase_price || 0;
      }
    } else if (field === 'quantity') {
      newItems[index].quantity = parseInt(value) || 0;
    } else if (field === 'unit_price') {
      newItems[index].unit_price = parseFloat(value) || 0;
    }

    newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].unit_price || 0);
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.from_warehouse) newErrors.from_warehouse = 'Entrepôt source obligatoire';
    if (!formData.to_warehouse) newErrors.to_warehouse = 'Entrepôt destination obligatoire';
    if (formData.from_warehouse === formData.to_warehouse) {
      newErrors.to_warehouse = 'Les entrepôts doivent être différents';
    }
    if (formData.items.length === 0) {
      newErrors.items = 'Ajoutez au moins un article';
    } else {
      const hasEmptyProduct = formData.items.some(item => !item.product);
      if (hasEmptyProduct) newErrors.items = 'Tous les articles doivent avoir un produit';
      
      const hasInvalidQuantity = formData.items.some(item => item.quantity <= 0);
      if (hasInvalidQuantity) newErrors.items = 'Les quantités doivent être supérieures à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification('Veuillez corriger les erreurs', 'error');
      return;
    }

    setSubmitting(true);

    try {
      // ✅ Construction correcte des données pour l'API
      // Les champs doivent correspondre exactement à ce que le sérializer attend
      const itemsData = formData.items.map(item => ({
        product: parseInt(item.product),        // ✅ clé 'product' (pas 'product_id')
        quantity: parseInt(item.quantity) || 1, // ✅ clé 'quantity'
        unit_price: parseFloat(item.unit_price) || 0 // ✅ clé 'unit_price'
      }));

      const dataToSend = {
        from_warehouse: parseInt(formData.from_warehouse),
        to_warehouse: parseInt(formData.to_warehouse),
        expected_date: formData.expected_date || null,
        waybill: formData.waybill || '',
        notes: formData.notes || '',
        items: itemsData  // ✅ Le sérializer attend 'items' avec ces champs
      };

      console.log('📤 Données envoyées:', JSON.stringify(dataToSend, null, 2));

      let response;
      if (isEditMode) {
        response = await AxiosInstance.put(`/transfers/${id}/`, dataToSend);
        showNotification('Transfert modifié avec succès', 'success');
      } else {
        response = await AxiosInstance.post('/transfers/', dataToSend);
        showNotification('Transfert créé avec succès', 'success');
      }

      console.log('✅ Réponse:', response.data);

      setTimeout(() => navigate('/transferts'), 1500);

    } catch (error) {
      console.error('❌ Erreur détaillée:', error);
      
      let errorMsg = 'Erreur d\'enregistrement';
      
      if (error.response?.data) {
        console.error('📋 Données de réponse:', error.response.data);
        
        if (typeof error.response.data === 'object') {
          const errorMessages = [];
          Object.entries(error.response.data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              errorMessages.push(`${key}: ${value.join(', ')}`);
            } else if (typeof value === 'string') {
              errorMessages.push(`${key}: ${value}`);
            } else if (typeof value === 'object' && value !== null) {
              // Pour les erreurs imbriquées (comme items)
              Object.entries(value).forEach(([subKey, subValue]) => {
                if (Array.isArray(subValue)) {
                  errorMessages.push(`${key}.${subKey}: ${subValue.join(', ')}`);
                } else {
                  errorMessages.push(`${key}.${subKey}: ${subValue}`);
                }
              });
            }
          });
          errorMsg = errorMessages.join(' | ');
        } else {
          errorMsg = error.response.data;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      showNotification(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/transferts')} className="btn btn-ghost btn-sm btn-circle">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            {isEditMode ? 'Modifier le transfert' : 'Nouveau transfert'}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/transferts')} className="btn btn-outline">Annuler</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditMode ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Informations générales */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4 lg:p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" /> Informations du transfert
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">
                  <Warehouse className="w-4 h-4 inline mr-1" />
                  Entrepôt source <span className="text-error">*</span>
                </span>
              </label>
              <select
                name="from_warehouse"
                value={formData.from_warehouse}
                onChange={handleInputChange}
                className={`select select-bordered w-full ${errors.from_warehouse ? 'select-error' : ''}`}
              >
                <option value="">Sélectionner un entrepôt</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
              </select>
              {errors.from_warehouse && <span className="text-error text-sm mt-1">{errors.from_warehouse}</span>}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">
                  <Warehouse className="w-4 h-4 inline mr-1" />
                  Entrepôt destination <span className="text-error">*</span>
                </span>
              </label>
              <select
                name="to_warehouse"
                value={formData.to_warehouse}
                onChange={handleInputChange}
                className={`select select-bordered w-full ${errors.to_warehouse ? 'select-error' : ''}`}
              >
                <option value="">Sélectionner un entrepôt</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
              </select>
              {errors.to_warehouse && <span className="text-error text-sm mt-1">{errors.to_warehouse}</span>}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date prévue
                </span>
              </label>
              <input
                type="date"
                name="expected_date"
                value={formData.expected_date}
                onChange={handleInputChange}
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Numéro de bon de livraison
                </span>
              </label>
              <input
                type="text"
                name="waybill"
                value={formData.waybill}
                onChange={handleInputChange}
                placeholder="Optionnel"
                className="input input-bordered w-full"
              />
            </div>
          </div>

          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text font-medium">Notes</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Informations complémentaires..."
              className="textarea textarea-bordered w-full"
            />
          </div>
        </div>

        {/* Articles */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4 lg:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Articles à transférer
            </h2>
            <button type="button" onClick={addItem} className="btn btn-outline btn-sm gap-2">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>

          {errors.items && (
            <div className="alert alert-error mb-4">
              <AlertCircle className="w-5 h-5" />
              <span>{errors.items}</span>
            </div>
          )}

          {formData.items.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">
              <Package className="w-16 h-16 mx-auto mb-3 opacity-50" />
              Aucun article ajouté
            </div>
          ) : (
            <div className="space-y-3">
              {formData.items.map((item, idx) => (
                <div key={idx} className="bg-base-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                    <div className="lg:col-span-5">
                      <label className="text-sm text-base-content/60 mb-1 block">Produit</label>
                      <select
                        value={item.product}
                        onChange={(e) => updateItem(idx, 'product', e.target.value)}
                        className="select select-bordered w-full"
                      >
                        <option value="">Sélectionner un produit</option>
                        {filteredProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.reference})</option>
                        ))}
                      </select>
                    </div>
                    <div className="lg:col-span-2">
                      <label className="text-sm text-base-content/60 mb-1 block">Quantité</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                        min="1"
                        className="input input-bordered w-full"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="text-sm text-base-content/60 mb-1 block">Prix unitaire</label>
                      <div className="input input-bordered flex items-center gap-1">
                        <span className="text-base-content/60">FCFA</span>
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                          step="1"
                          className="grow"
                        />
                      </div>
                    </div>
                    <div className="lg:col-span-2">
                      <label className="text-sm text-base-content/60 mb-1 block">Total</label>
                      <div className="h-12 flex items-center font-semibold text-lg">
                        {formatCurrency(item.total || 0)}
                      </div>
                    </div>
                    <div className="lg:col-span-1 flex justify-end">
                      <button type="button" onClick={() => removeItem(idx)} className="btn btn-ghost text-error">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          {formData.items.length > 0 && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Valeur totale du transfert</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(formData.items.reduce((sum, item) => sum + (item.total || 0), 0))}
                </span>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Barre mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t p-3 shadow-lg z-40">
        <div className="flex gap-2">
          <button onClick={() => navigate('/transferts')} className="btn btn-outline flex-1">Annuler</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary flex-1">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditMode ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransfertForm;