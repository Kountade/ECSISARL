// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AxiosInstance from './AxiosInstance';
import logo from '../assets/logo.svg';

// Icônes
import {
  LayoutDashboard, ShoppingCart, Users, Package, Building2, Tags, History,
  BarChart3, LogOut, TrendingUp, Moon, Sun, User, Settings, Warehouse,
  ArrowLeftRight, AlertTriangle, Truck, Handshake, Store, Receipt, Calendar,
  FileText, ClipboardList, Shield, ChevronDown, ChevronRight, Bell, Menu, X,
  ShoppingBag, Users2, FileBarChart, Target, Boxes, Ruler, ClipboardCheck,
  Award, CheckCircle, PieChart, DollarSign, Filter, Plus, Download, HelpCircle,
  MessageSquare, ChevronsLeft, ChevronsRight, Search
} from 'lucide-react';

// Configuration des rôles (sans badge)
const ROLE_CONFIG = {
  super_admin: { label: 'Administrateur général', icon: Shield },
  commercial: { label: 'Commercial', icon: Handshake }
};

export default function Navbar({ content, mode, toggleColorMode }) {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  // États d'interface
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState({ 'TABLEAU DE BORD': true, 'COMMERCIAL': true });
  const [userInitial, setUserInitial] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // États des notifications
  const [stocksFaibles, setStocksFaibles] = useState([]);
  const [ventesImpayees, setVentesImpayees] = useState([]);
  const [commandesAApprouver, setCommandesAApprouver] = useState([]);
  const [absencesEnAttente, setAbsencesEnAttente] = useState([]);
  const [achatsALivrer, setAchatsALivrer] = useState([]);
  const [alertsCount, setAlertsCount] = useState(0);

  // Récupération des données utilisateur
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('User');
      return userData ? JSON.parse(userData) : null;
    } catch { return null; }
  };
  const user = getUserData();
  const userRole = user?.role || '';
  const userEmail = user?.email || '';
  const userName = user?.username || user?.first_name || userEmail?.split('@')[0] || 'Utilisateur';
  const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG.commercial;
  const RoleIcon = roleConfig.icon;

  useEffect(() => {
    if (userName) setUserInitial(userName.charAt(0).toUpperCase());
  }, [userName]);

  // Récupération des notifications avec polling toutes les 30 secondes
  useEffect(() => {
    if (!userRole) return;

    const fetchAllNotifications = async () => {
      try {
        const isSuperAdmin = userRole === 'super_admin';

        // Stocks faibles
        const stocksRes = await AxiosInstance.get('/products/low_stock/').catch(() => ({ data: [] }));
        let lowStockData = stocksRes.data || [];
        lowStockData = lowStockData.filter(p => p.minimum_stock > 0);
        setStocksFaibles(lowStockData);

        if (isSuperAdmin) {
          const cmdRes = await AxiosInstance.get('/sale-orders/?status=pending_approval').catch(() => ({ data: [] }));
          setCommandesAApprouver(cmdRes.data || []);
          const absRes = await AxiosInstance.get('/leaves/?status=pending').catch(() => ({ data: [] }));
          setAbsencesEnAttente(absRes.data || []);
          const achRes = await AxiosInstance.get('/purchase-orders/?status=confirmed').catch(() => ({ data: [] }));
          setAchatsALivrer(achRes.data || []);
          const alertsRes = await AxiosInstance.get('/alerts/').catch(() => ({ data: [] }));
          setAlertsCount(alertsRes.data?.length || 0);
        }

        const ventesImpRes = await AxiosInstance.get('/sale-orders/?payment_status=pending').catch(() => ({ data: [] }));
        setVentesImpayees(ventesImpRes.data || []);
      } catch (error) {
        console.error('Erreur chargement notifications:', error);
      }
    };

    fetchAllNotifications();
    const interval = setInterval(fetchAllNotifications, 30000);
    return () => clearInterval(interval);
  }, [userRole]);

  // Calcul du nombre total de notifications
  const notificationCount = stocksFaibles.length + ventesImpayees.length + commandesAApprouver.length +
    absencesEnAttente.length + achatsALivrer.length + alertsCount;

  // Permissions
  const isSuperAdmin = () => userRole === 'super_admin';
  const canViewPurchases = () => isSuperAdmin();
  const canViewInventory = () => isSuperAdmin();
  const canViewAdmin = () => isSuperAdmin();
  const canViewReports = () => isSuperAdmin();

  const handleSectionToggle = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const logoutUser = () => {
    setProfileMenuOpen(false);
    AxiosInstance.post('logoutall/', {}).finally(() => {
      localStorage.clear();
      navigate('/');
    });
  };

  // Fonction pour obtenir un nom lisible de la page
  const getPageName = (path) => {
    const segment = path.split('/')[1];
    if (!segment) return 'Dashboard';
    const map = {
      'dashboard': 'Dashboard',
      'ventes': 'Ventes',
      'clients': 'Clients',
      'devis': 'Devis',
      'factures': 'Factures',
      'paiements': 'Paiements',
      'fournisseurs': 'Fournisseurs',
      'commandes-fournisseurs': 'Commandes fournisseurs',
      'receptions': 'Réceptions',
      'purchase-alerts': 'Alertes achats',
      'produits': 'Produits',
      'stocks': 'Stocks',
      'entrepots': 'Entrepôts',
      'transferts': 'Transferts',
      'livraisons': 'Livraisons',
      'rapports-ventes': 'Rapports ventes',
      'statistiques': 'Statistiques',
      'utilisateurs': 'Utilisateurs',
      'parametres': 'Paramètres',
      'profile': 'Mon profil',
      'messages': 'Messages',
      'support': 'Aide',
      'notifications': 'Notifications'
    };
    return map[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  // Structure des menus
  const menuSections = [
    {
      name: 'TABLEAU DE BORD',
      icon: LayoutDashboard,
      items: [{ id: 'dashboard', text: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', permission: true }]
    },
    {
      name: 'COMMERCIAL',
      icon: Handshake,
      permission: true,
      items: [
        { id: 'pos', text: 'Point de Vente', icon: Store, path: '/point-de-vente', permission: true },
        { id: 'ventes', text: 'Ventes', icon: ShoppingCart, path: '/ventes', permission: true, badge: ventesImpayees.length },
        { id: 'clients', text: 'Clients', icon: Users, path: '/clients', permission: true },
        { id: 'devis', text: 'Devis', icon: FileText, path: '/devis', permission: true },
        { id: 'factures', text: 'Factures', icon: Receipt, path: '/factures', permission: true },
        { id: 'paiements', text: 'Paiements', icon: DollarSign, path: '/paiements', permission: true }
      ]
    },
    {
      name: 'ACHATS',
      icon: ShoppingBag,
      permission: canViewPurchases(),
      items: [
        { id: 'fournisseurs', text: 'Fournisseurs', icon: Building2, path: '/fournisseurs', permission: canViewPurchases() },
        { id: 'commandes', text: 'Commandes', icon: FileText, path: '/commandes-fournisseurs', permission: canViewPurchases(), badge: achatsALivrer.length },
        { id: 'receptions', text: 'Réceptions', icon: Truck, path: '/receptions', permission: canViewPurchases() },
        { id: 'alertes', text: 'Alertes', icon: AlertTriangle, path: '/purchase-alerts', permission: canViewPurchases(), badge: alertsCount }
      ]
    },
    {
      name: 'STOCK & LOGISTIQUE',
      icon: Package,
      permission: canViewInventory(),
      items: [
        { 
          id: 'produits', 
          text: 'Produits', 
          icon: Package, 
          path: '/produits', 
          permission: canViewInventory() 
        },
        { 
          id: 'stocks', 
          text: 'Stocks', 
          icon: Boxes, 
          path: '/stocks', 
          permission: canViewInventory(), 
          badge: stocksFaibles.length 
        },
        { 
          id: 'mouvements', 
          text: 'Mouvements de stock', 
          icon: History, 
          path: '/stocks/mouvements', 
          permission: canViewInventory() 
        },
        { 
          id: 'entrepots', 
          text: 'Entrepôts', 
          icon: Warehouse, 
          path: '/entrepots', 
          permission: canViewInventory() 
        },
        { 
          id: 'transferts', 
          text: 'Transferts', 
          icon: ArrowLeftRight, 
          path: '/transferts', 
          permission: canViewInventory() 
        },
        { 
          id: 'livraisons', 
          text: 'Livraisons', 
          icon: Truck, 
          path: '/livraisons', 
          permission: canViewInventory() 
        }
      ]
    },
    {
      name: 'RAPPORTS',
      icon: PieChart,
      permission: canViewReports(),
      items: [
        { id: 'rapports-ventes', text: 'Rapports Ventes', icon: FileBarChart, path: '/rapports-ventes', permission: canViewReports() },
        { id: 'statistiques', text: 'Statistiques', icon: TrendingUp, path: '/statistiques', permission: canViewReports() }
      ]
    },
    {
      name: 'ADMIN',
      icon: Settings,
      permission: canViewAdmin(),
      items: [
        { id: 'utilisateurs', text: 'Utilisateurs', icon: Users2, path: '/utilisateurs', permission: canViewAdmin() },
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

  // Fermeture du menu utilisateur au clic externe
  useEffect(() => {
    const handleClickOutside = () => setProfileMenuOpen(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* ==================== SIDEBAR ==================== */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 hidden lg:flex flex-col border-r border-gray-200 dark:border-gray-700`}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <img src={logo} alt="ECSI" className="w-8 h-8 object-contain" />
          </div>
          {sidebarOpen && <span className="font-bold text-xl text-gray-800 dark:text-white">ECSI<span className="text-primary">SARL</span></span>}
        </div>

        {/* Profil utilisateur (sans badge) */}
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${!sidebarOpen && 'text-center'}`}>
          <div className={`flex ${sidebarOpen ? 'gap-3' : 'flex-col items-center'} items-center`}>
            <div className="avatar placeholder">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/80 to-primary text-white flex items-center justify-center text-lg font-bold shadow-sm">
                {userInitial}
              </div>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 dark:text-white truncate">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                <div className="inline-flex items-center gap-1 text-xs text-primary mt-1">
                  <RoleIcon className="w-3 h-3" />
                  <span className="font-medium">{roleConfig.label}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuSections.map((section, idx) => {
            const SectionIcon = section.icon;
            const visibleItems = section.items.filter(i => i.permission);
            if (visibleItems.length === 0) return null;
            return (
              <div key={idx}>
                <button
                  onClick={() => handleSectionToggle(section.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${!sidebarOpen && 'justify-center'}`}
                >
                  <SectionIcon className="w-5 h-5" />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium">{section.name}</span>
                      {openSections[section.name] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </>
                  )}
                </button>
                {sidebarOpen && openSections[section.name] && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-3">
                    {visibleItems.map(item => {
                      const IconComp = item.icon;
                      const isActive = path === item.path;
                      return (
                        <Link
                          key={item.id}
                          to={item.path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                            isActive ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                          <span className="flex-1">{item.text}</span>
                          {item.badge > 0 && <span className="badge badge-xs bg-red-500 text-white border-none px-1.5">{item.badge}</span>}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {sidebarOpen && <span className="text-xs text-gray-400">v3.0.0</span>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-ghost btn-sm btn-circle">
              {sidebarOpen ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== CONTENU PRINCIPAL ==================== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10">
          <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
            {/* Partie gauche */}
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden btn btn-ghost btn-sm btn-circle">
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="input input-bordered w-80 pl-9 py-2 h-9 text-sm rounded-lg bg-gray-50 dark:bg-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {/* BREADCRUMB */}
              <div className="hidden lg:block ml-4">
                <div className="text-sm breadcrumbs">
                  <ul>
                    <li>
                      <Link to="/dashboard" className="flex items-center gap-1">
                        <LayoutDashboard className="w-4 h-4" />
                        Accueil
                      </Link>
                    </li>
                    <li className="font-medium text-primary">
                      <Link to={path} className="flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" />
                        {getPageName(path)}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Partie droite */}
            <div className="flex items-center gap-3">
              <button onClick={toggleColorMode} className="btn btn-ghost btn-sm btn-circle">
                {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <button
                onClick={() => navigate('/notifications')}
                className="btn btn-ghost btn-sm btn-circle relative"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {/* Menu utilisateur (sans badge) */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setProfileMenuOpen(!profileMenuOpen); }}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="avatar placeholder">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                      {userInitial}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium text-sm">{userName}</p>
                      <p className="text-xs text-gray-500">{userEmail}</p>
                      <div className="inline-flex items-center gap-1 text-xs text-primary mt-1">
                        <RoleIcon className="w-3 h-3" />
                        <span>{roleConfig.label}</span>
                      </div>
                    </div>
                    <div className="p-2">
                      <button onClick={() => { setProfileMenuOpen(false); navigate('/profile'); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <User className="w-4 h-4" /> Mon profil
                      </button>
                      <button onClick={() => { setProfileMenuOpen(false); navigate('/dashboard'); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <LayoutDashboard className="w-4 h-4" /> Tableau de bord
                      </button>
                      <hr className="my-1" />
                      <button onClick={logoutUser} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50">
                        <LogOut className="w-4 h-4" /> Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Bandeau d'alertes rapides (optionnel) */}
        {notificationCount > 0 && (
          <div className="bg-warning/10 border-b border-warning/30 px-6 py-2 text-sm">
            <div className="flex items-center gap-4 overflow-x-auto">
              <div className="flex items-center gap-2 flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="font-semibold text-warning">Alertes :</span>
              </div>
              <div className="flex gap-3">
                {stocksFaibles.length > 0 && (
                  <button onClick={() => navigate('/stocks?low_stock=true')} className="btn btn-xs btn-warning gap-1">
                    <Package className="w-3 h-3" /> {stocksFaibles.length} stock(s) faible(s)
                  </button>
                )}
                {ventesImpayees.length > 0 && (
                  <button onClick={() => navigate('/ventes?payment_status=pending')} className="btn btn-xs btn-error gap-1">
                    <DollarSign className="w-3 h-3" /> {ventesImpayees.length} impayé(s)
                  </button>
                )}
                {commandesAApprouver.length > 0 && (
                  <button onClick={() => navigate('/ventes?status=pending_approval')} className="btn btn-xs btn-info gap-1">
                    <ClipboardList className="w-3 h-3" /> {commandesAApprouver.length} à approuver
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          {content}
        </main>
      </div>

      {/* ==================== MENU MOBILE ==================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 w-80 h-full bg-white dark:bg-gray-800 shadow-xl animate-slide-in">
            <div className="p-4 border-b flex justify-between items-center">
              <span className="font-bold text-primary">ECSI SARL</span>
              <button onClick={() => setMobileMenuOpen(false)} className="btn btn-ghost btn-sm btn-circle">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 overflow-y-auto h-full">
              {menuSections.map((section, idx) => {
                const visibleItems = section.items.filter(i => i.permission);
                if (visibleItems.length === 0) return null;
                return (
                  <div key={idx}>
                    <button onClick={() => handleSectionToggle(section.name)} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <span className="font-medium">{section.name}</span>
                      {openSections[section.name] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {openSections[section.name] && (
                      <div className="pl-4 mt-1 space-y-1">
                        {visibleItems.map(item => (
                          <Link
                            key={item.id}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1 text-sm hover:text-primary"
                          >
                            {item.text}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slideIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}