// src/components/PasswordReset.jsx
import { React, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Lock, Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import AxiosInstance from './AxiosInstance'
import logo from '../assets/logo.svg'
import backgroundImage from '../assets/background-login.jpg'

const PasswordReset = () => {
    const navigate = useNavigate()
    const { token } = useParams()
    const { register, handleSubmit, watch, formState: { errors } } = useForm()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [countdown, setCountdown] = useState(6)

    // Validation de la correspondance des mots de passe
    const password = watch('password')

    const submission = async (data) => {
        setIsLoading(true)
        setErrorMessage('')
        
        try {
            await AxiosInstance.post(`api/password_reset/confirm/`, {
                password: data.password,
                token: token,
            })
            
            setShowSuccess(true)
            
            // Compte à rebours avant redirection
            let timeLeft = 6
            const timer = setInterval(() => {
                timeLeft -= 1
                setCountdown(timeLeft)
                if (timeLeft <= 0) {
                    clearInterval(timer)
                    navigate('/')
                }
            }, 1000)
            
            setTimeout(() => {
                navigate('/')
            }, 6000)
            
        } catch (error) {
            if (error.response?.data?.error) {
                setErrorMessage(error.response.data.error)
            } else if (error.response?.data?.token) {
                setErrorMessage('Le lien de réinitialisation est invalide ou a expiré.')
            } else if (error.request) {
                setErrorMessage('Serveur inaccessible. Veuillez réessayer plus tard.')
            } else {
                setErrorMessage('Une erreur est survenue. Veuillez réessayer.')
            }
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

            {/* Carte principale */}
            <div className="relative z-10 w-full max-w-md">
                {!showSuccess ? (
                    <div className="bg-base-100 rounded-3xl shadow-2xl p-8 lg:p-10">
                        {/* Logo et titre */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-base-200 rounded-full shadow-lg mb-4">
                                <img src={logo} alt="ECSI SARL" className="w-10 h-10 object-contain" />
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-base-content mb-2">
                                Réinitialisation du mot de passe
                            </h2>
                            <p className="text-base-content/60 text-sm">
                                Choisissez un nouveau mot de passe sécurisé
                            </p>
                        </div>

                        {/* Message d'erreur */}
                        {errorMessage && (
                            <div className="alert alert-error mb-6 shadow-sm">
                                <AlertCircle className="h-5 w-5" />
                                <span className="text-sm">{errorMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(submission)}>
                            {/* Champ Mot de passe */}
                            <div className="form-control w-full mb-4">
                                <label className="label">
                                    <span className="label-text font-medium">Nouveau mot de passe</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-base-content/40" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={`input input-bordered w-full pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                                        disabled={isLoading}
                                        {...register('password', {
                                            required: "Le mot de passe est requis",
                                            minLength: {
                                                value: 8,
                                                message: "Le mot de passe doit contenir au moins 8 caractères"
                                            },
                                            pattern: {
                                                value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
                                                message: "Le mot de passe doit contenir au moins une lettre et un chiffre"
                                            }
                                        })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-base-content/40 hover:text-base-content/60" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-base-content/40 hover:text-base-content/60" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.password.message}</span>
                                    </label>
                                )}
                            </div>

                            {/* Indicateur de force du mot de passe */}
                            {password && !errors.password && (
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-xs text-base-content/60">Force du mot de passe :</div>
                                        <div className={`badge badge-sm ${
                                            password.length >= 12 ? 'badge-success' : 
                                            password.length >= 8 ? 'badge-warning' : 'badge-error'
                                        }`}>
                                            {password.length >= 12 ? 'Fort' : 
                                             password.length >= 8 ? 'Moyen' : 'Faible'}
                                        </div>
                                    </div>
                                    <progress 
                                        className={`progress w-full ${
                                            password.length >= 12 ? 'progress-success' : 
                                            password.length >= 8 ? 'progress-warning' : 'progress-error'
                                        }`}
                                        value={Math.min(password.length * 8.33, 100)} 
                                        max="100"
                                    ></progress>
                                </div>
                            )}

                            {/* Champ Confirmation du mot de passe */}
                            <div className="form-control w-full mb-6">
                                <label className="label">
                                    <span className="label-text font-medium">Confirmer le mot de passe</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-base-content/40" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={`input input-bordered w-full pl-10 pr-10 ${errors.password2 ? 'input-error' : ''}`}
                                        disabled={isLoading}
                                        {...register('password2', {
                                            required: "La confirmation est requise",
                                            validate: value => value === password || "Les mots de passe ne correspondent pas"
                                        })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        disabled={isLoading}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-base-content/40 hover:text-base-content/60" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-base-content/40 hover:text-base-content/60" />
                                        )}
                                    </button>
                                </div>
                                {errors.password2 && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.password2.message}</span>
                                    </label>
                                )}
                            </div>

                            {/* Conseils de sécurité */}
                            <div className="bg-info/10 border border-info/20 rounded-lg p-4 mb-6">
                                <h4 className="text-sm font-semibold text-info mb-2">🔐 Conseils de sécurité :</h4>
                                <ul className="text-xs text-base-content/70 space-y-1">
                                    <li className="flex items-start gap-2">
                                        <span className="text-info mt-0.5">•</span>
                                        <span>Utilisez au moins 8 caractères</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-info mt-0.5">•</span>
                                        <span>Mélangez lettres majuscules, minuscules et chiffres</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-info mt-0.5">•</span>
                                        <span>Évitez les informations personnelles</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Bouton de réinitialisation */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full mb-4"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Réinitialisation en cours...
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="h-4 w-4" />
                                        Réinitialiser le mot de passe
                                    </>
                                )}
                            </button>

                            {/* Lien retour */}
                            <div className="text-center">
                                <Link 
                                    to="/" 
                                    className="btn btn-ghost btn-sm gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Retour à la connexion
                                </Link>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="text-center mt-6 pt-4 border-t border-base-300">
                            <p className="text-xs text-base-content/40">
                                © {new Date().getFullYear()} ECSI SARL – Tous droits réservés
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Message de succès */
                    <div className="bg-base-100 rounded-3xl shadow-2xl p-8 lg:p-10">
                        <div className="text-center">
                            {/* Icône de succès */}
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full animate-pulse">
                                    <CheckCircle className="h-12 w-12 text-success" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-base-content mb-3">
                                Mot de passe modifié !
                            </h3>
                            
                            <div className="bg-success/5 border border-success/20 rounded-xl p-6 mb-6">
                                <p className="text-base-content/80 text-sm leading-relaxed">
                                    Votre mot de passe a été réinitialisé avec succès. 
                                    Vous allez être redirigé vers la page de connexion.
                                </p>
                            </div>

                            {/* Compte à rebours */}
                            <div className="mb-6">
                                <div className="text-sm text-base-content/60 mb-2">
                                    Redirection automatique dans
                                </div>
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                                    <span className="text-2xl font-bold text-primary">{countdown}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <Link 
                                    to="/" 
                                    className="btn btn-primary w-full"
                                >
                                    Se connecter maintenant
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PasswordReset
