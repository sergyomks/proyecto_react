import React, { createContext, useContext, useState, useCallback } from 'react';
import { calculateItemSubtotal, calculateCartTotals, DEFAULT_TAX_RATE } from '../utils/calculations';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [taxRate, setTaxRate] = useState(DEFAULT_TAX_RATE);

  // Calcular totales
  const { subtotal, tax, total } = calculateCartTotals(items, taxRate);

  // Agregar producto al carrito (con soporte para tallas)
  const addItem = useCallback((product, quantity = 1) => {
    setItems((currentItems) => {
      // Usar cartId si existe (para productos con talla), sino usar id
      const itemId = product.cartId || product.id;
      const existingIndex = currentItems.findIndex((item) => (item.product.cartId || item.product.id) === itemId);

      // Obtener precio (soporta tanto 'precio' como 'price')
      const precio = product.precio || product.price || 0;

      if (existingIndex >= 0) {
        // Actualizar cantidad si ya existe
        const updated = [...currentItems];
        const newQuantity = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQuantity,
          subtotal: calculateItemSubtotal(newQuantity, precio)
        };
        return updated;
      }

      // Agregar nuevo item
      return [
        ...currentItems,
        {
          product,
          quantity,
          subtotal: calculateItemSubtotal(quantity, precio)
        }
      ];
    });
  }, []);

  // Actualizar cantidad de un producto (con soporte para tallas)
  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) => {
        const currentItemId = item.product.cartId || item.product.id;
        if (currentItemId === itemId) {
          const precio = item.product.precio || item.product.price || 0;
          return {
            ...item,
            quantity,
            subtotal: calculateItemSubtotal(quantity, precio)
          };
        }
        return item;
      })
    );
  }, []);

  // Eliminar producto del carrito (con soporte para tallas)
  const removeItem = useCallback((itemId) => {
    setItems((currentItems) => currentItems.filter((item) => (item.product.cartId || item.product.id) !== itemId));
  }, []);

  // Limpiar carrito
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Obtener cantidad de un producto en el carrito
  const getItemQuantity = useCallback(
    (productId) => {
      const item = items.find((i) => i.product.id === productId);
      return item ? item.quantity : 0;
    },
    [items]
  );

  // Verificar si el carrito está vacío
  const isEmpty = items.length === 0;

  // Obtener cantidad total de items
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items,
    subtotal,
    tax,
    total,
    taxRate,
    isEmpty,
    itemCount,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemQuantity,
    setTaxRate
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export default CartContext;
