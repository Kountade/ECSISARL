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
  IconButton,
  alpha
} from '@mui/material'
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
  Category as CategoryIcon
} from '@mui/icons-material'
import AxiosInstance from '../AxiosInstance'
import { useNavigate, useParams } from 'react-router-dom'

const CategoryForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const darkCayn = '#003C3f'
  const vividOrange = '#DA4A0E'

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [parentCategories, setParentCategories] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: '',
    image: null,
    is_active: true
  })

  const [imagePreview, setImagePreview] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      // Récupérer toutes les catégories pour le parent (exclure la catégorie en cours d'édition)
      const res = await AxiosInstance.get('/categories/')
      let categories = res.data
      if (isEditMode) {
        const catRes = await AxiosInstance.get(`/categories/${id}/`)
        const category = catRes.data
        setFormData({
          name: category.name || '',
          description: category.description || '',
          parent: category.parent || '',
          image: category.image || null,
          is_active: category.is_active !== undefined ? category.is_active : true
        })
        if (category.image) {
          setImagePreview(category.image)
        }
        // Exclure la catégorie elle-même et ses enfants pour éviter la circularité
        categories = categories.filter(c => c.id !== parseInt(id) && c.parent !== parseInt(id))
      }
      setParentCategories(categories)
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

  const handleSubmit = async () => {
    if (!formData.name) {
      setSnackbar({ open: true, message: 'Le nom est obligatoire', severity: 'error' })
      return
    }

    setSubmitting(true)
    try {
      const payload = new FormData()
      
      // Ajouter les champs un par un avec vérification
      payload.append('name', formData.name)
      
      if (formData.description) {
        payload.append('description', formData.description)
      }
      
      if (formData.parent) {
        payload.append('parent', formData.parent)
      }
      
      payload.append('is_active', formData.is_active)
      
      // Gérer l'image correctement
      if (formData.image) {
        if (formData.image instanceof File) {
          payload.append('image', formData.image)
        } else if (typeof formData.image === 'string' && formData.image !== 'null') {
          // Si c'est une URL existante (en mode édition), ne rien faire
          // ou vous pouvez conserver l'image existante en ne l'envoyant pas
          console.log('Image existante conservée')
        }
      }

      // Configuration Axios explicite pour multipart/form-data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }

      if (isEditMode) {
        await AxiosInstance.put(`/categories/${id}/`, payload, config)
        setSnackbar({ open: true, message: 'Catégorie modifiée', severity: 'success' })
      } else {
        await AxiosInstance.post('/categories/', payload, config)
        setSnackbar({ open: true, message: 'Catégorie créée', severity: 'success' })
      }
      setTimeout(() => navigate('/categories'), 1500)
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
        <CircularProgress size={60} sx={{ color: darkCayn }} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: darkCayn }}>
          {isEditMode ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/categories')} startIcon={<CancelIcon />} sx={{ borderColor: darkCayn, color: darkCayn }}>
            Annuler
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting} startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />} sx={{ background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)` }}>
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: darkCayn, fontWeight: 600 }}>
                Informations générales
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nom de la catégorie *"
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Catégorie parente</InputLabel>
                    <Select
                      name="parent"
                      value={formData.parent}
                      label="Catégorie parente"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="">Aucune (catégorie racine)</MenuItem>
                      {parentCategories.map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                    label="Catégorie active"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: darkCayn, fontWeight: 600 }}>
                Image de la catégorie
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
                    sx={{ width: 200, height: 200, bgcolor: alpha(darkCayn, 0.1), mb: 2 }}
                  >
                    <CategoryIcon sx={{ fontSize: 60, color: darkCayn }} />
                  </Avatar>
                )}
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  sx={{ borderColor: vividOrange, color: vividOrange }}
                >
                  {formData.image ? 'Changer l\'image' : 'Ajouter une image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
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

export default CategoryForm