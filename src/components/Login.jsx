// src/components/Login.jsx
import '../App.css'
import {React, useState} from 'react'
import { Box, Typography, Alert, Fade, Grid, Paper } from '@mui/material'
import MyTextField from './forms/MyTextField'
import MyPassField from './forms/MyPassField'
import MyButton from './forms/MyButton'
import {Link} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg'
import backgroundImage from '../assets/background-login.jpg'

// Couleurs de l'entreprise
const COMPANY_COLORS = {
  darkCyan: '#003C3f',
  vividOrange: '#DA4A0E',
  black: '#000000',
  darkCyanLight: 'rgba(0, 60, 63, 0.1)',
  vividOrangeLight: 'rgba(218, 74, 14, 0.1)',
  darkCyanTransparent: 'rgba(0, 60, 63, 0.8)'
}

const Login = () => {
    const navigate = useNavigate()
    
    const { handleSubmit, control } = useForm({
        defaultValues: {
            email: '', 
            password: ''
        }
    });

    const [showMessage, setShowMessage] = useState(false)
    const [messageText, setMessageText] = useState('')
    const [messageType, setMessageType] = useState('error')
    const [loading, setLoading] = useState(false)

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
            
            navigate('/home')
            
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

    return(
        <Box 
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                }
            }}
        >
            {/* Message Alert */}
            <Fade in={showMessage}>
                <Box sx={{ 
                    position: 'fixed',
                    top: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    width: '90%',
                    maxWidth: 400
                }}>
                    <Alert 
                        severity={messageType}
                        onClose={() => setShowMessage(false)}
                        sx={{
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            backgroundColor: 'white',
                            fontWeight: 500,
                            borderLeft: messageType === 'error' ? `4px solid ${COMPANY_COLORS.vividOrange}` : '4px solid #4caf50',
                        }}
                    >
                        {messageText}
                    </Alert>
                </Box>
            </Fade>
            
            {/* Conteneur principal avec deux colonnes */}
            <Grid 
                container 
                sx={{
                    maxWidth: 1200,
                    width: '90%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                    height: { xs: 'auto', md: 650 },
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Colonne gauche - Image */}
                <Grid 
                    item 
                    xs={12} 
                    md={6}
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyanTransparent} 0%, rgba(0, 60, 63, 0.6) 100%)`,
                        }
                    }}
                >
                    {/* Contenu superposé sur l'image */}
                    <Box
                        sx={{
                            position: 'relative',
                            zIndex: 2,
                            padding: 6,
                            color: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography 
                            variant="h3" 
                            sx={{ 
                                fontWeight: 700,
                                mb: 3,
                                fontSize: { md: '2.5rem', lg: '3rem' }
                            }}
                        >
                            ECSI SARL
                        </Typography>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                mb: 4,
                                opacity: 0.9,
                                fontWeight: 300,
                                lineHeight: 1.6
                            }}
                        >
                            Connectez-vous à votre espace professionnel
                        </Typography>
                        <Box sx={{ mt: 4 }}>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    opacity: 0.8,
                                    fontStyle: 'italic'
                                }}
                            >
                                "L'excellence est le seul chemin vers la réussite"
                            </Typography>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    opacity: 0.6,
                                    display: 'block',
                                    mt: 1
                                }}
                            >
                                - ECSI SARL
                            </Typography>
                        </Box>
                    </Box>
                </Grid>

                {/* Colonne droite - Formulaire */}
                <Grid 
                    item 
                    xs={12} 
                    md={6}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: { xs: 3, md: 4 },
                        backgroundColor: 'white'
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            width: '100%',
                            maxWidth: 450,
                            background: 'transparent',
                            padding: 0
                        }}
                    >
                        <form onSubmit={handleSubmit(handleLogin)}>
                            <Box 
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    mb: 2
                                }}
                            >
                                {/* Logo */}
                                <Box sx={{ 
                                    mb: 2,
                                    padding: '12px',
                                    backgroundColor: 'white',
                                    borderRadius: '50%',
                                    boxShadow: `0 8px 30px ${COMPANY_COLORS.darkCyanLight}`,
                                    width: '80px',
                                    height: '80px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: `1px solid ${COMPANY_COLORS.darkCyanLight}`
                                }}>
                                    <img 
                                        src={logo} 
                                        alt="Logo ECSI SARL" 
                                        style={{ 
                                            width: '55px', 
                                            height: '55px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </Box>
                                
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        textAlign: 'center', 
                                        mb: 0.5,
                                        fontWeight: 700,
                                        color: COMPANY_COLORS.darkCyan
                                    }}
                                >
                                    Connexion
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                    color: COMPANY_COLORS.black, 
                                    textAlign: 'center',
                                    mb: 2,
                                    opacity: 0.7
                                }}>
                                    Accédez à votre tableau de bord
                                </Typography>
                            </Box>

                            {/* Email Field */}
                            <Box sx={{ mb: 2 }}>
                                <MyTextField
                                    label="Email professionnel"
                                    name="email"
                                    control={control}
                                    rules={{ 
                                        required: "L'email est requis",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Email invalide"
                                        }
                                    }}
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            backgroundColor: 'white',
                                            '&:hover fieldset': {
                                                borderColor: COMPANY_COLORS.darkCyan,
                                                borderWidth: '2px'
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: COMPANY_COLORS.darkCyan,
                                                borderWidth: '2px'
                                            }
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: COMPANY_COLORS.black,
                                            opacity: 0.7,
                                            '&.Mui-focused': {
                                                color: COMPANY_COLORS.darkCyan
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            {/* Password Field */}
                            <Box sx={{ mb: 2 }}>
                                <MyPassField
                                    label="Mot de passe"
                                    name="password"
                                    control={control}
                                    rules={{ 
                                        required: "Le mot de passe est requis",
                                        minLength: {
                                            value: 6,
                                            message: "6 caractères minimum"
                                        }
                                    }}
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            backgroundColor: 'white',
                                            '&:hover fieldset': {
                                                borderColor: COMPANY_COLORS.darkCyan,
                                                borderWidth: '2px'
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: COMPANY_COLORS.darkCyan,
                                                borderWidth: '2px'
                                            }
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: COMPANY_COLORS.black,
                                            opacity: 0.7,
                                            '&.Mui-focused': {
                                                color: COMPANY_COLORS.darkCyan
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            {/* Lien "Forgot Password" */}
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end',
                                mb: 2
                            }}>
                                <Link 
                                    to="/request/password_reset" 
                                    style={{
                                        color: COMPANY_COLORS.darkCyan,
                                        textDecoration: 'none',
                                        fontSize: '0.8rem',
                                        fontWeight: '500',
                                        transition: 'all 0.3s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.color = COMPANY_COLORS.vividOrange
                                        e.target.style.textDecoration = 'underline'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.color = COMPANY_COLORS.darkCyan
                                        e.target.style.textDecoration = 'none'
                                    }}
                                >
                                    Mot de passe oublié ?
                                </Link>
                            </Box>

                            {/* Login Button */}
                            <Box sx={{ mb: 2 }}>
                                <MyButton 
                                    label={loading ? "Connexion en cours..." : "Se connecter"}
                                    type="submit"
                                    disabled={loading}
                                    loading={loading}
                                    fullWidth
                                    sx={{
                                        height: '48px',
                                        backgroundColor: `${COMPANY_COLORS.darkCyan} !important`,
                                        color: 'white !important',
                                        fontWeight: '600 !important',
                                        fontSize: '15px !important',
                                        textTransform: 'none',
                                        borderRadius: '12px !important',
                                        boxShadow: `0 4px 15px ${COMPANY_COLORS.darkCyan}40 !important`,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important',
                                        '&:hover': {
                                            backgroundColor: `${COMPANY_COLORS.vividOrange} !important`,
                                            boxShadow: `0 6px 20px ${COMPANY_COLORS.vividOrange}40 !important`,
                                            transform: 'translateY(-2px) !important'
                                        },
                                        '&:active': {
                                            transform: 'translateY(0) !important'
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#e0e0e0 !important',
                                            color: '#9e9e9e !important',
                                            boxShadow: 'none !important',
                                            transform: 'none !important'
                                        }
                                    }}
                                />
                            </Box>

                            {/* Bouton "Créer un compte" - Version corrigée avec marges réduites */}
                            <Box sx={{ 
                                textAlign: 'center',
                                mt: 1,
                                mb: 2
                            }}>
                                <Typography variant="body2" sx={{ 
                                    color: COMPANY_COLORS.black, 
                                    mb: 1, 
                                    opacity: 0.7,
                                    fontSize: '0.8rem'
                                }}>
                                    Pas encore de compte ?
                                </Typography>
                                <Link 
                                    to="/register" 
                                    style={{
                                        color: COMPANY_COLORS.vividOrange,
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.3s ease',
                                        padding: '8px 24px',
                                        borderRadius: '25px',
                                        backgroundColor: COMPANY_COLORS.vividOrangeLight,
                                        display: 'inline-block',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = COMPANY_COLORS.vividOrange
                                        e.target.style.color = 'white'
                                        e.target.style.transform = 'translateY(-1px)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = COMPANY_COLORS.vividOrangeLight
                                        e.target.style.color = COMPANY_COLORS.vividOrange
                                        e.target.style.transform = 'translateY(0)'
                                    }}
                                >
                                    Créer un compte
                                </Link>
                            </Box>

                            {/* Séparateur */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                my: 2,
                                opacity: 0.5
                            }}>
                                <Box sx={{ flex: 1, height: '1px', backgroundColor: COMPANY_COLORS.darkCyanLight }} />
                                <Typography variant="caption" sx={{ mx: 2, color: COMPANY_COLORS.darkCyan }}>
                                    OU
                                </Typography>
                                <Box sx={{ flex: 1, height: '1px', backgroundColor: COMPANY_COLORS.darkCyanLight }} />
                            </Box>

                            {/* Footer */}
                            <Box sx={{ 
                                pt: 1,
                                textAlign: 'center'
                            }}>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: COMPANY_COLORS.black,
                                        opacity: 0.5,
                                        fontSize: '0.7rem'
                                    }}
                                >
                                    © {new Date().getFullYear()} ECSI SARL – Tous droits réservés
                                </Typography>
                            </Box>
                        </form>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}

export default Login