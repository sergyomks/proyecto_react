import apiClient from './apiClient';

/**
 * API de Comprobantes
 */
const comprobantesApi = {
  /**
   * Generar comprobante
   * @param {Object} comprobante - { ventaId, tipo, clienteTipoDoc, clienteNumeroDoc, clienteNombre, clienteDireccion }
   */
  generar: async (comprobante) => {
    const response = await apiClient.post('/comprobantes', comprobante);
    return response.data;
  },

  /**
   * Obtener comprobante por venta
   * @param {number} ventaId
   */
  getByVenta: async (ventaId) => {
    const response = await apiClient.get(`/comprobantes/venta/${ventaId}`);
    return response.data;
  },

  /**
   * Reenviar comprobante a SUNAT
   * @param {number} id - ID del comprobante
   */
  reenviarSunat: async (id) => {
    const response = await apiClient.post(`/comprobantes/${id}/reenviar-sunat`);
    return response.data;
  }
};

export default comprobantesApi;
