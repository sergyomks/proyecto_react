# Implementation Plan

## Fase 0: Adaptación del Backend Spring Boot

- [ ] 0. Adaptar entidades del backend al nuevo schema de base de datos
  - [ ] 0.1 Modificar UsuarioEntity para coincidir con tabla `usuarios`
    - Cambiar nombre de tabla a `usuarios`
    - Agregar campo `activo` (boolean)
    - Agregar campo `ultimo_login` (datetime)
    - Mantener campos de seguridad (intentos_fallidos, cuenta_bloqueada, bloqueo_hasta)
    - _Requirements: 1.1, 12.1_

  - [ ] 0.2 Modificar CategoriaEntity para coincidir con tabla `categorias`
    - Cambiar nombre de tabla a `categorias`
    - Agregar campo `parent_id` para jerarquía (self-reference)
    - Agregar campo `activo` (boolean)
    - Remover campos innecesarios (color, imgUrl, categoriaId)
    - _Requirements: 2.1, 12.3_

  - [ ] 0.3 Modificar ItemEntity a ProductoEntity para tabla `productos`
    - Renombrar clase a ProductoEntity
    - Cambiar nombre de tabla a `productos`
    - Agregar campos: codigo, codigo_barras, costo, color, stock_minimo
    - Remover campo `talla` (se maneja en tabla separada)
    - Remover campo `stock` (se calcula desde producto_tallas)
    - _Requirements: 3.1, 12.1_

  - [ ] 0.4 Crear nueva entidad ProductoTallaEntity para tabla `producto_tallas`
    - Crear entidad con campos: producto_id, talla (ENUM), stock
    - Establecer relación ManyToOne con ProductoEntity
    - Agregar constraint único (producto_id, talla)
    - _Requirements: 3.2, 12.2_

  - [ ] 0.5 Crear nueva entidad ClienteEntity para tabla `clientes`
    - Crear entidad con campos: tipo_documento (ENUM), numero_documento, nombre, direccion, telefono, email, activo
    - Agregar constraint único en numero_documento
    - _Requirements: 3.1, 12.1_

  - [ ] 0.6 Modificar OrderEntity a VentaEntity para tabla `ventas`
    - Renombrar clase a VentaEntity
    - Cambiar nombre de tabla a `ventas`
    - Agregar campos: numero, usuario_id, cliente_id, subtotal, igv, total, metodo_pago (ENUM), estado (ENUM), motivo_anulacion
    - Establecer relaciones con UsuarioEntity y ClienteEntity
    - _Requirements: 6.1, 12.1_

  - [ ] 0.7 Modificar OrderItemEntity a VentaItemEntity para tabla `venta_items`
    - Renombrar clase a VentaItemEntity
    - Cambiar nombre de tabla a `venta_items`
    - Agregar campos: producto_nombre, talla, precio_unitario, subtotal
    - Establecer relación con VentaEntity y ProductoEntity
    - _Requirements: 6.1, 12.4_

  - [ ] 0.8 Crear nueva entidad ComprobanteEntity para tabla `comprobantes`
    - Crear entidad con campos: venta_id, tipo (ENUM), serie, numero, numero_completo
    - Agregar campos de cliente: cliente_tipo_doc, cliente_numero_doc, cliente_nombre, cliente_direccion
    - Agregar campos de totales: subtotal, igv, total
    - Agregar constraint único (serie, numero)
    - _Requirements: 6.2, 6.3, 12.5_

  - [ ] 0.9 Crear nueva entidad MovimientoInventarioEntity para tabla `movimientos_inventario`
    - Crear entidad con campos: producto_id, talla, tipo (ENUM), cantidad, stock_anterior, stock_nuevo, motivo, usuario_id
    - Establecer relaciones con ProductoEntity y UsuarioEntity
    - _Requirements: 4.1, 11.6_

- [ ] 1. Checkpoint - Verificar entidades del backend
  - Ensure all entities compile correctly and match the database schema.

- [ ] 2. Actualizar repositorios del backend
  - [ ] 2.1 Actualizar UsuarioRepository
    - Agregar método findByEmail
    - Agregar método findByActivo
    - _Requirements: 1.1, 1.2_

  - [ ] 2.2 Actualizar CategoriaRepository
    - Agregar método findByParentId
    - Agregar método findByActivo
    - Agregar query para obtener árbol jerárquico
    - _Requirements: 2.5_

  - [ ] 2.3 Crear ProductoRepository (renombrar de ItemRepository)
    - Agregar método findByCodigo
    - Agregar método findByCodigoBarras
    - Agregar método findByCategoriaId
    - Agregar método findByActivo
    - _Requirements: 3.4, 3.5_

  - [ ] 2.4 Crear ProductoTallaRepository
    - Agregar método findByProductoId
    - Agregar método findByProductoIdAndTalla
    - _Requirements: 3.2_

  - [ ] 2.5 Crear ClienteRepository
    - Agregar método findByNumeroDocumento
    - Agregar método findByTipoDocumentoAndNumeroDocumento
    - _Requirements: 3.1_

  - [ ] 2.6 Crear VentaRepository (renombrar de OrderEntityRepository)
    - Agregar método findByNumero
    - Agregar método findByUsuarioId
    - Agregar método findByClienteId
    - Agregar método findByEstado
    - Agregar método findByCreatedAtBetween
    - _Requirements: 7.1_

  - [ ] 2.7 Crear ComprobanteRepository
    - Agregar método findByVentaId
    - Agregar método findBySerieAndNumero
    - Agregar método findLastByTipo (para correlativos)
    - _Requirements: 6.2, 6.6_

  - [ ] 2.8 Crear MovimientoInventarioRepository
    - Agregar método findByProductoId
    - Agregar método findByUsuarioId
    - Agregar método findByTipo
    - Agregar método findByCreatedAtBetween
    - _Requirements: 4.4_

- [ ] 3. Checkpoint - Verificar repositorios
  - Ensure all repositories compile and queries are correct.

- [ ] 4. Actualizar servicios del backend
  - [ ] 4.1 Actualizar UsuarioService
    - Adaptar métodos CRUD a nueva entidad
    - Mantener lógica de bloqueo por intentos fallidos
    - _Requirements: 1.1, 1.4, 1.5_

  - [ ] 4.2 Actualizar CategoriaService
    - Adaptar métodos CRUD a nueva entidad
    - Implementar lógica de jerarquía con parent_id
    - Implementar validación de eliminación (sin productos asociados)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 4.3 Crear ProductoService (renombrar de ItemService)
    - Adaptar métodos CRUD a nueva entidad
    - Implementar gestión de stock por tallas
    - Implementar búsqueda por código de barras
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 4.4 Crear ClienteService
    - Implementar métodos CRUD
    - Implementar búsqueda por documento
    - _Requirements: 3.1_

  - [ ] 4.5 Crear VentaService (renombrar de OrderService)
    - Adaptar métodos CRUD a nueva entidad
    - Implementar validación de stock antes de venta
    - Implementar decremento automático de inventario
    - Implementar anulación con reversión de inventario
    - _Requirements: 6.1, 4.2, 7.3_

  - [ ] 4.6 Crear ComprobanteService
    - Implementar generación de boletas
    - Implementar generación de facturas
    - Implementar generación de números correlativos
    - _Requirements: 6.2, 6.3_

  - [ ] 4.7 Crear InventarioService
    - Implementar registro de entradas de stock
    - Implementar registro de salidas de stock
    - Implementar consulta de movimientos
    - Implementar alertas de stock bajo
    - _Requirements: 4.1, 4.3, 4.4_

- [ ] 5. Checkpoint - Verificar servicios
  - Ensure all services compile and business logic is correct.

- [ ] 6. Actualizar controladores del backend
  - [ ] 6.1 Actualizar AuthController
    - Mantener endpoints de login/logout
    - Adaptar a nueva estructura de UsuarioEntity
    - _Requirements: 1.2, 1.3, 11.3, 11.4_

  - [ ] 6.2 Actualizar UsuarioController
    - Adaptar endpoints CRUD a nueva entidad
    - _Requirements: 1.1, 1.4, 1.5_

  - [ ] 6.3 Actualizar CategoriaController
    - Adaptar endpoints CRUD a nueva entidad
    - Agregar endpoint para obtener árbol jerárquico
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [ ] 6.4 Crear ProductoController (renombrar de ItemController)
    - Adaptar endpoints CRUD a nueva entidad
    - Agregar endpoint para gestión de tallas
    - Agregar endpoint de búsqueda por código de barras
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

  - [ ] 6.5 Crear ClienteController
    - Implementar endpoints CRUD
    - Implementar endpoint de búsqueda por documento
    - _Requirements: 3.1_

  - [ ] 6.6 Crear VentaController (renombrar de OrderController)
    - Adaptar endpoints CRUD a nueva entidad
    - Agregar endpoint de anulación
    - Agregar endpoint de filtros por fecha/usuario/estado
    - _Requirements: 6.1, 7.1, 7.3_

  - [ ] 6.7 Crear ComprobanteController
    - Implementar endpoint para generar boleta
    - Implementar endpoint para generar factura
    - Implementar endpoint para obtener comprobante por venta
    - _Requirements: 6.2, 6.3, 6.6_

  - [ ] 6.8 Crear InventarioController
    - Implementar endpoint para registrar entrada
    - Implementar endpoint para consultar movimientos
    - Implementar endpoint para productos con stock bajo
    - _Requirements: 4.1, 4.3, 4.4_

  - [ ] 6.9 Actualizar DashboardController
    - Adaptar queries a nuevas entidades
    - _Requirements: 8.1, 8.5_

- [ ] 7. Checkpoint - Verificar controladores y API
  - Ensure all endpoints work correctly with Postman or similar tool.

- [ ] 8. Actualizar DTOs (Request/Response)
  - [ ] 8.1 Actualizar UsuarioRequest y UsuarioResponse
    - Adaptar campos a nueva entidad
    - _Requirements: 1.1_

  - [ ] 8.2 Actualizar CategoriaRequest y CategoriaResponse
    - Agregar campo parentId
    - _Requirements: 2.1_

  - [ ] 8.3 Crear ProductoRequest y ProductoResponse (renombrar de Item*)
    - Adaptar campos a nueva entidad
    - Incluir lista de tallas con stock
    - _Requirements: 3.1, 3.2_

  - [ ] 8.4 Crear ClienteRequest y ClienteResponse
    - Definir campos según entidad
    - _Requirements: 3.1_

  - [ ] 8.5 Crear VentaRequest y VentaResponse (renombrar de Order*)
    - Adaptar campos a nueva entidad
    - Incluir items con talla
    - _Requirements: 6.1_

  - [ ] 8.6 Crear ComprobanteRequest y ComprobanteResponse
    - Definir campos según entidad
    - _Requirements: 6.2, 6.3_

  - [ ] 8.7 Crear MovimientoInventarioRequest y MovimientoInventarioResponse
    - Definir campos según entidad
    - _Requirements: 4.1_

- [ ] 9. Checkpoint Final Backend
  - Ensure all backend components work together correctly.
  - Test API endpoints with frontend integration.

## Fase 1: Configuración Base y Modelos (Frontend)

- [x] 10. Configurar estructura del proyecto y dependencias
  - [x] 1.1 Instalar dependencias necesarias (fast-check, uuid, bcryptjs, date-fns)
    - Agregar fast-check para property-based testing
    - Agregar uuid para generación de IDs
    - Agregar bcryptjs para hash de contraseñas
    - Agregar date-fns para manejo de fechas
    - _Requirements: Todas_

  - [x] 1.2 Crear estructura de carpetas según diseño
    - Crear carpetas: models, services, contexts, hooks, utils, views
    - Crear subcarpetas para cada módulo
    - _Requirements: Todas_

  - [x] 1.3 Configurar Vitest para testing
    - Crear vite.config.js con configuración de test
    - Crear setup de tests
    - _Requirements: Testing Strategy_

- [x] 2. Implementar modelos de datos y validación
  - [x] 2.1 Crear modelo User con validación Yup
    - Implementar schema de validación
    - Implementar funciones de serialización/deserialización
    - _Requirements: 1.1_

  - [x] 2.2 Crear modelo Product con validación Yup
    - Implementar schema de validación
    - Implementar funciones de serialización/deserialización
    - _Requirements: 3.1, 3.5, 3.6_

  - [ ]* 2.3 Write property test for Product serialization round-trip
    - **Property 6: Product Serialization Round-Trip**
    - **Validates: Requirements 3.5, 3.6**

  - [x] 2.4 Crear modelo Category con validación Yup
    - Implementar schema de validación
    - Implementar funciones para jerarquía
    - _Requirements: 2.1_

  - [x] 2.5 Crear modelo Sale con validación Yup
    - Implementar schema de validación
    - Implementar SaleItem schema
    - _Requirements: 6.1_

  - [x] 2.6 Crear modelo Invoice con validación Yup
    - Implementar schema de validación
    - Implementar funciones de serialización/deserialización
    - _Requirements: 6.2, 6.3_

  - [ ]* 2.7 Write property test for Invoice serialization round-trip
    - **Property 12: Invoice Serialization Round-Trip**
    - **Validates: Requirements 6.4, 6.5**

  - [ ]* 2.8 Write unit tests for model validations
    - Tests para validación de User
    - Tests para validación de Product
    - Tests para validación de Sale
    - _Requirements: 1.1, 3.1, 6.1_

- [ ] 3. Checkpoint - Verificar modelos
  - Ensure all tests pass, ask the user if questions arise.

## Fase 2: Servicios de Almacenamiento y Utilidades

- [x] 4. Implementar servicio de almacenamiento
  - [x] 4.1 Crear StorageService base con localStorage
    - Implementar métodos CRUD genéricos
    - Implementar manejo de colecciones
    - _Requirements: 3.5, 3.6_

  - [x] 4.2 Crear utilidades de cálculo
    - Implementar cálculo de subtotales
    - Implementar cálculo de impuestos
    - Implementar cálculo de totales
    - _Requirements: 5.3, 6.1_

  - [ ]* 4.3 Write property test for tax calculation accuracy
    - **Property 13: Invoice Tax Calculation**
    - **Validates: Requirements 6.2**

  - [x] 4.4 Crear utilidades de formateo
    - Implementar formateo de moneda
    - Implementar formateo de fechas
    - Implementar formateo de números correlativos
    - _Requirements: 6.2, 7.1_

  - [ ]* 4.5 Write unit tests for calculation utilities
    - Tests para cálculo de subtotales
    - Tests para cálculo de impuestos
    - _Requirements: 5.3, 6.1_

## Fase 3: Autenticación y Usuarios

- [x] 5. Implementar sistema de autenticación
  - [x] 5.1 Crear AuthContext con estado de usuario
    - Implementar provider con estado de autenticación
    - Implementar persistencia de sesión
    - _Requirements: 1.2_

  - [x] 5.2 Implementar UserService con CRUD
    - Crear usuario con hash de contraseña
    - Actualizar usuario
    - Desactivar usuario
    - Buscar usuarios
    - _Requirements: 1.1, 1.4, 1.5_

  - [ ]* 5.3 Write property test for user creation integrity
    - **Property 1: User Creation Integrity**
    - **Validates: Requirements 1.1**

  - [x] 5.4 Implementar login/logout en AuthContext
    - Validar credenciales
    - Generar token de sesión
    - Invalidar sesiones
    - _Requirements: 1.2, 1.3_

  - [ ]* 5.5 Write property test for authentication consistency
    - **Property 2: Authentication Consistency**
    - **Validates: Requirements 1.2, 1.3**

  - [x] 5.6 Implementar sistema de permisos por rol
    - Definir permisos por rol
    - Implementar hasPermission
    - Crear HOC/hook para proteger rutas
    - _Requirements: 1.6_

  - [ ]* 5.7 Write property test for role-based access control
    - **Property 3: Role-Based Access Control**
    - **Validates: Requirements 1.6**

  - [ ]* 5.8 Write unit tests for authentication
    - Tests para login exitoso
    - Tests para login fallido
    - Tests para logout
    - _Requirements: 1.2, 1.3_

- [x] 6. Crear vistas de autenticación
  - [x] 6.1 Crear página de Login
    - Formulario con email y contraseña
    - Validación de campos
    - Manejo de errores
    - _Requirements: 1.2, 1.3_

  - [x] 6.2 Crear página de gestión de usuarios (admin)
    - Listado de usuarios con filtros
    - Modal de crear/editar usuario
    - Acción de desactivar
    - _Requirements: 1.1, 1.4, 1.5_

- [ ] 7. Checkpoint - Verificar autenticación
  - Ensure all tests pass, ask the user if questions arise.

## Fase 4: Categorías y Productos

- [x] 8. Implementar gestión de categorías
  - [x] 8.1 Crear CategoryService con CRUD
    - Crear categoría con padre opcional
    - Actualizar categoría
    - Eliminar categoría (con validación)
    - Obtener árbol jerárquico
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 8.2 Write property test for category hierarchy integrity
    - **Property 4: Category Hierarchy Integrity**
    - **Validates: Requirements 2.5**

  - [ ]* 8.3 Write property test for category deletion safety
    - **Property 5: Category Deletion Safety**
    - **Validates: Requirements 2.3, 2.4**

  - [x] 8.4 Crear página de gestión de categorías
    - Vista de árbol jerárquico
    - Modal de crear/editar categoría
    - Confirmación de eliminación
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 9. Implementar gestión de productos
  - [x] 9.1 Crear ProductService con CRUD
    - Crear producto con validación
    - Actualizar producto con historial de precios
    - Desactivar producto
    - Buscar con filtros y paginación
    - Buscar por código de barras
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 9.2 Write property test for product search consistency
    - **Property 7: Product Search Consistency**
    - **Validates: Requirements 3.4**

  - [x] 9.3 Crear página de gestión de productos
    - Listado con filtros y paginación
    - Modal de crear/editar producto
    - Selector de categoría
    - Upload de imagen
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 9.4 Write unit tests for ProductService
    - Tests para crear producto
    - Tests para buscar productos
    - Tests para historial de precios
    - _Requirements: 3.1, 3.2, 3.4_

- [ ] 10. Checkpoint - Verificar productos y categorías
  - Ensure all tests pass, ask the user if questions arise.

## Fase 5: Inventario

- [ ] 11. Implementar gestión de inventario
  - [ ] 11.1 Crear InventoryService
    - Registrar entrada de stock
    - Registrar salida de stock
    - Consultar stock actual
    - Obtener movimientos con filtros
    - Obtener productos con stock bajo
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 11.2 Write property test for inventory balance invariant
    - **Property 8: Inventory Balance Invariant**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 11.3 Write property test for stock validation
    - **Property 9: Stock Validation**
    - **Validates: Requirements 4.5**

  - [ ] 11.4 Crear página de gestión de inventario
    - Listado de productos con stock
    - Modal de entrada de inventario
    - Historial de movimientos
    - Alertas de stock bajo
    - _Requirements: 4.1, 4.3, 4.4_

  - [ ]* 11.5 Write unit tests for InventoryService
    - Tests para entrada de stock
    - Tests para salida de stock
    - Tests para alertas de stock bajo
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 12. Checkpoint - Verificar inventario
  - Ensure all tests pass, ask the user if questions arise.

## Fase 6: Punto de Venta y Carrito

- [x] 13. Implementar carrito de compras
  - [x] 13.1 Crear CartContext
    - Estado de items del carrito
    - Agregar producto
    - Modificar cantidad
    - Eliminar producto
    - Limpiar carrito
    - Calcular totales
    - _Requirements: 5.3, 5.4, 5.5_

  - [ ]* 13.2 Write property test for cart calculation accuracy
    - **Property 10: Cart Calculation Accuracy**
    - **Validates: Requirements 5.3, 5.4, 5.5**

  - [ ]* 13.3 Write unit tests for CartContext
    - Tests para agregar items
    - Tests para modificar cantidades
    - Tests para cálculo de totales
    - _Requirements: 5.3, 5.4, 5.5_

- [x] 14. Crear interfaz de punto de venta
  - [x] 14.1 Crear página POS con grid de productos
    - Grid de productos por categoría
    - Barra de búsqueda
    - Filtro por categoría
    - _Requirements: 5.1, 5.2_

  - [x] 14.2 Crear componente de carrito lateral
    - Lista de items seleccionados
    - Controles de cantidad
    - Resumen de totales
    - Botón de checkout
    - _Requirements: 5.3, 5.4, 5.5_

- [ ] 15. Checkpoint - Verificar punto de venta
  - Ensure all tests pass, ask the user if questions arise.

## Fase 7: Ventas y Facturación

- [ ] 16. Implementar proceso de venta
  - [x] 16.1 Crear SalesService
    - Crear venta con validación de stock
    - Decrementar inventario automáticamente
    - Generar número correlativo
    - Buscar ventas con filtros
    - Anular venta con reversión de inventario
    - _Requirements: 6.1, 4.2, 7.1, 7.3_

  - [ ]* 16.2 Write property test for sale transaction integrity
    - **Property 11: Sale Transaction Integrity**
    - **Validates: Requirements 6.1, 4.2**

  - [ ]* 16.3 Write property test for sale cancellation reversal
    - **Property 14: Sale Cancellation Reversal**
    - **Validates: Requirements 7.3**

  - [ ]* 16.4 Write property test for sales filter accuracy
    - **Property 15: Sales Filter Accuracy**
    - **Validates: Requirements 7.1, 8.3**

- [ ] 17. Implementar generación de comprobantes
  - [ ] 17.1 Crear InvoiceService
    - Generar boleta
    - Generar factura
    - Obtener comprobante por ID
    - _Requirements: 6.2, 6.3, 6.6_

  - [ ] 17.2 Integrar checkout con generación de comprobante
    - Modal de selección de tipo de comprobante
    - Formulario de datos de cliente (para factura)
    - Confirmación de venta
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 17.3 Write unit tests for SalesService
    - Tests para crear venta
    - Tests para anular venta
    - Tests para generar comprobante
    - _Requirements: 6.1, 7.3_

- [ ] 18. Crear página de historial de ventas
  - [ ] 18.1 Implementar listado de ventas
    - Tabla con filtros por fecha, vendedor, estado
    - Paginación
    - _Requirements: 7.1_

  - [ ] 18.2 Implementar detalle de venta
    - Modal con información completa
    - Opción de reimprimir
    - Opción de anular (admin)
    - _Requirements: 7.2, 7.3, 6.6_

  - [ ] 18.3 Implementar exportación de ventas
    - Exportar a CSV
    - Exportar a Excel
    - _Requirements: 7.4_

- [ ] 19. Checkpoint - Verificar ventas y facturación
  - Ensure all tests pass, ask the user if questions arise.

## Fase 8: Dashboard y Métricas

- [ ] 20. Implementar servicio de métricas
  - [ ] 20.1 Crear MetricsService
    - Calcular ventas por período
    - Calcular productos más vendidos
    - Calcular ventas por categoría
    - Calcular promedios y comparativas
    - _Requirements: 8.1, 8.5_

  - [ ]* 20.2 Write property test for metrics calculation accuracy
    - **Property 16: Metrics Calculation Accuracy**
    - **Validates: Requirements 8.5**

- [ ] 21. Crear dashboard
  - [ ] 21.1 Implementar widgets de resumen
    - Ventas del día
    - Ventas de la semana
    - Ventas del mes
    - Comparativa con período anterior
    - _Requirements: 8.1_

  - [ ] 21.2 Implementar gráficos con ApexCharts
    - Gráfico de ventas por período
    - Gráfico de productos más vendidos
    - Gráfico de ventas por categoría
    - _Requirements: 8.2_

  - [ ] 21.3 Implementar selector de rango de fechas
    - DatePicker para rango
    - Actualización de todos los gráficos
    - _Requirements: 8.3_

  - [ ] 21.4 Implementar alertas en dashboard
    - Indicador de productos con stock bajo
    - Lista de alertas activas
    - _Requirements: 8.4_

  - [ ]* 21.5 Write unit tests for MetricsService
    - Tests para cálculo de totales
    - Tests para productos más vendidos
    - _Requirements: 8.5_

- [ ] 22. Checkpoint - Verificar dashboard
  - Ensure all tests pass, ask the user if questions arise.

## Fase 9: Reportes

- [ ] 23. Implementar generación de reportes
  - [ ] 23.1 Crear ReportService
    - Generar reporte de ventas
    - Generar reporte de inventario
    - Generar reporte de productos más vendidos
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 23.2 Write property test for report data consistency
    - **Property 17: Report Data Consistency**
    - **Validates: Requirements 9.1**

  - [ ] 23.3 Implementar exportación de reportes
    - Exportar a PDF
    - Exportar a Excel
    - Exportar a CSV
    - _Requirements: 9.4, 9.5_

- [ ] 24. Crear página de reportes
  - [ ] 24.1 Implementar interfaz de reportes
    - Selector de tipo de reporte
    - Filtros por período
    - Vista previa de reporte
    - Botones de exportación
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 24.2 Write unit tests for ReportService
    - Tests para generación de reportes
    - Tests para exportación
    - _Requirements: 9.1, 9.4_

- [ ] 25. Checkpoint - Verificar reportes
  - Ensure all tests pass, ask the user if questions arise.

## Fase 10: Impresión de Comprobantes

- [ ] 26. Implementar servicio de impresión
  - [ ] 26.1 Crear PrintService
    - Generar formato térmico (58mm/80mm)
    - Generar formato A4 PDF
    - Vista previa de comprobante
    - _Requirements: 10.1, 10.3, 10.4_

  - [ ]* 26.2 Write property test for print format compliance
    - **Property 18: Print Format Compliance**
    - **Validates: Requirements 10.3**

  - [ ] 26.3 Implementar configuración de impresión
    - Configurar logo de empresa
    - Configurar datos de empresa
    - Configurar pie de página
    - Seleccionar ancho de papel térmico
    - _Requirements: 10.2_

- [ ] 27. Integrar impresión en flujo de venta
  - [ ] 27.1 Agregar botón de imprimir en checkout
    - Selector de formato (térmico/A4)
    - Vista previa antes de imprimir
    - Fallback a PDF si impresora no disponible
    - _Requirements: 10.1, 10.5_

  - [ ] 27.2 Agregar reimpresión en historial de ventas
    - Botón de reimprimir en detalle de venta
    - Selector de formato
    - _Requirements: 6.6_

  - [ ]* 27.3 Write unit tests for PrintService
    - Tests para formato térmico
    - Tests para formato A4
    - _Requirements: 10.1, 10.3, 10.4_

## Fase 11: Navegación y Menú

- [-] 28. Configurar navegación del sistema
  - [x] 28.1 Actualizar menu-items.jsx
    - Agregar items para todos los módulos
    - Configurar iconos
    - Configurar permisos por rol
    - _Requirements: 1.6_

  - [x] 28.2 Actualizar routes.jsx
    - Configurar rutas para todas las páginas
    - Implementar rutas protegidas
    - _Requirements: 1.6_

  - [ ] 28.3 Implementar layout con sidebar actualizado
    - Mostrar/ocultar items según rol
    - Indicadores de alertas en menú
    - _Requirements: 1.6, 8.4_

- [ ] 29. Checkpoint Final
  - Ensure all tests pass, ask the user if questions arise.
