// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.service';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier le token au chargement
    const checkAuth = async () => {
      try {
        const token = api.getToken();
        if (token) {
          const response = await api.get('/auth/me');
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const data = await response.json();
    
    if (response.ok) {
      api.setToken(data.token);
      setUser(data.user);
    } else {
      throw new Error(data.error);
    }
  };

  const logout = () => {
    api.setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};