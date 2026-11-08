import React from 'react';
import { X, Printer, CheckCircle, Car, Bike, Truck } from 'lucide-react';
import type { TicketSalidaData } from '../types/vehicle';

interface CheckoutModalProps {
  data: TicketSalidaData | null;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  const tipoNormalizado = data.tipo.toLowerCase();
  const getIcon = () => {
    if (tipoNormalizado.includes('moto')) return <Bike size={18} />;
    if (tipoNormalizado.includes('camion')) return <Truck size={18} />;
    return <Car size={18} />;
  };

  const horaEntradaFormatted = new Date(data.horaEntrada).toLocaleString([], {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const horaSalidaFormatted = new Date(data.horaSalida).toLocaleString([], {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-ticket" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del Ticket */}
        <div className="ticket-header">
          <button className="ticket-close-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={18} />
          </button>
          <h3 className="ticket-title">Comprobante de Salida</h3>
          <p className="ticket-subtitle">ServiAutoLav • Control y Cobro</p>
        </div>

        {/* Cuerpo del Ticket */}
        <div className="ticket-body">
          {/* Placa Stamped */}
          <div className="ticket-plate-box">
            <span className="ticket-plate-label">Vehículo Retirado</span>
            <div className="ticket-plate-value">{data.placa}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px', fontSize: '0.82rem', color: '#64748b' }}>
              {getIcon()}
              <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{data.tipo}</span>
            </div>
          </div>

          {/* Desglose de Tiempo y Tarifa */}
          <div className="ticket-breakdown">
            <div className="ticket-row">
              <span>Hora de Ingreso:</span>
              <span className="ticket-row bold">{horaEntradaFormatted}</span>
            </div>

            <div className="ticket-row">
              <span>Hora de Salida:</span>
              <span className="ticket-row bold">{horaSalidaFormatted}</span>
            </div>

            <div className="ticket-divider" />

            <div className="ticket-row">
              <span>Tiempo Computado:</span>
              <span className="ticket-row bold">{data.horas} hora{data.horas > 1 ? 's' : ''}</span>
            </div>

            <div className="ticket-row">
              <span>Tarifa por Hora:</span>
              <span className="ticket-row bold">${data.tarifaHora.toFixed(2)}</span>
            </div>
          </div>

          {/* Total Destacado en Amarillo y Azul */}
          <div className="ticket-total-box">
            <div className="ticket-total-label">Total a Cobrar</div>
            <div className="ticket-total-amount">${data.costoTotal.toFixed(2)}</div>
          </div>

          {/* Botones de Acción */}
          <div className="ticket-actions">
            <button type="button" className="btn-ticket-print" onClick={handlePrint}>
              <Printer size={16} />
              <span>Imprimir</span>
            </button>

            <button type="button" className="btn-ticket-done" onClick={onClose}>
              <CheckCircle size={16} />
              <span>Finalizar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
