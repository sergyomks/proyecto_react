import axios from 'axios';

// API del microservicio Python de segmentación
const SEGMENTATION_API_URL = import.meta.env.VITE_SEGMENTATION_API_URL || 'http://localhost:8000/api';

const segmentacionClient = axios.create({
  baseURL: SEGMENTATION_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 60s para operaciones de ML
});

const segmentacionApi = {
  // Obtener resumen de segmentos
  getSegments: async () => {
    const response = await segmentacionClient.get('/segments');
    return response.data;
  },

  // Obtener clientes de un segmento
  getCustomersBySegment: async (segmento, limit = 100, offset = 0) => {
    const response = await segmentacionClient.get(`/segments/${segmento}/customers`, {
      params: { limit, offset }
    });
    return response.data;
  },

  // Obtener segmento de un cliente
  getCustomerSegment: async (clienteId) => {
    const response = await segmentacionClient.get(`/customers/${clienteId}/segment`);
    return response.data;
  },

  // Entrenar modelo
  train: async () => {
    const response = await segmentacionClient.post('/train');
    return response.data;
  },

  // Obtener métricas
  getMetrics: async () => {
    const response = await segmentacionClient.get('/metrics');
    return response.data;
  },

  // Generar oferta para un cliente
  generarOferta: async (clienteId) => {
    const response = await segmentacionClient.post(`/generar-oferta/${clienteId}`);
    return response.data;
  },

  // Generar ofertas masivas para un segmento
  generarOfertasMasivo: async (segmento, limit = 50) => {
    const response = await segmentacionClient.post('/generar-ofertas-masivo', null, {
      params: { segmento, limit }
    });
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await segmentacionClient.get('/health');
    return response.data;
  }
};

export default segmentacionApi;
