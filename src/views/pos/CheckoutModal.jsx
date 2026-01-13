import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { FiCheck, FiFileText } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { ventasApi, comprobantesApi } from '../../services/api';
import { PAYMENT_METHODS } from '../../models/Sale';
import { INVOICE_TYPES } from '../../models/Invoice';
import { formatCurrency } from '../../utils/formatters';
import ComprobanteSunat from '../../components/ComprobanteSunat';

const CheckoutModal = ({ show, onHide, onSaleComplete }) => {
  const { items, subtotal, tax, total, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.EFECTIVO);
  const [invoiceType, setInvoiceType] = useState(INVOICE_TYPES.BOLETA);
  const [clientData, setClientData] = useState({
    documentType: 'RUC',
    documentNumber: '',
    name: '',
    address: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setClientData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // Verificar que hay usuario logueado
      if (!user || !user.id) {
        throw new Error('Debes iniciar sesión para realizar ventas');
      }

      // Validación para FACTURA: requiere RUC de 11 dígitos
      if (invoiceType === INVOICE_TYPES.FACTURA) {
        if (!clientData.documentNumber || clientData.documentNumber.length !== 11) {
          throw new Error('Para FACTURA se requiere RUC de 11 dígitos');
        }
        if (!clientData.name || clientData.name.trim() === '') {
          throw new Error('Para FACTURA se requiere la Razón Social del cliente');
        }
      }

      // Preparar items de venta para el backend
      const ventaItems = items.map((item) => {
        const productId = item.product.id;
        const unitPrice = item.product.precio || item.product.price;
        const size = item.product.talla || item.product.selectedSize || null;

        return {
          productoId: productId,
          talla: size,
          cantidad: item.quantity,
          precioUnitario: unitPrice
        };
      });

      // Crear venta en el backend
      const response = await ventasApi.create({
        clienteId: null,
        metodoPago: paymentMethod.toUpperCase(),
        tipoComprobante: invoiceType.toUpperCase(),
        items: ventaItems
      });

      console.log('Respuesta completa:', response);

      // El backend devuelve { success, message, data } - extraer data
      const venta = response.data || response;

      if (response.success === false) {
        throw new Error(response.message || 'Error al crear la venta');
      }

      console.log('Datos de venta:', venta);

      // Generar comprobante
      let comprobante = null;
      try {
        // Para FACTURA siempre enviar RUC como tipo de documento
        const tipoDocParaEnviar = invoiceType === INVOICE_TYPES.FACTURA ? 'RUC' : clientData.documentType || 'DNI';

        const compResponse = await comprobantesApi.generar({
          ventaId: venta.id,
          tipo: invoiceType.toUpperCase(),
          clienteTipoDoc: tipoDocParaEnviar,
          clienteNumeroDoc: clientData.documentNumber || '',
          clienteNombre: clientData.name || 'CLIENTE GENERAL',
          clienteDireccion: clientData.address || ''
        });
        console.log('Respuesta comprobante:', compResponse);
        comprobante = compResponse.data || compResponse;
      } catch (compErr) {
        console.warn('No se pudo generar comprobante:', compErr);
        // Si falla el comprobante, mostrar el error
        throw new Error(compErr.response?.data?.message || compErr.message || 'Error al generar comprobante');
      }

      // Preparar items con nombres de productos para el ticket
      const itemsParaTicket = items.map((item) => ({
        productName: item.product.nombre || item.product.name || 'Producto',
        quantity: item.quantity,
        unitPrice: item.product.precio || item.product.price || 0,
        subtotal: item.subtotal || item.quantity * (item.product.precio || item.product.price || 0),
        talla: item.product.talla || null
      }));

      // Preparar datos para mostrar éxito
      const saleResult = {
        id: venta.id,
        number: venta.numero || `V-${venta.id}`,
        total: venta.total || total,
        subtotal: venta.subtotal || subtotal,
        tax: venta.igv || tax,
        items: itemsParaTicket,
        createdAt: venta.createdAt || new Date().toISOString()
      };

      const invoiceResult = {
        id: comprobante?.id || null, // ID del comprobante para el proxy PDF
        ventaId: venta.id, // ID de la venta como alternativa
        type: invoiceType,
        fullNumber: comprobante?.numeroCompleto || comprobante?.numero || venta.numero || `V-${venta.id}`,
        // Datos SUNAT
        estadoSunat: comprobante?.estadoSunat || null,
        hashCpe: comprobante?.hashCpe || null,
        qrCode: comprobante?.qrCode || null,
        mensajeSunat: comprobante?.mensajeSunat || null,
        enlacePdf: comprobante?.enlacePdf || null,
        ...comprobante
      };

      setSuccess({ sale: saleResult, invoice: invoiceResult });
      clearCart();
    } catch (err) {
      console.error('Error al procesar venta:', err);
      setError(err.response?.data?.message || err.message || 'Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    const hadSuccess = success !== null;
    setSuccess(null);
    setError('');
    onHide();
    // Notificar que se completó una venta para refrescar productos
    if (hadSuccess && onSaleComplete) {
      onSaleComplete();
    }
  };

  // Función para ver el PDF de Nubefact
  const handleViewNubefactPdf = () => {
    const enlacePdf = success?.invoice?.enlacePdf;
    if (enlacePdf) {
      window.open(enlacePdf, '_blank');
    }
  };

  if (success) {
    // Modal de éxito
    return (
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FiCheck className="me-2" />
            ¡Venta Completada!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          <Row>
            {/* Columna izquierda: Comprobante SUNAT */}
            <Col md={6} className="border-end">
              <ComprobanteSunat comprobante={success.invoice} venta={success.sale} />
            </Col>

            {/* Columna derecha: Estado y acciones */}
            <Col md={6}>
              <div className="text-center mb-4">
                <h4 className="text-success mb-1">{formatCurrency(success.sale.total)}</h4>
                <p className="text-muted mb-0">Venta #{success.sale.number}</p>
              </div>

              {/* Mensaje de estado SUNAT */}
              {success.invoice.estadoSunat === 'PENDIENTE' && (
                <Alert variant="warning" className="mb-3">
                  <strong>⏳ Pendiente de envío a SUNAT</strong>
                  <br />
                  <small>El comprobante se enviará automáticamente.</small>
                </Alert>
              )}

              {success.invoice.estadoSunat === 'RECHAZADO' && (
                <Alert variant="danger" className="mb-3">
                  <strong>✗ Rechazado por SUNAT</strong>
                  <br />
                  <small>{success.invoice.mensajeSunat || 'Contacte al administrador.'}</small>
                </Alert>
              )}

              {success.invoice.estadoSunat === 'ACEPTADO' && (
                <Alert variant="success" className="mb-3">
                  <strong>✓ Aceptado por SUNAT</strong>
                  <br />
                  <small>Comprobante enviado correctamente.</small>
                </Alert>
              )}

              {/* Botón PDF SUNAT */}
              {success.invoice.estadoSunat === 'ACEPTADO' && success.invoice.enlacePdf && (
                <div className="d-grid gap-2 mb-4">
                  <Button variant="success" size="lg" onClick={handleViewNubefactPdf}>
                    <FiFileText className="me-2" /> Imprimir Comprobante SUNAT
                  </Button>
                  <small className="text-muted text-center">Se abrirá en nueva pestaña para imprimir</small>
                </div>
              )}

              {/* Si está pendiente o no hay PDF */}
              {(success.invoice.estadoSunat !== 'ACEPTADO' || !success.invoice.enlacePdf) && (
                <Alert variant="info" className="mb-4">
                  <small>El PDF estará disponible cuando sea aceptado por SUNAT</small>
                </Alert>
              )}

              <div className="d-grid">
                <Button variant="primary" size="lg" onClick={handleClose}>
                  Nueva Venta
                </Button>
              </div>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Procesar Venta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Método de Pago</Form.Label>
              <Form.Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value={PAYMENT_METHODS.EFECTIVO}>Efectivo</option>
                <option value={PAYMENT_METHODS.TARJETA}>Tarjeta</option>
                <option value={PAYMENT_METHODS.TRANSFERENCIA}>Transferencia</option>
                <option value={PAYMENT_METHODS.YAPE}>Yape</option>
                <option value={PAYMENT_METHODS.PLIN}>Plin</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Comprobante</Form.Label>
              <Form.Select value={invoiceType} onChange={(e) => setInvoiceType(e.target.value)}>
                <option value={INVOICE_TYPES.BOLETA}>Boleta</option>
                <option value={INVOICE_TYPES.FACTURA}>Factura</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {invoiceType === INVOICE_TYPES.FACTURA && (
          <div className="border rounded p-3 mb-3">
            <h6>Datos del Cliente (Factura requiere RUC)</h6>
            <Alert variant="info" className="py-2 mb-2">
              <small>
                ⚠️ Para emitir <strong>FACTURA</strong>, SUNAT requiere RUC de 11 dígitos
              </small>
            </Alert>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Tipo Doc.</Form.Label>
                  <Form.Select name="documentType" value="RUC" disabled>
                    <option value="RUC">RUC</option>
                  </Form.Select>
                  <Form.Text className="text-muted">Solo RUC para facturas</Form.Text>
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group className="mb-2">
                  <Form.Label>RUC (11 dígitos)</Form.Label>
                  <Form.Control
                    name="documentNumber"
                    value={clientData.documentNumber}
                    onChange={handleClientChange}
                    required
                    maxLength={11}
                    pattern="[0-9]{11}"
                    placeholder="Ej: 20600695771"
                    isInvalid={clientData.documentNumber && clientData.documentNumber.length !== 11}
                  />
                  {clientData.documentNumber && clientData.documentNumber.length !== 11 && (
                    <Form.Control.Feedback type="invalid">El RUC debe tener 11 dígitos</Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-2">
              <Form.Label>Razón Social</Form.Label>
              <Form.Control name="name" value={clientData.name} onChange={handleClientChange} required placeholder="Ej: EMPRESA SAC" />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Dirección (opcional)</Form.Label>
              <Form.Control
                name="address"
                value={clientData.address}
                onChange={handleClientChange}
                placeholder="Ej: Av. Principal 123, Lima"
              />
            </Form.Group>
          </div>
        )}

        <div className="bg-light rounded p-3">
          <div className="d-flex justify-content-between mb-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>IGV (18%):</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="d-flex justify-content-between">
            <strong className="fs-5">Total a Pagar:</strong>
            <strong className="fs-4 text-primary">{formatCurrency(total)}</strong>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        {!user && (
          <Alert variant="warning" className="w-100 mb-2">
            Debes iniciar sesión para realizar ventas
          </Alert>
        )}
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="success" onClick={handleSubmit} disabled={loading || items.length === 0 || !user}>
          {loading ? 'Procesando...' : 'Confirmar Venta'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CheckoutModal;
