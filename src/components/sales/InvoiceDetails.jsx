// src/components/sales/InvoiceDetails.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import InvoicePDF from './InvoicePDF' // Import du générateur PDF (jsPDF)
import {
  ArrowLeft,
  Download,
  Send,
  Trash2,
  Users,
  Receipt,
  DollarSign,
  AlertCircle,
  CheckCircle,
  FileText,
  Calendar,
  CreditCard
} from 'lucide-react'

const InvoiceDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'neutral', icon: FileText },
    sent: { label: 'Envoyée', color: 'info', icon: Send },
    paid: { label: 'Payée', color: 'success', icon: CheckCircle },
    partially_paid: { label: 'Partiellement payée', color: 'warning', icon: DollarSign },
    overdue: { label: 'En retard', color: 'error', icon: AlertCircle },
    cancelled: { label: 'Annulée', color: 'error', icon: AlertCircle }
  }

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(number)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get(`/invoices/${id}/`)
      setInvoice(response.data)
    } catch (error) {
      console.error('Error fetching invoice:', error)
      showNotification('Erreur lors du chargement de la facture', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

  const handleSendInvoice = async () => {
    try {
      await AxiosInstance.post(`/invoices/${id}/send/`)
      showNotification('Facture envoyée avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification("Erreur lors de l'envoi", 'error')
    }
  }

  const handleDeleteInvoice = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return
    try {
      await AxiosInstance.delete(`/invoices/${id}/`)
      showNotification('Facture supprimée avec succès', 'success')
      setTimeout(() => navigate('/factures'), 1500)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  const handleDownloadPDF = async () => {
    if (!invoice) return
    setDownloading(true)
    try {
      await InvoicePDF(invoice)
      showNotification('PDF généré avec succès', 'success')
    } catch (error) {
      console.error('Erreur génération PDF:', error)
      showNotification('Erreur lors de la génération du PDF', 'error')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12"></div>
          <p className="text-base font-semibold text-base-content/70">Chargement de la facture...</p>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-base-200 py-6 px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Facture non trouvée</h2>
          <Link to="/factures" className="btn btn-primary gap-2">Retour à la liste</Link>
        </div>
      </div>
    )
  }

  const status = statusConfig[invoice.status] || statusConfig.draft
  const StatusIcon = status.icon
  const customerName = invoice.customer_name || invoice.sale?.customer_name || 'Client'
  const items = invoice.sale?.items || invoice.items || []
  const paidPercent = invoice.total > 0 ? (invoice.paid_amount / invoice.total) * 100 : 0

  return (
    <div className="min-h-screen bg-base-200 py-4 sm:py-6 px-3 sm:px-4">
      <div className="w-full max-w-6xl mx-auto">
        
        {/* Notification */}
        {notification.show && (
          <div className="fixed top-16 right-3 z-50 animate-slide-in">
            <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm`}>
              {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{notification.message}</span>
              <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
            </div>
          </div>
        )}

        {/* Bouton retour et actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <Link to="/factures" className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour aux factures
          </Link>
          <div className="flex gap-2">
            <button 
              onClick={handleDownloadPDF} 
              disabled={downloading}
              className="btn btn-sm btn-primary gap-1"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Génération...' : 'PDF'}
            </button>
            {invoice.status === 'draft' && (
              <>
                <button onClick={handleSendInvoice} className="btn btn-sm btn-info gap-1 text-white"><Send className="w-4 h-4" /> Envoyer</button>
                <button onClick={handleDeleteInvoice} className="btn btn-sm btn-error gap-1"><Trash2 className="w-4 h-4" /> Supprimer</button>
              </>
            )}
          </div>
        </div>

        {/* En-tête */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Receipt className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white">Facture {invoice.invoice_number}</h1>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className={`badge badge-${status.color} badge-sm gap-1`}>
                      <StatusIcon className="w-3 h-3" /> {status.label}
                    </span>
                    <span className="badge badge-neutral badge-sm gap-1">
                      <Calendar className="w-3 h-3" /> Échéance: {formatDate(invoice.due_date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grille des informations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          
          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Informations générales
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-base-100">
                <span className="text-base-content/50">N° Facture</span>
                <span className="font-semibold">{invoice.invoice_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-base-100">
                <span className="text-base-content/50">Date facture</span>
                <span>{formatDate(invoice.invoice_date)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-base-100">
                <span className="text-base-content/50">Date d'échéance</span>
                <span>{formatDate(invoice.due_date)}</span>
              </div>
            </div>
          </div>

          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Client
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{customerName}</p>
                {invoice.customer_email && <p className="text-sm text-base-content/60">{invoice.customer_email}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Récapitulatif financier */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 mb-6 overflow-hidden">
          <div className="p-4 border-b border-base-200">
            <h3 className="text-md font-semibold text-primary flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Récapitulatif financier
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-base-200">
            <div className="p-4 text-center">
              <p className="text-xs text-base-content/50">Sous-total</p>
              <p className="text-2xl font-bold text-base-content">{formatNumber(invoice.subtotal)} FCFA</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-base-content/50">TVA (20%)</p>
              <p className="text-2xl font-bold text-primary">{formatNumber(invoice.tax_total)} FCFA</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-base-content/50">Total TTC</p>
              <p className="text-2xl font-bold text-success">{formatNumber(invoice.total)} FCFA</p>
            </div>
          </div>
        </div>

        {/* État du paiement */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 mb-6 overflow-hidden">
          <div className="p-4 border-b border-base-200">
            <h3 className="text-md font-semibold text-primary flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> État du paiement
            </h3>
          </div>
          <div className="p-4">
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm">Progression du paiement</span>
                <span className="text-sm font-semibold">{Math.round(paidPercent)}%</span>
              </div>
              <progress className="progress progress-primary w-full" value={paidPercent} max="100"></progress>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-success/10 rounded-lg">
                <p className="text-xs">Payé</p>
                <p className="text-lg font-bold text-success">{formatNumber(invoice.paid_amount)} FCFA</p>
              </div>
              <div className="p-2 bg-warning/10 rounded-lg">
                <p className="text-xs">Reste à payer</p>
                <p className="text-lg font-bold text-warning">{formatNumber(invoice.remaining_amount)} FCFA</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <p className="text-xs">Total</p>
                <p className="text-lg font-bold text-primary">{formatNumber(invoice.total)} FCFA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 mb-6 overflow-hidden">
          <div className="p-4 border-b border-base-200">
            <h3 className="text-md font-semibold text-primary flex items-center gap-2">
              <FileText className="w-5 h-5" /> Articles facturés
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead className="bg-base-200">
                <tr className="text-xs">
                  <th>Produit</th>
                  <th className="text-center">Qté</th>
                  <th className="text-right">Prix unitaire</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">Aucun article</td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx} className="hover">
                      <td>
                        <div className="font-medium text-sm">{item.product_name}</div>
                        <div className="text-xs text-base-content/50">{item.product_reference}</div>
                      </td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">{formatNumber(item.unit_price)} FCFA</td>
                      <td className="text-right font-semibold">{formatNumber(item.total)} FCFA</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 mb-6 p-4">
            <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Notes
            </h3>
            <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-wrap justify-end gap-3 mt-4">
          <Link to="/factures" className="btn btn-outline">Retour</Link>
          <button 
            onClick={handleDownloadPDF} 
            disabled={downloading}
            className="btn btn-primary gap-2"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Génération en cours...' : 'Télécharger PDF'}
          </button>
          {invoice.status === 'sent' && (
            <Link to={`/paiements/nouveau?invoice=${invoice.id}`} className="btn btn-success gap-2">
              <CreditCard className="w-4 h-4" /> Paiement
            </Link>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
        @media print {
          .btn, .btn-sm, .fixed, .modal, nav, header, .no-print { display: none !important; }
          body { background: white; padding: 20px; margin: 0; }
        }
      `}</style>
    </div>
  )
}

export default InvoiceDetails