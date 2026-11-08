import React, { useState, useMemo } from 'react';
import {
  LayoutGrid,
  List,
  Search,
  RefreshCw,
  Car,
  Bike,
  Truck,
  CarFront,
  LogOut,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { Vehiculo } from '../types/vehicle';
import VehicleCard from './VehicleCard';

interface VehicleListProps {
  vehiculos: Vehiculo[];
  loading: boolean;
  onRefresh: () => void;
  onSalida: (vehiculo: Vehiculo) => void;
  loadingSalidaId: number | null;
}

export const VehicleList: React.FC<VehicleListProps> = ({
  vehiculos,
  loading,
  onRefresh,
  onSalida,
  loadingSalidaId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'automovil' | 'motocicleta' | 'camioneta'>('todos');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Counts for each category
  const counts = useMemo(() => {
    return {
      todos: vehiculos.length,
      automovil: vehiculos.filter(
        (v) => v.tipo.toLowerCase() === 'automovil' || v.tipo.toLowerCase() === 'automóvil'
      ).length,
      motocicleta: vehiculos.filter((v) => v.tipo.toLowerCase() === 'motocicleta').length,
      camioneta: vehiculos.filter((v) => v.tipo.toLowerCase() === 'camioneta').length,
    };
  }, [vehiculos]);

  // Filter vehicles
  const filteredVehiculos = useMemo(() => {
    return vehiculos.filter((v) => {
      const matchSearch = v.placa.toLowerCase().includes(searchTerm.toLowerCase().trim());
      if (!matchSearch) return false;

      if (selectedFilter === 'todos') return true;
      if (selectedFilter === 'automovil') {
        return v.tipo.toLowerCase() === 'automovil' || v.tipo.toLowerCase() === 'automóvil';
      }
      return v.tipo.toLowerCase() === selectedFilter;
    });
  }, [vehiculos, searchTerm, selectedFilter]);

  return (
    <div className="card">
      {/* Cabecera de la Sección */}
      <div className="card-header card-header-styled">
        <div className="card-title-group">
          <div className="card-icon-badge">
            <CarFront size={20} />
          </div>
          <div>
            <h3 className="card-title">Vehículos Activos en Patio</h3>
            <p className="card-subtitle">
              {vehiculos.length} vehículo{vehiculos.length === 1 ? '' : 's'} actualmente en servicio
            </p>
          </div>
        </div>

        <button
          className="btn-refresh"
          onClick={onRefresh}
          title="Actualizar lista de vehículos"
          disabled={loading}
          style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff' }}
        >
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
        </button>
      </div>

      <div className="card-body">
        {/* Barra de Herramientas y Filtros */}
        <div className="toolbar-wrap">
          <div className="toolbar-top-row">
            {/* Buscador de Placas */}
            <div className="search-container">
              <Search className="search-input-icon" size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por placa (ej: ABC-123)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Alternador de Vista (Tarjetas / Tabla) */}
            <div className="view-controls">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Vista de Tarjetas"
              >
                <LayoutGrid size={16} />
                <span>Tarjetas</span>
              </button>

              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Vista de Tabla"
              >
                <List size={16} />
                <span>Tabla</span>
              </button>
            </div>
          </div>

          {/* Chips de Categorías */}
          <div className="filter-chips">
            <button
              type="button"
              className={`filter-chip ${selectedFilter === 'todos' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('todos')}
            >
              <span>Todos</span>
              <span className="filter-chip-count">{counts.todos}</span>
            </button>

            <button
              type="button"
              className={`filter-chip ${selectedFilter === 'automovil' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('automovil')}
            >
              <Car size={14} />
              <span>Autos</span>
              <span className="filter-chip-count">{counts.automovil}</span>
            </button>

            <button
              type="button"
              className={`filter-chip ${selectedFilter === 'motocicleta' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('motocicleta')}
            >
              <Bike size={14} />
              <span>Motos</span>
              <span className="filter-chip-count">{counts.motocicleta}</span>
            </button>

            <button
              type="button"
              className={`filter-chip ${selectedFilter === 'camioneta' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('camioneta')}
            >
              <Truck size={14} />
              <span>Camionetas</span>
              <span className="filter-chip-count">{counts.camioneta}</span>
            </button>
          </div>
        </div>

        {/* Contenido: Cards o Tabla */}
        {filteredVehiculos.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon-box">
              <Sparkles size={32} />
            </div>
            <h4 className="empty-state-title">
              {searchTerm ? 'No se encontraron resultados' : 'Sin vehículos activos'}
            </h4>
            <p className="empty-state-desc">
              {searchTerm
                ? `No hay vehículos que coincidan con la búsqueda "${searchTerm}".`
                : 'El patio de lavado está despejado. Registra un nuevo vehículo usando el formulario a la izquierda.'}
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          /* Grid de Cards */
          <div className="vehicles-grid">
            {filteredVehiculos.map((vehiculo) => (
              <VehicleCard
                key={vehiculo.id}
                vehiculo={vehiculo}
                onSalida={onSalida}
                loadingSalidaId={loadingSalidaId}
              />
            ))}
          </div>
        ) : (
          /* Tabla Alternativa */
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patente / Placa</th>
                  <th>Tipo</th>
                  <th>Hora Ingreso</th>
                  <th style={{ textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehiculos.map((v) => {
                  const isProcessing = loadingSalidaId === v.id;
                  const tipoNorm = v.tipo.toLowerCase();
                  const getBadgeClass = () => {
                    if (tipoNorm.includes('moto')) return 'motocicleta';
                    if (tipoNorm.includes('camion')) return 'camioneta';
                    return 'automovil';
                  };

                  return (
                    <tr key={v.id}>
                      <td>
                        <div className="license-plate-badge" style={{ padding: '2px 8px' }}>
                          <span className="plate-blue-strip">BO</span>
                          <span className="plate-text" style={{ fontSize: '1rem', letterSpacing: '1.5px' }}>
                            {v.placa}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`vehicle-type-tag ${getBadgeClass()}`}>
                          {v.tipo}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} style={{ color: '#64748b' }} />
                          <span>{new Date(v.hora_entrada).toLocaleString()}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-checkout"
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', margin: '0 auto', display: 'inline-flex', width: 'auto' }}
                          onClick={() => onSalida(v)}
                          disabled={isProcessing}
                        >
                          <LogOut size={14} />
                          <span>{isProcessing ? 'Procesando...' : 'Registrar Salida'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleList;
