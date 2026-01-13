# Requirements Document

## Introduction

Sistema de Facturación Electrónica completo para una tienda de poleras. El sistema consta de:
- **Frontend**: React basado en la plantilla Gradient Able
- **Backend**: Spring Boot con API REST
- **Base de datos**: MySQL

El sistema permitirá gestionar usuarios, productos con tallas, categorías jerárquicas, clientes, inventarios, ventas, y generar boletas/facturas electrónicas con reportes y dashboard analítico.

## Glossary

- **Sistema**: La aplicación de facturación electrónica (frontend + backend + base de datos)
- **Usuario**: Persona que interactúa con el sistema (administrador, vendedor, cajero)
- **Producto**: Polera que se puede vender, con variantes por talla
- **Talla**: Variante de tamaño de un producto (XS, S, M, L, XL, XXL)
- **Categoría**: Clasificación jerárquica de productos (Hombre, Dama, Niño, Niña, Unisex)
- **Cliente**: Persona o empresa que realiza compras (con documento de identidad)
- **Inventario**: Stock disponible de productos por talla
- **Venta**: Transacción comercial registrada
- **Boleta**: Documento tributario para consumidor final
- **Factura**: Documento tributario para empresas (requiere RUC)
- **Comprobante**: Documento fiscal generado (boleta o factura)
- **Dashboard**: Panel de control con métricas y gráficos
- **Reporte**: Documento generado con información consolidada
- **IGV**: Impuesto General a las Ventas (18% en Perú)

## Requirements

### Requirement 1: Gestión de Usuarios

**User Story:** Como administrador, quiero gestionar usuarios del sistema, para controlar el acceso y permisos de cada persona.

#### Acceptance Criteria

1. WHEN un administrador crea un nuevo usuario THEN el Sistema SHALL registrar el usuario con nombre, email, contraseña encriptada y rol asignado
2. WHEN un usuario intenta iniciar sesión con credenciales válidas THEN el Sistema SHALL autenticar al usuario y generar un token de sesión
3. WHEN un usuario intenta iniciar sesión con credenciales inválidas THEN el Sistema SHALL rechazar el acceso y mostrar mensaje de error
4. WHEN un administrador modifica los datos de un usuario THEN el Sistema SHALL actualizar la información y registrar la fecha de modificación
5. WHEN un administrador desactiva un usuario THEN el Sistema SHALL marcar el usuario como inactivo e invalidar sus sesiones activas
6. WHERE el sistema tiene roles definidos (admin, vendedor, cajero) THEN el Sistema SHALL restringir funcionalidades según el rol del usuario autenticado

### Requirement 2: Gestión de Categorías

**User Story:** Como administrador, quiero gestionar categorías de productos, para organizar el catálogo de manera jerárquica.

#### Acceptance Criteria

1. WHEN un administrador crea una categoría THEN el Sistema SHALL registrar la categoría con nombre, descripción y categoría padre opcional
2. WHEN un administrador modifica una categoría THEN el Sistema SHALL actualizar los datos y mantener las relaciones con productos existentes
3. WHEN un administrador elimina una categoría sin productos asociados THEN el Sistema SHALL remover la categoría del sistema
4. IF un administrador intenta eliminar una categoría con productos asociados THEN el Sistema SHALL rechazar la eliminación y mostrar mensaje informativo
5. WHEN un usuario consulta categorías THEN el Sistema SHALL retornar la estructura jerárquica completa con conteo de productos por categoría

### Requirement 3: Gestión de Productos

**User Story:** Como administrador, quiero gestionar productos del catálogo, para mantener actualizada la información de poleras disponibles.

#### Acceptance Criteria

1. WHEN un administrador crea un producto THEN el Sistema SHALL registrar código, código de barras, nombre, descripción, precio, costo, categoría, color e imagen
2. WHEN un administrador asigna stock a un producto THEN el Sistema SHALL registrar la cantidad por cada talla disponible (XS, S, M, L, XL, XXL)
3. WHEN un administrador modifica un producto THEN el Sistema SHALL actualizar la información y registrar historial de cambios de precio
4. WHEN un administrador desactiva un producto THEN el Sistema SHALL marcar el producto como inactivo sin eliminarlo del historial de ventas
5. WHEN un usuario busca productos THEN el Sistema SHALL filtrar por nombre, código, código de barras, categoría o estado con paginación
6. WHEN se serializa un producto para almacenamiento THEN el Sistema SHALL codificar los datos en formato JSON válido
7. WHEN se deserializa un producto desde almacenamiento THEN el Sistema SHALL reconstruir el objeto producto con todos sus atributos

### Requirement 3.1: Gestión de Clientes

**User Story:** Como vendedor, quiero registrar datos de clientes, para generar facturas con información fiscal correcta.

#### Acceptance Criteria

1. WHEN un usuario registra un cliente THEN el Sistema SHALL almacenar tipo de documento (DNI, RUC, CE, Pasaporte), número de documento, nombre, dirección, teléfono y email
2. WHEN un usuario busca un cliente por documento THEN el Sistema SHALL retornar los datos del cliente si existe
3. WHEN un usuario modifica datos de un cliente THEN el Sistema SHALL actualizar la información y registrar fecha de modificación
4. WHEN se genera una factura THEN el Sistema SHALL requerir datos de cliente con RUC válido
5. WHEN se genera una boleta THEN el Sistema SHALL permitir cliente opcional o consumidor final

### Requirement 4: Gestión de Inventario

**User Story:** Como administrador, quiero controlar el inventario de productos, para conocer el stock disponible y recibir alertas de reposición.

#### Acceptance Criteria

1. WHEN un administrador registra entrada de inventario THEN el Sistema SHALL incrementar el stock del producto y registrar fecha, cantidad y motivo
2. WHEN se realiza una venta THEN el Sistema SHALL decrementar automáticamente el stock de los productos vendidos
3. WHILE el stock de un producto está por debajo del mínimo configurado THEN el Sistema SHALL mostrar alerta visual en el dashboard
4. WHEN un administrador consulta movimientos de inventario THEN el Sistema SHALL mostrar historial con filtros por producto, fecha y tipo de movimiento
5. IF se intenta vender un producto con stock insuficiente THEN el Sistema SHALL rechazar la operación y notificar al usuario

### Requirement 5: Exploración de Productos (Punto de Venta)

**User Story:** Como vendedor, quiero explorar y seleccionar productos rápidamente, para agilizar el proceso de venta.

#### Acceptance Criteria

1. WHEN un vendedor accede al punto de venta THEN el Sistema SHALL mostrar productos organizados por categorías con imágenes y precios
2. WHEN un vendedor busca un producto por código de barras THEN el Sistema SHALL localizar y mostrar el producto en menos de 500 milisegundos
3. WHEN un vendedor agrega un producto al carrito THEN el Sistema SHALL actualizar el total y mostrar detalle de items seleccionados
4. WHEN un vendedor modifica la cantidad de un producto en el carrito THEN el Sistema SHALL recalcular subtotales y total
5. WHEN un vendedor elimina un producto del carrito THEN el Sistema SHALL remover el item y actualizar totales

### Requirement 6: Proceso de Venta y Facturación

**User Story:** Como cajero, quiero procesar ventas y generar comprobantes, para completar transacciones comerciales legalmente válidas.

#### Acceptance Criteria

1. WHEN un cajero confirma una venta THEN el Sistema SHALL registrar la transacción con fecha, hora, usuario, cliente, productos, subtotal, impuestos y total
2. WHEN se genera una boleta THEN el Sistema SHALL crear documento con número correlativo, datos del emisor, detalle de productos e impuestos calculados
3. WHEN se genera una factura THEN el Sistema SHALL incluir datos fiscales del cliente (RUC/NIT, razón social, dirección)
4. WHEN se serializa un comprobante para impresión THEN el Sistema SHALL formatear los datos según plantilla configurable
5. WHEN se deserializa un comprobante almacenado THEN el Sistema SHALL reconstruir el documento con todos sus campos originales
6. WHEN un usuario solicita reimprimir un comprobante THEN el Sistema SHALL recuperar y formatear el documento original
7. IF el proceso de venta falla por error de sistema THEN el Sistema SHALL revertir cambios de inventario y notificar al usuario

### Requirement 7: Historial de Ventas

**User Story:** Como administrador, quiero consultar el historial de ventas, para analizar el desempeño comercial y auditar transacciones.

#### Acceptance Criteria

1. WHEN un usuario consulta ventas THEN el Sistema SHALL mostrar listado con filtros por fecha, vendedor, cliente y estado
2. WHEN un usuario selecciona una venta THEN el Sistema SHALL mostrar detalle completo con productos, cantidades, precios y comprobante asociado
3. WHEN un administrador anula una venta THEN el Sistema SHALL marcar como anulada, revertir inventario y registrar motivo de anulación
4. WHEN un usuario exporta ventas THEN el Sistema SHALL generar archivo en formato seleccionado (CSV, Excel, PDF)

### Requirement 8: Dashboard y Gráficos

**User Story:** Como administrador, quiero visualizar métricas en un dashboard, para tomar decisiones basadas en datos del negocio.

#### Acceptance Criteria

1. WHEN un usuario accede al dashboard THEN el Sistema SHALL mostrar resumen de ventas del día, semana y mes actual
2. WHEN el dashboard carga datos THEN el Sistema SHALL renderizar gráficos de ventas por período, productos más vendidos y categorías
3. WHEN un usuario selecciona un rango de fechas THEN el Sistema SHALL actualizar todos los gráficos con datos del período seleccionado
4. WHILE hay alertas activas (stock bajo, ventas pendientes) THEN el Sistema SHALL mostrar indicadores visuales en el dashboard
5. WHEN se calculan métricas THEN el Sistema SHALL procesar datos de ventas y retornar totales, promedios y comparativas

### Requirement 9: Reportes

**User Story:** Como administrador, quiero generar reportes detallados, para análisis financiero y cumplimiento tributario.

#### Acceptance Criteria

1. WHEN un usuario genera reporte de ventas THEN el Sistema SHALL consolidar transacciones por período con totales y desglose de impuestos
2. WHEN un usuario genera reporte de inventario THEN el Sistema SHALL listar productos con stock actual, valorización y movimientos
3. WHEN un usuario genera reporte de productos más vendidos THEN el Sistema SHALL ordenar por cantidad o monto con filtros de período
4. WHEN se genera un reporte THEN el Sistema SHALL permitir exportación en formatos PDF, Excel y CSV
5. WHEN se serializa un reporte para exportación THEN el Sistema SHALL estructurar los datos según el formato destino seleccionado

### Requirement 10: Impresión de Comprobantes

**User Story:** Como cajero, quiero imprimir boletas y facturas, para entregar comprobantes físicos a los clientes.

#### Acceptance Criteria

1. WHEN un cajero solicita imprimir comprobante THEN el Sistema SHALL generar documento formateado para impresora térmica o estándar
2. WHEN se configura formato de impresión THEN el Sistema SHALL permitir personalizar logo, datos de empresa y pie de página
3. WHEN se imprime en formato térmico THEN el Sistema SHALL ajustar el ancho a 58mm o 80mm según configuración
4. WHEN se imprime en formato A4 THEN el Sistema SHALL generar PDF con diseño profesional para impresora estándar
5. IF la impresora no está disponible THEN el Sistema SHALL mostrar vista previa del comprobante y opción de guardar PDF


### Requirement 11: Backend API REST

**User Story:** Como desarrollador, quiero que el backend Spring Boot exponga APIs REST, para que el frontend pueda consumir datos de la base de datos MySQL.

#### Acceptance Criteria

1. WHEN el frontend solicita datos THEN el Backend SHALL responder con JSON estructurado según los modelos definidos
2. WHEN el frontend envía datos para crear o actualizar THEN el Backend SHALL validar los datos y persistir en la base de datos MySQL
3. WHEN un usuario se autentica THEN el Backend SHALL generar un token JWT válido por tiempo configurable
4. WHEN el frontend envía un token JWT válido THEN el Backend SHALL autorizar el acceso a los endpoints protegidos
5. IF el token JWT es inválido o expirado THEN el Backend SHALL rechazar la solicitud con código 401
6. WHEN se realizan operaciones de inventario THEN el Backend SHALL registrar movimientos en la tabla movimientos_inventario
7. WHEN se genera un comprobante THEN el Backend SHALL almacenar en la tabla comprobantes con número correlativo único

### Requirement 12: Estructura de Base de Datos

**User Story:** Como desarrollador, quiero que la base de datos MySQL tenga la estructura correcta, para almacenar todos los datos del sistema de facturación.

#### Acceptance Criteria

1. WHEN se inicializa la base de datos THEN el Sistema SHALL crear las tablas: usuarios, categorias, productos, producto_tallas, clientes, ventas, venta_items, comprobantes, movimientos_inventario
2. WHEN se crea un producto THEN el Sistema SHALL permitir asociar múltiples registros de tallas con stock independiente
3. WHEN se crea una categoría THEN el Sistema SHALL permitir referenciar una categoría padre para jerarquía
4. WHEN se registra una venta THEN el Sistema SHALL almacenar la talla seleccionada en cada item de venta
5. WHEN se genera un comprobante THEN el Sistema SHALL garantizar unicidad de serie y número correlativo
