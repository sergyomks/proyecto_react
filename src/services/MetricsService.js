import * as Storage from './storage/StorageService';
import { SALE_STATUS } from '../models/Sale';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

const SALES_COLLECTION = Storage.COLLECTIONS.SALES;
const PRODUCTS_COLLECTION = Storage.COLLECTIONS.PRODUCTS;
const CATEGORIES_COLLECTION = Storage.COLLECTIONS.CATEGORIES;

/**
 * Obtiene ventas completadas
 */
const getCompletedSales = () => {
  return Storage.getAll(SALES_COLLECTION).filter((s) => s.status === SALE_STATUS.COMPLETADA);
};

/**
 * Ventas de los últimos 7 días (para gráfico de líneas)
 */
export const getSalesLast7Days = () => {
  const sales = getCompletedSales();
  const today = new Date();
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLabel = format(date, 'EEE', { locale: es });

    const daySales = sales.filter((s) => {
      const saleDate = format(new Date(s.createdAt), 'yyyy-MM-dd');
      return saleDate === dateStr;
    });

    days.push({
      date: dateStr,
      label: dayLabel,
      total: daySales.reduce((sum, s) => sum + s.total, 0),
      count: daySales.length
    });
  }

  return days;
};

/**
 * Ventas mensuales del año actual
 */
export const getMonthlySales = (year = new Date().getFullYear()) => {
  const sales = getCompletedSales();
  const months = [];

  for (let month = 0; month < 12; month++) {
    const startDate = new Date(year, month, 1);
    const endDate = endOfMonth(startDate);

    const monthSales = sales.filter((s) => {
      const saleDate = new Date(s.createdAt);
      return saleDate >= startDate && saleDate <= endDate;
    });

    months.push({
      month: month + 1,
      label: format(startDate, 'MMM', { locale: es }),
      total: monthSales.reduce((sum, s) => sum + s.total, 0),
      count: monthSales.length
    });
  }

  return months;
};

/**
 * Ventas anuales (últimos 3 años)
 */
export const getYearlySales = () => {
  const sales = getCompletedSales();
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear - 2; year <= currentYear; year++) {
    const yearSales = sales.filter((s) => {
      return new Date(s.createdAt).getFullYear() === year;
    });

    years.push({
      year,
      total: yearSales.reduce((sum, s) => sum + s.total, 0),
      count: yearSales.length
    });
  }

  return years;
};

/**
 * Productos más vendidos
 */
export const getTopProducts = (limit = 10) => {
  const sales = getCompletedSales();
  const productSales = {};

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          productId: item.productId,
          productName: item.productName,
          quantity: 0,
          total: 0
        };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].total += item.subtotal;
    });
  });

  return Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
};

/**
 * Ventas por categoría
 */
export const getSalesByCategory = () => {
  const sales = getCompletedSales();
  const products = Storage.getAll(PRODUCTS_COLLECTION);
  const categories = Storage.getAll(CATEGORIES_COLLECTION);

  // Crear mapa de producto -> categoría
  const productCategory = {};
  products.forEach((p) => {
    productCategory[p.id] = p.categoryId;
  });

  // Crear mapa de categoría -> nombre
  const categoryNames = {};
  categories.forEach((c) => {
    categoryNames[c.id] = c.name;
  });

  // Agrupar ventas por categoría
  const categorySales = {};

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const categoryId = productCategory[item.productId] || 'otros';
      const categoryName = categoryNames[categoryId] || 'Otros';

      if (!categorySales[categoryId]) {
        categorySales[categoryId] = {
          categoryId,
          categoryName,
          quantity: 0,
          total: 0
        };
      }
      categorySales[categoryId].quantity += item.quantity;
      categorySales[categoryId].total += item.subtotal;
    });
  });

  return Object.values(categorySales).sort((a, b) => b.total - a.total);
};

/**
 * Resumen general
 */
export const getDashboardSummary = () => {
  const sales = getCompletedSales();
  const products = Storage.getAll(PRODUCTS_COLLECTION).filter((p) => p.isActive);
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const monthStart = startOfMonth(today);

  // Ventas de hoy
  const todaySales = sales.filter((s) => format(new Date(s.createdAt), 'yyyy-MM-dd') === todayStr);

  // Ventas del mes
  const monthSales = sales.filter((s) => new Date(s.createdAt) >= monthStart);

  // Productos con stock bajo
  const lowStock = products.filter((p) => p.stock <= p.minStock);

  return {
    todaySales: {
      count: todaySales.length,
      total: todaySales.reduce((sum, s) => sum + s.total, 0)
    },
    monthSales: {
      count: monthSales.length,
      total: monthSales.reduce((sum, s) => sum + s.total, 0)
    },
    totalProducts: products.length,
    lowStockCount: lowStock.length,
    totalSales: {
      count: sales.length,
      total: sales.reduce((sum, s) => sum + s.total, 0)
    }
  };
};

/**
 * Inventario valorizado
 */
export const getInventoryValue = () => {
  const products = Storage.getAll(PRODUCTS_COLLECTION).filter((p) => p.isActive);

  return products.reduce((sum, p) => {
    const cost = p.cost || p.price;
    return sum + p.stock * cost;
  }, 0);
};

/**
 * Reporte de inventario
 */
export const getInventoryReport = () => {
  const products = Storage.getAll(PRODUCTS_COLLECTION).filter((p) => p.isActive);
  const categories = Storage.getAll(CATEGORIES_COLLECTION);

  const categoryNames = {};
  categories.forEach((c) => {
    categoryNames[c.id] = c.name;
  });

  return products
    .map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      category: categoryNames[p.categoryId] || 'Sin categoría',
      stock: p.stock,
      stockBySize: p.stockBySize || {},
      minStock: p.minStock,
      price: p.price,
      cost: p.cost || 0,
      value: p.stock * (p.cost || p.price),
      isLowStock: p.stock <= p.minStock
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};
