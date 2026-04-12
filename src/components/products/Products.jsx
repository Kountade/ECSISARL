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
  Avatar,
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
  Stack
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Inventory as InventoryIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon
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

const Products = () => {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const productTypes = {
    simple: 'Simple',
    variable: 'Variable',
    service: 'Service',
    digital: 'Numérique'
  }

  const formatNumber = (number) => {
    if (!number && number !== 0) return '0,00'
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number)
  }

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      AxiosInstance.get('/products/'),
      AxiosInstance.get('/categories/'),
      AxiosInstance.get('/brands/')
    ])
      .then(([prodRes, catRes, brandRes]) => {
        setProducts(prodRes.data)
        setCategories(catRes.data)
        setBrands(brandRes.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setSnackbar({ open: true, message: 'Erreur de chargement', severity: 'error' })
        setLoading(false)
      })
  }

  useEffect(() => { fetchData() }, [])

  const handleDeleteProduct = async () => {
    if (!productToDelete) return
    try {
      await AxiosInstance.delete(`/products/${productToDelete.id}/`)
      setSnackbar({ open: true, message: 'Produit supprimé', severity: 'success' })
      fetchData()
      setOpenDeleteDialog(false)
      setProductToDelete(null)
    } catch (error) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' })
    }
  }

  const filteredProducts = products.filter(p => {
    const search = searchTerm.toLowerCase()
    const name = (p.name || '').toLowerCase()
    const ref = (p.reference || '').toLowerCase()
    const barcode = (p.barcode || '').toLowerCase()
    const matchesSearch = name.includes(search) || ref.includes(search) || barcode.includes(search)
    const matchesCategory = !filterCategory || p.category === parseInt(filterCategory)
    const matchesBrand = !filterBrand || p.brand === parseInt(filterBrand)
    const matchesActive = filterActive === '' || p.is_active === (filterActive === 'true')
    return matchesSearch && matchesCategory && matchesBrand && matchesActive
  })

  const paginatedProducts = filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

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
            backgroundClip: 'text', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            Produits
          </Typography>
          <Typography variant="h6" color="textSecondary">Gérez votre catalogue produits</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton onClick={fetchData} sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.1), color: COMPANY_COLORS.darkCyan }}>
            <RefreshIcon />
          </IconButton>
          <Fab onClick={() => navigate('/produits/nouveau')} sx={{ 
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
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Rechercher par nom, référence, code-barres..."
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
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select value={filterCategory} label="Catégorie" onChange={(e) => setFilterCategory(e.target.value)}>
                <MenuItem value="">Toutes</MenuItem>
                {categories.map(cat => (<MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Marque</InputLabel>
              <Select value={filterBrand} label="Marque" onChange={(e) => setFilterBrand(e.target.value)}>
                <MenuItem value="">Toutes</MenuItem>
                {brands.map(brand => (<MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select value={filterActive} label="Statut" onChange={(e) => setFilterActive(e.target.value)}>
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="true">Actif</MenuItem>
                <MenuItem value="false">Inactif</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={0.5}>
            <Button fullWidth variant="outlined" onClick={() => { setFilterCategory(''); setFilterBrand(''); setFilterActive(''); setSearchTerm('') }}
              sx={{ borderColor: COMPANY_COLORS.darkCyan, color: COMPANY_COLORS.darkCyan }}>
              <FilterIcon />
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Tableau des produits */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 2 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.06) }}>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Référence</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Marque</TableCell>
                <TableCell align="right">Prix achat</TableCell>
                <TableCell align="right">Prix vente</TableCell>
                <TableCell align="center">Stock</TableCell>
                <TableCell align="center">Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    {product.main_image ? (
                      <Avatar src={product.main_image} variant="rounded" sx={{ width: 40, height: 40 }} />
                    ) : (
                      <Avatar variant="rounded" sx={{ bgcolor: alpha(COMPANY_COLORS.vividOrange, 0.2), width: 40, height: 40 }}>
                        <InventoryIcon sx={{ color: COMPANY_COLORS.vividOrange }} />
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">{product.reference}</Typography>
                    {product.barcode && <Typography variant="caption" color="textSecondary">{product.barcode}</Typography>}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{product.name}</Typography>
                    <Chip label={productTypes[product.product_type] || 'Simple'} size="small" sx={{ mt: 0.5 }} />
                  </TableCell>
                  <TableCell>{product.category_name}</TableCell>
                  <TableCell>{product.brand_name || '-'}</TableCell>
                  <TableCell align="right">{formatNumber(product.purchase_price)} €</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: COMPANY_COLORS.vividOrange }}>
                    {formatNumber(product.sale_price)} €
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                      <Typography variant="body2" fontWeight={product.is_low_stock ? 'bold' : 'normal'} color={product.is_low_stock ? 'warning.main' : 'text.primary'}>
                        {product.stock_quantity}
                      </Typography>
                      {product.is_low_stock && (
                        <Tooltip title="Stock faible">
                          <WarningIcon fontSize="small" color="warning" />
                        </Tooltip>
                      )}
                    </Stack>
                    <Typography variant="caption" color="textSecondary">{product.unit_abbrev}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={product.is_active ? 'Actif' : 'Inactif'} color={product.is_active ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Voir détails">
                        <IconButton size="small" onClick={() => navigate(`/produits/${product.id}`)} sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.05), '&:hover': { bgcolor: COMPANY_COLORS.darkCyan, color: COMPANY_COLORS.white } }}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => navigate(`/produits/${product.id}/modifier`)} sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.05), '&:hover': { bgcolor: COMPANY_COLORS.darkCyan, color: COMPANY_COLORS.white } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" color="error" onClick={() => { setProductToDelete(product); setOpenDeleteDialog(true) }} sx={{ bgcolor: alpha('#f44336', 0.05), '&:hover': { bgcolor: '#f44336', color: COMPANY_COLORS.white } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <InventoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography color="textSecondary">Aucun produit trouvé</Typography>
                      <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/produits/nouveau')} sx={{ mt: 2, borderColor: COMPANY_COLORS.vividOrange, color: COMPANY_COLORS.vividOrange }}>
                        Créer un produit
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
          count={filteredProducts.length}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Card>

      {/* Dialog suppression */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: alpha('#f44336', 0.1), width: 80, height: 80, mx: 'auto', mb: 2 }}>
            <DeleteIcon sx={{ fontSize: 48, color: '#f44336' }} />
          </Avatar>
          <Typography variant="h5" gutterBottom fontWeight="bold">Confirmer la suppression</Typography>
          <Typography variant="body1">Supprimer le produit "{productToDelete?.name}" (réf: {productToDelete?.reference}) ?</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">Annuler</Button>
          <Button onClick={handleDeleteProduct} variant="contained" color="error" startIcon={<DeleteIcon />}>Supprimer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default Products