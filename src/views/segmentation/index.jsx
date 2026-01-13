import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Alert, Spinner, Badge, Button, Modal } from 'react-bootstrap';
import Chart from 'react-apexcharts';
import { FiUsers, FiRefreshCw, FiStar, FiAlertTriangle, FiUserX, FiUser, FiMessageSquare, FiCopy } from 'react-icons/fi';
import segmentacionApi from '../../services/api/segmentacionApi';
import { formatCurrency } from '../../utils/formatters';

const SEGMENT_CONFIG = {
  VIP: { color: '#ffc107', icon: FiStar, bg: 'warning' },
  Regular: { color: '#17a2b8', icon: FiUser, bg: 'info' },
  'En Riesgo': { color: '#fd7e14', icon: FiAlertTriangle, bg: 'orange' },
  Perdido: { color: '#dc3545', icon: FiUserX, bg: 'danger' }
};

const Segmentation = () => {
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [error, setError] = useState(null);
  const [segments, setSegments] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Modal de oferta
  const [showOfertaModal, setShowOfertaModal] = useState(false);
  const [ofertaLoading, setOfertaLoading] = useState(false);
  const [ofertaData, setOfertaData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [segmentsData, metricsData] = await Promise.all([segmentacionApi.getSegments(), segmentacionApi.getMetrics()]);
      setSegments(segmentsData);
      setMetrics(metricsData);
    } catch (err) {
      console.error('Error cargando segmentación:', err);
      setError('No se pudo conectar al servicio de segmentación. Asegúrate de que esté corriendo en puerto 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    try {
      setTraining(true);
      setError(null);
      await segmentacionApi.train();
      await loadData();
    } catch (err) {
      setError('Error al entrenar el modelo: ' + err.message);
    } finally {
      setTraining(false);
    }
  };

  const handleSelectSegment = async (segmento) => {
    try {
      setSelectedSegment(segmento);
      setLoadingCustomers(true);
      const data = await segmentacionApi.getCustomersBySegment(segmento);
      setCustomers(data.clientes || []);
    } catch (err) {
      console.error('Error cargando clientes:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleGenerarOferta = async (cliente) => {
    try {
      setOfertaLoading(true);
      setShowOfertaModal(true);
      const data = await segmentacionApi.generarOferta(cliente.cliente_id);
      setOfertaData(data);
    } catch (err) {
      setOfertaData({ error: err.message });
    } finally {
      setOfertaLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Gráfico de pie
  const pieChartOptions = {
    chart: { type: 'donut', height: 300 },
    labels: segments.map((s) => s.segmento),
    colors: segments.map((s) => SEGMENT_CONFIG[s.segmento]?.color || '#6c757d'),
    legend: { position: 'bottom' },
    tooltip: { y: { formatter: (val) => `${val} clientes` } }
  };
  const pieChartSeries = segments.map((s) => s.cantidad);

  // Gráfico de barras RFM
  const barChartOptions = {
    chart: { type: 'bar', height: 300, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: segments.map((s) => s.segmento) },
    colors: ['#4680ff', '#17c666', '#ffba57'],
    legend: { position: 'top' }
  };
  const barChartSeries = [
    { name: 'R-Dias de compra del cliente(recencia)', data: segments.map((s) => Math.round(s.recency_promedio || 0)) },
    { name: 'F-Compra frecuente del cliente', data: segments.map((s) => Math.round(s.frequency_promedio || 0)) },
    { name: 'M-Gasto de cliente (S/)', data: segments.map((s) => Math.round((s.monetary_promedio || 0) / 100)) }
  ];

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando segmentación...</p>
      </div>
    );
  }

  return (
    <React.Fragment>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-1">
                <FiUsers className="me-2" />
                Segmentación IA de Clientes
              </h4>
              <small className="text-muted">
                RFM + KMeans + Gemini AI
                {metrics?.ultima_actualizacion && <> | Última actualización: {new Date(metrics.ultima_actualizacion).toLocaleString()}</>}
              </small>
            </div>
            <Button variant="primary" onClick={handleTrain} disabled={training}>
              {training ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Entrenando...
                </>
              ) : (
                <>
                  <FiRefreshCw className="me-2" />
                  Actualizar Modelo
                </>
              )}
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tarjetas de segmentos */}
      <Row className="mb-4">
        {segments.map((seg) => {
          const config = SEGMENT_CONFIG[seg.segmento] || { color: '#6c757d', icon: FiUser, bg: 'secondary' };
          const Icon = config.icon;
          const isSelected = selectedSegment === seg.segmento;

          return (
            <Col md={3} key={seg.segmento}>
              <Card
                className={`cursor-pointer ${isSelected ? 'border-primary border-2' : ''}`}
                onClick={() => handleSelectSegment(seg.segmento)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body className="text-center">
                  <div
                    className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{ width: 60, height: 60, backgroundColor: config.color + '20' }}
                  >
                    <Icon size={28} style={{ color: config.color }} />
                  </div>
                  <h5 className="mb-1">{seg.segmento}</h5>
                  <h3 className="mb-0">{seg.cantidad}</h3>
                  <Badge bg={config.bg} className="mt-2">
                    {seg.porcentaje}%
                  </Badge>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Gráficos */}
      <Row className="mb-4">
        <Col lg={5}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Distribución de Clientes</h6>
            </Card.Header>
            <Card.Body>
              {segments.length > 0 ? (
                <Chart options={pieChartOptions} series={pieChartSeries} type="donut" height={300} />
              ) : (
                <div className="text-center text-muted py-5">Sin datos. Haz clic en &apos;Actualizar Modelo&apos; para entrenar.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Métricas RFM por Segmento</h6>
            </Card.Header>
            <Card.Body>
              {segments.length > 0 ? (
                <Chart options={barChartOptions} series={barChartSeries} type="bar" height={300} />
              ) : (
                <div className="text-center text-muted py-5">Sin datos</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Lista de clientes del segmento seleccionado */}
      {selectedSegment && (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              Clientes - {selectedSegment}
              <Badge bg="secondary" className="ms-2">
                {customers.length}
              </Badge>
            </h6>
          </Card.Header>
          <Card.Body className="p-0">
            {loadingCustomers ? (
              <div className="text-center py-4">
                <Spinner size="sm" /> Cargando...
              </div>
            ) : (
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Contacto</th>
                    <th>Días sin comprar</th>
                    <th>Compras</th>
                    <th>Total Gastado</th>
                    <th>Score RFM</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        No hay clientes en este segmento
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c.cliente_id}>
                        <td>
                          <strong>
                            {c.nombres} {c.apellidos}
                          </strong>
                          <br />
                          <small className="text-muted">
                            <Badge bg={c.origen === 'APP' ? 'info' : 'secondary'} size="sm">
                              {c.origen}
                            </Badge>
                          </small>
                        </td>
                        <td>
                          <small>
                            {c.email && <div>{c.email}</div>}
                            {c.telefono && <div>{c.telefono}</div>}
                          </small>
                        </td>
                        <td>{c.recency_days} días</td>
                        <td>{c.frequency_count}</td>
                        <td>{formatCurrency(c.monetary_total)}</td>
                        <td>
                          <Badge bg="primary">{c.rfm_score}</Badge>
                        </td>
                        <td>
                          <Button size="sm" variant="outline-success" onClick={() => handleGenerarOferta(c)}>
                            <FiMessageSquare className="me-1" />
                            Generar Oferta
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Modal de Oferta Generada */}
      <Modal show={showOfertaModal} onHide={() => setShowOfertaModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiMessageSquare className="me-2" />
            Oferta Personalizada
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ofertaLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Generando oferta con IA...</p>
            </div>
          ) : ofertaData?.error ? (
            <Alert variant="danger">{ofertaData.error}</Alert>
          ) : ofertaData ? (
            <>
              <div className="mb-3">
                <strong>Cliente:</strong> {ofertaData.nombre}
                <Badge bg="info" className="ms-2">
                  {ofertaData.segmento}
                </Badge>
              </div>
              <Card className="bg-light">
                <Card.Body>
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {ofertaData.mensaje}
                  </p>
                </Card.Body>
              </Card>
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          {ofertaData && !ofertaData.error && (
            <>
              <Button variant="outline-primary" onClick={() => copyToClipboard(ofertaData.mensaje)}>
                <FiCopy className="me-1" /> Copiar
              </Button>
              <Button
                variant="success"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(ofertaData.mensaje)}`, '_blank')}
              >
                Enviar WhatsApp
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setShowOfertaModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default Segmentation;
