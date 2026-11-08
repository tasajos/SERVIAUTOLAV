import React, { useState } from 'react';
import api from '../services/api';

interface Props {
  onRefresh: () => void;
}

const VehicleForm: React.FC<Props> = ({ onRefresh }) => {
  const [placa, setPlaca] = useState('');
  const [tipo, setTipo] = useState('automovil');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vehiculos', { placa, tipo });
      setPlaca('');
      onRefresh();
    } catch (error) {
      alert('Error al registrar vehículo');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Registrar Ingreso</h3>
      <input 
        type="text" 
        placeholder="Placa del vehículo" 
        value={placa} 
        onChange={(e) => setPlaca(e.target.value)} 
        required 
        style={{ marginRight: '10px', padding: '8px' }}
      />
      <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ marginRight: '10px', padding: '8px' }}>
        <option value="automovil">Automóvil</option>
        <option value="motocicleta">Motocicleta</option>
        <option value="camioneta">Camioneta</option>
      </select>
      <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Ingresar
      </button>
    </form>
  );
};

export default VehicleForm;