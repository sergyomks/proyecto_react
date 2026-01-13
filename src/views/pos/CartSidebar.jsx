import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Button, Form, InputGroup } from 'react-bootstrap';
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatters';
import CheckoutModal from './CheckoutModal';

const CartSidebar = ({ onSaleComplete }) => {
  const { items, subtotal, tax, total, isEmpty, updateQuantity, removeItem, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  // Atajo F10 para procesar venta
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F10' && !isEmpty) {
        e.preventDefault();
        setShowCheckout(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEmpty]);

  const handleQuantityChange = (productId, currentQty, delta, stockDisponible) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      removeItem(productId);
    } else if (newQty <= stockDisponible) {
      updateQuantity(productId, newQty);
    }
  };

  const handleManualQuantityChange = (productId, value, stockDisponible) => {
    const newQty = parseInt(value) || 0;
    if (newQty <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, Math.min(newQty, stockDisponible));
    }
  };

  return (
    <>
      <Card className="h-100">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <FiShoppingCart className="me-2" />
            Carrito de Compras
          </h6>
          {!isEmpty && (
            <Button variant="outline-danger" size="sm" onClick={clearCart}>
              Vaciar
            </Button>
          )}
        </Card.Header>
        <Card.Body className="p-0" style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
          {isEmpty ? (
            <div className="text-center py-5 text-muted">
              <FiShoppingCart size={40} className="mb-2" />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {items.map((item) => {
                const itemId = item.product.cartId || item.product.id;
                return (
                  <ListGroup.Item key={itemId} className="py-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <small className="d-block text-truncate fw-semibold" style={{ maxWidth: '150px' }}>
                          {item.product.nombre || item.product.name}
                        </small>
                        {item.product.talla && (
                          <small className="d-block">
                            <span className="badge bg-info">Talla: {item.product.talla}</span>
                          </small>
                        )}
                        <small className="text-muted d-block">
                          {formatCurrency(item.product.precio || item.product.price)} x {item.quantity}
                        </small>
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                          Stock: {item.product.stockDisponible}
                        </small>
                      </div>
                      <strong>{formatCurrency(item.subtotal)}</strong>
                    </div>
                    <div className="d-flex align-items-center mt-2">
                      <InputGroup size="sm" style={{ width: '120px' }}>
                        <Button
                          variant="outline-secondary"
                          onClick={() => handleQuantityChange(itemId, item.quantity, -1, item.product.stockDisponible)}
                        >
                          <FiMinus />
                        </Button>
                        <Form.Control
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleManualQuantityChange(itemId, e.target.value, item.product.stockDisponible)}
                          className="text-center"
                          min="1"
                          max={item.product.stockDisponible}
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => handleQuantityChange(itemId, item.quantity, 1, item.product.stockDisponible)}
                          disabled={item.quantity >= item.product.stockDisponible}
                          title={item.quantity >= item.product.stockDisponible ? 'Stock máximo alcanzado' : ''}
                        >
                          <FiPlus />
                        </Button>
                      </InputGroup>
                      <Button variant="link" className="text-danger ms-2 p-0" onClick={() => removeItem(itemId)}>
                        <FiTrash2 />
                      </Button>
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          )}
        </Card.Body>

        <Card.Footer>
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span>IGV (18%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong>Total:</strong>
              <strong className="text-primary fs-5">{formatCurrency(total)}</strong>
            </div>
          </div>
          <Button variant="success" className="w-100" disabled={isEmpty} onClick={() => setShowCheckout(true)}>
            Procesar Venta
          </Button>
        </Card.Footer>
      </Card>

      <CheckoutModal show={showCheckout} onHide={() => setShowCheckout(false)} onSaleComplete={onSaleComplete} />
    </>
  );
};

export default CartSidebar;
