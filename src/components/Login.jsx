// src/components/Login.jsx
import '../App.css'
import {React, useState} from 'react'
import { Box, Typography, Paper, Divider } from '@mui/material'
import MyTextField from './forms/MyTextField'
import MyPassField from './forms/MyPassField'
import MyButton from './forms/MyButton'
import {Link} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { useNavigate } from 'react-router-dom'
import MyMessage from './Message'
import logo from '../assets/logo.svg'

const Login = () =>{
    const navigate = useNavigate()
    
    const { handleSubmit, control } = useForm({
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

    return(
        <div className={"myBackground"}> 
            {ShowMessage && <MyMessage text={messageText} color={'#EC5A76'}/>}
            
            <form onSubmit={handleSubmit(submission)}>
                <Box className={"whiteBox"} sx={{ textAlign: 'center' }}>
                    
                    {/* Logo */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Box sx={{
                            width: 70,
                            height: 70,
                            backgroundColor: '#fff',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px',
                            boxShadow: '0 8px 20px rgba(10,38,71,0.2)',
                            border: `2px solid #C9A03D`
                        }}>
                            <img src={logo} alt="Logo GALSENSHOP" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </Box>
                    </Box>

                    {/* Titre principal */}
                    <Typography variant="h4" component="h1" sx={{
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
                    
                    {/* Sous-titre */}
                    <Typography variant="body2" sx={{ color: '#0A2647', mb: 3, fontWeight: 500, opacity: 0.8 }}>
                        Connectez-vous à votre espace professionnel
                    </Typography>

                    <Divider sx={{ mb: 3, borderColor: 'rgba(201,160,61,0.3)' }} />

                    {/* Champs */}
                    <Box sx={{ mb: 2 }}>
                        <MyTextField
                            label={"Email professionnel"}
                            name={"email"}
                            control={control}
                            rules={{ 
                                required: "L'email est requis",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Email invalide"
                                }
                            }}
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <MyPassField
                            label={"Mot de passe"}
                            name={"password"}
                            control={control}
                            rules={{ 
                                required: "Le mot de passe est requis",
                                minLength: {
                                    value: 6,
                                    message: "6 caractères minimum"
                                }
                            }}
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <MyButton 
                            label={"Se connecter"}
                            type={"submit"}
                            fullWidth
                        />
                    </Box>

                    {/* Liens */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                        <Link to="/register" style={{ fontSize: '0.85rem' }}>
                            Pas encore de compte ? Inscrivez-vous
                        </Link>
                        <Link to="/request/password_reset" style={{ fontSize: '0.85rem' }}>
                            Mot de passe oublié ?
                        </Link>
                    </Box>

                    {/* Mention légale */}
                    <Typography variant="caption" sx={{ display: 'block', mt: 3, color: '#999' }}>
                        © {new Date().getFullYear()} ECSI SARL – Tous droits réservés
                    </Typography>
                </Box>
            </form>
        </div>
    )
}

export default Login