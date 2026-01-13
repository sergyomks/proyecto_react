import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col, Spinner, Alert, Pagination, InputGroup } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiFilter, FiGift } from 'react-icons/fi';
import { zonasEnvioApi } from '../../services/api/ecommerceApi';
import { formatCurrency } from '../../utils/formatters';
import { confirmDelete, toastSuccess, toastError } from '../../utils/alerts';
import { DEPARTAMENTOS, getProvincias, getDistritos } from '../../data/peruUbigeo';

const ZonasEnvioList = () => {
  // Estados de datos
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de paginación
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  // Estados de filtros
  const [filtroDepartamento, setFiltroDepartamento] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [editingZona, setEditingZona] = useState(null);
  const [saving, setSaving] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    departamento: '',
    provincia: '',
    distrito: '',
    costoEnvio: '',
    tiempoEntregaDias: 3,
    envioGratisDesde: '',
    activo: true
  });

  // Opciones dinámicas para selectores
  const [provinciasDisponibles, setProvinciasDisponibles] = useState([]);
  const [distritosDisponibles, setDistritosDisponibles] = useState([]);

  const loadZonas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await zonasEnvioApi.getAll(page, pageSize, filtroDepartamento, filtroEstado);
      setZonas(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filtroDepartamento, filtroEstado]);

  useEffect(() => {
    loadZonas();
  }, [loadZonas]);

  // Actualizar provincias cuando cambia el departamento en el formulario
  useEffect(() => {
    if (formData.departamento) {
      const provs = getProvincias(formData.departamento);
      setProvinciasDisponibles(provs);
      if (!provs.includes(formData.provincia)) {
        setFormData((prev) => ({ ...prev, provincia: '', distrito: '' }));
      }
    } else {
      setProvinciasDisponibles([]);
      setDistritosDisponibles([]);
    }
  }, [formData.departamento]);

  // Actualizar distritos cuando cambia la provincia en el formulario
  useEffect(() => {
    if (formData.departamento && formData.provincia) {
      const dists = getDistritos(formData.departamento, formData.provincia);
      setDistritosDisponibles(dists);
      if (!dists.includes(formData.distrito)) {
        setFormData((prev) => ({ ...prev, distrito: '' }));
      }
    } else {
      setDistritosDisponibles([]);
    }
  }, [formData.departamento, formData.provincia]);

  const handleCreate = () => {
    setEditingZona(null);
    setFormData({
      departamento: '',
      provincia: '',
      distrito: '',
      costoEnvio: '',
      tiempoEntregaDias: 3,
      envioGratisDesde: '',
      activo: true
    });
    setShowModal(true);
  };

  const handleEdit = (zona) => {
    setEditingZona(zona);
    setFormData({
      departamento: zona.departamento,
      provincia: zona.provincia || '',
      distrito: zona.distrito || '',
      costoEnvio: zona.costoEnvio,
      tiempoEntregaDias: zona.tiempoEntregaDias || 3,
      envioGratisDesde: zona.envioGratisDesde || '',
      activo: zona.activo
    });
    setShowModal(true);
  };

  const handleDelete = async (zona) => {
    const ubicacion = [zona.departamento, zona.provincia, zona.distrito].filter(Boolean).join(' - ');
    const confirmed = await confirmDelete(ubicacion);
    if (!confirmed) return;
    try {
      await zonasEnvioApi.delete(zona.id);
      toastSuccess('Zona eliminada');
      loadZonas();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...formData,
        provincia: formData.provincia || null,
        distrito: formData.distrito || null,
        costoEnvio: parseFloat(formData.costoEnvio),
        tiempoEntregaDias: parseInt(formData.tiempoEntregaDias) || 3,
        envioGratisDesde: formData.envioGratisDesde ? parseFloat(formData.envioGratisDesde) : null
      };

      if (editingZona) {
        await zonasEnvioApi.update(editingZona.id, data);
      } else {
        await zonasEnvioApi.create(data);
      }
      setShowModal(false);
      toastSuccess(editingZona ? 'Zona actualizada' : 'Zona creada');
      loadZonas();
    } catch (err) {
      toastError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFilterChange = () => {
    setPage(0);
  };

  const clearFilters = () => {
    setFiltroDepartamento('');
    setFiltroEstado('');
    setPage(0);
  };

  // Agrupar zonas por departamento para visualización
  const zonasPorDepartamento = zonas.reduce((acc, zona) => {
    const dep = zona.departamento;
    if (!acc[dep]) acc[dep] = [];
    acc[dep].push(zona);
    return acc;
  }, {});

  // Renderizar paginación
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxVisible = 5;
    let startPage = Math.max(0, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }

    items.push(
      <Pagination.First key="first" onClick={() => setPage(0)} disabled={page === 0} />,
      <Pagination.Prev key="prev" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} />
    );

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>
          {i + 1}
        </Pagination.Item>
      );
    }

    items.push(
      <Pagination.Next key="next" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} />,
      <Pagination.Last key="last" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} />
    );

    return <Pagination className="mb-0 justify-content-center">{items}</Pagination>;
  };

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FiMapPin className="me-2" />
            Zonas de Envío
            {totalElements > 0 && (
              <Badge bg="secondary" className="ms-2">
                {totalElements}
              </Badge>
            )}
          </h5>
          <Button variant="primary" size="sm" onClick={handleCreate}>
            <FiPlus className="me-1" /> Nueva Zona
          </Button>
        </Card.Header>

        {/* Filtros */}
        <Card.Body className="border-bottom py-3">
          <Row className="g-2 align-items-end">
            <Col md={4}>
              <Form.Label className="small mb-1">
                <FiFilter className="me-1" /> Departamento
              </Form.Label>
              <Form.Select
                size="sm"
                value={filtroDepartamento}
                onChange={(e) => {
                  setFiltroDepartamento(e.target.value);
                  handleFilterChange();
                }}
              >
                <option value="">Todos los departamentos</option>
                {DEPARTAMENTOS.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="small mb-1">Estado</Form.Label>
              <Form.Select
                size="sm"
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value);
                  handleFilterChange();
                }}
              >
                <option value="">Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                Limpiar
              </Button>
            </Col>
          </Row>
        </Card.Body>

        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" /> Cargando...
            </div>
          ) : zonas.length === 0 ? (
            <div className="text-center text-muted py-4">
              {filtroDepartamento || filtroEstado ? 'No hay zonas que coincidan con los filtros' : 'No hay zonas de envío configuradas'}
            </div>
          ) : (
            <>
              {Object.entries(zonasPorDepartamento).map(([departamento, zonasDepto]) => (
                <Card key={departamento} className="mb-3">
                  <Card.Header className="bg-light py-2">
                    <FiMapPin className="me-2" />
                    <strong>{departamento}</strong>
                    <Badge bg="secondary" className="ms-2">
                      {zonasDepto.length}
                    </Badge>
                  </Card.Header>
                  <Table responsive hover className="mb-0" size="sm">
                    <thead>
                      <tr>
                        <th>Provincia</th>
                        <th>Distrito</th>
                        <th>Costo Envío</th>
                        <th>Envío Gratis</th>
                        <th>Tiempo</th>
                        <th>Estado</th>
                        <th style={{ width: '100px' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zonasDepto.map((zona) => (
                        <tr key={zona.id}>
                          <td>{zona.provincia || <span className="text-muted fst-italic">Todo el depto.</span>}</td>
                          <td>{zona.distrito || <span className="text-muted fst-italic">Toda la prov.</span>}</td>
                          <td>
                            <strong>{formatCurrency(zona.costoEnvio)}</strong>
                          </td>
                          <td>
                            {zona.envioGratisDesde ? (
                              <span className="text-success">
                                <FiGift className="me-1" />
                                Desde {formatCurrency(zona.envioGratisDesde)}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {zona.tiempoEntregaDias} día{zona.tiempoEntregaDias !== 1 ? 's' : ''}
                          </td>
                          <td>
                            <Badge bg={zona.activo ? 'success' : 'secondary'} className="small">
                              {zona.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="outline-primary" size="sm" className="me-1 p-1" onClick={() => handleEdit(zona)}>
                              <FiEdit2 size={14} />
                            </Button>
                            <Button variant="outline-danger" size="sm" className="p-1" onClick={() => handleDelete(zona)}>
                              <FiTrash2 size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card>
              ))}

              {/* Paginación */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <small className="text-muted">
                  Mostrando {zonas.length} de {totalElements} zonas
                </small>
                {renderPagination()}
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Crear/Editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingZona ? 'Editar Zona' : 'Nueva Zona de Envío'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Departamento *</Form.Label>
                  <Form.Select
                    required
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    {DEPARTAMENTOS.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Provincia</Form.Label>
                  <Form.Select
                    value={formData.provincia}
                    onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                    disabled={!formData.departamento}
                  >
                    <option value="">Todo el departamento</option>
                    {provinciasDisponibles.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">Vacío = todo el departamento</Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Distrito</Form.Label>
                  <Form.Select
                    value={formData.distrito}
                    onChange={(e) => setFormData({ ...formData, distrito: e.target.value })}
                    disabled={!formData.provincia || distritosDisponibles.length === 0}
                  >
                    <option value="">Toda la provincia</option>
                    {distritosDisponibles.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">Vacío = toda la provincia</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Costo de Envío *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>S/</InputGroup.Text>
                    <Form.Control
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.costoEnvio}
                      onChange={(e) => setFormData({ ...formData, costoEnvio: e.target.value })}
                      placeholder="10.00"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tiempo de Entrega</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      min="1"
                      value={formData.tiempoEntregaDias}
                      onChange={(e) => setFormData({ ...formData, tiempoEntregaDias: e.target.value })}
                    />
                    <InputGroup.Text>días</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FiGift className="me-1" />
                    Envío Gratis Desde
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>S/</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.envioGratisDesde}
                      onChange={(e) => setFormData({ ...formData, envioGratisDesde: e.target.value })}
                      placeholder="100.00"
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">Dejar vacío si no aplica</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="zona-activa"
                label={formData.activo ? 'Zona activa' : 'Zona inactiva'}
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="sm" className="me-1" /> Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default ZonasEnvioList;
