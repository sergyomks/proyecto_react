import { createCategory, updateCategory, buildCategoryTree, canDeleteCategory } from '../models/Category';
import * as Storage from './storage/StorageService';

const COLLECTION = Storage.COLLECTIONS.CATEGORIES;

/**
 * Obtiene todas las categorías
 * @param {boolean} includeInactive - Incluir categorías inactivas
 * @returns {Array}
 */
export const getAll = (includeInactive = false) => {
  const categories = Storage.getAll(COLLECTION);
  return includeInactive ? categories : categories.filter((c) => c.isActive);
};

/**
 * Obtiene una categoría por ID
 * @param {string} id - ID de la categoría
 * @returns {Object|null}
 */
export const getById = (id) => {
  return Storage.getById(COLLECTION, id);
};

/**
 * Obtiene el árbol jerárquico de categorías
 * @returns {Array}
 */
export const getTree = () => {
  const categories = getAll();
  const products = Storage.getAll(Storage.COLLECTIONS.PRODUCTS);

  // Contar productos por categoría
  const productCounts = products.reduce((acc, product) => {
    if (product.isActive) {
      acc[product.categoryId] = (acc[product.categoryId] || 0) + 1;
    }
    return acc;
  }, {});

  return buildCategoryTree(categories, productCounts);
};

/**
 * Crea una nueva categoría
 * @param {Object} categoryData - Datos de la categoría
 * @returns {Object} Categoría creada
 */
export const create = async (categoryData) => {
  // Verificar nombre único en el mismo nivel
  const existing = Storage.findOne(
    COLLECTION,
    (c) => c.name.toLowerCase() === categoryData.name.toLowerCase() && c.parentId === (categoryData.parentId || null) && c.isActive
  );

  if (existing) {
    throw new Error('Ya existe una categoría con ese nombre en este nivel');
  }

  // Verificar que el padre existe si se especifica
  if (categoryData.parentId) {
    const parent = Storage.getById(COLLECTION, categoryData.parentId);
    if (!parent || !parent.isActive) {
      throw new Error('La categoría padre no existe');
    }
  }

  const category = await createCategory(categoryData);
  Storage.create(COLLECTION, category);
  return category;
};

/**
 * Actualiza una categoría
 * @param {string} id - ID de la categoría
 * @param {Object} updates - Datos a actualizar
 * @returns {Object} Categoría actualizada
 */
export const update = async (id, updates) => {
  const category = Storage.getById(COLLECTION, id);
  if (!category) {
    throw new Error('Categoría no encontrada');
  }

  // Verificar nombre único si se cambia
  if (updates.name && updates.name.toLowerCase() !== category.name.toLowerCase()) {
    const parentId = updates.parentId !== undefined ? updates.parentId : category.parentId;
    const existing = Storage.findOne(
      COLLECTION,
      (c) => c.name.toLowerCase() === updates.name.toLowerCase() && c.parentId === parentId && c.id !== id && c.isActive
    );

    if (existing) {
      throw new Error('Ya existe una categoría con ese nombre en este nivel');
    }
  }

  const updatedCategory = await updateCategory(category, updates);
  Storage.replace(COLLECTION, id, updatedCategory);
  return updatedCategory;
};

/**
 * Elimina una categoría
 * @param {string} id - ID de la categoría
 * @returns {boolean}
 */
export const remove = (id) => {
  const category = Storage.getById(COLLECTION, id);
  if (!category) {
    throw new Error('Categoría no encontrada');
  }

  // Verificar si tiene productos
  const products = Storage.getAll(Storage.COLLECTIONS.PRODUCTS);
  const check = canDeleteCategory(id, products);

  if (!check.canDelete) {
    throw new Error(check.reason);
  }

  // Verificar si tiene subcategorías
  const hasChildren = Storage.find(COLLECTION, (c) => c.parentId === id && c.isActive).length > 0;
  if (hasChildren) {
    throw new Error('La categoría tiene subcategorías');
  }

  // Marcar como inactiva en lugar de eliminar
  const updatedCategory = {
    ...category,
    isActive: false,
    updatedAt: new Date().toISOString()
  };
  Storage.replace(COLLECTION, id, updatedCategory);
  return true;
};

/**
 * Busca categorías
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Array}
 */
export const search = (filters = {}) => {
  let categories = getAll(filters.includeInactive);

  if (filters.query) {
    const query = filters.query.toLowerCase();
    categories = categories.filter(
      (c) => c.name.toLowerCase().includes(query) || (c.description && c.description.toLowerCase().includes(query))
    );
  }

  if (filters.parentId !== undefined) {
    categories = categories.filter((c) => c.parentId === filters.parentId);
  }

  return categories;
};

/**
 * Obtiene categorías raíz (sin padre)
 * @returns {Array}
 */
export const getRootCategories = () => {
  return search({ parentId: null });
};

/**
 * Obtiene subcategorías de una categoría
 * @param {string} parentId - ID de la categoría padre
 * @returns {Array}
 */
export const getChildren = (parentId) => {
  return search({ parentId });
};

/**
 * Inicializa categorías por defecto para tienda de poleras
 */
export const initializeDefaultCategories = async () => {
  const categories = Storage.getAll(COLLECTION);
  if (categories.length === 0) {
    const defaults = [
      { name: 'Hombre', description: 'Poleras para hombre' },
      { name: 'Dama', description: 'Poleras para dama' },
      { name: 'Niño', description: 'Poleras para niños' },
      { name: 'Niña', description: 'Poleras para niñas' },
      { name: 'Unisex', description: 'Poleras unisex' }
    ];

    for (const cat of defaults) {
      await create(cat);
    }
  }
};
