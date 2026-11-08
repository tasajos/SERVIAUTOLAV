@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

echo Creando estructura de carpetas...
mkdir "proyecto_lavado\database" 2>nul
mkdir "proyecto_lavado\backend\src\controllers" 2>nul
mkdir "proyecto_lavado\backend\src\routes" 2>nul
mkdir "proyecto_lavado\frontend\src\components" 2>nul
mkdir "proyecto_lavado\frontend\src\services" 2>nul

cd proyecto_lavado

echo Generando archivos de base de datos...
(
echo CREATE DATABASE IF NOT EXISTS sislavado;
echo USE sislavado;
echo.
echo CREATE TABLE IF NOT EXISTS vehiculos ^(
echo     id INT AUTO_INCREMENT PRIMARY KEY,
echo     placa VARCHAR^(20^) NOT NULL,
echo     tipo VARCHAR^(50^) NOT NULL,
echo     hora_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
echo     hora_salida DATETIME NULL,
echo     estado ENUM^('activo', 'finalizado'^) DEFAULT 'activo',
echo     costo_total DECIMAL^(10, 2^) DEFAULT 0.00
echo ^);
) > database\sislavado.sql

echo Generando archivos del backend...

> backend\package.json (
echo {
echo   "name": "backend-lavado",
echo   "version": "1.0.0",
echo   "main": "dist/index.js",
echo   "scripts": {
echo     "dev": "ts-node-dev src/index.ts",
echo     "build": "tsc"
echo   },
echo   "dependencies": {
echo     "express": "^4.18.2",
echo     "mysql2": "^3.6.0",
echo     "cors": "^2.8.5",
echo     "dotenv": "^16.3.1"
echo   },
echo   "devDependencies": {
echo     "@types/express": "^4.17.17",
echo     "@types/cors": "^2.8.13",
echo     "@types/node": "^20.4.5",
echo     "typescript": "^5.1.6",
echo     "ts-node-dev": "^2.0.0"
echo   }
echo }
)

> backend\tsconfig.json (
echo {
echo   "compilerOptions": {
echo     "target": "ES2020",
echo     "module": "commonjs",
echo     "outDir": "./dist",
echo     "rootDir": "./src",
echo     "strict": true,
echo     "esModuleInterop": true,
echo     "skipLibCheck": true,
echo     "forceConsistentCasingInFileNames": true
echo   }
echo }
)

> backend\.env (
echo DB_HOST=localhost
echo DB_USER=root
echo DB_PASSWORD=
echo DB_NAME=sislavado
echo PORT=3000
echo TARIFA_HORA=5.00
)

> backend\src\db.ts (
echo import mysql from 'mysql2/promise';
echo import dotenv from 'dotenv';
echo dotenv.config^(^);
echo.
echo export const pool = mysql.createPool^({
echo   host: process.env.DB_HOST,
echo   user: process.env.DB_USER,
echo   password: process.env.DB_PASSWORD,
echo   database: process.env.DB_NAME,
echo   waitForConnections: true,
echo   connectionLimit: 10,
echo   queueLimit: 0
echo ^});
)

> backend\src\controllers\vehiculoController.ts (
echo import { Request, Response } from 'express';
echo import { pool } from '../db';
echo.
echo export const registrarIngreso = async ^(req: Request, res: Response^) =^> {
echo   try {
echo     const { placa, tipo } = req.body;
echo     const [result] = await pool.query^(
echo       'INSERT INTO vehiculos ^(placa, tipo, hora_entrada, estado^) VALUES ^(?, ?, NOW^(^), "activo"^)',
echo       [placa, tipo]
echo     ^);
echo     res.status^(201^).json^({ message: 'Vehiculo registrado', data: result ^});
echo   } catch ^(error^) {
echo     res.status^(500^).json^({ error: 'Error al registrar ingreso' ^});
echo   }
echo };
echo.
echo export const obtenerActivos = async ^(req: Request, res: Response^) =^> {
echo   try {
echo     const [rows] = await pool.query^('SELECT * FROM vehiculos WHERE estado = "activo"'^);
echo     res.json^(rows^);
echo   } catch ^(error^) {
echo     res.status^(500^).json^({ error: 'Error al obtener vehiculos' ^});
echo   }
echo };
echo.
echo export const registrarSalida = async ^(req: Request, res: Response^) =^> {
echo   try {
echo     const { id } = req.params;
echo     const tarifa = parseFloat^(process.env.TARIFA_HORA ^|^| '5.00'^);
echo     const [rows]: any = await pool.query^('SELECT hora_entrada FROM vehiculos WHERE id = ?', [id]^);
echo     if ^(rows.length === 0^) return res.status^(404^).json^({ error: 'Vehiculo no encontrado' ^});
echo     const horaEntrada = new Date^(rows[0].hora_entrada^).getTime^(^);
echo     const horaSalida = new Date^(^).getTime^(^);
echo     const horasTranscurridas = Math.ceil^((horaSalida - horaEntrada^) / (1000 * 60 * 60^)^);
echo     const costoTotal = horasTranscurridas * tarifa;
echo     await pool.query^(
echo       'UPDATE vehiculos SET hora_salida = NOW^(^), estado = "finalizado", costo_total = ? WHERE id = ?',
echo       [costoTotal, id]
echo     ^);
echo     res.json^({ message: 'Salida registrada', horas: horasTranscurridas, costoTotal ^});
echo   } catch ^(error^) {
echo     res.status^(500^).json^({ error: 'Error al registrar salida' ^});
echo   }
echo };
)

> backend\src\routes\vehiculoRoutes.ts (
echo import { Router } from 'express';
echo import { registrarIngreso, obtenerActivos, registrarSalida } from '../controllers/vehiculoController';
echo.
echo const router = Router^(^);
echo router.post^('/', registrarIngreso^);
echo router.get^('/', obtenerActivos^);
echo router.put^('/:id/salida', registrarSalida^);
echo.
echo export default router;
)

> backend\src\index.ts (
echo import express from 'express';
echo import cors from 'cors';
echo import vehiculoRoutes from './routes/vehiculoRoutes';
echo import dotenv from 'dotenv';
echo.
echo dotenv.config^(^);
echo const app = express^(^);
echo app.use^(cors^(^)^);
echo app.use^(express.json^(^)^);
echo app.use^('/api/vehiculos', vehiculoRoutes^);
echo.
echo const PORT = process.env.PORT ^|^| 3000;
echo app.listen^(PORT, ^(^) =^> {
echo   console.log^(`Servidor backend corriendo en http://localhost:${PORT}`^);
echo ^});
)

echo Generando archivos del frontend...

> frontend\package.json (
echo {
echo   "name": "frontend-lavado",
echo   "private": true,
echo   "version": "1.0.0",
echo   "type": "module",
echo   "scripts": {
echo     "dev": "vite",
echo     "build": "tsc ^&^& vite build",
echo     "preview": "vite preview"
echo   },
echo   "dependencies": {
echo     "react": "^18.2.0",
echo     "react-dom": "^18.2.0",
echo     "axios": "^1.5.0"
echo   },
echo   "devDependencies": {
echo     "@types/react": "^18.2.15",
echo     "@types/react-dom": "^18.2.7",
echo     "@vitejs/plugin-react": "^4.0.3",
echo     "typescript": "^5.0.2",
echo     "vite": "^4.4.5"
echo   }
echo }
)

> frontend\vite.config.ts (
echo import { defineConfig } from 'vite'
echo import react from '@vitejs/plugin-react'
echo.
echo export default defineConfig^({
echo   plugins: [react^(^)],
echo ^})
)

> frontend\tsconfig.json (
echo {
echo   "compilerOptions": {
echo     "target": "ES2020",
echo     "useDefineForClassFields": true,
echo     "lib": ["ES2020", "DOM", "DOM.Iterable"],
echo     "module": "ESNext",
echo     "skipLibCheck": true,
echo     "moduleResolution": "bundler",
echo     "allowImportingTsExtensions": true,
echo     "resolveJsonModule": true,
echo     "isolatedModules": true,
echo     "noEmit": true,
echo     "jsx": "react-jsx",
echo     "strict": true,
echo     "noUnusedLocals": true,
echo     "noUnusedParameters": true,
echo     "noFallthroughCasesInSwitch": true
echo   },
echo   "include": ["src"],
echo   "references": [{ "path": "./tsconfig.node.json" }]
echo }
)

> frontend\tsconfig.node.json (
echo {
echo   "compilerOptions": {
echo     "composite": true,
echo     "skipLibCheck": true,
echo     "module": "ESNext",
echo     "moduleResolution": "bundler",
echo     "allowSyntheticDefaultImports": true
echo   },
echo   "include": ["vite.config.ts"]
echo }
)

> frontend\src\vite-env.d.ts (
echo /// ^<reference types="vite/client" /^>
)

> frontend\src\services\api.ts (
echo import axios from 'axios';
echo.
echo const api = axios.create^({
echo   baseURL: 'http://localhost:3000/api',
echo ^});
echo.
echo export default api;
)

> frontend\src\components\VehicleForm.tsx (
echo import React, { useState } from 'react';
echo import api from '../services/api';
echo.
echo interface Props {
echo   onRefresh: ^(^) =^> void;
echo }
echo.
echo const VehicleForm: React.FC^<Props^> = ^({ onRefresh ^}) =^> {
echo   const [placa, setPlaca] = useState^(''^);
echo   const [tipo, setTipo] = useState^('automovil'^);
echo.
echo   const handleSubmit = async ^(e: React.FormEvent^) =^> {
echo     e.preventDefault^(^);
echo     try {
echo       await api.post^('/vehiculos', { placa, tipo ^});
echo       setPlaca^(''^);
echo       onRefresh^(^);
echo     } catch ^(error^) {
echo       alert^('Error al registrar vehiculo'^);
echo     }
echo   };
echo.
echo   return ^(^
echo     ^<form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}^>
echo       ^<h3^>Registrar Ingreso^</h3^>
echo       ^<input type="text" placeholder="Placa" value={placa} onChange={^(e^) =^> setPlaca^(e.target.value^)} required style={{ marginRight: '10px', padding: '8px' }} /^>
echo       ^<select value={tipo} onChange={^(e^) =^> setTipo^(e.target.value^)} style={{ marginRight: '10px', padding: '8px' }}^>
echo         ^<option value="automovil"^>Automovil^</option^>
echo         ^<option value="motocicleta"^>Motocicleta^</option^>
echo         ^<option value="camioneta"^>Camioneta^</option^>
echo       ^</select^>
echo       ^<button type="submit" style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}^>Ingresar^</button^>
echo     ^</form^>
echo   ^);
echo };
echo.
echo export default VehicleForm;
)

> frontend\src\components\VehicleList.tsx (
echo import React, { useState, useEffect } from 'react';
echo import api from '../services/api';
echo.
echo interface Vehiculo {
echo   id: number;
echo   placa: string;
echo   tipo: string;
echo   hora_entrada: string;
echo }
echo.
echo interface Props {
echo   refreshTrigger: number;
echo }
echo.
echo const VehicleList: React.FC^<Props^> = ^({ refreshTrigger ^}) =^> {
echo   const [vehiculos, setVehiculos] = useState^<Vehiculo[]^>([]^);
echo.
echo   useEffect^(^(^) =^> {
echo     fetchVehiculos^(^);
echo   }, [refreshTrigger]^);
echo.
echo   const fetchVehiculos = async ^(^) =^> {
echo     try {
echo       const response = await api.get^('/vehiculos'^);
echo       setVehiculos^(response.data^);
echo     } catch ^(error^) {
echo       console.error^('Error al obtener vehiculos', error^);
echo     }
echo   };
echo.
echo   const registrarSalida = async ^(id: number^) =^> {
echo     try {
echo       const response = await api.put^(`/vehiculos/${id}/salida`^);
echo       alert^(`Salida registrada. Horas: ${response.data.horas}. Costo: $${response.data.costoTotal}`^);
echo       fetchVehiculos^(^);
echo     } catch ^(error^) {
echo       alert^('Error al registrar salida'^);
echo     }
echo   };
echo.
echo   return ^(^
echo     ^<div^>
echo       ^<h3^>Vehiculos Activos^</h3^>
echo       ^<table style={{ width: '100%', borderCollapse: 'collapse' }}^>
echo         ^<thead^>
echo           ^<tr style={{ backgroundColor: '#f2f2f2' }}^>
echo             ^<th style={{ border: '1px solid #ddd', padding: '8px' }}^>Placa^</th^>
echo             ^<th style={{ border: '1px solid #ddd', padding: '8px' }}^>Tipo^</th^>
echo             ^<th style={{ border: '1px solid #ddd', padding: '8px' }}^>Hora Entrada^</th^>
echo             ^<th style={{ border: '1px solid #ddd', padding: '8px' }}^>Accion^</th^>
echo           ^</tr^>
echo         ^</thead^>
echo         ^<tbody^>
echo           {vehiculos.map^((v^) =^> ^(
echo             ^<tr key={v.id}^>
echo               ^<td style={{ border: '1px solid #ddd', padding: '8px' }}^>{v.placa}^</td^>
echo               ^<td style={{ border: '1px solid #ddd', padding: '8px' }}^>{v.tipo}^</td^>
echo               ^<td style={{ border: '1px solid #ddd', padding: '8px' }}^>{new Date^(v.hora_entrada^).toLocaleString^(^)}^</td^>
echo               ^<td style={{ border: '1px solid #ddd', padding: '8px' }}^>
echo                 ^<button onClick={^(^) =^> registrarSalida^(v.id^)} style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}^>Registrar Salida^</button^>
echo               ^</td^>
echo             ^</tr^>
echo           ^)^)}
echo         ^</tbody^>
echo       ^</table^>
echo     ^</div^>
echo   ^);
echo };
echo.
echo export default VehicleList;
)

> frontend\src\App.tsx (
echo import React, { useState } from 'react';
echo import VehicleForm from './components/VehicleForm';
echo import VehicleList from './components/VehicleList';
echo.
echo function App^(^) {
echo   const [refreshTrigger, setRefreshTrigger] = useState^(0^);
echo.
echo   return ^(^
echo     ^<div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}^>
echo       ^<h1^>Sistema de Control de Lavado de Vehiculos^</h1^>
echo       ^<VehicleForm onRefresh={^(^) =^> setRefreshTrigger^(prev =^> prev + 1^)} /^>
echo       ^<VehicleList refreshTrigger={refreshTrigger} /^>
echo     ^</div^>
echo   ^);
echo }
echo.
echo export default App;
)

> frontend\src\main.tsx (
echo import React from 'react'
echo import ReactDOM from 'react-dom/client'
echo import App from './App.tsx'
echo.
echo ReactDOM.createRoot^(document.getElementById^('root'^)!^).render^(
echo   ^<React.StrictMode^>
echo     ^<App /^>
echo   ^</React.StrictMode^>,
echo ^)
)

> frontend\index.html (
echo ^<!doctype html^>
echo ^<html lang="es"^>
echo   ^<head^>
echo     ^<meta charset="UTF-8" /^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^>
echo     ^<title^>Control Lavado Vehiculos^</title^>
echo   ^</head^>
echo   ^<body^>
echo     ^<div id="root"^>^</div^>
echo     ^<script type="module" src="/src/main.tsx"^>^</script^>
echo   ^</body^>
echo ^</html^>
)

echo Generando readme.md...
> readme.md (
echo # Sistema de Control de Lavado de Vehiculos
echo.
echo Sistema MVP para el control de ingreso, estadia y cobro por horas de vehiculos en un lote de lavado/estacionamiento.
echo.
echo ## Estructura del Proyecto
echo - `/database`: Script SQL para la creacion de la base de datos.
echo - `/backend`: API REST en Node.js + Express + TypeScript.
echo - `/frontend`: Interfaz en React + Vite + TypeScript.
echo.
echo ## Instrucciones de Instalacion
echo 1. Ejecutar `database/sislavado.sql` en MySQL.
echo 2. Backend: `cd backend`, `npm install`, configurar `.env`, `npm run dev`.
echo 3. Frontend: `cd frontend`, `npm install`, `npm run dev`.
)

cd ..
echo.
echo ========================================
echo  Proyecto generado exitosamente
echo  Carpeta: proyecto_lavado
echo ========================================
echo.
echo Para comprimir en ZIP, puedes usar:
echo   powershell Compress-Archive -Path proyecto_lavado -DestinationPath proyecto_lavado.zip
echo.
pause