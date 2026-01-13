/**
 * Servicio de almacenamiento genérico usando localStorage
 * Proporciona operaciones CRUD para colecciones de datos
 */

const STORAGE_PREFIX = 'facturacion_';

/**
 * Obtiene la clave completa con prefijo
 * @param {string} collection - Nombre de la colección
 * @returns {string}
 */
const getKey = (collection) => `${STORAGE_PREFIX}${collection}`;

/**
 * Obtiene todos los items de una colección
 * @param {string} collection - Nombre de la colección
 * @returns {Array}
 */
export const getAll = (collection) => {
  try {
    const data = localStorage.getItem(getKey(collection));
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${collection}:`, error);
    return [];
  }
};

/**
 * Obtiene un item por ID
 * @param {string} collection - Nombre de la colección
 * @param {string} id - ID del item
 * @returns {Object|null}
 */
export const getById = (collection, id) => {
  const items = getAll(collection);
  return items.find((item) => item.id === id) || null;
};

/**
 * Busca items que coincidan con un criterio
 * @param {string} collection - Nombre de la colección
 * @param {Function} predicate - Función de filtro
 * @returns {Array}
 */
export const find = (collection, predicate) => {
  const items = getAll(collection);
  return items.filter(predicate);
};

/**
 * Busca el primer item que coincida con un criterio
 * @param {string} collection - Nombre de la colección
 * @param {Function} predicate - Función de filtro
 * @returns {Object|null}
 */
export const findOne = (collection, predicate) => {
  const items = getAll(collection);
  return items.find(predicate) || null;
};

/**
 * Guarda todos los items de una colección
 * @param {string} collection - Nombre de la colección
 * @param {Array} items - Items a guardar
 */
const saveAll = (collection, items) => {
  try {
    localStorage.setItem(getKey(collection), JSON.stringify(items));
  } catch (error) {
    console.error(`Error saving ${collection}:`, error);
    throw new Error(`Error al guardar datos: ${error.message}`);
  }
};

/**
 * Crea un nuevo item en la colección
 * @param {string} collection - Nombre de la colección
 * @param {Object} item - Item a crear
 * @returns {Object} Item creado
 */
export const create = (collection, item) => {
  const items = getAll(collection);
  items.push(item);
  saveAll(collection, items);
  return item;
};

/**
 * Actualiza un item existente
 * @param {string} collection - Nombre de la colección
 * @param {string} id - ID del item
 * @param {Object} updates - Datos a actualizar
 * @returns {Object|null} Item actualizado o null si no existe
 */
export const update = (collection, id, updates) => {
  const items = getAll(collection);
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) return null;

  items[index] = { ...items[index], ...updates };
  saveAll(collection, items);
  return items[index];
};

/**
 * Reemplaza un item completo
 * @param {string} collection - Nombre de la colección
 * @param {string} id - ID del item
 * @param {Object} newItem - Nuevo item
 * @returns {Object|null}
 */
export const replace = (collection, id, newItem) => {
  const items = getAll(collection);
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) return null;

  items[index] = newItem;
  saveAll(collection, items);
  return newItem;
};

/**
 * Elimina un item de la colección
 * @param {string} collection - Nombre de la colección
 * @param {string} id - ID del item
 * @returns {boolean} true si se eliminó
 */
export const remove = (collection, id) => {
  const items = getAll(collection);
  const filtered = items.filter((item) => item.id !== id);

  if (filtered.length === items.length) return false;

  saveAll(collection, filtered);
  return true;
};

/**
 * Cuenta items que coincidan con un criterio
 * @param {string} collection - Nombre de la colección
 * @param {Function} predicate - Función de filtro (opcional)
 * @returns {number}
 */
export const count = (collection, predicate = null) => {
  const items = getAll(collection);
  return predicate ? items.filter(predicate).length : items.length;
};

/**
 * Limpia una colección completa
 * @param {string} collection - Nombre de la colección
 */
export const clear = (collection) => {
  localStorage.removeItem(getKey(collection));
};

/**
 * Obtiene el último número de una secuencia
 * @param {string} sequenceName - Nombre de la secuencia
 * @returns {number}
 */
export const getSequence = (sequenceName) => {
  const key = `${STORAGE_PREFIX}seq_${sequenceName}`;
  const value = localStorage.getItem(key);
  return value ? parseInt(value, 10) : 0;
};

/**
 * Incrementa y obtiene el siguiente número de secuencia
 * @param {string} sequenceName - Nombre de la secuencia
 * @returns {number}
 */
export const nextSequence = (sequenceName) => {
  const current = getSequence(sequenceName);
  const next = current + 1;
  localStorage.setItem(`${STORAGE_PREFIX}seq_${sequenceName}`, String(next));
  return next;
};

// Nombres de colecciones
export const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  SALES: 'sales',
  INVOICES: 'invoices',
  INVENTORY_MOVEMENTS: 'inventory_movements',
  SETTINGS: 'settings'
};

// Nombres de secuencias
export const SEQUENCES = {
  SALES: 'sales',
  BOLETAS: 'boletas',
  FACTURAS: 'facturas'
};
