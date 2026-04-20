// src/components/Roles.jsx
import React from 'react'
import {
  Shield,
  Award,
  CheckCircle,
  XCircle,
  Info,
  Lock,
  Eye,
  CheckSquare,
  Package,
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  ShoppingCart,
  Truck,
  FileText,
  CreditCard
} from 'lucide-react'

const ROLES = [
  {
    id: 'super_admin',
    name: 'Administrateur général',
    description: 'Accès complet à toutes les fonctionnalités du système',
    color: 'error',
    bgColor: 'bg-error/10',
    textColor: 'text-error',
    borderColor: 'border-error',
    icon: Shield,
    permissions: [
      { name: 'Tableau de bord', granted: true, icon: LayoutDashboard },
      { name: 'Gérer les utilisateurs', granted: true, icon: Users },
      { name: 'Gérer les rôles et permissions', granted: true, icon: Settings },
      { name: 'Voir tous les rapports', granted: true, icon: BarChart3 },
      { name: 'Valider les commandes', granted: true, icon: CheckSquare },
      { name: 'Gérer l\'inventaire complet', granted: true, icon: Package },
      { name: 'Gérer les ventes', granted: true, icon: ShoppingCart },
      { name: 'Gérer les achats', granted: true, icon: Truck },
      { name: 'Gérer la comptabilité', granted: true, icon: CreditCard },
      { name: 'Accéder à tous les journaux', granted: true, icon: FileText },
    ]
  },
  {
    id: 'commercial',
    name: 'Commercial',
    description: 'Accès aux fonctions de vente et de relation client',
    color: 'info',
    bgColor: 'bg-info/10',
    textColor: 'text-info',
    borderColor: 'border-info',
    icon: Award,
    permissions: [
      { name: 'Tableau de bord', granted: true, icon: LayoutDashboard },
      { name: 'Gérer les utilisateurs', granted: false, icon: Users },
      { name: 'Gérer les rôles et permissions', granted: false, icon: Settings },
      { name: 'Voir les rapports de vente', granted: true, icon: BarChart3 },
      { name: 'Valider les commandes', granted: false, icon: CheckSquare },
      { name: 'Gérer l\'inventaire', granted: false, icon: Package },
      { name: 'Gérer les ventes', granted: true, icon: ShoppingCart },
      { name: 'Gérer les clients', granted: true, icon: Users },
      { name: 'Créer des devis', granted: true, icon: FileText },
      { name: 'Voir les statistiques', granted: true, icon: BarChart3 },
    ]
  }
]

const Roles = () => {
  return (
    <div className="space-y-6 p-3 lg:p-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-base-content mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Rôles & Permissions
        </h1>
        <p className="text-sm lg:text-base text-base-content/60">
          Définissez les accès pour chaque type d'utilisateur
        </p>
      </div>

      {/* Alerte info */}
      <div className="alert alert-info shadow-md">
        <Info className="w-5 h-5" />
        <span className="text-sm lg:text-base">
          Les permissions sont définies au niveau du code. Contactez l'administrateur système pour toute modification.
        </span>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-300 p-3 lg:p-4">
          <div className="stat-figure text-primary">
            <Shield className="w-6 h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Total rôles</div>
          <div className="stat-value text-xl lg:text-2xl">{ROLES.length}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-300 p-3 lg:p-4">
          <div className="stat-figure text-error">
            <Lock className="w-6 h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Admin</div>
          <div className="stat-value text-xl lg:text-2xl">
            {ROLES.filter(r => r.id === 'super_admin').length}
          </div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-300 p-3 lg:p-4">
          <div className="stat-figure text-info">
            <Award className="w-6 h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Commerciaux</div>
          <div className="stat-value text-xl lg:text-2xl">
            {ROLES.filter(r => r.id === 'commercial').length}
          </div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-300 p-3 lg:p-4">
          <div className="stat-figure text-success">
            <CheckCircle className="w-6 h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Permissions totales</div>
          <div className="stat-value text-xl lg:text-2xl">
            {ROLES.reduce((sum, r) => sum + r.permissions.length, 0)}
          </div>
        </div>
      </div>

      {/* Cartes des rôles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {ROLES.map(role => {
          const IconComponent = role.icon
          const grantedCount = role.permissions.filter(p => p.granted).length
          const totalCount = role.permissions.length
          
          return (
            <div 
              key={role.id} 
              className={`bg-base-100 rounded-xl lg:rounded-2xl shadow-xl border-2 ${role.borderColor} overflow-hidden`}
            >
              {/* En-tête du rôle */}
              <div className={`p-4 lg:p-6 ${role.bgColor} border-b ${role.borderColor}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 lg:p-4 bg-base-100 rounded-xl shadow-md`}>
                    <IconComponent className={`w-8 h-8 lg:w-10 lg:h-10 ${role.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <h2 className={`text-xl lg:text-2xl font-bold ${role.textColor} mb-1`}>
                      {role.name}
                    </h2>
                    <p className="text-sm lg:text-base text-base-content/70">
                      {role.description}
                    </p>
                  </div>
                  <div className={`badge ${role.color === 'error' ? 'badge-error' : 'badge-info'} badge-lg`}>
                    {grantedCount}/{totalCount} accès
                  </div>
                </div>
              </div>

              {/* Barre de progression des permissions */}
              <div className="px-4 lg:px-6 pt-4">
                <div className="flex items-center justify-between text-xs lg:text-sm mb-2">
                  <span className="font-medium">Niveau d'accès</span>
                  <span className={`font-bold ${role.textColor}`}>
                    {Math.round((grantedCount / totalCount) * 100)}%
                  </span>
                </div>
                <progress 
                  className={`progress ${role.color === 'error' ? 'progress-error' : 'progress-info'} w-full h-2 lg:h-3`}
                  value={grantedCount}
                  max={totalCount}
                ></progress>
              </div>

              {/* Liste des permissions */}
              <div className="p-4 lg:p-6">
                <h3 className="font-semibold text-sm lg:text-base mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Permissions associées
                </h3>
                
                <div className="space-y-1">
                  {role.permissions.map((perm, idx) => {
                    const PermIcon = perm.icon
                    return (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-2 lg:p-3 hover:bg-base-200 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${perm.granted ? 'bg-success/10' : 'bg-base-300/50'}`}>
                            <PermIcon className={`w-4 h-4 ${perm.granted ? 'text-success' : 'text-base-content/40'}`} />
                          </div>
                          <span className={`text-sm lg:text-base ${!perm.granted && 'text-base-content/50'}`}>
                            {perm.name}
                          </span>
                        </div>
                        
                        {perm.granted ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <XCircle className="w-5 h-5 text-error/50" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Pied de carte */}
              <div className={`p-4 ${role.bgColor} border-t ${role.borderColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${role.color === 'error' ? 'bg-error' : 'bg-info'} animate-pulse`}></div>
                    <span className="text-xs lg:text-sm font-medium">
                      Rôle système
                    </span>
                  </div>
                  <span className={`badge ${role.color === 'error' ? 'badge-error' : 'badge-info'} badge-sm`}>
                    Priorité {role.id === 'super_admin' ? '1' : '2'}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tableau récapitulatif - Desktop */}
      <div className="hidden lg:block bg-base-100 rounded-xl shadow-md border border-base-300 overflow-hidden mt-6">
        <div className="p-4 border-b border-base-300 bg-base-200/50">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Matrice des permissions
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="bg-base-200">
                <th className="text-base">Permission</th>
                {ROLES.map(role => (
                  <th key={role.id} className="text-center text-base">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`${role.textColor}`}>{role.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES[0].permissions.map((perm, idx) => (
                <tr key={idx} className="hover">
                  <td className="font-medium">
                    <div className="flex items-center gap-2">
                      {React.createElement(perm.icon, { className: "w-4 h-4 text-base-content/60" })}
                      {perm.name}
                    </div>
                  </td>
                  {ROLES.map(role => {
                    const rolePerm = role.permissions[idx]
                    return (
                      <td key={role.id} className="text-center">
                        {rolePerm?.granted ? (
                          <div className="flex justify-center">
                            <div className="bg-success/10 p-2 rounded-full">
                              <CheckCircle className="w-5 h-5 text-success" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <div className="bg-error/10 p-2 rounded-full">
                              <XCircle className="w-5 h-5 text-error" />
                            </div>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note d'information */}
      <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 lg:p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm lg:text-base mb-2">À propos des rôles</h4>
            <p className="text-xs lg:text-sm text-base-content/70">
              Les rôles déterminent les actions qu'un utilisateur peut effectuer dans l'application. 
              L'Administrateur général dispose de tous les droits, tandis que le Commercial a un accès 
              limité aux fonctions de vente et de gestion client.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Roles