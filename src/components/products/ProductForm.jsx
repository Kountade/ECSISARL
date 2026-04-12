import React, { useEffect, useState } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, CircularProgress, Snackbar, Alert, InputAdornment, FormControl, InputLabel, Select, MenuItem, Switch,
  FormControlLabel, Divider, IconButton, Tooltip, alpha, Tabs, Tab, Avatar, ImageList, ImageListItem, ImageListItemBar,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack
} from '@mui/material'
import {
  Save as SaveIcon, Cancel as CancelIcon, Delete as DeleteIcon, Add as AddIcon, CloudUpload as UploadIcon,
  Inventory as InventoryIcon, AttachMoney as MoneyIcon, Info as InfoIcon, Close as CloseIcon, Edit as EditIcon,
  Star as StarIcon, StarBorder as StarBorderIcon
} from '@mui/icons-material'
import AxiosInstance from '../AxiosInstance'
import { useNavigate, useParams } from 'react-router-dom'

const COMPANY_COLORS = { darkCyan: '#0A2647', vividOrange: '#C9A03D', lightCyan: '#E9F1FA', lightOrange: '#FDF6E3', white: '#FFFFFF' }

const ProductForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [units, setUnits] = useState([])

  const [formData, setFormData] = useState({
    reference: '', barcode: '', name: '', description: '', product_type: 'simple',
    category: '', brand: '', unit: '', purchase_price: '', sale_price: '', wholesale_price: '',
    tax_rate: 20, stock_quantity: 0, minimum_stock: 5, maximum_stock: '', location: '',
    is_active: true, is_featured: false, has_variants: false, weight: '', volume: '', main_image: null
  })

  const [images, setImages] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [openImageDialog, setOpenImageDialog] = useState(false)
  const [currentImage, setCurrentImage] = useState({ file: null, alt_text: '', is_main: false })

  const [variants, setVariants] = useState([])
  const [openVariantDialog, setOpenVariantDialog] = useState(false)
  const [editingVariant, setEditingVariant] = useState(null)
  const [variantForm, setVariantForm] = useState({ sku: '', attributes: {}, purchase_price: '', sale_price: '', stock_quantity: 0, image: null, is_active: true })
  const [attributeKey, setAttributeKey] = useState('')
  const [attributeValue, setAttributeValue] = useState('')

  const productTypes = { simple: 'Simple', variable: 'Variable', service: 'Service', digital: 'Numérique' }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [catRes, brandRes, unitRes] = await Promise.all([
        AxiosInstance.get('/categories/'), AxiosInstance.get('/brands/'), AxiosInstance.get('/units/')
      ])
      setCategories(catRes.data); setBrands(brandRes.data); setUnits(unitRes.data)

      if (isEditMode) {
        const [prodRes, imgRes, varRes] = await Promise.all([
          AxiosInstance.get(`/products/${id}/`),
          AxiosInstance.get(`/products/${id}/images/`).catch(() => ({ data: [] })),
          AxiosInstance.get(`/products/${id}/variants/`).catch(() => ({ data: [] }))
        ])
        const p = prodRes.data
        setFormData({
          reference: p.reference || '', barcode: p.barcode || '', name: p.name || '', description: p.description || '',
          product_type: p.product_type || 'simple', category: p.category || '', brand: p.brand || '', unit: p.unit || '',
          purchase_price: p.purchase_price || '', sale_price: p.sale_price || '', wholesale_price: p.wholesale_price || '',
          tax_rate: p.tax_rate || 20, stock_quantity: p.stock_quantity || 0, minimum_stock: p.minimum_stock || 5,
          maximum_stock: p.maximum_stock || '', location: p.location || '',
          is_active: p.is_active !== undefined ? p.is_active : true, is_featured: p.is_featured || false,
          has_variants: p.has_variants || false, weight: p.weight || '', volume: p.volume || '', main_image: p.main_image || null
        })
        setImages(imgRes.data || [])
        setVariants(varRes.data || [])
      }
    } catch (error) {
      console.error(error)
      setSnackbar({ open: true, message: 'Erreur de chargement', severity: 'error' })
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [id])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleMainImageChange = (e) => {
    const file = e.target.files[0]
    if (file) setFormData(prev => ({ ...prev, main_image: file }))
  }

  const handleAddImage = () => {
    if (!currentImage.file) return
    setImageFiles(prev => [...prev, currentImage])
    setCurrentImage({ file: null, alt_text: '', is_main: false })
    setOpenImageDialog(false)
  }

  const handleRemoveImageFile = (index) => setImageFiles(prev => prev.filter((_, i) => i !== index))
  const handleDeleteExistingImage = async (imageId) => {
    try {
      await AxiosInstance.delete(`/product-images/${imageId}/`)
      setImages(prev => prev.filter(img => img.id !== imageId))
      setSnackbar({ open: true, message: 'Image supprimée', severity: 'success' })
    } catch { setSnackbar({ open: true, message: 'Erreur suppression', severity: 'error' }) }
  }

  const handleSetMainImage = (imageId) => setImages(prev => prev.map(img => ({ ...img, is_main: img.id === imageId })))

  const handleAddVariant = () => {
    if (!variantForm.sku || !variantForm.purchase_price || !variantForm.sale_price) {
      setSnackbar({ open: true, message: 'SKU, prix achat et prix vente requis', severity: 'error' }); return
    }
    if (editingVariant) setVariants(prev => prev.map(v => v.id === editingVariant.id ? { ...variantForm, id: editingVariant.id } : v))
    else setVariants(prev => [...prev, { ...variantForm, id: Date.now() }])
    setOpenVariantDialog(false); setEditingVariant(null)
    setVariantForm({ sku: '', attributes: {}, purchase_price: '', sale_price: '', stock_quantity: 0, image: null, is_active: true })
    setAttributeKey(''); setAttributeValue('')
  }

  const handleDeleteVariant = (variantId) => setVariants(prev => prev.filter(v => v.id !== variantId))

  const addAttribute = () => {
    if (attributeKey && attributeValue) {
      setVariantForm(prev => ({ ...prev, attributes: { ...prev.attributes, [attributeKey]: attributeValue } }))
      setAttributeKey(''); setAttributeValue('')
    }
  }

  const removeAttribute = (key) => {
    setVariantForm(prev => { const newAttr = { ...prev.attributes }; delete newAttr[key]; return { ...prev, attributes: newAttr } })
  }

  const handleSubmit = async () => {
    if (!formData.reference || !formData.name || !formData.category || !formData.unit) {
      setSnackbar({ open: true, message: 'Référence, nom, catégorie et unité obligatoires', severity: 'error' }); return
    }
    setSubmitting(true)
    try {
      const productPayload = new FormData()
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === 'main_image' && formData[key] instanceof File) productPayload.append(key, formData[key])
          else productPayload.append(key, formData[key])
        }
      })
      let productResponse = isEditMode ? await AxiosInstance.put(`/products/${id}/`, productPayload) : await AxiosInstance.post('/products/', productPayload)
      const productId = productResponse.data.id

      for (const img of imageFiles) {
        const imgData = new FormData()
        imgData.append('product', productId); imgData.append('image', img.file); imgData.append('alt_text', img.alt_text); imgData.append('is_main', img.is_main)
        await AxiosInstance.post('/product-images/', imgData)
      }

      if (formData.has_variants) {
        if (isEditMode) {
          const currentVariantIds = variants.map(v => v.id)
          const existing = (await AxiosInstance.get(`/products/${productId}/variants/`)).data
          for (const v of existing) if (!currentVariantIds.includes(v.id)) await AxiosInstance.delete(`/variants/${v.id}/`)
        }
        for (const v of variants) {
          const variantPayload = { product: productId, sku: v.sku, attributes: v.attributes, purchase_price: v.purchase_price, sale_price: v.sale_price, stock_quantity: v.stock_quantity, is_active: v.is_active }
          if (v.image instanceof File) {
            const varForm = new FormData(); Object.keys(variantPayload).forEach(k => varForm.append(k, variantPayload[k])); varForm.append('image', v.image)
            if (v.id && !String(v.id).includes('temp')) await AxiosInstance.put(`/variants/${v.id}/`, varForm)
            else await AxiosInstance.post('/variants/', varForm)
          } else {
            if (v.id && !String(v.id).includes('temp')) await AxiosInstance.put(`/variants/${v.id}/`, variantPayload)
            else await AxiosInstance.post('/variants/', variantPayload)
          }
        }
      }

      setSnackbar({ open: true, message: isEditMode ? 'Produit modifié' : 'Produit créé', severity: 'success' })
      setTimeout(() => navigate('/produits'), 1500)
    } catch (error) {
      console.error(error)
      let errorMsg = 'Erreur lors de l\'enregistrement'
      if (error.response?.data) errorMsg = Object.entries(error.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
      setSnackbar({ open: true, message: errorMsg, severity: 'error' })
    } finally { setSubmitting(false) }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress size={60} sx={{ color: COMPANY_COLORS.darkCyan }} /></Box>

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: COMPANY_COLORS.darkCyan }}>{isEditMode ? 'Modifier le produit' : 'Nouveau produit'}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/produits')} startIcon={<CancelIcon />} sx={{ borderColor: COMPANY_COLORS.darkCyan, color: COMPANY_COLORS.darkCyan }}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting} startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />} sx={{ background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, ${COMPANY_COLORS.vividOrange} 100%)` }}>{submitting ? 'Enregistrement...' : 'Enregistrer'}</Button>
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="Informations générales" />
        <Tab label="Prix & Stock" />
        <Tab label="Images" />
        {formData.has_variants && <Tab label="Variantes" />}
      </Tabs>

      {/* Tab 0 : Informations générales */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}><CardContent>
              <Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600 }}>Identification</Typography><Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Référence *" name="reference" value={formData.reference} onChange={handleInputChange} required /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Code-barres" name="barcode" value={formData.barcode} onChange={handleInputChange} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Nom du produit *" name="name" value={formData.name} onChange={handleInputChange} required /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleInputChange} multiline rows={4} /></Grid>
                <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Type de produit</InputLabel><Select name="product_type" value={formData.product_type} label="Type de produit" onChange={handleInputChange}>{Object.entries(productTypes).map(([k,v])=><MenuItem key={k} value={k}>{v}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Catégorie</InputLabel><Select name="category" value={formData.category} label="Catégorie" onChange={handleInputChange}>{categories.map(c=><MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Marque</InputLabel><Select name="brand" value={formData.brand} label="Marque" onChange={handleInputChange}><MenuItem value="">Aucune</MenuItem>{brands.map(b=><MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Unité</InputLabel><Select name="unit" value={formData.unit} label="Unité" onChange={handleInputChange}>{units.map(u=><MenuItem key={u.id} value={u.id}>{u.name} ({u.abbreviation})</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12}><FormControlLabel control={<Switch checked={formData.has_variants} onChange={handleInputChange} name="has_variants" />} label="Ce produit a des variantes" /></Grid>
              </Grid>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}><CardContent>
              <Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600 }}>Image principale</Typography><Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {formData.main_image ? <Avatar src={formData.main_image instanceof File ? URL.createObjectURL(formData.main_image) : formData.main_image} variant="rounded" sx={{ width: 200, height: 200, mb: 2 }} /> : <Avatar variant="rounded" sx={{ width: 200, height: 200, bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.05), mb: 2 }}><InventoryIcon sx={{ fontSize: 60, color: COMPANY_COLORS.darkCyan }} /></Avatar>}
                <Button variant="outlined" component="label" startIcon={<UploadIcon />} sx={{ borderColor: COMPANY_COLORS.vividOrange, color: COMPANY_COLORS.vividOrange }}>{formData.main_image ? 'Changer' : 'Ajouter'}<input type="file" hidden accept="image/*" onChange={handleMainImageChange} /></Button>
              </Box>
            </CardContent></Card>
            <Card sx={{ borderRadius: 3, boxShadow: 2, mt: 2 }}><CardContent>
              <Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600 }}>Options</Typography><Divider sx={{ mb: 2 }} />
              <FormControlLabel control={<Switch checked={formData.is_active} onChange={handleInputChange} name="is_active" />} label="Produit actif" />
              <FormControlLabel control={<Switch checked={formData.is_featured} onChange={handleInputChange} name="is_featured" />} label="Mettre en avant" />
            </CardContent></Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 1 : Prix & Stock (similaire, adapté aux couleurs) */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}><Card sx={{ borderRadius: 3, boxShadow: 2 }}><CardContent><Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}><MoneyIcon /> Prix et taxes</Typography><Divider sx={{ mb: 2 }} /><Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Prix d'achat (HT) *" name="purchase_price" type="number" value={formData.purchase_price} onChange={handleInputChange} InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Prix de vente (HT) *" name="sale_price" type="number" value={formData.sale_price} onChange={handleInputChange} InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Prix de gros (HT)" name="wholesale_price" type="number" value={formData.wholesale_price} onChange={handleInputChange} InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="TVA (%)" name="tax_rate" type="number" value={formData.tax_rate} onChange={handleInputChange} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} /></Grid>
          </Grid></CardContent></Card></Grid>
          <Grid item xs={12} md={6}><Card sx={{ borderRadius: 3, boxShadow: 2 }}><CardContent><Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}><InventoryIcon /> Stock</Typography><Divider sx={{ mb: 2 }} /><Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Quantité en stock" name="stock_quantity" type="number" value={formData.stock_quantity} onChange={handleInputChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Stock minimum" name="minimum_stock" type="number" value={formData.minimum_stock} onChange={handleInputChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Stock maximum" name="maximum_stock" type="number" value={formData.maximum_stock} onChange={handleInputChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Emplacement" name="location" value={formData.location} onChange={handleInputChange} placeholder="ex: A12" /></Grid>
          </Grid></CardContent></Card>
          <Card sx={{ borderRadius: 3, boxShadow: 2, mt: 2 }}><CardContent><Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600 }}>Dimensions</Typography><Divider sx={{ mb: 2 }} /><Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Poids (kg)" name="weight" type="number" value={formData.weight} onChange={handleInputChange} inputProps={{ step: '0.001' }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Volume (m³)" name="volume" type="number" value={formData.volume} onChange={handleInputChange} inputProps={{ step: '0.001' }} /></Grid>
          </Grid></CardContent></Card></Grid>
        </Grid>
      )}

      {/* Tab 2 : Images */}
      {tabValue === 2 && (
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}><CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600 }}>Galerie d'images</Typography>
            <Button startIcon={<AddIcon />} onClick={() => setOpenImageDialog(true)} sx={{ color: COMPANY_COLORS.vividOrange }}>Ajouter une image</Button>
          </Box><Divider sx={{ mb: 3 }} />
          <ImageList cols={4} gap={16}>
            {images.map((img) => (<ImageListItem key={img.id}><img src={img.image} alt={img.alt_text} loading="lazy" style={{ borderRadius: 8, height: 150, objectFit: 'cover' }} /><ImageListItemBar title={img.alt_text || 'Sans description'} actionIcon={<Box><Tooltip title="Définir comme principale"><IconButton sx={{ color: 'white' }} onClick={() => handleSetMainImage(img.id)}>{img.is_main ? <StarIcon /> : <StarBorderIcon />}</IconButton></Tooltip><Tooltip title="Supprimer"><IconButton sx={{ color: 'white' }} onClick={() => handleDeleteExistingImage(img.id)}><DeleteIcon /></IconButton></Tooltip></Box>} /></ImageListItem>))}
            {imageFiles.map((img, idx) => (<ImageListItem key={`new-${idx}`}><img src={URL.createObjectURL(img.file)} alt={img.alt_text} style={{ borderRadius: 8, height: 150, objectFit: 'cover' }} /><ImageListItemBar title={img.alt_text || 'Nouvelle image'} actionIcon={<IconButton sx={{ color: 'white' }} onClick={() => handleRemoveImageFile(idx)}><CloseIcon /></IconButton>} /></ImageListItem>))}
          </ImageList>
        </CardContent></Card>
      )}

      {/* Tab 3 : Variantes */}
      {tabValue === 3 && formData.has_variants && (
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}><CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600 }}>Variantes du produit</Typography>
            <Button startIcon={<AddIcon />} onClick={() => setOpenVariantDialog(true)} sx={{ color: COMPANY_COLORS.vividOrange }}>Ajouter une variante</Button>
          </Box><Divider sx={{ mb: 3 }} />
          {variants.length === 0 ? <Typography color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>Aucune variante définie</Typography> : (
            <TableContainer><Table size="small"><TableHead sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.04) }}><TableRow><TableCell>SKU</TableCell><TableCell>Attributs</TableCell><TableCell align="right">Prix achat</TableCell><TableCell align="right">Prix vente</TableCell><TableCell align="center">Stock</TableCell><TableCell align="center">Statut</TableCell><TableCell align="center">Actions</TableCell></TableRow></TableHead><TableBody>{variants.map((v) => (<TableRow key={v.id}><TableCell>{v.sku}</TableCell><TableCell>{Object.entries(v.attributes).map(([k, val]) => (<Chip key={k} label={`${k}: ${val}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />))}</TableCell><TableCell align="right">{formatNumber(v.purchase_price)} €</TableCell><TableCell align="right">{formatNumber(v.sale_price)} €</TableCell><TableCell align="center">{v.stock_quantity}</TableCell><TableCell align="center"><Chip label={v.is_active ? 'Actif' : 'Inactif'} size="small" color={v.is_active ? 'success' : 'default'} /></TableCell><TableCell align="center"><Tooltip title="Modifier"><IconButton size="small" onClick={() => { setEditingVariant(v); setVariantForm(v); setOpenVariantDialog(true) }}><EditIcon fontSize="small" /></IconButton></Tooltip><Tooltip title="Supprimer"><IconButton size="small" color="error" onClick={() => handleDeleteVariant(v.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip></TableCell></TableRow>))}</TableBody></Table></TableContainer>)}
        </CardContent></Card>
      )}

      {/* Dialogs pour images et variantes (similaires, adaptés aux couleurs) */}
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, ${COMPANY_COLORS.vividOrange} 100%)`, color: COMPANY_COLORS.white }}>Ajouter une image</DialogTitle>
        <DialogContent sx={{ p: 3 }}><Stack spacing={3}>
          <Button variant="outlined" component="label" startIcon={<UploadIcon />} fullWidth sx={{ borderColor: COMPANY_COLORS.vividOrange, color: COMPANY_COLORS.vividOrange }}>{currentImage.file ? currentImage.file.name : 'Choisir un fichier'}<input type="file" hidden accept="image/*" onChange={(e) => setCurrentImage({ ...currentImage, file: e.target.files[0] })} /></Button>
          <TextField label="Texte alternatif" fullWidth value={currentImage.alt_text} onChange={(e) => setCurrentImage({ ...currentImage, alt_text: e.target.value })} />
          <FormControlLabel control={<Switch checked={currentImage.is_main} onChange={(e) => setCurrentImage({ ...currentImage, is_main: e.target.checked })} />} label="Définir comme image principale" />
        </Stack></DialogContent>
        <DialogActions sx={{ p: 3 }}><Button onClick={() => setOpenImageDialog(false)}>Annuler</Button><Button onClick={handleAddImage} variant="contained" sx={{ background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, ${COMPANY_COLORS.vividOrange} 100%)` }}>Ajouter</Button></DialogActions>
      </Dialog>

      <Dialog open={openVariantDialog} onClose={() => setOpenVariantDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, ${COMPANY_COLORS.vividOrange} 100%)`, color: COMPANY_COLORS.white }}>{editingVariant ? 'Modifier la variante' : 'Nouvelle variante'}</DialogTitle>
        <DialogContent sx={{ p: 3 }}><Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField label="SKU *" fullWidth value={variantForm.sku} onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })} /></Grid>
          <Grid item xs={12} sm={6}><Button variant="outlined" component="label" startIcon={<UploadIcon />} fullWidth sx={{ borderColor: COMPANY_COLORS.vividOrange, color: COMPANY_COLORS.vividOrange }}>{variantForm.image ? (variantForm.image instanceof File ? variantForm.image.name : 'Image existante') : 'Image (optionnel)'}<input type="file" hidden accept="image/*" onChange={(e) => setVariantForm({ ...variantForm, image: e.target.files[0] })} /></Button></Grid>
          <Grid item xs={12}><Typography variant="subtitle2" gutterBottom>Attributs</Typography><Box sx={{ display: 'flex', gap: 1, mb: 2 }}><TextField label="Clé" size="small" value={attributeKey} onChange={(e) => setAttributeKey(e.target.value)} /><TextField label="Valeur" size="small" value={attributeValue} onChange={(e) => setAttributeValue(e.target.value)} /><Button variant="outlined" onClick={addAttribute}>Ajouter</Button></Box><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{Object.entries(variantForm.attributes).map(([key, val]) => (<Chip key={key} label={`${key}: ${val}`} onDelete={() => removeAttribute(key)} />))}</Box></Grid>
          <Grid item xs={12} sm={6}><TextField label="Prix d'achat *" type="number" fullWidth value={variantForm.purchase_price} onChange={(e) => setVariantForm({ ...variantForm, purchase_price: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Prix de vente *" type="number" fullWidth value={variantForm.sale_price} onChange={(e) => setVariantForm({ ...variantForm, sale_price: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Stock" type="number" fullWidth value={variantForm.stock_quantity} onChange={(e) => setVariantForm({ ...variantForm, stock_quantity: parseInt(e.target.value) || 0 })} /></Grid>
          <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={variantForm.is_active} onChange={(e) => setVariantForm({ ...variantForm, is_active: e.target.checked })} />} label="Actif" /></Grid>
        </Grid></DialogContent>
        <DialogActions sx={{ p: 3 }}><Button onClick={() => { setOpenVariantDialog(false); setEditingVariant(null); }}>Annuler</Button><Button onClick={handleAddVariant} variant="contained" sx={{ background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, ${COMPANY_COLORS.vividOrange} 100%)` }}>{editingVariant ? 'Modifier' : 'Ajouter'}</Button></DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert></Snackbar>
    </Box>
  )
}

const formatNumber = (number) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number)

export default ProductForm