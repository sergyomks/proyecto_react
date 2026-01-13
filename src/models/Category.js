import * as Yup from 'yup';
import { v4 as uuidv4 } from 'uuid';

// Schema de validación para crear categoría
export const CategoryCreateSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .required('El nombre es requerido'),
  description: Yup.string().max(300, 'La descripción no puede exceder 300 caracteres').nullable(),
  parentId: Yup.string().nullable()
});

// Schema de validación para actualizar categoría
export const CategoryUpdateSchema = Yup.object().shape({
  name: Yup.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
  description: Yup.string().max(300, 'La descripción no puede exceder 300 caracteres').nullable(),
  parentId: Yup.string().nullable(),
  isActive: Yup.boolean()
});

/**
 * Crea una nueva categoría
 * @param {Object} categoryData - Datos de la categoría
 * @returns {Object} Categoría creada
 */
export const createCategory = async (categoryData) => {
  const validated = await CategoryCreateSchema.validate(categoryData);

  return {
    id: uuidv4(),
    name: validated.name,
    description: validated.description || null,
    parentId: validated.parentId || null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Actualiza una categoría
 * @param {Object} category - Categoría existente
 * @param {Object} updates - Datos a actualizar
 * @returns {Object} Categoría actualizada
 */
export const updateCategory = async (category, updates) => {
  const validated = await CategoryUpdateSchema.validate(updates);
  return {
    ...category,
    ...validated,
    updatedAt: new Date().toISOString()
  };
};

/**
 * Construye árbol jerárquico de categorías
 * @param {Array} categories - Lista plana de categorías
 * @param {Object} productCounts - Mapa de categoryId -> count
 * @returns {Array} Árbol de categorías
 */
export const buildCategoryTree = (categories, productCounts = {}) => {
  const categoryMap = new Map();
  const roots = [];

  // Crear mapa de categorías
  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      ...cat,
      children: [],
      productCount: productCounts[cat.id] || 0
    });
  });

  // Construir árbol
  categories.forEach((cat) => {
    const node = categoryMap.get(cat.id);
    if (cat.parentId && categoryMap.has(cat.parentId)) {
      categoryMap.get(cat.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

/**
 * Obtiene todos los IDs de categorías descendientes
 * @param {string} categoryId - ID de categoría padre
 * @param {Array} categories - Lista de categorías
 * @returns {Array} IDs de descendientes
 */
export const getDescendantIds = (categoryId, categories) => {
  const descendants = [];
  const children = categories.filter((c) => c.parentId === categoryId);

  children.forEach((child) => {
    descendants.push(child.id);
    descendants.push(...getDescendantIds(child.id, categories));
  });

  return descendants;
};

/**
 * Verifica si una categoría puede ser eliminada
 * @param {string} categoryId - ID de categoría
 * @param {Array} products - Lista de productos
 * @returns {Object} { canDelete: boolean, reason?: string }
 */
export const canDeleteCategory = (categoryId, products) => {
  const hasProducts = products.some((p) => p.categoryId === categoryId && p.isActive);

  if (hasProducts) {
    return {
      canDelete: false,
      reason: 'La categoría tiene productos asociados'
    };
  }

  return { canDelete: true };
};

/**
 * Serializa una categoría para almacenamiento
 * @param {Object} category - Categoría
 * @returns {string} JSON string
 */
export const serializeCategory = (category) => {
  return JSON.stringify(category);
};

/**
 * Deserializa una categoría desde almacenamiento
 * @param {string} json - JSON string
 * @returns {Object} Categoría
 */
export const deserializeCategory = (json) => {
  return JSON.parse(json);
};
