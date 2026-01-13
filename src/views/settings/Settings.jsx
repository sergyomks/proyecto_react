import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { FiSave, FiSettings, FiFileText } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { configuracionApi } from '../../services/api';

const Settings = () => {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('empresa');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const [config, setConfig] = useState({
    // Empresa
    nombreEmpresa: '',
    nombreComercial: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: '',
    whatsapp: '',
    // Facturación
    igvRate: 18,
    serieBoleta: 'B001',
    serieFactura: 'F001',
    serieNotaCreditoBoleta: 'BC01',
    serieNotaCreditoFactura: 'FC01'
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await configuracionApi.get();
      setConfig({
        nombreEmpresa: data.nombreEmpresa || '',
        nombreComercial: data.nombreComercial || '',
        ruc: data.ruc || '',
        direccion: data.direccion || '',
        telefono: data.telefono || '',
        email: data.email || '',
        whatsapp: data.whatsapp || '',
        igvRate: data.igvRate || 18,
        serieBoleta: data.serieBoleta || 'B001',
        serieFactura: data.serieFactura || 'F001',
        serieNotaCreditoBoleta: data.serieNotaCreditoBoleta || 'BC01',
        serieNotaCreditoFactura: data.serieNotaCreditoFactura || 'FC01'
      });
    } catch (err) {
      console.error('Error cargando configuración:', err);
      setMessage({ type: 'warning', text: 'No se pudo cargar la configuración.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await configuracionApi.save(config);
      setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!hasPermission('settings') && user?.rol !== 'ADMIN') {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <FiSettings size={48} className="text-muted mb-3" />
          <h5>Acceso Restringido</h5>
          <p className="text-muted">No tienes permisos para acceder a la configuración del sistema.</p>
        </Card.Body>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Cargando configuración...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FiSettings className="me-2" />
            Configuración del Sistema
          </h5>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            <FiSave className="me-1" /> {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Card.Header>
      </Card>

      {message && (
        <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        {/* TAB EMPRESA */}
        <Tab eventKey="empresa" title="Datos de Empresa">
          <Card>
            <Card.Body>
              <p className="text-muted small mb-4">Esta información se muestra en los tickets y comprobantes de venta.</p>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Razón Social *</Form.Label>
                    <Form.Control
                      value={config.nombreEmpresa}
                      onChange={(e) => handleChange('nombreEmpresa', e.target.value)}
                      placeholder="MI EMPRESA S.A.C."
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre Comercial</Form.Label>
                    <Form.Control
                      value={config.nombreComercial}
                      onChange={(e) => handleChange('nombreComercial', e.target.value)}
                      placeholder="Mi Tienda"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>RUC *</Form.Label>
                    <Form.Control
                      value={config.ruc}
                      onChange={(e) => handleChange('ruc', e.target.value)}
                      maxLength={11}
                      placeholder="20123456789"
                    />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dirección *</Form.Label>
                    <Form.Control
                      value={config.direccion}
                      onChange={(e) => handleChange('direccion', e.target.value)}
                      placeholder="Av. Principal 123, Lima"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      value={config.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      placeholder="01-1234567"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>WhatsApp</Form.Label>
                    <Form.Control
                      value={config.whatsapp}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
                      placeholder="51925263496"
                    />
                    <Form.Text className="text-muted">Número con código de país, sin + ni espacios</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={config.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="ventas@miempresa.com"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        {/* TAB FACTURACIÓN */}
        <Tab
          eventKey="facturacion"
          title={
            <>
              <FiFileText className="me-1" />
              Facturación
            </>
          }
        >
          <Card>
            <Card.Body>
              <h6 className="mb-3">Impuesto</h6>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label>Tasa IGV (%)</Form.Label>
                    <Form.Control
                      type="number"
                      value={config.igvRate}
                      onChange={(e) => handleChange('igvRate', parseFloat(e.target.value) || 18)}
                      min={0}
                      max={100}
                    />
                    <Form.Text className="text-muted">Porcentaje de IGV aplicado a las ventas</Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <h6 className="mb-3">Series de Comprobantes</h6>
              <Alert variant="info" className="mb-3">
                <small>
                  Las series deben coincidir con las configuradas en tu cuenta de Nubefact. Consulta tu panel de Nubefact para obtener las
                  series correctas.
                </small>
              </Alert>

              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Serie Boleta</Form.Label>
                    <Form.Control
                      value={config.serieBoleta}
                      onChange={(e) => handleChange('serieBoleta', e.target.value.toUpperCase())}
                      maxLength={4}
                      placeholder="B001"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Serie Factura</Form.Label>
                    <Form.Control
                      value={config.serieFactura}
                      onChange={(e) => handleChange('serieFactura', e.target.value.toUpperCase())}
                      maxLength={4}
                      placeholder="F001"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Serie NC Boleta</Form.Label>
                    <Form.Control
                      value={config.serieNotaCreditoBoleta}
                      onChange={(e) => handleChange('serieNotaCreditoBoleta', e.target.value.toUpperCase())}
                      maxLength={4}
                      placeholder="BC01"
                    />
                    <Form.Text className="text-muted">Nota de Crédito</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Serie NC Factura</Form.Label>
                    <Form.Control
                      value={config.serieNotaCreditoFactura}
                      onChange={(e) => handleChange('serieNotaCreditoFactura', e.target.value.toUpperCase())}
                      maxLength={4}
                      placeholder="FC01"
                    />
                    <Form.Text className="text-muted">Nota de Crédito</Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </>
  );
};

export default Settings;
