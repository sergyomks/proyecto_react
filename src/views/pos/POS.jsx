import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Row, Col, Card, Form, InputGroup, Button, Badge, Modal, Spinner, Alert, Table, Offcanvas } from 'react-bootstrap';
import { FiSearch, FiImage, FiClock, FiCommand } from 'react-icons/fi';
import { productosApi, categoriasApi, ventasApi } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatters';
import { confirmClearCart } from '../../utils/alerts';
import { TALLAS } from '../../config/constant';
import CartSidebar from './CartSidebar';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addItem, getItemQuantity, clearCart } = useCart();

  // Paginación
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1, total: 0 });

  // Historial y atajos
  const [showHistorial, setShowHistorial] = useState(false);
  const [ventasHoy, setVentasHoy] = useState([]);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const searchInputRef = useRef(null);
  const barcodeBuffer = useRef('');
  const barcodeTimeout = useRef(null);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);

      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === 'F2') {
        e.preventDefault();
        setSearchQuery('');
        setSelectedCategory('');
        searchInputRef.current?.focus();
      } else if (e.key === 'F3') {
        e.preventDefault();
        handleShowHistorial();
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleClearCart();
      } else if (e.key === 'F5') {
        e.preventDefault();
        loadProducts();
      } else if (e.key === 'F12') {
        e.preventDefault();
        setShowShortcuts(true);
      } else if (e.key === 'Escape') {
        setShowSizeModal(false);
        setShowShortcuts(false);
      }

      // Detección de código de barras
      if (!isInput && /^[0-9]$/.test(e.key)) {
        handleBarcodeInput(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearCart]);

  const handleClearCart = async () => {
    const confirmed = await confirmClearCart();
    if (confirmed) {
      clearCart();
    }
  };

  const handleBarcodeInput = (char) => {
    clearTimeout(barcodeTimeout.current);
    barcodeBuffer.current += char;

    barcodeTimeout.current = setTimeout(() => {
      const code = barcodeBuffer.current;
      if (code.length >= 4) {
        setSearchQuery(code);
        searchInputRef.current?.focus();
      }
      barcodeBuffer.current = '';
    }, 100);
  };

  const loadCategories = async () => {
    try {
      const cats = await categoriasApi.getAll();
      setCategories(cats);
    } catch (err) {
      console.error('Error cargando categorías:', err);
    }
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const result = await productosApi.search({
        query: searchQuery || undefined,
        categoriaId: selectedCategory || undefined,
        page: pagination.page,
        size: 50
      });
      const productosConStock = (result.content || []).filter((p) => p.stockTotal > 0);
      setProducts(productosConStock);
      setPagination((prev) => ({
        ...prev,
        totalPages: result.totalPages || 1,
        total: result.totalElements || 0
      }));
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, pagination.page]);

  const handleShowHistorial = async () => {
    setShowHistorial(true);
    setLoadingVentas(true);
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const result = await ventasApi.search({
        fechaInicio: hoy,
        fechaFin: hoy,
        size: 50
      });
      setVentasHoy(result.content || []);
    } catch (err) {
      console.error('Error cargando ventas:', err);
    } finally {
      setLoadingVentas(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  const handleProductClick = (product) => {
    if (product.tallas && product.tallas.length > 0) {
      setSelectedProduct(product);
      setShowSizeModal(true);
    } else {
      addToCart(product, null);
    }
  };

  const addToCart = (product, talla, quantity = 1) => {
    const cartItem = {
      id: product.id,
      codigo: product.codigo,
      nombre: product.nombre,
      precio: product.precio,
      imagenUrl: product.imagenUrl,
      talla: talla,
      stockDisponible: talla ? product.tallas?.find((t) => t.talla === talla)?.stock || 0 : product.stockTotal,
      cartId: talla ? `${product.id}-${talla}` : `${product.id}`
    };
    addItem(cartItem, quantity);
    setShowSizeModal(false);
    setSelectedProduct(null);
  };

  const totalVentasHoy = ventasHoy.filter((v) => v.estado === 'COMPLETADA').reduce((sum, v) => sum + (v.total || 0), 0);

  return (
    <>
      {/* Barra de atajos */}
      <Alert variant="light" className="py-2 mb-3 d-flex align-items-center justify-content-between">
        <div className="d-flex gap-3">
          <small>
            <kbd>F1</kbd> Buscar
          </small>
          <small>
            <kbd>F2</kbd> Limpiar
          </small>
          <small>
            <kbd>F3</kbd> Historial
          </small>
          <small>
            <kbd>F4</kbd> Vaciar
          </small>
          <small>
            <kbd>F5</kbd> Refrescar
          </small>
          <small>
            <kbd>F10</kbd> Pagar
          </small>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={() => setShowShortcuts(true)}>
          <FiCommand className="me-1" /> Atajos
        </Button>
      </Alert>

      <Row className="g-3">
        <Col lg={8}>
          <Card className="h-100">
            <Card.Header>
              <Row className="align-items-center">
                <Col md={5}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FiSearch />
                    </InputGroup.Text>
                    <Form.Control
                      ref={searchInputRef}
                      placeholder="Buscar producto o escanear código..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPagination((p) => ({ ...p, page: 0 }));
                      }}
                      autoFocus
                    />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setPagination((p) => ({ ...p, page: 0 }));
                    }}
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3} className="text-end">
                  <Button variant="outline-info" size="sm" onClick={handleShowHistorial}>
                    <FiClock className="me-1" /> Ventas Hoy
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Cargando productos...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-5 text-muted">No se encontraron productos disponibles</div>
              ) : (
                <Row className="g-3">
                  {products.map((product) => {
                    const inCart = getItemQuantity(product.id);
                    const hasTallas = product.tallas && product.tallas.length > 0;
                    return (
                      <Col xs={6} sm={4} md={3} key={product.id}>
                        <Card
                          className="h-100 product-card"
                          style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
                          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                          onClick={() => handleProductClick(product)}
                        >
                          <div
                            className="bg-light d-flex align-items-center justify-content-center"
                            style={{ height: '100px', overflow: 'hidden' }}
                          >
                            {product.imagenUrl ? (
                              <img
                                src={product.imagenUrl}
                                alt={product.nombre}
                                style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }}
                              />
                            ) : (
                              <FiImage size={32} className="text-muted" />
                            )}
                          </div>
                          <Card.Body className="p-2 text-center">
                            <small className="d-block text-truncate fw-bold" title={product.nombre}>
                              {product.nombre}
                            </small>
                            {product.color && (
                              <div className="d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '0.7rem' }}>
                                <div
                                  style={{
                                    width: '14px',
                                    height: '14px',
                                    backgroundColor: product.color,
                                    border: '1px solid #ccc',
                                    borderRadius: '3px'
                                  }}
                                  title={product.color}
                                />
                                <small className="text-muted">{product.color}</small>
                              </div>
                            )}
                            <strong className="text-primary d-block" style={{ fontSize: '0.9rem' }}>
                              {formatCurrency(product.precio)}
                            </strong>

                            {hasTallas ? (
                              <div className="mt-2">
                                <div className="d-flex flex-wrap justify-content-center gap-1">
                                  {TALLAS.map((talla) => {
                                    const tallaData = product.tallas?.find((t) => t.talla === talla);
                                    const stock = tallaData?.stock || 0;
                                    const available = stock > 0;
                                    return (
                                      <Button
                                        key={talla}
                                        size="sm"
                                        variant={available ? 'outline-primary' : 'outline-secondary'}
                                        disabled={!available}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addToCart(product, talla);
                                        }}
                                        style={{ padding: '2px 6px', fontSize: '0.65rem', minWidth: '32px', opacity: available ? 1 : 0.4 }}
                                        title={`${talla}: ${stock} disponibles`}
                                      >
                                        {talla}
                                        <span className="d-block" style={{ fontSize: '0.55rem' }}>
                                          {stock}
                                        </span>
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="mt-1">
                                <Badge bg="secondary" style={{ fontSize: '0.7rem' }}>
                                  Stock: {product.stockTotal}
                                </Badge>
                              </div>
                            )}

                            {inCart > 0 && (
                              <Badge bg="success" className="mt-1" style={{ fontSize: '0.7rem' }}>
                                🛒 {inCart} en carrito
                              </Badge>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Card.Body>

            {/* Paginación - solo si hay más de 50 productos */}
            {pagination.totalPages > 1 && (
              <Card.Footer className="d-flex justify-content-between align-items-center py-2">
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
              </Card.Footer>
            )}
          </Card>
        </Col>
        <Col lg={4}>
          <CartSidebar onSaleComplete={loadProducts} />
        </Col>
      </Row>

      {/* Modal de selección de talla */}
      <Modal show={showSizeModal} onHide={() => setShowSizeModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Seleccionar Talla</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <div className="text-center">
              {selectedProduct.imagenUrl && (
                <img src={selectedProduct.imagenUrl} alt={selectedProduct.nombre} style={{ maxHeight: '150px', marginBottom: '15px' }} />
              )}
              <h5>{selectedProduct.nombre}</h5>
              <p className="text-primary fw-bold">{formatCurrency(selectedProduct.precio)}</p>
              <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
                {TALLAS.map((talla) => {
                  const tallaData = selectedProduct.tallas?.find((t) => t.talla === talla);
                  const stock = tallaData?.stock || 0;
                  const available = stock > 0;
                  return (
                    <Button
                      key={talla}
                      variant={available ? 'outline-primary' : 'outline-secondary'}
                      disabled={!available}
                      onClick={() => addToCart(selectedProduct, talla)}
                      style={{ minWidth: '60px' }}
                    >
                      {talla}
                      <small className="d-block">{stock}</small>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Offcanvas de historial de ventas del día */}
      <Offcanvas show={showHistorial} onHide={() => setShowHistorial(false)} placement="end" style={{ width: '500px' }}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <FiClock className="me-2" />
            Ventas de Hoy
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Alert variant="success" className="py-2 mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <span>Total del día:</span>
              <strong className="fs-5">{formatCurrency(totalVentasHoy)}</strong>
            </div>
            <small className="text-muted">{ventasHoy.filter((v) => v.estado === 'COMPLETADA').length} ventas completadas</small>
          </Alert>

          {loadingVentas ? (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" />
            </div>
          ) : ventasHoy.length === 0 ? (
            <p className="text-muted text-center">No hay ventas registradas hoy</p>
          ) : (
            <Table size="sm" hover>
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Hora</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {ventasHoy.map((venta) => (
                  <tr key={venta.id}>
                    <td>
                      <code>{venta.numero}</code>
                    </td>
                    <td>{new Date(venta.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{venta.items?.length || 0}</td>
                    <td>
                      <strong>{formatCurrency(venta.total)}</strong>
                    </td>
                    <td>
                      <Badge bg={venta.estado === 'COMPLETADA' ? 'success' : venta.estado === 'ANULADA' ? 'danger' : 'warning'}>
                        {venta.estado}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Modal de atajos de teclado */}
      <Modal show={showShortcuts} onHide={() => setShowShortcuts(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiCommand className="me-2" />
            Atajos de Teclado
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table size="sm">
            <tbody>
              <tr>
                <td>
                  <kbd>F1</kbd>
                </td>
                <td>Enfocar búsqueda</td>
              </tr>
              <tr>
                <td>
                  <kbd>F2</kbd>
                </td>
                <td>Limpiar filtros</td>
              </tr>
              <tr>
                <td>
                  <kbd>F3</kbd>
                </td>
                <td>Ver historial del día</td>
              </tr>
              <tr>
                <td>
                  <kbd>F4</kbd>
                </td>
                <td>Vaciar carrito</td>
              </tr>
              <tr>
                <td>
                  <kbd>F5</kbd>
                </td>
                <td>Refrescar productos</td>
              </tr>
              <tr>
                <td>
                  <kbd>F10</kbd>
                </td>
                <td>Procesar venta</td>
              </tr>
              <tr>
                <td>
                  <kbd>F12</kbd>
                </td>
                <td>Mostrar atajos</td>
              </tr>
              <tr>
                <td>
                  <kbd>Esc</kbd>
                </td>
                <td>Cerrar modales</td>
              </tr>
              <tr>
                <td colSpan="2" className="pt-3">
                  <strong>Código de Barras</strong>
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  <small className="text-muted">Escanea directamente - se detecta automáticamente</small>
                </td>
              </tr>
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default POS;
