import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup, Modal, Row, Col, Spinner, Alert, Tab, Tabs } from 'react-bootstrap';
import { FiSearch, FiEye, FiUser, FiMapPin, FiShoppingBag, FiToggleLeft, FiToggleRight, FiPhone, FiMail, FiCalendar } from 'react-icons/fi';
import { clientesAppApi } from '../../services/api/ecommerceApi';
import { formatCurrency } from '../../utils/formatters';
import { confirmAction, toastSuccess, toastError } from '../../utils/alerts';

const ClientesAppList = () => {
  const [clientes, setClientes] = useState([]);
  const [stats, setStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [clienteDirecciones, setClienteDirecciones] = useState([]);
  const [clientePedidos, setClientePedidos] = useState([]);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1, total: 0 });

  const loadClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (searchQuery.trim()) {
        result = await clientesAppApi.search(searchQuery);
        setClientes(Array.isArray(result) ? result : result.content || []);
        setPagination({ page: 0, totalPages: 1, total: result.length || 0 });
      } else {
        result = await clientesAppApi.getAll(pagination.page, 20);
        setClientes(result.content || []);
        setPagination({
          page: result.number || 0,
          totalPages: result.totalPages || 1,
          total: result.totalElements || 0
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, pagination.page]);

  const loadStats = async () => {
    try {
      const data = await clientesAppApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadClientes();
    }, 300);
    return () => clearTimeout(debounce);
  }, [loadClientes]);

  const handleVerDetalle = async (cliente) => {
    try {
      setLoadingDetail(true);
      setSelectedCliente(cliente);
      setActiveTab('info');
      setShowModal(true);

      // Cargar direcciones y pedidos
      const [direcciones, pedidos] = await Promise.all([clientesAppApi.getDirecciones(cliente.id), clientesAppApi.getPedidos(cliente.id)]);

      setClienteDirecciones(direcciones || []);
      setClientePedidos(pedidos || []);
    } catch (err) {
      console.error('Error cargando detalles:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleActivo = async (cliente) => {
    const nuevoEstado = !cliente.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    const confirmed = await confirmAction({
      title: `¿${nuevoEstado ? 'Activar' : 'Desactivar'} cuenta?`,
      text: `Se va a ${accion} la cuenta de "${cliente.nombres} ${cliente.apellidos}"`,
      confirmText: `Sí, ${accion}`,
      icon: nuevoEstado ? 'question' : 'warning',
      confirmButtonColor: nuevoEstado ? '#28a745' : '#ffc107'
    });
    if (!confirmed) return;

    try {
      await clientesAppApi.toggleActivo(cliente.id, nuevoEstado);
      toastSuccess(`Cuenta ${nuevoEstado ? 'activada' : 'desactivada'}`);
      loadClientes();
      loadStats();

      if (selectedCliente?.id === cliente.id) {
        setSelectedCliente({ ...selectedCliente, activo: nuevoEstado });
      }
    } catch (err) {
      toastError(err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Stats Cards */}
      <Row className="mb-3">
        <Col md={3}>
          <Card className="text-center bg-primary text-white">
            <Card.Body>
              <h3>{stats.total || 0}</h3>
              <small>Total Clientes</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center bg-success text-white">
            <Card.Body>
              <h3>{stats.activos || 0}</h3>
              <small>Activos</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center bg-info text-white">
            <Card.Body>
              <h3>{stats.nuevosEsteMes || 0}</h3>
              <small>Nuevos este mes</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center bg-warning text-dark">
            <Card.Body>
              <h3>{stats.conPedidos || 0}</h3>
              <small>Con pedidos</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <FiUser className="me-2" />
            Clientes de la App
          </h5>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Row className="mb-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nombre, email, teléfono..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPagination((p) => ({ ...p, page: 0 }));
                  }}
                />
              </InputGroup>
            </Col>
          </Row>

          <Table responsive hover>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Registro</th>
                <th>Pedidos</th>
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
              ) : clientes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No hay clientes registrados
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle p-2 me-2">
                          <FiUser />
                        </div>
                        <div>
                          <strong>
                            {cliente.nombres} {cliente.apellidos}
                          </strong>
                          {cliente.dni && <small className="d-block text-muted">DNI: {cliente.dni}</small>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <small>
                        <FiMail className="me-1" />
                        {cliente.email}
                      </small>
                    </td>
                    <td>
                      {cliente.telefono ? (
                        <small>
                          <FiPhone className="me-1" />
                          {cliente.telefono}
                        </small>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <small>
                        <FiCalendar className="me-1" />
                        {formatDate(cliente.fechaRegistro)}
                      </small>
                    </td>
                    <td>
                      <Badge bg="info">{cliente.totalPedidos || 0}</Badge>
                    </td>
                    <td>
                      <Badge bg={cliente.activo ? 'success' : 'secondary'}>{cliente.activo ? 'Activo' : 'Inactivo'}</Badge>
                    </td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleVerDetalle(cliente)}>
                        <FiEye />
                      </Button>
                      <Button
                        variant={cliente.activo ? 'outline-warning' : 'outline-success'}
                        size="sm"
                        onClick={() => handleToggleActivo(cliente)}
                        title={cliente.activo ? 'Desactivar' : 'Activar'}
                      >
                        {cliente.activo ? <FiToggleRight /> : <FiToggleLeft />}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                Mostrando {clientes.length} de {pagination.total} clientes
              </small>
              <div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="me-1"
                  disabled={pagination.page === 0}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                >
                  Anterior
                </Button>
                <span className="mx-2">
                  Página {pagination.page + 1} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages - 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Detalle Cliente */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FiUser className="me-2" />
            {selectedCliente?.nombres} {selectedCliente?.apellidos}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCliente && (
            <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
              <Tab
                eventKey="info"
                title={
                  <>
                    <FiUser className="me-1" />
                    Información
                  </>
                }
              >
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>Nombres:</strong> {selectedCliente.nombres}
                    </p>
                    <p>
                      <strong>Apellidos:</strong> {selectedCliente.apellidos}
                    </p>
                    <p>
                      <strong>DNI:</strong> {selectedCliente.dni || '-'}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedCliente.email}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Teléfono:</strong> {selectedCliente.telefono || '-'}
                    </p>
                    <p>
                      <strong>Fecha Registro:</strong> {formatDateTime(selectedCliente.fechaRegistro)}
                    </p>
                    <p>
                      <strong>Último Acceso:</strong> {formatDateTime(selectedCliente.ultimoAcceso)}
                    </p>
                    <p>
                      <strong>Estado:</strong>{' '}
                      <Badge bg={selectedCliente.activo ? 'success' : 'secondary'}>{selectedCliente.activo ? 'Activo' : 'Inactivo'}</Badge>
                    </p>
                  </Col>
                </Row>
                <div className="mt-3">
                  <Button variant={selectedCliente.activo ? 'warning' : 'success'} onClick={() => handleToggleActivo(selectedCliente)}>
                    {selectedCliente.activo ? (
                      <>
                        <FiToggleRight className="me-1" /> Desactivar Cuenta
                      </>
                    ) : (
                      <>
                        <FiToggleLeft className="me-1" /> Activar Cuenta
                      </>
                    )}
                  </Button>
                </div>
              </Tab>

              <Tab
                eventKey="direcciones"
                title={
                  <>
                    <FiMapPin className="me-1" />
                    Direcciones ({clienteDirecciones.length})
                  </>
                }
              >
                {loadingDetail ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : clienteDirecciones.length === 0 ? (
                  <p className="text-muted text-center py-4">No tiene direcciones registradas</p>
                ) : (
                  <div className="list-group">
                    {clienteDirecciones.map((dir, idx) => (
                      <div key={idx} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">
                              {dir.etiqueta || 'Dirección'}
                              {dir.predeterminada && (
                                <Badge bg="primary" className="ms-2">
                                  Principal
                                </Badge>
                              )}
                            </h6>
                            <p className="mb-1">{dir.nombreReceptor}</p>
                            <p className="mb-1 text-muted">{dir.direccionCompleta}</p>
                            <small className="text-muted">
                              {dir.distrito}, {dir.provincia}, {dir.departamento}
                            </small>
                            {dir.referencia && (
                              <p className="mb-0 mt-1">
                                <small>Ref: {dir.referencia}</small>
                              </p>
                            )}
                            {dir.telefonoContacto && (
                              <p className="mb-0">
                                <small>
                                  <FiPhone className="me-1" />
                                  {dir.telefonoContacto}
                                </small>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Tab>

              <Tab
                eventKey="pedidos"
                title={
                  <>
                    <FiShoppingBag className="me-1" />
                    Pedidos ({clientePedidos.length})
                  </>
                }
              >
                {loadingDetail ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : clientePedidos.length === 0 ? (
                  <p className="text-muted text-center py-4">No tiene pedidos realizados</p>
                ) : (
                  <Table size="sm" hover>
                    <thead>
                      <tr>
                        <th>N° Pedido</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientePedidos.map((pedido) => (
                        <tr key={pedido.id}>
                          <td>
                            <code>{pedido.numeroPedido}</code>
                          </td>
                          <td>{formatDate(pedido.fechaPedido)}</td>
                          <td>
                            <strong>{formatCurrency(pedido.total)}</strong>
                          </td>
                          <td>
                            <Badge
                              bg={
                                pedido.estado === 'ENTREGADO'
                                  ? 'success'
                                  : pedido.estado === 'CANCELADO'
                                    ? 'danger'
                                    : pedido.estado === 'ENVIADO'
                                      ? 'info'
                                      : pedido.estado === 'PENDIENTE'
                                        ? 'warning'
                                        : 'secondary'
                              }
                            >
                              {pedido.estado}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ClientesAppList;
