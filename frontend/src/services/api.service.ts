const API_URL = import.meta.env.VITE_API_URL;
         

export const api = {
  getToken() {
    return localStorage.getItem('auth_token');
  },

  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  },

  clearToken() {
    localStorage.removeItem('auth_token');
  },

  async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include',
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Une erreur est survenue');
      }

      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  get(endpoint: string) {
    return this.request(endpoint);
  },

  post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  },

  async getOrganizations() {
    const response = await this.get('/organizations');
    return response;
  }
};


