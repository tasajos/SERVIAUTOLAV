# Sistema de Control de Lavado de Vehiculos

Sistema MVP para el control de ingreso, estadia y cobro por horas de vehiculos en un lote de lavado/estacionamiento.

## Estructura del Proyecto
- `/database`: Script SQL para la creacion de la base de datos.
- `/backend`: API REST en Node.js + Express + TypeScript.
- `/frontend`: Interfaz en React + Vite + TypeScript.

## Instrucciones de Instalacion
1. Ejecutar `database/sislavado.sql` en MySQL.
2. Backend: `cd backend`, `npm install`, configurar `.env`, `npm run dev`.
3. Frontend: `cd frontend`, `npm install`, `npm run dev`.
