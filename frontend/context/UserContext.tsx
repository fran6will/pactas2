// Dans UserContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api.service';

interface User {
  id: string;
  email: string;
  name: string;
  tokens: number;
  userType: 'user' | 'admin' | 'organization';
  isAdmin: boolean;
  organization?: {
    id: string;
    name: string;
    status: string;
  };
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  isOrganization: boolean;
  isAdmin: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const userData = await api.get('/auth/me');
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      api.clearToken();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = api.getToken();
      if (token) {
        await refreshUser();
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const logout = () => {
    setUser(null);
    api.clearToken();
  };

  const isOrganization = user?.userType === 'organization';
  const isAdmin = user?.isAdmin || false;

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
        isLoading,
        refreshUser,
        isOrganization,
        isAdmin
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;