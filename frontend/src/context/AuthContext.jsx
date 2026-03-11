import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('medilink_token');
        const savedUser = localStorage.getItem('medilink_user');
        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('medilink_token');
                localStorage.removeItem('medilink_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await authAPI.login({ email, password });
        const { token, user: userData } = response.data;
        localStorage.setItem('medilink_token', token);
        localStorage.setItem('medilink_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const register = async (data) => {
        const response = await authAPI.register(data);
        const { token, user: userData } = response.data;
        localStorage.setItem('medilink_token', token);
        localStorage.setItem('medilink_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('medilink_token');
        localStorage.removeItem('medilink_user');
        setUser(null);
    };

    const updateUser = (userData) => {
        localStorage.setItem('medilink_user', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
