import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup, Modal, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiImage } from 'react-icons/fi';
import { productosApi, categoriasApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { confirmDelete, toastSuccess, toastError } from '../../utils/alerts';
import ProductForm from './ProductForm';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1, total: 0 });

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await productosApi.search({
        query: searchQuery || undefined,
        categoriaId: categoryFilter || undefined,
        page: pagination.page,
        size: 15
      });
      setProducts(result.content || []);
      setPagination({
        page: result.page,
        totalPages: result.totalPages,
        total: result.totalElements
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter, pagination.page]);

  const loadCategories = async () => {
    try {
      const cats = await categoriasApi.getAll();
      setCategories(cats);
    } catch (err) {
      console.error('Error cargando categorías:', err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCreate = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = async (product) => {
    try {
      // Cargar producto completo con tallas
      const fullProduct = await productosApi.getById(product.id);
      setEditingProduct(fullProduct);
      setShowModal(true);
    } catch (err) {
      toastError('Error al cargar el producto: ' + err.message);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = await confirmDelete(product.nombre);
    if (!confirmed) return;

    try {
      await productosApi.desactivar(product.id);
      toastSuccess('Producto desactivado correctamente');
      loadProducts();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleSave = () => {
    setShowModal(false);
    setPagination((p) => ({ ...p, page: 0 })); // Volver a primera página para ver el nuevo producto
    loadProducts();
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPagination((p) => ({ ...p, page: 0 }));
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setPagination((p) => ({ ...p, page: 0 }));
  };

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Gestión de Productos</h5>
          <Button variant="primary" size="sm" onClick={handleCreate}>
            <FiPlus className="me-1" /> Nuevo Producto
          </Button>
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
                <Form.Control placeholder="Buscar por nombre o código..." value={searchQuery} onChange={handleSearch} />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={categoryFilter} onChange={handleCategoryChange}>
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <Table responsive hover>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Imagen</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Color</th>
                <th>Precio</th>
                <th>Stock</th>
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
                      {product.imagenUrl ? (
                        <img
                          src={product.imagenUrl}
                          alt={product.nombre}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ) : (
                        <div
                          className="bg-light d-flex align-items-center justify-content-center"
                          style={{ width: '50px', height: '50px', borderRadius: '4px' }}
                        >
                          <FiImage className="text-muted" />
                        </div>
                      )}
                    </td>
                    <td>
                      <code>{product.codigo}</code>
                    </td>
                    <td>
                      {product.nombre}
                      {!product.activo && (
                        <Badge bg="secondary" className="ms-2">
                          Inactivo
                        </Badge>
                      )}
                    </td>
                    <td>{product.categoriaNombre || '-'}</td>
                    <td>
                      {product.color ? (
                        <div className="d-flex align-items-center gap-2">
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              backgroundColor: product.color,
                              border: '1px solid #ccc',
                              borderRadius: '4px'
                            }}
                            title={product.color}
                          />
                          <small className="text-muted">{product.color}</small>
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>{formatCurrency(product.precio)}</td>
                    <td>
                      {product.tallas && product.tallas.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1">
                          {product.tallas.map(
                            (t) =>
                              t.stock > 0 && (
                                <Badge key={t.talla} bg={t.stock <= 2 ? 'warning' : 'secondary'}>
                                  {t.talla}: {t.stock}
                                </Badge>
                              )
                          )}
                        </div>
                      ) : (
                        <Badge bg={product.stockTotal <= (product.stockMinimo || 5) ? 'danger' : 'success'}>
                          {product.stockTotal || 0}
                        </Badge>
                      )}
                    </td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(product)}>
                        <FiEdit2 />
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(product)}>
                        <FiTrash2 />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Mostrando {products.length} de {pagination.total} productos
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

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProductForm product={editingProduct} categories={categories} onSave={handleSave} onCancel={() => setShowModal(false)} />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ProductList;
