// src/hooks/useAuth.jsx
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('Token');
        const userData = localStorage.getItem('User');
        
        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('User');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('Token', token);
        localStorage.setItem('User', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('Token');
        localStorage.removeItem('User');
        setUser(null);
    };

    const isAdmin = () => user?.role === 'admin';
    const isVendeur = () => user?.role === 'vendeur';

    const value = {
        user,
        loading,
        login,
        logout,
        isAdmin,
        isVendeur
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};