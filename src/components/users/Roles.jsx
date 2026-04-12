import React, { useState } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Chip, alpha, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Divider, Avatar, Stack, Alert
} from '@mui/material'
import {
  Security as SecurityIcon, AdminPanelSettings as AdminIcon, Person as PersonIcon,
  CheckCircle as CheckIcon, Cancel as CancelIcon
} from '@mui/icons-material'

const COMPANY_COLORS = {
  darkCyan: '#0A2647',
  vividOrange: '#C9A03D',
  lightCyan: '#E9F1FA',
  lightOrange: '#FDF6E3',
  white: '#FFFFFF'
}

const ROLES = [
  {
    id: 'super_admin',
    name: 'Administrateur général',
    description: 'Accès complet à toutes les fonctionnalités du système',
    color: '#8B0000',
    icon: <AdminIcon />,
    permissions: [
      { name: 'Gérer les utilisateurs', granted: true },
      { name: 'Gérer les rôles et permissions', granted: true },
      { name: 'Voir les rapports', granted: true },
      { name: 'Valider les commandes', granted: true },
      { name: 'Gérer l\'inventaire', granted: true },
      { name: 'Accéder à toutes les sections', granted: true },
    ]
  },
  {
    id: 'commercial',
    name: 'Commercial',
    description: 'Accès aux fonctions de vente et de relation client',
    color: '#1976D2',
    icon: <PersonIcon />,
    permissions: [
      { name: 'Gérer les utilisateurs', granted: false },
      { name: 'Gérer les rôles et permissions', granted: false },
      { name: 'Voir les rapports', granted: true },
      { name: 'Valider les commandes', granted: false },
      { name: 'Gérer l\'inventaire', granted: false },
      { name: 'Accéder aux ventes et clients', granted: true },
    ]
  }
]

const Roles = () => {
  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight="bold" sx={{
          background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, ${COMPANY_COLORS.vividOrange} 100%)`,
          backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Rôles & Permissions
        </Typography>
        <Typography variant="h6" color="textSecondary">Définissez les accès pour chaque type d'utilisateur</Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        Les permissions sont définies au niveau du code. Contactez l'administrateur système pour toute modification.
      </Alert>

      <Grid container spacing={3}>
        {ROLES.map(role => (
          <Grid item xs={12} md={6} key={role.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(role.color, 0.2), width: 56, height: 56 }}>
                    {React.cloneElement(role.icon, { sx: { color: role.color, fontSize: 32 } })}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: role.color }}>{role.name}</Typography>
                    <Typography variant="body2" color="textSecondary">{role.description}</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Permissions associées</Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(COMPANY_COLORS.darkCyan, 0.04) }}>
                        <TableCell>Permission</TableCell>
                        <TableCell align="center">Accès</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {role.permissions.map((perm, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{perm.name}</TableCell>
                          <TableCell align="center">
                            {perm.granted ? 
                              <CheckIcon color="success" fontSize="small" /> : 
                              <CancelIcon color="error" fontSize="small" />}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default Roles