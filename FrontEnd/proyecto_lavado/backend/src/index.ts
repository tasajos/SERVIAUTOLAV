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
}
