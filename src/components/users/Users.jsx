import React, { useEffect, useState } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, CircularProgress,
  Snackbar, Alert, Tooltip, Fab, InputAdornment, FormControl, InputLabel,
  Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, alpha, Paper, Avatar, Stack, Switch
} from '@mui/material'
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
  Refresh as RefreshIcon, FilterList as FilterIcon, Person as PersonIcon
} from '@mui/icons-material'
import AxiosInstance from '../AxiosInstance'
import { useNavigate } from 'react-router-dom'

const COMPANY_COLORS = {
  darkCyan: '#0A2647',
  vividOrange: '#C9A03D',
  lightCyan: '#E9F1FA',
  lightOrange: '#FDF6E3',
  white: '#FFFFFF'
}

const ROLE_LABELS = {
  super_admin: 'Administrateur général',
  commercial: 'Commercial'
}

const ROLE_COLORS = {
  super_admin: '#8B0000',
  commercial: '#1976D2'
}

const Users = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [togglingUserId, setTogglingUserId] = useState(null) // Pour l'état de chargement du switch

  const fetchData = () => {
    setLoading(true)
    AxiosInstance.get('/users/')
      .then(res => { setUsers(res.data); setLoading(false) })
      .catch(err => {
        console.error(err)
        setSnackbar({ open: true, message: 'Erreur de chargement', severity: 'error' })
        setLoading(false)
      })
  }

  useEffect(() => { fetchData() }, [])

  const handleToggleActive = async (user) => {
    setTogglingUserId(user.id)
    try {
      const newStatus = !user.is_active
      await AxiosInstance.patch(`/users/${user.id}/`, { is_active: newStatus })
      
      // Mise à jour locale du state
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u)
      )
      
      setSnackbar({ 
        open: true, 
        message: `Utilisateur ${newStatus ? 'activé' : 'désactivé'}`, 
        severity: 'success' 
      })
    } catch (error) {
      console.error(error)
      setSnackbar({ 
        open: true, 
        message: 'Erreur lors du changement de statut', 
        severity: 'error' 
      })
    } finally {
      setTogglingUserId(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    try {
      await AxiosInstance.delete(`/users/${userToDelete.id}/`)
      setSnackbar({ open: true, message: 'Utilisateur supprimé', severity: 'success' })
      fetchData()
      setOpenDeleteDialog(false)
      setUserToDelete(null)
    } catch (error) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' })
    }
  }

  const filteredUsers = users.filter(u => {
    const search = searchTerm.toLowerCase()
    const email = (u.email || '').toLowerCase()
    const username = (u.username || '').toLowerCase()
    const matchesSearch = email.includes(search) || username.includes(search)
    const matchesRole = !filterRole || u.role === filterRole
    const matchesActive = filterActive === '' || u.is_active === (filterActive === 'true')
    return matchesSearch && matchesRole && matchesActive
  })

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

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
          <Typography variant="h3" fontWeight="bold" sx={{
            background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, ${COMPANY_COLORS.vividOrange} 100%)`,
            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Utilisateurs
          </Typography>
          <Typography variant="h6" color="textSecondary">Gérez les comptes et les accès</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton onClick={fetchData} sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.1), color: COMPANY_COLORS.darkCyan }}>
            <RefreshIcon />
          </IconButton>
          <Fab onClick={() => navigate('/utilisateurs/nouveau')} sx={{
            background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, ${COMPANY_COLORS.vividOrange} 100%)`,
            color: COMPANY_COLORS.white
          }}>
            <AddIcon />
          </Fab>
        </Box>
      </Box>

      <Card sx={{ mb: 3, p: 3, borderRadius: 3, boxShadow: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField fullWidth placeholder="Rechercher par email ou nom..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Rôle</InputLabel>
              <Select value={filterRole} label="Rôle" onChange={(e) => setFilterRole(e.target.value)}>
                <MenuItem value="">Tous</MenuItem>
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select value={filterActive} label="Statut" onChange={(e) => setFilterActive(e.target.value)}>
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="true">Actif</MenuItem>
                <MenuItem value="false">Inactif</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={1}>
            <Button fullWidth variant="outlined" onClick={() => { setFilterRole(''); setFilterActive(''); setSearchTerm('') }}
              sx={{ borderColor: COMPANY_COLORS.darkCyan, color: COMPANY_COLORS.darkCyan }}>
              <FilterIcon />
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 2 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.06) }}>
              <TableRow>
                <TableCell>Photo</TableCell>
                <TableCell>Email / Nom</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Département</TableCell>
                <TableCell align="center">Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map(user => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    {user.profile_picture ? (
                      <Avatar src={user.profile_picture} sx={{ width: 40, height: 40 }} />
                    ) : (
                      <Avatar sx={{ bgcolor: alpha(ROLE_COLORS[user.role] || COMPANY_COLORS.darkCyan, 0.2), width: 40, height: 40 }}>
                        <PersonIcon sx={{ color: ROLE_COLORS[user.role] || COMPANY_COLORS.darkCyan }} />
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">{user.email}</Typography>
                    <Typography variant="caption" color="textSecondary">{user.username || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={ROLE_LABELS[user.role] || user.role} size="small"
                      sx={{ bgcolor: alpha(ROLE_COLORS[user.role] || COMPANY_COLORS.darkCyan, 0.1), color: ROLE_COLORS[user.role] || COMPANY_COLORS.darkCyan, fontWeight: 500 }} />
                  </TableCell>
                  <TableCell>{user.department || '-'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title={user.is_active ? 'Désactiver' : 'Activer'}>
                      <Switch
                        checked={user.is_active}
                        onChange={() => handleToggleActive(user)}
                        disabled={togglingUserId === user.id}
                        color="success"
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => navigate(`/utilisateurs/${user.id}/modifier`)}
                          sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.05), '&:hover': { bgcolor: COMPANY_COLORS.darkCyan, color: COMPANY_COLORS.white } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" color="error" onClick={() => { setUserToDelete(user); setOpenDeleteDialog(true) }}
                          sx={{ bgcolor: alpha('#f44336', 0.05), '&:hover': { bgcolor: '#f44336', color: COMPANY_COLORS.white } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedUsers.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Box textAlign="center"><PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography color="textSecondary">Aucun utilisateur trouvé</Typography>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/utilisateurs/nouveau')}
                      sx={{ mt: 2, borderColor: COMPANY_COLORS.vividOrange, color: COMPANY_COLORS.vividOrange }}>
                      Créer un utilisateur
                    </Button>
                  </Box>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={filteredUsers.length} page={page} onPageChange={(e, p) => setPage(p)}
          rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
          labelRowsPerPage="Lignes par page:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`} />
      </Card>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: alpha('#f44336', 0.1), width: 80, height: 80, mx: 'auto', mb: 2 }}>
            <DeleteIcon sx={{ fontSize: 48, color: '#f44336' }} />
          </Avatar>
          <Typography variant="h5" gutterBottom fontWeight="bold">Confirmer la suppression</Typography>
          <Typography variant="body1">Supprimer l'utilisateur "{userToDelete?.email}" ?</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">Annuler</Button>
          <Button onClick={handleDeleteUser} variant="contained" color="error" startIcon={<DeleteIcon />}>Supprimer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default Users