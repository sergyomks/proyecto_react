import * as Yup from 'yup';
import { v4 as uuidv4 } from 'uuid';

// Unidades de medida disponibles
export const PRODUCT_UNITS = {
  UNIDAD: 'unidad',
  KG: 'kg',
  GRAMO: 'gramo',
  LITRO: 'litro',
  ML: 'ml',
  METRO: 'metro',
  CAJA: 'caja',
  PAQUETE: 'paquete'
};

// Tallas disponibles para ropa
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Colores comunes
export const COLORS = [
  'Negro', 'Blanco', 'Gris', 'Azul', 'Rojo', 
  'Verde', 'Amarillo', 'Rosado', 'Morado', 'Naranja'
];

// Schema de validación para crear producto
export const ProductCreateSchema = Yup.object().shape({
  code: Yup.string()
    .required('El código es requerido'),
  barcode: Yup.string()
    .nullable(),
  name: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .required('El nombre es requerido'),
  description: Yup.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .nullable(),
  categoryId: Yup.string()
    .required('La categoría es requerida'),
  price: Yup.number()
    .min(0, 'El precio no puede ser negativo')
    .required('El precio es requerido'),
  cost: Yup.number()
    .min(0, 'El costo no puede ser negativo')
    .nullable(),
  unit: Yup.string()
    .oneOf(Object.values(PRODUCT_UNITS), 'Unidad inválida')
    .required('La unidad es requerida'),
  minStock: Yup.number()
    .min(0, 'El stock mínimo no puede ser negativo')
    .default(0),
  imageUrl: Yup.string()
    .nullable(),
  imageBase64: Yup.string()
    .nullable(),
  color: Yup.string()
    .nullable(),
  // Stock por talla
  stockBySize: Yup.object().shape({
    XS: Yup.number().min(0).default(0),
    S: Yup.number().min(0).default(0),
    M: Yup.number().min(0).default(0),
    L: Yup.number().min(0).default(0),
    XL: Yup.number().min(0).default(0),
    XXL: Yup.number().min(0).default(0)
  }).default({})
});


// Schema de validación para actualizar producto
export const ProductUpdateSchema = Yup.object().shape({
  code: Yup.string(),
  barcode: Yup.string().nullable(),
  name: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  description: Yup.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .nullable(),
  categoryId: Yup.string(),
  price: Yup.number()
    .min(0, 'El precio no puede ser negativo'),
  cost: Yup.number()
    .min(0, 'El costo no puede ser negativo')
    .nullable(),
  unit: Yup.string()
    .oneOf(Object.values(PRODUCT_UNITS), 'Unidad inválida'),
  minStock: Yup.number()
    .min(0, 'El stock mínimo no puede ser negativo'),
  imageUrl: Yup.string()
    .url('URL de imagen inválida')
    .nullable(),
  isActive: Yup.boolean()
});

/**
 * Crea un nuevo producto
 * @param {Object} productData - Datos del producto
 * @returns {Object} Producto creado
 */
export const createProduct = async (productData) => {
  const validated = await ProductCreateSchema.validate(productData);
  
  // Calcular stock total desde tallas
  const stockBySize = validated.stockBySize || {};
  const totalStock = Object.values(stockBySize).reduce((sum, qty) => sum + (qty || 0), 0);
  
  return {
    id: uuidv4(),
    code: validated.code,
    barcode: validated.barcode || null,
    name: validated.name,
    description: validated.description || null,
    categoryId: validated.categoryId,
    price: validated.price,
    cost: validated.cost || null,
    unit: validated.unit,
    stock: totalStock,
    stockBySize: stockBySize,
    minStock: validated.minStock || 0,
    imageUrl: validated.imageUrl || null,
    imageBase64: validated.imageBase64 || null,
    color: validated.color || null,
    isActive: true,
    priceHistory: [{
      price: validated.price,
      date: new Date().toISOString()
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Actualiza un producto y registra cambios de precio
 * @param {Object} product - Producto existente
 * @param {Object} updates - Datos a actualizar
 * @returns {Object} Producto actualizado
 */
export const updateProduct = async (product, updates) => {
  const validated = await ProductUpdateSchema.validate(updates);
  const updatedProduct = { ...product, ...validated };
  
  // Registrar cambio de precio si aplica
  if (validated.price !== undefined && validated.price !== product.price) {
    updatedProduct.priceHistory = [
      ...product.priceHistory,
      { price: validated.price, date: new Date().toISOString() }
    ];
  }
  
  updatedProduct.updatedAt = new Date().toISOString();
  return updatedProduct;
};

/**
 * Verifica si el producto tiene stock bajo
 * @param {Object} product - Producto
 * @returns {boolean}
 */
export const hasLowStock = (product) => {
  return product.stock <= product.minStock;
};

/**
 * Serializa un producto para almacenamiento
 * @param {Object} product - Producto
 * @returns {string} JSON string
 */
export const serializeProduct = (product) => {
  return JSON.stringify(product);
};

/**
 * Deserializa un producto desde almacenamiento
 * @param {string} json - JSON string
 * @returns {Object} Producto
 */
export const deserializeProduct = (json) => {
  return JSON.parse(json);
};

/**
 * Compara dos productos para verificar igualdad (excluyendo timestamps)
 * @param {Object} p1 - Producto 1
 * @param {Object} p2 - Producto 2
 * @returns {boolean}
 */
export const areProductsEqual = (p1, p2) => {
  const keys = ['id', 'code', 'barcode', 'name', 'description', 'categoryId', 
                'price', 'cost', 'unit', 'stock', 'minStock', 'imageUrl', 'isActive'];
  return keys.every(key => p1[key] === p2[key]);
};
