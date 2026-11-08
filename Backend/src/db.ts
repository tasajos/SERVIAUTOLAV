import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || '192.168.1.208',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'sislavado_user',
  password: process.env.DB_PASSWORD || 'sislavado_pass_123',
  database: process.env.DB_NAME || 'sislavado',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const testDbConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log(`[DB] Conexión exitosa a MySQL en ${process.env.DB_HOST || '192.168.1.208'}:${process.env.DB_PORT || 3306} (DB: ${process.env.DB_NAME || 'sislavado'})`);
    return true;
  } catch (error: any) {
    console.error(`[DB] Error al conectar con MySQL (${process.env.DB_HOST || '192.168.1.208'}:${process.env.DB_PORT || 3306}):`, error.message);
    return false;
  }
};
