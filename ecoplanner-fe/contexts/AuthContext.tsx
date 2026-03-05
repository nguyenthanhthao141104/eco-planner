import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, User } from '../services/api';
import { socketService } from '../services/socket';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const userData = await api.getMe();
                    setUser(userData);
                    socketService.connect(token);
                } catch {
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            setIsLoading(false);
        };
        loadUser();
    }, [token]);

    const login = useCallback(async (email: string, password: string) => {
        const result = await api.login(email, password);
        localStorage.setItem('token', result.token);
        setToken(result.token);
        setUser(result.user);
        socketService.connect(result.token);
    }, []);

    const register = useCallback(async (email: string, password: string, name: string) => {
        const result = await api.register(email, password, name);
        localStorage.setItem('token', result.token);
        setToken(result.token);
        setUser(result.user);
        socketService.connect(result.token);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        socketService.disconnect();
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated: !!user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
