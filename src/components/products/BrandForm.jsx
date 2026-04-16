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
  const [existingLogoUrl, setExistingLogoUrl] = useState(null)

  const fetchData = async () => {
    if (!isEditMode) return
    setLoading(true)
    try {
      const res = await AxiosInstance.get(`/brands/${id}/`)
      const brand = res.data
      setFormData({
        name: brand.name || '',
        description: brand.description || '',
        logo: null, // On ne garde pas l'ancien logo dans formData
        website: brand.website || '',
        is_active: brand.is_active !== undefined ? brand.is_active : true
      })
      if (brand.logo) {
        setExistingLogoUrl(brand.logo)
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
      // Validation du fichier
      if (!file.type.match('image.*')) {
        setSnackbar({ open: true, message: 'Veuillez sélectionner une image (JPG, PNG, GIF)', severity: 'error' })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({ open: true, message: "L'image ne doit pas dépasser 5MB", severity: 'error' })
        return
      }
      setFormData(prev => ({ ...prev, logo: file }))
      setLogoPreview(URL.createObjectURL(file))
      setExistingLogoUrl(null)
    }
  }

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }))
    setLogoPreview(null)
    setExistingLogoUrl(null)
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      setSnackbar({ open: true, message: 'Le nom est obligatoire', severity: 'error' })
      return
    }

    setSubmitting(true)
    try {
      const payload = new FormData()
      
      // Ajouter les champs textuels
      payload.append('name', formData.name)
      
      if (formData.description) {
        payload.append('description', formData.description)
      }
      
      if (formData.website) {
        payload.append('website', formData.website)
      }
      
      payload.append('is_active', formData.is_active)
      
      // Gérer le logo
      if (formData.logo instanceof File) {
        // Nouveau logo sélectionné
        payload.append('logo', formData.logo)
      } else if (isEditMode && existingLogoUrl && !formData.logo) {
        // En mode édition, si on n'a pas changé le logo, ne rien envoyer
        // L'API gardera le logo existant
        console.log('Conservation du logo existant')
      } else if (isEditMode && !existingLogoUrl && !formData.logo) {
        // L'utilisateur a supprimé le logo
        payload.append('logo', '')
      }

      // Configuration explicite pour multipart/form-data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }

      if (isEditMode) {
        await AxiosInstance.put(`/brands/${id}/`, payload, config)
        setSnackbar({ open: true, message: 'Marque modifiée avec succès', severity: 'success' })
      } else {
        await AxiosInstance.post('/brands/', payload, config)
        setSnackbar({ open: true, message: 'Marque créée avec succès', severity: 'success' })
      }
      setTimeout(() => navigate('/brands'), 1500)
    } catch (error) {
      console.error('Erreur détaillée:', error)
      console.error('Response:', error.response?.data)
      let errorMsg = 'Erreur lors de l\'enregistrement'
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMsg = Object.entries(error.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
        } else {
          errorMsg = error.response.data
        }
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
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    sx={{ borderColor: COMPANY_COLORS.vividOrange, color: COMPANY_COLORS.vividOrange }}
                  >
                    {logoPreview ? 'Changer le logo' : 'Ajouter un logo'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </Button>
                  {logoPreview && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveLogo}
                    >
                      Supprimer
                    </Button>
                  )}
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
                  Formats acceptés: JPG, PNG, GIF<br />
                  Taille maximale: 5MB
                </Typography>
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
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default BrandForm