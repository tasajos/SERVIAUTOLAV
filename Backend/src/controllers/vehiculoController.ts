import { Request, Response } from 'express';
import { pool } from '../db.js';

export const registrarIngreso = async (req: Request, res: Response) => {
  try {
    const { placa, tipo } = req.body;
    if (!placa || !tipo) {
      return res.status(400).json({ error: 'Placa y tipo son requeridos' });
    }
    const [result] = await pool.query(
      'INSERT INTO vehiculos (placa, tipo, hora_entrada, estado) VALUES (?, ?, NOW(), "activo")',
      [placa.toUpperCase().trim(), tipo]
    );
    return res.status(201).json({ message: 'Vehículo registrado', data: result });
  } catch (error) {
    console.error('Error al registrar ingreso:', error);
    return res.status(500).json({ error: 'Error al registrar ingreso' });
  }
};

export const obtenerActivos = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vehiculos WHERE estado = "activo" ORDER BY hora_entrada DESC');
    return res.json(rows);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    return res.status(500).json({ error: 'Error al obtener vehículos' });
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
    const horasTranscurridas = Math.max(1, Math.ceil((horaSalida - horaEntrada) / (1000 * 60 * 60)));
    const costoTotal = horasTranscurridas * tarifa;

    await pool.query(
      'UPDATE vehiculos SET hora_salida = NOW(), estado = "finalizado", costo_total = ? WHERE id = ?',
      [costoTotal, id]
    );

    return res.json({ 
      message: 'Salida registrada', 
      horas: horasTranscurridas, 
      costoTotal,
      horaSalida: new Date(horaSalida).toISOString()
    });
  } catch (error) {
    console.error('Error al registrar salida:', error);
    return res.status(500).json({ error: 'Error al registrar salida' });
  }
};
