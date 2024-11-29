// src/services/auth.service.ts
import { api } from './api.service';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    tokens: number;
    userType: 'user' | 'organization' | 'admin';
    isAdmin: boolean;
    organization?: {
      id: string;
      name: string;
      status: string;
    };
  };
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  userType?: 'user' | 'organization';
  description?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const data = await api.post('/auth/login', { email, password });
      if (data.token) {
        api.setToken(data.token);
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  },

  async register(data: { 
    email: string; 
    password: string; 
    name: string; 
    userType?: 'user' | 'organization';
    description?: string; 
  }): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', data);
      if (response.token) {
        api.setToken(response.token);
      }
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  },

  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;

      const user = await api.get('/auth/me');
      return user;
    } catch (error) {
      this.logout();
      return null;
    }
  },

  async updateProfile(userId: string, data: Partial<AuthResponse['user']>): Promise<AuthResponse['user']> {
    try {
      const updatedUser = await api.put(`/auth/users/${userId}`, data);
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la mise à jour du profil');
    }
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.put(`/auth/users/${userId}/password`, {
        currentPassword,
        newPassword
      });
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors du changement de mot de passe');
    }
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  clearToken(): void {
    localStorage.removeItem('auth_token');
  },

  logout(): void {
    this.clearToken();
    // Vous pouvez ajouter ici d'autres nettoyages si nécessaire
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }
};

export default authService;