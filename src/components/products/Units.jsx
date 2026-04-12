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
  Scale as WeightIcon,
  Opacity as VolumeIcon,
  SquareFoot as AreaIcon,
  Straighten as LengthIcon,
  Inventory as PieceIcon,
  AccessTime as TimeIcon,
  Grid3x3 as PackageIcon,
  AcUnit as TemperatureIcon
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

const Units = () => {
  const navigate = useNavigate()

  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Statistiques
  const [stats, setStats] = useState({ total: 0, weightUnits: 0, volumeUnits: 0, pieceUnits: 0 })

  // Fonction pour déterminer l'icône et la couleur selon le type d'unité
  const getUnitIconAndColor = (name, abbreviation) => {
    const lowerName = (name || '').toLowerCase()
    const lowerAbbr = (abbreviation || '').toLowerCase()

    if (lowerAbbr.includes('kg') || lowerAbbr.includes('g') || lowerName.includes('kilo') || lowerName.includes('gramme') || lowerName.includes('poids') || lowerName.includes('masse')) {
      return { icon: WeightIcon, color: '#1976D2' } // Bleu poids
    }
    if (lowerAbbr.includes('l') || lowerAbbr.includes('ml') || lowerAbbr.includes('cl') || lowerName.includes('litre') || lowerName.includes('volume')) {
      return { icon: VolumeIcon, color: COMPANY_COLORS.darkCyan } // Bleu nuit
    }
    if (lowerAbbr.includes('m') && !lowerAbbr.includes('m²') && !lowerAbbr.includes('m³') || lowerAbbr.includes('cm') || lowerAbbr.includes('mm') || lowerAbbr.includes('km') || lowerName.includes('mètre') || lowerName.includes('longueur')) {
      return { icon: LengthIcon, color: COMPANY_COLORS.vividOrange } // Or
    }
    if (lowerAbbr.includes('m²') || lowerAbbr.includes('m2') || lowerName.includes('surface') || lowerName.includes('aire')) {
      return { icon: AreaIcon, color: '#2E7D32' } // Vert
    }
    if (lowerAbbr.includes('pcs') || lowerAbbr.includes('pc') || lowerAbbr.includes('unité') || lowerName.includes('pièce') || lowerName.includes('unité')) {
      return { icon: PieceIcon, color: COMPANY_COLORS.vividOrange } // Or
    }
    if (lowerAbbr.includes('h') || lowerAbbr.includes('min') || lowerName.includes('heure') || lowerName.includes('temps')) {
      return { icon: TimeIcon, color: '#9C27B0' } // Violet
    }
    if (lowerName.includes('température') || lowerAbbr.includes('°c') || lowerAbbr.includes('°f')) {
      return { icon: TemperatureIcon, color: '#F44336' } // Rouge
    }
    return { icon: PackageIcon, color: '#607D8B' } // Gris par défaut
  }

  const getUnitCategory = (name, abbreviation) => {
    const lowerName = (name || '').toLowerCase()
    const lowerAbbr = (abbreviation || '').toLowerCase()

    if (lowerAbbr.includes('kg') || lowerAbbr.includes('g') || lowerName.includes('kilo') || lowerName.includes('gramme') || lowerName.includes('poids') || lowerName.includes('masse')) {
      return { label: 'Poids / Masse', color: '#1976D2' }
    }
    if (lowerAbbr.includes('l') || lowerAbbr.includes('ml') || lowerAbbr.includes('cl') || lowerName.includes('litre') || lowerName.includes('volume')) {
      return { label: 'Volume / Capacité', color: COMPANY_COLORS.darkCyan }
    }
    if (lowerAbbr.includes('m') && !lowerAbbr.includes('m²') && !lowerAbbr.includes('m³') || lowerAbbr.includes('cm') || lowerAbbr.includes('mm') || lowerName.includes('mètre') || lowerName.includes('longueur')) {
      return { label: 'Longueur / Distance', color: COMPANY_COLORS.vividOrange }
    }
    if (lowerAbbr.includes('m²') || lowerAbbr.includes('m2') || lowerName.includes('surface') || lowerName.includes('aire')) {
      return { label: 'Surface / Aire', color: '#2E7D32' }
    }
    if (lowerAbbr.includes('pcs') || lowerAbbr.includes('pc') || lowerAbbr.includes('unité') || lowerName.includes('pièce') || lowerName.includes('unité')) {
      return { label: 'Quantité / Pièce', color: COMPANY_COLORS.vividOrange }
    }
    if (lowerAbbr.includes('h') || lowerAbbr.includes('min') || lowerName.includes('heure') || lowerName.includes('temps')) {
      return { label: 'Temps / Durée', color: '#9C27B0' }
    }
    return { label: 'Autre', color: '#607D8B' }
  }

  const fetchData = () => {
    setLoading(true)
    AxiosInstance.get('/units/')
      .then((res) => {
        const data = res.data
        setUnits(data)
        
        let weightCount = 0, volumeCount = 0, pieceCount = 0
        data.forEach(u => {
          const lowerName = (u.name || '').toLowerCase()
          const lowerAbbr = (u.abbreviation || '').toLowerCase()
          if (lowerAbbr.includes('kg') || lowerAbbr.includes('g') || lowerName.includes('kilo') || lowerName.includes('gramme')) weightCount++
          else if (lowerAbbr.includes('l') || lowerAbbr.includes('ml') || lowerName.includes('litre')) volumeCount++
          else if (lowerAbbr.includes('pcs') || lowerAbbr.includes('pc') || lowerName.includes('pièce')) pieceCount++
        })
        setStats({
          total: data.length,
          weightUnits: weightCount,
          volumeUnits: volumeCount,
          pieceUnits: pieceCount
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setSnackbar({ open: true, message: 'Erreur de chargement', severity: 'error' })
        setLoading(false)
      })
  }

  useEffect(() => { fetchData() }, [])

  const handleDeleteUnit = async () => {
    if (!unitToDelete) return
    try {
      await AxiosInstance.delete(`/units/${unitToDelete.id}/`)
      setSnackbar({ open: true, message: 'Unité supprimée', severity: 'success' })
      fetchData()
      setOpenDeleteDialog(false)
      setUnitToDelete(null)
    } catch (error) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' })
    }
  }

  const filteredUnits = units.filter(u => {
    const search = searchTerm.toLowerCase()
    const name = (u.name || '').toLowerCase()
    const abbreviation = (u.abbreviation || '').toLowerCase()
    return name.includes(search) || abbreviation.includes(search)
  })

  const paginatedUnits = filteredUnits.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

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
            Unités de mesure
          </Typography>
          <Typography variant="h6" color="textSecondary">Gérez les unités physiques et commerciales</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton onClick={fetchData} sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.1), color: COMPANY_COLORS.darkCyan }}>
            <RefreshIcon />
          </IconButton>
          <Fab onClick={() => navigate('/units/nouveau')} sx={{ 
            background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, ${COMPANY_COLORS.vividOrange} 100%)`,
            color: COMPANY_COLORS.white
          }}>
            <AddIcon />
          </Fab>
        </Box>
      </Box>

      {/* Cartes statistiques */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: `4px solid ${COMPANY_COLORS.darkCyan}`, boxShadow: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="textSecondary">Total unités</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.1), width: 56, height: 56 }}>
                <PackageIcon sx={{ color: COMPANY_COLORS.darkCyan, fontSize: 32 }} />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: `4px solid #1976D2`, boxShadow: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="textSecondary">Unités de poids</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.weightUnits}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha('#1976D2', 0.1), width: 56, height: 56 }}>
                <WeightIcon sx={{ color: '#1976D2', fontSize: 32 }} />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: `4px solid ${COMPANY_COLORS.darkCyan}`, boxShadow: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="textSecondary">Unités de volume</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.volumeUnits}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.1), width: 56, height: 56 }}>
                <VolumeIcon sx={{ color: COMPANY_COLORS.darkCyan, fontSize: 32 }} />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: `4px solid ${COMPANY_COLORS.vividOrange}`, boxShadow: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="textSecondary">Unités de pièce</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.pieceUnits}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha(COMPANY_COLORS.vividOrange, 0.1), width: 56, height: 56 }}>
                <PieceIcon sx={{ color: COMPANY_COLORS.vividOrange, fontSize: 32 }} />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barre de recherche */}
      <Card sx={{ mb: 3, p: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={10}>
            <TextField
              fullWidth
              placeholder="Rechercher par nom ou abréviation..."
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
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="outlined" onClick={() => setSearchTerm('')} sx={{ borderColor: COMPANY_COLORS.darkCyan, color: COMPANY_COLORS.darkCyan }}>
              Réinitialiser
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Tableau des unités */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.06) }}>
              <TableRow>
                <TableCell width={60}></TableCell>
                <TableCell><Typography fontWeight="bold">Nom de l'unité</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Abréviation</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Catégorie</Typography></TableCell>
                <TableCell align="center"><Typography fontWeight="bold">Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUnits.map((unit) => {
                const { icon: IconComponent, color: iconColor } = getUnitIconAndColor(unit.name, unit.abbreviation)
                const category = getUnitCategory(unit.name, unit.abbreviation)
                return (
                  <TableRow key={unit.id} hover sx={{ '&:hover': { bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.02) } }}>
                    <TableCell>
                      <Avatar sx={{ bgcolor: alpha(iconColor, 0.1), width: 40, height: 40 }}>
                        <IconComponent sx={{ color: iconColor }} />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="500">{unit.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={unit.abbreviation} 
                        size="medium" 
                        sx={{ 
                          fontWeight: 'bold', 
                          bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.08), 
                          color: COMPANY_COLORS.darkCyan,
                          fontSize: '1rem',
                          px: 1
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={category.label} 
                        size="small" 
                        sx={{ 
                          bgcolor: alpha(category.color, 0.1), 
                          color: category.color,
                          fontWeight: 500,
                          border: `1px solid ${alpha(category.color, 0.3)}`
                        }} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Modifier">
                          <IconButton 
                            size="small" 
                            onClick={() => navigate(`/units/${unit.id}/modifier`)}
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
                              setUnitToDelete(unit)
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
                )
              })}
              {paginatedUnits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <PackageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography color="textSecondary">Aucune unité trouvée</Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<AddIcon />} 
                        onClick={() => navigate('/units/nouveau')} 
                        sx={{ mt: 2, borderColor: COMPANY_COLORS.vividOrange, color: COMPANY_COLORS.vividOrange }}
                      >
                        Créer une unité
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
          count={filteredUnits.length}
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
            Voulez-vous vraiment supprimer l'unité
          </Typography>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            "{unitToDelete?.name} ({unitToDelete?.abbreviation})" ?
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Cette action est irréversible. Les produits utilisant cette unité pourraient être affectés.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">
            Annuler
          </Button>
          <Button onClick={handleDeleteUnit} variant="contained" color="error" startIcon={<DeleteIcon />}>
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

export default Units