import React, { useEffect, useState } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField, CircularProgress, Snackbar, Alert,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Divider, Avatar, alpha,
  InputAdornment, Tabs, Tab
} from '@mui/material'
import {
  Save as SaveIcon, Cancel as CancelIcon, CloudUpload as UploadIcon, Person as PersonIcon,
  Business as BusinessIcon, Lock as PasswordIcon
} from '@mui/icons-material'
import AxiosInstance from '../AxiosInstance'
import { useNavigate, useParams } from 'react-router-dom'

const COMPANY_COLORS = { darkCyan: '#0A2647', vividOrange: '#C9A03D', white: '#FFFFFF' }

const ROLE_CHOICES = [
  { value: 'super_admin', label: 'Administrateur général' },
  { value: 'commercial', label: 'Commercial' }
]

const DEPARTMENT_CHOICES = [
  'direction', 'administration', 'comptabilite', 'rh', 'commercial', 'ventes',
  'achats', 'magasin', 'logistique', 'technique', 'marketing', 'informatique'
]

const UserForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const [formData, setFormData] = useState({
    email: '', username: '', role: 'commercial', department: '', phone: '', address: '', city: '',
    country: 'France', postal_code: '', employee_id: '', hire_date: '', contract_type: '', salary: '',
    is_active: true, profile_picture: null, password: '', password_confirm: ''
  })

  const [imagePreview, setImagePreview] = useState(null)

  const fetchData = async () => {
    if (!isEditMode) return
    setLoading(true)
    try {
      const res = await AxiosInstance.get(`/users/${id}/`)
      const user = res.data
      setFormData({
        email: user.email || '', username: user.username || '', role: user.role || 'commercial',
        department: user.department || '', phone: user.phone || '', address: user.address || '',
        city: user.city || '', country: user.country || 'France', postal_code: user.postal_code || '',
        employee_id: user.employee_id || '', hire_date: user.hire_date || '', contract_type: user.contract_type || '',
        salary: user.salary || '', is_active: user.is_active !== undefined ? user.is_active : true,
        profile_picture: user.profile_picture || null, password: '', password_confirm: ''
      })
      if (user.profile_picture) setImagePreview(user.profile_picture)
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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, profile_picture: file }))
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    if (!formData.email) {
      setSnackbar({ open: true, message: 'L\'email est obligatoire', severity: 'error' }); return
    }
    if (!isEditMode && !formData.password) {
      setSnackbar({ open: true, message: 'Le mot de passe est obligatoire', severity: 'error' }); return
    }
    if (formData.password && formData.password !== formData.password_confirm) {
      setSnackbar({ open: true, message: 'Les mots de passe ne correspondent pas', severity: 'error' }); return
    }

    setSubmitting(true)
    try {
      const payload = new FormData()
      Object.keys(formData).forEach(key => {
        if (key === 'password_confirm') return
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === 'profile_picture' && formData[key] instanceof File) payload.append(key, formData[key])
          else payload.append(key, formData[key])
        }
      })

      if (isEditMode) {
        await AxiosInstance.put(`/users/${id}/`, payload)
      } else {
        await AxiosInstance.post('/register/', payload)
      }
      setSnackbar({ open: true, message: isEditMode ? 'Utilisateur modifié' : 'Utilisateur créé', severity: 'success' })
      setTimeout(() => navigate('/utilisateurs'), 1500)
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
        <Typography variant="h4" fontWeight="bold" sx={{ color: COMPANY_COLORS.darkCyan }}>
          {isEditMode ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/utilisateurs')} startIcon={<CancelIcon />} sx={{ borderColor: COMPANY_COLORS.darkCyan, color: COMPANY_COLORS.darkCyan }}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting} startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, ${COMPANY_COLORS.vividOrange} 100%)` }}>
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="Informations générales" />
        <Tab label="Informations professionnelles" />
        <Tab label="Sécurité" />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}><CardContent>
              <Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600 }}>Identité</Typography><Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Email *" name="email" type="email" value={formData.email} onChange={handleInputChange} required /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Nom d'utilisateur" name="username" value={formData.username} onChange={handleInputChange} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Téléphone" name="phone" value={formData.phone} onChange={handleInputChange} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Adresse" name="address" value={formData.address} onChange={handleInputChange} multiline rows={2} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Ville" name="city" value={formData.city} onChange={handleInputChange} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Code postal" name="postal_code" value={formData.postal_code} onChange={handleInputChange} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Pays" name="country" value={formData.country} onChange={handleInputChange} /></Grid>
              </Grid>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}><CardContent>
              <Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600 }}>Photo de profil</Typography><Divider sx={{ mb: 2 }} />
              <Box display="flex" flexDirection="column" alignItems="center">
                {imagePreview ? <Avatar src={imagePreview} variant="rounded" sx={{ width: 200, height: 200, mb: 2 }} /> :
                  <Avatar variant="rounded" sx={{ width: 200, height: 200, bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.05), mb: 2, border: `2px dashed ${alpha(COMPANY_COLORS.vividOrange, 0.3)}` }}>
                    <PersonIcon sx={{ fontSize: 60, color: COMPANY_COLORS.darkCyan }} />
                  </Avatar>}
                <Button variant="outlined" component="label" startIcon={<UploadIcon />} sx={{ borderColor: COMPANY_COLORS.vividOrange, color: COMPANY_COLORS.vividOrange }}>
                  {formData.profile_picture ? 'Changer' : 'Ajouter'}<input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
              </Box>
            </CardContent></Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}><CardContent>
              <Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600 }}>Informations professionnelles</Typography><Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Rôle</InputLabel><Select name="role" value={formData.role} label="Rôle" onChange={handleInputChange}>{ROLE_CHOICES.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Département</InputLabel><Select name="department" value={formData.department} label="Département" onChange={handleInputChange}><MenuItem value="">Aucun</MenuItem>{DEPARTMENT_CHOICES.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="ID Employé" name="employee_id" value={formData.employee_id} onChange={handleInputChange} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Date d'embauche" name="hire_date" type="date" value={formData.hire_date} onChange={handleInputChange} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Type de contrat" name="contract_type" value={formData.contract_type} onChange={handleInputChange} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Salaire" name="salary" type="number" value={formData.salary} onChange={handleInputChange} InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }} /></Grid>
                <Grid item xs={12}><FormControlLabel control={<Switch checked={formData.is_active} onChange={handleInputChange} name="is_active" color="success" />} label="Compte actif" /></Grid>
              </Grid>
            </CardContent></Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}><CardContent>
              <Typography variant="h6" sx={{ color: COMPANY_COLORS.darkCyan, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}><PasswordIcon /> Mot de passe</Typography><Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth label={isEditMode ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe *"} name="password" type="password" value={formData.password} onChange={handleInputChange} required={!isEditMode} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Confirmer le mot de passe" name="password_confirm" type="password" value={formData.password_confirm} onChange={handleInputChange} required={!isEditMode} /></Grid>
              </Grid>
            </CardContent></Card>
          </Grid>
        </Grid>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default UserForm