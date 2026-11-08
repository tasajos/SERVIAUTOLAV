import React, { useState } from 'react';
import { PlusCircle, Car, Bike, Truck, Info, CreditCard, Loader2 } from 'lucide-react';
import { registrarIngreso } from '../services/api';
import type { TipoVehiculo } from '../types/vehicle';

interface VehicleFormProps {
  onRefresh: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({ onRefresh, showToast }) => {
  const [placa, setPlaca] = useState('');
  const [tipo, setTipo] = useState<TipoVehiculo>('automovil');
  const [loading, setLoading] = useState(false);

  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Force uppercase and remove invalid characters
    const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setPlaca(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const plateTrimmed = placa.trim();
    if (!plateTrimmed) {
      showToast('Por favor ingrese la placa del vehículo', 'error');
      return;
    }

    setLoading(true);
    try {
      await registrarIngreso(plateTrimmed, tipo);
      showToast(`¡Vehículo con placa ${plateTrimmed} registrado con éxito!`, 'success');
      setPlaca('');
      onRefresh();
    } catch (error: any) {
      console.error('Error al registrar vehículo', error);
      const errMsg =
        error?.response?.data?.error ||
        error?.message ||
        'Error de conexión con el backend. Verifique que el servidor esté activo.';
      showToast(`Error al registrar: ${errMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header card-header-styled">
        <div className="card-title-group">
          <div className="card-icon-badge">
            <PlusCircle size={20} />
          </div>
          <div>
            <h3 className="card-title">Registrar Ingreso</h3>
            <p className="card-subtitle">Asignar turno y hora de entrada</p>
          </div>
        </div>
      </div>

      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {/* Campo Placa */}
          <div className="form-group">
            <label className="form-label" htmlFor="placa-input">
              Placa del Vehículo <span className="required-dot">*</span>
            </label>
            <div className="plate-input-container">
              <CreditCard className="plate-input-icon" size={20} />
              <input
                id="placa-input"
                type="text"
                className="plate-input"
                placeholder="ABC-123"
                value={placa}
                onChange={handlePlacaChange}
                maxLength={10}
                required
                autoComplete="off"
              />
            </div>

            {/* Vista previa de placa estilo patente */}
            <div className="plate-preview">
              <span>Vista previa de patente:</span>
              <div className="plate-preview-badge">
                <span className="plate-flag-strip" />
                <span>{placa || 'PLACA'}</span>
              </div>
            </div>
          </div>

          {/* Selector de Tipo de Vehículo */}
          <div className="form-group">
            <label className="form-label">
              Tipo de Vehículo <span className="required-dot">*</span>
            </label>
            <div className="type-grid">
              {/* Opción Automóvil */}
              <div
                className={`type-tile ${tipo === 'automovil' ? 'active' : ''}`}
                onClick={() => setTipo('automovil')}
                role="button"
                tabIndex={0}
              >
                <div className="type-tile-radio">
                  <div className="type-tile-radio-dot" />
                </div>
                <div className="type-tile-icon-box">
                  <Car size={22} />
                </div>
                <div className="type-tile-info">
                  <div className="type-tile-name">Automóvil</div>
                  <div className="type-tile-desc">Sedán, hatchback, familiar</div>
                </div>
              </div>

              {/* Opción Motocicleta */}
              <div
                className={`type-tile ${tipo === 'motocicleta' ? 'active' : ''}`}
                onClick={() => setTipo('motocicleta')}
                role="button"
                tabIndex={0}
              >
                <div className="type-tile-radio">
                  <div className="type-tile-radio-dot" />
                </div>
                <div className="type-tile-icon-box">
                  <Bike size={22} />
                </div>
                <div className="type-tile-info">
                  <div className="type-tile-name">Motocicleta</div>
                  <div className="type-tile-desc">Motos y scooters</div>
                </div>
              </div>

              {/* Opción Camioneta */}
              <div
                className={`type-tile ${tipo === 'camioneta' ? 'active' : ''}`}
                onClick={() => setTipo('camioneta')}
                role="button"
                tabIndex={0}
              >
                <div className="type-tile-radio">
                  <div className="type-tile-radio-dot" />
                </div>
                <div className="type-tile-icon-box">
                  <Truck size={22} />
                </div>
                <div className="type-tile-info">
                  <div className="type-tile-name">Camioneta</div>
                  <div className="type-tile-desc">SUV, 4x4, furgoneta</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarifa Informativa */}
          <div className="rate-notice-box">
            <Info size={18} className="rate-notice-icon" />
            <div className="rate-notice-text">
              <strong>Tarifa Base: $5.00 por hora</strong>. La hora de entrada se registra automáticamente según la hora del sistema.
            </div>
          </div>

          {/* Botón de Envío */}
          <button type="submit" className="btn-submit-entry" disabled={loading || !placa.trim()}>
            {loading ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>Registrando...</span>
              </>
            ) : (
              <>
                <PlusCircle size={18} />
                <span>Ingresar al Lavadero</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VehicleForm;
