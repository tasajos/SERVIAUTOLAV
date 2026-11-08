import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import VehicleForm from './components/VehicleForm';
import VehicleList from './components/VehicleList';
import CheckoutModal from './components/CheckoutModal';
import Toast from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { getVehiculos, registrarSalida } from './services/api';
import type { Vehiculo, TicketSalidaData } from './types/vehicle';
import './App.css';

export function App() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const [loadingSalidaId, setLoadingSalidaId] = useState<number | null>(null);
  const [ticketData, setTicketData] = useState<TicketSalidaData | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const showToast = useCallback((text: string, type: 'success' | 'error') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, text, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Vehicles
  const fetchVehiculos = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await getVehiculos();
      setVehiculos(Array.isArray(data) ? data : []);
      setIsBackendHealthy(true);
    } catch (error) {
      console.warn('Backend no disponible temporalmente:', error);
      setIsBackendHealthy(false);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    getVehiculos()
      .then((data) => {
        if (!ignore) {
          setVehiculos(Array.isArray(data) ? data : []);
          setIsBackendHealthy(true);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.warn('Backend no disponible temporalmente:', error);
          setIsBackendHealthy(false);
        }
      });

    // Auto-refresh every 20 seconds
    const interval = setInterval(() => {
      fetchVehiculos(true);
    }, 20000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [fetchVehiculos]);

  // Handle Checkout / Registrar Salida
  const handleSalida = async (vehiculo: Vehiculo) => {
    setLoadingSalidaId(vehiculo.id);
    try {
      const response = await registrarSalida(vehiculo.id);

      const ticket: TicketSalidaData = {
        id: vehiculo.id,
        placa: vehiculo.placa,
        tipo: vehiculo.tipo,
        horaEntrada: vehiculo.hora_entrada,
        horaSalida: response.horaSalida || new Date().toISOString(),
        horas: response.horas || 1,
        tarifaHora: 5.0,
        costoTotal: Number(response.costoTotal) || 5.0,
      };

      setTicketData(ticket);
      showToast(
        `Salida registrada para ${vehiculo.placa}. Total a cobrar: $${ticket.costoTotal.toFixed(2)}`,
        'success'
      );
      fetchVehiculos();
    } catch (error: any) {
      console.error('Error al registrar salida', error);
      const errMsg =
        error?.response?.data?.error ||
        error?.message ||
        'Error al procesar la salida en el servidor.';
      showToast(`Error al procesar salida: ${errMsg}`, 'error');
    } finally {
      setLoadingSalidaId(null);
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notificaciones Flotantes */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Header con colores azul, amarillo y blanco */}
      <Header isBackendHealthy={isBackendHealthy} />

      <main className="main-content">
        {/* Métricas y Estadísticas en Cards */}
        <StatsCards vehiculos={vehiculos} />

        {/* Dashboard: Formulario a la izquierda, Lista a la derecha */}
        <div className="dashboard-layout">
          {/* Tarjeta de Formulario de Ingreso */}
          <section aria-label="Formulario de ingreso">
            <VehicleForm
              onRefresh={fetchVehiculos}
              showToast={showToast}
            />
          </section>

          {/* Tarjeta de Lista y Gestión de Vehículos Activos */}
          <section aria-label="Vehículos activos">
            <VehicleList
              vehiculos={vehiculos}
              loading={loading}
              onRefresh={fetchVehiculos}
              onSalida={handleSalida}
              loadingSalidaId={loadingSalidaId}
            />
          </section>
        </div>
      </main>

      {/* Modal / Comprobante de Cobro al Registrar Salida */}
      <CheckoutModal
        data={ticketData}
        onClose={() => setTicketData(null)}
      />
    </div>
  );
}

export default App;
