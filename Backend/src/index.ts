import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import vehiculoRoutes from './routes/vehiculoRoutes.js';
import { testDbConnection } from './db.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Configuración de CORS permitiendo orígenes del Frontend
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : [
      'http://192.168.1.207:5173',
      'http://192.168.1.207',
      'http://localhost:5173',
      'http://localhost:3000'
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir herramientas locales/curl o sin cabecera de origen
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Permitir si proviene de la red local
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());

app.use('/api/vehiculos', vehiculoRoutes);

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'ServiAutoLav API Backend funcionando',
    ipBackend: '192.168.1.209',
    databaseHost: process.env.DB_HOST || '192.168.1.208'
  });
});

app.get('/health', async (_req, res) => {
  const dbOk = await testDbConnection();
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'healthy' : 'degraded',
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, HOST, async () => {
  console.log(`===============================================`);
  console.log(` ServiAutoLav Backend`);
  console.log(` Servidor escuchando en: http://${HOST}:${PORT}`);
  console.log(` IP Backend (VM): http://192.168.1.209:${PORT}`);
  console.log(` Base de datos MySQL: ${process.env.DB_HOST || '192.168.1.208'}:${process.env.DB_PORT || 3306}`);
  console.log(` Frontend autorizado: http://192.168.1.207:5173`);
  console.log(`===============================================`);
  await testDbConnection();
});
