import axios from 'axios';
import type { Vehiculo, SalidaResponse } from '../types/vehicle';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getVehiculos = async (): Promise<Vehiculo[]> => {
  const response = await api.get<Vehiculo[]>('/vehiculos');
  return response.data;
};

export const registrarIngreso = async (placa: string, tipo: string): Promise<any> => {
  const response = await api.post('/vehiculos', { placa, tipo });
  return response.data;
};

export const registrarSalida = async (id: number): Promise<SalidaResponse> => {
  const response = await api.put<SalidaResponse>(`/vehiculos/${id}/salida`);
  return response.data;
};

export default api;
