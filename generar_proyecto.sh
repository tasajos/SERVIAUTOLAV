#!/bin/bash

# Crear estructura de directorios
mkdir -p proyecto_lavado/database
mkdir -p proyecto_lavado/backend/src/controllers
mkdir -p proyecto_lavado/backend/src/routes
mkdir -p proyecto_lavado/frontend/src/components
mkdir -p proyecto_lavado/frontend/src/services

cd proyecto_lavado

# ==========================================
# 1. DATABASE
# ==========================================
cat << 'EOF' > database/sislavado.sql
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
EOF

# ==========================================
# 2. BACKEND
# ==========================================
cat << 'EOF' > backend/package.json
{
  "name": "backend-lavado",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev src/index.ts",
    "build": "tsc"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/node": "^20.4.5",
    "typescript": "^5.1.6",
    "ts-node-dev": "^2.0.0"
  }
}
EOF

cat << 'EOF' > backend/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
EOF

cat << 'EOF' > backend/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sislavado
PORT=3000
TARIFA_HORA=5.00
EOF

cat << 'EOF' > backend/src/db.ts
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
EOF

cat << 'EOF' > backend/src/controllers/vehiculoController.ts
import { Request, Response } from 'express';
import { pool } from '../db';

export const registrarIngreso = async (req: Request, res: Response) => {
  try {
    const { placa, tipo } = req.body;
    const [result] = await pool.query(
      'INSERT INTO vehiculos (placa, tipo, hora_entrada, estado) VALUES (?, ?, NOW(), "activo")',
      [placa, tipo]
    );
    res.status(201).json({ message: 'Vehículo registrado', data: result });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar ingreso' });
  }
};

export const obtenerActivos = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vehiculos WHERE estado = "activo"');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener vehículos' });
  }
};

export const registrarSalida = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tarifa = parseFloat(process.env.TARIFA_HORA || '5.00');
    
    const [rows]: any = await pool.query('SELECT hora_entrada FROM vehiculos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Vehículo no encontrado' });

    const horaEntrada = new Date(rows[0].hora_entrada).getTime();
    const horaSalida = new Date().getTime();
    const horasTranscurridas = Math.ceil((horaSalida - horaEntrada) / (1000 * 60 * 60));
    const costoTotal = horasTranscurridas * tarifa;

    await pool.query(
      'UPDATE vehiculos SET hora_salida = NOW(), estado = "finalizado", costo_total = ? WHERE id = ?',
      [costoTotal, id]
    );

    res.json({ message: 'Salida registrada', horas: horasTranscurridas, costoTotal });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar salida' });
  }
};
EOF

cat << 'EOF' > backend/src/routes/vehiculoRoutes.ts
import { Router } from 'express';
import { registrarIngreso, obtenerActivos, registrarSalida } from '../controllers/vehiculoController';

const router = Router();
router.post('/', registrarIngreso);
router.get('/', obtenerActivos);
router.put('/:id/salida', registrarSalida);

export default router;
EOF

cat << 'EOF' > backend/src/index.ts
import express from 'express';
import cors from 'cors';
import vehiculoRoutes from './routes/vehiculoRoutes';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/vehiculos', vehiculoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
EOF

# ==========================================
# 3. FRONTEND
# ==========================================
cat << 'EOF' > frontend/package.json
{
  "name": "frontend-lavado",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
EOF

cat << 'EOF' > frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
EOF

cat << 'EOF' > frontend/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

cat << 'EOF' > frontend/tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF

cat << 'EOF' > frontend/src/vite-env.d.ts
/// <reference types="vite/client" />
EOF

cat << 'EOF' > frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export default api;
EOF

cat << 'EOF' > frontend/src/components/VehicleForm.tsx
import React, { useState } from 'react';
import api from '../services/api';

interface Props {
  onRefresh: () => void;
}

const VehicleForm: React.FC<Props> = ({ onRefresh }) => {
  const [placa, setPlaca] = useState('');
  const [tipo, setTipo] = useState('automovil');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vehiculos', { placa, tipo });
      setPlaca('');
      onRefresh();
    } catch (error) {
      alert('Error al registrar vehículo');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Registrar Ingreso</h3>
      <input 
        type="text" 
        placeholder="Placa del vehículo" 
        value={placa} 
        onChange={(e) => setPlaca(e.target.value)} 
        required 
        style={{ marginRight: '10px', padding: '8px' }}
      />
      <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ marginRight: '10px', padding: '8px' }}>
        <option value="automovil">Automóvil</option>
        <option value="motocicleta">Motocicleta</option>
        <option value="camioneta">Camioneta</option>
      </select>
      <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Ingresar
      </button>
    </form>
  );
};

export default VehicleForm;
EOF

cat << 'EOF' > frontend/src/components/VehicleList.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Vehiculo {
  id: number;
  placa: string;
  tipo: string;
  hora_entrada: string;
}

interface Props {
  refreshTrigger: number;
}

const VehicleList: React.FC<Props> = ({ refreshTrigger }) => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);

  useEffect(() => {
    fetchVehiculos();
  }, [refreshTrigger]);

  const fetchVehiculos = async () => {
    try {
      const response = await api.get('/vehiculos');
      setVehiculos(response.data);
    } catch (error) {
      console.error('Error al obtener vehículos', error);
    }
  };

  const registrarSalida = async (id: number) => {
    try {
      const response = await api.put(`/vehiculos/${id}/salida`);
      alert(`Salida registrada. Horas: ${response.data.horas}. Costo total: $${response.data.costoTotal}`);
      fetchVehiculos();
    } catch (error) {
      alert('Error al registrar salida');
    }
  };

  return (
    <div>
      <h3>Vehículos Activos</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Placa</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Tipo</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Hora Entrada</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {vehiculos.map((v) => (
            <tr key={v.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{v.placa}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{v.tipo}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(v.hora_entrada).toLocaleString()}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <button 
                  onClick={() => registrarSalida(v.id)}
                  style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Registrar Salida
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleList;
EOF

cat << 'EOF' > frontend/src/App.tsx
import React, { useState } from 'react';
import VehicleForm from './components/VehicleForm';
import VehicleList from './components/VehicleList';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Sistema de Control de Lavado de Vehículos</h1>
      <VehicleForm onRefresh={() => setRefreshTrigger(prev => prev + 1)} />
      <VehicleList refreshTrigger={refreshTrigger} />
    </div>
  );
}

export default App;
EOF

cat << 'EOF' > frontend/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

cat << 'EOF' > frontend/index.html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Control Lavado Vehículos</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# ==========================================
# 4. README
# ==========================================
cat << 'EOF' > readme.md
# Sistema de Control de Lavado de Vehículos

Sistema MVP para el control de ingreso, estadía y cobro por horas de vehículos en un lote de lavado/estacionamiento.

## Estructura del Proyecto
- `/database`: Contiene el script SQL para la creación de la base de datos y tablas.
- `/backend`: API REST desarrollada en Node.js + Express + TypeScript. Gestiona la lógica de negocio, cálculo de horas y conexión a MySQL.
- `/frontend`: Interfaz de usuario desarrollada en React + Vite + TypeScript. Permite registrar ingresos y procesar salidas con cálculo de presupuesto.

## Componentes

### Database (`sislavado.sql`)
- Tabla `vehiculos`: Registra placa, tipo de vehículo, hora de entrada, hora de salida, estado (activo/finalizado) y costo total.

### Backend
- `src/db.ts`: Configuración del pool de conexiones a MySQL.
- `src/controllers/vehiculoController.ts`: Lógica de negocio. Calcula el costo basado en la diferencia de horas entre entrada y salida (tarifa base: $5/hora).
- `src/routes/vehiculoRoutes.ts`: Endpoints: 
  - `POST /api/vehiculos` (Registrar ingreso)
  - `GET /api/vehiculos` (Listar vehículos activos)
  - `PUT /api/vehiculos/:id/salida` (Registrar salida y calcular cobro)
- `src/index.ts`: Punto de entrada del servidor Express.

### Frontend
- `src/services/api.ts`: Cliente Axios configurado para comunicarse con el backend.
- `src/components/VehicleForm.tsx`: Formulario para registrar la placa y tipo de vehículo.
- `src/components/VehicleList.tsx`: Tabla que muestra los vehículos activos y permite ejecutar la acción de "Registrar Salida", mostrando el costo calculado.
- `src/App.tsx`: Componente principal que integra el formulario y la lista.

## Instrucciones de Instalación
1. Descomprimir `proyecto_lavado.zip`.
2. **Database**: Ejecutar `database/sislavado.sql` en tu servidor MySQL.
3. **Backend**: 
   - `cd backend`
   - `npm install`
   - Configurar `.env` con tus credenciales de MySQL.
   - `npm run dev`
4. **Frontend**:
   - `cd frontend`
   - `npm install`
   - `npm run dev`
EOF

# ==========================================
# 5. GENERAR ZIP
# ==========================================
cd ..
zip -r proyecto_lavado.zip proyecto_lavado
echo "✅ Proyecto generado y comprimido exitosamente en: proyecto_lavado.zip"