-- =====================================================
-- SISTEMA DE FACTURACIÓN - TIENDA DE POLERAS
-- MySQL para Spring Boot
-- =====================================================

DROP DATABASE IF EXISTS tienda_poleras;
CREATE DATABASE tienda_poleras CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tienda_poleras;

-- =====================================================
-- TABLA: usuarios
-- =====================================================
CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('ADMIN', 'VENDEDOR', 'CAJERO') NOT NULL DEFAULT 'VENDEDOR',
    activo BOOLEAN DEFAULT TRUE,
    
    -- Seguridad: bloqueo por intentos fallidos
    intentos_fallidos INT DEFAULT 0,
    cuenta_bloqueada BOOLEAN DEFAULT FALSE,
    bloqueo_hasta DATETIME NULL,
    ultimo_login DATETIME NULL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: categorias
-- =====================================================
CREATE TABLE categorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(300),
    parent_id BIGINT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: productos
-- =====================================================
CREATE TABLE productos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    codigo_barras VARCHAR(50) UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria_id BIGINT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    costo DECIMAL(10,2),
    color VARCHAR(50),
    imagen_url VARCHAR(500),
    stock_minimo INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: producto_tallas
-- =====================================================
CREATE TABLE producto_tallas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    talla ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL') NOT NULL,
    stock INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    UNIQUE KEY uk_producto_talla (producto_id, talla)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: clientes
-- =====================================================
CREATE TABLE clientes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo_documento ENUM('DNI', 'RUC', 'CE', 'PASAPORTE') NOT NULL,
    numero_documento VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    direccion VARCHAR(300),
    telefono VARCHAR(20),
    email VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- =====================================================
-- TABLA: ventas
-- =====================================================
CREATE TABLE ventas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(20) NOT NULL UNIQUE,
    usuario_id BIGINT NOT NULL,
    cliente_id BIGINT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    igv DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'YAPE', 'PLIN') NOT NULL,
    estado ENUM('COMPLETADA', 'ANULADA') DEFAULT 'COMPLETADA',
    motivo_anulacion VARCHAR(300),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: venta_items
-- =====================================================
CREATE TABLE venta_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    venta_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    producto_nombre VARCHAR(200) NOT NULL,
    talla VARCHAR(10),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: comprobantes
-- =====================================================
CREATE TABLE comprobantes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    venta_id BIGINT NOT NULL UNIQUE,
    tipo ENUM('BOLETA', 'FACTURA') NOT NULL,
    serie VARCHAR(10) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    numero_completo VARCHAR(30) NOT NULL,
    
    -- Cliente (para factura)
    cliente_tipo_doc VARCHAR(20),
    cliente_numero_doc VARCHAR(20),
    cliente_nombre VARCHAR(200),
    cliente_direccion VARCHAR(300),
    
    subtotal DECIMAL(10,2) NOT NULL,
    igv DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    UNIQUE KEY uk_serie_numero (serie, numero)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: movimientos_inventario
-- =====================================================
CREATE TABLE movimientos_inventario (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    talla VARCHAR(10),
    tipo ENUM('ENTRADA', 'SALIDA', 'AJUSTE', 'VENTA', 'ANULACION') NOT NULL,
    cantidad INT NOT NULL,
    stock_anterior INT NOT NULL,
    stock_nuevo INT NOT NULL,
    motivo VARCHAR(300),
    usuario_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- =====================================================
-- INDICES
-- =====================================================
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_ventas_fecha ON ventas(created_at);
CREATE INDEX idx_ventas_estado ON ventas(estado);
CREATE INDEX idx_ventas_usuario ON ventas(usuario_id);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Categorías
INSERT INTO categorias (nombre, descripcion) VALUES 
('Hombre', 'Poleras para hombre'),
('Dama', 'Poleras para dama'),
('Niño', 'Poleras para niños'),
('Niña', 'Poleras para niñas'),
('Unisex', 'Poleras unisex');

-- Usuario admin (password: admin123 - BCrypt)
INSERT INTO usuarios (nombre, email, password, rol) VALUES 
('Administrador', 'admin@sistema.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQlLBgXGlmBLG8Gxl5rXylLq1Ky.', 'ADMIN');
