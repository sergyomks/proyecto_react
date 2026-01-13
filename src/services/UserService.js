import { createUser, UserUpdateSchema, toSafeUser } from '../models/User';
import * as Storage from './storage/StorageService';
import bcrypt from 'bcryptjs';

const COLLECTION = Storage.COLLECTIONS.USERS;

/**
 * Obtiene todos los usuarios
 * @param {boolean} includeInactive - Incluir usuarios inactivos
 * @returns {Array}
 */
export const getAll = (includeInactive = false) => {
  const users = Storage.getAll(COLLECTION);
  const filtered = includeInactive ? users : users.filter((u) => u.isActive);
  return filtered.map(toSafeUser);
};

/**
 * Obtiene un usuario por ID
 * @param {string} id - ID del usuario
 * @returns {Object|null}
 */
export const getById = (id) => {
  const user = Storage.getById(COLLECTION, id);
  return user ? toSafeUser(user) : null;
};

/**
 * Obtiene un usuario por email
 * @param {string} email - Email del usuario
 * @returns {Object|null}
 */
export const getByEmail = (email) => {
  const user = Storage.findOne(COLLECTION, (u) => u.email.toLowerCase() === email.toLowerCase());
  return user ? toSafeUser(user) : null;
};

/**
 * Crea un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Object} Usuario creado
 */
export const create = async (userData) => {
  // Verificar email único
  const existing = Storage.findOne(COLLECTION, (u) => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existing) {
    throw new Error('El email ya está registrado');
  }

  const user = await createUser(userData);
  Storage.create(COLLECTION, user);
  return toSafeUser(user);
};

/**
 * Actualiza un usuario
 * @param {string} id - ID del usuario
 * @param {Object} updates - Datos a actualizar
 * @returns {Object} Usuario actualizado
 */
export const update = async (id, updates) => {
  const user = Storage.getById(COLLECTION, id);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Validar datos
  const validated = await UserUpdateSchema.validate(updates);

  // Si se actualiza email, verificar que sea único
  if (validated.email && validated.email.toLowerCase() !== user.email.toLowerCase()) {
    const existing = Storage.findOne(COLLECTION, (u) => u.email.toLowerCase() === validated.email.toLowerCase() && u.id !== id);
    if (existing) {
      throw new Error('El email ya está registrado');
    }
  }

  // Si se actualiza contraseña, hashearla
  if (validated.password) {
    const salt = await bcrypt.genSalt(10);
    validated.passwordHash = await bcrypt.hash(validated.password, salt);
    delete validated.password;
  }

  const updatedUser = {
    ...user,
    ...validated,
    updatedAt: new Date().toISOString()
  };

  Storage.replace(COLLECTION, id, updatedUser);
  return toSafeUser(updatedUser);
};

/**
 * Desactiva un usuario
 * @param {string} id - ID del usuario
 * @returns {Object} Usuario desactivado
 */
export const deactivate = (id) => {
  const user = Storage.getById(COLLECTION, id);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const updatedUser = {
    ...user,
    isActive: false,
    updatedAt: new Date().toISOString()
  };

  Storage.replace(COLLECTION, id, updatedUser);
  return toSafeUser(updatedUser);
};

/**
 * Activa un usuario
 * @param {string} id - ID del usuario
 * @returns {Object} Usuario activado
 */
export const activate = (id) => {
  const user = Storage.getById(COLLECTION, id);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const updatedUser = {
    ...user,
    isActive: true,
    updatedAt: new Date().toISOString()
  };

  Storage.replace(COLLECTION, id, updatedUser);
  return toSafeUser(updatedUser);
};

/**
 * Busca usuarios con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Array}
 */
export const search = (filters = {}) => {
  let users = Storage.getAll(COLLECTION);

  if (filters.query) {
    const query = filters.query.toLowerCase();
    users = users.filter((u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));
  }

  if (filters.role) {
    users = users.filter((u) => u.role === filters.role);
  }

  if (filters.isActive !== undefined) {
    users = users.filter((u) => u.isActive === filters.isActive);
  }

  return users.map(toSafeUser);
};

/**
 * Cuenta usuarios por rol
 * @returns {Object}
 */
export const countByRole = () => {
  const users = Storage.getAll(COLLECTION).filter((u) => u.isActive);
  return users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});
};

/**
 * Inicializa usuario admin por defecto si no existe ninguno
 */
export const initializeDefaultAdmin = async () => {
  const users = Storage.getAll(COLLECTION);
  if (users.length === 0) {
    await create({
      name: 'Administrador',
      email: 'admin@sistema.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Usuario admin creado: admin@sistema.com / admin123');
  }
};
