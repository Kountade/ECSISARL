// src/components/Login.jsx
import { React, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react'
import AxiosInstance from './AxiosInstance'
import logo from '../assets/logo.svg'
import backgroundImage from '../assets/background-login.jpg'

const Login = () => {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [showMessage, setShowMessage] = useState(false)
    const [messageText, setMessageText] = useState('')
    const [messageType, setMessageType] = useState('error')
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const handleLogin = async (data) => {
        setLoading(true)
        setShowMessage(false)

        try {
            const response = await AxiosInstance.post('login/', {
                email: data.email,
                password: data.password,
            })

            localStorage.setItem('Token', response.data.token)
            localStorage.setItem('User', JSON.stringify(response.data.user))

            navigate('/dashboard')

        } catch (error) {
            let errorMessage = 'Échec de connexion. Veuillez réessayer.'

            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'Email ou mot de passe incorrect'
                } else if (error.response.data && error.response.data.error) {
                    errorMessage = error.response.data.error
                }
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
            setLoading(false)
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            {messageType === 'error' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                        </svg>
                        <span>{messageText}</span>
                        <button onClick={() => setShowMessage(false)} className="btn btn-ghost btn-xs btn-circle">✕</button>
                    </div>
                </div>
            )}

            {/* Carte principale */}
            <div className="relative z-10 w-full max-w-5xl bg-base-100 rounded-3xl shadow-2xl overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                    {/* Section gauche - Hero */}
                    <div className="lg:w-1/2 relative hidden lg:block">
                        <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${backgroundImage})` }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-focus/80"></div>
                        <div className="relative h-full flex flex-col justify-center p-12 text-primary-content">
                            <h1 className="text-4xl lg:text-5xl font-bold mb-6">ECSI SARL</h1>
                            <p className="text-lg lg:text-xl opacity-90 mb-8 leading-relaxed">
                                Connectez-vous à votre espace professionnel
                            </p>
                            <div className="mt-auto">
                                <p className="text-sm opacity-80 italic">
                                    "L'excellence est le seul chemin vers la réussite"
                                </p>
                                <p className="text-xs opacity-60 mt-2">
                                    - ECSI SARL
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section droite - Formulaire */}
                    <div className="lg:w-1/2 p-8 lg:p-12">
                        <form onSubmit={handleSubmit(handleLogin)} className="max-w-md mx-auto">
                            {/* Logo et titre */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-base-200 rounded-full shadow-lg mb-4">
                                    <img src={logo} alt="ECSI SARL" className="w-12 h-12 object-contain" />
                                </div>
                                <h2 className="text-3xl font-bold text-base-content">Connexion</h2>
                                <p className="text-base-content/60 text-sm mt-2">
                                    Accédez à votre tableau de bord
                                </p>
                            </div>

                            {/* Champ Email */}
                            <div className="form-control w-full mb-4">
                                <label className="label">
                                    <span className="label-text font-medium">Email professionnel</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-base-content/40" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="votre@email.com"
                                        className={`input input-bordered w-full pl-10 ${errors.email ? 'input-error' : ''}`}
                                        {...register('email', {
                                            required: "L'email est requis",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Email invalide"
                                            }
                                        })}
                                    />
                                </div>
                                {errors.email && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.email.message}</span>
                                    </label>
                                )}
                            </div>

                            {/* Champ Mot de passe */}
                            <div className="form-control w-full mb-4">
                                <label className="label">
                                    <span className="label-text font-medium">Mot de passe</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-base-content/40" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={`input input-bordered w-full pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                                        {...register('password', {
                                            required: "Le mot de passe est requis",
                                            minLength: {
                                                value: 6,
                                                message: "6 caractères minimum"
                                            }
                                        })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
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

                            {/* Mot de passe oublié */}
                            <div className="text-right mb-6">
                                <Link 
                                    to="/request/password_reset"
                                    className="text-sm text-primary hover:text-primary-focus link link-hover"
                                >
                                    Mot de passe oublié ?
                                </Link>
                            </div>

                            {/* Bouton de connexion */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full mb-4"
                            >
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        Connexion en cours...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="h-5 w-5" />
                                        Se connecter
                                    </>
                                )}
                            </button>

                            {/* Créer un compte */}
                            <div className="text-center mb-6">
                                <p className="text-sm text-base-content/60 mb-2">
                                    Pas encore de compte ?
                                </p>
                                <Link 
                                    to="/register"
                                    className="btn btn-outline btn-secondary btn-sm"
                                >
                                    Créer un compte
                                </Link>
                            </div>

                            {/* Séparateur */}
                            <div className="divider text-base-content/40 text-xs">OU</div>

                            {/* Footer */}
                            <div className="text-center mt-6">
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

export default Login