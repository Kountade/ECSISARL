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
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Category as CategoryIcon,
  Visibility as ViewIcon
} from '@mui/icons-material'
import AxiosInstance from '../AxiosInstance'
import { useNavigate } from 'react-router-dom'

const Categories = () => {
  const navigate = useNavigate()
  const darkCayn = '#003C3f'
  const vividOrange = '#DA4A0E'

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const fetchData = () => {
    setLoading(true)
    AxiosInstance.get('/categories/')
      .then((res) => {
        setCategories(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setSnackbar({ open: true, message: 'Erreur de chargement', severity: 'error' })
        setLoading(false)
      })
  }

  useEffect(() => { fetchData() }, [])

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return
    try {
      await AxiosInstance.delete(`/categories/${categoryToDelete.id}/`)
      setSnackbar({ open: true, message: 'Catégorie supprimée', severity: 'success' })
      fetchData()
      setOpenDeleteDialog(false)
      setCategoryToDelete(null)
    } catch (error) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' })
    }
  }

  const filteredCategories = categories.filter(c => {
    const search = searchTerm.toLowerCase()
    const name = (c.name || '').toLowerCase()
    const description = (c.description || '').toLowerCase()
    const matchesSearch = name.includes(search) || description.includes(search)
    const matchesActive = filterActive === '' || c.is_active === (filterActive === 'true')
    return matchesSearch && matchesActive
  })

  const paginatedCategories = filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

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
        <Box>
          <Typography variant="h3" fontWeight="bold" sx={{ background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Catégories
          </Typography>
          <Typography variant="h6" color="textSecondary">Organisez vos produits par catégories</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton onClick={fetchData} sx={{ bgcolor: alpha(darkCayn, 0.1), color: darkCayn }}>
            <RefreshIcon />
          </IconButton>
          <Fab onClick={() => navigate('/categories/nouveau')} sx={{ background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)` }}>
            <AddIcon />
          </Fab>
        </Box>
      </Box>

      {/* Filtres */}
      <Card sx={{ mb: 3, p: 3, borderRadius: 3 }}>
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
            >
              <FilterIcon />
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Tableau des catégories */}
      <Card sx={{ borderRadius: 3 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: alpha(darkCayn, 0.04) }}>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Catégorie parente</TableCell>
                <TableCell align="center">Produits</TableCell>
                <TableCell align="center">Sous-catégories</TableCell>
                <TableCell align="center">Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCategories.map((category) => (
                <TableRow key={category.id} hover>
                  <TableCell>
                    {category.image ? (
                      <Avatar src={category.image} variant="rounded" sx={{ width: 40, height: 40 }} />
                    ) : (
                      <Avatar variant="rounded" sx={{ bgcolor: alpha(vividOrange, 0.2), width: 40, height: 40 }}>
                        <CategoryIcon sx={{ color: vividOrange }} />
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">{category.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 250 }} noWrap>
                      {category.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {category.parent ? category.parent_name || `ID: ${category.parent}` : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={category.products_count || 0} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={category.subcategories_count || 0} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={category.is_active ? 'Actif' : 'Inactif'}
                      color={category.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => navigate(`/categories/${category.id}/modifier`)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setCategoryToDelete(category)
                          setOpenDeleteDialog(true)
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography color="textSecondary">Aucune catégorie trouvée</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredCategories.length}
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
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <DeleteIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>Confirmer la suppression</Typography>
          <Typography variant="body1">
            Supprimer la catégorie "{categoryToDelete?.name}" ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button onClick={handleDeleteCategory} variant="contained" color="error">Supprimer</Button>
        </DialogActions>
      </Dialog>

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

export default Categories