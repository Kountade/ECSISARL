// src/components/Register.jsx
import '../App.css'
import {React, useState, useEffect} from 'react'
import { 
  Box, MenuItem, Typography, Paper, Alert, Divider, 
  FormHelperText, FormControl, InputLabel, Select,
  Fade, Grid
} from '@mui/material'
import MyButton from './forms/MyButton'
import MyTextField from './forms/MyTextField'
import MyPassField from './forms/MyPassField'
import {Link} from 'react-router-dom'
import {useForm, Controller} from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { useNavigate } from 'react-router-dom'
import {yupResolver} from "@hookform/resolvers/yup"
import * as yup from "yup"
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
];

const Register = () => {
    const navigate = useNavigate()

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
    });

    const {handleSubmit, control, watch, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { 
            role: 'commercial', 
            first_name: '', 
            last_name: '', 
            phone: '' 
        }
    });

    // Surveiller le changement du rôle
    const roleValue = watch('role');
    useEffect(() => {
        setSelectedRole(roleValue);
        setRoleInfo(ROLES.find(r => r.value === roleValue));
    }, [roleValue]);

    const submission = async (data) => {
        setIsLoading(true)
        setShowMessage(false)

        const { password2, ...submitData } = data;

        try {
            await AxiosInstance.post(`register/`, submitData)
            
            const role = ROLES.find(r => r.value === data.role);
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
            
            {/* Conteneur principal avec deux colonnes - CARTE AGRANDIE */}
            <Grid 
                container 
                sx={{
                    maxWidth: 1300,
                    width: '90%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                    height: { xs: 'auto', md: 750 },
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
                    <Box
                        sx={{
                            position: 'relative',
                            zIndex: 2,
                            padding: 5,
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
                                mb: 2.5,
                                fontSize: { md: '2.5rem', lg: '3rem' }
                            }}
                        >
                            Rejoignez-nous
                        </Typography>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                mb: 3,
                                opacity: 0.9,
                                fontWeight: 300,
                                lineHeight: 1.5
                            }}
                        >
                            Créez votre compte professionnel et accédez à tous nos services.
                        </Typography>
                        <Box sx={{ mt: 3 }}>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    opacity: 0.8,
                                    fontStyle: 'italic'
                                }}
                            >
                                "L'innovation distingue les leaders des suiveurs"
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

                {/* Colonne droite - Formulaire - PLUS D'ESPACE */}
                <Grid 
                    item 
                    xs={12} 
                    md={6}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: { xs: 3, md: 4 },
                        backgroundColor: 'white',
                        overflow: 'visible'
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            width: '100%',
                            maxWidth: 480,
                            background: 'transparent',
                            padding: 0
                        }}
                    >
                        <form onSubmit={handleSubmit(submission)}>
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
                                    boxShadow: `0 8px 25px ${COMPANY_COLORS.darkCyanLight}`,
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
                                        mb: 1,
                                        fontWeight: 700,
                                        color: COMPANY_COLORS.darkCyan
                                    }}
                                >
                                    Créer un compte
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                    color: COMPANY_COLORS.black, 
                                    textAlign: 'center',
                                    mb: 2,
                                    opacity: 0.7
                                }}>
                                    Rejoignez l'écosystème ECSI SARL
                                </Typography>
                            </Box>

                            {/* Email */}
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
                                    disabled={isLoading}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            '&:hover fieldset': {
                                                borderColor: COMPANY_COLORS.darkCyan,
                                                borderWidth: '2px'
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            {/* Mot de passe - 2 colonnes */}
                            <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr', 
                                gap: 2, 
                                mb: 2 
                            }}>
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
                                    disabled={isLoading}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            '&:hover fieldset': {
                                                borderColor: COMPANY_COLORS.darkCyan,
                                                borderWidth: '2px'
                                            }
                                        }
                                    }}
                                />
                                <MyPassField
                                    label="Confirmer"
                                    name="password2"
                                    control={control}
                                    rules={{ 
                                        required: "La confirmation est requise"
                                    }}
                                    fullWidth
                                    disabled={isLoading}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            '&:hover fieldset': {
                                                borderColor: COMPANY_COLORS.darkCyan,
                                                borderWidth: '2px'
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            {/* Prénom, Nom */}
                            <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr', 
                                gap: 2, 
                                mb: 2 
                            }}>
                                <MyTextField
                                    label="Prénom"
                                    name="first_name"
                                    control={control}
                                    fullWidth
                                    disabled={isLoading}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            '&:hover fieldset': {
                                                borderColor: COMPANY_COLORS.darkCyan,
                                                borderWidth: '2px'
                                            }
                                        }
                                    }}
                                />
                                <MyTextField
                                    label="Nom"
                                    name="last_name"
                                    control={control}
                                    fullWidth
                                    disabled={isLoading}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            '&:hover fieldset': {
                                                borderColor: COMPANY_COLORS.darkCyan,
                                                borderWidth: '2px'
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            {/* Téléphone */}
                            <Box sx={{ mb: 2 }}>
                                <MyTextField
                                    label="Téléphone"
                                    name="phone"
                                    control={control}
                                    fullWidth
                                    disabled={isLoading}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            '&:hover fieldset': {
                                                borderColor: COMPANY_COLORS.darkCyan,
                                                borderWidth: '2px'
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            <Divider sx={{ my: 1.5 }} />

                            {/* Sélection du type de compte */}
                            <FormControl fullWidth error={!!errors.role} sx={{ mb: 2 }}>
                                <InputLabel id="role-select-label" sx={{ color: COMPANY_COLORS.black, opacity: 0.7 }}>
                                    Type de compte *
                                </InputLabel>
                                <Controller
                                    name="role"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            labelId="role-select-label"
                                            label="Type de compte *"
                                            disabled={isLoading}
                                            sx={{
                                                borderRadius: '10px',
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: COMPANY_COLORS.darkCyan,
                                                    borderWidth: '2px'
                                                }
                                            }}
                                        >
                                            {ROLES.map((role) => (
                                                <MenuItem key={role.value} value={role.value}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <span style={{ fontSize: '1.2rem' }}>{role.icon}</span>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={500}>{role.label}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{role.description}</Typography>
                                                        </Box>
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
                            </FormControl>

                            {/* Alerte pour validation requise */}
                            {roleInfo?.requiresApproval && (
                                <Alert 
                                    severity="warning" 
                                    sx={{ 
                                        mb: 2, 
                                        py: 0.5, 
                                        fontSize: '0.75rem',
                                        borderRadius: '8px',
                                        backgroundColor: COMPANY_COLORS.vividOrangeLight,
                                        '& .MuiAlert-icon': {
                                            fontSize: '1rem'
                                        }
                                    }}
                                >
                                    ⚠️ Ce rôle nécessite une validation par un administrateur avant activation.
                                </Alert>
                            )}

                            {/* Bouton d'inscription */}
                            <Box sx={{ mb: 2 }}>
                                <MyButton 
                                    type="submit"
                                    label={isLoading ? "Création en cours..." : "Créer mon compte"}
                                    disabled={isLoading}
                                    loading={isLoading}
                                    fullWidth
                                    sx={{
                                        height: '48px',
                                        backgroundColor: `${COMPANY_COLORS.darkCyan} !important`,
                                        color: 'white !important',
                                        fontWeight: '600 !important',
                                        fontSize: '15px !important',
                                        textTransform: 'none',
                                        borderRadius: '10px !important',
                                        boxShadow: `0 4px 15px ${COMPANY_COLORS.darkCyan}40 !important`,
                                        '&:hover': {
                                            backgroundColor: `${COMPANY_COLORS.vividOrange} !important`,
                                            transform: 'translateY(-2px) !important'
                                        }
                                    }}
                                />
                            </Box>

                            {/* Lien connexion */}
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                                <Typography variant="body2" sx={{ color: COMPANY_COLORS.black, opacity: 0.7 }}>
                                    Déjà inscrit ?{' '}
                                    <Link 
                                        to="/" 
                                        style={{
                                            color: COMPANY_COLORS.vividOrange,
                                            textDecoration: 'none',
                                            fontWeight: '600',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.textDecoration = 'underline'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.textDecoration = 'none'
                                        }}
                                    >
                                        Se connecter
                                    </Link>
                                </Typography>
                            </Box>

                            {/* Footer */}
                            <Box sx={{ 
                                pt: 2,
                                textAlign: 'center',
                                borderTop: `1px solid ${COMPANY_COLORS.darkCyanLight}`
                            }}>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: COMPANY_COLORS.black,
                                        opacity: 0.5,
                                        fontSize: '0.7rem'
                                    }}
                                >
                                    En créant un compte, vous acceptez nos conditions générales d'utilisation.
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        display: 'block',
                                        mt: 0.5,
                                        color: COMPANY_COLORS.black,
                                        opacity: 0.5,
                                        fontSize: '0.65rem'
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

export default Register