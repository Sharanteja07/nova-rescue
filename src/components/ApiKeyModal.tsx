import React, { useState } from 'react';
import { getActiveGeminiApiKey, setActiveGeminiApiKey } from '../services/aiService';
import { X, Key, Shield, Check, Cpu } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated
}) => {
  const currentKey = getActiveGeminiApiKey() || '';
  const [keyInput, setKeyInput] = useState(currentKey);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setActiveGeminiApiKey(keyInput.trim() || null);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onKeyUpdated();
      onClose();
    }, 600);
  };

  const handleClear = () => {
    setActiveGeminiApiKey(null);
    setKeyInput('');
    onKeyUpdated();
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="api-modal-title">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={18} color="#3b82f6" aria-hidden="true" />
            <h2 id="api-modal-title" className="modal-title">Google Gemini AI Configuration</h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn-secondary" 
            style={{ padding: '4px', border: 'none' }}
            aria-label="Close API configuration modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            NOVA RESCUE utilizes <strong>Google Gemini 1.5 Flash / 2.0</strong> for deep operational root-cause analysis 
            and structured rescue recommendations.
          </p>

          <div style={{ 
            backgroundColor: '#090d16', 
            border: '1px solid #1e293b', 
            borderRadius: '6px', 
            padding: '0.875rem' 
          }}>
            <label htmlFor="gemini-key-input" style={{ fontSize: '0.75rem', color: '#f8fafc', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Gemini API Key
            </label>
            <input
              id="gemini-key-input"
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="text-input"
              autoComplete="off"
            />
            <p style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '6px' }}>
              Your API key is stored securely in your browser's local session and transmitted exclusively to Google's official Gemini API endpoints.
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'rgba(59, 130, 246, 0.08)', 
            border: '1px solid rgba(59, 130, 246, 0.2)', 
            borderRadius: '6px', 
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <Cpu size={16} color="#60a5fa" style={{ marginTop: '2px', flexShrink: 0 }} aria-hidden="true" />
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
              <strong>Zero-Dependency Fallback Guarantee:</strong> If no API key is provided, NOVA RESCUE automatically operates seamlessly using its internal 
              deterministic rule-based reasoning engine. The prototype is 100% functional offline without an external API.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {currentKey && (
            <button 
              type="button" 
              onClick={handleClear} 
              className="btn-secondary"
              style={{ color: '#f87171' }}
            >
              Clear & Use Fallback
            </button>
          )}
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="btn-rescue-action primary">
            {saveSuccess ? <Check size={14} /> : <Key size={14} />}
            {saveSuccess ? 'Saved' : 'Save & Activate'}
          </button>
        </div>
      </div>
    </div>
  );
};
