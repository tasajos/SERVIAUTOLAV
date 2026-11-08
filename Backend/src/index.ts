import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import vehiculoRoutes from './routes/vehiculoRoutes';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/vehiculos', vehiculoRoutes);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'ServiAutoLav API Backend funcionando' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
