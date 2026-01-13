import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup, Modal, Row, Col, Alert, Spinner, Tab, Tabs } from 'react-bootstrap';
import { FiSearch, FiPlus, FiMinus, FiAlertTriangle, FiPackage, FiRefreshCw } from 'react-icons/fi';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { inventarioApi, productosApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toastSuccess, toastError } from '../../utils/alerts';

const movimientoSchema = Yup.object().shape({
  productoId: Yup.number().required('Producto requerido'),
  talla: Yup.string().required('Talla requerida'),
  cantidad: Yup.number().min(1, 'Mínimo 1').required('Cantidad requerida'),
  tipo: Yup.string().oneOf(['ENTRADA', 'SALIDA']).required('Tipo requerido'),
  motivo: Yup.string().required('Motivo requerido'),
  observaciones: Yup.string()
});

const InventoryList = () => {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('stock');
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [movementType, setMovementType] = useState('ENTRADA');

  // Paginación
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1, total: 0 });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar productos con paginación
      const result = await productosApi.search({
        query: searchQuery || undefined,
        page: pagination.page,
        size: 50
      });
      setProducts(result.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: result.totalPages || 1,
        total: result.totalElements || 0
      }));

      // Intentar cargar stock bajo (puede fallar si no hay permisos)
      try {
        const lowStockData = await inventarioApi.getStockBajo();
        setLowStockProducts(lowStockData || []);
      } catch (lowStockErr) {
        console.warn('No se pudo cargar stock bajo:', lowStockErr);
        setLowStockProducts([]);
      }
    } catch (err) {
      console.error('Error cargando inventario:', err);
      setError(err.response?.data?.message || err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, pagination.page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination((p) => ({ ...p, page: 0 }));
  };

  const handleAdjustStock = (product, type) => {
    setSelectedProduct(product);
    setMovementType(type);
    setShowMovementModal(true);
  };

  const handleSaveMovement = async (values, { setSubmitting }) => {
    try {
      await inventarioApi.registrarMovimiento({
        productoId: values.productoId,
        talla: values.talla,
        cantidad: values.cantidad,
        tipo: values.tipo,
        motivo: values.motivo,
        observaciones: values.observaciones
      });

      setShowMovementModal(false);
      loadData();
      toastSuccess('Movimiento registrado exitosamente');
    } catch (err) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStockBadge = (product) => {
    const stock = product.stockTotal || 0;
    const minStock = product.stockMinimo || 5;

    if (stock === 0) {
      return <Badge bg="danger">Sin Stock</Badge>;
    } else if (stock <= minStock) {
      return <Badge bg="warning">Stock Bajo</Badge>;
    }
    return <Badge bg="success">OK</Badge>;
  };

  return (
    <>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Gestión de Inventario</h5>
          <Button variant="outline-secondary" onClick={loadData}>
            <FiRefreshCw className="me-1" /> Actualizar
          </Button>
        </Card.Header>
      </Card>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        {/* TAB STOCK GENERAL */}
        <Tab eventKey="stock" title="Stock General">
          <Card>
            <Card.Body>
              <InputGroup className="mb-3" style={{ maxWidth: '400px' }}>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control placeholder="Buscar productos..." value={searchQuery} onChange={handleSearchChange} />
              </InputGroup>

              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock por Talla</th>
                    <th>Stock Total</th>
                    <th>Stock Mín.</th>
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
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-4">
                        No se encontraron productos
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <code>{product.codigo}</code>
                        </td>
                        <td>{product.nombre}</td>
                        <td>{product.categoriaNombre || '-'}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {product.tallas && product.tallas.length > 0 ? (
                              product.tallas.map((t) => (
                                <Badge key={t.talla} bg={t.stock === 0 ? 'danger' : t.stock <= 3 ? 'warning' : 'secondary'}>
                                  {t.talla}: {t.stock}
                                </Badge>
                              ))
                            ) : (
                              <Badge bg="secondary">UNICA: {product.stockTotal || 0}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="fw-bold">{product.stockTotal || 0}</td>
                        <td>{product.stockMinimo || 5}</td>
                        <td>{getStockBadge(product)}</td>
                        <td>
                          {hasPermission('inventory') && (
                            <>
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="me-1"
                                onClick={() => handleAdjustStock(product, 'ENTRADA')}
                                title="Entrada de stock"
                              >
                                <FiPlus />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleAdjustStock(product, 'SALIDA')}
                                title="Salida de stock"
                              >
                                <FiMinus />
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              {/* Paginación - solo si hay más de 50 productos */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <small className="text-muted">
                    Mostrando {products.length} de {pagination.total} productos
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
        </Tab>

        {/* TAB STOCK BAJO */}
        <Tab
          eventKey="lowstock"
          title={
            <span>
              <FiAlertTriangle className="me-1" />
              Stock Bajo
              {lowStockProducts.length > 0 && (
                <Badge bg="danger" className="ms-2">
                  {lowStockProducts.length}
                </Badge>
              )}
            </span>
          }
        >
          <Card>
            <Card.Body>
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <FiPackage size={48} className="mb-3" />
                  <p>No hay productos con stock bajo</p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Stock Actual</th>
                      <th>Stock Mínimo</th>
                      <th>Diferencia</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((product) => (
                      <tr key={product.id} className="table-warning">
                        <td>
                          <code>{product.codigo}</code>
                        </td>
                        <td>{product.nombre}</td>
                        <td>{product.categoriaNombre || '-'}</td>
                        <td className="fw-bold text-danger">{product.stockTotal || product.stock}</td>
                        <td>{product.stockMinimo}</td>
                        <td>
                          <Badge bg="danger">-{product.stockMinimo - (product.stockTotal || product.stock)}</Badge>
                        </td>
                        <td>
                          {hasPermission('inventory') && (
                            <Button variant="success" size="sm" onClick={() => handleAdjustStock(product, 'ENTRADA')}>
                              <FiPlus className="me-1" /> Reponer
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Modal de movimiento */}
      <Modal show={showMovementModal} onHide={() => setShowMovementModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{movementType === 'ENTRADA' ? 'Entrada de Stock' : 'Salida de Stock'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <Formik
              initialValues={{
                productoId: selectedProduct.id,
                talla: selectedProduct.tallas?.[0]?.talla || 'UNICA',
                cantidad: 1,
                tipo: movementType,
                motivo: movementType === 'ENTRADA' ? 'COMPRA' : 'AJUSTE',
                observaciones: ''
              }}
              validationSchema={movimientoSchema}
              onSubmit={handleSaveMovement}
            >
              {({ values, errors, touched, handleChange, handleSubmit, isSubmitting }) => (
                <Form onSubmit={handleSubmit}>
                  <div className="mb-3 p-3 bg-light rounded">
                    <strong>{selectedProduct.nombre}</strong>
                    <br />
                    <small className="text-muted">Código: {selectedProduct.codigo}</small>
                  </div>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Talla *</Form.Label>
                        <Form.Select name="talla" value={values.talla} onChange={handleChange} isInvalid={touched.talla && errors.talla}>
                          {selectedProduct.tallas && selectedProduct.tallas.length > 0 ? (
                            selectedProduct.tallas.map((t) => (
                              <option key={t.talla} value={t.talla}>
                                {t.talla} (Stock: {t.stock})
                              </option>
                            ))
                          ) : (
                            <option value="UNICA">UNICA (Stock: {selectedProduct.stockTotal || 0})</option>
                          )}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Cantidad *</Form.Label>
                        <Form.Control
                          type="number"
                          name="cantidad"
                          min="1"
                          value={values.cantidad}
                          onChange={handleChange}
                          isInvalid={touched.cantidad && errors.cantidad}
                        />
                        <Form.Control.Feedback type="invalid">{errors.cantidad}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Motivo *</Form.Label>
                    <Form.Select name="motivo" value={values.motivo} onChange={handleChange} isInvalid={touched.motivo && errors.motivo}>
                      {movementType === 'ENTRADA' ? (
                        <>
                          <option value="COMPRA">Compra</option>
                          <option value="DEVOLUCION">Devolución de cliente</option>
                          <option value="AJUSTE">Ajuste de inventario</option>
                          <option value="TRANSFERENCIA">Transferencia</option>
                        </>
                      ) : (
                        <>
                          <option value="VENTA">Venta</option>
                          <option value="DEVOLUCION_PROVEEDOR">Devolución a proveedor</option>
                          <option value="AJUSTE">Ajuste de inventario</option>
                          <option value="MERMA">Merma / Daño</option>
                          <option value="TRANSFERENCIA">Transferencia</option>
                        </>
                      )}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Observaciones</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="observaciones"
                      value={values.observaciones}
                      onChange={handleChange}
                      placeholder="Notas adicionales..."
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="secondary" onClick={() => setShowMovementModal(false)}>
                      Cancelar
                    </Button>
                    <Button variant={movementType === 'ENTRADA' ? 'success' : 'danger'} type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Guardando...' : 'Registrar'}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default InventoryList;
