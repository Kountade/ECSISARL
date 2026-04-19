// src/components/Message.jsx
import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const Message = ({ 
    text, 
    type = 'success', // success, error, warning, info
    duration = 5000,
    onClose,
    position = 'top' // top, bottom
}) => {
    const [isVisible, setIsVisible] = useState(true)
    const [isLeaving, setIsLeaving] = useState(false)

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                handleClose()
            }, duration)
            
            return () => clearTimeout(timer)
        }
    }, [duration])

    const handleClose = () => {
        setIsLeaving(true)
        setTimeout(() => {
            setIsVisible(false)
            if (onClose) onClose()
        }, 300) // Durée de l'animation
    }

    if (!isVisible) return null

    // Configuration des styles selon le type
    const config = {
        success: {
            alertClass: 'alert-success',
            icon: CheckCircle,
            defaultText: 'Succès !'
        },
        error: {
            alertClass: 'alert-error',
            icon: AlertCircle,
            defaultText: 'Erreur !'
        },
        warning: {
            alertClass: 'alert-warning',
            icon: AlertTriangle,
            defaultText: 'Attention !'
        },
        info: {
            alertClass: 'alert-info',
            icon: Info,
            defaultText: 'Information'
        }
    }

    const { alertClass, icon: Icon, defaultText } = config[type] || config.info

    // Classes de position
    const positionClasses = {
        top: 'top-4',
        bottom: 'bottom-4'
    }

    return (
        <div 
            className={`
                fixed left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4
                ${positionClasses[position]}
                transition-all duration-300 ease-in-out
                ${isLeaving 
                    ? 'opacity-0 -translate-y-4' 
                    : 'opacity-100 translate-y-0 animate-slideDown'
                }
            `}
        >
            <div className={`alert ${alertClass} shadow-lg`}>
                <Icon className="h-5 w-5" />
                <span className="flex-1 text-sm">{text || defaultText}</span>
                {onClose && (
                    <button 
                        onClick={handleClose}
                        className="btn btn-ghost btn-xs btn-circle"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    )
}

// Version simplifiée pour compatibilité avec l'ancien composant
export const MyMessage = ({ text, color, onClose }) => {
    // Mapping des couleurs vers les types DaisyUI
    const getTypeFromColor = (color) => {
        const colorMap = {
            '#69C9AB': 'success',
            '#DA4A0E': 'error',
            '#FFA000': 'warning',
            '#003C3f': 'info'
        }
        return colorMap[color] || 'info'
    }

    return (
        <Message 
            text={text} 
            type={getTypeFromColor(color)}
            onClose={onClose}
            duration={5000}
        />
    )
}

// Composant pour les notifications Toast (usage avancé)
export const ToastContainer = ({ messages, removeMessage }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 w-full max-w-sm">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`
                        animate-slideDown
                        transition-all duration-300
                    `}
                >
                    <Message
                        text={message.text}
                        type={message.type}
                        duration={message.duration || 5000}
                        onClose={() => removeMessage(message.id)}
                    />
                </div>
            ))}
        </div>
    )
}

// Hook personnalisé pour gérer les messages
export const useMessage = () => {
    const [messages, setMessages] = useState([])

    const addMessage = (text, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random()
        setMessages(prev => [...prev, { id, text, type, duration }])
        
        if (duration > 0) {
            setTimeout(() => {
                removeMessage(id)
            }, duration)
        }
    }

    const removeMessage = (id) => {
        setMessages(prev => prev.filter(msg => msg.id !== id))
    }

    const success = (text, duration) => addMessage(text, 'success', duration)
    const error = (text, duration) => addMessage(text, 'error', duration)
    const warning = (text, duration) => addMessage(text, 'warning', duration)
    const info = (text, duration) => addMessage(text, 'info', duration)

    return {
        messages,
        addMessage,
        removeMessage,
        success,
        error,
        warning,
        info
    }
}

export default Message