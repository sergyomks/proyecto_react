import { createSale, cancelSale, SALE_STATUS } from '../models/Sale';
import { createInvoice, saleItemsToInvoiceItems, INVOICE_TYPES } from '../models/Invoice';
import * as Storage from './storage/StorageService';
import * as ProductService from './ProductService';

const SALES_COLLECTION = Storage.COLLECTIONS.SALES;
const INVOICES_COLLECTION = Storage.COLLECTIONS.INVOICES;

export const getAll = (includeAnuladas = true) => {
  const sales = Storage.getAll(SALES_COLLECTION);
  return includeAnuladas ? sales : sales.filter((s) => s.status === SALE_STATUS.COMPLETADA);
};

export const getById = (id) => {
  return Storage.getById(SALES_COLLECTION, id);
};

export const create = async (saleData, userId) => {
  // Validar que hay items
  if (!saleData.items || saleData.items.length === 0) {
    throw new Error('No hay productos en la venta');
  }

  // Validar stock de productos (solo si existen en localStorage)
  // Los productos del backend API no están en localStorage, así que solo validamos si existen
  for (const item of saleData.items) {
    const product = ProductService.getById(item.productId);
    // Solo validar stock si el producto existe en localStorage
    if (product && product.stock < item.quantity) {
      throw new Error(`Stock insuficiente para ${item.productName}. Disponible: ${product.stock}`);
    }
  }

  // Obtener último número de venta
  const lastNumber = Storage.getSequence(Storage.SEQUENCES.SALES);

  // Crear la venta
  const sale = await createSale(saleData, userId, lastNumber);

  // Decrementar stock de productos locales (si existen)
  for (const item of sale.items) {
    try {
      const product = ProductService.getById(item.productId);
      if (product) {
        ProductService.updateStock(item.productId, -item.quantity, item.size || null);
      }
    } catch (e) {
      // Ignorar errores de stock para productos que no están en localStorage
      console.warn(`No se pudo actualizar stock local de ${item.productName}`);
    }
  }

  // Guardar venta y actualizar secuencia
  Storage.create(SALES_COLLECTION, sale);
  Storage.nextSequence(Storage.SEQUENCES.SALES);

  return sale;
};

export const cancel = (id, reason) => {
  const sale = Storage.getById(SALES_COLLECTION, id);
  if (!sale) {
    throw new Error('Venta no encontrada');
  }

  if (sale.status === SALE_STATUS.ANULADA) {
    throw new Error('La venta ya está anulada');
  }

  // Revertir stock de productos (con soporte para tallas)
  for (const item of sale.items) {
    try {
      ProductService.updateStock(item.productId, item.quantity, item.size || null);
    } catch (e) {
      console.warn(`No se pudo revertir stock de ${item.productName}`);
    }
  }

  const cancelledSale = cancelSale(sale, reason);
  Storage.replace(SALES_COLLECTION, id, cancelledSale);
  return cancelledSale;
};

export const generateInvoice = async (saleId, type, issuerData, clientData = null) => {
  const sale = Storage.getById(SALES_COLLECTION, saleId);
  if (!sale) {
    throw new Error('Venta no encontrada');
  }

  // Obtener último número según tipo
  const sequenceName = type === INVOICE_TYPES.BOLETA ? Storage.SEQUENCES.BOLETAS : Storage.SEQUENCES.FACTURAS;
  const lastNumber = Storage.getSequence(sequenceName);

  const invoiceData = {
    saleId,
    type,
    issuerData,
    clientData,
    items: saleItemsToInvoiceItems(sale.items),
    subtotal: sale.subtotal,
    tax: sale.tax,
    total: sale.total
  };

  const invoice = await createInvoice(invoiceData, lastNumber);

  Storage.create(INVOICES_COLLECTION, invoice);
  Storage.nextSequence(sequenceName);

  return invoice;
};

export const getInvoiceBySaleId = (saleId) => {
  return Storage.findOne(INVOICES_COLLECTION, (i) => i.saleId === saleId);
};

export const search = (filters = {}) => {
  let sales = getAll();

  // Filtrar por fecha
  if (filters.startDate) {
    const start = new Date(filters.startDate);
    start.setHours(0, 0, 0, 0);
    sales = sales.filter((s) => new Date(s.createdAt) >= start);
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    sales = sales.filter((s) => new Date(s.createdAt) <= end);
  }

  // Filtrar por estado
  if (filters.status) {
    sales = sales.filter((s) => s.status === filters.status);
  }

  // Filtrar por usuario
  if (filters.userId) {
    sales = sales.filter((s) => s.userId === filters.userId);
  }

  // Ordenar por fecha descendente
  sales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Paginación
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const total = sales.length;
  const start = (page - 1) * limit;
  const items = sales.slice(start, start + limit);

  return { items, total, page, totalPages: Math.ceil(total / limit) };
};

export const getTodayStats = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sales = getAll(false).filter((s) => new Date(s.createdAt) >= today);

  return {
    count: sales.length,
    total: sales.reduce((sum, s) => sum + s.total, 0)
  };
};
