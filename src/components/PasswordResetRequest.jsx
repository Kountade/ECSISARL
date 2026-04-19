// src/components/PasswordResetRequest.jsx
import { React, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Send, ArrowLeft, CheckCircle } from 'lucide-react'
import AxiosInstance from './AxiosInstance'
import logo from '../assets/logo.svg'
import backgroundImage from '../assets/background-login.jpg'

const PasswordResetRequest = () => {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const [showSuccess, setShowSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const submission = async (data) => {
        setIsLoading(true)
        setErrorMessage('')
        
        try {
            await AxiosInstance.post(`api/password_reset/`, {
                email: data.email,
            })
            setShowSuccess(true)
        } catch (error) {
            if (error.response?.data?.error) {
                setErrorMessage(error.response.data.error)
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
                                Mot de passe oublié ?
                            </h2>
                            <p className="text-base-content/60 text-sm">
                                Entrez votre email pour recevoir un lien de réinitialisation
                            </p>
                        </div>

                        {/* Message d'erreur */}
                        {errorMessage && (
                            <div className="alert alert-error mb-6 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm">{errorMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(submission)}>
                            {/* Champ Email */}
                            <div className="form-control w-full mb-6">
                                <label className="label">
                                    <span className="label-text font-medium">Adresse email</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-base-content/40" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="votre@email.com"
                                        className={`input input-bordered w-full pl-10 ${errors.email ? 'input-error' : ''}`}
                                        disabled={isLoading}
                                        {...register('email', {
                                            required: "L'email est requis",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Format d'email invalide"
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

                            {/* Bouton d'envoi */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full mb-4"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Envoi en cours...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Envoyer le lien
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
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full">
                                    <CheckCircle className="h-12 w-12 text-success" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-base-content mb-3">
                                Email envoyé !
                            </h3>
                            
                            <div className="bg-success/5 border border-success/20 rounded-xl p-6 mb-6">
                                <p className="text-base-content/80 text-sm leading-relaxed">
                                    Si un compte existe avec cette adresse email, vous recevrez 
                                    un message contenant les instructions pour réinitialiser 
                                    votre mot de passe.
                                </p>
                            </div>

                            <p className="text-base-content/60 text-xs mb-6">
                                Vérifiez votre boîte de réception et vos spams.
                            </p>

                            {/* Actions */}
                            <div className="space-y-3">
                                <Link 
                                    to="/" 
                                    className="btn btn-primary w-full"
                                >
                                    Retour à la connexion
                                </Link>
                                
                                <button
                                    onClick={() => setShowSuccess(false)}
                                    className="btn btn-ghost btn-sm"
                                >
                                    Envoyer à une autre adresse
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PasswordResetRequest