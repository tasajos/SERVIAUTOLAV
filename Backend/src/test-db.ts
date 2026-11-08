import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  host: process.env.DB_HOST || '192.168.1.208',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'sislavado_user',
  password: process.env.DB_PASSWORD || 'sislavado_pass_123',
  database: process.env.DB_NAME || 'sislavado',
  connectTimeout: 5000,
};

async function testConnection() {
  console.log('==================================================');
  console.log(' Probando conexión a MySQL...');
  console.log(` Host:     ${config.host}`);
  console.log(` Puerto:   ${config.port}`);
  console.log(` Usuario:  ${config.user}`);
  console.log(` Base:     ${config.database}`);
  console.log('==================================================');

  try {
    const connection = await mysql.createConnection(config);
    console.log(' Autenticación y conexión exitosa.');

    const [rows]: any = await connection.query('SHOW TABLES LIKE "vehiculos";');
    if (rows.length > 0) {
      console.log(' Tabla "vehiculos" encontrada en la base de datos.');
      const [countResult]: any = await connection.query('SELECT COUNT(*) as total FROM vehiculos;');
      console.log(` Total registros de vehículos: ${countResult[0]?.total ?? 0}`);
    } else {
      console.warn(' ADVERTENCIA: La tabla "vehiculos" no existe aún en la base de datos.');
      console.warn(' Por favor ejecuta el script DB/sislavado.sql en el servidor MySQL (192.168.1.208).');
    }

    await connection.end();
    console.log(' Prueba de conexión finalizada con éxito.');
    process.exit(0);
  } catch (err: any) {
    console.error(' ERROR conectando a MySQL:');
    console.error(` Código:  ${err.code || 'Desconocido'}`);
    console.error(` Mensaje: ${err.message}`);
    console.log('\nPosibles causas:');
    console.log(' 1. El servicio MySQL en 192.168.1.208 no está iniciado (ejecuta: sudo systemctl start mysql).');
    console.log(' 2. El bind-address en MySQL está limitado a 127.0.0.1 (debe ser 0.0.0.0 en /etc/mysql/mysql.conf.d/mysqld.cnf).');
    console.log(' 3. El usuario o contraseña no coinciden o no tienen permisos desde 192.168.1.209.');
    console.log(' 4. Firewall (UFW) bloqueando el puerto 3306 en 192.168.1.208.');
    process.exit(1);
  }
}

testConnection();
