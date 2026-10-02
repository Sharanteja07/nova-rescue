import React, { useState } from 'react';
import { Order } from '../types';
import { 
  calculateSessionImpact, 
  projectPlatformScenario 
} from '../engine/businessImpact';
import { 
  TrendingUp, 
  ShieldCheck, 
  HelpCircle, 
  Users, 
  Sliders, 
  AlertCircle,
  FileText,
  Calculator,
  Info
} from 'lucide-react';

interface BusinessImpactViewProps {
  orders: Order[];
}

export const BusinessImpactView: React.FC<BusinessImpactViewProps> = ({ orders }) => {
  const [adoptionRate, setAdoptionRate] = useState<number>(85); // 85% simulated platform store coverage
  const sessionImpact = calculateSessionImpact(orders);
  const projectedScenario = projectPlatformScenario(adoptionRate);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="impact-dashboard" role="region" aria-label="Business Impact and Retention Dashboard">
      {/* 1. Header Banner with Grounded Evidence Narrative */}
      <div className="impact-hero-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={22} color="#3b82f6" aria-hidden="true" />
          <h1 className="impact-hero-title">Business Impact & Retention Scenario Engine</h1>
        </div>
        <p className="impact-hero-subtitle">
          62% of recorded cancellations are attributed to two operational categories in the case data: 
          <strong> product unavailability (35%)</strong> and <strong>customer cancellation because of delivery delay (27%)</strong>. 
          These categories represent the primary operational rescue opportunity; the case does not prove that all 62% are fully preventable. 
          NOVA RESCUE models the commercial and retention impact of intercepting these orders before failure occurs.
        </p>

        {/* Methodological Taxonomy Notice */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          flexWrap: 'wrap', 
          padding: '0.625rem 0.875rem', 
          backgroundColor: '#090d16', 
          borderRadius: '6px', 
          border: '1px solid #1e293b',
          fontSize: '0.6875rem' 
        }}>
          <span style={{ color: '#94a3b8' }}>
            <strong style={{ color: '#ffffff' }}>Methodological Framework:</strong>
          </span>
          <span style={{ color: '#fca5a5' }}>● Historical Case Evidence (Empirical Case Facts)</span>
          <span style={{ color: '#93c5fd' }}>● Deterministic Session Data (Active Demo Orders)</span>
          <span style={{ color: '#fde047' }}>● Scenario Projections (Modeled Estimates with Stated Assumptions)</span>
        </div>
      </div>

      {/* 2. SECTION 1: Active Demo Session (Calculated on Synthetic Orders) */}
      <section aria-labelledby="session-impact-title">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <h2 id="session-impact-title" style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
              Active Demonstration Session (Deterministic Calculations)
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Computed live from the 6 synthetic representative orders currently loaded in the Operations Console.
            </p>
          </div>
          <span className="brand-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd' }}>
            Synthetic Demo Data
          </span>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <span>Orders Monitored</span>
              <FileText size={16} aria-hidden="true" />
            </div>
            <div className="kpi-value">{sessionImpact.ordersAnalyzed}</div>
            <div className="kpi-subtext">Active session sample</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>High-Risk Detected</span>
              <AlertCircle size={16} color="#fb923c" aria-hidden="true" />
            </div>
            <div className="kpi-value" style={{ color: '#fb923c' }}>{sessionImpact.highRiskDetected}</div>
            <div className="kpi-subtext">Identified via deterministic risk engine</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Interventions Applied</span>
              <ShieldCheck size={16} color="#10b981" aria-hidden="true" />
            </div>
            <div className="kpi-value" style={{ color: '#34d399' }}>{sessionImpact.ordersRescued}</div>
            <div className="kpi-subtext highlight-green">Operator rescues executed</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Calculated Cancellations Avoided</span>
              <ShieldCheck size={16} color="#10b981" aria-hidden="true" />
            </div>
            <div className="kpi-value" style={{ color: '#34d399' }}>{sessionImpact.cancellationsAvoided}</div>
            <div className="kpi-subtext">Derived from pre vs post risk delta</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Est. Support Interactions Averted</span>
              <HelpCircle size={16} color="#60a5fa" aria-hidden="true" />
            </div>
            <div className="kpi-value">{sessionImpact.supportInteractionsAvoided}</div>
            <div className="kpi-subtext">Modeled at 1.39 tickets per avoided failure</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>3rd-Order Retention Stakes</span>
              <Users size={16} color="#a855f7" aria-hidden="true" />
            </div>
            <div className="kpi-value" style={{ color: '#c084fc' }}>{sessionImpact.retentionOpportunityOrders}</div>
            <div className="kpi-subtext">Key 72% reorder threshold orders</div>
          </div>
        </div>

        {sessionImpact.ordersRescued > 0 && (
          <div style={{ 
            backgroundColor: 'rgba(16, 185, 129, 0.08)', 
            border: '1px solid rgba(16, 185, 129, 0.3)', 
            borderRadius: '8px', 
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <strong style={{ color: '#34d399', fontSize: '0.9375rem' }}>
                Observed Demo Session Protected GMV: {formatINR(sessionImpact.estimatedRevenueProtected)}
              </strong>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '2px' }}>
                Protected cart value across {sessionImpact.ordersRescued} rescued orders. Average delivery ETA improved by {sessionImpact.avgDeliveryImprovementMin} minutes.
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#6ee7b7', fontWeight: 600 }}>
              Calculated on Demo State
            </span>
          </div>
        )}
      </section>

      {/* 3. SECTION 2: Projected Macro Platform Scenario Model */}
      <section aria-labelledby="projected-scenario-title" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <h2 id="projected-scenario-title" style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
              Projected Platform Scenario Model (Macro Scale)
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Scenario simulation scaling NOVA RESCUE across NOVA CART's <strong>38,500 monthly orders</strong> and 620 store partner network.
            </p>
          </div>
          <span className="brand-badge" style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#fde047' }}>
            Scenario Estimate
          </span>
        </div>

        {/* Adoption Slider */}
        <div style={{ 
          backgroundColor: '#101726', 
          border: '1px solid #1e293b', 
          borderRadius: '8px', 
          padding: '1rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={16} color="#3b82f6" aria-hidden="true" />
            <label htmlFor="adoption-slider" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>
              Modeled Partner Adoption Coverage: <strong>{adoptionRate}%</strong>
            </label>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              ({projectedScenario.monthlyOrdersCovered.toLocaleString()} orders covered/month)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '240px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>50%</span>
            <input
              id="adoption-slider"
              type="range"
              min={50}
              max={100}
              step={5}
              value={adoptionRate}
              onChange={(e) => setAdoptionRate(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#3b82f6', cursor: 'pointer' }}
              aria-label="Modeled partner adoption coverage slider"
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>100%</span>
          </div>
        </div>

        {/* Macro Impact KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <span>Modeled Cancellations Avoided / Mo</span>
              <ShieldCheck size={16} color="#10b981" aria-hidden="true" />
            </div>
            <div className="kpi-value" style={{ color: '#34d399' }}>
              ~{projectedScenario.preventableCancellationsMonthly.toLocaleString()}
            </div>
            <div className="kpi-subtext highlight-green">Projected from 74% resolution of 62% addressable causes</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Projected Cancellation Rate</span>
              <TrendingUp size={16} color="#3b82f6" aria-hidden="true" />
            </div>
            <div className="kpi-value" style={{ color: '#60a5fa' }}>
              {projectedScenario.projectedCancellationRate}%
            </div>
            <div className="kpi-subtext">Scenario estimate (historical baseline: 11.0%)</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Modeled Monthly GMV Preserved</span>
              <TrendingUp size={16} color="#10b981" aria-hidden="true" />
            </div>
            <div className="kpi-value" style={{ color: '#34d399' }}>
              {formatINR(projectedScenario.grossMerchandiseValueSavedINR)}
            </div>
            <div className="kpi-subtext">Projected at ₹486 historical average order value</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Modeled Support Inquiries Averted / Mo</span>
              <HelpCircle size={16} color="#f59e0b" aria-hidden="true" />
            </div>
            <div className="kpi-value">
              ~{projectedScenario.supportTicketsAvertedMonthly.toLocaleString()}
            </div>
            <div className="kpi-subtext">Estimated {formatINR(projectedScenario.supportCostSavingsINR)} OPEX savings (at ₹120/ticket)</div>
          </div>

          <div className="kpi-card" style={{ gridColumn: 'span 2' }}>
            <div className="kpi-header">
              <span>Modeled Annualized Retention LTV Opportunity</span>
              <Users size={16} color="#a855f7" aria-hidden="true" />
            </div>
            <div className="kpi-value" style={{ color: '#c084fc' }}>
              {formatINR(projectedScenario.retentionLTVUnlockedINR)}
            </div>
            <div className="kpi-subtext highlight-green">
              Scenario estimate modeling cohort progression past the 3rd-order milestone (72% reorder probability).
            </div>
          </div>
        </div>

        {/* 4. Explicit Modeling Assumptions & Methodology Box */}
        <div style={{
          backgroundColor: '#090d16',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1.25rem',
          marginTop: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#93c5fd' }}>
            <Calculator size={16} aria-hidden="true" />
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Documented Calculation Assumptions for Scenario Projections
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
            To maintain analytical transparency, every projected metric above is derived from explicit mathematical assumptions:
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '0.75rem',
            fontSize: '0.75rem'
          }}>
            <div style={{ backgroundColor: '#101726', padding: '0.625rem 0.875rem', borderRadius: '4px', border: '1px solid #1e293b' }}>
              <strong style={{ color: '#f8fafc' }}>Addressable Cancellation Opportunity:</strong>
              <div style={{ color: '#94a3b8', marginTop: '2px' }}>
                Set to 62% of baseline cancellations (35% unavailability + 27% delay). Note: represents the opportunity pool, not 100% preventable.
              </div>
            </div>

            <div style={{ backgroundColor: '#101726', padding: '0.625rem 0.875rem', borderRadius: '4px', border: '1px solid #1e293b' }}>
              <strong style={{ color: '#f8fafc' }}>Intervention Resolution Rate:</strong>
              <div style={{ color: '#94a3b8', marginTop: '2px' }}>
                Modeled at {projectedScenario.assumptions.operationalRescueEfficiencyPct}% successful resolution across covered stores (accounting for inventory/transit trade-offs).
              </div>
            </div>

            <div style={{ backgroundColor: '#101726', padding: '0.625rem 0.875rem', borderRadius: '4px', border: '1px solid #1e293b' }}>
              <strong style={{ color: '#f8fafc' }}>Support Ticket Avoidance Ratio:</strong>
              <div style={{ color: '#94a3b8', marginTop: '2px' }}>
                Modeled at {projectedScenario.assumptions.supportTicketsPerCancellation} support tickets per cancellation, with handling cost estimated at ₹{projectedScenario.assumptions.supportHandlingCostINR}/ticket.
              </div>
            </div>

            <div style={{ backgroundColor: '#101726', padding: '0.625rem 0.875rem', borderRadius: '4px', border: '1px solid #1e293b' }}>
              <strong style={{ color: '#f8fafc' }}>Annualized Retention LTV Multiplier:</strong>
              <div style={{ color: '#94a3b8', marginTop: '2px' }}>
                Models 38% of rescued orders as early-journey cohorts converting via the 72% 3-order repeat probability at 2.8 orders/month (~₹{projectedScenario.assumptions.annualLtvDiscountedINR.toLocaleString()} annual spend).
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.6875rem', color: '#64748b', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Info size={12} aria-hidden="true" />
            <span>Never present simulated numbers as actual NOVA CART historical results. Projections are mathematical scenario estimates.</span>
          </div>
        </div>
      </section>

      {/* 5. SECTION 3: Official NOVA CART Historical Case Evidence (Directly from Brief) */}
      <section aria-labelledby="case-evidence-title" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <h2 id="case-evidence-title" style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
              Official Case Evidence Reference (Historical Facts)
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Verifiable empirical facts directly stated in the PROMPTWARS challenge brief.
            </p>
          </div>
          <span className="brand-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}>
            Historical Evidence
          </span>
        </div>

        <div className="evidence-grid">
          <div className="evidence-card">
            <span className="evidence-badge">Core Retention Metric</span>
            <div className="evidence-stat" style={{ color: '#f87171' }}>41% → 27%</div>
            <p className="evidence-label">
              Repeat purchase rate declined from 41% to 27% despite registered users growing from 82,000 to 120,000.
            </p>
          </div>

          <div className="evidence-card">
            <span className="evidence-badge">Fulfillment Failure</span>
            <div className="evidence-stat" style={{ color: '#f87171' }}>6% → 11%</div>
            <p className="evidence-label">
              Cancellation rate increased from 6% to 11% (35% caused by product unavailability; 27% by delivery delay).
            </p>
          </div>

          <div className="evidence-card">
            <span className="evidence-badge">Crucial Retention Law</span>
            <div className="evidence-stat" style={{ color: '#34d399' }}>72% Repeat Probability</div>
            <p className="evidence-label">
              Customers completing 3 orders have a 72% probability of ordering again the following month.
            </p>
          </div>

          <div className="evidence-card">
            <span className="evidence-badge">Merchant Inventory Friction</span>
            <div className="evidence-stat" style={{ color: '#fb923c' }}>39% Partner Friction</div>
            <p className="evidence-label">
              39% of partner stores say maintaining online inventory requires too much effort; some update only once every 1–3 days.
            </p>
          </div>

          <div className="evidence-card">
            <span className="evidence-badge">Delivery Delay</span>
            <div className="evidence-stat" style={{ color: '#fb923c' }}>29m → 37m</div>
            <p className="evidence-label">
              Average delivery time increased from 29 minutes to 37 minutes across 620 partner stores.
            </p>
          </div>

          <div className="evidence-card">
            <span className="evidence-badge">Support Escalation</span>
            <div className="evidence-stat" style={{ color: '#f87171' }}>3,100 → 5,900</div>
            <p className="evidence-label">
              Customer support tickets escalated from 3,100 to 5,900 per month as order volume grew to 38,500.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
