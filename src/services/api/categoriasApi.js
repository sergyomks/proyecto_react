import apiClient from './apiClient';

/**
 * API de Categorías
 */
const categoriasApi = {
  /**
   * Listar categorías activas
   */
  getAll: async () => {
    const response = await apiClient.get('/categorias');
    return response.data;
  },

  /**
   * Listar todas las categorías (incluye inactivas)
   */
  getAllIncludingInactive: async () => {
    const response = await apiClient.get('/categorias/todas');
    return response.data;
  },

  /**
   * Obtener árbol jerárquico de categorías
   */
  getArbol: async () => {
    const response = await apiClient.get('/categorias/arbol');
    return response.data;
  },

  /**
   * Listar categorías raíz (sin padre)
   */
  getRaices: async () => {
    const response = await apiClient.get('/categorias/raices');
    return response.data;
  },

  /**
   * Obtener categoría por ID
   * @param {number} id
   */
  getById: async (id) => {
    const response = await apiClient.get(`/categorias/${id}`);
    return response.data;
  },

  /**
   * Listar subcategorías de una categoría
   * @param {number} id - ID de la categoría padre
   */
  getHijas: async (id) => {
    const response = await apiClient.get(`/categorias/${id}/hijas`);
    return response.data;
  },

  /**
   * Contar productos de una categoría
   * @param {number} id
   */
  contarProductos: async (id) => {
    const response = await apiClient.get(`/categorias/${id}/productos/count`);
    return response.data;
  },

  /**
   * Verificar si se puede eliminar una categoría
   * @param {number} id
   */
  puedeEliminar: async (id) => {
    const response = await apiClient.get(`/categorias/${id}/puede-eliminar`);
    return response.data;
  },

  /**
   * Crear categoría
   * @param {Object} categoria - { nombre, descripcion, parentId }
   */
  create: async (categoria) => {
    const response = await apiClient.post('/categorias', categoria);
    return response.data;
  },

  /**
   * Actualizar categoría
   * @param {number} id
   * @param {Object} categoria
   */
  update: async (id, categoria) => {
    const response = await apiClient.put(`/categorias/${id}`, categoria);
    return response.data;
  },

  /**
   * Eliminar categoría
   * @param {number} id
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/categorias/${id}`);
    return response.data;
  },

  /**
   * Desactivar categoría
   * @param {number} id
   */
  desactivar: async (id) => {
    const response = await apiClient.patch(`/categorias/${id}/desactivar`);
    return response.data;
  }
};

export default categoriasApi;
