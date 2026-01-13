import React, { useState, useEffect, useRef } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col, Spinner, Alert, Image } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiEye, FiEyeOff, FiUpload, FiX } from 'react-icons/fi';
import { bannersApi } from '../../services/api/ecommerceApi';
import { categoriasApi } from '../../services/api';
import { confirmDelete, toastSuccess, toastError } from '../../utils/alerts';

const BannersList = () => {
  const [banners, setBanners] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    titulo: '',
    linkTipo: 'NINGUNO',
    linkValor: '',
    orden: 0,
    fechaInicio: '',
    fechaFin: '',
    activo: true
  });

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await bannersApi.getAll();
      setBanners(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategorias = async () => {
    try {
      const data = await categoriasApi.getAll();
      setCategorias(data || []);
    } catch (err) {
      console.error('Error cargando categorías:', err);
    }
  };

  useEffect(() => {
    loadBanners();
    loadCategorias();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toastError('La imagen no debe superar 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreate = () => {
    setEditingBanner(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      titulo: '',
      linkTipo: 'NINGUNO',
      linkValor: '',
      orden: banners.length,
      fechaInicio: '',
      fechaFin: '',
      activo: true
    });
    setShowModal(true);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setImageFile(null);
    setImagePreview(banner.imagenUrl || null);
    setFormData({
      titulo: banner.titulo || '',
      linkTipo: banner.linkTipo || 'NINGUNO',
      linkValor: banner.linkValor || '',
      orden: banner.orden || 0,
      fechaInicio: banner.fechaInicio || '',
      fechaFin: banner.fechaFin || '',
      activo: banner.activo
    });
    setShowModal(true);
  };

  const handleDelete = async (banner) => {
    const confirmed = await confirmDelete(banner.titulo || 'Sin título');
    if (!confirmed) return;
    try {
      await bannersApi.delete(banner.id);
      toastSuccess('Banner eliminado');
      loadBanners();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleToggleActivo = async (banner) => {
    try {
      await bannersApi.cambiarEstado(banner.id, !banner.activo);
      toastSuccess(banner.activo ? 'Banner desactivado' : 'Banner activado');
      loadBanners();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que haya imagen
    if (!editingBanner && !imageFile) {
      toastError('Debes subir una imagen para el banner');
      return;
    }

    try {
      setSaving(true);
      const data = {
        titulo: formData.titulo,
        linkTipo: formData.linkTipo,
        linkValor: formData.linkValor,
        orden: formData.orden,
        fechaInicio: formData.fechaInicio || null,
        fechaFin: formData.fechaFin || null,
        activo: formData.activo
      };

      if (editingBanner) {
        await bannersApi.update(editingBanner.id, data, imageFile);
      } else {
        await bannersApi.create(data, imageFile);
      }
      setShowModal(false);
      toastSuccess(editingBanner ? 'Banner actualizado' : 'Banner creado');
      loadBanners();
    } catch (err) {
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">🖼️ Gestión de Banners Promocionales</h5>
          <Button variant="primary" size="sm" onClick={handleCreate}>
            <FiPlus className="me-1" /> Nuevo Banner
          </Button>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Alert variant="info" className="mb-3">
            <small>
              <strong>💡 Tip:</strong> Los banners se muestran en el slider de la app móvil. Tamaño recomendado: <strong>1200x400px</strong>{' '}
              (proporción 3:1). Puedes vincular cada banner a una categoría, producto o URL externa.
            </small>
          </Alert>

          <Table responsive hover>
            <thead>
              <tr>
                <th style={{ width: '150px' }}>Imagen</th>
                <th>Título</th>
                <th>Link</th>
                <th>Orden</th>
                <th>Vigencia</th>
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
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No hay banners. ¡Crea el primero!
                  </td>
                </tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner.id}>
                    <td>
                      {banner.imagenUrl ? (
                        <img
                          src={banner.imagenUrl}
                          alt={banner.titulo}
                          style={{ width: '140px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ) : (
                        <div
                          className="bg-light d-flex align-items-center justify-content-center"
                          style={{ width: '140px', height: '50px', borderRadius: '4px' }}
                        >
                          <FiImage className="text-muted" />
                        </div>
                      )}
                    </td>
                    <td>{banner.titulo || <span className="text-muted">Sin título</span>}</td>
                    <td>
                      <Badge bg={banner.linkTipo === 'NINGUNO' ? 'secondary' : 'primary'}>{banner.linkTipo}</Badge>
                      {banner.linkValor && <small className="d-block text-muted mt-1">{banner.linkValor}</small>}
                    </td>
                    <td>
                      <Badge bg="light" text="dark">
                        {banner.orden}
                      </Badge>
                    </td>
                    <td>
                      {banner.fechaInicio || banner.fechaFin ? (
                        <small>
                          {banner.fechaInicio || '∞'} → {banner.fechaFin || '∞'}
                        </small>
                      ) : (
                        <span className="text-success">✓ Siempre</span>
                      )}
                    </td>
                    <td>
                      <Badge bg={banner.activo ? 'success' : 'secondary'}>{banner.activo ? '✓ Activo' : 'Inactivo'}</Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-1"
                        onClick={() => handleToggleActivo(banner)}
                        title={banner.activo ? 'Desactivar' : 'Activar'}
                      >
                        {banner.activo ? <FiEyeOff /> : <FiEye />}
                      </Button>
                      <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(banner)} title="Editar">
                        <FiEdit2 />
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(banner)} title="Eliminar">
                        <FiTrash2 />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => !saving && setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingBanner ? '✏️ Editar Banner' : '➕ Nuevo Banner'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              {/* Columna de imagen */}
              <Col md={5}>
                <Form.Group className="mb-3">
                  <Form.Label>Imagen del Banner *</Form.Label>
                  <div
                    className="border rounded p-3 text-center"
                    style={{
                      minHeight: '180px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f8f9fa',
                      position: 'relative'
                    }}
                  >
                    {imagePreview ? (
                      <>
                        <Image src={imagePreview} style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain' }} />
                        <Button
                          variant="danger"
                          size="sm"
                          style={{ position: 'absolute', top: 5, right: 5 }}
                          onClick={removeImage}
                          type="button"
                        >
                          <FiX />
                        </Button>
                      </>
                    ) : (
                      <div className="text-muted">
                        <FiUpload size={40} />
                        <p className="mb-0 mt-2">Sin imagen</p>
                        <small>Tamaño: 1200x400px</small>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="mt-2 w-100"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <FiUpload className="me-1" /> {imagePreview ? 'Cambiar Imagen' : 'Subir Imagen'}
                  </Button>
                </Form.Group>
              </Col>

              {/* Columna de datos */}
              <Col md={7}>
                <Form.Group className="mb-3">
                  <Form.Label>Título (opcional)</Form.Label>
                  <Form.Control
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ej: Oferta de Navidad"
                  />
                  <Form.Text className="text-muted">Solo para identificación interna</Form.Text>
                </Form.Group>

                <Row>
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>Al hacer clic ir a:</Form.Label>
                      <Form.Select
                        value={formData.linkTipo}
                        onChange={(e) => setFormData({ ...formData, linkTipo: e.target.value, linkValor: '' })}
                      >
                        <option value="NINGUNO">Ninguno</option>
                        <option value="CATEGORIA">Categoría</option>
                        <option value="PRODUCTO">Producto (ID)</option>
                        <option value="URL">URL Externa</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={7}>
                    {formData.linkTipo === 'CATEGORIA' && (
                      <Form.Group className="mb-3">
                        <Form.Label>Categoría</Form.Label>
                        <Form.Select value={formData.linkValor} onChange={(e) => setFormData({ ...formData, linkValor: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {categorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.nombre}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    )}
                    {formData.linkTipo === 'PRODUCTO' && (
                      <Form.Group className="mb-3">
                        <Form.Label>ID del Producto</Form.Label>
                        <Form.Control
                          type="number"
                          value={formData.linkValor}
                          onChange={(e) => setFormData({ ...formData, linkValor: e.target.value })}
                          placeholder="Ej: 123"
                        />
                      </Form.Group>
                    )}
                    {formData.linkTipo === 'URL' && (
                      <Form.Group className="mb-3">
                        <Form.Label>URL</Form.Label>
                        <Form.Control
                          value={formData.linkValor}
                          onChange={(e) => setFormData({ ...formData, linkValor: e.target.value })}
                          placeholder="https://..."
                        />
                      </Form.Group>
                    )}
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Orden</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formData.orden}
                        onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Desde</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.fechaInicio}
                        onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Hasta</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.fechaFin}
                        onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group>
                  <Form.Check
                    type="switch"
                    id="banner-activo"
                    label={formData.activo ? '✓ Banner activo (visible en la app)' : 'Banner inactivo'}
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  />
                </Form.Group>
              </Col>
            </Row>
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
                'Guardar Banner'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default BannersList;
