import React, { useState } from 'react';
import { Order } from '../types';
import { 
  calculateSessionImpact, 
  projectPlatformScenario, 
  NOVA_CART_HISTORICAL_BENCHMARKS 
} from '../engine/businessImpact';
import { 
  TrendingUp, 
  ShieldCheck, 
  HelpCircle, 
  Clock, 
  Users, 
  Sliders, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface BusinessImpactViewProps {
  orders: Order[];
}

export const BusinessImpactView: React.FC<BusinessImpactViewProps> = ({ orders }) => {
  const [adoptionRate, setAdoptionRate] = useState<number>(85); // 85% default platform coverage
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
      {/* 1. Header Banner */}
      <div className="impact-hero-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={22} color="#3b82f6" aria-hidden="true" />
          <h1 className="impact-hero-title">Business Impact & Retention Scenario Engine</h1>
        </div>
        <p className="impact-hero-subtitle">
          Connecting real-time operational rescue interventions to repeat customer retention and platform profitability. 
          Evidence confirms that <strong>62% of NOVA CART cancellations</strong> stem from product unavailability (35%) 
          and delivery delays (27%). Rescuing orders before failure preserves customer loyalty where 
          <strong> 3 completed orders yield a 72% repeat purchase probability</strong>.
        </p>
      </div>

      {/* 2. SECTION 1: Active Demo Session Impact (Observed in Console) */}
      <section aria-labelledby="session-impact-title">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 id="session-impact-title" style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
            Active Demonstration Session (Calculated Live)
          </h2>
          <span className="brand-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7' }}>
            Observed State
          </span>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <span>Orders Analyzed</span>
              <FileText size={16} aria-hidden="true" />
            </div>
            <div className="kpi-value">{sessionImpact.ordersAnalyzed}</div>
            <div className="kpi-subtext">Active telemetry stream</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>High-Risk Detected</span>
              <AlertCircle size={16} color="#fb923c" aria-hidden="true" />
            </div>
            <div className="kpi-value" style={{ color: '#fb923c' }}>{sessionImpact.highRiskDetected}</div>
            <div className="kpi-subtext">Orders exceeding risk threshold</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Orders Rescued</span>
              <ShieldCheck size={16} color="#10b981" aria-hidden="true" />
            </div>
            <div className="kpi-value" style={{ color: '#34d399' }}>{sessionImpact.ordersRescued}</div>
            <div className="kpi-subtext highlight-green">Successful interventions applied</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Est. Cancellations Avoided</span>
              <ShieldCheck size={16} color="#10b981" aria-hidden="true" />
            </div>
            <div className="kpi-value" style={{ color: '#34d399' }}>{sessionImpact.cancellationsAvoided}</div>
            <div className="kpi-subtext">Direct order churn neutralized</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Support Inquiries Averted</span>
              <HelpCircle size={16} color="#60a5fa" aria-hidden="true" />
            </div>
            <div className="kpi-value">{sessionImpact.supportInteractionsAvoided}</div>
            <div className="kpi-subtext">~1.4 tickets averted per avoided cancellation</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>3rd-Order Retention Stakes</span>
              <Users size={16} color="#a855f7" aria-hidden="true" />
            </div>
            <div className="kpi-value" style={{ color: '#c084fc' }}>{sessionImpact.retentionOpportunityOrders}</div>
            <div className="kpi-subtext">Crucial 72% repeat conversion orders</div>
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
                Demonstration Value Saved: {formatINR(sessionImpact.estimatedRevenueProtected)}
              </strong>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '2px' }}>
                Protected cart GMV across {sessionImpact.ordersRescued} rescued orders. Average delivery ETA improved by {sessionImpact.avgDeliveryImprovementMin} minutes.
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#6ee7b7', fontWeight: 600 }}>
              Live Operational State
            </span>
          </div>
        )}
      </section>

      {/* 3. SECTION 2: Projected Macro Platform Scenario */}
      <section aria-labelledby="projected-scenario-title" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 id="projected-scenario-title" style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
              Projected Platform Scenario Model (Macro Scale)
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              Projected monthly impact scaling NOVA RESCUE across NOVA CART's <strong>38,500 monthly orders</strong> and 620 store network.
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
              Simulated Store Adoption Rate: <strong>{adoptionRate}%</strong>
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
              aria-label="Simulated store adoption rate slider"
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>100%</span>
          </div>
        </div>

        {/* Macro Impact KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <span>Preventable Cancellations / Mo</span>
              <ShieldCheck size={16} color="#10b981" aria-hidden="true" />
            </div>
            <div className="kpi-value" style={{ color: '#34d399' }}>
              ~{projectedScenario.preventableCancellationsMonthly.toLocaleString()}
            </div>
            <div className="kpi-subtext highlight-green">Targeting 62% inventory + delay causes</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Projected Cancellation Rate</span>
              <TrendingUp size={16} color="#3b82f6" aria-hidden="true" />
            </div>
            <div className="kpi-value" style={{ color: '#60a5fa' }}>
              {projectedScenario.projectedCancellationRate}%
            </div>
            <div className="kpi-subtext">Reduced from 11.0% baseline (towards 6%)</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Monthly GMV Preserved</span>
              <TrendingUp size={16} color="#10b981" aria-hidden="true" />
            </div>
            <div className="kpi-value" style={{ color: '#34d399' }}>
              {formatINR(projectedScenario.grossMerchandiseValueSavedINR)}
            </div>
            <div className="kpi-subtext">Based on ₹486 average order value</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Support Inquiries Averted / Mo</span>
              <HelpCircle size={16} color="#f59e0b" aria-hidden="true" />
            </div>
            <div className="kpi-value">
              ~{projectedScenario.supportTicketsAvertedMonthly.toLocaleString()}
            </div>
            <div className="kpi-subtext">Saves {formatINR(projectedScenario.supportCostSavingsINR)} in support OPEX</div>
          </div>

          <div className="kpi-card" style={{ gridColumn: 'span 2' }}>
            <div className="kpi-header">
              <span>Annualized Customer Retention LTV Unlocked</span>
              <Users size={16} color="#a855f7" aria-hidden="true" />
            </div>
            <div className="kpi-value" style={{ color: '#c084fc' }}>
              {formatINR(projectedScenario.retentionLTVUnlockedINR)}
            </div>
            <div className="kpi-subtext highlight-green">
              Unlocks long-term repeat cohort value by securing customers past the critical 3rd-order (72% repeat) milestone.
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.5rem' }}>
          * Clearly labeled projection: Scenario calculations are mathematical estimates modeled on NOVA CART case evidence and should not be confused with historical platform actuals.
        </div>
      </section>

      {/* 4. SECTION 3: NOVA CART Case Evidence Reference Table */}
      <section aria-labelledby="case-evidence-title" style={{ marginTop: '1rem' }}>
        <h2 id="case-evidence-title" style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
          Case Evidence & Problem Diagnosis Reference
        </h2>

        <div className="evidence-grid">
          <div className="evidence-card">
            <span className="evidence-badge">Core Retention Metric</span>
            <div className="evidence-stat" style={{ color: '#f87171' }}>41% → 27%</div>
            <p className="evidence-label">
              Repeat purchase rate declined by 14 percentage points despite registered users growing from 82k to 120k.
            </p>
          </div>

          <div className="evidence-card">
            <span className="evidence-badge">Fulfillment Failure</span>
            <div className="evidence-stat" style={{ color: '#f87171' }}>6% → 11%</div>
            <p className="evidence-label">
              Order cancellation rate almost doubled, driven by 35% product unavailability and 27% delivery delay.
            </p>
          </div>

          <div className="evidence-card">
            <span className="evidence-badge">Crucial Retention Law</span>
            <div className="evidence-stat" style={{ color: '#34d399' }}>72% Repeat Probability</div>
            <p className="evidence-label">
              Customers completing 3 orders have a 72% probability of ordering again the following month. Protecting early orders is vital.
            </p>
          </div>

          <div className="evidence-card">
            <span className="evidence-badge">Merchant Inventory Friction</span>
            <div className="evidence-stat" style={{ color: '#fb923c' }}>39% Partner Friction</div>
            <p className="evidence-label">
              39% of partner stores say maintaining online inventory requires too much effort, updating only once every 1–3 days.
            </p>
          </div>

          <div className="evidence-card">
            <span className="evidence-badge">Delivery Delay</span>
            <div className="evidence-stat" style={{ color: '#fb923c' }}>29m → 37m</div>
            <p className="evidence-label">
              Average delivery time increased by 8 minutes, pushing past consumer quick-commerce tolerance.
            </p>
          </div>

          <div className="evidence-card">
            <span className="evidence-badge">Support Escalation</span>
            <div className="evidence-stat" style={{ color: '#f87171' }}>3,100 → 5,900</div>
            <p className="evidence-label">
              Monthly customer support tickets nearly doubled, creating immense operational friction and brand damage.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
