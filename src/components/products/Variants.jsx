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
  Stack
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Category as VariantIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material'
import AxiosInstance from '../AxiosInstance'
import { useNavigate } from 'react-router-dom'

// Palette ECSI SARL
const COMPANY_COLORS = {
  darkCyan: '#0A2647',
  vividOrange: '#C9A03D',
  lightCyan: '#E9F1FA',
  lightOrange: '#FDF6E3',
  white: '#FFFFFF'
}

const Variants = () => {
  const navigate = useNavigate()

  const [variants, setVariants] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProduct, setFilterProduct] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [variantToDelete, setVariantToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const formatNumber = (number) => {
    if (!number && number !== 0) return '0,00'
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number)
  }

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      AxiosInstance.get('/variants/'),
      AxiosInstance.get('/products/')
    ])
      .then(([varRes, prodRes]) => {
        // Enrichir les variantes avec le nom du produit
        const variantsData = varRes.data
        const productsData = prodRes.data
        const productMap = {}
        productsData.forEach(p => { productMap[p.id] = p.name })

        const enrichedVariants = variantsData.map(v => ({
          ...v,
          product_name: productMap[v.product] || `Produit #${v.product}`
        }))
        setVariants(enrichedVariants)
        setProducts(productsData)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setSnackbar({ open: true, message: 'Erreur de chargement', severity: 'error' })
        setLoading(false)
      })
  }

  useEffect(() => { fetchData() }, [])

  const handleDeleteVariant = async () => {
    if (!variantToDelete) return
    try {
      await AxiosInstance.delete(`/variants/${variantToDelete.id}/`)
      setSnackbar({ open: true, message: 'Variante supprimée', severity: 'success' })
      fetchData()
      setOpenDeleteDialog(false)
      setVariantToDelete(null)
    } catch (error) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' })
    }
  }

  const filteredVariants = variants.filter(v => {
    const search = searchTerm.toLowerCase()
    const sku = (v.sku || '').toLowerCase()
    const productName = (v.product_name || '').toLowerCase()
    const matchesSearch = sku.includes(search) || productName.includes(search)
    const matchesProduct = !filterProduct || v.product === parseInt(filterProduct)
    const matchesActive = filterActive === '' || v.is_active === (filterActive === 'true')
    return matchesSearch && matchesProduct && matchesActive
  })

  const paginatedVariants = filteredVariants.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

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
            Variantes de produits
          </Typography>
          <Typography variant="h6" color="textSecondary">Gérez les déclinaisons (tailles, couleurs, etc.)</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton onClick={fetchData} sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.1), color: COMPANY_COLORS.darkCyan }}>
            <RefreshIcon />
          </IconButton>
          <Fab onClick={() => navigate('/variants/nouveau')} sx={{
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
              placeholder="Rechercher par SKU ou produit..."
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
              <InputLabel>Produit</InputLabel>
              <Select
                value={filterProduct}
                label="Produit"
                onChange={(e) => setFilterProduct(e.target.value)}
              >
                <MenuItem value="">Tous</MenuItem>
                {products.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => { setFilterProduct(''); setFilterActive(''); setSearchTerm('') }}
              sx={{ borderColor: COMPANY_COLORS.darkCyan, color: COMPANY_COLORS.darkCyan }}
            >
              <FilterIcon />
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Tableau des variantes */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 2 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.06) }}>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Produit</TableCell>
                <TableCell>Attributs</TableCell>
                <TableCell align="right">Prix achat</TableCell>
                <TableCell align="right">Prix vente</TableCell>
                <TableCell align="center">Stock</TableCell>
                <TableCell align="center">Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedVariants.map((variant) => (
                <TableRow key={variant.id} hover>
                  <TableCell>
                    {variant.image ? (
                      <Avatar src={variant.image} variant="rounded" sx={{ width: 40, height: 40 }} />
                    ) : (
                      <Avatar variant="rounded" sx={{ bgcolor: alpha(COMPANY_COLORS.vividOrange, 0.2), width: 40, height: 40 }}>
                        <VariantIcon sx={{ color: COMPANY_COLORS.vividOrange }} />
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">{variant.sku}</Typography>
                  </TableCell>
                  <TableCell>{variant.product_name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {Object.entries(variant.attributes || {}).map(([key, val]) => (
                        <Chip key={key} label={`${key}: ${val}`} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{formatNumber(variant.purchase_price)} €</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: COMPANY_COLORS.vividOrange }}>
                    {formatNumber(variant.sale_price)} €
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={variant.stock_quantity === 0 ? 'bold' : 'normal'} color={variant.stock_quantity === 0 ? 'error' : 'text.primary'}>
                      {variant.stock_quantity}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={variant.is_active ? 'Actif' : 'Inactif'}
                      color={variant.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/variants/${variant.id}/modifier`)}
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
                            setVariantToDelete(variant)
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
              {paginatedVariants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <VariantIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography color="textSecondary">Aucune variante trouvée</Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/variants/nouveau')}
                        sx={{ mt: 2, borderColor: COMPANY_COLORS.vividOrange, color: COMPANY_COLORS.vividOrange }}
                      >
                        Créer une variante
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
          count={filteredVariants.length}
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

      {/* Dialog suppression */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: alpha('#f44336', 0.1), width: 80, height: 80, mx: 'auto', mb: 2 }}>
            <DeleteIcon sx={{ fontSize: 48, color: '#f44336' }} />
          </Avatar>
          <Typography variant="h5" gutterBottom fontWeight="bold">Confirmer la suppression</Typography>
          <Typography variant="body1">
            Supprimer la variante "{variantToDelete?.sku}" ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">Annuler</Button>
          <Button onClick={handleDeleteVariant} variant="contained" color="error" startIcon={<DeleteIcon />}>Supprimer</Button>
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

export default Variants