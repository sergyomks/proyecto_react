import apiClient from './apiClient';

// API de Pedidos Online
export const pedidosApi = {
  getAll: async (page = 0, size = 20) => {
    const response = await apiClient.get(`/pedidos?page=${page}&size=${size}`);
    return response.data;
  },

  getByEstado: async (estado, page = 0, size = 20) => {
    const response = await apiClient.get(`/pedidos/estado/${estado}/paginado?page=${page}&size=${size}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/pedidos/${id}`);
    return response.data;
  },

  getByNumero: async (numero) => {
    const response = await apiClient.get(`/pedidos/numero/${numero}`);
    return response.data;
  },

  actualizarEstado: async (id, estado, notificarEmail = false) => {
    const response = await apiClient.patch(`/pedidos/${id}/estado?estado=${estado}&notificarEmail=${notificarEmail}`);
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/pedidos/stats/pendientes');
    return response.data;
  },

  getVentasHoy: async () => {
    const response = await apiClient.get('/pedidos/stats/ventas-hoy');
    return response.data;
  }
};

// API de Banners
export const bannersApi = {
  getAll: async () => {
    const response = await apiClient.get('/banners');
    return response.data;
  },

  getVigentes: async () => {
    const response = await apiClient.get('/banners/vigentes');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/banners/${id}`);
    return response.data;
  },

  create: async (bannerData, imagenFile) => {
    const formData = new FormData();
    formData.append('banner', JSON.stringify(bannerData));
    if (imagenFile) {
      formData.append('imagen', imagenFile);
    }
    const response = await apiClient.post('/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  update: async (id, bannerData, imagenFile) => {
    const formData = new FormData();
    formData.append('banner', JSON.stringify(bannerData));
    if (imagenFile) {
      formData.append('imagen', imagenFile);
    }
    const response = await apiClient.put(`/banners/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  delete: async (id) => {
    await apiClient.delete(`/banners/${id}`);
  },

  cambiarEstado: async (id, activo) => {
    await apiClient.patch(`/banners/${id}/estado?activo=${activo}`);
  }
};

// API de Códigos Promocionales
export const codigosPromoApi = {
  getAll: async (page = 0, size = 20, estado = '') => {
    const params = new URLSearchParams({ page, size });
    if (estado) params.append('estado', estado);
    const response = await apiClient.get(`/codigos-promo?${params}`);
    return response.data;
  },

  getAllSimple: async () => {
    const response = await apiClient.get('/codigos-promo/all');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/codigos-promo/${id}`);
    return response.data;
  },

  validar: async (codigo, montoCompra) => {
    const response = await apiClient.post('/codigos-promo/validar', { codigo, montoCompra });
    return response.data;
  },

  validarParaCliente: async (codigo, montoCompra, clienteId) => {
    const response = await apiClient.post('/codigos-promo/validar-cliente', { codigo, montoCompra, clienteId });
    return response.data;
  },

  create: async (codigo) => {
    const response = await apiClient.post('/codigos-promo', codigo);
    return response.data;
  },

  update: async (id, codigo) => {
    const response = await apiClient.put(`/codigos-promo/${id}`, codigo);
    return response.data;
  },

  delete: async (id) => {
    await apiClient.delete(`/codigos-promo/${id}`);
  }
};

// API de Clientes App (ecommerce)
export const clientesAppApi = {
  getAll: async (page = 0, size = 20) => {
    const response = await apiClient.get(`/clientes-app?page=${page}&size=${size}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/clientes-app/${id}`);
    return response.data;
  },

  search: async (query) => {
    const response = await apiClient.get(`/clientes-app/buscar?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getDirecciones: async (clienteId) => {
    const response = await apiClient.get(`/clientes-app/${clienteId}/direcciones`);
    return response.data;
  },

  getPedidos: async (clienteId) => {
    const response = await apiClient.get(`/clientes-app/${clienteId}/pedidos`);
    return response.data;
  },

  toggleActivo: async (id, activo) => {
    const response = await apiClient.patch(`/clientes-app/${id}/estado?activo=${activo}`);
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/clientes-app/stats');
    return response.data;
  }
};

// API de Zonas de Envío
export const zonasEnvioApi = {
  getAll: async (page = 0, size = 20, departamento = '', estado = '') => {
    const params = new URLSearchParams({ page, size });
    if (departamento) params.append('departamento', departamento);
    if (estado) params.append('estado', estado);
    const response = await apiClient.get(`/zonas-envio?${params}`);
    return response.data;
  },

  getAllSimple: async () => {
    const response = await apiClient.get('/zonas-envio/all');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/zonas-envio/${id}`);
    return response.data;
  },

  buscar: async (departamento, provincia, distrito) => {
    const params = new URLSearchParams({ departamento });
    if (provincia) params.append('provincia', provincia);
    if (distrito) params.append('distrito', distrito);
    const response = await apiClient.get(`/zonas-envio/buscar?${params}`);
    return response.data;
  },

  getDepartamentos: async () => {
    const response = await apiClient.get('/zonas-envio/departamentos');
    return response.data;
  },

  getProvincias: async (departamento) => {
    const response = await apiClient.get(`/zonas-envio/provincias?departamento=${departamento}`);
    return response.data;
  },

  getDistritos: async (departamento, provincia) => {
    const response = await apiClient.get(`/zonas-envio/distritos?departamento=${departamento}&provincia=${provincia}`);
    return response.data;
  },

  create: async (zona) => {
    const response = await apiClient.post('/zonas-envio', zona);
    return response.data;
  },

  update: async (id, zona) => {
    const response = await apiClient.put(`/zonas-envio/${id}`, zona);
    return response.data;
  },

  delete: async (id) => {
    await apiClient.delete(`/zonas-envio/${id}`);
  }
};
