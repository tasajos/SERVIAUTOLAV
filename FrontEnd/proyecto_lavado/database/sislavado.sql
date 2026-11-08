CREATE DATABASE IF NOT EXISTS sislavado;
USE sislavado;

CREATE TABLE IF NOT EXISTS vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(20) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    hora_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
    hora_salida DATETIME NULL,
    estado ENUM('activo', 'finalizado') DEFAULT 'activo',
    costo_total DECIMAL(10, 2) DEFAULT 0.00
);
