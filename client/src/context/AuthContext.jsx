import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [avatar, setAvatar] = useState(() => localStorage.getItem('elm_avatar') || null);

    // Restore session from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('elm_token');
        const storedUser = localStorage.getItem('elm_user');
        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('elm_token');
                localStorage.removeItem('elm_user');
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email, password) => {
        const { data } = await authService.login({ email, password });
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('elm_token', data.token);
        localStorage.setItem('elm_user', JSON.stringify(data.user));
        toast.success(`Welcome back, ${data.user.name}!`);
        return data.user;
    }, []);

    const register = useCallback(async (formData) => {
        const { data } = await authService.register(formData);
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('elm_token', data.token);
        localStorage.setItem('elm_user', JSON.stringify(data.user));
        toast.success('Account created successfully!');
        return data.user;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('elm_token');
        localStorage.removeItem('elm_user');
        toast.success('Logged out successfully');
        window.location.href = '/login';
    }, []);

    const updateUser = useCallback((updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('elm_user', JSON.stringify(updatedUser));
    }, []);

    // Save profile picture as base64 in localStorage
    const updateAvatar = useCallback((base64String) => {
        setAvatar(base64String);
        if (base64String) {
            localStorage.setItem('elm_avatar', base64String);
        } else {
            localStorage.removeItem('elm_avatar');
        }
    }, []);

    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager';
    const isEmployee = user?.role === 'employee';

    return (
        <AuthContext.Provider value={{ user, token, loading, avatar, login, logout, register, updateUser, updateAvatar, isAdmin, isManager, isEmployee }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
