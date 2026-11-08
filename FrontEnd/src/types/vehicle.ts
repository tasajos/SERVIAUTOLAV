export type TipoVehiculo = 'automovil' | 'motocicleta' | 'camioneta';

export interface Vehiculo {
  id: number;
  placa: string;
  tipo: TipoVehiculo | string;
  hora_entrada: string;
  hora_salida?: string | null;
  estado?: 'activo' | 'finalizado';
  costo_total?: number | string;
}

export interface SalidaResponse {
  message: string;
  horas: number;
  costoTotal: number;
  horaSalida?: string;
}

export interface TicketSalidaData {
  id: number;
  placa: string;
  tipo: string;
  horaEntrada: string;
  horaSalida: string;
  horas: number;
  tarifaHora: number;
  costoTotal: number;
}
