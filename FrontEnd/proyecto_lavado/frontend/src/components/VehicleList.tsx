import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Vehiculo {
  id: number;
  placa: string;
  tipo: string;
  hora_entrada: string;
}

interface Props {
  refreshTrigger: number;
}

const VehicleList: React.FC<Props> = ({ refreshTrigger }) => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);

  useEffect(() => {
    fetchVehiculos();
  }, [refreshTrigger]);

  const fetchVehiculos = async () => {
    try {
      const response = await api.get('/vehiculos');
      setVehiculos(response.data);
    } catch (error) {
      console.error('Error al obtener vehiculos', error);
    }
  };

  const registrarSalida = async (id: number) => {
    try {
      const url = '/vehiculos/' + id + '/salida';
      const response = await api.put(url);
      const mensaje = 'Salida registrada. Horas: ' + response.data.horas + '. Costo total: $' + response.data.costoTotal;
      alert(mensaje);
      fetchVehiculos();
    } catch (error) {
      alert('Error al registrar salida');
    }
  };

  return (
    <div>
      <h3>Vehiculos Activos</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Placa</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Tipo</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Hora Entrada</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Accion</th>
          </tr>
        </thead>
        <tbody>
          {vehiculos.map((v) => (
            <tr key={v.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{v.placa}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{v.tipo}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(v.hora_entrada).toLocaleString()}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <button
                  onClick={() => registrarSalida(v.id)}
                  style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Registrar Salida
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleList;
