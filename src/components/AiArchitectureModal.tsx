import React, { useEffect } from 'react';
import { X, ShieldCheck, Cpu, Server, Lock } from 'lucide-react';
import { ServerAiStatus } from '../services/aiService';

interface AiArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverStatus: ServerAiStatus;
}

export const AiArchitectureModal: React.FC<AiArchitectureModalProps> = ({
  isOpen,
  onClose,
  serverStatus
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="sec-modal-title">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="#10b981" aria-hidden="true" />
            <h2 id="sec-modal-title" className="modal-title">Secure AI Architecture & Status</h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn-secondary" 
            style={{ padding: '4px', border: 'none' }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Current Connection Status */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#090d16',
            border: `1px solid ${serverStatus.configured ? '#10b981' : '#2d3b55'}`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Server AI Connection
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: serverStatus.configured ? '#34d399' : '#facc15', marginTop: '2px' }}>
                {serverStatus.configured ? 'Google Gemini 1.5 Flash (Server-Side Proxy)' : 'Deterministic Operations Fallback (Active)'}
              </div>
            </div>
            <div style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: serverStatus.configured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
              color: serverStatus.configured ? '#6ee7b7' : '#fde047',
              border: `1px solid ${serverStatus.configured ? '#10b981' : '#eab308'}`
            }}>
              {serverStatus.configured ? 'LIVE PROXY' : 'OFFLINE SAFE'}
            </div>
          </div>

          {/* Architecture Flow Diagram */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
              Zero-Trust Credential Flow
            </div>
            <div style={{
              backgroundColor: '#090d16',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem' }}>
                <Lock size={16} color="#60a5fa" />
                <div>
                  <strong style={{ color: '#ffffff' }}>1. Browser Client (Zero Secrets):</strong>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    Browser dispatches sanitized order telemetry to <code>/api/analyze-order</code>. Never requests or stores API keys.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem' }}>
                <Server size={16} color="#10b981" />
                <div>
                  <strong style={{ color: '#ffffff' }}>2. Node.js Server Proxy:</strong>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    Server reads <code>process.env.GEMINI_API_KEY</code> securely from backend environment. Initiates server-to-server TLS call to Google Gemini.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem' }}>
                <Cpu size={16} color="#f59e0b" />
                <div>
                  <strong style={{ color: '#ffffff' }}>3. Schema Validation & Delivery:</strong>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    Server parses and validates structured JSON schema before responding to client. If unavailable, deterministic fallback responds instantly.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Guide for Ops Team */}
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '6px',
            padding: '0.75rem 1rem'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', marginBottom: '4px' }}>
              How to Configure Server-Side API Key
            </div>
            <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              Add <code>GEMINI_API_KEY=your_key_here</code> to your server's <code>.env.local</code> file or deployment environment variables (Vercel, Docker, or Node server). 
              Restart the server to activate live Gemini reasoning.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-rescue-action primary">
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
