import React, { useState } from 'react';
import VehicleForm from './components/VehicleForm';
import VehicleList from './components/VehicleList';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Sistema de Control de Lavado de Vehículos</h1>
      <VehicleForm onRefresh={() => setRefreshTrigger(prev => prev + 1)} />
      <VehicleList refreshTrigger={refreshTrigger} />
    </div>
  );
}

export default App;