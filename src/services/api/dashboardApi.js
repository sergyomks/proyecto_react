import apiClient from './apiClient';

/**
 * API de Dashboard
 */
const dashboardApi = {
  /**
   * Obtener dashboard general
   */
  getDashboard: async () => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  },

  /**
   * Obtener dashboard por rango de fechas
   * @param {string} fechaInicio - YYYY-MM-DD
   * @param {string} fechaFin - YYYY-MM-DD
   */
  getDashboardPorRango: async (fechaInicio, fechaFin) => {
    const response = await apiClient.get('/dashboard/rango', {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  /**
   * Obtener ventas por día
   * @param {string} fechaInicio
   * @param {string} fechaFin
   */
  getVentasPorDia: async (fechaInicio, fechaFin) => {
    const response = await apiClient.get('/dashboard/ventas-por-dia', {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  /**
   * Obtener productos más vendidos
   * @param {string} fechaInicio
   * @param {string} fechaFin
   * @param {number} limite
   */
  getProductosMasVendidos: async (fechaInicio, fechaFin, limite = 10) => {
    const response = await apiClient.get('/dashboard/productos-mas-vendidos', {
      params: { fechaInicio, fechaFin, limite }
    });
    return response.data;
  },

  /**
   * Obtener ventas por categoría
   * @param {string} fechaInicio
   * @param {string} fechaFin
   */
  getVentasPorCategoria: async (fechaInicio, fechaFin) => {
    const response = await apiClient.get('/dashboard/ventas-por-categoria', {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  /**
   * Obtener ventas por método de pago
   * @param {string} fechaInicio
   * @param {string} fechaFin
   */
  getVentasPorMetodoPago: async (fechaInicio, fechaFin) => {
    const response = await apiClient.get('/dashboard/ventas-por-metodo-pago', {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  /**
   * Obtener estadísticas generales
   */
  getStats: async () => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },

  /**
   * Obtener top productos
   * @param {number} limite
   */
  getTopProductos: async (limite = 10) => {
    const response = await apiClient.get('/dashboard/top-productos', {
      params: { limite }
    });
    return response.data;
  },

  /**
   * Obtener ventas mensuales por año
   * @param {number} year
   */
  getVentasMensuales: async (year) => {
    const response = await apiClient.get('/dashboard/ventas-mensuales', {
      params: { year }
    });
    return response.data;
  },

  /**
   * Obtener comparativa de ventas (hoy vs ayer, semana vs semana, mes vs mes)
   */
  getComparativa: async () => {
    const response = await apiClient.get('/dashboard/comparativa');
    return response.data;
  },

  /**
   * Obtener meta de ventas del mes y progreso
   */
  getMetaVentas: async () => {
    const response = await apiClient.get('/dashboard/meta-ventas');
    return response.data;
  }
};

export default dashboardApi;
