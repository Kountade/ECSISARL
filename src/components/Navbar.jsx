import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

// Icônes Material-UI
import DashboardIcon from '@mui/icons-material/Dashboard';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import GroupIcon from '@mui/icons-material/Group';
import MovingIcon from '@mui/icons-material/Moving';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BuildIcon from '@mui/icons-material/Build';
import HandshakeIcon from '@mui/icons-material/Handshake';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventNoteIcon from '@mui/icons-material/EventNote';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SecurityIcon from '@mui/icons-material/Security';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StraightenIcon from '@mui/icons-material/Straighten';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

import logo from '../assets/logo.svg';
import AxiosInstance from './AxiosInstance';

const drawerWidth = 280;

// Palette de couleurs
const COMPANY_COLORS = {
  darkCyan: '#0A2647',
  vividOrange: '#C9A03D',
  black: '#000000',
  white: '#FFFFFF',
  lightCyan: '#E9F1FA',
  lightOrange: '#FDF6E3'
};

// ✅ Configuration des rôles : uniquement super_admin et commercial
const ROLE_CONFIG = {
  super_admin: {
    label: 'Administrateur général',
    color: '#8B0000',
    icon: <SecurityIcon />,
    level: 100,
    description: 'Accès total au système'
  },
  commercial: {
    label: 'Commercial',
    color: '#1976D2',
    icon: <HandshakeIcon />,
    level: 60,
    description: 'Force de vente'
  }
};

export default function Navbar(props) {
  const { content, mode, toggleColorMode } = props;
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [userInitial, setUserInitial] = useState('');

  // Données de notification
  const [stocksFaibles, setStocksFaibles] = useState([]);
  const [ventesImpayees, setVentesImpayees] = useState([]);
  const [ventesRetard, setVentesRetard] = useState([]);
  const [commandesAApprouver, setCommandesAApprouver] = useState([]);
  const [absencesEnAttente, setAbsencesEnAttente] = useState([]);
  const [facturesEcheance, setFacturesEcheance] = useState([]);
  const [achatsALivrer, setAchatsALivrer] = useState([]);
  const [interventionsEnCours, setInterventionsEnCours] = useState([]);
  const [alertsCount, setAlertsCount] = useState(0);

  const getUserData = () => {
    try {
      const userData = localStorage.getItem('User');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  const user = getUserData();
  const userRole = user?.role || '';
  const userEmail = user?.email || '';
  const userName = user?.username || user?.first_name || userEmail?.split('@')[0] || 'Utilisateur';
  const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG.commercial; // fallback commercial

  useEffect(() => {
    if (userName) {
      setUserInitial(userName.charAt(0).toUpperCase());
    }
  }, [userName]);

  // Récupération des notifications selon le rôle
  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        // L'administrateur général voit tout, le commercial voit seulement les ventes
        const isSuperAdmin = userRole === 'super_admin';
        const isCommercial = userRole === 'commercial';

        if (isSuperAdmin) {
          // Stocks faibles
          const stocksRes = await AxiosInstance.get('/stock-movements/?low_stock=true').catch(() => ({ data: [] }));
          setStocksFaibles(stocksRes.data || []);
          // Commandes à approuver
          const cmdRes = await AxiosInstance.get('/sale-orders/?status=pending_approval').catch(() => ({ data: [] }));
          setCommandesAApprouver(cmdRes.data || []);
          // Absences
          const absRes = await AxiosInstance.get('/leaves/?status=pending').catch(() => ({ data: [] }));
          setAbsencesEnAttente(absRes.data || []);
          // Factures proches échéance
          const factRes = await AxiosInstance.get('/invoices/?due_soon=true').catch(() => ({ data: [] }));
          setFacturesEcheance(factRes.data || []);
          // Achats à livrer
          const achRes = await AxiosInstance.get('/purchase-orders/?status=confirmed').catch(() => ({ data: [] }));
          setAchatsALivrer(achRes.data || []);
          // Alertes achats
          const alertsRes = await AxiosInstance.get('/purchase-alerts/?is_active=true').catch(() => ({ data: [] }));
          setAlertsCount(alertsRes.data?.length || 0);
          // Interventions
          const intRes = await AxiosInstance.get('/technical/interventions/?status=in_progress').catch(() => ({ data: [] }));
          setInterventionsEnCours(intRes.data || []);
        }

        // Ventes impayées/retard : visible par les deux rôles
        const ventesImpRes = await AxiosInstance.get('/sale-orders/?payment_status=pending').catch(() => ({ data: [] }));
        setVentesImpayees(ventesImpRes.data || []);
        const ventesRetRes = await AxiosInstance.get('/sale-orders/?status=overdue').catch(() => ({ data: [] }));
        setVentesRetard(ventesRetRes.data || []);

      } catch (error) {
        console.error('Erreur chargement notifications:', error);
      }
    };

    if (userRole) {
      fetchAllNotifications();
    }
  }, [userRole]);

  const getNotificationCount = () => {
    let count = 0;
    if (stocksFaibles.length) count += stocksFaibles.length;
    if (ventesImpayees.length) count += ventesImpayees.length;
    if (ventesRetard.length) count += ventesRetard.length;
    if (commandesAApprouver.length) count += commandesAApprouver.length;
    if (absencesEnAttente.length) count += absencesEnAttente.length;
    if (facturesEcheance.length) count += facturesEcheance.length;
    if (achatsALivrer.length) count += achatsALivrer.length;
    if (interventionsEnCours.length) count += interventionsEnCours.length;
    if (alertsCount) count += alertsCount;
    return count;
  };

  // Permissions simplifiées
  const isSuperAdmin = () => userRole === 'super_admin';
  const isCommercial = () => userRole === 'commercial';

  const canViewDashboard = () => true;
  const canViewSales = () => true; // les deux rôles voient les ventes
  const canViewPurchases = () => isSuperAdmin(); // seul l'admin voit les achats
  const canViewInventory = () => isSuperAdmin(); // seul l'admin voit le stock
  const canViewHR = () => isSuperAdmin();
  const canViewAccounting = () => isSuperAdmin();
  const canViewCustomers = () => true; // les deux voient les clients
  const canViewSuppliers = () => isSuperAdmin();
  const canViewReports = () => isSuperAdmin(); // rapports avancés pour admin
  const canViewAdmin = () => isSuperAdmin();
  const canViewTechnical = () => isSuperAdmin();
  const canViewPOS = () => true; // point de vente accessible aux deux
  const canViewDeliveries = () => isSuperAdmin();

  const handleSectionToggle = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNotificationsOpen = (event) => setAnchorElNotifications(event.currentTarget);
  const handleNotificationsClose = () => setAnchorElNotifications(null);

  const logoutUser = () => {
    handleMenuClose();
    AxiosInstance.post(`logoutall/`, {})
      .then(() => {
        localStorage.removeItem('Token');
        localStorage.removeItem('User');
        navigate('/');
      })
      .catch(() => {
        localStorage.removeItem('Token');
        localStorage.removeItem('User');
        navigate('/');
      });
  };

  const notificationCount = getNotificationCount();

  // Structure des menus adaptée aux deux rôles
  const menuSections = [
    {
      name: 'TABLEAU DE BORD',
      icon: <DashboardIcon />,
      items: [
        { id: 'dashboard', text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', permission: canViewDashboard() }
      ]
    },
    {
      name: 'COMMERCIAL',
      icon: <HandshakeIcon />,
      permission: canViewSales() || canViewCustomers(),
      items: [
        { id: 'pos', text: 'Point de Vente', icon: <PointOfSaleIcon />, path: '/point-de-vente', permission: canViewPOS(), badge: 0 },
        { id: 'ventes', text: 'Ventes', icon: <ShoppingCartIcon />, path: '/ventes', permission: canViewSales(), badge: ventesImpayees.length + ventesRetard.length },
        { id: 'clients', text: 'Clients', icon: <PeopleIcon />, path: '/clients', permission: canViewCustomers() },
        { id: 'devis', text: 'Devis', icon: <RequestQuoteIcon />, path: '/devis', permission: canViewSales() },
        { id: 'factures', text: 'Factures', icon: <ReceiptIcon />, path: '/factures', permission: canViewSales() },
        { id: 'paiements', text: 'Paiements', icon: <CreditCardIcon />, path: '/paiements', permission: canViewSales() }
      ]
    },
    {
      name: 'ACHATS',
      icon: <ShoppingCartIcon />,
      permission: canViewPurchases() || canViewSuppliers(),
      items: [
        { id: 'fournisseurs', text: 'Fournisseurs', icon: <BusinessIcon />, path: '/fournisseurs', permission: canViewSuppliers() },
        { id: 'evaluations', text: 'Évaluations', icon: <AssessmentIcon />, path: '/supplier-evaluations', permission: canViewSuppliers() },
        { id: 'commandes', text: 'Commandes', icon: <RequestQuoteIcon />, path: '/commandes-fournisseurs', permission: canViewPurchases(), badge: achatsALivrer.length },
        { id: 'receptions', text: 'Réceptions', icon: <LocalShippingIcon />, path: '/purchase-receipts', permission: canViewPurchases() },
        { id: 'catalogue', text: 'Catalogue', icon: <LibraryBooksIcon />, path: '/supplier-catalogs', permission: canViewPurchases() },
        { id: 'prix', text: 'Historique prix', icon: <HistoryIcon />, path: '/price-history', permission: canViewPurchases() },
        { id: 'alertes', text: 'Alertes', icon: <WarningIcon />, path: '/purchase-alerts', permission: canViewPurchases(), badge: alertsCount }
      ]
    },
    {
      name: 'STOCK & LOGISTIQUE',
      icon: <InventoryIcon />,
      permission: canViewInventory() || canViewDeliveries(),
      items: [
        { id: 'categories', text: 'Catégories', icon: <CategoryIcon />, path: '/categories', permission: canViewInventory() },
        { id: 'produits', text: 'Produits', icon: <InventoryIcon />, path: '/produits', permission: canViewInventory() },
        { id: 'variants', text: 'Variantes', icon: <CategoryIcon />, path: '/variants', permission: canViewInventory() },
        { id: 'marques', text: 'Marques', icon: <BusinessIcon />, path: '/brands', permission: canViewInventory() },
        { id: 'unites', text: 'Unités', icon: <StraightenIcon />, path: '/units', permission: canViewInventory() },
        { id: 'reception', text: 'Réception stock', icon: <LocalShippingIcon />, path: '/stock-receipt', permission: canViewInventory() },
        { id: 'stocks', text: 'Stocks', icon: <InventoryIcon />, path: '/stocks', permission: canViewInventory(), badge: stocksFaibles.length },
        { id: 'entrepots', text: 'Entrepôts', icon: <WarehouseIcon />, path: '/entrepots', permission: canViewInventory() },
        { id: 'mouvements', text: 'Mouvements', icon: <MovingIcon />, path: '/mouvements-stock', permission: canViewInventory() },
        { id: 'transferts', text: 'Transferts', icon: <SwapHorizIcon />, path: '/transferts', permission: canViewInventory() },
        { id: 'inventaire', text: 'Inventaire', icon: <ChecklistIcon />, path: '/inventaire', permission: canViewInventory() },
        { id: 'livraisons', text: 'Livraisons', icon: <LocalShippingIcon />, path: '/livraisons', permission: canViewDeliveries() }
      ]
    },
    {
      name: 'ANALYSES & RAPPORTS',
      icon: <AssessmentIcon />,
      permission: canViewReports(),
      items: [
        { id: 'rapports-ventes', text: 'Rapports Ventes', icon: <BarChartIcon />, path: '/rapports-ventes', permission: canViewReports() },
        { id: 'rapports-financiers', text: 'Rapports Financiers', icon: <AssessmentIcon />, path: '/rapports-financiers', permission: canViewReports() },
        { id: 'statistiques', text: 'Statistiques', icon: <TrendingUpIcon />, path: '/statistiques', permission: canViewReports() },
        { id: 'kpi', text: 'Indicateurs', icon: <EventNoteIcon />, path: '/kpi', permission: isSuperAdmin() }
      ]
    },
    {
      name: 'ADMINISTRATION',
      icon: <SettingsIcon />,
      permission: canViewAdmin(),
      items: [
        { id: 'utilisateurs', text: 'Utilisateurs', icon: <ManageAccountsIcon />, path: '/utilisateurs', permission: canViewAdmin() },
        { id: 'roles', text: 'Rôles & Permissions', icon: <SecurityIcon />, path: '/roles', permission: isSuperAdmin() },
        { id: 'audit', text: 'Journal Audit', icon: <HistoryIcon />, path: '/audit', permission: canViewAdmin() },
        { id: 'parametres', text: 'Paramètres', icon: <SettingsIcon />, path: '/parametres', permission: canViewAdmin() }
      ]
    },
    {
      name: 'MON ESPACE',
      icon: <PersonIcon />,
      items: [
        { id: 'profile', text: 'Mon Profil', icon: <PersonIcon />, path: '/profile', permission: true }
      ]
    }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: COMPANY_COLORS.darkCyan,
          background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, #1A3A5F 100%)`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          borderBottom: `2px solid ${COMPANY_COLORS.vividOrange}`
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '70px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, '&:hover': { opacity: 0.9 } }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: '8px', backgroundColor: COMPANY_COLORS.white,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)', border: `2px solid ${COMPANY_COLORS.vividOrange}`
              }}>
                <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </Box>
              <Typography variant="h5" noWrap component="div" sx={{
                fontWeight: 900,
                background: `linear-gradient(90deg, ${COMPANY_COLORS.white} 0%, ${COMPANY_COLORS.lightCyan} 100%)`,
                backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                letterSpacing: '1px', textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontFamily: "'Montserrat', 'Roboto', sans-serif", fontSize: { xs: '1.2rem', sm: '1.5rem' }
              }}>
                GALSENSHOP ERP
              </Typography>
            </Box>
            <Tooltip title={roleConfig.description}>
              <Chip icon={roleConfig.icon} label={roleConfig.label} size="small" sx={{
                height: 28, fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: roleConfig.color,
                color: COMPANY_COLORS.white, boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.3)', '& .MuiChip-label': { px: 1.5 },
                '& .MuiChip-icon': { color: COMPANY_COLORS.white }
              }} />
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {notificationCount > 0 && (
              <Tooltip title="Notifications">
                <IconButton sx={{
                  color: COMPANY_COLORS.white, backgroundColor: 'rgba(255,255,255,0.15)',
                  '&:hover': { backgroundColor: COMPANY_COLORS.vividOrange, transform: 'scale(1.05)' },
                  transition: 'all 0.2s ease', mr: 1
                }} onClick={handleNotificationsOpen}>
                  <Badge badgeContent={notificationCount} color="error" sx={{
                    '& .MuiBadge-badge': { backgroundColor: COMPANY_COLORS.vividOrange, color: COMPANY_COLORS.white, fontWeight: 'bold' }
                  }}>
                    <WarningIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
            <Menu anchorEl={anchorElNotifications} open={Boolean(anchorElNotifications)} onClose={handleNotificationsClose}
              PaperProps={{ elevation: 4, sx: { mt: 1.5, width: 380, maxHeight: 500, borderRadius: '8px', border: `1px solid ${COMPANY_COLORS.darkCyan}`, overflow: 'auto' } }}>
              <MenuItem disabled sx={{ fontWeight: 'bold', color: COMPANY_COLORS.white, backgroundColor: COMPANY_COLORS.darkCyan, py: 1.5 }}>
                🔔 Notifications ({notificationCount})
              </MenuItem>
              {stocksFaibles.length > 0 && (
                <MenuItem onClick={() => { handleNotificationsClose(); navigate('/stocks?low_stock=true'); }} sx={{ py: 1.5 }}>
                  <ListItemIcon><InventoryIcon color="warning" /></ListItemIcon>
                  <ListItemText primary="Stocks faibles" secondary={`${stocksFaibles.length} produit(s) à réapprovisionner`} />
                </MenuItem>
              )}
              {ventesImpayees.length > 0 && (
                <MenuItem onClick={() => { handleNotificationsClose(); navigate('/ventes?payment_status=pending'); }} sx={{ py: 1.5 }}>
                  <ListItemIcon><MoneyOffIcon color="error" /></ListItemIcon>
                  <ListItemText primary="Ventes impayées" secondary={`${ventesImpayees.length} vente(s) en attente`} />
                </MenuItem>
              )}
              {ventesRetard.length > 0 && (
                <MenuItem onClick={() => { handleNotificationsClose(); navigate('/ventes?status=overdue'); }} sx={{ py: 1.5 }}>
                  <ListItemIcon><AccessTimeIcon color="error" /></ListItemIcon>
                  <ListItemText primary="Ventes en retard" secondary={`${ventesRetard.length} vente(s) en retard`} />
                </MenuItem>
              )}
              {commandesAApprouver.length > 0 && (
                <MenuItem onClick={() => { handleNotificationsClose(); navigate('/ventes?status=pending_approval'); }} sx={{ py: 1.5 }}>
                  <ListItemIcon><AssignmentIcon color="info" /></ListItemIcon>
                  <ListItemText primary="Commandes à approuver" secondary={`${commandesAApprouver.length} commande(s) en attente`} />
                </MenuItem>
              )}
              {absencesEnAttente.length > 0 && (
                <MenuItem onClick={() => { handleNotificationsClose(); navigate('/conges?status=pending'); }} sx={{ py: 1.5 }}>
                  <ListItemIcon><CalendarMonthIcon color="info" /></ListItemIcon>
                  <ListItemText primary="Demandes de congés" secondary={`${absencesEnAttente.length} demande(s) en attente`} />
                </MenuItem>
              )}
              {facturesEcheance.length > 0 && (
                <MenuItem onClick={() => { handleNotificationsClose(); navigate('/factures?due_soon=true'); }} sx={{ py: 1.5 }}>
                  <ListItemIcon><ReceiptIcon color="error" /></ListItemIcon>
                  <ListItemText primary="Factures proches échéance" secondary={`${facturesEcheance.length} facture(s) à payer`} />
                </MenuItem>
              )}
              {achatsALivrer.length > 0 && (
                <MenuItem onClick={() => { handleNotificationsClose(); navigate('/commandes-fournisseurs'); }} sx={{ py: 1.5 }}>
                  <ListItemIcon><LocalShippingIcon color="warning" /></ListItemIcon>
                  <ListItemText primary="Commandes à livrer" secondary={`${achatsALivrer.length} commande(s) en attente`} />
                </MenuItem>
              )}
              {alertsCount > 0 && (
                <MenuItem onClick={() => { handleNotificationsClose(); navigate('/purchase-alerts'); }} sx={{ py: 1.5 }}>
                  <ListItemIcon><WarningIcon color="error" /></ListItemIcon>
                  <ListItemText primary="Alertes achats" secondary={`${alertsCount} alerte(s) active(s)`} />
                </MenuItem>
              )}
              {interventionsEnCours.length > 0 && (
                <MenuItem onClick={() => { handleNotificationsClose(); navigate('/interventions?status=in_progress'); }} sx={{ py: 1.5 }}>
                  <ListItemIcon><BuildIcon color="info" /></ListItemIcon>
                  <ListItemText primary="Interventions en cours" secondary={`${interventionsEnCours.length} intervention(s) active(s)`} />
                </MenuItem>
              )}
            </Menu>
            <Tooltip title={mode === 'dark' ? 'Mode clair' : 'Mode sombre'}>
              <IconButton sx={{
                ml: 1, color: COMPANY_COLORS.white, backgroundColor: 'rgba(255,255,255,0.15)',
                '&:hover': { backgroundColor: COMPANY_COLORS.vividOrange, transform: 'scale(1.05)' }, transition: 'all 0.2s ease'
              }} onClick={toggleColorMode}>
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={`${userName} - ${roleConfig.label}`}>
              <IconButton onClick={handleMenuOpen} sx={{ p: 0, ml: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: roleConfig.color, fontSize: '1.1rem', fontWeight: 'bold', border: `2px solid ${COMPANY_COLORS.white}`, boxShadow: '0 3px 10px rgba(0,0,0,0.2)' }}>
                  {userInitial}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
              PaperProps={{ elevation: 4, sx: { overflow: 'visible', mt: 1.5, width: 340, borderRadius: '12px', border: `1px solid ${COMPANY_COLORS.darkCyan}` } }}>
              <MenuItem disabled sx={{ py: 2.5, backgroundColor: COMPANY_COLORS.darkCyan, color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Avatar sx={{ width: 50, height: 50, bgcolor: roleConfig.color }}>{userInitial}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">{userName}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>{userEmail}</Typography>
                    <Chip icon={roleConfig.icon} label={roleConfig.label} size="small" sx={{ mt: 0.5, bgcolor: roleConfig.color, color: 'white' }} />
                  </Box>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }} sx={{ py: 1.5 }}>
                <ListItemIcon><PersonIcon /></ListItemIcon> Mon profil
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard'); }} sx={{ py: 1.5 }}>
                <ListItemIcon><DashboardIcon /></ListItemIcon> Tableau de bord
              </MenuItem>
              {canViewAdmin() && (
                <MenuItem onClick={() => { handleMenuClose(); navigate('/parametres'); }} sx={{ py: 1.5 }}>
                  <ListItemIcon><SettingsIcon /></ListItemIcon> Paramètres
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={logoutUser} sx={{ py: 1.5, color: COMPANY_COLORS.vividOrange }}>
                <ListItemIcon><LogoutIcon sx={{ color: COMPANY_COLORS.vividOrange }} /></ListItemIcon>
                Déconnexion
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" sx={{
        width: drawerWidth, flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', backgroundColor: COMPANY_COLORS.white, borderRight: `2px solid ${COMPANY_COLORS.darkCyan}`, background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)' }
      }}>
        <Toolbar sx={{ minHeight: '70px' }} />
        <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
          <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: `2px solid ${COMPANY_COLORS.lightCyan}`, backgroundColor: COMPANY_COLORS.darkCyan, color: COMPANY_COLORS.white }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '6px', backgroundColor: COMPANY_COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
              <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>GALSENSHOP</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>{roleConfig.label}</Typography>
            </Box>
          </Box>
          <List sx={{ p: 1.5 }}>
            {menuSections.map((section, index) => {
              const visibleItems = section.items.filter(item => item.permission);
              if (visibleItems.length === 0) return null;
              return (
                <React.Fragment key={index}>
                  {index > 0 && <Divider sx={{ my: 2, borderColor: COMPANY_COLORS.lightCyan }} />}
                  <ListItemButton onClick={() => handleSectionToggle(section.name)} sx={{ px: 2, py: 1, '&:hover': { backgroundColor: COMPANY_COLORS.lightCyan } }}>
                    <ListItemIcon sx={{ color: COMPANY_COLORS.darkCyan, minWidth: 36 }}>{section.icon}</ListItemIcon>
                    <ListItemText primary={section.name} primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 'bold', color: COMPANY_COLORS.darkCyan, letterSpacing: '0.5px' }} />
                    {openSections[section.name] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={openSections[section.name]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {visibleItems.map((item) => (
                        <ListItem key={item.id} disablePadding sx={{ mb: 0.5, pl: 4 }}>
                          <ListItemButton component={Link} to={item.path} selected={item.path === path} sx={{
                            '&.Mui-selected': { backgroundColor: COMPANY_COLORS.darkCyan, color: COMPANY_COLORS.white, '& .MuiListItemIcon-root': { color: COMPANY_COLORS.white }, borderLeft: `4px solid ${COMPANY_COLORS.vividOrange}` },
                            '&:hover': { backgroundColor: COMPANY_COLORS.lightCyan }, borderRadius: '8px', py: 1, pl: 2
                          }}>
                            <ListItemIcon sx={{ color: item.path === path ? COMPANY_COLORS.white : COMPANY_COLORS.darkCyan, minWidth: 36 }}>
                              {item.badge > 0 ? (
                                <Badge badgeContent={item.badge} color="error" sx={{ '& .MuiBadge-badge': { backgroundColor: COMPANY_COLORS.vividOrange, color: COMPANY_COLORS.white, fontWeight: 'bold', fontSize: '0.6rem', height: 16, minWidth: 16 } }}>
                                  {item.icon}
                                </Badge>
                              ) : item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: item.path === path ? '600' : '500' }} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              );
            })}
          </List>
        </Box>
        {notificationCount > 0 && (
          <Box sx={{ p: 2, borderTop: `2px solid ${COMPANY_COLORS.lightCyan}`, bgcolor: COMPANY_COLORS.lightOrange, borderLeft: `4px solid ${COMPANY_COLORS.vividOrange}`, margin: 1.5, borderRadius: '8px' }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, color: COMPANY_COLORS.darkCyan, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon fontSize="small" sx={{ color: COMPANY_COLORS.vividOrange }} /> Alertes ({notificationCount})
            </Typography>
            {stocksFaibles.length > 0 && <Typography variant="caption" sx={{ display: 'block', cursor: 'pointer', color: COMPANY_COLORS.darkCyan, mb: 1, fontWeight: '500' }} onClick={() => navigate('/stocks?low_stock=true')}>⚠️ {stocksFaibles.length} stock(s) faible(s)</Typography>}
            {commandesAApprouver.length > 0 && <Typography variant="caption" sx={{ display: 'block', cursor: 'pointer', color: COMPANY_COLORS.darkCyan, mb: 1, fontWeight: '500' }} onClick={() => navigate('/ventes?status=pending_approval')}>📋 {commandesAApprouver.length} commande(s) à approuver</Typography>}
            {absencesEnAttente.length > 0 && <Typography variant="caption" sx={{ display: 'block', cursor: 'pointer', color: COMPANY_COLORS.darkCyan, mb: 1, fontWeight: '500' }} onClick={() => navigate('/conges?status=pending')}>📅 {absencesEnAttente.length} demande(s) de congés</Typography>}
            <Typography variant="caption" sx={{ display: 'block', mt: 1.5, cursor: 'pointer', color: COMPANY_COLORS.vividOrange, fontWeight: 'bold', textAlign: 'center' }} onClick={() => navigate('/dashboard')}>→ Voir le tableau de bord</Typography>
          </Box>
        )}
        <Box sx={{ p: 2, borderTop: `2px solid ${COMPANY_COLORS.lightCyan}`, backgroundColor: COMPANY_COLORS.darkCyan, color: COMPANY_COLORS.white }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.8 }}>v3.0.0</Typography>
            <Chip label="ERP 2025" size="small" sx={{ fontSize: '0.65rem', height: 20, fontWeight: 'bold', backgroundColor: COMPANY_COLORS.vividOrange, color: COMPANY_COLORS.white }} />
          </Box>
          <Typography variant="caption" align="center" sx={{ display: 'block', fontWeight: 'bold', fontSize: '0.7rem' }}>{roleConfig.label}</Typography>
          <Typography variant="caption" align="center" sx={{ display: 'block', fontSize: '0.65rem', mt: 0.5, opacity: 0.8 }}>© 2025 GALSENSHOP ERP</Typography>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: mode === 'dark' ? '#121212' : '#f5f7fa', minHeight: '100vh' }}>
        <Toolbar sx={{ minHeight: '70px' }} />
        {content}
      </Box>
    </Box>
  );
}