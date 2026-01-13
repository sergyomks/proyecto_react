import apiClient from './apiClient';

/**
 * API de Clientes APP (clientes registrados en la aplicación móvil)
 */
const clientesApi = {
  /**
   * Listar clientes de la app con paginación
   * @param {Object} params - { page, size }
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/clientes-app', { params });
    return response.data;
  },

  /**
   * Buscar clientes de la app
   * @param {Object} params - { q: query }
   */
  search: async (params = {}) => {
    if (params.query) {
      const response = await apiClient.get('/clientes-app/buscar', {
        params: { q: params.query }
      });
      // Adaptar respuesta para compatibilidad con paginación
      const data = response.data;
      return {
        content: data,
        page: 0,
        totalPages: 1,
        totalElements: data.length
      };
    } else {
      // Sin query, usar endpoint paginado
      const response = await apiClient.get('/clientes-app', {
        params: { page: params.page || 0, size: params.size || 20 }
      });
      return response.data;
    }
  },

  /**
   * Obtener cliente por ID
   * @param {number} id
   */
  getById: async (id) => {
    const response = await apiClient.get(`/clientes-app/${id}`);
    return response.data;
  },

  /**
   * Obtener direcciones de un cliente
   * @param {number} clienteId
   */
  getDirecciones: async (clienteId) => {
    const response = await apiClient.get(`/clientes-app/${clienteId}/direcciones`);
    return response.data;
  },

  /**
   * Obtener pedidos de un cliente
   * @param {number} clienteId
   */
  getPedidos: async (clienteId) => {
    const response = await apiClient.get(`/clientes-app/${clienteId}/pedidos`);
    return response.data;
  },

  /**
   * Cambiar estado activo/inactivo de un cliente
   * @param {number} id
   * @param {boolean} activo
   */
  toggleActivo: async (id, activo) => {
    const response = await apiClient.patch(`/clientes-app/${id}/estado`, null, {
      params: { activo }
    });
    return response.data;
  },

  /**
   * Obtener estadísticas de clientes
   */
  getStats: async () => {
    const response = await apiClient.get('/clientes-app/stats');
    return response.data;
  }
};

export default clientesApi;
