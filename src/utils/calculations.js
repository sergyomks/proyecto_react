/**
 * Utilidades de cálculo para el sistema de facturación
 */

// Tasa de impuesto por defecto (IGV Perú 18%)
export const DEFAULT_TAX_RATE = 0.18;

/**
 * Redondea un número a 2 decimales
 * @param {number} value - Valor a redondear
 * @returns {number}
 */
export const round2 = (value) => {
  return Math.round(value * 100) / 100;
};

/**
 * Calcula el subtotal de un item (cantidad * precio)
 * @param {number} quantity - Cantidad
 * @param {number} unitPrice - Precio unitario
 * @returns {number}
 */
export const calculateItemSubtotal = (quantity, unitPrice) => {
  return round2(quantity * unitPrice);
};

/**
 * Calcula el subtotal de una lista de items
 * @param {Array} items - Items con propiedad subtotal
 * @returns {number}
 */
export const calculateSubtotal = (items) => {
  const sum = items.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  return round2(sum);
};

/**
 * Calcula el impuesto sobre un monto
 * @param {number} amount - Monto base
 * @param {number} taxRate - Tasa de impuesto (default 0.18)
 * @returns {number}
 */
export const calculateTax = (amount, taxRate = DEFAULT_TAX_RATE) => {
  return round2(amount * taxRate);
};

/**
 * Calcula el total (subtotal + impuesto)
 * @param {number} subtotal - Subtotal
 * @param {number} tax - Impuesto
 * @returns {number}
 */
export const calculateTotal = (subtotal, tax) => {
  return round2(subtotal + tax);
};

/**
 * Calcula todos los totales de una venta/carrito
 * @param {Array} items - Items con cantidad y precio
 * @param {number} taxRate - Tasa de impuesto
 * @returns {Object} { subtotal, tax, total }
 */
export const calculateCartTotals = (items, taxRate = DEFAULT_TAX_RATE) => {
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal, taxRate);
  const total = calculateTotal(subtotal, tax);

  return { subtotal, tax, total };
};

/**
 * Calcula el precio sin impuesto desde un precio con impuesto
 * @param {number} priceWithTax - Precio con impuesto incluido
 * @param {number} taxRate - Tasa de impuesto
 * @returns {number}
 */
export const calculatePriceWithoutTax = (priceWithTax, taxRate = DEFAULT_TAX_RATE) => {
  return round2(priceWithTax / (1 + taxRate));
};

/**
 * Calcula el margen de ganancia
 * @param {number} price - Precio de venta
 * @param {number} cost - Costo
 * @returns {number} Porcentaje de margen
 */
export const calculateMargin = (price, cost) => {
  if (cost === 0) return 100;
  return round2(((price - cost) / cost) * 100);
};

/**
 * Calcula la valorización del inventario
 * @param {Array} products - Productos con stock y costo
 * @returns {number}
 */
export const calculateInventoryValue = (products) => {
  const value = products.reduce((acc, product) => {
    const cost = product.cost || product.price;
    return acc + product.stock * cost;
  }, 0);
  return round2(value);
};

/**
 * Calcula estadísticas de ventas
 * @param {Array} sales - Lista de ventas
 * @returns {Object} { count, total, average, min, max }
 */
export const calculateSalesStats = (sales) => {
  if (sales.length === 0) {
    return { count: 0, total: 0, average: 0, min: 0, max: 0 };
  }

  const totals = sales.map((s) => s.total);
  const sum = totals.reduce((a, b) => a + b, 0);

  return {
    count: sales.length,
    total: round2(sum),
    average: round2(sum / sales.length),
    min: round2(Math.min(...totals)),
    max: round2(Math.max(...totals))
  };
};
