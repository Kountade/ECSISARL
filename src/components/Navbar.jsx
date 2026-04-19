// src/components/Navbar.jsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AxiosInstance from './AxiosInstance';
import logo from '../assets/logo.svg';

// Icônes Lucide React
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Building2,
  Tags,
  History,
  BarChart3,
  LogOut,
  UserPlus,
  TrendingUp,
  Moon,
  Sun,
  User,
  Settings,
  Warehouse,
  ArrowLeftRight,
  CreditCard,
  AlertTriangle,
  Truck,
  Wrench,
  Handshake,
  Store,
  Receipt,
  Calendar,
  CalendarDays,
  FileText,
  ClipboardList,
  Shield,
  ChevronDown,
  ChevronRight,
  Bell,
  Menu,
  X,
  Home,
  Briefcase,
  Banknote,
  ShoppingBag,
  Users2,
  FileBarChart,
  Activity,
  Target,
  Boxes,
  Ruler,
  ClipboardCheck,
  Send,
  Mail,
  Phone,
  MapPin,
  Award,
  Eye,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Command,
  Star,
  TrendingDown,
  PieChart,
  DollarSign,
  Percent,
  Printer,
  Download,
  Upload,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Minus,
  RotateCcw,
  HelpCircle,
  MessageSquare,
  AtSign
} from 'lucide-react';

// Configuration des rôles
const ROLE_CONFIG = {
  super_admin: {
    label: 'Administrateur général',
    color: 'badge-error',
    bgColor: 'bg-error/10',
    textColor: 'text-error',
    borderColor: 'border-error',
    icon: Shield,
    level: 100,
    description: 'Accès total au système'
  },
  commercial: {
    label: 'Commercial',
    color: 'badge-info',
    bgColor: 'bg-info/10',
    textColor: 'text-info',
    borderColor: 'border-info',
    icon: Handshake,
    level: 60,
    description: 'Force de vente'
  }
};

export default function Navbar({ content, mode, toggleColorMode }) {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    'TABLEAU DE BORD': true,
    'COMMERCIAL': true
  });
  const [userInitial, setUserInitial] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
  const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG.commercial;

  useEffect(() => {
    if (userName) {
      setUserInitial(userName.charAt(0).toUpperCase());
    }
  }, [userName]);

  // Récupération des notifications selon le rôle
  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        const isSuperAdmin = userRole === 'super_admin';
        const isCommercial = userRole === 'commercial';

        if (isSuperAdmin) {
          const stocksRes = await AxiosInstance.get('/stock-movements/?low_stock=true').catch(() => ({ data: [] }));
          setStocksFaibles(stocksRes.data || []);
          
          const cmdRes = await AxiosInstance.get('/sale-orders/?status=pending_approval').catch(() => ({ data: [] }));
          setCommandesAApprouver(cmdRes.data || []);
          
          const absRes = await AxiosInstance.get('/leaves/?status=pending').catch(() => ({ data: [] }));
          setAbsencesEnAttente(absRes.data || []);
          
          const factRes = await AxiosInstance.get('/invoices/?due_soon=true').catch(() => ({ data: [] }));
          setFacturesEcheance(factRes.data || []);
          
          const achRes = await AxiosInstance.get('/purchase-orders/?status=confirmed').catch(() => ({ data: [] }));
          setAchatsALivrer(achRes.data || []);
          
          const alertsRes = await AxiosInstance.get('/purchase-alerts/?is_active=true').catch(() => ({ data: [] }));
          setAlertsCount(alertsRes.data?.length || 0);
          
          const intRes = await AxiosInstance.get('/technical/interventions/?status=in_progress').catch(() => ({ data: [] }));
          setInterventionsEnCours(intRes.data || []);
        }

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
  const canViewSales = () => true;
  const canViewPurchases = () => isSuperAdmin();
  const canViewInventory = () => isSuperAdmin();
  const canViewHR = () => isSuperAdmin();
  const canViewAccounting = () => isSuperAdmin();
  const canViewCustomers = () => true;
  const canViewSuppliers = () => isSuperAdmin();
  const canViewReports = () => isSuperAdmin();
  const canViewAdmin = () => isSuperAdmin();
  const canViewTechnical = () => isSuperAdmin();
  const canViewPOS = () => true;
  const canViewDeliveries = () => isSuperAdmin();

  const handleSectionToggle = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const logoutUser = () => {
    setProfileMenuOpen(false);
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
  const RoleIcon = roleConfig.icon;

  // Structure des menus avec icônes plus grandes
  const menuSections = [
    {
      name: 'TABLEAU DE BORD',
      icon: LayoutDashboard,
      items: [
        { id: 'dashboard', text: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', permission: canViewDashboard() }
      ]
    },
    {
      name: 'COMMERCIAL',
      icon: Handshake,
      permission: canViewSales() || canViewCustomers(),
      items: [
        { id: 'pos', text: 'Point de Vente', icon: Store, path: '/point-de-vente', permission: canViewPOS() },
        { id: 'ventes', text: 'Ventes', icon: ShoppingCart, path: '/ventes', permission: canViewSales(), badge: ventesImpayees.length + ventesRetard.length },
        { id: 'clients', text: 'Clients', icon: Users, path: '/clients', permission: canViewCustomers() },
        { id: 'devis', text: 'Devis', icon: FileText, path: '/devis', permission: canViewSales() },
        { id: 'factures', text: 'Factures', icon: Receipt, path: '/factures', permission: canViewSales() },
        { id: 'paiements', text: 'Paiements', icon: DollarSign, path: '/paiements', permission: canViewSales() }
      ]
    },
    {
      name: 'ACHATS',
      icon: ShoppingBag,
      permission: canViewPurchases() || canViewSuppliers(),
      items: [
        { id: 'fournisseurs', text: 'Fournisseurs', icon: Building2, path: '/fournisseurs', permission: canViewSuppliers() },
        { id: 'evaluations', text: 'Évaluations', icon: Star, path: '/supplier-evaluations', permission: canViewSuppliers() },
        { id: 'commandes', text: 'Commandes', icon: FileText, path: '/commandes-fournisseurs', permission: canViewPurchases(), badge: achatsALivrer.length },
        { id: 'receptions', text: 'Réceptions', icon: Truck, path: '/purchase-receipts', permission: canViewPurchases() },
        { id: 'catalogue', text: 'Catalogue', icon: ClipboardList, path: '/supplier-catalogs', permission: canViewPurchases() },
        { id: 'prix', text: 'Historique prix', icon: History, path: '/price-history', permission: canViewPurchases() },
        { id: 'alertes', text: 'Alertes', icon: AlertTriangle, path: '/purchase-alerts', permission: canViewPurchases(), badge: alertsCount }
      ]
    },
    {
      name: 'STOCK & LOGISTIQUE',
      icon: Package,
      permission: canViewInventory() || canViewDeliveries(),
      items: [
        { id: 'categories', text: 'Catégories', icon: Tags, path: '/categories', permission: canViewInventory() },
        { id: 'produits', text: 'Produits', icon: Package, path: '/produits', permission: canViewInventory() },
        { id: 'variants', text: 'Variantes', icon: Tags, path: '/variants', permission: canViewInventory() },
        { id: 'marques', text: 'Marques', icon: Award, path: '/brands', permission: canViewInventory() },
        { id: 'unites', text: 'Unités', icon: Ruler, path: '/units', permission: canViewInventory() },
        { id: 'reception', text: 'Réception stock', icon: Truck, path: '/stock-receipt', permission: canViewInventory() },
        { id: 'stocks', text: 'Stocks', icon: Boxes, path: '/stocks', permission: canViewInventory(), badge: stocksFaibles.length },
        { id: 'entrepots', text: 'Entrepôts', icon: Warehouse, path: '/entrepots', permission: canViewInventory() },
        { id: 'mouvements', text: 'Mouvements', icon: TrendingUp, path: '/mouvements-stock', permission: canViewInventory() },
        { id: 'transferts', text: 'Transferts', icon: ArrowLeftRight, path: '/transferts', permission: canViewInventory() },
        { id: 'inventaire', text: 'Inventaire', icon: ClipboardCheck, path: '/inventaire', permission: canViewInventory() },
        { id: 'livraisons', text: 'Livraisons', icon: Truck, path: '/livraisons', permission: canViewDeliveries() }
      ]
    },
    {
      name: 'ANALYSES & RAPPORTS',
      icon: PieChart,
      permission: canViewReports(),
      items: [
        { id: 'rapports-ventes', text: 'Rapports Ventes', icon: FileBarChart, path: '/rapports-ventes', permission: canViewReports() },
        { id: 'rapports-financiers', text: 'Rapports Financiers', icon: BarChart3, path: '/rapports-financiers', permission: canViewReports() },
        { id: 'statistiques', text: 'Statistiques', icon: TrendingUp, path: '/statistiques', permission: canViewReports() },
        { id: 'kpi', text: 'Indicateurs', icon: Target, path: '/kpi', permission: isSuperAdmin() }
      ]
    },
    {
      name: 'ADMINISTRATION',
      icon: Settings,
      permission: canViewAdmin(),
      items: [
        { id: 'utilisateurs', text: 'Utilisateurs', icon: Users2, path: '/utilisateurs', permission: canViewAdmin() },
        { id: 'roles', text: 'Rôles & Permissions', icon: Shield, path: '/roles', permission: isSuperAdmin() },
        { id: 'audit', text: 'Journal Audit', icon: History, path: '/audit', permission: canViewAdmin() },
        { id: 'parametres', text: 'Paramètres', icon: Settings, path: '/parametres', permission: canViewAdmin() }
      ]
    },
    {
      name: 'MON ESPACE',
      icon: User,
      items: [
        { id: 'profile', text: 'Mon Profil', icon: User, path: '/profile', permission: true },
        { id: 'messages', text: 'Messages', icon: MessageSquare, path: '/messages', permission: true },
        { id: 'aide', text: 'Aide & Support', icon: HelpCircle, path: '/support', permission: true }
      ]
    }
  ];

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => {
      setProfileMenuOpen(false);
      setNotificationsOpen(false);
      setSearchOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-base-200">
      {/* Sidebar Desktop - AGGRANDI */}
      <aside 
        className={`${
          sidebarOpen ? 'w-80' : 'w-24'
        } bg-base-100 shadow-2xl transition-all duration-300 hidden lg:block border-r-4 border-primary/20 relative`}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section - AGGRANDI */}
          <div className="p-6 border-b-2 border-base-300 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center p-2 shadow-lg">
                <img src={logo} alt="ECSI SARL" className="w-full h-full object-contain" />
              </div>
              {sidebarOpen && (
                <div className="flex-1">
                  <h1 className="font-black text-2xl text-primary tracking-tight">ECSI SARL</h1>
                  <p className="text-sm text-base-content/60 font-medium">ERP Management</p>
                </div>
              )}
            </div>
          </div>

          {/* User Info - AGGRANDI */}
          <div className={`p-5 border-b-2 border-base-300 ${!sidebarOpen && 'text-center'} ${roleConfig.bgColor}`}>
            <div className={`flex items-center ${!sidebarOpen && 'justify-center'} gap-4`}>
              <div className="avatar placeholder">
                <div className={`bg-gradient-to-br from-primary to-primary-focus text-primary-content rounded-xl ${sidebarOpen ? 'w-16 h-16' : 'w-12 h-12'} shadow-lg`}>
                  <span className={`${sidebarOpen ? 'text-3xl' : 'text-xl'} font-bold`}>{userInitial}</span>
                </div>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg truncate">{userName}</p>
                  <p className="text-xs text-base-content/60 truncate mb-1">{userEmail}</p>
                  <div className={`badge ${roleConfig.color} badge-lg font-semibold gap-2 p-4`}>
                    <RoleIcon className="w-4 h-4" />
                    <span className="text-sm">{roleConfig.label}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu - AGGRANDI */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-2">
            {menuSections.map((section, index) => {
              const SectionIcon = section.icon;
              const visibleItems = section.items.filter(item => item.permission);
              if (visibleItems.length === 0) return null;

              return (
                <div key={index} className="mb-1">
                  <button
                    onClick={() => handleSectionToggle(section.name)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-base-200 transition-all duration-200 ${
                      !sidebarOpen && 'justify-center'
                    } ${
                      openSections[section.name] ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${openSections[section.name] ? 'bg-primary/10' : ''}`}>
                      <SectionIcon className={`w-6 h-6 ${openSections[section.name] ? 'text-primary' : 'text-base-content/70'}`} />
                    </div>
                    {sidebarOpen && (
                      <>
                        <span className={`flex-1 text-left text-sm font-black tracking-wider ${
                          openSections[section.name] ? 'text-primary' : 'text-base-content'
                        }`}>
                          {section.name}
                        </span>
                        {openSections[section.name] ? (
                          <ChevronDown className="w-5 h-5 text-primary" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-base-content/50" />
                        )}
                      </>
                    )}
                  </button>

                  {sidebarOpen && openSections[section.name] && (
                    <div className="ml-6 mt-2 space-y-1.5 border-l-2 border-primary/20 pl-4">
                      {visibleItems.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={item.id}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                              path === item.path
                                ? 'bg-primary text-primary-content shadow-lg scale-[1.02]'
                                : 'hover:bg-base-200 text-base-content hover:scale-[1.01]'
                            }`}
                          >
                            <div className={`p-1 rounded-lg ${
                              path === item.path ? 'bg-primary-content/20' : 'bg-base-300/50 group-hover:bg-base-300'
                            }`}>
                              <ItemIcon className="w-5 h-5" />
                            </div>
                            <span className="text-base font-semibold flex-1">{item.text}</span>
                            {item.badge > 0 && (
                              <span className={`badge badge-error badge-lg font-bold ${
                                path === item.path ? 'badge-outline' : ''
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer - AGGRANDI */}
          <div className="p-5 border-t-2 border-base-300 bg-base-200/50">
            {sidebarOpen ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-base-content/70">v3.0.0</span>
                  </div>
                  <span className="badge badge-primary badge-lg font-bold">ERP 2026</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-base-content/50 font-medium">
                    © 2026 ECSI SARL
                  </p>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="btn btn-ghost btn-sm btn-circle"
                  >
                    <ChevronsLeft className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-2">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>
                <span className="badge badge-primary badge-sm">v3.0</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar - AGGRANDI */}
        <header className="bg-base-100 shadow-xl border-b-4 border-primary/20 z-10">
          <div className="px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-6">
              {/* Mobile Menu Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                className="lg:hidden btn btn-ghost btn-lg btn-circle"
              >
                {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>

              {/* Logo Mobile */}
              <div className="lg:hidden flex items-center gap-3">
                <img src={logo} alt="ECSI" className="w-10 h-10" />
                <span className="font-black text-xl text-primary">ECSI SARL</span>
              </div>

              {/* Search Bar */}
              <div className="hidden md:block relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                  <input
                    type="text"
                    placeholder="Rechercher... (⌘K)"
                    className="input input-bordered w-96 pl-12 pr-4 h-12 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <kbd className="absolute right-3 top-1/2 -translate-y-1/2 kbd kbd-sm">⌘K</kbd>
                </div>
              </div>

              {/* Breadcrumb - AGGRANDI */}
              <div className="hidden lg:block">
                <div className="text-base breadcrumbs">
                  <ul>
                    <li>
                      <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
                        <LayoutDashboard className="w-5 h-5" />
                        Accueil
                      </Link>
                    </li>
                    <li className="font-black text-primary">
                      <span className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4" />
                        {path.split('/')[1]?.charAt(0).toUpperCase() + path.split('/')[1]?.slice(1) || 'Dashboard'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Section - AGGRANDI */}
            <div className="flex items-center gap-4">
              {/* Quick Actions */}
              <div className="hidden lg:flex items-center gap-2">
                <button className="btn btn-ghost btn-md gap-2">
                  <Plus className="w-5 h-5" />
                  <span className="font-semibold">Nouveau</span>
                </button>
                <button className="btn btn-ghost btn-md gap-2">
                  <Filter className="w-5 h-5" />
                  <span className="font-semibold">Filtres</span>
                </button>
                <button className="btn btn-ghost btn-md gap-2">
                  <Download className="w-5 h-5" />
                  <span className="font-semibold">Exporter</span>
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleColorMode}
                className="btn btn-ghost btn-lg btn-circle"
              >
                {mode === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>

              {/* Notifications - AGGRANDI */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationsOpen(!notificationsOpen);
                  }}
                  className="btn btn-ghost btn-lg btn-circle relative"
                >
                  <Bell className="w-6 h-6" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 badge badge-error badge-lg font-bold">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown - AGGRANDI */}
                {notificationsOpen && (
                  <div 
                    className="absolute right-0 mt-3 w-[28rem] bg-base-100 rounded-2xl shadow-2xl border-2 border-base-300 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-5 border-b-2 border-base-300 bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-xl">Notifications</h3>
                        <span className="badge badge-primary badge-lg font-bold">{notificationCount} nouvelles</span>
                      </div>
                    </div>
                    <div className="max-h-[32rem] overflow-y-auto">
                      {stocksFaibles.length > 0 && (
                        <button
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate('/stocks?low_stock=true');
                          }}
                          className="w-full p-5 hover:bg-base-200 text-left border-b border-base-300 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-warning/10 rounded-xl">
                              <AlertTriangle className="w-7 h-7 text-warning" />
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-lg mb-1">Stocks faibles</p>
                              <p className="text-base text-base-content/70">
                                {stocksFaibles.length} produit(s) nécessitent un réapprovisionnement urgent
                              </p>
                            </div>
                          </div>
                        </button>
                      )}
                      {ventesImpayees.length > 0 && (
                        <button
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate('/ventes?payment_status=pending');
                          }}
                          className="w-full p-5 hover:bg-base-200 text-left border-b border-base-300 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-error/10 rounded-xl">
                              <DollarSign className="w-7 h-7 text-error" />
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-lg mb-1">Ventes impayées</p>
                              <p className="text-base text-base-content/70">
                                {ventesImpayees.length} vente(s) en attente de paiement
                              </p>
                            </div>
                          </div>
                        </button>
                      )}
                      {commandesAApprouver.length > 0 && (
                        <button
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate('/ventes?status=pending_approval');
                          }}
                          className="w-full p-5 hover:bg-base-200 text-left border-b border-base-300 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-info/10 rounded-xl">
                              <ClipboardList className="w-7 h-7 text-info" />
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-lg mb-1">Commandes à approuver</p>
                              <p className="text-base text-base-content/70">
                                {commandesAApprouver.length} commande(s) en attente de validation
                              </p>
                            </div>
                          </div>
                        </button>
                      )}
                      {notificationCount === 0 && (
                        <div className="p-10 text-center">
                          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success" />
                          <p className="text-xl font-bold text-base-content mb-2">Tout est en ordre !</p>
                          <p className="text-base text-base-content/60">
                            Aucune notification en attente
                          </p>
                        </div>
                      )}
                    </div>
                    {notificationCount > 0 && (
                      <div className="p-5 border-t-2 border-base-300 bg-base-200">
                        <button
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate('/dashboard');
                          }}
                          className="btn btn-primary btn-lg w-full font-bold text-lg"
                        >
                          Voir toutes les alertes
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu - AGGRANDI */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileMenuOpen(!profileMenuOpen);
                  }}
                  className="flex items-center gap-3 btn btn-ghost px-4 h-auto py-2"
                >
                  <div className="avatar placeholder">
                    <div className="bg-gradient-to-br from-primary to-primary-focus text-primary-content rounded-xl w-12 h-12">
                      <span className="text-xl font-black">{userInitial}</span>
                    </div>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="font-black text-base truncate max-w-[140px]">{userName}</p>
                    <span className={`badge ${roleConfig.color} badge-md font-bold gap-1`}>
                      <RoleIcon className="w-3.5 h-3.5" />
                      <span className="text-sm">{roleConfig.label}</span>
                    </span>
                  </div>
                  <ChevronDown className="w-5 h-5 hidden lg:block" />
                </button>

                {/* Profile Dropdown - AGGRANDI */}
                {profileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-3 w-80 bg-base-100 rounded-2xl shadow-2xl border-2 border-base-300 z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={`p-6 ${roleConfig.bgColor} border-b-2 border-base-300`}>
                      <div className="flex items-center gap-4">
                        <div className="avatar placeholder">
                          <div className="bg-gradient-to-br from-primary to-primary-focus text-primary-content rounded-xl w-16 h-16">
                            <span className="text-3xl font-black">{userInitial}</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-black text-xl">{userName}</p>
                          <p className="text-sm text-base-content/70">{userEmail}</p>
                          <div className={`badge ${roleConfig.color} badge-md font-bold mt-2 gap-1`}>
                            <RoleIcon className="w-3.5 h-3.5" />
                            <span>{roleConfig.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/profile');
                        }}
                        className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-base-200 rounded-xl font-semibold text-base transition-colors"
                      >
                        <User className="w-5 h-5" />
                        Mon Profil
                      </button>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/dashboard');
                        }}
                        className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-base-200 rounded-xl font-semibold text-base transition-colors"
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        Tableau de bord
                      </button>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/messages');
                        }}
                        className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-base-200 rounded-xl font-semibold text-base transition-colors"
                      >
                        <MessageSquare className="w-5 h-5" />
                        Messages
                      </button>
                      {canViewAdmin() && (
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate('/parametres');
                          }}
                          className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-base-200 rounded-xl font-semibold text-base transition-colors"
                        >
                          <Settings className="w-5 h-5" />
                          Paramètres
                        </button>
                      )}
                      <div className="divider my-3"></div>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/support');
                        }}
                        className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-base-200 rounded-xl font-semibold text-base transition-colors"
                      >
                        <HelpCircle className="w-5 h-5" />
                        Aide & Support
                      </button>
                      <button
                        onClick={logoutUser}
                        className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-error/10 text-error rounded-xl font-semibold text-base transition-colors mt-2"
                      >
                        <LogOut className="w-5 h-5" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Alertes rapides - AGGRANDI */}
        {notificationCount > 0 && (
          <div className="bg-warning/10 border-b-2 border-warning/30 px-6 py-3">
            <div className="flex items-center gap-4 overflow-x-auto">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="p-2 bg-warning/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <span className="font-black text-warning">Alertes actives :</span>
              </div>
              <div className="flex gap-3">
                {stocksFaibles.length > 0 && (
                  <button
                    onClick={() => navigate('/stocks?low_stock=true')}
                    className="btn btn-warning btn-md font-bold gap-2"
                  >
                    <Package className="w-4 h-4" />
                    {stocksFaibles.length} stock(s) faible(s)
                  </button>
                )}
                {commandesAApprouver.length > 0 && (
                  <button
                    onClick={() => navigate('/ventes?status=pending_approval')}
                    className="btn btn-info btn-md font-bold gap-2"
                  >
                    <ClipboardList className="w-4 h-4" />
                    {commandesAApprouver.length} commande(s)
                  </button>
                )}
                {absencesEnAttente.length > 0 && (
                  <button
                    onClick={() => navigate('/conges?status=pending')}
                    className="btn btn-primary btn-md font-bold gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    {absencesEnAttente.length} congé(s)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-base-200">
          {content}
        </main>
      </div>

      {/* Mobile Menu Drawer - AGGRANDI */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 h-full w-96 bg-base-100 shadow-2xl animate-slide-in">
            <div className="p-6 border-b-2 border-base-300 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logo} alt="ECSI" className="w-12 h-12" />
                <span className="font-black text-2xl text-primary">ECSI SARL</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-ghost btn-lg btn-circle"
              >
                <X className="w-7 h-7" />
              </button>
            </div>
            
            <div className="overflow-y-auto h-full pb-24">
              {/* User Info Mobile - AGGRANDI */}
              <div className={`p-6 border-b-2 border-base-300 ${roleConfig.bgColor}`}>
                <div className="flex items-center gap-4">
                  <div className="avatar placeholder">
                    <div className="bg-gradient-to-br from-primary to-primary-focus text-primary-content rounded-xl w-16 h-16">
                      <span className="text-3xl font-black">{userInitial}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-black text-xl">{userName}</p>
                    <p className="text-sm text-base-content/70 mb-2">{userEmail}</p>
                    <div className={`badge ${roleConfig.color} badge-md font-bold gap-2`}>
                      <RoleIcon className="w-4 h-4" />
                      <span className="text-sm">{roleConfig.label}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation - AGGRANDI */}
              <nav className="p-4 space-y-2">
                {/* Search Mobile */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-base-content/40" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      className="input input-bordered w-full pl-14 pr-4 h-14 text-lg"
                    />
                  </div>
                </div>

                {menuSections.map((section, index) => {
                  const SectionIcon = section.icon;
                  const visibleItems = section.items.filter(item => item.permission);
                  if (visibleItems.length === 0) return null;

                  return (
                    <div key={index} className="mb-2">
                      <button
                        onClick={() => handleSectionToggle(section.name)}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-base-200"
                      >
                        <div className="p-2 bg-primary/5 rounded-lg">
                          <SectionIcon className="w-6 h-6 text-primary" />
                        </div>
                        <span className="flex-1 text-left text-base font-black">
                          {section.name}
                        </span>
                        {openSections[section.name] ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>

                      {openSections[section.name] && (
                        <div className="ml-6 mt-2 space-y-2 border-l-2 border-primary/20 pl-4">
                          {visibleItems.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <Link
                                key={item.id}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-4 px-4 py-4 rounded-xl ${
                                  path === item.path
                                    ? 'bg-primary text-primary-content'
                                    : 'hover:bg-base-200'
                                }`}
                              >
                                <ItemIcon className="w-5 h-5" />
                                <span className="text-base font-semibold flex-1">{item.text}</span>
                                {item.badge > 0 && (
                                  <span className={`badge badge-error badge-lg font-bold ${
                                    path === item.path ? 'badge-outline' : ''
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Footer Mobile */}
              <div className="p-6 border-t-2 border-base-300 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">v3.0.0</span>
                  </div>
                  <span className="badge badge-primary badge-lg font-bold">ERP 2026</span>
                </div>
                <p className="text-center text-sm text-base-content/50 font-medium">
                  © 2026 ECSI SARL - Tous droits réservés
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}