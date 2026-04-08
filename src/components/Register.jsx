// src/components/Register.jsx
import '../App.css'
import {React, useState, useEffect} from 'react'
import { 
  Box, MenuItem, Typography, Paper, Alert, Divider, 
  FormHelperText, FormControl, InputLabel, Select, TextField 
} from '@mui/material'
import MyButton from './forms/MyButton'
import {Link} from 'react-router-dom'
import {useForm, Controller} from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { useNavigate } from 'react-router-dom'
import {yupResolver} from "@hookform/resolvers/yup"
import * as yup from "yup"
import MyMessage from './Message'
import logo from '../assets/logo.svg'

// Configuration des rôles (super_admin et commercial uniquement)
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
    const [messageColor, setMessageColor] = useState('#EC5A76')
    const [isLoading, setIsLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState('commercial')
    const [roleInfo, setRoleInfo] = useState(ROLES.find(r => r.value === 'commercial'))

    // Schéma de validation
    const schema = yup.object({
        email: yup.string().email('Email invalide').required('Email requis'),
        password: yup.string().required('Mot de passe requis').min(8, '8 caractères minimum'),
        password2: yup.string().required('Confirmation requise').oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas'),
        role: yup.string().required('Veuillez sélectionner un type de compte'),
        first_name: yup.string().optional(),
        last_name: yup.string().optional(),
        phone: yup.string().optional()
    });

    const {handleSubmit, control, watch, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { role: 'commercial', first_name: '', last_name: '', phone: '' }
    });

    // Surveiller le changement du rôle
    const roleValue = watch('role');
    useEffect(() => {
        setSelectedRole(roleValue);
        setRoleInfo(ROLES.find(r => r.value === roleValue));
    }, [roleValue]);

    const submission = (data) => {
        setIsLoading(true)
        setShowMessage(false)

        const { password2, ...submitData } = data;

        AxiosInstance.post(`register/`, submitData)
        .then(() => {
            const role = ROLES.find(r => r.value === data.role);
            setMessageText(role.requiresApproval 
                ? 'Inscription enregistrée – En attente de validation par un administrateur.' 
                : 'Inscription réussie ! Vous pouvez maintenant vous connecter.')
            setMessageColor('#4CAF50')
            setShowMessage(true)
            setTimeout(() => navigate('/'), 2500)
        })
        .catch((error) => {
            let errorMessage = 'Échec de l’inscription'
            if (error.response?.data?.email) errorMessage = 'Cet email est déjà utilisé'
            else if (error.request) errorMessage = 'Serveur inaccessible. Vérifiez votre connexion.'
            
            setMessageText(errorMessage)
            setMessageColor('#EC5A76')
            setShowMessage(true)
        })
        .finally(() => setIsLoading(false))
    }

    return (
        <div className={"myBackground"}> 
            {showMessage && <MyMessage text={messageText} color={messageColor}/>}

            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                <Paper elevation={6} sx={{ width: '100%', maxWidth: 520, borderRadius: 3, overflow: 'hidden' }}>
                    
                    {/* En-tête avec logo */}
                    <Box sx={{ 
                        bgcolor: '#0A2647', 
                        color: 'white', 
                        py: 2.5, 
                        textAlign: 'center',
                        borderBottom: `3px solid #C9A03D`
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                            <Box sx={{
                                width: 60,
                                height: 60,
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px',
                                boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                                border: `2px solid #C9A03D`
                            }}>
                                <img src={logo} alt="Logo GALSENSHOP" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </Box>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.3px' }}>
                            Créer un compte professionnel
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                            Rejoignez l'écosystème GALSENSHOP ERP
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit(submission)}>
                        <Box sx={{ p: 3 }}>
                            
                            {/* Email */}
                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    label="Email professionnel"
                                    fullWidth
                                    size="small"
                                    {...control.register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    disabled={isLoading}
                                />
                            </Box>

                            {/* Mot de passe */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
                                <TextField
                                    label="Mot de passe"
                                    type="password"
                                    size="small"
                                    fullWidth
                                    {...control.register('password')}
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    disabled={isLoading}
                                />
                                <TextField
                                    label="Confirmer"
                                    type="password"
                                    size="small"
                                    fullWidth
                                    {...control.register('password2')}
                                    error={!!errors.password2}
                                    helperText={errors.password2?.message}
                                    disabled={isLoading}
                                />
                            </Box>

                            {/* Prénom, Nom, Téléphone */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, mb: 2 }}>
                                <TextField
                                    label="Prénom"
                                    size="small"
                                    fullWidth
                                    {...control.register('first_name')}
                                    disabled={isLoading}
                                />
                                <TextField
                                    label="Nom"
                                    size="small"
                                    fullWidth
                                    {...control.register('last_name')}
                                    disabled={isLoading}
                                />
                                <TextField
                                    label="Téléphone"
                                    size="small"
                                    fullWidth
                                    {...control.register('phone')}
                                    disabled={isLoading}
                                />
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Sélection du type de compte - ComboBox */}
                            <FormControl fullWidth size="small" error={!!errors.role} sx={{ mb: 2 }}>
                                <InputLabel id="role-select-label">Type de compte *</InputLabel>
                                <Controller
                                    name="role"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            labelId="role-select-label"
                                            label="Type de compte *"
                                            disabled={isLoading}
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
                                <Alert severity="warning" sx={{ mb: 2, py: 0, fontSize: '0.75rem' }}>
                                    ⚠️ Ce rôle nécessite une validation par un administrateur avant activation.
                                </Alert>
                            )}

                            {/* Bouton d'inscription */}
                            <Box sx={{ mb: 2 }}>
                                <MyButton 
                                    type={"submit"}
                                    label={isLoading ? "Création en cours..." : "Créer mon compte"}
                                    disabled={isLoading}
                                    fullWidth
                                    sx={{ py: 1.2, fontSize: '0.9rem' }}
                                />
                            </Box>

                            {/* Lien connexion */}
                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                                <Link to="/" style={{ color: '#C9A03D', fontSize: '0.85rem', fontWeight: 500 }}>
                                    Déjà inscrit ? Se connecter
                                </Link>
                            </Box>

                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: '#999' }}>
                                En créant un compte, vous acceptez nos conditions générales d'utilisation.
                            </Typography>
                        </Box>
                    </form>

                    {/* Footer */}
                    <Box sx={{ bgcolor: '#fafafa', py: 1, textAlign: 'center', borderTop: '1px solid #e0e0e0' }}>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#666' }}>
                            © {new Date().getFullYear()} GALSENSHOP SARL – Tous droits réservés
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </div>
    )
}

export default Register