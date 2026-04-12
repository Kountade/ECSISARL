import React, { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Fab,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  alpha,
  Paper,
  Avatar,
  Link,
  Stack
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Business as BusinessIcon,
  Language as WebsiteIcon
} from '@mui/icons-material'
import AxiosInstance from '../AxiosInstance'
import { useNavigate } from 'react-router-dom'

// Palette de couleurs ECSI SARL
const COMPANY_COLORS = {
  darkCyan: '#0A2647',
  vividOrange: '#C9A03D',
  lightCyan: '#E9F1FA',
  lightOrange: '#FDF6E3',
  white: '#FFFFFF'
}

const Brands = () => {
  const navigate = useNavigate()

  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const fetchData = () => {
    setLoading(true)
    AxiosInstance.get('/brands/')
      .then((res) => {
        setBrands(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setSnackbar({ open: true, message: 'Erreur de chargement', severity: 'error' })
        setLoading(false)
      })
  }

  useEffect(() => { fetchData() }, [])

  const handleDeleteBrand = async () => {
    if (!brandToDelete) return
    try {
      await AxiosInstance.delete(`/brands/${brandToDelete.id}/`)
      setSnackbar({ open: true, message: 'Marque supprimée', severity: 'success' })
      fetchData()
      setOpenDeleteDialog(false)
      setBrandToDelete(null)
    } catch (error) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' })
    }
  }

  const filteredBrands = brands.filter(b => {
    const search = searchTerm.toLowerCase()
    const name = (b.name || '').toLowerCase()
    const description = (b.description || '').toLowerCase()
    const matchesSearch = name.includes(search) || description.includes(search)
    const matchesActive = filterActive === '' || b.is_active === (filterActive === 'true')
    return matchesSearch && matchesActive
  })

  const paginatedBrands = filteredBrands.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

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
          <Typography variant="h3" fontWeight="bold" sx={{ 
            background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, ${COMPANY_COLORS.vividOrange} 100%)`, 
            backgroundClip: 'text', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            Marques
          </Typography>
          <Typography variant="h6" color="textSecondary">Gérez les marques de vos produits</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton onClick={fetchData} sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.1), color: COMPANY_COLORS.darkCyan }}>
            <RefreshIcon />
          </IconButton>
          <Fab onClick={() => navigate('/brands/nouveau')} sx={{ 
            background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, ${COMPANY_COLORS.vividOrange} 100%)`,
            color: COMPANY_COLORS.white
          }}>
            <AddIcon />
          </Fab>
        </Box>
      </Box>

      {/* Filtres */}
      <Card sx={{ mb: 3, p: 3, borderRadius: 3, boxShadow: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Rechercher par nom ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={filterActive}
                label="Statut"
                onChange={(e) => setFilterActive(e.target.value)}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="true">Actif</MenuItem>
                <MenuItem value="false">Inactif</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setFilterActive('')
                setSearchTerm('')
              }}
              sx={{ borderColor: COMPANY_COLORS.darkCyan, color: COMPANY_COLORS.darkCyan }}
            >
              <FilterIcon />
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Tableau des marques */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 2 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.06) }}>
              <TableRow>
                <TableCell width={60}>Logo</TableCell>
                <TableCell><Typography fontWeight="bold">Nom</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Description</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Site web</Typography></TableCell>
                <TableCell align="center"><Typography fontWeight="bold">Produits</Typography></TableCell>
                <TableCell align="center"><Typography fontWeight="bold">Statut</Typography></TableCell>
                <TableCell align="center"><Typography fontWeight="bold">Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBrands.map((brand) => (
                <TableRow key={brand.id} hover sx={{ '&:hover': { bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.02) } }}>
                  <TableCell>
                    {brand.logo ? (
                      <Avatar src={brand.logo} variant="rounded" sx={{ width: 40, height: 40 }} />
                    ) : (
                      <Avatar variant="rounded" sx={{ bgcolor: alpha(COMPANY_COLORS.vividOrange, 0.2), width: 40, height: 40 }}>
                        <BusinessIcon sx={{ color: COMPANY_COLORS.vividOrange }} />
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">{brand.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 250 }} noWrap>
                      {brand.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {brand.website ? (
                      <Link href={brand.website} target="_blank" rel="noopener" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.5,
                        color: COMPANY_COLORS.darkCyan,
                        textDecoration: 'none',
                        '&:hover': { color: COMPANY_COLORS.vividOrange }
                      }}>
                        <WebsiteIcon fontSize="small" />
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {brand.website.replace(/^https?:\/\//, '')}
                        </Typography>
                      </Link>
                    ) : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={brand.products_count || 0} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={brand.is_active ? 'Actif' : 'Inactif'}
                      color={brand.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Modifier">
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/brands/${brand.id}/modifier`)}
                          sx={{ 
                            bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.05), 
                            '&:hover': { bgcolor: COMPANY_COLORS.darkCyan, color: COMPANY_COLORS.white } 
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setBrandToDelete(brand)
                            setOpenDeleteDialog(true)
                          }}
                          sx={{ 
                            bgcolor: alpha('#f44336', 0.05), 
                            '&:hover': { bgcolor: '#f44336', color: COMPANY_COLORS.white } 
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedBrands.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <BusinessIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography color="textSecondary">Aucune marque trouvée</Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<AddIcon />} 
                        onClick={() => navigate('/brands/nouveau')} 
                        sx={{ mt: 2, borderColor: COMPANY_COLORS.vividOrange, color: COMPANY_COLORS.vividOrange }}
                      >
                        Créer une marque
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredBrands.length}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Card>

      {/* Dialog de confirmation suppression */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: alpha('#f44336', 0.1), width: 80, height: 80, mx: 'auto', mb: 2 }}>
            <DeleteIcon sx={{ fontSize: 48, color: '#f44336' }} />
          </Avatar>
          <Typography variant="h5" gutterBottom fontWeight="bold">Confirmer la suppression</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Voulez-vous vraiment supprimer la marque
          </Typography>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            "{brandToDelete?.name}" ?
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Cette action est irréversible. Les produits associés à cette marque pourraient être affectés.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">
            Annuler
          </Button>
          <Button onClick={handleDeleteBrand} variant="contained" color="error" startIcon={<DeleteIcon />}>
            Supprimer définitivement
          </Button>
        </DialogActions>
      </Dialog>

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

export default Brands