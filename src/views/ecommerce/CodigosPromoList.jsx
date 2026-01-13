import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiPercent, FiDollarSign, FiFilter } from 'react-icons/fi';
import { codigosPromoApi } from '../../services/api/ecommerceApi';
import { formatCurrency } from '../../utils/formatters';
import { confirmDeletePermanent, toastSuccess, toastError } from '../../utils/alerts';

const CodigosPromoList = () => {
  const [codigos, setCodigos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCodigo, setEditingCodigo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1, total: 0 });
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    tipoDescuento: 'PORCENTAJE',
    valorDescuento: '',
    montoMinimo: '',
    descuentoMaximo: '',
    limiteUso: '',
    usoPorCliente: 1,
    fechaInicio: '',
    fechaFin: '',
    activo: true
  });

  const loadCodigos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await codigosPromoApi.getAll(pagination.page, 20, filtroEstado);
      setCodigos(data.content || []);
      setPagination({
        page: data.page || 0,
        totalPages: data.totalPages || 1,
        total: data.totalElements || 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filtroEstado]);

  useEffect(() => {
    loadCodigos();
  }, [loadCodigos]);

  const handleFiltroChange = (e) => {
    setFiltroEstado(e.target.value);
    setPagination((p) => ({ ...p, page: 0 }));
  };

  const handleCreate = () => {
    setEditingCodigo(null);
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setFormData({
      codigo: '',
      descripcion: '',
      tipoDescuento: 'PORCENTAJE',
      valorDescuento: '',
      montoMinimo: '',
      descuentoMaximo: '',
      limiteUso: '',
      usoPorCliente: 1,
      fechaInicio: today,
      fechaFin: nextYear,
      activo: true
    });
    setShowModal(true);
  };

  const handleEdit = (codigo) => {
    setEditingCodigo(codigo);
    setFormData({
      codigo: codigo.codigo,
      descripcion: codigo.descripcion || '',
      tipoDescuento: codigo.tipoDescuento,
      valorDescuento: codigo.valorDescuento,
      montoMinimo: codigo.montoMinimo || '',
      descuentoMaximo: codigo.descuentoMaximo || '',
      limiteUso: codigo.limiteUso || '',
      usoPorCliente: codigo.usoPorCliente || 1,
      fechaInicio: codigo.fechaInicio,
      fechaFin: codigo.fechaFin,
      activo: codigo.activo
    });
    setShowModal(true);
  };

  const handleDelete = async (codigo) => {
    const confirmed = await confirmDeletePermanent(codigo.codigo);
    if (!confirmed) return;
    try {
      await codigosPromoApi.delete(codigo.id);
      toastSuccess('Código eliminado');
      loadCodigos();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        valorDescuento: parseFloat(formData.valorDescuento),
        montoMinimo: formData.montoMinimo ? parseFloat(formData.montoMinimo) : 0,
        descuentoMaximo: formData.descuentoMaximo ? parseFloat(formData.descuentoMaximo) : null,
        limiteUso: formData.limiteUso ? parseInt(formData.limiteUso) : null,
        usoPorCliente: parseInt(formData.usoPorCliente) || 1
      };

      if (editingCodigo) {
        await codigosPromoApi.update(editingCodigo.id, data);
      } else {
        await codigosPromoApi.create(data);
      }
      setShowModal(false);
      toastSuccess(editingCodigo ? 'Código actualizado' : 'Código creado');
      loadCodigos();
    } catch (err) {
      toastError(err.message);
    }
  };

  const isVigente = (codigo) => {
    const hoy = new Date().toISOString().split('T')[0];
    return codigo.activo && codigo.fechaInicio <= hoy && codigo.fechaFin >= hoy;
  };

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Códigos Promocionales</h5>
          <Button variant="primary" size="sm" onClick={handleCreate}>
            <FiPlus className="me-1" /> Nuevo Código
          </Button>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Filtros */}
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small">
                  <FiFilter className="me-1" />
                  Filtrar por estado
                </Form.Label>
                <Form.Select size="sm" value={filtroEstado} onChange={handleFiltroChange}>
                  <option value="">Todos</option>
                  <option value="vigentes">Vigentes</option>
                  <option value="activos">Activos</option>
                  <option value="inactivos">Inactivos</option>
                  <option value="expirados">Expirados</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Table responsive hover>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Descuento</th>
                <th>Mínimo</th>
                <th>Usos</th>
                <th>Vigencia</th>
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
              ) : codigos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    No hay códigos promocionales
                  </td>
                </tr>
              ) : (
                codigos.map((codigo) => (
                  <tr key={codigo.id}>
                    <td>
                      <code className="fs-6">{codigo.codigo}</code>
                    </td>
                    <td>{codigo.descripcion || '-'}</td>
                    <td>
                      {codigo.tipoDescuento === 'PORCENTAJE' ? (
                        <Badge bg="info">
                          <FiPercent className="me-1" />
                          {codigo.valorDescuento}%
                        </Badge>
                      ) : (
                        <Badge bg="success">
                          <FiDollarSign className="me-1" />
                          {formatCurrency(codigo.valorDescuento)}
                        </Badge>
                      )}
                      {codigo.descuentoMaximo && (
                        <small className="d-block text-muted">Máx: {formatCurrency(codigo.descuentoMaximo)}</small>
                      )}
                    </td>
                    <td>{codigo.montoMinimo > 0 ? formatCurrency(codigo.montoMinimo) : '-'}</td>
                    <td>
                      {codigo.usosActuales || 0}
                      {codigo.limiteUso && <span className="text-muted">/{codigo.limiteUso}</span>}
                    </td>
                    <td>
                      <small>
                        {codigo.fechaInicio} - {codigo.fechaFin}
                      </small>
                    </td>
                    <td>
                      {isVigente(codigo) ? (
                        <Badge bg="success">Vigente</Badge>
                      ) : codigo.activo ? (
                        <Badge bg="warning">Expirado</Badge>
                      ) : (
                        <Badge bg="secondary">Inactivo</Badge>
                      )}
                    </td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(codigo)}>
                        <FiEdit2 />
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(codigo)}>
                        <FiTrash2 />
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
                Mostrando {codigos.length} de {pagination.total} códigos
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

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingCodigo ? 'Editar Código' : 'Nuevo Código Promocional'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Código *</Form.Label>
                  <Form.Control
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    placeholder="DESCUENTO10"
                    style={{ textTransform: 'uppercase' }}
                  />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción del código"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Descuento *</Form.Label>
                  <Form.Select value={formData.tipoDescuento} onChange={(e) => setFormData({ ...formData, tipoDescuento: e.target.value })}>
                    <option value="PORCENTAJE">Porcentaje (%)</option>
                    <option value="MONTO_FIJO">Monto Fijo (S/)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor *</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    step="0.01"
                    value={formData.valorDescuento}
                    onChange={(e) => setFormData({ ...formData, valorDescuento: e.target.value })}
                    placeholder={formData.tipoDescuento === 'PORCENTAJE' ? '10' : '20.00'}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Descuento Máximo</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.descuentoMaximo}
                    onChange={(e) => setFormData({ ...formData, descuentoMaximo: e.target.value })}
                    placeholder="50.00"
                  />
                  <Form.Text className="text-muted">Solo para porcentaje</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Monto Mínimo de Compra</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.montoMinimo}
                    onChange={(e) => setFormData({ ...formData, montoMinimo: e.target.value })}
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Límite de Usos Total</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.limiteUso}
                    onChange={(e) => setFormData({ ...formData, limiteUso: e.target.value })}
                    placeholder="Sin límite"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Usos por Cliente</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.usoPorCliente}
                    onChange={(e) => setFormData({ ...formData, usoPorCliente: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Inicio *</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Fin *</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Check
                    type="switch"
                    label={formData.activo ? 'Activo' : 'Inactivo'}
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default CodigosPromoList;
