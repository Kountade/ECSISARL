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
  Divider,
  Avatar,
  alpha,
  Stack,
  Chip
} from '@mui/material'
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Scale as WeightIcon,
  Opacity as VolumeIcon,
  SquareFoot as AreaIcon,
  Straighten as LengthIcon,
  Inventory as PieceIcon,
  AccessTime as TimeIcon,
  Grid3x3 as PackageIcon,
  Info as InfoIcon
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

// Suggestions d'unités courantes
const UNIT_SUGGESTIONS = [
  { name: 'Kilogramme', abbreviation: 'kg', icon: WeightIcon, color: '#1976D2' },
  { name: 'Gramme', abbreviation: 'g', icon: WeightIcon, color: '#1976D2' },
  { name: 'Tonne', abbreviation: 't', icon: WeightIcon, color: '#1976D2' },
  { name: 'Litre', abbreviation: 'L', icon: VolumeIcon, color: COMPANY_COLORS.darkCyan },
  { name: 'Millilitre', abbreviation: 'ml', icon: VolumeIcon, color: COMPANY_COLORS.darkCyan },
  { name: 'Mètre', abbreviation: 'm', icon: LengthIcon, color: COMPANY_COLORS.vividOrange },
  { name: 'Centimètre', abbreviation: 'cm', icon: LengthIcon, color: COMPANY_COLORS.vividOrange },
  { name: 'Millimètre', abbreviation: 'mm', icon: LengthIcon, color: COMPANY_COLORS.vividOrange },
  { name: 'Mètre carré', abbreviation: 'm²', icon: AreaIcon, color: '#2E7D32' },
  { name: 'Pièce', abbreviation: 'pcs', icon: PieceIcon, color: COMPANY_COLORS.vividOrange },
  { name: 'Unité', abbreviation: 'un', icon: PieceIcon, color: COMPANY_COLORS.vividOrange },
  { name: 'Heure', abbreviation: 'h', icon: TimeIcon, color: '#9C27B0' },
  { name: 'Minute', abbreviation: 'min', icon: TimeIcon, color: '#9C27B0' }
]

const UnitForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const [formData, setFormData] = useState({
    name: '',
    abbreviation: ''
  })

  const [previewIcon, setPreviewIcon] = useState(PackageIcon)
  const [previewColor, setPreviewColor] = useState('#607D8B')

  const fetchData = async () => {
    if (!isEditMode) return
    setLoading(true)
    try {
      const res = await AxiosInstance.get(`/units/${id}/`)
      const unit = res.data
      setFormData({
        name: unit.name || '',
        abbreviation: unit.abbreviation || ''
      })
      updatePreview(unit.name, unit.abbreviation)
    } catch (error) {
      console.error(error)
      setSnackbar({ open: true, message: 'Erreur de chargement', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  const getIconFromText = (name, abbr) => {
    const lowerName = (name || '').toLowerCase()
    const lowerAbbr = (abbr || '').toLowerCase()

    if (lowerAbbr.includes('kg') || lowerAbbr.includes('g') || lowerName.includes('kilo') || lowerName.includes('gramme') || lowerName.includes('poids')) {
      return { icon: WeightIcon, color: '#1976D2' }
    }
    if (lowerAbbr.includes('l') || lowerAbbr.includes('ml') || lowerName.includes('litre') || lowerName.includes('volume')) {
      return { icon: VolumeIcon, color: COMPANY_COLORS.darkCyan }
    }
    if (lowerAbbr.includes('m') && !lowerAbbr.includes('m²') && !lowerAbbr.includes('m³') || lowerAbbr.includes('cm') || lowerAbbr.includes('mm') || lowerName.includes('mètre') || lowerName.includes('longueur')) {
      return { icon: LengthIcon, color: COMPANY_COLORS.vividOrange }
    }
    if (lowerAbbr.includes('m²') || lowerAbbr.includes('m2') || lowerName.includes('surface') || lowerName.includes('aire')) {
      return { icon: AreaIcon, color: '#2E7D32' }
    }
    if (lowerAbbr.includes('pcs') || lowerAbbr.includes('pc') || lowerAbbr.includes('unité') || lowerName.includes('pièce') || lowerName.includes('unité')) {
      return { icon: PieceIcon, color: COMPANY_COLORS.vividOrange }
    }
    if (lowerAbbr.includes('h') || lowerAbbr.includes('min') || lowerName.includes('heure') || lowerName.includes('temps')) {
      return { icon: TimeIcon, color: '#9C27B0' }
    }
    return { icon: PackageIcon, color: '#607D8B' }
  }

  const updatePreview = (name, abbr) => {
    const { icon, color } = getIconFromText(name, abbr)
    setPreviewIcon(icon)
    setPreviewColor(color)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (name === 'name') {
      updatePreview(value, formData.abbreviation)
    } else if (name === 'abbreviation') {
      updatePreview(formData.name, value)
    }
  }

  const handleSuggestionSelect = (suggestion) => {
    setFormData({
      name: suggestion.name,
      abbreviation: suggestion.abbreviation
    })
    updatePreview(suggestion.name, suggestion.abbreviation)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.abbreviation) {
      setSnackbar({ open: true, message: 'Le nom et l\'abréviation sont obligatoires', severity: 'error' })
      return
    }

    if (formData.abbreviation.length > 10) {
      setSnackbar({ open: true, message: 'L\'abréviation ne doit pas dépasser 10 caractères', severity: 'error' })
      return
    }

    setSubmitting(true)
    try {
      if (isEditMode) {
        await AxiosInstance.put(`/units/${id}/`, formData)
        setSnackbar({ open: true, message: 'Unité modifiée avec succès', severity: 'success' })
      } else {
        await AxiosInstance.post('/units/', formData)
        setSnackbar({ open: true, message: 'Unité créée avec succès', severity: 'success' })
      }
      setTimeout(() => navigate('/units'), 1500)
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

  const PreviewIconComponent = previewIcon

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: COMPANY_COLORS.darkCyan }}>
            {isEditMode ? 'Modifier l\'unité de mesure' : 'Nouvelle unité de mesure'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Définissez une unité physique ou commerciale pour vos produits
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/units')} startIcon={<CancelIcon />} sx={{ borderColor: COMPANY_COLORS.darkCyan, color: COMPANY_COLORS.darkCyan }}>
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
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PreviewIconComponent sx={{ color: previewColor }} />
                <Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600 }}>
                  Informations de l'unité
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nom complet de l'unité"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Kilogramme, Litre, Mètre, Pièce..."
                    required
                    helperText="Le nom descriptif de l'unité de mesure"
                    InputProps={{
                      sx: { fontSize: '1rem' }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Abréviation / Symbole"
                    name="abbreviation"
                    value={formData.abbreviation}
                    onChange={handleInputChange}
                    placeholder="Ex: kg, L, m, pcs..."
                    required
                    helperText="Code court utilisé dans les listes et tableaux (max 10 caractères)"
                    inputProps={{ maxLength: 10 }}
                    InputProps={{
                      sx: { fontSize: '1rem', fontWeight: 'bold' }
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Prévisualisation */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600, mb: 2 }}>
                Aperçu en temps réel
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: alpha(previewColor, 0.05),
                borderRadius: 3,
                p: 4,
                border: `2px dashed ${alpha(previewColor, 0.3)}`
              }}>
                <Avatar sx={{ 
                  bgcolor: alpha(previewColor, 0.15), 
                  width: 100, 
                  height: 100, 
                  mb: 2 
                }}>
                  <PreviewIconComponent sx={{ fontSize: 56, color: previewColor }} />
                </Avatar>
                <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: COMPANY_COLORS.darkCyan }}>
                  {formData.abbreviation || 'symbole'}
                </Typography>
                <Typography variant="body1" color="textSecondary" align="center">
                  {formData.name || 'Nom de l\'unité'}
                </Typography>
                <Chip 
                  label={formData.name && formData.abbreviation ? "Unité valide" : "En attente"} 
                  size="small" 
                  color={formData.name && formData.abbreviation ? "success" : "default"}
                  sx={{ mt: 2 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Suggestions d'unités courantes */}
        {!isEditMode && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <InfoIcon sx={{ color: COMPANY_COLORS.darkCyan }} />
                  <Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600 }}>
                    Unités courantes suggérées
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Cliquez sur une suggestion pour la pré-remplir automatiquement
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {UNIT_SUGGESTIONS.map((suggestion, index) => {
                    const IconComponent = suggestion.icon
                    return (
                      <Chip
                        key={index}
                        icon={<IconComponent />}
                        label={`${suggestion.name} (${suggestion.abbreviation})`}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        variant="outlined"
                        sx={{ 
                          borderColor: alpha(suggestion.color, 0.5),
                          color: suggestion.color,
                          '&:hover': {
                            bgcolor: alpha(suggestion.color, 0.1),
                            borderColor: suggestion.color
                          },
                          py: 0.5
                        }}
                      />
                    )
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
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

export default UnitForm