import { Router } from 'express';
import { registrarIngreso, obtenerActivos, registrarSalida } from '../controllers/vehiculoController.js';

const router = Router();
router.post('/', registrarIngreso);
router.get('/', obtenerActivos);
router.put('/:id/salida', registrarSalida);

export default router;
