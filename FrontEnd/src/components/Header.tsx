import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, DollarSign } from 'lucide-react';

interface HeaderProps {
  isBackendHealthy: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isBackendHealthy }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="main-header">
      <div className="header-inner">
        <div className="brand-section">
          <div className="brand-logo-badge" title="ServiAutoLav">
            <Sparkles size={28} />
          </div>
          <div>
            <h1 className="brand-title">
              SERVI<span className="brand-highlight">AUTOLAV</span>
            </h1>
            <p className="brand-subtitle">Control & Gestión Profesional de Lavado y Parqueo</p>
          </div>
        </div>

        <div className="header-meta">
          <div className="tarifa-badge" title="Tarifa por hora activa">
            <DollarSign size={16} />
            <span>Tarifa: $5.00 / hr</span>
          </div>

          <div className="live-clock-badge">
            <Clock size={16} />
            <span>{time || '--:--:--'}</span>
          </div>

          <div
            className="system-status"
            style={{
              color: isBackendHealthy ? '#34d399' : '#fbbf24',
              backgroundColor: isBackendHealthy
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(251, 191, 36, 0.15)',
              borderColor: isBackendHealthy
                ? 'rgba(16, 185, 129, 0.3)'
                : 'rgba(251, 191, 36, 0.3)',
            }}
          >
            <span
              className="status-dot"
              style={{
                backgroundColor: isBackendHealthy ? '#34d399' : '#fbbf24',
                boxShadow: isBackendHealthy ? '0 0 8px #34d399' : '0 0 8px #fbbf24',
              }}
            />
            <span>{isBackendHealthy ? 'API Online' : 'Modo Local / Verificando'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
