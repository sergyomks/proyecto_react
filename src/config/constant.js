// URLs base
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
export const BASE_URL = '/app/dashboard/analytics';
export const BASE_TITLE = ' | Sistema de Facturación';

// Configuración de layout
export const CONFIG = {
  layout: 'vertical',
  layoutType: 'menu-light'
};

// Tallas disponibles
export const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Tipos de documento
export const TIPOS_DOCUMENTO = {
  DNI: 'DNI',
  RUC: 'RUC',
  CE: 'CE',
  PASAPORTE: 'PASAPORTE'
};

// Métodos de pago
export const METODOS_PAGO = {
  EFECTIVO: 'EFECTIVO',
  TARJETA: 'TARJETA',
  YAPE: 'YAPE',
  PLIN: 'PLIN',
  TRANSFERENCIA: 'TRANSFERENCIA'
};

// Estados de venta
export const ESTADOS_VENTA = {
  COMPLETADA: 'COMPLETADA',
  ANULADA: 'ANULADA',
  PENDIENTE: 'PENDIENTE'
};

// Tipos de comprobante
export const TIPOS_COMPROBANTE = {
  BOLETA: 'BOLETA',
  FACTURA: 'FACTURA'
};

// Roles de usuario
export const ROLES = {
  ADMIN: 'ADMIN',
  VENDEDOR: 'VENDEDOR',
  CAJERO: 'CAJERO'
};

// Tipos de movimiento de inventario
export const TIPOS_MOVIMIENTO = {
  ENTRADA: 'ENTRADA',
  SALIDA: 'SALIDA',
  AJUSTE: 'AJUSTE',
  VENTA: 'VENTA',
  ANULACION: 'ANULACION'
};

// IGV (Perú)
export const IGV_RATE = 0.18;
