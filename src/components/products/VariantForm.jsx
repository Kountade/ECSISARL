import React, { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  alpha,
  InputAdornment,
  Chip,
  Stack
} from '@mui/material'
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
  Category as VariantIcon,
  Add as AddIcon
} from '@mui/icons-material'
import AxiosInstance from '../AxiosInstance'
import { useNavigate, useParams } from 'react-router-dom'

// Palette ECSI SARL
const COMPANY_COLORS = {
  darkCyan: '#0A2647',
  vividOrange: '#C9A03D',
  lightCyan: '#E9F1FA',
  lightOrange: '#FDF6E3',
  white: '#FFFFFF'
}

const VariantForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    product: '',
    sku: '',
    attributes: {},
    purchase_price: '',
    sale_price: '',
    stock_quantity: 0,
    image: null,
    is_active: true
  })

  const [imagePreview, setImagePreview] = useState(null)
  const [attributeKey, setAttributeKey] = useState('')
  const [attributeValue, setAttributeValue] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const prodRes = await AxiosInstance.get('/products/')
      setProducts(prodRes.data)

      if (isEditMode) {
        const varRes = await AxiosInstance.get(`/variants/${id}/`)
        const variant = varRes.data
        setFormData({
          product: variant.product || '',
          sku: variant.sku || '',
          attributes: variant.attributes || {},
          purchase_price: variant.purchase_price || '',
          sale_price: variant.sale_price || '',
          stock_quantity: variant.stock_quantity || 0,
          image: variant.image || null,
          is_active: variant.is_active !== undefined ? variant.is_active : true
        })
        if (variant.image) setImagePreview(variant.image)
      }
    } catch (error) {
      console.error(error)
      setSnackbar({ open: true, message: 'Erreur de chargement', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const addAttribute = () => {
    if (attributeKey && attributeValue) {
      setFormData(prev => ({
        ...prev,
        attributes: { ...prev.attributes, [attributeKey]: attributeValue }
      }))
      setAttributeKey('')
      setAttributeValue('')
    }
  }

  const removeAttribute = (key) => {
    setFormData(prev => {
      const newAttr = { ...prev.attributes }
      delete newAttr[key]
      return { ...prev, attributes: newAttr }
    })
  }

  const handleSubmit = async () => {
    if (!formData.product || !formData.sku || !formData.purchase_price || !formData.sale_price) {
      setSnackbar({ open: true, message: 'Produit, SKU, prix achat et prix vente sont obligatoires', severity: 'error' })
      return
    }

    setSubmitting(true)
    try {
      const payload = new FormData()
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === 'attributes') {
            payload.append(key, JSON.stringify(formData[key]))
          } else if (key === 'image' && formData[key] instanceof File) {
            payload.append(key, formData[key])
          } else {
            payload.append(key, formData[key])
          }
        }
      })

      if (isEditMode) {
        await AxiosInstance.put(`/variants/${id}/`, payload)
        setSnackbar({ open: true, message: 'Variante modifiée avec succès', severity: 'success' })
      } else {
        await AxiosInstance.post('/variants/', payload)
        setSnackbar({ open: true, message: 'Variante créée avec succès', severity: 'success' })
      }
      setTimeout(() => navigate('/variants'), 1500)
    } catch (error) {
      console.error(error)
      let errorMsg = 'Erreur lors de l\'enregistrement'
      if (error.response?.data) {
        errorMsg = Object.entries(error.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
      }
      setSnackbar({ open: true, message: errorMsg, severity: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} sx={{ color: COMPANY_COLORS.darkCyan }} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: COMPANY_COLORS.darkCyan }}>
            {isEditMode ? 'Modifier la variante' : 'Nouvelle variante'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Définissez une déclinaison de produit (taille, couleur, etc.)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/variants')} startIcon={<CancelIcon />} sx={{ borderColor: COMPANY_COLORS.darkCyan, color: COMPANY_COLORS.darkCyan }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{
              background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, ${COMPANY_COLORS.vividOrange} 100%)`,
              '&:hover': { background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, ${COMPANY_COLORS.vividOrange} 80%)` }
            }}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600, mb: 2 }}>
                Informations générales
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Produit parent</InputLabel>
                    <Select
                      name="product"
                      value={formData.product}
                      label="Produit parent"
                      onChange={handleInputChange}
                    >
                      {products.map(p => (
                        <MenuItem key={p.id} value={p.id}>{p.name} ({p.reference})</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SKU *"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                    helperText="Code unique identifiant cette variante"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Attributs (ex: taille, couleur)</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      label="Clé"
                      size="small"
                      value={attributeKey}
                      onChange={(e) => setAttributeKey(e.target.value)}
                      placeholder="ex: taille"
                    />
                    <TextField
                      label="Valeur"
                      size="small"
                      value={attributeValue}
                      onChange={(e) => setAttributeValue(e.target.value)}
                      placeholder="ex: M"
                    />
                    <Button variant="outlined" onClick={addAttribute} startIcon={<AddIcon />}>
                      Ajouter
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(formData.attributes).map(([key, val]) => (
                      <Chip key={key} label={`${key}: ${val}`} onDelete={() => removeAttribute(key)} />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, boxShadow: 2, mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600, mb: 2 }}>
                Prix et stock
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prix d'achat (HT) *"
                    name="purchase_price"
                    type="number"
                    value={formData.purchase_price}
                    onChange={handleInputChange}
                    InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prix de vente (HT) *"
                    name="sale_price"
                    type="number"
                    value={formData.sale_price}
                    onChange={handleInputChange}
                    InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quantité en stock"
                    name="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        name="is_active"
                        color="success"
                      />
                    }
                    label="Variante active"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600, mb: 2 }}>
                Image de la variante
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {imagePreview ? (
                  <Avatar
                    src={imagePreview}
                    variant="rounded"
                    sx={{ width: 200, height: 200, mb: 2 }}
                  />
                ) : (
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 200,
                      height: 200,
                      bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.05),
                      mb: 2,
                      border: `2px dashed ${alpha(COMPANY_COLORS.vividOrange, 0.3)}`
                    }}
                  >
                    <VariantIcon sx={{ fontSize: 60, color: COMPANY_COLORS.darkCyan }} />
                  </Avatar>
                )}
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  sx={{ borderColor: COMPANY_COLORS.vividOrange, color: COMPANY_COLORS.vividOrange }}
                >
                  {formData.image ? 'Changer l\'image' : 'Ajouter une image'}
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
                {formData.image && (
                  <Button
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, image: null }))
                      setImagePreview(null)
                    }}
                    sx={{ mt: 1 }}
                  >
                    Supprimer
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default VariantForm