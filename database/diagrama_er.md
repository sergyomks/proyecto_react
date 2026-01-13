# Diagrama Entidad-Relación - Sistema de Facturación

## Diagrama de Tablas

```mermaid
erDiagram
    USUARIOS {
        bigint id PK
        varchar nombre
        varchar email UK
        varchar password
        enum rol
        boolean activo
        int intentos_fallidos
        boolean cuenta_bloqueada
        datetime bloqueo_hasta
        datetime ultimo_login
        datetime created_at
        datetime updated_at
    }

    CATEGORIAS {
        bigint id PK
        varchar nombre
        varchar descripcion
        bigint parent_id FK
        boolean activo
        datetime created_at
        datetime updated_at
    }

    PRODUCTOS {
        bigint id PK
        varchar codigo UK
        varchar codigo_barras UK
        varchar nombre
        text descripcion
        bigint categoria_id FK
        decimal precio
        decimal costo
        varchar color
        varchar imagen_url
        int stock_minimo
        boolean activo
        datetime created_at
        datetime updated_at
    }

    PRODUCTO_TALLAS {
        bigint id PK
        bigint producto_id FK
        enum talla
        int stock
        datetime created_at
        datetime updated_at
    }

    CLIENTES {
        bigint id PK
        enum tipo_documento
        varchar numero_documento UK
        varchar nombre
        varchar direccion
        varchar telefono
        varchar email
        boolean activo
        datetime created_at
        datetime updated_at
    }

    VENTAS {
        bigint id PK
        varchar numero UK
        bigint usuario_id FK
        bigint cliente_id FK
        decimal subtotal
        decimal igv
        decimal total
        enum metodo_pago
        enum estado
        varchar motivo_anulacion
        datetime created_at
    }

    VENTA_ITEMS {
        bigint id PK
        bigint venta_id FK
        bigint producto_id FK
        varchar producto_nombre
        varchar talla
        int cantidad
        decimal precio_unitario
        decimal subtotal
    }

    COMPROBANTES {
        bigint id PK
        bigint venta_id FK UK
        enum tipo
        varchar serie
        varchar numero
        varchar numero_completo
        varchar cliente_tipo_doc
        varchar cliente_numero_doc
        varchar cliente_nombre
        varchar cliente_direccion
        decimal subtotal
        decimal igv
        decimal total
        datetime created_at
    }

    MOVIMIENTOS_INVENTARIO {
        bigint id PK
        bigint producto_id FK
        varchar talla
        enum tipo
        int cantidad
        int stock_anterior
        int stock_nuevo
        varchar motivo
        bigint usuario_id FK
        datetime created_at
    }

    CATEGORIAS ||--o{ CATEGORIAS : "parent"
    CATEGORIAS ||--o{ PRODUCTOS : "tiene"
    PRODUCTOS ||--o{ PRODUCTO_TALLAS : "tiene"
    PRODUCTOS ||--o{ VENTA_ITEMS : "vendido_en"
    PRODUCTOS ||--o{ MOVIMIENTOS_INVENTARIO : "tiene"
    USUARIOS ||--o{ VENTAS : "realiza"
    USUARIOS ||--o{ MOVIMIENTOS_INVENTARIO : "registra"
    CLIENTES ||--o{ VENTAS : "compra"
    VENTAS ||--o{ VENTA_ITEMS : "contiene"
    VENTAS ||--|| COMPROBANTES : "genera"
```

## Resumen de Tablas

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Usuarios del sistema con seguridad de bloqueo |
| `categorias` | Categorías jerárquicas (Hombre, Dama, Niño, etc.) |
| `productos` | Catálogo de poleras |
| `producto_tallas` | Stock por talla (XS, S, M, L, XL, XXL) |
| `clientes` | Clientes para facturas |
| `ventas` | Transacciones de venta |
| `venta_items` | Detalle de productos vendidos |
| `comprobantes` | Boletas y facturas |
| `movimientos_inventario` | Historial de stock |

## Atributos de Seguridad (usuarios)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `intentos_fallidos` | INT | Contador de intentos fallidos |
| `cuenta_bloqueada` | BOOLEAN | Si la cuenta está bloqueada |
| `bloqueo_hasta` | DATETIME | Fecha/hora hasta cuando está bloqueada |
| `ultimo_login` | DATETIME | Último acceso exitoso |

**Lógica de bloqueo:**
- Después de 3 intentos fallidos → bloqueo por 15 minutos
- `bloqueo_hasta = NOW() + 15 minutos`
- Al login exitoso → `intentos_fallidos = 0`, `cuenta_bloqueada = false`

## Enums

```java
// Rol de usuario
enum Rol { ADMIN, VENDEDOR, CAJERO }

// Tallas
enum Talla { XS, S, M, L, XL, XXL }

// Tipo documento
enum TipoDocumento { DNI, RUC, CE, PASAPORTE }

// Método de pago
enum MetodoPago { EFECTIVO, TARJETA, TRANSFERENCIA, YAPE, PLIN }

// Estado venta
enum EstadoVenta { COMPLETADA, ANULADA }

// Tipo comprobante
enum TipoComprobante { BOLETA, FACTURA }

// Tipo movimiento
enum TipoMovimiento { ENTRADA, SALIDA, AJUSTE, VENTA, ANULACION }
```
