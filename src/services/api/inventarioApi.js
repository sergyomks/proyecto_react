import apiClient from './apiClient';

/**
 * API de Inventario
 */
const inventarioApi = {
  getMovimientos: async (params = {}) => {
    const response = await apiClient.get('/inventario/movimientos', { params });
    return response.data;
  },

  getMovimientosPorProducto: async (productoId, params = {}) => {
    const response = await apiClient.get(`/inventario/movimientos/producto/${productoId}`, { params });
    return response.data;
  },

  getMovimientosPorTipo: async (tipo) => {
    const response = await apiClient.get(`/inventario/movimientos/tipo/${tipo}`);
    return response.data;
  },

  registrarEntrada: async (movimiento) => {
    const response = await apiClient.post('/inventario/entrada', movimiento);
    return response.data;
  },

  registrarSalida: async (movimiento) => {
    const response = await apiClient.post('/inventario/salida', movimiento);
    return response.data;
  },

  registrarAjuste: async (movimiento) => {
    const response = await apiClient.post('/inventario/ajuste', movimiento);
    return response.data;
  },

  registrarMovimiento: async (movimiento) => {
    const response = await apiClient.post('/inventario/movimiento', movimiento);
    return response.data;
  },

  getStockBajo: async () => {
    const response = await apiClient.get('/productos/stock-bajo');
    return response.data;
  },

  getResumen: async () => {
    const response = await apiClient.get('/inventario/resumen');
    return response.data;
  },

  exportarReporte: async (formato = 'xlsx') => {
    const response = await apiClient.get(`/inventario/exportar`, {
      params: { formato },
      responseType: 'blob'
    });
    return response.data;
  },

  getValorizacion: async () => {
    const response = await apiClient.get('/inventario/valorizacion');
    return response.data;
  }
};

export default inventarioApi;
