// src/components/purchases/PurchaseReceiptDetails.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import { generateReceiptPDF } from './PurchaseReceiptPDF'
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
  ClipboardCheck,
  Hash,
  User,
  Edit,
  Download,
  RefreshCw,
  Truck,
  Mail,
  Phone,
  MapPin,
  Award,
  X,
  Loader2
} from 'lucide-react'

const PurchaseReceiptDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'badge-ghost' },
    sent: { label: 'Envoyée', color: 'badge-info' },
    confirmed: { label: 'Confirmée', color: 'badge-primary' },
    in_transit: { label: 'En transit', color: 'badge-warning' },
    partially_received: { label: 'Partiellement reçue', color: 'badge-warning' },
    received: { label: 'Reçue', color: 'badge-success' },
    cancelled: { label: 'Annulée', color: 'badge-error' },
    rejected: { label: 'Rejetée', color: 'badge-error' }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR').format(number)
  }

  const formatCurrency = (amount) => {
    return `${formatNumber(amount)} €`
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get(`/purchase-receipts/${id}/`)
      setReceipt(response.data)
    } catch (error) {
      console.error('Erreur:', error)
      showNotification('Erreur de chargement de la réception', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  // Fonction pour télécharger le PDF
  const handleDownloadPDF = async () => {
    if (!receipt) return
    setGeneratingPDF(true)
    try {
      await generateReceiptPDF(receipt)
      showNotification('PDF téléchargé avec succès', 'success')
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      showNotification('Erreur lors de la génération du PDF', 'error')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const getQualityBadge = (item) => {
    if (!item.quality_checked) {
      return { label: 'Non contrôlé', color: 'badge-ghost', icon: AlertCircle }
    }
    if (item.quality_ok) {
      return { label: 'Conforme', color: 'badge-success', icon: CheckCircle }
    }
    return { label: 'Non conforme', color: 'badge-error', icon: AlertTriangle }
  }

  const getConformingCount = () => {
    if (!receipt?.items) return 0
    return receipt.items.filter(item => item.quality_ok).length
  }

  const getNonConformingCount = () => {
    if (!receipt?.items) return 0
    return receipt.items.filter(item => item.quality_checked && !item.quality_ok).length
  }

  const getTotalQuantity = () => {
    if (!receipt?.items) return 0
    return receipt.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-error" />
          <h2 className="text-xl font-bold mb-2">Réception non trouvée</h2>
          <button onClick={() => navigate('/receptions')} className="btn btn-primary">
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  const orderStatus = statusConfig[receipt.purchase_order?.status] || statusConfig.draft
  const conformingCount = getConformingCount()
  const nonConformingCount = getNonConformingCount()
  const totalQuantity = getTotalQuantity()

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
          <button onClick={() => navigate('/receptions')} className="btn btn-ghost btn-sm btn-circle">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
              <Receipt className="w-6 h-6 text-primary" />
              Réception {receipt.receipt_number}
            </h1>
            <p className="text-sm text-base-content/60 mt-1">
              Détails de la réception de marchandises
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn btn-outline btn-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          {receipt.status !== 'received' && (
            <button onClick={() => navigate(`/receptions/${id}/modifier`)} className="btn btn-outline btn-sm">
              <Edit className="w-4 h-4" /> Modifier
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
          <div className="stat-figure text-primary">
            <Receipt className="w-5 h-5" />
          </div>
          <div className="stat-title text-xs">Numéro</div>
          <div className="stat-value text-base">{receipt.receipt_number}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-info p-3">
          <div className="stat-figure text-info">
            <Package className="w-5 h-5" />
          </div>
          <div className="stat-title text-xs">Articles</div>
          <div className="stat-value text-base">{receipt.items?.length || 0}</div>
          <div className="stat-desc text-xs">{totalQuantity} unités</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-success p-3">
          <div className="stat-figure text-success">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="stat-title text-xs">Conformes</div>
          <div className="stat-value text-base">{conformingCount}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-error p-3">
          <div className="stat-figure text-error">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="stat-title text-xs">Non conformes</div>
          <div className="stat-value text-base">{nonConformingCount}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow-sm border-l-4 border-warning p-3 col-span-2 lg:col-span-1">
          <div className="stat-figure text-warning">
            <Award className="w-5 h-5" />
          </div>
          <div className="stat-title text-xs">Statut commande</div>
          <div className="stat-value text-sm">
            <span className={`badge ${orderStatus.color}`}>{orderStatus.label}</span>
          </div>
        </div>
      </div>

      {/* Informations générales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Commande associée */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Commande associée
          </h2>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base-content/60">Numéro de commande:</span>
              <button 
                onClick={() => navigate(`/commandes-fournisseurs/${receipt.purchase_order?.id}`)}
                className="font-medium text-primary hover:underline"
              >
                {receipt.purchase_order?.order_number || '-'}
              </button>
            </div>
            
            <div className="flex justify-between">
              <span className="text-base-content/60">Fournisseur:</span>
              <span className="font-medium">{receipt.purchase_order?.supplier_name || '-'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-base-content/60">Date commande:</span>
              <span>{formatDate(receipt.purchase_order?.order_date)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-base-content/60">Livraison prévue:</span>
              <span>{formatDate(receipt.purchase_order?.expected_date)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-base-content/60">Statut:</span>
              <span className={`badge ${orderStatus.color}`}>{orderStatus.label}</span>
            </div>
          </div>
        </div>

        {/* Informations de réception */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-success" />
            Informations de réception
          </h2>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base-content/60">Date de réception:</span>
              <span className="font-medium">{formatDateTime(receipt.receipt_date)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-base-content/60">Reçu par:</span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4 text-base-content/50" />
                {receipt.received_by_name || receipt.received_by?.email || '-'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-base-content/60">Créé le:</span>
              <span>{formatDateTime(receipt.created_at)}</span>
            </div>
            
            {receipt.updated_at && (
              <div className="flex justify-between">
                <span className="text-base-content/60">Modifié le:</span>
                <span>{formatDateTime(receipt.updated_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Articles reçus */}
      <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
        <div className="p-4 border-b border-base-300 bg-base-200/50">
          <h2 className="font-bold text-base flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Articles reçus
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr className="bg-base-200">
                <th>Produit</th>
                <th className="text-center">Quantité</th>
                <th className="text-center">Qualité</th>
                <th>Lot</th>
                <th>Expiration</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-base-content/50">
                    Aucun article dans cette réception
                  </td>
                </tr>
              ) : (
                receipt.items?.map((item, idx) => {
                  const quality = getQualityBadge(item)
                  const QualityIcon = quality.icon
                  
                  return (
                    <tr key={idx}>
                      <td>
                        <div className="font-medium">
                          {item.order_item?.product_name || item.product_name || '-'}
                        </div>
                        <div className="text-xs text-base-content/60">
                          {item.order_item?.product_reference || item.product_reference || '-'}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge badge-outline">{item.quantity}</span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${quality.color} gap-1`}>
                          <QualityIcon className="w-3 h-3" />
                          {quality.label}
                        </span>
                      </td>
                      <td>{item.lot_number || '-'}</td>
                      <td>{item.expiry_date ? formatDate(item.expiry_date) : '-'}</td>
                      <td className="max-w-xs">
                        {item.notes && (
                          <span className="text-sm text-base-content/70 truncate block" title={item.notes}>
                            {item.notes}
                          </span>
                        )}
                        {!item.notes && '-'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes qualité */}
      {receipt.items?.some(item => item.quality_notes) && (
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
          <div className="p-4 border-b border-base-300 bg-warning/10">
            <h2 className="font-bold text-base flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              Notes de contrôle qualité
            </h2>
          </div>
          
          <div className="p-4 space-y-3">
            {receipt.items.map((item, idx) => (
              item.quality_notes && (
                <div key={idx} className="border-l-4 border-warning pl-4 py-2">
                  <div className="font-medium">{item.order_item?.product_name || item.product_name}</div>
                  <div className="text-sm text-base-content/70 mt-1">{item.quality_notes}</div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Notes générales */}
      {receipt.notes && (
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
          <div className="p-4 border-b border-base-300 bg-base-200/50">
            <h2 className="font-bold text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Notes générales
            </h2>
          </div>
          
          <div className="p-4">
            <p className="text-sm whitespace-pre-wrap">{receipt.notes}</p>
          </div>
        </div>
      )}

      {/* Informations fournisseur */}
      {receipt.purchase_order?.supplier && (
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
          <div className="p-4 border-b border-base-300 bg-base-200/50">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Coordonnées fournisseur
            </h2>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {receipt.purchase_order?.supplier?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-base-content/50" />
                  <span>{receipt.purchase_order.supplier.phone}</span>
                </div>
              )}
              {receipt.purchase_order?.supplier?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-base-content/50" />
                  <a href={`mailto:${receipt.purchase_order.supplier.email}`} className="link link-primary">
                    {receipt.purchase_order.supplier.email}
                  </a>
                </div>
              )}
              {receipt.purchase_order?.supplier?.address && (
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin className="w-4 h-4 text-base-content/50" />
                  <span>
                    {receipt.purchase_order.supplier.address}, {receipt.purchase_order.supplier.city} {receipt.purchase_order.supplier.country}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PurchaseReceiptDetails