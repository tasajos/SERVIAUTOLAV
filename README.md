# SERVIAUTOLAV - Guía de Configuración y Despliegue Multi-VM

Este proyecto está distribuido en tres máquinas virtuales (o entornos de red) independientes:

| Componente | IP Asignada | Rol / Servicio | Puerto Principal |
| :--- | :--- | :--- | :--- |
| **Frontend** | `192.168.1.207` | Aplicación Web (React + Vite + TypeScript) | `5173` |
| **Backend** | `192.168.1.209` | API REST (Node.js + Express + TypeScript) | `3000` |
| **Base de Datos** | `192.168.1.208` | Servidor MySQL | `3306` |

---

## 1. Configuración de la Base de Datos (Servidor MySQL: `192.168.1.208`)

Para que el backend en `192.168.1.209` pueda conectarse a MySQL en `192.168.1.208`, realiza estos pasos en la máquina de base de datos:

### 1.1. Permitir Conexiones Externas en MySQL (bind-address)
Por defecto, MySQL solo escucha en `127.0.0.1`. Debe escuchar en todas las interfaces de red:

1. Edita el archivo de configuración de MySQL (en Ubuntu/Debian suele ser `/etc/mysql/mysql.conf.d/mysqld.cnf` o `/etc/mysql/my.cnf`):
   ```bash
   sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
   ```
2. Busca la directiva `bind-address` y cámbiala a `0.0.0.0`:
   ```ini
   bind-address = 0.0.0.0
   ```
3. Guarda el archivo (`Ctrl + O`, `Enter`, `Ctrl + X`) y reinicia MySQL:
   ```bash
   sudo systemctl restart mysql
   sudo systemctl status mysql
   ```

### 1.2. Habilitar el Puerto en el Firewall (UFW)
Si tienes el firewall de Ubuntu (`ufw`) activado en `192.168.1.208`, permite el tráfico entrante al puerto `3306` desde la VM del backend (`192.168.1.209`):
```bash
sudo ufw allow from 192.168.1.209 to any port 3306 proto tcp
# O permitir en la red local:
# sudo ufw allow 3306/tcp
sudo ufw status
```

### 1.3. Crear la Base de Datos, Usuario y Tablas
En la máquina `192.168.1.208`, ejecuta el script ubicado en `DB/sislavado.sql`:

```bash
mysql -u root -p < DB/sislavado.sql
```

O ingresa a la consola interactiva de MySQL:
```bash
mysql -u root -p
```
Y ejecuta las siguientes sentencias SQL:
```sql
-- 1. Crear base de datos
CREATE DATABASE IF NOT EXISTS sislavado CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Crear usuario y otorgar permisos desde el Backend (192.168.1.209)
CREATE USER IF NOT EXISTS 'sislavado_user'@'%' IDENTIFIED BY 'sislavado_pass_123';
GRANT ALL PRIVILEGES ON sislavado.* TO 'sislavado_user'@'%';

CREATE USER IF NOT EXISTS 'sislavado_user'@'192.168.1.209' IDENTIFIED BY 'sislavado_pass_123';
GRANT ALL PRIVILEGES ON sislavado.* TO 'sislavado_user'@'192.168.1.209';

FLUSH PRIVILEGES;

-- 3. Crear tabla
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
```

---

## 2. Configuración y Ejecución del Backend (Servidor: `192.168.1.209`)

Este servidor ya cuenta con el entorno configurado.

### 2.1. Archivo de Entorno (`.env`)
El archivo `/home/ia/vmbackend/SERVIAUTOLAV/Backend/.env` contiene las siguientes variables:
```env
PORT=3000
HOST=0.0.0.0
DB_HOST=192.168.1.208
DB_PORT=3306
DB_USER=sislavado_user
DB_PASSWORD=sislavado_pass_123
DB_NAME=sislavado
CORS_ORIGIN=http://192.168.1.207:5173,http://192.168.1.207,http://localhost:5173
TARIFA_HORA=5.00
```

### 2.2. Probar la Conexión con la Base de Datos
Antes de levantar el backend, puedes validar si la base de datos en `192.168.1.208` está respondiendo:
```bash
cd /home/ia/vmbackend/SERVIAUTOLAV/Backend
npm run test:db
```
Si la conexión es exitosa, mostrará: `Autenticación y conexión exitosa.` y la lista de tablas.

### 2.3. Ejecutar el Backend

#### Modo Desarrollo (Hot-Reload):
```bash
cd /home/ia/vmbackend/SERVIAUTOLAV/Backend
npm run dev
```

#### Modo Producción (Compilado):
```bash
cd /home/ia/vmbackend/SERVIAUTOLAV/Backend
npm run build
npm start
```

#### Opcional: Como Servicio de Sistema (systemd)
Si deseas que el backend se ejecute en segundo plano e inicie automáticamente al reiniciar la máquina:
```bash
sudo cp /home/ia/vmbackend/SERVIAUTOLAV/Backend/serviautolav-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable serviautolav-backend
sudo systemctl start serviautolav-backend
sudo systemctl status serviautolav-backend
```

### 2.4. Verificar Endpoints del Backend
Puedes probar desde cualquier terminal:
```bash
# Comprobar estado de la API
curl http://192.168.1.209:3000/

# Comprobar salud y conexión activa a base de datos
curl http://192.168.1.209:3000/health

# Listar vehículos activos
curl http://192.168.1.209:3000/api/vehiculos
```

---

## 3. Configuración y Ejecución del Frontend (Servidor: `192.168.1.207`)

En la máquina virtual del Frontend (`192.168.1.207`):

### 3.1. Archivo de Entorno (`.env`)
Crea o verifica el archivo `FrontEnd/.env` con la IP del Backend:
```env
VITE_API_BASE_URL=http://192.168.1.209:3000/api
```

### 3.2. Instalar Dependencias
```bash
cd FrontEnd
npm install
```

### 3.3. Levantar Servidor de Desarrollo
El archivo `vite.config.ts` ya está configurado para escuchar en `0.0.0.0:5173`. Ejecuta:
```bash
npm run dev
```
O explícitamente:
```bash
npm run dev -- --host 0.0.0.0
```

### 3.4. Acceso en el Navegador
Abre desde cualquier computadora conectada a la red local:
```
http://192.168.1.207:5173
```

---

## 4. Diagnóstico de Problemas Frecuentes (Troubleshooting)

1. **Error `ECONNREFUSED 192.168.1.208:3306`**:
   - MySQL no está corriendo en `192.168.1.208` (`sudo systemctl start mysql`).
   - `bind-address` sigue configurado en `127.0.0.1` en lugar de `0.0.0.0`.
   - El firewall de la VM de base de datos está bloqueando el puerto 3306.

2. **Error `Access denied for user 'sislavado_user'@'192.168.1.209'`**:
   - El usuario fue creado solo para `localhost`. Debes crearlo con `@'%'` o `@'192.168.1.209'` como se indica en el paso 1.3.

3. **Frontend muestra error de red al consultar la API**:
   - Asegúrate de que el Backend esté escuchando en `0.0.0.0:3000` y no solo en `127.0.0.1`.
   - Verifica que la IP del backend `192.168.1.209` sea accesible desde `192.168.1.207` con `ping 192.168.1.209`.
   - Verifica que el puerto 3000 esté abierto en la VM del backend (`sudo ufw allow 3000/tcp`).
