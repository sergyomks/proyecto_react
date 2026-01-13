import apiClient from './apiClient';

/**
 * API de Ventas
 */
const ventasApi = {
  /**
   * Listar todas las ventas
   */
  getAll: async () => {
    const response = await apiClient.get('/ventas');
    return response.data;
  },

  /**
   * Buscar ventas con paginación
   * @param {Object} params - { fechaInicio, fechaFin, page, size, sortBy, sortDir }
   */
  search: async (params = {}) => {
    const response = await apiClient.get('/ventas/buscar', { params });
    return response.data;
  },

  /**
   * Obtener venta por ID
   * @param {number} id
   */
  getById: async (id) => {
    const response = await apiClient.get(`/ventas/${id}`);
    return response.data;
  },

  /**
   * Obtener venta por número
   * @param {string} numero
   */
  getByNumero: async (numero) => {
    const response = await apiClient.get(`/ventas/numero/${numero}`);
    return response.data;
  },

  /**
   * Listar ventas por cliente
   * @param {number} clienteId
   */
  getByCliente: async (clienteId) => {
    const response = await apiClient.get(`/ventas/cliente/${clienteId}`);
    return response.data;
  },

  /**
   * Listar ventas por usuario
   * @param {number} usuarioId
   */
  getByUsuario: async (usuarioId) => {
    const response = await apiClient.get(`/ventas/usuario/${usuarioId}`);
    return response.data;
  },

  /**
   * Listar ventas por estado
   * @param {string} estado - COMPLETADA, ANULADA, PENDIENTE
   */
  getByEstado: async (estado) => {
    const response = await apiClient.get(`/ventas/estado/${estado}`);
    return response.data;
  },

  /**
   * Listar ventas por rango de fechas
   * @param {string} fechaInicio - YYYY-MM-DD
   * @param {string} fechaFin - YYYY-MM-DD
   */
  getByFecha: async (fechaInicio, fechaFin) => {
    const response = await apiClient.get('/ventas/fecha', {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  /**
   * Crear venta
   * @param {Object} venta - { clienteId, metodoPago, items: [{ productoId, talla, cantidad, precioUnitario }] }
   */
  create: async (venta) => {
    const response = await apiClient.post('/ventas', venta);
    return response.data;
  },

  /**
   * Anular venta
   * @param {number} id
   * @param {string} motivo
   */
  anular: async (id, motivo) => {
    const response = await apiClient.post(`/ventas/anular/${id}`, { motivo });
    return response.data;
  },

  /**
   * Obtener estadísticas del día
   */
  getEstadisticasHoy: async () => {
    const response = await apiClient.get('/ventas/estadisticas/hoy');
    return response.data;
  },

  /**
   * Obtener estadísticas por rango de fechas
   * @param {string} fechaInicio
   * @param {string} fechaFin
   */
  getEstadisticasRango: async (fechaInicio, fechaFin) => {
    const response = await apiClient.get('/ventas/estadisticas/rango', {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  /**
   * Generar número de venta
   */
  generarNumero: async () => {
    const response = await apiClient.get('/ventas/generar-numero');
    return response.data;
  }
};

export default ventasApi;
