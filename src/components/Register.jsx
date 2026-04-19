// src/components/Register.jsx
import { React, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, 
  UserPlus, ChevronDown, AlertCircle, CheckCircle 
} from 'lucide-react'
import AxiosInstance from './AxiosInstance'
import logo from '../assets/logo.svg'
import backgroundImage from '../assets/background-login.jpg'

// Configuration des rôles
const ROLES = [
    { 
        value: 'super_admin', 
        label: 'Administrateur général', 
        description: 'Accès complet au système', 
        icon: '👑', 
        requiresApproval: true
    },
    { 
        value: 'commercial', 
        label: 'Commercial', 
        description: 'Force de vente', 
        icon: '🤝', 
        requiresApproval: false
    }
]

const Register = () => {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [showMessage, setShowMessage] = useState(false)
    const [messageText, setMessageText] = useState('')
    const [messageType, setMessageType] = useState('error')
    const [isLoading, setIsLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState('commercial')
    const [roleInfo, setRoleInfo] = useState(ROLES.find(r => r.value === 'commercial'))

    // Schéma de validation
    const schema = yup.object({
        email: yup.string().email('Email invalide').required('Email requis'),
        password: yup.string().required('Mot de passe requis').min(6, '6 caractères minimum'),
        password2: yup.string().required('Confirmation requise').oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas'),
        role: yup.string().required('Veuillez sélectionner un type de compte'),
        first_name: yup.string().optional(),
        last_name: yup.string().optional(),
        phone: yup.string().optional()
    })

    const { handleSubmit, control, watch, register, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { 
            role: 'commercial', 
            first_name: '', 
            last_name: '', 
            phone: '' 
        }
    })

    // Surveiller le changement du rôle
    const roleValue = watch('role')
    useEffect(() => {
        setSelectedRole(roleValue)
        setRoleInfo(ROLES.find(r => r.value === roleValue))
    }, [roleValue])

    const submission = async (data) => {
        setIsLoading(true)
        setShowMessage(false)

        const { password2, ...submitData } = data

        try {
            await AxiosInstance.post(`register/`, submitData)
            
            const role = ROLES.find(r => r.value === data.role)
            const successMessage = role.requiresApproval 
                ? '✅ Inscription enregistrée – En attente de validation par un administrateur.' 
                : '✅ Inscription réussie ! Vous pouvez maintenant vous connecter.'
            
            setMessageText(successMessage)
            setMessageType('success')
            setShowMessage(true)
            
            setTimeout(() => navigate('/'), 2500)
        } catch (error) {
            let errorMessage = 'Échec de l\'inscription'
            if (error.response?.data?.email) {
                errorMessage = 'Cet email est déjà utilisé'
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error
            } else if (error.request) {
                errorMessage = 'Serveur inaccessible. Vérifiez votre connexion.'
            }
            
            setMessageText(errorMessage)
            setMessageType('error')
            setShowMessage(true)
            
            setTimeout(() => {
                setShowMessage(false)
            }, 5000)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative p-4">
            {/* Background avec overlay */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                <div className="absolute inset-0 bg-white/95 dark:bg-base-100/95 backdrop-blur-sm"></div>
            </div>

            {/* Message d'alerte */}
            {showMessage && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md animate-slideDown">
                    <div className={`alert ${messageType === 'error' ? 'alert-error' : 'alert-success'} shadow-lg`}>
                        {messageType === 'error' ? (
                            <AlertCircle className="h-5 w-5" />
                        ) : (
                            <CheckCircle className="h-5 w-5" />
                        )}
                        <span>{messageText}</span>
                        <button onClick={() => setShowMessage(false)} className="btn btn-ghost btn-xs btn-circle">✕</button>
                    </div>
                </div>
            )}

            {/* Carte principale */}
            <div className="relative z-10 w-full max-w-6xl bg-base-100 rounded-3xl shadow-2xl overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                    {/* Section gauche - Hero */}
                    <div className="lg:w-1/2 relative hidden lg:block">
                        <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${backgroundImage})` }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-focus/80"></div>
                        <div className="relative h-full flex flex-col justify-center p-12 text-primary-content">
                            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Rejoignez-nous</h1>
                            <p className="text-lg lg:text-xl opacity-90 mb-8 leading-relaxed">
                                Créez votre compte professionnel et accédez à tous nos services.
                            </p>
                            <div className="mt-auto">
                                <p className="text-sm opacity-80 italic">
                                    "L'innovation distingue les leaders des suiveurs"
                                </p>
                                <p className="text-xs opacity-60 mt-2">
                                    - ECSI SARL
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section droite - Formulaire */}
                    <div className="lg:w-1/2 p-6 lg:p-8 max-h-[750px] overflow-y-auto">
                        <form onSubmit={handleSubmit(submission)} className="max-w-md mx-auto">
                            {/* Logo et titre */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-base-200 rounded-full shadow-lg mb-3">
                                    <img src={logo} alt="ECSI SARL" className="w-10 h-10 object-contain" />
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-base-content">Créer un compte</h2>
                                <p className="text-base-content/60 text-sm mt-1">
                                    Rejoignez l'écosystème ECSI SARL
                                </p>
                            </div>

                            {/* Email */}
                            <div className="form-control w-full mb-3">
                                <label className="label py-1">
                                    <span className="label-text font-medium text-sm">Email professionnel</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-base-content/40" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="votre@email.com"
                                        className={`input input-bordered input-sm lg:input-md w-full pl-10 ${errors.email ? 'input-error' : ''}`}
                                        disabled={isLoading}
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && (
                                    <label className="label py-1">
                                        <span className="label-text-alt text-error text-xs">{errors.email.message}</span>
                                    </label>
                                )}
                            </div>

                            {/* Mot de passe - 2 colonnes */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="form-control w-full">
                                    <label className="label py-1">
                                        <span className="label-text font-medium text-sm">Mot de passe</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-base-content/40" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className={`input input-bordered input-sm lg:input-md w-full pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                                            disabled={isLoading}
                                            {...register('password')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            disabled={isLoading}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-base-content/40 hover:text-base-content/60" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-base-content/40 hover:text-base-content/60" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <label className="label py-1">
                                            <span className="label-text-alt text-error text-xs">{errors.password.message}</span>
                                        </label>
                                    )}
                                </div>

                                <div className="form-control w-full">
                                    <label className="label py-1">
                                        <span className="label-text font-medium text-sm">Confirmer</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-base-content/40" />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className={`input input-bordered input-sm lg:input-md w-full pl-10 pr-10 ${errors.password2 ? 'input-error' : ''}`}
                                            disabled={isLoading}
                                            {...register('password2')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            disabled={isLoading}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4 text-base-content/40 hover:text-base-content/60" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-base-content/40 hover:text-base-content/60" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password2 && (
                                        <label className="label py-1">
                                            <span className="label-text-alt text-error text-xs">{errors.password2.message}</span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Prénom et Nom */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="form-control w-full">
                                    <label className="label py-1">
                                        <span className="label-text font-medium text-sm">Prénom</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-base-content/40" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="John"
                                            className="input input-bordered input-sm lg:input-md w-full pl-10"
                                            disabled={isLoading}
                                            {...register('first_name')}
                                        />
                                    </div>
                                </div>

                                <div className="form-control w-full">
                                    <label className="label py-1">
                                        <span className="label-text font-medium text-sm">Nom</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-base-content/40" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Doe"
                                            className="input input-bordered input-sm lg:input-md w-full pl-10"
                                            disabled={isLoading}
                                            {...register('last_name')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Téléphone */}
                            <div className="form-control w-full mb-3">
                                <label className="label py-1">
                                    <span className="label-text font-medium text-sm">Téléphone</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-4 w-4 text-base-content/40" />
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="+33 6 12 34 56 78"
                                        className="input input-bordered input-sm lg:input-md w-full pl-10"
                                        disabled={isLoading}
                                        {...register('phone')}
                                    />
                                </div>
                            </div>

                            <div className="divider my-2"></div>

                            {/* Sélection du type de compte */}
                            <div className="form-control w-full mb-3">
                                <label className="label py-1">
                                    <span className="label-text font-medium text-sm">Type de compte *</span>
                                </label>
                                <Controller
                                    name="role"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="dropdown w-full">
                                            <div 
                                                tabIndex={0} 
                                                className={`select select-bordered select-sm lg:select-md w-full flex items-center justify-between ${errors.role ? 'select-error' : ''}`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span>{roleInfo?.icon}</span>
                                                    <span>{roleInfo?.label}</span>
                                                </span>
                                                <ChevronDown className="h-4 w-4 opacity-50" />
                                            </div>
                                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full mt-1">
                                                {ROLES.map((role) => (
                                                    <li key={role.value}>
                                                        <a 
                                                            onClick={() => {
                                                                field.onChange(role.value)
                                                                const elem = document.activeElement
                                                                if (elem) elem.blur()
                                                            }}
                                                            className="flex items-start gap-3 py-2"
                                                        >
                                                            <span className="text-xl">{role.icon}</span>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-sm">{role.label}</span>
                                                                <span className="text-xs text-base-content/60">{role.description}</span>
                                                            </div>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                />
                                {errors.role && (
                                    <label className="label py-1">
                                        <span className="label-text-alt text-error text-xs">{errors.role.message}</span>
                                    </label>
                                )}
                            </div>

                            {/* Alerte pour validation requise */}
                            {roleInfo?.requiresApproval && (
                                <div className="alert alert-warning py-2 px-3 mb-3 text-xs shadow-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>⚠️ Ce rôle nécessite une validation par un administrateur avant activation.</span>
                                </div>
                            )}

                            {/* Bouton d'inscription */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full mb-3"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Création en cours...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        Créer mon compte
                                    </>
                                )}
                            </button>

                            {/* Lien connexion */}
                            <div className="text-center mb-3">
                                <p className="text-sm text-base-content/70">
                                    Déjà inscrit ?{' '}
                                    <Link 
                                        to="/" 
                                        className="text-secondary hover:text-secondary-focus link link-hover font-semibold"
                                    >
                                        Se connecter
                                    </Link>
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-base-300 pt-3 text-center">
                                <p className="text-xs text-base-content/50 mb-1">
                                    En créant un compte, vous acceptez nos conditions générales d'utilisation.
                                </p>
                                <p className="text-xs text-base-content/40">
                                    © {new Date().getFullYear()} ECSI SARL – Tous droits réservés
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
