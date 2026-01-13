import apiClient, { uploadFile } from './apiClient';

/**
 * API de Productos
 */
const productosApi = {
  /**
   * Listar productos activos
   */
  getAll: async () => {
    const response = await apiClient.get('/productos');
    return response.data;
  },

  /**
   * Listar todos los productos (incluye inactivos)
   */
  getAllIncludingInactive: async () => {
    const response = await apiClient.get('/productos/todos');
    return response.data;
  },

  /**
   * Buscar productos con paginación
   * @param {Object} params - { query, categoriaId, page, size, sortBy, sortDir }
   */
  search: async (params = {}) => {
    const response = await apiClient.get('/productos/buscar', { params });
    return response.data;
  },

  /**
   * Obtener producto por ID
   * @param {number} id
   */
  getById: async (id) => {
    const response = await apiClient.get(`/productos/${id}`);
    return response.data;
  },

  /**
   * Obtener producto por código
   * @param {string} codigo
   */
  getByCodigo: async (codigo) => {
    const response = await apiClient.get(`/productos/codigo/${codigo}`);
    return response.data;
  },

  /**
   * Obtener producto por código de barras
   * @param {string} codigoBarras
   */
  getByCodigoBarras: async (codigoBarras) => {
    const response = await apiClient.get(`/productos/barras/${codigoBarras}`);
    return response.data;
  },

  /**
   * Listar productos por categoría
   * @param {number} categoriaId
   */
  getByCategoria: async (categoriaId) => {
    const response = await apiClient.get(`/productos/categoria/${categoriaId}`);
    return response.data;
  },

  /**
   * Listar productos con stock bajo
   */
  getStockBajo: async () => {
    const response = await apiClient.get('/productos/stock-bajo');
    return response.data;
  },

  /**
   * Crear producto
   * @param {Object} producto - Datos del producto
   * @param {File} imagen - Archivo de imagen (opcional)
   */
  create: async (producto, imagen = null) => {
    const formData = new FormData();
    formData.append('producto', JSON.stringify(producto));
    if (imagen) {
      formData.append('imagen', imagen);
    }
    const response = await uploadFile('/productos', formData);
    return response.data;
  },

  /**
   * Actualizar producto
   * @param {number} id
   * @param {Object} producto
   * @param {File} imagen - Nueva imagen (opcional)
   */
  update: async (id, producto, imagen = null) => {
    const formData = new FormData();
    formData.append('producto', JSON.stringify(producto));
    if (imagen) {
      formData.append('imagen', imagen);
    }
    const response = await apiClient.put(`/productos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Desactivar producto
   * @param {number} id
   */
  desactivar: async (id) => {
    const response = await apiClient.patch(`/productos/${id}/desactivar`);
    return response.data;
  },

  /**
   * Activar producto
   * @param {number} id
   */
  activar: async (id) => {
    const response = await apiClient.patch(`/productos/${id}/activar`);
    return response.data;
  },

  /**
   * Actualizar tallas de un producto
   * @param {number} id
   * @param {Array} tallas - [{ talla: 'M', stock: 10 }, ...]
   */
  actualizarTallas: async (id, tallas) => {
    const response = await apiClient.put(`/productos/${id}/tallas`, tallas);
    return response.data;
  },

  /**
   * Actualizar stock de una talla específica
   * @param {number} id
   * @param {string} talla
   * @param {number} cantidad
   */
  actualizarStockTalla: async (id, talla, cantidad) => {
    const response = await apiClient.patch(`/productos/${id}/tallas/${talla}/stock`, null, { params: { cantidad } });
    return response.data;
  },

  /**
   * Obtener stock total de un producto
   * @param {number} id
   */
  getStockTotal: async (id) => {
    const response = await apiClient.get(`/productos/${id}/stock`);
    return response.data;
  },

  /**
   * Verificar disponibilidad
   * @param {number} id
   * @param {string} talla
   * @param {number} cantidad
   */
  verificarDisponibilidad: async (id, talla, cantidad) => {
    const response = await apiClient.get(`/productos/${id}/disponibilidad`, {
      params: { talla, cantidad }
    });
    return response.data;
  },

  // ============ GESTIÓN DE IMÁGENES ============

  /**
   * Obtener todas las imágenes de un producto
   * @param {number} productoId
   */
  getImagenes: async (productoId) => {
    const response = await apiClient.get(`/productos/${productoId}/imagenes`);
    return response.data;
  },

  /**
   * Agregar imagen a un producto
   * @param {number} productoId
   * @param {File} imagen
   * @param {boolean} esPrincipal
   */
  agregarImagen: async (productoId, imagen, esPrincipal = false) => {
    const formData = new FormData();
    formData.append('imagen', imagen);
    const response = await apiClient.post(`/productos/${productoId}/imagenes?esPrincipal=${esPrincipal}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Eliminar imagen
   * @param {number} imagenId
   */
  eliminarImagen: async (imagenId) => {
    const response = await apiClient.delete(`/productos/imagenes/${imagenId}`);
    return response.data;
  },

  /**
   * Establecer imagen como principal
   * @param {number} imagenId
   */
  establecerImagenPrincipal: async (imagenId) => {
    const response = await apiClient.patch(`/productos/imagenes/${imagenId}/principal`);
    return response.data;
  },

  /**
   * Reordenar imágenes
   * @param {number} productoId
   * @param {Array<number>} imagenesIds - IDs en el nuevo orden
   */
  reordenarImagenes: async (productoId, imagenesIds) => {
    const response = await apiClient.put(`/productos/${productoId}/imagenes/reordenar`, imagenesIds);
    return response.data;
  },

  /**
   * Obtener producto completo (con tallas e imágenes)
   * @param {number} id
   */
  getCompleto: async (id) => {
    const response = await apiClient.get(`/productos/${id}/completo`);
    return response.data;
  }
};

export default productosApi;
