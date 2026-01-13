import apiClient from './apiClient';

/**
 * Servicio de autenticación
 */
const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const data = response.data;

    // El backend devuelve: { token, id, nombre, email, rol, message }
    const token = data.token;
    const user = {
      id: data.id,
      nombre: data.nombre,
      email: data.email,
      rol: data.rol
    };

    // Guardar token y usuario en localStorage
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }

    return { token, user };
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Error en logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  validateToken: async () => {
    try {
      const response = await apiClient.get('/auth/validate');
      const data = response.data;

      // El backend devuelve: { token, id, nombre, email, rol, ... }
      const user = {
        id: data.id,
        nombre: data.nombre,
        email: data.email,
        rol: data.rol
      };

      return { valid: true, user };
    } catch (error) {
      return { valid: false, user: null };
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authApi;
