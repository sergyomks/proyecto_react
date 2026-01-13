import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Badge, Form, Row, Col, Modal, Spinner, Alert } from 'react-bootstrap';
import { FiEye, FiXCircle, FiFileText } from 'react-icons/fi';
import { ventasApi } from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { confirmAnular, toastSuccess, toastError } from '../../utils/alerts';

const SalesList = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    fechaInicio: '',
    fechaFin: '',
    page: 0
  });
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await ventasApi.search({
        fechaInicio: filters.fechaInicio || undefined,
        fechaFin: filters.fechaFin || undefined,
        page: filters.page,
        size: 15
      });
      setSales(result.content || []);
      setPagination({
        totalPages: result.totalPages,
        total: result.totalElements
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 0 }));
  };

  const handleViewDetail = async (sale) => {
    try {
      const detalle = await ventasApi.getById(sale.id);
      console.log('Detalle de venta:', detalle);
      console.log('Comprobante:', detalle?.comprobante);
      setSelectedSale(detalle);
      setShowDetail(true);
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleCancel = async (sale) => {
    const { confirmed, reason } = await confirmAnular(sale.numero);
    if (!confirmed) return;

    try {
      await ventasApi.anular(sale.id, reason);
      toastSuccess('Venta anulada correctamente');
      loadSales();
    } catch (err) {
      toastError(err.message);
    }
  };

  const getStatusBadge = (estado) => {
    const variants = {
      COMPLETADA: 'success',
      ANULADA: 'danger',
      PENDIENTE: 'warning'
    };
    return <Badge bg={variants[estado] || 'secondary'}>{estado}</Badge>;
  };

  const getPaymentLabel = (metodo) => {
    const labels = {
      EFECTIVO: 'Efectivo',
      TARJETA: 'Tarjeta',
      YAPE: 'Yape',
      PLIN: 'Plin',
      TRANSFERENCIA: 'Transferencia'
    };
    return labels[metodo] || metodo;
  };

  // Función para ver el PDF de Nubefact - abrir en nueva pestaña
  const handleViewNubefactPdf = () => {
    const enlacePdf = selectedSale?.comprobante?.enlacePdf;
    if (enlacePdf) {
      window.open(enlacePdf, '_blank');
    }
  };

  return (
    <>
      <Card>
        <Card.Header>
          <h5 className="mb-0">Historial de Ventas</h5>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Desde</Form.Label>
                <Form.Control type="date" name="fechaInicio" value={filters.fechaInicio} onChange={handleFilterChange} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Hasta</Form.Label>
                <Form.Control type="date" name="fechaFin" value={filters.fechaFin} onChange={handleFilterChange} />
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button variant="outline-secondary" onClick={() => setFilters({ fechaInicio: '', fechaFin: '', page: 0 })}>
                Limpiar filtros
              </Button>
            </Col>
          </Row>

          <Table responsive hover>
            <thead>
              <tr>
                <th>N° Venta</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Items</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <Spinner animation="border" size="sm" /> Cargando...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    No hay ventas registradas
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <code>{sale.numero}</code>
                    </td>
                    <td>{formatDateTime(sale.createdAt)}</td>
                    <td>{sale.clienteNombre || 'Cliente General'}</td>
                    <td>{sale.items?.length || 0}</td>
                    <td>
                      <strong>{formatCurrency(sale.total)}</strong>
                    </td>
                    <td>{getPaymentLabel(sale.metodoPago)}</td>
                    <td>{getStatusBadge(sale.estado)}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => handleViewDetail(sale)}
                        title="Ver detalle"
                      >
                        <FiEye />
                      </Button>
                      {sale.estado === 'COMPLETADA' && (
                        <Button variant="outline-danger" size="sm" onClick={() => handleCancel(sale)} title="Anular">
                          <FiXCircle />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Mostrando {sales.length} de {pagination.total} ventas
              </small>
              <div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="me-1"
                  disabled={filters.page === 0}
                  onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                >
                  Anterior
                </Button>
                <span className="mx-2">
                  Página {filters.page + 1} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={filters.page >= pagination.totalPages - 1}
                  onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalle de Venta {selectedSale?.numero}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSale && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <p>
                    <strong>Fecha:</strong> {formatDateTime(selectedSale.createdAt)}
                  </p>
                  <p>
                    <strong>Cliente:</strong> {selectedSale.clienteNombre || 'Cliente General'}
                  </p>
                  <p>
                    <strong>Vendedor:</strong> {selectedSale.usuarioNombre}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Método de Pago:</strong> {getPaymentLabel(selectedSale.metodoPago)}
                  </p>
                  <p>
                    <strong>Estado:</strong> {getStatusBadge(selectedSale.estado)}
                  </p>
                  {selectedSale.motivoAnulacion && (
                    <p>
                      <strong>Motivo Anulación:</strong> {selectedSale.motivoAnulacion}
                    </p>
                  )}
                </Col>
              </Row>

              <Table bordered size="sm">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Talla</th>
                    <th>Cantidad</th>
                    <th>P. Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.productoNombre}</td>
                      <td>{item.talla || '-'}</td>
                      <td>{item.cantidad}</td>
                      <td>{formatCurrency(item.precioUnitario)}</td>
                      <td>{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4" className="text-end">
                      <strong>Subtotal:</strong>
                    </td>
                    <td>{formatCurrency(selectedSale.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4" className="text-end">
                      <strong>IGV (18%):</strong>
                    </td>
                    <td>{formatCurrency(selectedSale.igv)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4" className="text-end">
                      <strong>Total:</strong>
                    </td>
                    <td>
                      <strong>{formatCurrency(selectedSale.total)}</strong>
                    </td>
                  </tr>
                </tfoot>
              </Table>

              {/* Comprobante Electrónico SUNAT - Formato compacto */}
              {selectedSale.comprobante && (
                <div className="mt-3 p-3 bg-light rounded border">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block">{selectedSale.comprobante.tipo === 'FACTURA' ? 'FACTURA' : 'BOLETA'}</small>
                      <strong className="text-primary">{selectedSale.comprobante.numeroCompleto}</strong>
                      <small className="d-block mt-1">
                        {selectedSale.comprobante.estadoSunat === 'ACEPTADO' && <span className="text-success">✓ Aceptado por SUNAT</span>}
                        {selectedSale.comprobante.estadoSunat === 'PENDIENTE' && <span className="text-warning">⏳ Pendiente</span>}
                        {selectedSale.comprobante.estadoSunat === 'RECHAZADO' && <span className="text-danger">✗ Rechazado</span>}
                      </small>
                    </div>
                    {selectedSale.comprobante.estadoSunat === 'ACEPTADO' && selectedSale.comprobante.enlacePdf && (
                      <Button variant="success" onClick={handleViewNubefactPdf}>
                        <FiFileText className="me-1" /> Ver PDF SUNAT
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetail(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SalesList;
