import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup, Modal, Row, Col, Spinner, Alert, Tab, Tabs } from 'react-bootstrap';
import { FiSearch, FiEye, FiTruck, FiCheck, FiX, FiPackage, FiClock } from 'react-icons/fi';
import { pedidosApi } from '../../services/api/ecommerceApi';
import { formatCurrency } from '../../utils/formatters';
import { confirmAction, toastSuccess, toastError } from '../../utils/alerts';

const estadoConfig = {
  PENDIENTE: { color: 'warning', icon: FiClock, label: 'Pendiente' },
  PAGADO: { color: 'info', icon: FiCheck, label: 'Pagado' },
  CONFIRMADO: { color: 'primary', icon: FiCheck, label: 'Confirmado' },
  PREPARANDO: { color: 'secondary', icon: FiPackage, label: 'Preparando' },
  ENVIADO: { color: 'info', icon: FiTruck, label: 'Enviado' },
  ENTREGADO: { color: 'success', icon: FiCheck, label: 'Entregado' },
  CANCELADO: { color: 'danger', icon: FiX, label: 'Cancelado' }
};

const PedidosList = () => {
  const [pedidos, setPedidos] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1, total: 0 });

  const loadPedidos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (activeTab === 'todos') {
        result = await pedidosApi.getAll(pagination.page, 20);
      } else {
        result = await pedidosApi.getByEstado(activeTab, pagination.page, 20);
      }

      setPedidos(result.content || []);
      setPagination({
        page: result.number || 0,
        totalPages: result.totalPages || 1,
        total: result.totalElements || 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.page]);

  const loadStats = async () => {
    try {
      const data = await pedidosApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadPedidos();
  }, [loadPedidos]);

  const handleVerDetalle = async (pedido) => {
    try {
      const detalle = await pedidosApi.getById(pedido.id);
      setSelectedPedido(detalle);
      setShowModal(true);
    } catch (err) {
      toastError('Error al cargar el pedido');
    }
  };

  const handleCambiarEstado = async (pedidoId, nuevoEstado) => {
    let notificarEmail = false;

    // Si el estado es ENVIADO, preguntar si enviar correo
    if (nuevoEstado === 'ENVIADO') {
      const result = await confirmAction({
        title: '¿Marcar como Enviado?',
        html: `
          <p>El pedido pasará a "${estadoConfig[nuevoEstado].label}"</p>
          <div class="form-check text-start mt-3">
            <input class="form-check-input" type="checkbox" id="notificarEmail" checked>
            <label class="form-check-label" for="notificarEmail">
              <strong>📧 Enviar correo al cliente</strong><br>
              <small class="text-muted">Se notificará que su pedido fue enviado</small>
            </label>
          </div>
        `,
        confirmText: 'Sí, cambiar',
        icon: 'question',
        preConfirm: () => {
          return document.getElementById('notificarEmail')?.checked || false;
        }
      });

      if (!result) return;
      notificarEmail = result === true ? true : result;
    } else {
      const confirmed = await confirmAction({
        title: '¿Cambiar estado?',
        text: `El pedido pasará a "${estadoConfig[nuevoEstado].label}"`,
        confirmText: 'Sí, cambiar',
        icon: 'question'
      });
      if (!confirmed) return;
    }

    try {
      await pedidosApi.actualizarEstado(pedidoId, nuevoEstado, notificarEmail);
      loadPedidos();
      loadStats();
      if (selectedPedido?.id === pedidoId) {
        const updated = await pedidosApi.getById(pedidoId);
        setSelectedPedido(updated);
      }

      if (notificarEmail && nuevoEstado === 'ENVIADO') {
        toastSuccess('Estado actualizado y correo enviado al cliente');
      } else {
        toastSuccess('Estado actualizado');
      }
    } catch (err) {
      toastError(err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPedidos = pedidos.filter(
    (p) =>
      !searchQuery ||
      p.numeroPedido?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clienteNombre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderEstadoBadge = (estado) => {
    const config = estadoConfig[estado] || { color: 'secondary', label: estado };
    return <Badge bg={config.color}>{config.label}</Badge>;
  };

  const getNextEstados = (estadoActual) => {
    const transiciones = {
      PENDIENTE: ['PAGADO', 'CANCELADO'],
      PAGADO: ['CONFIRMADO', 'CANCELADO'],
      CONFIRMADO: ['PREPARANDO', 'CANCELADO'],
      PREPARANDO: ['ENVIADO'],
      ENVIADO: ['ENTREGADO']
    };
    return transiciones[estadoActual] || [];
  };

  return (
    <>
      <Row className="mb-3 g-2">
        <Col md={2}>
          <Card className="text-center bg-warning text-dark h-100">
            <Card.Body className="py-2">
              <h4 className="mb-0">{stats.pendientes || 0}</h4>
              <small>Pendientes</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center bg-info text-white h-100">
            <Card.Body className="py-2">
              <h4 className="mb-0">{stats.pagados || 0}</h4>
              <small>Pagados</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center bg-secondary text-white h-100">
            <Card.Body className="py-2">
              <h4 className="mb-0">{stats.preparando || 0}</h4>
              <small>Preparando</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center bg-primary text-white h-100">
            <Card.Body className="py-2">
              <h4 className="mb-0">{stats.enviados || 0}</h4>
              <small>Enviados</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center bg-success text-white h-100">
            <Card.Body className="py-2">
              <h4 className="mb-0">{stats.entregados || 0}</h4>
              <small>Entregados</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center bg-danger text-white h-100">
            <Card.Body className="py-2">
              <h4 className="mb-0">{stats.cancelados || 0}</h4>
              <small>Cancelados</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Pedidos Online</h5>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Tabs
            activeKey={activeTab}
            onSelect={(tab) => {
              setActiveTab(tab);
              setPagination((p) => ({ ...p, page: 0 }));
            }}
            className="mb-3"
          >
            <Tab eventKey="todos" title="Todos" />
            <Tab
              eventKey="PENDIENTE"
              title={
                <>
                  <FiClock className="me-1" />
                  Pendientes
                </>
              }
            />
            <Tab eventKey="PAGADO" title="Pagados" />
            <Tab eventKey="CONFIRMADO" title="Confirmados" />
            <Tab eventKey="PREPARANDO" title="Preparando" />
            <Tab
              eventKey="ENVIADO"
              title={
                <>
                  <FiTruck className="me-1" />
                  Enviados
                </>
              }
            />
            <Tab
              eventKey="ENTREGADO"
              title={
                <>
                  <FiCheck className="me-1" />
                  Entregados
                </>
              }
            />
            <Tab
              eventKey="CANCELADO"
              title={
                <>
                  <FiX className="me-1" />
                  Cancelados
                </>
              }
            />
          </Tabs>

          <Row className="mb-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por número o cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>

          <Table responsive hover>
            <thead>
              <tr>
                <th>N° Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Método Pago</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <Spinner animation="border" size="sm" /> Cargando...
                  </td>
                </tr>
              ) : filteredPedidos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No hay pedidos
                  </td>
                </tr>
              ) : (
                filteredPedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td>
                      <code>{pedido.numeroPedido}</code>
                    </td>
                    <td>{pedido.clienteNombre || '-'}</td>
                    <td>{formatDate(pedido.fechaPedido)}</td>
                    <td>
                      <strong>{formatCurrency(pedido.total)}</strong>
                    </td>
                    <td>
                      <Badge bg="outline-secondary">{pedido.metodoPago || '-'}</Badge>
                    </td>
                    <td>{renderEstadoBadge(pedido.estado)}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" onClick={() => handleVerDetalle(pedido)}>
                        <FiEye />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* Paginación - siempre que hay más de 1 página */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                Mostrando {filteredPedidos.length} de {pagination.total} pedidos
              </small>
              <div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-1"
                  disabled={pagination.page === 0}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                >
                  ← Anterior
                </Button>
                <span className="mx-2 small">
                  Pág. {pagination.page + 1} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline-primary"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages - 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                >
                  Siguiente →
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Detalle Pedido */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Pedido {selectedPedido?.numeroPedido}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPedido && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <h6>Cliente</h6>
                  <p className="mb-1">
                    {selectedPedido.cliente?.nombres} {selectedPedido.cliente?.apellidos}
                  </p>
                  <p className="mb-1 text-muted">{selectedPedido.cliente?.email}</p>
                  <p className="mb-0 text-muted">{selectedPedido.cliente?.telefono}</p>
                </Col>
                <Col md={6}>
                  <h6>Dirección de Envío</h6>
                  <p className="mb-1">{selectedPedido.direccion?.nombreReceptor}</p>
                  <p className="mb-1">{selectedPedido.direccion?.direccionCompleta}</p>
                  <p className="mb-0 text-muted">
                    {selectedPedido.direccion?.distrito}, {selectedPedido.direccion?.provincia}
                  </p>
                </Col>
              </Row>

              <h6>Productos</h6>
              <Table size="sm" className="mb-3">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Talla</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPedido.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.productoNombre}</td>
                      <td>{item.talla || '-'}</td>
                      <td>{item.cantidad}</td>
                      <td>{formatCurrency(item.precioUnitario)}</td>
                      <td>{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <Row>
                <Col md={6}>
                  <p>
                    <strong>Estado:</strong> {renderEstadoBadge(selectedPedido.estado)}
                  </p>
                  <p>
                    <strong>Método de Pago:</strong> {selectedPedido.metodoPago}
                  </p>
                  {selectedPedido.referenciaPago && (
                    <p>
                      <strong>Ref. Pago:</strong> {selectedPedido.referenciaPago}
                    </p>
                  )}
                  {selectedPedido.tiempoEntregaDias && (
                    <p>
                      <strong>Tiempo de entrega:</strong> {selectedPedido.tiempoEntregaDias} días
                    </p>
                  )}
                </Col>
                <Col md={6} className="text-end">
                  <p>Subtotal: {formatCurrency(selectedPedido.subtotal)}</p>
                  {selectedPedido.descuento > 0 && <p className="text-success">Descuento: -{formatCurrency(selectedPedido.descuento)}</p>}
                  <p>Envío: {formatCurrency(selectedPedido.costoEnvio)}</p>
                  <p>IGV: {formatCurrency(selectedPedido.igv)}</p>
                  <h5>Total: {formatCurrency(selectedPedido.total)}</h5>
                </Col>
              </Row>

              {getNextEstados(selectedPedido.estado).length > 0 && (
                <div className="mt-3 pt-3 border-top">
                  <strong>Cambiar estado:</strong>
                  <div className="mt-2">
                    {getNextEstados(selectedPedido.estado).map((estado) => (
                      <Button
                        key={estado}
                        variant={estado === 'CANCELADO' ? 'outline-danger' : 'outline-primary'}
                        size="sm"
                        className="me-2"
                        onClick={() => handleCambiarEstado(selectedPedido.id, estado)}
                      >
                        {estadoConfig[estado].label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PedidosList;
