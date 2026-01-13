import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import Chart from 'react-apexcharts';
import {
  FiShoppingCart,
  FiDollarSign,
  FiAlertTriangle,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiBell,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import { dashboardApi, productosApi } from '../../services/api';
import { pedidosApi } from '../../services/api/ecommerceApi';
import { formatCurrency } from '../../utils/formatters';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [comparativa, setComparativa] = useState(null);
  const [pedidosStats, setPedidosStats] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [lastPedidosCount, setLastPedidosCount] = useState(0);

  // Polling para pedidos nuevos (cada 30 segundos)
  const checkNuevosPedidos = useCallback(async () => {
    try {
      const stats = await pedidosApi.getStats();
      const pendientes = stats.pendientes || 0;

      // Si hay más pedidos pendientes que antes, mostrar notificación
      if (pendientes > lastPedidosCount && lastPedidosCount > 0) {
        setShowNotification(true);
        // Reproducir sonido de notificación
        playNotificationSound();
        // Ocultar después de 5 segundos
        setTimeout(() => setShowNotification(false), 5000);
      }

      setLastPedidosCount(pendientes);
      setPedidosStats(stats);
    } catch (err) {
      console.error('Error checking pedidos:', err);
    }
  }, [lastPedidosCount]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio(
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQAA'
      );
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {
      // No hacer nada si falla
    }
  };

  useEffect(() => {
    loadData();

    // Polling cada 30 segundos para pedidos nuevos
    const interval = setInterval(checkNuevosPedidos, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardData, stockBajo, comparativaData, statsData] = await Promise.all([
        dashboardApi.getDashboard(),
        productosApi.getStockBajo().catch(() => []),
        dashboardApi.getComparativa().catch(() => null),
        pedidosApi.getStats().catch(() => ({}))
      ]);

      setDashboard(dashboardData);
      setLowStockProducts(stockBajo.slice(0, 5));
      setComparativa(comparativaData);
      setPedidosStats(statsData);
      setLastPedidosCount(statsData.pendientes || 0);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError(err.message || 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para gráficos
  const ventasPorDia = dashboard?.ventasPorDia || [];
  const productosMasVendidos = dashboard?.productosMasVendidos || [];
  const ventasPorCategoria = dashboard?.ventasPorCategoria || [];

  // Gráfico de líneas - Ventas por día
  const lineChartOptions = {
    chart: { type: 'area', height: 250, toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0 } },
    colors: ['#4680ff'],
    xaxis: {
      categories: ventasPorDia.map((d) => {
        const fecha = new Date(d.fecha);
        return fecha.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' });
      })
    },
    yaxis: { labels: { formatter: (val) => `S/ ${val?.toFixed(0) || 0}` } },
    tooltip: { y: { formatter: (val) => formatCurrency(val) } }
  };

  const lineChartSeries = [
    {
      name: 'Ventas',
      data: ventasPorDia.map((d) => d.total || 0)
    }
  ];

  // Gráfico de dona - Ventas por categoría
  const donutChartOptions = {
    chart: { type: 'donut', height: 250 },
    labels: ventasPorCategoria.map((c) => c.categoriaNombre || 'Sin categoría'),
    colors: ['#4680ff', '#17c666', '#ffba57', '#ea4d4d', '#9b59b6'],
    legend: { position: 'bottom' },
    tooltip: { y: { formatter: (val) => formatCurrency(val) } }
  };

  const donutChartSeries = ventasPorCategoria.map((c) => c.totalVendido || 0);

  // Gráfico horizontal - Productos más vendidos
  const topProductsChartOptions = {
    chart: { type: 'bar', height: 250, toolbar: { show: false } },
    colors: ['#ffba57'],
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    xaxis: { categories: productosMasVendidos.map((p) => (p.productoNombre || '').substring(0, 20)) },
    tooltip: { y: { formatter: (val) => `${val} unidades` } }
  };

  const topProductsChartSeries = [
    {
      name: 'Cantidad',
      data: productosMasVendidos.map((p) => p.cantidadVendida || 0)
    }
  ];

  // Componente de comparativa
  const ComparativaCard = ({ titulo, actual, anterior, crecimiento, icono: Icon }) => {
    const isPositive = crecimiento >= 0;
    return (
      <Card className="h-100 border-0 shadow-sm">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <small className="text-muted">{titulo}</small>
            <Icon size={18} className="text-muted" />
          </div>
          <h4 className="mb-1">{formatCurrency(actual)}</h4>
          <div className="d-flex align-items-center">
            {isPositive ? <FiArrowUp className="text-success me-1" /> : <FiArrowDown className="text-danger me-1" />}
            <small className={isPositive ? 'text-success' : 'text-danger'}>{Math.abs(crecimiento).toFixed(1)}%</small>
            <small className="text-muted ms-2">vs {formatCurrency(anterior)}</small>
          </div>
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <button className="btn btn-outline-danger" onClick={loadData}>
          Reintentar
        </button>
      </Alert>
    );
  }

  return (
    <React.Fragment>
      {/* Notificación de nuevo pedido */}
      {showNotification && (
        <Alert variant="info" className="d-flex align-items-center mb-3 animate__animated animate__fadeIn">
          <FiBell className="me-2" size={20} />
          <strong>¡Nuevo pedido recibido!</strong>
          <button className="btn btn-sm btn-info ms-auto" onClick={() => navigate('/ecommerce/pedidos')}>
            Ver pedidos
          </button>
        </Alert>
      )}

      {/* Widget de Pedidos Pendientes */}
      {(pedidosStats.pendientes > 0 || pedidosStats.pagados > 0) && (
        <Card className="mb-4 border-warning" style={{ borderWidth: '2px' }}>
          <Card.Body className="py-3">
            <Row className="align-items-center">
              <Col xs="auto">
                <div className="bg-warning bg-opacity-25 p-3 rounded-circle">
                  <FiClock size={24} className="text-warning" />
                </div>
              </Col>
              <Col>
                <h6 className="mb-1">Pedidos que requieren atención</h6>
                <div className="d-flex gap-3">
                  {pedidosStats.pendientes > 0 && (
                    <Badge bg="warning" className="px-3 py-2">
                      {pedidosStats.pendientes} Pendientes
                    </Badge>
                  )}
                  {pedidosStats.pagados > 0 && (
                    <Badge bg="info" className="px-3 py-2">
                      {pedidosStats.pagados} Pagados (por confirmar)
                    </Badge>
                  )}
                  {pedidosStats.preparando > 0 && (
                    <Badge bg="secondary" className="px-3 py-2">
                      {pedidosStats.preparando} Preparando
                    </Badge>
                  )}
                </div>
              </Col>
              <Col xs="auto">
                <button className="btn btn-warning" onClick={() => navigate('/ecommerce/pedidos')}>
                  Gestionar Pedidos
                </button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Comparativa de Períodos */}
      {comparativa && (
        <Row className="mb-4">
          <Col md={4}>
            <ComparativaCard
              titulo="Hoy vs Ayer"
              actual={comparativa.hoyVsAyer?.totalHoy || 0}
              anterior={comparativa.hoyVsAyer?.totalAyer || 0}
              crecimiento={comparativa.hoyVsAyer?.crecimiento || 0}
              icono={FiDollarSign}
            />
          </Col>
          <Col md={4}>
            <ComparativaCard
              titulo="Esta Semana vs Anterior"
              actual={comparativa.semanaVsSemana?.totalActual || 0}
              anterior={comparativa.semanaVsSemana?.totalAnterior || 0}
              crecimiento={comparativa.semanaVsSemana?.crecimiento || 0}
              icono={FiTrendingUp}
            />
          </Col>
          <Col md={4}>
            <ComparativaCard
              titulo="Este Mes vs Anterior"
              actual={comparativa.mesVsMes?.totalActual || 0}
              anterior={comparativa.mesVsMes?.totalAnterior || 0}
              crecimiento={comparativa.mesVsMes?.crecimiento || 0}
              icono={FiShoppingCart}
            />
          </Col>
        </Row>
      )}

      {/* Tarjetas de resumen */}
      <Row className="mb-4">
        <Col md={6} xl={3}>
          <Card className="bg-primary text-white">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-white mb-1">Ventas Hoy</h6>
                  <h3 className="text-white mb-0">{dashboard?.ventasHoy || 0}</h3>
                  <small>{formatCurrency(dashboard?.totalHoy || 0)}</small>
                </div>
                <FiShoppingCart size={40} className="opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="bg-success text-white">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-white mb-1">Ventas del Mes</h6>
                  <h3 className="text-white mb-0">{dashboard?.ventasMes || 0}</h3>
                  <small>{formatCurrency(dashboard?.totalMes || 0)}</small>
                </div>
                <FiTrendingUp size={40} className="opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="bg-warning text-white">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-white mb-1">Ventas Semana</h6>
                  <h3 className="text-white mb-0">{dashboard?.ventasSemana || 0}</h3>
                  <small>{formatCurrency(dashboard?.totalSemana || 0)}</small>
                </div>
                <FiDollarSign size={40} className="opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="bg-danger text-white">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-white mb-1">Stock Bajo</h6>
                  <h3 className="text-white mb-0">{dashboard?.productosStockBajo || 0}</h3>
                  <small>Productos</small>
                </div>
                <FiAlertTriangle size={40} className="opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Crecimiento */}
      {dashboard?.crecimientoMensual !== undefined && (
        <Row className="mb-4">
          <Col>
            <Alert variant={dashboard.crecimientoMensual >= 0 ? 'success' : 'warning'}>
              {dashboard.crecimientoMensual >= 0 ? <FiTrendingUp className="me-2" /> : <FiTrendingDown className="me-2" />}
              Crecimiento mensual: <strong>{dashboard.crecimientoMensual?.toFixed(1)}%</strong> respecto al mes anterior
            </Alert>
          </Col>
        </Row>
      )}

      {/* Gráficos principales */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Ventas Últimos Días</h5>
            </Card.Header>
            <Card.Body>
              {ventasPorDia.length > 0 ? (
                <Chart options={lineChartOptions} series={lineChartSeries} type="area" height={250} />
              ) : (
                <div className="text-center text-muted py-5">Sin datos de ventas</div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Ventas por Categoría</h5>
            </Card.Header>
            <Card.Body>
              {ventasPorCategoria.length > 0 ? (
                <Chart options={donutChartOptions} series={donutChartSeries} type="donut" height={250} />
              ) : (
                <div className="text-center text-muted py-5">Sin datos</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tablas */}
      <Row>
        <Col lg={6}>
          <Card>
            <Card.Header className="bg-danger text-white">
              <h5 className="mb-0 text-white">
                <FiAlertTriangle className="me-2" />
                Stock Bajo
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Código</th>
                    <th>Tallas con Stock Bajo</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-3">
                        Sin alertas
                      </td>
                    </tr>
                  ) : (
                    lowStockProducts.map((p) => {
                      const tallasConStockBajo = (p.tallas || []).filter((t) => t.stock <= 5);
                      return (
                        <tr key={p.id}>
                          <td>{p.nombre}</td>
                          <td>
                            <code>{p.codigo}</code>
                          </td>
                          <td>
                            {tallasConStockBajo.length > 0 ? (
                              tallasConStockBajo.map((t) => (
                                <span key={t.talla} className="badge bg-danger me-1">
                                  {t.talla}: {t.stock}
                                </span>
                              ))
                            ) : (
                              <span className="badge bg-warning">Total: {p.stockTotal}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Top Productos Vendidos</h5>
            </Card.Header>
            <Card.Body>
              {productosMasVendidos.length > 0 ? (
                <Chart options={topProductsChartOptions} series={topProductsChartSeries} type="bar" height={250} />
              ) : (
                <div className="text-center text-muted py-5">Sin ventas registradas</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Dashboard;
