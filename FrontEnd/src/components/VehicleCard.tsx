import React, { useState, useEffect } from 'react';
import { Clock, LogOut, Car, Bike, Truck, DollarSign } from 'lucide-react';
import type { Vehiculo } from '../types/vehicle';

interface VehicleCardProps {
  vehiculo: Vehiculo;
  onSalida: (vehiculo: Vehiculo) => void;
  loadingSalidaId: number | null;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehiculo,
  onSalida,
  loadingSalidaId,
}) => {
  const [elapsedTime, setElapsedTime] = useState<{ text: string; hoursCeil: number }>({
    text: '',
    hoursCeil: 1,
  });

  useEffect(() => {
    const calculateElapsed = () => {
      const entradaTime = new Date(vehiculo.hora_entrada).getTime();
      const now = Date.now();
      const diffMs = Math.max(0, now - entradaTime);
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      const hoursCeil = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));

      let text = '';
      if (hours === 0) {
        text = `${minutes} min`;
      } else {
        text = `${hours}h ${minutes}m`;
      }

      setElapsedTime({ text, hoursCeil });
    };

    calculateElapsed();
    const timer = setInterval(calculateElapsed, 30000); // Update every 30s
    return () => clearInterval(timer);
  }, [vehiculo.hora_entrada]);

  const tipoNormalizado = vehiculo.tipo.toLowerCase();
  const getIcon = () => {
    if (tipoNormalizado.includes('moto')) return <Bike size={16} />;
    if (tipoNormalizado.includes('camion')) return <Truck size={16} />;
    return <Car size={16} />;
  };

  const getTipoClass = () => {
    if (tipoNormalizado.includes('moto')) return 'motocicleta';
    if (tipoNormalizado.includes('camion')) return 'camioneta';
    return 'automovil';
  };

  const horaEntradaFormatted = new Date(vehiculo.hora_entrada).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const fechaEntradaFormatted = new Date(vehiculo.hora_entrada).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  const estimatedCost = (elapsedTime.hoursCeil * 5).toFixed(2);
  const isProcessing = loadingSalidaId === vehiculo.id;

  return (
    <div className="vehicle-card">
      <div className={`vehicle-card-accent-bar ${getTipoClass()}`} />

      <div className="vehicle-card-header">
        {/* Placa Stamped */}
        <div className="license-plate-badge">
          <span className="plate-blue-strip">BO</span>
          <span className="plate-text">{vehiculo.placa}</span>
        </div>

        {/* Tipo Badge */}
        <span className={`vehicle-type-tag ${getTipoClass()}`}>
          {getIcon()}
          <span>{vehiculo.tipo}</span>
        </span>
      </div>

      {/* Detalles del Vehículo */}
      <div className="vehicle-card-details">
        <div className="detail-row">
          <span className="detail-label">
            <Clock size={14} />
            <span>Ingreso:</span>
          </span>
          <span className="detail-value">
            {horaEntradaFormatted} ({fechaEntradaFormatted})
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">
            <span>Tiempo en patio:</span>
          </span>
          <span className="live-time-chip">
            ⏱ {elapsedTime.text || 'Iniciando'}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">
            <DollarSign size={14} />
            <span>Costo acumulado:</span>
          </span>
          <span className="cost-estimate-badge">
            ${estimatedCost}
          </span>
        </div>
      </div>

      {/* Botón Registrar Salida */}
      <button
        type="button"
        className="btn-checkout"
        onClick={() => onSalida(vehiculo)}
        disabled={isProcessing}
      >
        <LogOut size={16} />
        <span>{isProcessing ? 'Procesando...' : 'Registrar Salida'}</span>
      </button>
    </div>
  );
};

export default VehicleCard;
