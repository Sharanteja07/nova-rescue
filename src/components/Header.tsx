import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  BarChart3, 
  Cpu, 
  Key, 
  RotateCcw,
  MapPin
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'CONSOLE' | 'IMPACT';
  onTabChange: (tab: 'CONSOLE' | 'IMPACT') => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  isAiLive: boolean;
  onOpenApiKeyModal: () => void;
  onResetDemoData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  selectedCity,
  onCityChange,
  isAiLive,
  onOpenApiKeyModal,
  onResetDemoData
}) => {
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

          {/* AI Engine Status */}
          <div 
            className="ai-status-pill"
            title={isAiLive ? "Google Gemini 1.5 Flash API active" : "Deterministic Operations Fallback Engine active"}
          >
            <span 
              className={`status-dot ${isAiLive ? 'active' : 'fallback'}`} 
              aria-hidden="true"
            />
            <Cpu size={14} color={isAiLive ? "#10b981" : "#f59e0b"} aria-hidden="true" />
            <span>{isAiLive ? 'Gemini 1.5 Flash' : 'Deterministic Mode'}</span>
          </div>

          {/* Configure API Key */}
          <button
            type="button"
            onClick={onOpenApiKeyModal}
            className="btn-secondary"
            title="Configure Gemini API Key"
            aria-label="Configure AI settings"
          >
            <Key size={14} aria-hidden="true" />
            <span>AI Config</span>
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
