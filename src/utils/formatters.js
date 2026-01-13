import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea un número como moneda (Soles peruanos)
 * @param {number} amount - Monto a formatear
 * @param {string} currency - Símbolo de moneda
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'S/') => {
  if (amount === null || amount === undefined) return `${currency} 0.00`;
  return `${currency} ${amount.toFixed(2)}`;
};

/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @param {number} decimals - Decimales
 * @returns {string}
 */
export const formatNumber = (number, decimals = 2) => {
  if (number === null || number === undefined) return '0';
  return number.toLocaleString('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Formatea una fecha
 * @param {string|Date} date - Fecha a formatear
 * @param {string} formatStr - Formato de salida
 * @returns {string}
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, formatStr, { locale: es });
};

/**
 * Formatea fecha y hora
 * @param {string|Date} date - Fecha a formatear
 * @returns {string}
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

/**
 * Formatea solo la hora
 * @param {string|Date} date - Fecha a formatear
 * @returns {string}
 */
export const formatTime = (date) => {
  return formatDate(date, 'HH:mm:ss');
};

/**
 * Formatea un número correlativo con ceros a la izquierda
 * @param {number} number - Número
 * @param {number} length - Longitud total
 * @param {string} prefix - Prefijo opcional
 * @returns {string}
 */
export const formatCorrelative = (number, length = 8, prefix = '') => {
  const padded = String(number).padStart(length, '0');
  return prefix ? `${prefix}${padded}` : padded;
};

/**
 * Formatea número de comprobante
 * @param {string} series - Serie (ej: B001)
 * @param {string|number} number - Número correlativo
 * @returns {string}
 */
export const formatInvoiceNumber = (series, number) => {
  const numStr = typeof number === 'number' ? String(number).padStart(8, '0') : number;
  return `${series}-${numStr}`;
};

/**
 * Formatea un RUC/DNI con guiones
 * @param {string} document - Número de documento
 * @param {string} type - Tipo de documento
 * @returns {string}
 */
export const formatDocument = (document, type = 'DNI') => {
  if (!document) return '';
  if (type === 'RUC' && document.length === 11) {
    return `${document.slice(0, 2)}-${document.slice(2)}`;
  }
  return document;
};

/**
 * Formatea un número de teléfono
 * @param {string} phone - Teléfono
 * @returns {string}
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Trunca un texto largo
 * @param {string} text - Texto
 * @param {number} maxLength - Longitud máxima
 * @returns {string}
 */
export const truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Capitaliza la primera letra
 * @param {string} text - Texto
 * @returns {string}
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formatea el estado de una venta
 * @param {string} status - Estado
 * @returns {Object} { label, variant }
 */
export const formatSaleStatus = (status) => {
  const statusMap = {
    completada: { label: 'Completada', variant: 'success' },
    anulada: { label: 'Anulada', variant: 'danger' },
    pendiente: { label: 'Pendiente', variant: 'warning' }
  };
  return statusMap[status] || { label: status, variant: 'secondary' };
};

/**
 * Formatea el rol de usuario
 * @param {string} role - Rol
 * @returns {string}
 */
export const formatRole = (role) => {
  const roleMap = {
    admin: 'Administrador',
    vendedor: 'Vendedor',
    cajero: 'Cajero'
  };
  return roleMap[role] || role;
};

/**
 * Formatea método de pago
 * @param {string} method - Método
 * @returns {string}
 */
export const formatPaymentMethod = (method) => {
  const methodMap = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
    yape: 'Yape',
    plin: 'Plin'
  };
  return methodMap[method] || method;
};
