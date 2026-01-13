import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup, Modal, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiSearch, FiUser, FiShoppingCart } from 'react-icons/fi';
import { Formik } from 'formik';
import * as Yup from 'yup';
import apiClient from '../../services/api/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { showInfo } from '../../utils/alerts';

const clienteSchema = Yup.object().shape({
  tipoDocumento: Yup.string().required('Tipo de documento requerido'),
  numeroDocumento: Yup.string()
    .required('Número de documento requerido')
    .when('tipoDocumento', {
      is: 'DNI',
      then: (schema) => schema.length(8, 'DNI debe tener 8 dígitos'),
      otherwise: (schema) =>
        schema.when('tipoDocumento', {
          is: 'RUC',
          then: (s) => s.length(11, 'RUC debe tener 11 dígitos')
        })
    }),
  nombre: Yup.string().min(2).max(200).required('Nombre requerido'),
  direccion: Yup.string().max(300),
  telefono: Yup.string().max(20),
  email: Yup.string().email('Email inválido').max(100)
});

/**
 * API de Clientes POS (desde comprobantes/facturas)
 */
const clientesPosApi = {
  getAll: async () => {
    const response = await apiClient.get('/clientes-pos');
    return response.data;
  },
  search: async (query) => {
    const response = await apiClient.get('/clientes-pos/buscar', { params: { query } });
    return response.data;
  },
  getByDocumento: async (numeroDocumento) => {
    const response = await apiClient.get(`/clientes-pos/documento/${numeroDocumento}`);
    return response.data;
  }
};

const ClientList = () => {
  const { hasPermission } = useAuth();
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let result;
      if (searchQuery.trim()) {
        result = await clientesPosApi.search(searchQuery);
      } else {
        result = await clientesPosApi.getAll();
      }
      setClients(result || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadClients();
    }, 300);
    return () => clearTimeout(debounce);
  }, [loadClients]);

  const handleCreate = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleSave = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Los clientes POS se crean desde comprobantes, este modal es solo informativo
      showInfo('Información', 'Los clientes POS se crean automáticamente al emitir comprobantes');
      setShowModal(false);
    } catch (err) {
      if (err.message.includes('documento')) {
        setFieldError('numeroDocumento', err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">
              <FiShoppingCart className="me-2" />
              Clientes POS
            </h5>
            <small className="text-muted">Clientes registrados desde comprobantes/facturas</small>
          </div>
          {hasPermission('clients') && (
            <Button variant="primary" size="sm" onClick={handleCreate}>
              <FiPlus className="me-1" /> Nuevo Cliente
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <InputGroup className="mb-3" style={{ maxWidth: '400px' }}>
            <InputGroup.Text>
              <FiSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Buscar por nombre o documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <Table responsive hover>
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre / Razón Social</th>
                <th>Dirección</th>
                <th>Total Compras</th>
                <th>Última Compra</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <Spinner animation="border" size="sm" /> Cargando...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No se encontraron clientes
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.numeroDocumento}>
                    <td>
                      <Badge bg="secondary" className="me-1">
                        {client.tipoDocumento || 'DNI'}
                      </Badge>
                      <code>{client.numeroDocumento}</code>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FiUser className="me-2 text-muted" />
                        {client.nombre || '-'}
                      </div>
                    </td>
                    <td>
                      <small>{client.direccion || '-'}</small>
                    </td>
                    <td>
                      <Badge bg="info">{client.totalCompras || 0}</Badge>
                    </td>
                    <td>
                      <small>{formatDate(client.ultimaCompra)}</small>
                    </td>
                    <td>
                      {hasPermission('clients') && (
                        <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(client)}>
                          <FiEdit2 />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <div className="text-muted mt-2">
            <small>Total: {clients.length} clientes</small>
          </div>
        </Card.Body>
      </Card>

      {/* Modal de cliente */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingClient ? 'Ver Cliente POS' : 'Nuevo Cliente'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{
              tipoDocumento: editingClient?.tipoDocumento || 'DNI',
              numeroDocumento: editingClient?.numeroDocumento || '',
              nombre: editingClient?.nombre || '',
              direccion: editingClient?.direccion || '',
              telefono: editingClient?.telefono || '',
              email: editingClient?.email || ''
            }}
            validationSchema={clienteSchema}
            onSubmit={handleSave}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo Documento</Form.Label>
                      <Form.Select
                        name="tipoDocumento"
                        value={values.tipoDocumento}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.tipoDocumento && errors.tipoDocumento}
                        disabled={!!editingClient}
                      >
                        <option value="DNI">DNI</option>
                        <option value="RUC">RUC</option>
                        <option value="CE">Carnet Extranjería</option>
                        <option value="PASAPORTE">Pasaporte</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Número Documento</Form.Label>
                      <Form.Control
                        name="numeroDocumento"
                        value={values.numeroDocumento}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.numeroDocumento && errors.numeroDocumento}
                        placeholder={values.tipoDocumento === 'DNI' ? '12345678' : '20123456789'}
                        disabled={!!editingClient}
                      />
                      <Form.Control.Feedback type="invalid">{errors.numeroDocumento}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Nombre / Razón Social</Form.Label>
                  <Form.Control
                    name="nombre"
                    value={values.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.nombre && errors.nombre}
                    placeholder="Nombre completo o razón social"
                    disabled={!!editingClient}
                  />
                  <Form.Control.Feedback type="invalid">{errors.nombre}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    name="direccion"
                    value={values.direccion}
                    onChange={handleChange}
                    placeholder="Av. Principal 123, Lima"
                    disabled={!!editingClient}
                  />
                </Form.Group>

                {editingClient && (
                  <Alert variant="info">
                    <small>
                      Este cliente fue registrado automáticamente desde un comprobante. Total de compras:{' '}
                      <strong>{editingClient.totalCompras || 0}</strong>
                    </small>
                  </Alert>
                )}

                <div className="d-flex justify-content-end gap-2">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cerrar
                  </Button>
                  {!editingClient && (
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </Button>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ClientList;
