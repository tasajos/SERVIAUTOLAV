import { Request, Response } from 'express';
import { pool } from '../db';

export const registrarIngreso = async (req: Request, res: Response) => {
  try {
    const { placa, tipo } = req.body;
    const [result] = await pool.query(
      'INSERT INTO vehiculos (placa, tipo, hora_entrada, estado) VALUES (?, ?, NOW(), "activo")',
      [placa, tipo]
    );
    res.status(201).json({ message: 'Vehiculo registrado', data: result }
