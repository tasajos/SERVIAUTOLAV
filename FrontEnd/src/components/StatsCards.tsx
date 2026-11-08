import React from 'react';
import { Car, Bike, Truck, ShieldAlert } from 'lucide-react';
import type { Vehiculo } from '../types/vehicle';

interface StatsCardsProps {
  vehiculos: Vehiculo[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ vehiculos }) => {
  const total = vehiculos.length;
  const autos = vehiculos.filter(
    (v) => v.tipo.toLowerCase() === 'automovil' || v.tipo.toLowerCase() === 'automóvil'
  ).length;
  const motos = vehiculos.filter((v) => v.tipo.toLowerCase() === 'motocicleta').length;
  const camionetas = vehiculos.filter((v) => v.tipo.toLowerCase() === 'camioneta').length;

  return (
    <div className="stats-grid">
      <div className="kpi-card blue">
        <div className="kpi-info">
          <span className="kpi-title">Total en Lavado</span>
          <span className="kpi-value">{total}</span>
          <span className="kpi-subtext">Vehículos en servicio activo</span>
        </div>
        <div className="kpi-icon-wrap blue">
          <ShieldAlert size={28} />
        </div>
      </div>

      <div className="kpi-card yellow">
        <div className="kpi-info">
          <span className="kpi-title">Automóviles</span>
          <span className="kpi-value">{autos}</span>
          <span className="kpi-subtext">Autos estándar</span>
        </div>
        <div className="kpi-icon-wrap yellow">
          <Car size={28} />
        </div>
      </div>

      <div className="kpi-card amber">
        <div className="kpi-info">
          <span className="kpi-title">Motocicletas</span>
          <span className="kpi-value">{motos}</span>
          <span className="kpi-subtext">Dos ruedas</span>
        </div>
        <div className="kpi-icon-wrap amber">
          <Bike size={28} />
        </div>
      </div>

      <div className="kpi-card cyan">
        <div className="kpi-info">
          <span className="kpi-title">Camionetas</span>
          <span className="kpi-value">{camionetas}</span>
          <span className="kpi-subtext">SUVs y pickups</span>
        </div>
        <div className="kpi-icon-wrap cyan">
          <Truck size={28} />
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
