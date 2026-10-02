import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  BarChart3, 
  Cpu, 
  ShieldCheck, 
  RotateCcw,
  MapPin
} from 'lucide-react';
import { ServerAiStatus } from '../services/aiService';

interface HeaderProps {
  activeTab: 'CONSOLE' | 'IMPACT';
  onTabChange: (tab: 'CONSOLE' | 'IMPACT') => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  serverStatus: ServerAiStatus;
  onOpenArchitectureModal: () => void;
  onResetDemoData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  selectedCity,
  onCityChange,
  serverStatus,
  onOpenArchitectureModal,
  onResetDemoData
}) => {
  const isLive = serverStatus.configured;

  return (
    <header className="app-header" role="banner">
      <div className="header-inner">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-icon-box" aria-hidden="true">
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="brand-title">
              NOVA RESCUE
              <span className="brand-badge">Ops Control</span>
            </div>
            <p className="brand-tagline">AI-Powered Order Reliability & Retention Engine</p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="header-center-nav" aria-label="Primary Application Views">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'CONSOLE' ? 'active' : ''}`}
            onClick={() => onTabChange('CONSOLE')}
            aria-selected={activeTab === 'CONSOLE'}
          >
            <Activity size={16} aria-hidden="true" />
            Operations Console
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'IMPACT' ? 'active' : ''}`}
            onClick={() => onTabChange('IMPACT')}
            aria-selected={activeTab === 'IMPACT'}
          >
            <BarChart3 size={16} aria-hidden="true" />
            Business Impact & Retention
          </button>
        </nav>

        {/* Controls */}
        <div className="header-controls">
          {/* City Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} color="#94a3b8" aria-hidden="true" />
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="text-input"
              style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto', backgroundColor: '#162035' }}
              aria-label="Filter orders by city"
            >
              <option value="ALL">All Cities (3)</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi-NCR">Delhi-NCR</option>
            </select>
          </div>

          {/* AI Engine Status (Server-Side Proxy Status) */}
          <button
            type="button"
            onClick={onOpenArchitectureModal}
            className="ai-status-pill"
            style={{ cursor: 'pointer', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-muted)' }}
            title={isLive ? "Server-Side Gemini 1.5 Flash Proxy Connected" : "Deterministic Operations Fallback Engine Active (Safe Default)"}
            aria-label="Inspect AI Security & Server Architecture"
          >
            <span 
              className={`status-dot ${isLive ? 'active' : 'fallback'}`} 
              aria-hidden="true"
            />
            <Cpu size={14} color={isLive ? "#10b981" : "#f59e0b"} aria-hidden="true" />
            <span>{isLive ? 'Server Gemini Proxy' : 'Deterministic Mode'}</span>
          </button>

          {/* AI Architecture & Security Modal Trigger */}
          <button
            type="button"
            onClick={onOpenArchitectureModal}
            className="btn-secondary"
            title="Inspect AI Security Architecture"
            aria-label="Inspect AI Security Architecture"
          >
            <ShieldCheck size={14} aria-hidden="true" />
            <span>AI Security</span>
          </button>

          {/* Reset Demo State */}
          <button
            type="button"
            onClick={onResetDemoData}
            className="btn-secondary"
            title="Reset demonstration state"
            aria-label="Reset demonstration orders"
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
