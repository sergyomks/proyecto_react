import React, { useState, useCallback } from 'react';
import { Card, Button, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { FiUpload, FiTrash2, FiStar, FiImage } from 'react-icons/fi';
import { productosApi } from '../../services/api';
import { confirmAction, toastSuccess, toastError } from '../../utils/alerts';

const ImageGalleryManager = ({ productoId, imagenes = [], imagenPrincipal, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = useCallback(
    async (files) => {
      if (!productoId) {
        setError('Guarda el producto primero antes de agregar imágenes');
        return;
      }

      setUploading(true);
      setError('');

      try {
        for (const file of files) {
          if (!file.type.startsWith('image/')) {
            continue;
          }
          await productosApi.agregarImagen(productoId, file, false);
        }
        if (onUpdate) onUpdate();
      } catch (err) {
        setError(err.message || 'Error al subir imagen');
      } finally {
        setUploading(false);
      }
    },
    [productoId, onUpdate]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      handleFileSelect(files);
    },
    [handleFileSelect]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFileSelect(files);
    e.target.value = '';
  };

  const handleDelete = async (imagenId) => {
    const confirmed = await confirmAction({
      title: '¿Eliminar imagen?',
      text: 'Esta acción no se puede deshacer',
      confirmText: 'Sí, eliminar',
      icon: 'warning',
      confirmButtonColor: '#dc3545'
    });
    if (!confirmed) return;

    try {
      await productosApi.eliminarImagen(imagenId);
      toastSuccess('Imagen eliminada');
      if (onUpdate) onUpdate();
    } catch (err) {
      toastError(err.message || 'Error al eliminar imagen');
    }
  };

  const handleSetPrincipal = async (imagenId) => {
    try {
      await productosApi.establecerImagenPrincipal(imagenId);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.message || 'Error al establecer imagen principal');
    }
  };

  // Combinar imagen principal con galería
  const todasLasImagenes = [];

  // Agregar imagen principal si existe y no está en la galería
  if (imagenPrincipal) {
    const existeEnGaleria = imagenes.some((img) => img.imagenUrl === imagenPrincipal);
    if (!existeEnGaleria) {
      todasLasImagenes.push({
        id: 'principal',
        imagenUrl: imagenPrincipal,
        esPrincipal: true,
        orden: 0
      });
    }
  }

  // Agregar imágenes de la galería
  todasLasImagenes.push(...imagenes);

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>
          <FiImage className="me-2" />
          Galería de Imágenes
        </span>
        <Badge bg="secondary">{todasLasImagenes.length} imagen(es)</Badge>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Zona de drop */}
        <div
          className={`border-2 border-dashed rounded p-4 text-center mb-3 ${dragOver ? 'border-primary bg-light' : 'border-secondary'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => document.getElementById('image-upload-input').click()}
        >
          <input id="image-upload-input" type="file" accept="image/*" multiple onChange={handleInputChange} style={{ display: 'none' }} />
          {uploading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Subiendo...
            </>
          ) : (
            <>
              <FiUpload size={24} className="mb-2 text-muted" />
              <p className="mb-0 text-muted small">Arrastra imágenes aquí o haz clic para seleccionar</p>
            </>
          )}
        </div>

        {/* Grid de imágenes */}
        {todasLasImagenes.length > 0 ? (
          <Row className="g-2">
            {todasLasImagenes.map((imagen) => (
              <Col xs={6} sm={4} md={3} key={imagen.id}>
                <div className="position-relative border rounded overflow-hidden" style={{ paddingBottom: '100%' }}>
                  <img
                    src={imagen.imagenUrl}
                    alt="Producto"
                    className="position-absolute w-100 h-100"
                    style={{ objectFit: 'cover', top: 0, left: 0 }}
                  />

                  {/* Badge de principal */}
                  {imagen.esPrincipal && (
                    <Badge bg="warning" className="position-absolute" style={{ top: 5, left: 5 }}>
                      <FiStar /> Principal
                    </Badge>
                  )}

                  {/* Botones de acción */}
                  {imagen.id !== 'principal' && (
                    <div className="position-absolute d-flex gap-1" style={{ top: 5, right: 5 }}>
                      {!imagen.esPrincipal && (
                        <Button size="sm" variant="warning" onClick={() => handleSetPrincipal(imagen.id)} title="Establecer como principal">
                          <FiStar size={12} />
                        </Button>
                      )}
                      <Button size="sm" variant="danger" onClick={() => handleDelete(imagen.id)} title="Eliminar">
                        <FiTrash2 size={12} />
                      </Button>
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center text-muted py-4">
            <FiImage size={40} className="mb-2" />
            <p className="mb-0">No hay imágenes</p>
          </div>
        )}

        <small className="text-muted d-block mt-2">
          La imagen principal se muestra en el punto de venta. Las demás se mostrarán en el ecommerce.
        </small>
      </Card.Body>
    </Card>
  );
};

export default ImageGalleryManager;
