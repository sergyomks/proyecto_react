import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://proyecto-springboot-olvq.onrender.com/api';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirigir al login si no estamos ya ahí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Manejar error de cuenta bloqueada (código 429)
    if (error.response?.status === 429) {
      console.warn('Cuenta bloqueada por demasiados intentos');
      const message = error.response?.data?.message || error.response?.data?.error || 'Cuenta bloqueada. Intente nuevamente en 15 minutos.';
      return Promise.reject(new Error(message));
    }

    // Extraer mensaje de error
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Error de conexión';

    return Promise.reject(new Error(message));
  }
);

export default apiClient;

// Funciones helper para requests
export const get = (url, config = {}) => apiClient.get(url, config);
export const post = (url, data, config = {}) => apiClient.post(url, data, config);
export const put = (url, data, config = {}) => apiClient.put(url, data, config);
export const patch = (url, data, config = {}) => apiClient.patch(url, data, config);
export const del = (url, config = {}) => apiClient.delete(url, config);

// Para subir archivos (multipart/form-data)
export const uploadFile = (url, formData, config = {}) => {
  return apiClient.post(url, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data'
    }
  });
};
