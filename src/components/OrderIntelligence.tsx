import React, { useState } from 'react';
import { 
  Order, 
  AIAnalysisResult, 
  RescueActionType 
} from '../types';
import { 
  Clock, 
  Store, 
  MapPin, 
  User, 
  Package, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw,
  TrendingDown,
  Info,
  Phone
} from 'lucide-react';

interface OrderIntelligenceProps {
  order: Order;
  aiAnalysis: AIAnalysisResult | null;
  isAiLoading: boolean;
  onRunAiAnalysis: () => void;
  onInitiateRescueAction: (actionType: RescueActionType) => void;
}

export const OrderIntelligence: React.FC<OrderIntelligenceProps> = ({
  order,
  aiAnalysis,
  isAiLoading,
  onRunAiAnalysis,
  onInitiateRescueAction
}) => {
  const { customer, store, delivery, items, risk, rescueState } = order;
  const isRescued = order.status === 'RESCUED';
  const isCriticalRetentionOrder = customer.retentionMilestone === '3rd_ORDER_CRITICAL_MILESTONE';

  return (
    <article className="intelligence-panel" aria-label={`Order Intelligence for ${order.id}`}>
      {/* 1. Header Banner */}
      <div className="order-hero-banner">
        <div className="hero-left-title">
          <div className="hero-order-heading">
            <span>{order.id}</span>
            <span style={{ fontSize: '1rem', color: '#94a3b8' }}>• ₹{order.orderValue}</span>
            {isRescued ? (
              <span className="risk-badge rescued">
                <ShieldCheck size={14} aria-hidden="true" />
                Rescued Order
              </span>
            ) : (
              <span className={`risk-badge ${risk.riskLevel.toLowerCase()}`}>
                <AlertTriangle size={14} aria-hidden="true" />
                {risk.riskLevel} Risk
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Placed {order.createdAt} • Channel: Quick-Commerce App • Node: {store.locality}
          </p>
        </div>

        {/* Reliability & Cancellation Probability Overview */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>
              Reliability Score
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: isRescued ? '#34d399' : risk.reliabilityScore < 60 ? '#f87171' : '#facc15' }}>
              {risk.reliabilityScore}/100
            </span>
          </div>

          <div style={{ width: '1px', height: '36px', backgroundColor: '#2d3b55' }} aria-hidden="true" />

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>
              Cancellation Risk
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: isRescued ? '#34d399' : '#f87171' }}>
              {risk.cancellationProbability}%
            </span>
          </div>
        </div>
      </div>

      {/* Customer 3rd Order Retention Milestone Alert */}
      {isCriticalRetentionOrder && (
        <div className={`retention-alert-banner ${isRescued ? 'positive' : ''}`} role="alert">
          <User size={18} aria-hidden="true" />
          <div>
            <strong>Critical 3rd-Order Retention Milestone:</strong> Customer <em>{customer.customerName}</em> is completing their 3rd order.
            According to NOVA CART evidence, customers reaching 3 completed orders have a <strong>72% probability of ordering again next month</strong>.
            {isRescued ? ' Rescue applied successfully — repeat retention pathway preserved!' : ' An unmitigated cancellation here destroys long-term customer lifetime value.'}
          </div>
        </div>
      )}

      {/* Post-Rescue Outcome Banner (If already rescued) */}
      {isRescued && rescueState && (
        <div className="post-rescue-card" role="region" aria-label="Rescue Outcome Evaluation">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="#10b981" aria-hidden="true" />
              <strong style={{ color: '#ffffff', fontSize: '0.9375rem' }}>
                Operational Rescue Active: {rescueState.actionTitle}
              </strong>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>
              Applied {new Date(rescueState.appliedAt).toLocaleTimeString()}
            </span>
          </div>

          <p style={{ fontSize: '0.8125rem', color: '#e2e8f0', lineHeight: 1.4 }}>
            {rescueState.explanation}
          </p>

          {/* Delta Metrics */}
          <div className="delta-metrics-row">
            <div className="delta-metric-box">
              <span className="delta-label">Reliability Score</span>
              <div className="delta-val-group">
                <span className="delta-val-old">{rescueState.originalReliabilityScore}%</span>
                <ArrowRight size={14} color="#64748b" aria-hidden="true" />
                <span className="delta-val-new">{rescueState.newReliabilityScore}%</span>
              </div>
            </div>

            <div className="delta-metric-box">
              <span className="delta-label">Cancellation Risk</span>
              <div className="delta-val-group">
                <span className="delta-val-old">{rescueState.originalCancellationRisk}%</span>
                <ArrowRight size={14} color="#64748b" aria-hidden="true" />
                <span className="delta-val-new">{rescueState.newCancellationRisk}%</span>
              </div>
            </div>

            <div className="delta-metric-box">
              <span className="delta-label">Projected ETA</span>
              <div className="delta-val-group">
                <span className="delta-val-old">{rescueState.originalEtaMin}m</span>
                <ArrowRight size={14} color="#64748b" aria-hidden="true" />
                <span className="delta-val-new">{rescueState.newEtaMin}m</span>
              </div>
            </div>

            <div className="delta-metric-box">
              <span className="delta-label">Action Outcome</span>
              <div className="delta-val-group" style={{ fontSize: '0.875rem', color: '#34d399' }}>
                Stockout Bypassed
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Three Context Diagnostic Cards (Customer, Store, Delivery) */}
      <div className="context-grid">
        {/* Customer Context */}
        <div className="context-box">
          <div className="context-box-title">
            <User size={14} aria-hidden="true" />
            Customer Profile
          </div>
          <div className="context-kv-list">
            <div className="context-kv-row">
              <span className="context-k">Name</span>
              <span className="context-v">{customer.customerName}</span>
            </div>
            <div className="context-kv-row">
              <span className="context-k">Completed Orders</span>
              <span className="context-v">{customer.totalCompletedOrders}</span>
            </div>
            <div className="context-kv-row">
              <span className="context-k">Cohort Milestone</span>
              <span className={`context-v ${isCriticalRetentionOrder ? 'danger' : ''}`}>
                {customer.retentionMilestone.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="context-kv-row">
              <span className="context-k">Past Cancellations</span>
              <span className="context-v">{customer.pastCancellationsCount}</span>
            </div>
            <div className="context-kv-row">
              <span className="context-k">Customer LTV</span>
              <span className="context-v">₹{customer.lifetimeValue}</span>
            </div>
          </div>
        </div>

        {/* Store Context & Inventory Freshness */}
        <div className="context-box">
          <div className="context-box-title">
            <Store size={14} aria-hidden="true" />
            Store & Inventory Context
          </div>
          <div className="context-kv-list">
            <div className="context-kv-row">
              <span className="context-k">Store</span>
              <span className="context-v" title={store.storeName}>{store.storeName}</span>
            </div>
            <div className="context-kv-row">
              <span className="context-k">Inventory Last Synced</span>
              <span className={`context-v ${store.inventoryLastUpdatedHoursAgo > 24 ? 'danger' : 'success'}`}>
                {store.inventoryLastUpdatedHoursAgo.toFixed(1)} hrs ago
              </span>
            </div>
            <div className="context-kv-row">
              <span className="context-k">Store Rejection Rate</span>
              <span className={`context-v ${store.rejectionRate > 0.1 ? 'danger' : 'success'}`}>
                {(store.rejectionRate * 100).toFixed(0)}% (bench: &lt;3%)
              </span>
            </div>
            <div className="context-kv-row">
              <span className="context-k">Fulfillment Rate</span>
              <span className="context-v">{(store.historicalFulfillmentRate * 100).toFixed(0)}%</span>
            </div>
            <div className="context-kv-row">
              <span className="context-k">Partner Friction</span>
              <span className={`context-v ${store.activePartnerStatus === 'HIGH_FRICTION' ? 'warning' : 'success'}`}>
                {store.activePartnerStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery & Courier Telemetry */}
        <div className="context-box">
          <div className="context-box-title">
            <Clock size={14} aria-hidden="true" />
            Delivery Telemetry
          </div>
          <div className="context-kv-list">
            <div className="context-kv-row">
              <span className="context-k">Standard SLA</span>
              <span className="context-v">{delivery.standardEtaMin} mins</span>
            </div>
            <div className="context-kv-row">
              <span className="context-k">Current Projected ETA</span>
              <span className={`context-v ${delivery.etaDelayMin > 5 ? 'danger' : 'success'}`}>
                {delivery.currentEstimatedEtaMin} mins (+{delivery.etaDelayMin}m delay)
              </span>
            </div>
            <div className="context-kv-row">
              <span className="context-k">Assigned Courier</span>
              <span className={`context-v ${delivery.assignedRiderStatus === 'SEARCHING' ? 'warning' : 'success'}`}>
                {delivery.assignedRiderStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="context-kv-row">
              <span className="context-k">Weather</span>
              <span className="context-v">{delivery.weatherCondition.replace(/_/g, ' ')}</span>
            </div>
            <div className="context-kv-row">
              <span className="context-k">Transit Congestion</span>
              <span className={`context-v ${delivery.trafficCongestion === 'SEVERE' ? 'danger' : 'success'}`}>
                {delivery.trafficCongestion}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Cart Items Table */}
      <div className="cart-items-section">
        <h3 className="section-title">
          <Package size={16} aria-hidden="true" />
          Cart Items & Physical Inventory Telemetry
        </h3>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Item / SKU</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Avail. Confidence</th>
                <th>Sync Freshness</th>
                <th>Stock Status</th>
                <th>Substitution Match</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{item.category}</div>
                  </td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price * item.quantity}</td>
                  <td>
                    <span style={{ 
                      fontWeight: 700, 
                      color: item.availabilityConfidence < 50 ? '#f87171' : item.availabilityConfidence < 80 ? '#facc15' : '#34d399' 
                    }}>
                      {item.availabilityConfidence}%
                    </span>
                  </td>
                  <td>{item.inventorySyncAgeHours.toFixed(1)}h ago</td>
                  <td>
                    <span className={`stock-pill ${item.stockStatus.toLowerCase()}`}>
                      {item.stockStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: item.substituteAvailable ? '#93c5fd' : '#64748b' }}>
                    {item.substituteAvailable ? `✓ ${item.substituteAvailable.name}` : 'None Needed'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. AI Root-Cause Reasoning & Recommended Action Card */}
      <div className="ai-diagnosis-card" role="region" aria-label="AI Root-Cause Diagnosis">
        <div className="ai-card-header">
          <div className="ai-header-left">
            <Sparkles size={18} color="#60a5fa" aria-hidden="true" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff' }}>
              Operational Root-Cause Reasoning
            </h3>
            <span className={`ai-chip ${aiAnalysis?.source === 'DETERMINISTIC_FALLBACK' ? 'fallback' : ''}`}>
              {aiAnalysis?.modelUsed || 'AI Engine'}
            </span>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={onRunAiAnalysis}
            disabled={isAiLoading}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            aria-label="Re-run AI diagnosis"
          >
            <RefreshCw size={12} className={isAiLoading ? 'spin' : ''} aria-hidden="true" />
            {isAiLoading ? 'Analyzing...' : 'Re-Diagnose'}
          </button>
        </div>

        {/* Primary Root Cause Narrative */}
        <div className="ai-root-cause-box">
          <div style={{ fontSize: '0.6875rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
            Diagnosed Root Cause: {aiAnalysis?.primary_risk || risk.primaryRisk}
          </div>
          <p className="ai-root-cause-text">
            {aiAnalysis?.root_cause || 'Analyzing order failure probability and telemetry context...'}
          </p>
        </div>

        {/* Identified Risk Drivers */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
            Key Risk Drivers Detected:
          </div>
          <div className="risk-drivers-list">
            {(aiAnalysis?.risk_drivers && aiAnalysis.risk_drivers.length > 0
              ? aiAnalysis.risk_drivers.map((driver, idx) => (
                  <div key={idx} className="driver-pill-card">
                    <span style={{ fontSize: '0.75rem', color: '#f8fafc', fontWeight: 500 }}>• {driver}</span>
                  </div>
                ))
              : risk.riskDrivers.slice(0, 3).map((driver, idx) => (
                  <div key={idx} className="driver-pill-card">
                    <div className="driver-label-row">
                      <span style={{ color: driver.severity === 'CRITICAL' ? '#f87171' : '#fba457' }}>{driver.label}</span>
                      <span style={{ color: '#94a3b8' }}>{driver.metricValue}</span>
                    </div>
                    <span className="driver-desc">{driver.description}</span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Recommended Action & Expected Effect */}
        <div style={{ 
          backgroundColor: 'rgba(59, 130, 246, 0.08)', 
          border: '1px solid rgba(59, 130, 246, 0.25)', 
          borderRadius: '6px', 
          padding: '0.75rem 1rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase' }}>
              Recommended Rescue Intervention: {aiAnalysis?.recommended_action.replace(/_/g, ' ') || 'PROCEED'}
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#e2e8f0', marginBottom: '6px' }}>
            <strong>Why this helps:</strong> {aiAnalysis?.reason}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>
            <strong>Expected Effect:</strong> {aiAnalysis?.expected_effect}
          </p>
        </div>
      </div>

      {/* 5. Rescue Action Execution Bar (Realistic Actions) */}
      <section className="action-controls-bar" aria-label="Rescue Interventions">
        <div className="action-bar-label">
          <span className="action-bar-title">Operational Rescue Dispatch</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Execute immediate intervention to prevent cancellation and safeguard repeat retention
          </span>
        </div>

        <div className="action-buttons-group">
          <button
            type="button"
            className={`btn-rescue-action ${aiAnalysis?.recommended_action === 'SWITCH_STORE' ? 'primary' : 'outline'}`}
            onClick={() => onInitiateRescueAction('SWITCH_STORE')}
          >
            <Store size={14} aria-hidden="true" />
            Switch Store
          </button>

          <button
            type="button"
            className={`btn-rescue-action ${aiAnalysis?.recommended_action === 'SUBSTITUTE_PRODUCT' ? 'primary' : 'outline'}`}
            onClick={() => onInitiateRescueAction('SUBSTITUTE_PRODUCT')}
          >
            <Package size={14} aria-hidden="true" />
            Substitute Product
          </button>

          <button
            type="button"
            className={`btn-rescue-action ${aiAnalysis?.recommended_action === 'ADJUST_DELIVERY' ? 'primary' : 'outline'}`}
            onClick={() => onInitiateRescueAction('ADJUST_DELIVERY')}
          >
            <Clock size={14} aria-hidden="true" />
            Adjust Delivery
          </button>

          <button
            type="button"
            className={`btn-rescue-action ${aiAnalysis?.recommended_action === 'PROACTIVE_NOTIFY' ? 'primary' : 'outline'}`}
            onClick={() => onInitiateRescueAction('PROACTIVE_NOTIFY')}
          >
            <Phone size={14} aria-hidden="true" />
            Notify Customer
          </button>

          <button
            type="button"
            className="btn-rescue-action outline"
            onClick={() => onInitiateRescueAction('PROCEED')}
            style={{ color: '#94a3b8' }}
          >
            Proceed As-Is
          </button>
        </div>
      </section>
    </article>
  );
};
