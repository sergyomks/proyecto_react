import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Button, Form, Tab, Tabs, Badge, Spinner, Alert } from 'react-bootstrap';
import Chart from 'react-apexcharts';
import { FiDownload, FiPrinter, FiRefreshCw, FiCalendar, FiTrendingUp, FiPackage, FiUsers, FiAlertTriangle } from 'react-icons/fi';
import { dashboardApi, inventarioApi, ventasApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toastSuccess, toastError } from '../../utils/alerts';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('ventas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros de fecha
  const [dateRange, setDateRange] = useState({
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0]
  });
  const [year, setYear] = useState(new Date().getFullYear());

  // Datos
  const [monthlySales, setMonthlySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [salesByPayment, setSalesByPayment] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [stats, setStats] = useState({
    ventasHoy: 0,
    ventasMes: 0,
    totalVentas: 0,
    totalProductos: 0,
    totalClientes: 0
  });
  const [rangeStats, setRangeStats] = useState({
    totalVentas: 0,
    cantidadVentas: 0,
    promedioVenta: 0
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { fechaInicio, fechaFin } = dateRange;

      // Cargar datos en paralelo
      const [statsData, topProductsData, categoryData, paymentData, dailyData, lowStockData, monthlyData] = await Promise.all([
        dashboardApi.getStats().catch(() => null),
        dashboardApi.getProductosMasVendidos(fechaInicio, fechaFin, 15).catch(() => []),
        dashboardApi.getVentasPorCategoria(fechaInicio, fechaFin).catch(() => []),
        dashboardApi.getVentasPorMetodoPago(fechaInicio, fechaFin).catch(() => []),
        dashboardApi.getVentasPorDia(fechaInicio, fechaFin).catch(() => []),
        inventarioApi.getStockBajo().catch(() => []),
        dashboardApi.getVentasMensuales(year).catch(() => [])
      ]);

      // Estadísticas generales
      if (statsData) {
        setStats({
          ventasHoy: statsData.ventasHoyMonto || statsData.totalHoy || 0,
          ventasMes: statsData.ventasMesMonto || statsData.totalMes || 0,
          totalVentas: statsData.totalVentas || statsData.ventasMes || 0,
          totalProductos: statsData.totalProductos || 0,
          totalClientes: statsData.totalClientes || 0
        });
      }

      // Calcular estadísticas del rango
      const totalRango = (categoryData || []).reduce((sum, c) => sum + (c.totalVendido || c.total || 0), 0);
      const cantidadRango = (categoryData || []).reduce((sum, c) => sum + (c.cantidadVendida || c.cantidad || 0), 0);
      setRangeStats({
        totalVentas: totalRango,
        cantidadVentas: cantidadRango,
        promedioVenta: cantidadRango > 0 ? totalRango / cantidadRango : 0
      });

      setTopProducts(topProductsData || []);
      setSalesByCategory(categoryData || []);
      setSalesByPayment(paymentData || []);
      setDailySales(dailyData || []);
      setLowStockProducts(lowStockData || []);
      setMonthlySales(monthlyData.length > 0 ? monthlyData : generateEmptyMonthlyData());
    } catch (err) {
      console.error('Error cargando reportes:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [dateRange, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateEmptyMonthlyData = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months.map((label) => ({
      mes: label,
      total: 0,
      cantidad: 0
    }));
  };

  // Filtros rápidos de fecha
  const setQuickDateRange = (type) => {
    const today = new Date();
    let fechaInicio, fechaFin;

    switch (type) {
      case 'today':
        fechaInicio = fechaFin = today.toISOString().split('T')[0];
        break;
      case 'week': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        fechaInicio = startOfWeek.toISOString().split('T')[0];
        fechaFin = today.toISOString().split('T')[0];
        break;
      }
      case 'month':
        fechaInicio = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        fechaFin = today.toISOString().split('T')[0];
        break;
      case 'year':
        fechaInicio = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        fechaFin = today.toISOString().split('T')[0];
        break;
      default:
        return;
    }

    setDateRange({ fechaInicio, fechaFin });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportSales = async () => {
    try {
      // Obtener ventas del rango seleccionado
      const ventas = await ventasApi.getByFecha(dateRange.fechaInicio, dateRange.fechaFin);

      // Crear CSV
      const headers = ['Número', 'Fecha', 'Cliente', 'Items', 'Subtotal', 'IGV', 'Total', 'Método Pago', 'Estado'];
      const rows = (ventas || []).map((v) => [
        v.numero,
        formatDate(v.createdAt),
        v.clienteNombre || 'Sin cliente',
        v.items?.length || 0,
        v.subtotal || 0,
        v.igv || 0,
        v.total || 0,
        v.metodoPago,
        v.estado
      ]);

      const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_ventas_${dateRange.fechaInicio}_${dateRange.fechaFin}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toastSuccess('Reporte de ventas exportado');
    } catch (err) {
      toastError('Error al exportar ventas: ' + err.message);
    }
  };

  // Gráfico ventas mensuales
  const monthlyChartOptions = {
    chart: { type: 'bar', height: 300, toolbar: { show: false } },
    colors: ['#4680ff'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
    xaxis: { categories: monthlySales.map((m) => m.mes || m.label) },
    yaxis: { labels: { formatter: (val) => `S/ ${val.toFixed(0)}` } },
    dataLabels: { enabled: false }
  };

  const monthlyChartSeries = [
    {
      name: 'Ventas',
      data: monthlySales.map((m) => m.total || 0)
    }
  ];

  // Gráfico ventas diarias
  const dailyChartOptions = {
    chart: { type: 'area', height: 250, toolbar: { show: false } },
    colors: ['#17c666'],
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.1 } },
    xaxis: {
      categories: dailySales.map((d) => {
        const date = new Date(d.fecha);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      })
    },
    yaxis: { labels: { formatter: (val) => `S/ ${val.toFixed(0)}` } },
    dataLabels: { enabled: false }
  };

  const dailyChartSeries = [
    {
      name: 'Ventas',
      data: dailySales.map((d) => d.total || 0)
    }
  ];

  // Gráfico por categoría
  const categoryChartOptions = {
    chart: { type: 'donut', height: 280 },
    labels: salesByCategory.map((c) => c.categoriaNombre || c.categoria || 'Sin categoría'),
    colors: ['#4680ff', '#17c666', '#ffc107', '#dc3545', '#6c757d', '#0dcaf0'],
    legend: { position: 'bottom', fontSize: '12px' },
    dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%` }
  };

  const categoryChartSeries = salesByCategory.map((c) => c.totalVendido || c.total || 0);

  // Gráfico por método de pago
  const paymentChartOptions = {
    chart: { type: 'pie', height: 280 },
    labels: salesByPayment.map((p) => p.metodoPago || 'Otro'),
    colors: ['#4680ff', '#17c666', '#ffc107', '#dc3545'],
    legend: { position: 'bottom', fontSize: '12px' }
  };

  const paymentChartSeries = salesByPayment.map((p) => p.total || 0);

  // Totales
  const totalMensual = monthlySales.reduce((sum, m) => sum + (m.total || 0), 0);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando reportes...</p>
      </div>
    );
  }

  return (
    <div className="reports-page">
      {/* Header */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="mb-0">
            <FiTrendingUp className="me-2" />
            Reportes y Análisis
          </h5>
          <div className="d-flex gap-2 flex-wrap">
            <Button variant="outline-secondary" size="sm" onClick={loadData}>
              <FiRefreshCw className="me-1" /> Actualizar
            </Button>
            <Button variant="outline-primary" size="sm" onClick={handlePrint}>
              <FiPrinter className="me-1" /> Imprimir
            </Button>
          </div>
        </Card.Header>
      </Card>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros de fecha */}
      <Card className="mb-4">
        <Card.Body className="py-3">
          <Row className="align-items-end g-3">
            <Col xs={12} md="auto">
              <div className="d-flex gap-2">
                <Button
                  variant={dateRange.fechaInicio === new Date().toISOString().split('T')[0] ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setQuickDateRange('today')}
                >
                  Hoy
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => setQuickDateRange('week')}>
                  Semana
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => setQuickDateRange('month')}>
                  Mes
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => setQuickDateRange('year')}>
                  Año
                </Button>
              </div>
            </Col>
            <Col xs={6} md={2}>
              <Form.Group>
                <Form.Label className="small mb-1">
                  <FiCalendar className="me-1" />
                  Desde
                </Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={dateRange.fechaInicio}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, fechaInicio: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={2}>
              <Form.Group>
                <Form.Label className="small mb-1">Hasta</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={dateRange.fechaFin}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, fechaFin: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md="auto" className="ms-auto">
              <Button variant="success" size="sm" onClick={handleExportSales}>
                <FiDownload className="me-1" /> Exportar Ventas
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        {/* TAB VENTAS */}
        <Tab
          eventKey="ventas"
          title={
            <span>
              <FiTrendingUp className="me-1" />
              Ventas
            </span>
          }
        >
          {/* Cards resumen */}
          <Row className="mb-4 g-3">
            <Col xs={6} lg={3}>
              <Card className="bg-primary text-white h-100">
                <Card.Body className="py-3">
                  <small className="opacity-75">Ventas Hoy</small>
                  <h4 className="mb-0 text-white">{formatCurrency(stats.ventasHoy)}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} lg={3}>
              <Card className="bg-success text-white h-100">
                <Card.Body className="py-3">
                  <small className="opacity-75">Ventas del Mes</small>
                  <h4 className="mb-0 text-white">{formatCurrency(stats.ventasMes)}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} lg={3}>
              <Card className="bg-info text-white h-100">
                <Card.Body className="py-3">
                  <small className="opacity-75">Total Rango Seleccionado</small>
                  <h4 className="mb-0 text-white">{formatCurrency(rangeStats.totalVentas)}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} lg={3}>
              <Card className="bg-warning text-white h-100">
                <Card.Body className="py-3">
                  <small className="opacity-75">Promedio por Venta</small>
                  <h4 className="mb-0 text-white">{formatCurrency(rangeStats.promedioVenta)}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Gráficos */}
          <Row className="mb-4 g-3">
            <Col lg={8}>
              <Card className="h-100">
                <Card.Header className="py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Ventas Diarias</h6>
                    <small className="text-muted">
                      {dateRange.fechaInicio} - {dateRange.fechaFin}
                    </small>
                  </div>
                </Card.Header>
                <Card.Body>
                  {dailySales.length > 0 ? (
                    <Chart options={dailyChartOptions} series={dailyChartSeries} type="area" height={250} />
                  ) : (
                    <div className="text-center text-muted py-5">Sin datos para el rango seleccionado</div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="h-100">
                <Card.Header className="py-2">
                  <h6 className="mb-0">Por Método de Pago</h6>
                </Card.Header>
                <Card.Body>
                  {salesByPayment.length > 0 ? (
                    <Chart options={paymentChartOptions} series={paymentChartSeries} type="pie" height={250} />
                  ) : (
                    <div className="text-center text-muted py-5">Sin datos</div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Ventas mensuales del año */}
          <Row className="mb-4 g-3">
            <Col lg={8}>
              <Card>
                <Card.Header className="py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Ventas Mensuales</h6>
                    <Form.Select size="sm" style={{ width: '100px' }} value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                      {[2023, 2024, 2025, 2026].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Chart options={monthlyChartOptions} series={monthlyChartSeries} type="bar" height={280} />
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="h-100">
                <Card.Header className="py-2">
                  <h6 className="mb-0">Resumen Anual {year}</h6>
                </Card.Header>
                <Card.Body className="p-0" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  <Table size="sm" className="mb-0">
                    <tbody>
                      {monthlySales.map((m, i) => (
                        <tr key={i}>
                          <td className="ps-3">{m.mes || m.label}</td>
                          <td className="text-end pe-3">{formatCurrency(m.total || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <th className="ps-3">Total Año</th>
                        <th className="text-end pe-3">{formatCurrency(totalMensual)}</th>
                      </tr>
                    </tfoot>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* TAB PRODUCTOS */}
        <Tab
          eventKey="productos"
          title={
            <span>
              <FiPackage className="me-1" />
              Productos
            </span>
          }
        >
          <Row className="g-3">
            <Col lg={7}>
              <Card>
                <Card.Header className="py-2">
                  <h6 className="mb-0">Productos Más Vendidos</h6>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive hover size="sm" className="mb-0">
                    <thead>
                      <tr>
                        <th className="ps-3">#</th>
                        <th>Producto</th>
                        <th className="text-center">Cantidad</th>
                        <th className="text-end pe-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center text-muted py-4">
                            Sin datos
                          </td>
                        </tr>
                      ) : (
                        topProducts.map((p, i) => (
                          <tr key={i}>
                            <td className="ps-3">
                              <Badge bg={i < 3 ? 'success' : 'secondary'}>{i + 1}</Badge>
                            </td>
                            <td>{p.productoNombre || p.nombre}</td>
                            <td className="text-center">{p.cantidadVendida || p.cantidad || 0}</td>
                            <td className="text-end pe-3">{formatCurrency(p.totalVentas || p.total || 0)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={5}>
              <Card className="mb-3">
                <Card.Header className="py-2">
                  <h6 className="mb-0">Ventas por Categoría</h6>
                </Card.Header>
                <Card.Body>
                  {salesByCategory.length > 0 ? (
                    <Chart options={categoryChartOptions} series={categoryChartSeries} type="donut" height={250} />
                  ) : (
                    <div className="text-center text-muted py-4">Sin datos</div>
                  )}
                </Card.Body>
              </Card>
              <Card>
                <Card.Body className="p-0">
                  <Table size="sm" className="mb-0">
                    <thead>
                      <tr>
                        <th className="ps-3">Categoría</th>
                        <th className="text-center">Cant.</th>
                        <th className="text-end">Total</th>
                        <th className="text-end pe-3">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesByCategory.map((c, i) => {
                        const totalCat = salesByCategory.reduce((s, x) => s + (x.totalVendido || x.total || 0), 0);
                        const catTotal = c.totalVendido || c.total || 0;
                        const pct = totalCat > 0 ? ((catTotal / totalCat) * 100).toFixed(1) : 0;
                        return (
                          <tr key={i}>
                            <td className="ps-3">{c.categoriaNombre || c.categoria}</td>
                            <td className="text-center">{c.cantidadVendida || c.cantidad || 0}</td>
                            <td className="text-end">{formatCurrency(catTotal)}</td>
                            <td className="text-end pe-3">
                              <Badge bg="primary">{pct}%</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* TAB INVENTARIO */}
        <Tab
          eventKey="inventario"
          title={
            <span>
              <FiAlertTriangle className="me-1" />
              Inventario
              {lowStockProducts.length > 0 && (
                <Badge bg="danger" className="ms-1">
                  {lowStockProducts.length}
                </Badge>
              )}
            </span>
          }
        >
          <Row className="mb-4 g-3">
            <Col xs={6} md={4}>
              <Card className="bg-info text-white h-100">
                <Card.Body className="py-3">
                  <div className="d-flex align-items-center">
                    <FiPackage size={32} className="me-3 opacity-75" />
                    <div>
                      <small className="opacity-75">Total Productos</small>
                      <h3 className="mb-0 text-white">{stats.totalProductos}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={4}>
              <Card className="bg-success text-white h-100">
                <Card.Body className="py-3">
                  <div className="d-flex align-items-center">
                    <FiUsers size={32} className="me-3 opacity-75" />
                    <div>
                      <small className="opacity-75">Total Clientes</small>
                      <h3 className="mb-0 text-white">{stats.totalClientes}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className="bg-danger text-white h-100">
                <Card.Body className="py-3">
                  <div className="d-flex align-items-center">
                    <FiAlertTriangle size={32} className="me-3 opacity-75" />
                    <div>
                      <small className="opacity-75">Productos Stock Bajo</small>
                      <h3 className="mb-0 text-white">{lowStockProducts.length}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header className="py-2">
              <h6 className="mb-0">
                <FiAlertTriangle className="me-2 text-warning" />
                Productos con Stock Bajo
              </h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th className="ps-3">Código</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th className="text-center">Stock Actual</th>
                    <th className="text-center">Stock Mínimo</th>
                    <th className="text-center">Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        <FiPackage size={32} className="mb-2 d-block mx-auto opacity-50" />
                        No hay productos con stock bajo
                      </td>
                    </tr>
                  ) : (
                    lowStockProducts.map((p) => {
                      const stockActual = p.stockTotal || p.stock || 0;
                      const diferencia = stockActual - (p.stockMinimo || 5);
                      return (
                        <tr key={p.id} className={stockActual === 0 ? 'table-danger' : 'table-warning'}>
                          <td className="ps-3">
                            <code>{p.codigo}</code>
                          </td>
                          <td>{p.nombre}</td>
                          <td>{p.categoriaNombre || '-'}</td>
                          <td className="text-center fw-bold">{stockActual}</td>
                          <td className="text-center">{p.stockMinimo || 5}</td>
                          <td className="text-center">
                            <Badge bg={diferencia < 0 ? 'danger' : 'warning'}>{diferencia}</Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Reports;
