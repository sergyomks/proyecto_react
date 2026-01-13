import apiClient from './apiClient';

/**
 * API de Configuración del Sistema
 */
const configuracionApi = {
  get: async () => {
    const response = await apiClient.get('/configuracion');
    return response.data;
  },

  getEmpresa: async () => {
    const response = await apiClient.get('/configuracion/empresa');
    return response.data;
  },

  save: async (config) => {
    const response = await apiClient.put('/configuracion', config);
    return response.data;
  },

  updateSeccion: async (seccion, datos) => {
    const response = await apiClient.patch(`/configuracion/${seccion}`, datos);
    return response.data;
  },

  // ========== MÉTODOS NUBEFACT ==========

  testNubefact: async () => {
    const response = await apiClient.post('/configuracion/test-nubefact');
    return response.data;
  }
};

export default configuracionApi;
