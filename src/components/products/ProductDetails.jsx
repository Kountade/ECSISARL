import React, { useEffect, useState } from 'react'
import { Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar, CircularProgress, Snackbar, Alert, Divider, alpha, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ImageList, ImageListItem, Stack, Tooltip } from '@mui/material'
import { Edit as EditIcon, ArrowBack as ArrowBackIcon, Inventory as InventoryIcon, AttachMoney as MoneyIcon, Warning as WarningIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Info as InfoIcon } from '@mui/icons-material'
import AxiosInstance from '../AxiosInstance'
import { useNavigate, useParams } from 'react-router-dom'

const COMPANY_COLORS = { darkCyan: '#0A2647', vividOrange: '#C9A03D', lightCyan: '#E9F1FA', lightOrange: '#FDF6E3', white: '#FFFFFF' }

const ProductDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [product, setProduct] = useState(null)
  const [images, setImages] = useState([])
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const productTypes = { simple: 'Simple', variable: 'Variable', service: 'Service', digital: 'Numérique' }

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [prodRes, imgRes, varRes] = await Promise.all([
        AxiosInstance.get(`/products/${id}/`),
        AxiosInstance.get(`/products/${id}/images/`).catch(() => ({ data: [] })),
        AxiosInstance.get(`/products/${id}/variants/`).catch(() => ({ data: [] }))
      ])
      setProduct(prodRes.data)
      setImages(imgRes.data || [])
      setVariants(varRes.data || [])
    } catch (error) {
      console.error(error)
      setSnackbar({ open: true, message: 'Erreur de chargement', severity: 'error' })
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [id])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress size={60} sx={{ color: COMPANY_COLORS.darkCyan }} /></Box>
  if (!product) return null

  const mainImage = product.main_image || (images.length > 0 ? images.find(img => img.is_main)?.image : null)

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/produits')} sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.1), color: COMPANY_COLORS.darkCyan }}><ArrowBackIcon /></IconButton>
          <Typography variant="h4" fontWeight="bold" sx={{ color: COMPANY_COLORS.darkCyan }}>{product.name}</Typography>
          <Chip label={product.reference} variant="outlined" />
          <Chip label={productTypes[product.product_type] || 'Simple'} color="primary" size="small" />
          {!product.is_active && <Chip label="Inactif" color="error" size="small" />}
        </Box>
        <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/produits/${id}/modifier`)} sx={{ background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, ${COMPANY_COLORS.vividOrange} 100%)` }}>Modifier</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}><CardContent>
            {mainImage ? <Box component="img" src={mainImage} alt={product.name} sx={{ width: '100%', borderRadius: 2, mb: 2 }} /> : <Box sx={{ width: '100%', height: 250, bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.05), borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}><InventoryIcon sx={{ fontSize: 80, color: COMPANY_COLORS.darkCyan }} /></Box>}
            <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{product.description}</Typography>
          </CardContent></Card>
          {images.length > 0 && <Card sx={{ borderRadius: 3, boxShadow: 2, mt: 2 }}><CardContent><Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan }}>Galerie</Typography><ImageList cols={3} gap={8}>{images.map(img => <ImageListItem key={img.id}><img src={img.image} alt={img.alt_text} loading="lazy" style={{ borderRadius: 8, height: 100, objectFit: 'cover' }} /></ImageListItem>)}</ImageList></CardContent></Card>}
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><Card sx={{ borderRadius: 3, boxShadow: 2 }}><CardContent><Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}><InfoIcon /> Détails</Typography><Divider sx={{ mb: 2 }} /><Stack spacing={1.5}>
              <Box><Typography variant="caption" color="textSecondary">Catégorie</Typography><Typography>{product.category?.name || '-'}</Typography></Box>
              <Box><Typography variant="caption" color="textSecondary">Marque</Typography><Typography>{product.brand?.name || '-'}</Typography></Box>
              <Box><Typography variant="caption" color="textSecondary">Unité</Typography><Typography>{product.unit?.name} ({product.unit?.abbreviation})</Typography></Box>
              <Box><Typography variant="caption" color="textSecondary">Code-barres</Typography><Typography>{product.barcode || '-'}</Typography></Box>
              <Box><Typography variant="caption" color="textSecondary">Emplacement</Typography><Typography>{product.location || '-'}</Typography></Box>
              <Box><Typography variant="caption" color="textSecondary">Poids / Volume</Typography><Typography>{product.weight ? `${product.weight} kg` : '-'} / {product.volume ? `${product.volume} m³` : '-'}</Typography></Box>
            </Stack></CardContent></Card></Grid>

            <Grid item xs={12} md={6}><Card sx={{ borderRadius: 3, boxShadow: 2 }}><CardContent><Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}><MoneyIcon /> Prix et stock</Typography><Divider sx={{ mb: 2 }} /><Stack spacing={1.5}>
              <Box><Typography variant="caption" color="textSecondary">Prix d'achat (HT)</Typography><Typography>{formatNumber(product.purchase_price)} €</Typography></Box>
              <Box><Typography variant="caption" color="textSecondary">Prix de vente (HT)</Typography><Typography variant="h6" color={COMPANY_COLORS.vividOrange} fontWeight="bold">{formatNumber(product.sale_price)} €</Typography></Box>
              {product.wholesale_price && <Box><Typography variant="caption" color="textSecondary">Prix de gros</Typography><Typography>{formatNumber(product.wholesale_price)} €</Typography></Box>}
              <Box><Typography variant="caption" color="textSecondary">TVA</Typography><Typography>{product.tax_rate}%</Typography></Box>
              <Box><Typography variant="caption" color="textSecondary">Marge</Typography><Typography>{formatNumber(product.sale_price - product.purchase_price)} € ({((product.sale_price - product.purchase_price) / product.purchase_price * 100).toFixed(2)}%)</Typography></Box>
              <Divider />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><Typography variant="caption" color="textSecondary">Stock actuel</Typography><Typography variant="h6" color={product.is_low_stock ? 'warning.main' : 'text.primary'} fontWeight="bold">{product.stock_quantity} {product.unit?.abbreviation}</Typography></Box>
              {product.is_low_stock && <Alert severity="warning" icon={<WarningIcon />}>Stock faible (min: {product.minimum_stock})</Alert>}
              <Box><Typography variant="caption" color="textSecondary">Stock min / max</Typography><Typography>{product.minimum_stock} / {product.maximum_stock || '∞'}</Typography></Box>
            </Stack></CardContent></Card></Grid>

            {product.has_variants && variants.length > 0 && <Grid item xs={12}><Card sx={{ borderRadius: 3, boxShadow: 2 }}><CardContent><Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600 }}>Variantes</Typography><Divider sx={{ mb: 2 }} /><TableContainer component={Paper} variant="outlined"><Table size="small"><TableHead sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.04) }}><TableRow><TableCell>SKU</TableCell><TableCell>Attributs</TableCell><TableCell align="right">Prix achat</TableCell><TableCell align="right">Prix vente</TableCell><TableCell align="center">Stock</TableCell><TableCell align="center">Statut</TableCell></TableRow></TableHead><TableBody>{variants.map(v => (<TableRow key={v.id}><TableCell>{v.sku}</TableCell><TableCell>{Object.entries(v.attributes).map(([k, val]) => <Chip key={k} label={`${k}: ${val}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />)}</TableCell><TableCell align="right">{formatNumber(v.purchase_price)} €</TableCell><TableCell align="right">{formatNumber(v.sale_price)} €</TableCell><TableCell align="center">{v.stock_quantity}</TableCell><TableCell align="center">{v.is_active ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="error" fontSize="small" />}</TableCell></TableRow>))}</TableBody></Table></TableContainer></CardContent></Card></Grid>}
          </Grid>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
    </Box>
  )
}

export default ProductDetails