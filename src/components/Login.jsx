// src/components/Login.jsx
import '../App.css'
import {React, useState} from 'react'
import { Box, Typography, Paper, Divider, useMediaQuery, useTheme, TextField } from '@mui/material'
import MyButton from './forms/MyButton'
import {Link} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { useNavigate } from 'react-router-dom'
import MyMessage from './Message'
import logo from '../assets/logo.svg'

const Login = () => {
    const navigate = useNavigate()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))

    const { handleSubmit, control, register, formState: { errors } } = useForm({
        defaultValues: {
            email: '', 
            password: ''
        }
    });

    const [ShowMessage, setShowMessage] = useState(false)
    const [messageText, setMessageText] = useState('')

    const submission = (data) => {
        AxiosInstance.post(`login/`, {
            email: data.email, 
            password: data.password,
        })
        .then((response) => {
            localStorage.setItem('Token', response.data.token)
            localStorage.setItem('User', JSON.stringify(response.data.user))
            navigate('/home')
        })
        .catch((error) => {
            if (error.response && error.response.status === 401) {
                setMessageText('Email ou mot de passe incorrect')
            } else if (error.response?.data?.error) {
                setMessageText(error.response.data.error)
            } else if (error.request) {
                setMessageText('Serveur inaccessible. Vérifiez votre connexion.')
            } else {
                setMessageText('Échec de connexion. Veuillez réessayer.')
            }
            setShowMessage(true)
        })
    }

    // Taille du logo responsive
    const logoSizes = {
        width: isMobile ? 50 : 70,
        height: isMobile ? 50 : 70,
        padding: isMobile ? '6px' : '10px',
        borderRadius: isMobile ? '12px' : '16px'
    }

    // Espacements responsifs
    const containerPadding = isMobile ? 2 : 3
    const gapGrid = isMobile ? 1.5 : 2

    return (
        <div className={"myBackground"}> 
            {ShowMessage && <MyMessage text={messageText} color={'#EC5A76'}/>}
            
            <Box sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                py: isMobile ? 1 : 2,
                px: isMobile ? 1 : 2
            }}>
                <Paper elevation={6} sx={{ 
                    width: '100%', 
                    maxWidth: isMobile ? '95%' : 480, 
                    borderRadius: isMobile ? 2 : 3, 
                    overflow: 'hidden',
                    textAlign: 'center'
                }}>
                    
                    <Box sx={{ p: containerPadding }}>
                        {/* Logo responsive */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: gapGrid }}>
                            <Box sx={{
                                width: logoSizes.width,
                                height: logoSizes.height,
                                backgroundColor: '#fff',
                                borderRadius: logoSizes.borderRadius,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: logoSizes.padding,
                                boxShadow: '0 8px 20px rgba(10,38,71,0.2)',
                                border: `2px solid #C9A03D`
                            }}>
                                <img src={logo} alt="Logo ECSI SARL" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </Box>
                        </Box>

                        {/* Titre principal responsive */}
                        <Typography variant={isMobile ? "h5" : "h4"} component="h1" sx={{
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #0A2647 0%, #C9A03D 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 0.5,
                            letterSpacing: '-0.5px'
                        }}>
                            ECSI SARL
                        </Typography>
                        
                        {/* Sous-titre responsive */}
                        <Typography variant="body2" sx={{ 
                            color: '#0A2647', 
                            mb: gapGrid, 
                            fontWeight: 500, 
                            opacity: 0.8,
                            fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }}>
                            Connectez-vous à votre espace professionnel
                        </Typography>

                        <Divider sx={{ mb: gapGrid, borderColor: 'rgba(201,160,61,0.3)' }} />

                        {/* Champ Email */}
                        <Box sx={{ mb: gapGrid }}>
                            <TextField
                                label="Email professionnel"
                                fullWidth
                                size="small"
                                {...register('email', { 
                                    required: "L'email est requis",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Email invalide"
                                    }
                                })}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                        </Box>

                        {/* Champ Mot de passe */}
                        <Box sx={{ mb: gapGrid }}>
                            <TextField
                                label="Mot de passe"
                                type="password"
                                fullWidth
                                size="small"
                                {...register('password', { 
                                    required: "Le mot de passe est requis",
                                    minLength: {
                                        value: 6,
                                        message: "6 caractères minimum"
                                    }
                                })}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                            />
                        </Box>

                        {/* Bouton de connexion */}
                        <Box sx={{ mb: gapGrid }}>
                            <MyButton 
                                label={"Se connecter"}
                                type={"submit"}
                                fullWidth
                                sx={{ py: isMobile ? 1 : 1.2, fontSize: isMobile ? '0.8rem' : '0.9rem' }}
                            />
                        </Box>

                        {/* Liens responsifs */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 0.5 : 1, mt: 1 }}>
                            <Link to="/register" style={{ fontSize: isMobile ? '0.75rem' : '0.85rem' }}>
                                Pas encore de compte ? Inscrivez-vous
                            </Link>
                            <Link to="/request/password_reset" style={{ fontSize: isMobile ? '0.75rem' : '0.85rem' }}>
                                Mot de passe oublié ?
                            </Link>
                        </Box>

                        {/* Mention légale responsive */}
                        <Typography variant="caption" sx={{ 
                            display: 'block', 
                            mt: gapGrid, 
                            color: '#999',
                            fontSize: isMobile ? '0.6rem' : '0.7rem'
                        }}>
                            © {new Date().getFullYear()} ECSI SARL – Tous droits réservés
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </div>
    )
}

export default Login