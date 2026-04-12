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
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  alpha,
  InputAdornment
} from '@mui/material'
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
  Business as BusinessIcon,
  Language as WebsiteIcon
} from '@mui/icons-material'
import AxiosInstance from '../AxiosInstance'
import { useNavigate, useParams } from 'react-router-dom'

// Palette de couleurs ECSI SARL
const COMPANY_COLORS = {
  darkCyan: '#0A2647',
  vividOrange: '#C9A03D',
  lightCyan: '#E9F1FA',
  lightOrange: '#FDF6E3',
  white: '#FFFFFF'
}

const BrandForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: null,
    website: '',
    is_active: true
  })

  const [logoPreview, setLogoPreview] = useState(null)

  const fetchData = async () => {
    if (!isEditMode) return
    setLoading(true)
    try {
      const res = await AxiosInstance.get(`/brands/${id}/`)
      const brand = res.data
      setFormData({
        name: brand.name || '',
        description: brand.description || '',
        logo: brand.logo || null,
        website: brand.website || '',
        is_active: brand.is_active !== undefined ? brand.is_active : true
      })
      if (brand.logo) {
        setLogoPreview(brand.logo)
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

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }))
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      setSnackbar({ open: true, message: 'Le nom est obligatoire', severity: 'error' })
      return
    }

    setSubmitting(true)
    try {
      const payload = new FormData()
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === 'logo' && formData[key] instanceof File) {
            payload.append(key, formData[key])
          } else {
            payload.append(key, formData[key])
          }
        }
      })

      if (isEditMode) {
        await AxiosInstance.put(`/brands/${id}/`, payload)
        setSnackbar({ open: true, message: 'Marque modifiée avec succès', severity: 'success' })
      } else {
        await AxiosInstance.post('/brands/', payload)
        setSnackbar({ open: true, message: 'Marque créée avec succès', severity: 'success' })
      }
      setTimeout(() => navigate('/brands'), 1500)
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
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: COMPANY_COLORS.darkCyan }}>
            {isEditMode ? 'Modifier la marque' : 'Nouvelle marque'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Ajoutez ou modifiez une marque pour vos produits
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/brands')} startIcon={<CancelIcon />} sx={{ borderColor: COMPANY_COLORS.darkCyan, color: COMPANY_COLORS.darkCyan }}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={submitting} 
            startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />} 
            sx={{ 
              background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, ${COMPANY_COLORS.vividOrange} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, ${COMPANY_COLORS.vividOrange} 80%)`
              }
            }}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Formulaire principal */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <BusinessIcon sx={{ color: COMPANY_COLORS.vividOrange }} />
                <Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600 }}>
                  Informations générales
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nom de la marque *"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Site web"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.exemple.com"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WebsiteIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        name="is_active"
                        color="success"
                      />
                    }
                    label="Marque active"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Upload du logo */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600, mb: 2 }}>
                Logo de la marque
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                {logoPreview ? (
                  <Avatar
                    src={logoPreview}
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
                    <BusinessIcon sx={{ fontSize: 60, color: COMPANY_COLORS.darkCyan }} />
                  </Avatar>
                )}
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  sx={{ borderColor: COMPANY_COLORS.vividOrange, color: COMPANY_COLORS.vividOrange }}
                >
                  {formData.logo ? 'Changer le logo' : 'Ajouter un logo'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </Button>
                {formData.logo && (
                  <Button
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, logo: null }))
                      setLogoPreview(null)
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
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default BrandForm