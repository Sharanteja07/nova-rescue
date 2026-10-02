import React from 'react';
import { X, Compass, CheckCircle2, ArrowRight } from 'lucide-react';

interface PromptJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROMPT_JOURNEY_STEPS = [
  {
    step: 'Prompt 1',
    title: 'Business Diagnosis',
    description: 'Analyzed the six-month performance data and customer signals to identify the underlying business problem rather than optimizing for surface-level growth.',
    keyInsight: 'Identified that top-of-funnel user growth (+46%) masked a critical collapse in repeat purchasing (41% → 27%) and a doubling of cancellations (6% → 11%).'
  },
  {
    step: 'Prompt 2',
    title: 'Hypothesis Challenge',
    description: 'Compared retention, delivery, inventory, marketing and partner-store hypotheses against the case evidence.',
    keyInsight: 'Disproved marketing fatigue; grounded that 35% of cancellations stem from inventory unconfirmed at stores and 27% from delivery delays.'
  },
  {
    step: 'Prompt 3',
    title: 'Root Cause',
    description: 'Investigated the relationship between order reliability, cancellations, support interactions and repeat purchasing.',
    keyInsight: 'Discovered the "72% Rule": customers completing 3 orders have a 72% probability of ordering again next month. Unreliable early orders permanently break retention.'
  },
  {
    step: 'Prompt 4',
    title: 'Product Direction',
    description: 'Explored digital interventions that could be implemented without warehouses, major infrastructure expansion, hundreds of employees or unsustainable discounts.',
    keyInsight: 'Selected an AI-powered software intervention engine (NOVA RESCUE) over costly dark-store capital investments, operating within existing 620 store partner networks.'
  },
  {
    step: 'Prompt 5',
    title: 'Rescue Workflow',
    description: 'Designed a system that detects risky orders, identifies likely failure causes and recommends an operational intervention.',
    keyInsight: 'Architected the 5 core operational rescues: Store Switching, Product Substitution, Priority Courier Rerouting, Proactive Expectation Management, and Monitored Proceed.'
  },
  {
    step: 'Prompt 6',
    title: 'Business Impact',
    description: 'Designed a scenario model to estimate the potential effect on cancellation, support load, GMV and retention.',
    keyInsight: 'Built a transparent scenario model with documented assumptions projecting a reduction from 11% to 6.2% cancellation rate, saving ~1,940 orders/mo and ₹88L+ in customer retention LTV.'
  }
];

export const PromptJourneyModal: React.FC<PromptJourneyModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="journey-modal-title">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={18} color="#3b82f6" aria-hidden="true" />
            <h2 id="journey-modal-title" className="modal-title">PROMPTWARS Journey: 6-Stage Problem Solving</h2>
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

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.5, fontStyle: 'italic', backgroundColor: '#090d16', padding: '0.625rem 0.875rem', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
            Note: These prompts represent the key decision points in the reasoning journey; the complete AI conversation is not included.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {PROMPT_JOURNEY_STEPS.map((step, idx) => (
              <div 
                key={idx}
                style={{
                  backgroundColor: '#090d16',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.375rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '0.6875rem', 
                      fontWeight: 700, 
                      backgroundColor: 'rgba(59, 130, 246, 0.15)', 
                      color: '#93c5fd', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                      {step.step}
                    </span>
                    <strong style={{ fontSize: '0.875rem', color: '#ffffff' }}>
                      {step.title}
                    </strong>
                  </div>
                  <CheckCircle2 size={16} color="#10b981" aria-hidden="true" />
                </div>

                <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {step.description}
                </p>

                <div style={{ 
                  marginTop: '0.25rem', 
                  padding: '0.5rem 0.75rem', 
                  backgroundColor: '#101726', 
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  borderLeft: '2px solid #3b82f6'
                }}>
                  <strong style={{ color: '#93c5fd' }}>Operational Output: </strong>
                  {step.keyInsight}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-rescue-action primary">
            Close Journey
          </button>
        </div>
      </div>
    </div>
  );
};
