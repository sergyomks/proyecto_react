import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Form, Button, Alert, Row, Col, Image } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FiUpload, FiX } from 'react-icons/fi';
import { productosApi } from '../../services/api';
import { TALLAS } from '../../config/constant';
import ImageGalleryManager from '../../components/product/ImageGalleryManager';

// Colores predefinidos para acceso rápido
const COLORES_RAPIDOS = [
  { nombre: 'Negro', hex: '#000000' },
  { nombre: 'Blanco', hex: '#FFFFFF' },
  { nombre: 'Gris', hex: '#808080' },
  { nombre: 'Azul', hex: '#0066CC' },
  { nombre: 'Rojo', hex: '#FF0000' },
  { nombre: 'Verde', hex: '#00AA00' },
  { nombre: 'Amarillo', hex: '#FFCC00' },
  { nombre: 'Rosa', hex: '#FF69B4' },
  { nombre: 'Morado', hex: '#800080' },
  { nombre: 'Naranja', hex: '#FF6600' },
  { nombre: 'Beige', hex: '#F5F5DC' },
  { nombre: 'Marrón', hex: '#8B4513' }
];

const productSchema = Yup.object().shape({
  codigo: Yup.string().required('El código es requerido'),
  nombre: Yup.string().min(2).max(200).required('El nombre es requerido'),
  descripcion: Yup.string().max(500),
  categoriaId: Yup.number().required('La categoría es requerida'),
  precio: Yup.number().min(0).required('El precio es requerido'),
  color: Yup.string(),
  stockMinimo: Yup.number().min(0)
});

const ProductForm = ({ product, categories, onSave, onCancel }) => {
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.imagenUrl || null);
  const [imagenes, setImagenes] = useState([]);
  const fileInputRef = useRef(null);
  const isEditing = !!product;

  // Cargar imágenes del producto si está editando
  const loadImagenes = useCallback(async () => {
    if (product?.id) {
      try {
        const imgs = await productosApi.getImagenes(product.id);
        setImagenes(imgs);
      } catch (err) {
        console.error('Error cargando imágenes:', err);
      }
    }
  }, [product?.id]);

  useEffect(() => {
    loadImagenes();
  }, [loadImagenes]);

  // Convertir tallas del backend al formato del form
  const initialTallas = TALLAS.reduce((acc, talla) => {
    const tallaData = product?.tallas?.find((t) => t.talla === talla);
    return { ...acc, [talla]: tallaData?.stock || 0 };
  }, {});

  const initialValues = {
    codigo: product?.codigo || '',
    nombre: product?.nombre || '',
    descripcion: product?.descripcion || '',
    categoriaId: product?.categoriaId || '',
    precio: product?.precio || 0,
    precioOferta: product?.precioOferta || '',
    color: product?.color || '',
    stockMinimo: product?.stockMinimo || 5,
    destacado: product?.destacado || false,
    tallas: initialTallas
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    try {
      // Preparar datos del producto
      const productData = {
        codigo: values.codigo,
        nombre: values.nombre,
        descripcion: values.descripcion,
        categoriaId: parseInt(values.categoriaId),
        precio: parseFloat(values.precio),
        precioOferta: values.precioOferta ? parseFloat(values.precioOferta) : null,
        color: values.color,
        stockMinimo: parseInt(values.stockMinimo) || 5,
        destacado: values.destacado,
        tallas: TALLAS.map((talla) => ({
          talla,
          stock: parseInt(values.tallas[talla]) || 0
        })).filter((t) => t.stock > 0)
      };

      if (isEditing) {
        await productosApi.update(product.id, productData, imageFile);
      } else {
        await productosApi.create(productData, imageFile);
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={productSchema} onSubmit={handleSubmit}>
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
        <Form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

          <Row>
            <Col md={4}>
              <div className="text-center mb-3">
                <div
                  className="border rounded p-3 mb-2"
                  style={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8f9fa',
                    position: 'relative'
                  }}
                >
                  {imagePreview ? (
                    <>
                      <Image src={imagePreview} style={{ maxHeight: '180px', maxWidth: '100%' }} />
                      <Button variant="danger" size="sm" style={{ position: 'absolute', top: 5, right: 5 }} onClick={removeImage}>
                        <FiX />
                      </Button>
                    </>
                  ) : (
                    <div className="text-muted">
                      <FiUpload size={40} />
                      <p className="mb-0 mt-2">Sin imagen</p>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                <Button variant="outline-primary" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <FiUpload className="me-1" /> Subir Imagen
                </Button>
              </div>
            </Col>

            <Col md={8}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Código *</Form.Label>
                    <Form.Control
                      name="codigo"
                      value={values.codigo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.codigo && errors.codigo}
                      placeholder="POL-001"
                    />
                    <Form.Control.Feedback type="invalid">{errors.codigo}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Color</Form.Label>
                    <div className="d-flex align-items-center gap-2">
                      {/* Color picker */}
                      <input
                        type="color"
                        value={values.color || '#000000'}
                        onChange={(e) => setFieldValue('color', e.target.value)}
                        style={{
                          width: '50px',
                          height: '38px',
                          padding: '2px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        title="Seleccionar color personalizado"
                      />
                      {/* Muestra el código hex */}
                      <Form.Control
                        type="text"
                        value={values.color || ''}
                        onChange={(e) => setFieldValue('color', e.target.value)}
                        placeholder="#000000"
                        style={{ width: '100px' }}
                      />
                      {/* Botón limpiar */}
                      {values.color && (
                        <Button variant="outline-secondary" size="sm" onClick={() => setFieldValue('color', '')} title="Quitar color">
                          <FiX />
                        </Button>
                      )}
                    </div>
                    {/* Colores rápidos */}
                    <div className="d-flex flex-wrap gap-1 mt-2">
                      {COLORES_RAPIDOS.map((c) => (
                        <div
                          key={c.nombre}
                          onClick={() => setFieldValue('color', c.hex)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setFieldValue('color', c.hex);
                            }
                          }}
                          title={c.nombre}
                          role="button"
                          tabIndex={0}
                          style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: c.hex,
                            border: values.color === c.hex ? '2px solid #0d6efd' : '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            boxShadow: values.color === c.hex ? '0 0 0 2px rgba(13,110,253,0.25)' : 'none'
                          }}
                        />
                      ))}
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Nombre del Producto *</Form.Label>
                <Form.Control
                  name="nombre"
                  value={values.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.nombre && errors.nombre}
                  placeholder="Polera Estampada Dragon Ball"
                />
                <Form.Control.Feedback type="invalid">{errors.nombre}</Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Categoría *</Form.Label>
                    <Form.Select
                      name="categoriaId"
                      value={values.categoriaId}
                      onChange={handleChange}
                      isInvalid={touched.categoriaId && errors.categoriaId}
                    >
                      <option value="">Seleccionar</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.categoriaId}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Precio Venta *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="precio"
                      value={values.precio}
                      onChange={handleChange}
                      isInvalid={touched.precio && errors.precio}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Precio de Oferta */}
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      🏷️ Precio Oferta
                      {values.precioOferta > 0 && values.precioOferta < values.precio && (
                        <span className="badge bg-danger ms-2">-{Math.round((1 - values.precioOferta / values.precio) * 100)}%</span>
                      )}
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="precioOferta"
                      value={values.precioOferta || ''}
                      onChange={handleChange}
                      placeholder="Dejar vacío si no hay oferta"
                      className={values.precioOferta > 0 ? 'border-danger' : ''}
                    />
                    <Form.Text className="text-muted">
                      {values.precioOferta > 0 && values.precioOferta < values.precio
                        ? `✅ Producto en OFERTA - Ahorro: S/ ${(values.precio - values.precioOferta).toFixed(2)}`
                        : 'Ingresa un precio menor al de venta para activar oferta'}
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={8}>
                  {values.precioOferta > 0 && values.precioOferta < values.precio && (
                    <Alert variant="success" className="mb-3 py-2">
                      <small>
                        <strong>Vista previa en la app:</strong>
                        <br />
                        <span style={{ textDecoration: 'line-through', color: '#999' }}>
                          S/ {parseFloat(values.precio).toFixed(2)}
                        </span>{' '}
                        <span style={{ color: '#dc3545', fontWeight: 'bold' }}>S/ {parseFloat(values.precioOferta).toFixed(2)}</span>
                      </small>
                    </Alert>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              name="descripcion"
              value={values.descripcion}
              onChange={handleChange}
              placeholder="Material, estilo, detalles..."
              style={{ resize: 'vertical', minHeight: '120px' }}
            />
          </Form.Group>

          <div className="border rounded p-3 mb-3">
            <h6 className="mb-3">Stock por Talla</h6>
            <Row>
              {TALLAS.map((talla) => (
                <Col xs={4} sm={2} key={talla}>
                  <Form.Group className="mb-2 text-center">
                    <Form.Label className="fw-bold">{talla}</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={values.tallas[talla] || 0}
                      onChange={(e) => setFieldValue(`tallas.${talla}`, parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                  </Form.Group>
                </Col>
              ))}
            </Row>
            <small className="text-muted">
              Stock Total: {Object.values(values.tallas).reduce((sum, qty) => sum + (qty || 0), 0)} unidades
            </small>
          </div>

          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Stock Mínimo</Form.Label>
                <Form.Control type="number" min="0" name="stockMinimo" value={values.stockMinimo} onChange={handleChange} />
                <Form.Text className="text-muted">Alerta cuando el stock baje de este valor</Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Producto Destacado</Form.Label>
                <Form.Check
                  type="switch"
                  id="destacado-switch"
                  name="destacado"
                  label={values.destacado ? '⭐ Destacado (aparece en Home)' : 'No destacado'}
                  checked={values.destacado}
                  onChange={handleChange}
                  className="mt-2"
                />
                <Form.Text className="text-muted">Los productos destacados aparecen en &apos;Productos Populares&apos; de la app</Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* Galería de imágenes adicionales (solo en modo edición) */}
          {isEditing && (
            <ImageGalleryManager productoId={product.id} imagenes={imagenes} imagenPrincipal={imagePreview} onUpdate={loadImagenes} />
          )}

          {!isEditing && (
            <Alert variant="info" className="mb-3">
              <small>Podrás agregar más imágenes a la galería después de guardar el producto.</small>
            </Alert>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ProductForm;
