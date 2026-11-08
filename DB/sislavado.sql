-- ========================================================
-- Script de Creación y Configuración de Base de Datos
-- Proyecto: SERVIAUTOLAV
-- Servidor MySQL: 192.168.1.208
-- Servidor Backend autorizado: 192.168.1.209
-- ========================================================

-- 1. Crear Base de Datos
CREATE DATABASE IF NOT EXISTS sislavado 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 2. Crear Usuario y Asignar Permisos para el Backend (192.168.1.209)
-- NOTA: Si deseas cambiar la contraseña, cámbiala aquí y en el archivo Backend/.env
CREATE USER IF NOT EXISTS 'sislavado_user'@'%' IDENTIFIED BY 'sislavado_pass_123';
GRANT ALL PRIVILEGES ON sislavado.* TO 'sislavado_user'@'%';

CREATE USER IF NOT EXISTS 'sislavado_user'@'192.168.1.209' IDENTIFIED BY 'sislavado_pass_123';
GRANT ALL PRIVILEGES ON sislavado.* TO 'sislavado_user'@'192.168.1.209';

FLUSH PRIVILEGES;

-- 3. Usar la base de datos
USE sislavado;

-- 4. Crear Tabla vehiculos
CREATE TABLE IF NOT EXISTS vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(20) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    hora_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
    hora_salida DATETIME NULL,
    estado ENUM('activo', 'finalizado') DEFAULT 'activo',
    costo_total DECIMAL(10, 2) DEFAULT 0.00
);

-- 5. Registro de prueba inicial (opcional)
INSERT INTO vehiculos (placa, tipo, hora_entrada, estado) 
SELECT 'ABC-123', 'Sedán', NOW(), 'activo'
WHERE NOT EXISTS (SELECT 1 FROM vehiculos LIMIT 1);
