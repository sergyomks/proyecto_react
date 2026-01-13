import { createProduct, updateProduct, hasLowStock } from '../models/Product';
import * as Storage from './storage/StorageService';

const COLLECTION = Storage.COLLECTIONS.PRODUCTS;

/**
 * Obtiene todos los productos
 * @param {boolean} includeInactive - Incluir productos inactivos
 * @returns {Array}
 */
export const getAll = (includeInactive = false) => {
  const products = Storage.getAll(COLLECTION);
  return includeInactive ? products : products.filter((p) => p.isActive);
};

/**
 * Obtiene un producto por ID
 * @param {string} id - ID del producto
 * @returns {Object|null}
 */
export const getById = (id) => {
  return Storage.getById(COLLECTION, id);
};

/**
 * Obtiene un producto por código de barras
 * @param {string} barcode - Código de barras
 * @returns {Object|null}
 */
export const getByBarcode = (barcode) => {
  return Storage.findOne(COLLECTION, (p) => p.barcode === barcode && p.isActive);
};

/**
 * Obtiene un producto por código
 * @param {string} code - Código del producto
 * @returns {Object|null}
 */
export const getByCode = (code) => {
  return Storage.findOne(COLLECTION, (p) => p.code === code && p.isActive);
};

/**
 * Crea un nuevo producto
 * @param {Object} productData - Datos del producto
 * @returns {Object} Producto creado
 */
export const create = async (productData) => {
  // Verificar código único
  const existingCode = Storage.findOne(COLLECTION, (p) => p.code === productData.code);
  if (existingCode) {
    throw new Error('El código ya está en uso');
  }

  // Verificar código de barras único si se proporciona
  if (productData.barcode) {
    const existingBarcode = Storage.findOne(COLLECTION, (p) => p.barcode === productData.barcode);
    if (existingBarcode) {
      throw new Error('El código de barras ya está en uso');
    }
  }

  const product = await createProduct(productData);
  Storage.create(COLLECTION, product);
  return product;
};

/**
 * Actualiza un producto
 * @param {string} id - ID del producto
 * @param {Object} updates - Datos a actualizar
 * @returns {Object} Producto actualizado
 */
export const update = async (id, updates) => {
  const product = Storage.getById(COLLECTION, id);
  if (!product) {
    throw new Error('Producto no encontrado');
  }

  // Verificar código único si se cambia
  if (updates.code && updates.code !== product.code) {
    const existing = Storage.findOne(COLLECTION, (p) => p.code === updates.code && p.id !== id);
    if (existing) {
      throw new Error('El código ya está en uso');
    }
  }

  // Verificar código de barras único si se cambia
  if (updates.barcode && updates.barcode !== product.barcode) {
    const existing = Storage.findOne(COLLECTION, (p) => p.barcode === updates.barcode && p.id !== id);
    if (existing) {
      throw new Error('El código de barras ya está en uso');
    }
  }

  const updatedProduct = await updateProduct(product, updates);
  Storage.replace(COLLECTION, id, updatedProduct);
  return updatedProduct;
};

/**
 * Desactiva un producto
 * @param {string} id - ID del producto
 * @returns {Object}
 */
export const deactivate = (id) => {
  const product = Storage.getById(COLLECTION, id);
  if (!product) {
    throw new Error('Producto no encontrado');
  }

  const updatedProduct = {
    ...product,
    isActive: false,
    updatedAt: new Date().toISOString()
  };

  Storage.replace(COLLECTION, id, updatedProduct);
  return updatedProduct;
};

/**
 * Busca productos con filtros y paginación
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Object} { items, total, page, totalPages }
 */
export const search = (filters = {}) => {
  let products = getAll(filters.includeInactive);

  // Filtrar por query (nombre o código)
  if (filters.query) {
    const query = filters.query.toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(query) || p.code.toLowerCase().includes(query) || (p.barcode && p.barcode.includes(query))
    );
  }

  // Filtrar por categoría
  if (filters.categoryId) {
    products = products.filter((p) => p.categoryId === filters.categoryId);
  }

  // Filtrar por stock bajo
  if (filters.lowStock) {
    products = products.filter((p) => hasLowStock(p));
  }

  // Ordenar
  const sortField = filters.sortBy || 'name';
  const sortOrder = filters.sortOrder || 'asc';
  products.sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const comparison = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Paginación
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const total = products.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const items = products.slice(start, start + limit);

  return { items, total, page, totalPages };
};

/**
 * Obtiene productos con stock bajo
 * @returns {Array}
 */
export const getLowStockProducts = () => {
  return getAll().filter((p) => hasLowStock(p));
};

/**
 * Actualiza el stock de un producto (general o por talla)
 * @param {string} id - ID del producto
 * @param {number} quantity - Cantidad a agregar (negativo para restar)
 * @param {string} size - Talla específica (opcional)
 * @returns {Object}
 */
export const updateStock = (id, quantity, size = null) => {
  const product = Storage.getById(COLLECTION, id);
  if (!product) {
    throw new Error('Producto no encontrado');
  }

  let updatedProduct = { ...product };

  if (size && product.stockBySize) {
    // Actualizar stock de talla específica
    const currentSizeStock = product.stockBySize[size] || 0;
    const newSizeStock = currentSizeStock + quantity;

    if (newSizeStock < 0) {
      throw new Error(`Stock insuficiente en talla ${size}`);
    }

    updatedProduct.stockBySize = {
      ...product.stockBySize,
      [size]: newSizeStock
    };

    // Recalcular stock total
    updatedProduct.stock = Object.values(updatedProduct.stockBySize).reduce((sum, qty) => sum + (qty || 0), 0);
  } else {
    // Actualizar stock general
    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw new Error('Stock insuficiente');
    }
    updatedProduct.stock = newStock;
  }

  updatedProduct.updatedAt = new Date().toISOString();
  Storage.replace(COLLECTION, id, updatedProduct);
  return updatedProduct;
};

/**
 * Obtiene el stock de una talla específica
 * @param {string} id - ID del producto
 * @param {string} size - Talla
 * @returns {number}
 */
export const getStockBySize = (id, size) => {
  const product = Storage.getById(COLLECTION, id);
  if (!product) return 0;
  return product.stockBySize?.[size] || 0;
};

/**
 * Obtiene productos por categoría
 * @param {string} categoryId - ID de la categoría
 * @returns {Array}
 */
export const getByCategory = (categoryId) => {
  return getAll().filter((p) => p.categoryId === categoryId);
};
