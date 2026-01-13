import apiClient from './apiClient';

/**
 * API de Usuarios
 */
const usuariosApi = {
  /**
   * Listar todos los usuarios
   */
  getAll: async () => {
    const response = await apiClient.get('/usuarios');
    return response.data;
  },

  /**
   * Listar usuarios activos
   */
  getActivos: async () => {
    const response = await apiClient.get('/usuarios/activos');
    return response.data;
  },

  /**
   * Obtener usuario por ID
   * @param {number} id
   */
  getById: async (id) => {
    const response = await apiClient.get(`/usuarios/${id}`);
    return response.data;
  },

  /**
   * Listar usuarios por rol
   * @param {string} rol - ADMIN, VENDEDOR, CAJERO
   */
  getByRol: async (rol) => {
    const response = await apiClient.get(`/usuarios/rol/${rol}`);
    return response.data;
  },

  /**
   * Crear usuario
   * @param {Object} usuario - { nombre, email, password, rol }
   */
  create: async (usuario) => {
    const response = await apiClient.post('/usuarios', usuario);
    return response.data;
  },

  /**
   * Actualizar usuario
   * @param {number} id
   * @param {Object} usuario
   */
  update: async (id, usuario) => {
    const response = await apiClient.put(`/usuarios/${id}`, usuario);
    return response.data;
  },

  /**
   * Desactivar usuario
   * @param {number} id
   */
  desactivar: async (id) => {
    const response = await apiClient.patch(`/usuarios/${id}/desactivar`);
    return response.data;
  },

  /**
   * Activar usuario
   * @param {number} id
   */
  activar: async (id) => {
    const response = await apiClient.patch(`/usuarios/${id}/activar`);
    return response.data;
  }
};

export default usuariosApi;
