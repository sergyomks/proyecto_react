import * as Yup from 'yup';
import { v4 as uuidv4 } from 'uuid';

// Estados de venta
export const SALE_STATUS = {
  COMPLETADA: 'completada',
  ANULADA: 'anulada'
};

// Métodos de pago
export const PAYMENT_METHODS = {
  EFECTIVO: 'efectivo',
  TARJETA: 'tarjeta',
  TRANSFERENCIA: 'transferencia',
  YAPE: 'yape',
  PLIN: 'plin'
};

// Tasa de impuesto por defecto (IGV Perú 18%)
export const DEFAULT_TAX_RATE = 0.18;

// Schema para item de venta
export const SaleItemSchema = Yup.object().shape({
  productId: Yup.string().required('El producto es requerido'),
  productName: Yup.string().required('El nombre del producto es requerido'),
  productCode: Yup.string().required('El código del producto es requerido'),
  quantity: Yup.number()
    .min(1, 'La cantidad debe ser al menos 1')
    .required('La cantidad es requerida'),
  unitPrice: Yup.number()
    .min(0, 'El precio no puede ser negativo')
    .required('El precio es requerido'),
  subtotal: Yup.number()
    .min(0, 'El subtotal no puede ser negativo')
    .required('El subtotal es requerido')
});

// Schema para crear venta
export const SaleCreateSchema = Yup.object().shape({
  items: Yup.array()
    .of(SaleItemSchema)
    .min(1, 'Debe haber al menos un producto')
    .required('Los items son requeridos'),
  paymentMethod: Yup.string()
    .oneOf(Object.values(PAYMENT_METHODS), 'Método de pago inválido')
    .required('El método de pago es requerido'),
  clientId: Yup.string().nullable(),
  clientName: Yup.string().nullable(),
  notes: Yup.string().max(500).nullable()
});


/**
 * Calcula el subtotal de un item
 * @param {number} quantity - Cantidad
 * @param {number} unitPrice - Precio unitario
 * @returns {number} Subtotal
 */
export const calculateItemSubtotal = (quantity, unitPrice) => {
  return Math.round(quantity * unitPrice * 100) / 100;
};

/**
 * Calcula totales de una venta
 * @param {Array} items - Items de la venta
 * @param {number} taxRate - Tasa de impuesto
 * @returns {Object} { subtotal, tax, total }
 */
export const calculateSaleTotals = (items, taxRate = DEFAULT_TAX_RATE) => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const subtotalRounded = Math.round(subtotal * 100) / 100;
  const tax = Math.round(subtotalRounded * taxRate * 100) / 100;
  const total = Math.round((subtotalRounded + tax) * 100) / 100;
  
  return { subtotal: subtotalRounded, tax, total };
};

/**
 * Genera número correlativo de venta
 * @param {number} lastNumber - Último número usado
 * @param {string} prefix - Prefijo (ej: 'V')
 * @returns {string} Número de venta
 */
export const generateSaleNumber = (lastNumber = 0, prefix = 'V') => {
  const nextNumber = lastNumber + 1;
  return `${prefix}${String(nextNumber).padStart(8, '0')}`;
};

/**
 * Crea una nueva venta
 * @param {Object} saleData - Datos de la venta
 * @param {string} userId - ID del usuario que realiza la venta
 * @param {number} lastSaleNumber - Último número de venta
 * @returns {Object} Venta creada
 */
export const createSale = async (saleData, userId, lastSaleNumber = 0) => {
  const validated = await SaleCreateSchema.validate(saleData);
  const { subtotal, tax, total } = calculateSaleTotals(validated.items);
  
  return {
    id: uuidv4(),
    number: generateSaleNumber(lastSaleNumber),
    items: validated.items,
    subtotal,
    taxRate: DEFAULT_TAX_RATE,
    tax,
    total,
    paymentMethod: validated.paymentMethod,
    clientId: validated.clientId || null,
    clientName: validated.clientName || null,
    notes: validated.notes || null,
    userId,
    status: SALE_STATUS.COMPLETADA,
    cancelReason: null,
    createdAt: new Date().toISOString()
  };
};

/**
 * Anula una venta
 * @param {Object} sale - Venta a anular
 * @param {string} reason - Motivo de anulación
 * @returns {Object} Venta anulada
 */
export const cancelSale = (sale, reason) => {
  return {
    ...sale,
    status: SALE_STATUS.ANULADA,
    cancelReason: reason,
    cancelledAt: new Date().toISOString()
  };
};

/**
 * Serializa una venta para almacenamiento
 * @param {Object} sale - Venta
 * @returns {string} JSON string
 */
export const serializeSale = (sale) => {
  return JSON.stringify(sale);
};

/**
 * Deserializa una venta desde almacenamiento
 * @param {string} json - JSON string
 * @returns {Object} Venta
 */
export const deserializeSale = (json) => {
  return JSON.parse(json);
};
