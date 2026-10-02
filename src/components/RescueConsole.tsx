import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Store, 
  TrendingDown, 
  HelpCircle,
  Search,
  ShieldCheck
} from 'lucide-react';
import { Order, RiskLevel } from '../types';

interface RescueConsoleProps {
  orders: Order[];
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
  selectedCity: string;
}

type FilterCategory = 'ALL' | 'CRITICAL_HIGH' | 'ATTENTION' | 'RESCUED' | 'HEALTHY';

export const RescueConsole: React.FC<RescueConsoleProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  selectedCity
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders by city, category, and search query
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // City filter
      if (selectedCity !== 'ALL' && order.store.city !== selectedCity) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesCustomer = order.customer.customerName.toLowerCase().includes(q);
        const matchesStore = order.store.storeName.toLowerCase().includes(q);
        const matchesItem = order.items.some(i => i.name.toLowerCase().includes(q));
        if (!matchesId && !matchesCustomer && !matchesStore && !matchesItem) {
          return false;
        }
      }

      // Category filter
      if (activeFilter === 'CRITICAL_HIGH') {
        return order.risk.riskLevel === 'CRITICAL' || order.risk.riskLevel === 'HIGH';
      }
      if (activeFilter === 'ATTENTION') {
        return order.status === 'AT_RISK' || order.risk.reliabilityScore < 75;
      }
      if (activeFilter === 'RESCUED') {
        return order.status === 'RESCUED';
      }
      if (activeFilter === 'HEALTHY') {
        return order.risk.riskLevel === 'LOW' && order.status !== 'RESCUED';
      }

      return true;
    });
  }, [orders, selectedCity, searchQuery, activeFilter]);

  // Aggregate KPI metrics
  const kpis = useMemo(() => {
    const total = orders.length;
    const highRisk = orders.filter(o => o.risk.riskLevel === 'HIGH' || o.risk.riskLevel === 'CRITICAL').length;
    const attention = orders.filter(o => o.risk.reliabilityScore < 75 && o.status !== 'RESCUED').length;
    const rescued = orders.filter(o => o.status === 'RESCUED').length;

    return {
      total,
      highRisk,
      attention,
      rescued,
      cancellationRate: '11.0%', // Historical case baseline (up from 6%)
      supportTickets: '5,900/mo' // Historical case baseline (up from 3,100)
    };
  }, [orders]);

  const getRiskBadgeClass = (level: RiskLevel, isRescued: boolean) => {
    if (isRescued) return 'risk-badge rescued';
    switch (level) {
      case 'CRITICAL': return 'risk-badge critical';
      case 'HIGH': return 'risk-badge high';
      case 'MEDIUM': return 'risk-badge medium';
      default: return 'risk-badge low';
    }
  };

  const getMeterColorClass = (score: number) => {
    if (score < 40) return 'critical';
    if (score < 60) return 'high';
    if (score < 75) return 'medium';
    return 'low';
  };

  return (
    <section aria-label="Rescue Console Main View">
      {/* 6 KPI Cards as specified */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Total Monitored</span>
            <Store size={16} aria-hidden="true" />
          </div>
          <div className="kpi-value">{kpis.total}</div>
          <div className="kpi-subtext">Active operational pipeline</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Requires Attention</span>
            <AlertTriangle size={16} color="#fb923c" aria-hidden="true" />
          </div>
          <div className="kpi-value">{kpis.attention}</div>
          <div className="kpi-subtext highlight-red">SLA or inventory threshold breach</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>High-Risk Orders</span>
            <AlertTriangle size={16} color="#ef4444" aria-hidden="true" />
          </div>
          <div className="kpi-value">{kpis.highRisk}</div>
          <div className="kpi-subtext highlight-red">Imminent cancellation risk (&gt;50%)</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Rescued Orders</span>
            <CheckCircle2 size={16} color="#10b981" aria-hidden="true" />
          </div>
          <div className="kpi-value" style={{ color: '#34d399' }}>{kpis.rescued}</div>
          <div className="kpi-subtext highlight-green">Intervention applied this session</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Cancellation Rate</span>
            <TrendingDown size={16} color="#ef4444" aria-hidden="true" />
          </div>
          <div className="kpi-value" style={{ color: '#f87171' }}>{kpis.cancellationRate}</div>
          <div className="kpi-subtext">Case baseline (up from 6.0%)</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Support Tickets</span>
            <HelpCircle size={16} color="#f59e0b" aria-hidden="true" />
          </div>
          <div className="kpi-value">{kpis.supportTickets}</div>
          <div className="kpi-subtext">Case baseline (up from 3,100)</div>
        </div>
      </div>

      {/* Orders Filter & Search Bar */}
      <div className="orders-panel">
        <div className="orders-panel-header">
          <div className="panel-title-row">
            <h2 className="panel-title">
              Operational Order Stream
              <span className="orders-count-badge">
                {filteredOrders.length} of {orders.length}
              </span>
            </h2>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search 
                size={14} 
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} 
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order, store, SKU..."
                className="text-input"
                style={{ paddingLeft: '28px', fontSize: '0.75rem', height: '30px' }}
                aria-label="Search orders"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="filter-pills" role="tablist" aria-label="Filter orders by risk state">
            <button
              type="button"
              className={`filter-pill ${activeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ALL')}
              role="tab"
              aria-selected={activeFilter === 'ALL'}
            >
              All Orders ({orders.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${activeFilter === 'CRITICAL_HIGH' ? 'active' : ''}`}
              onClick={() => setActiveFilter('CRITICAL_HIGH')}
              role="tab"
              aria-selected={activeFilter === 'CRITICAL_HIGH'}
            >
              High & Critical Risk ({kpis.highRisk})
            </button>
            <button
              type="button"
              className={`filter-pill ${activeFilter === 'ATTENTION' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ATTENTION')}
              role="tab"
              aria-selected={activeFilter === 'ATTENTION'}
            >
              Requires Attention ({kpis.attention})
            </button>
            <button
              type="button"
              className={`filter-pill ${activeFilter === 'RESCUED' ? 'active' : ''}`}
              onClick={() => setActiveFilter('RESCUED')}
              role="tab"
              aria-selected={activeFilter === 'RESCUED'}
            >
              Rescued ({kpis.rescued})
            </button>
            <button
              type="button"
              className={`filter-pill ${activeFilter === 'HEALTHY' ? 'active' : ''}`}
              onClick={() => setActiveFilter('HEALTHY')}
              role="tab"
              aria-selected={activeFilter === 'HEALTHY'}
            >
              Healthy Stream
            </button>
          </div>
        </div>

        {/* Orders List View */}
        <div className="orders-list-scroll" role="list" aria-label="List of representative orders">
          {filteredOrders.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              No orders matching current filter criteria.
            </div>
          ) : (
            filteredOrders.map(order => {
              const isSelected = order.id === selectedOrderId;
              const isRescued = order.status === 'RESCUED';
              const isCritical3rdOrder = order.customer.retentionMilestone === '3rd_ORDER_CRITICAL_MILESTONE';

              return (
                <button
                  type="button"
                  key={order.id}
                  className={`order-item-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectOrder(order.id)}
                  role="listitem"
                  aria-selected={isSelected}
                  aria-label={`Select Order ${order.id}, value ₹${order.orderValue}, reliability ${order.risk.reliabilityScore}%, risk level ${order.risk.riskLevel}`}
                >
                  {/* Top Row: Order ID, Value, Risk Badge */}
                  <div className="order-card-top">
                    <div className="order-id-group">
                      <span className="order-id-text">{order.id}</span>
                      <span className="order-val">₹{order.orderValue}</span>
                      {isCritical3rdOrder && (
                        <span 
                          style={{ 
                            fontSize: '0.625rem', 
                            padding: '1px 5px', 
                            borderRadius: '3px', 
                            background: 'rgba(239, 68, 68, 0.15)', 
                            color: '#f87171',
                            fontWeight: 700 
                          }}
                          title="Customer on 3rd Order (72% repeat order probability milestone)"
                        >
                          3rd Order Stake
                        </span>
                      )}
                    </div>

                    <div className={getRiskBadgeClass(order.risk.riskLevel, isRescued)}>
                      {isRescued ? (
                        <>
                          <ShieldCheck size={12} aria-hidden="true" />
                          <span>Rescued</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={12} aria-hidden="true" />
                          <span>{order.risk.riskLevel}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Mid Row: Store Name & Customer */}
                  <div className="order-card-meta">
                    <span className="order-store-name" title={order.store.storeName}>
                      {order.store.storeName} ({order.store.city})
                    </span>
                    <span>
                      {order.customer.customerName}
                    </span>
                  </div>

                  {/* Risk Driver Snippet */}
                  <div style={{ fontSize: '0.75rem', color: isRescued ? '#6ee7b7' : '#f87171', fontWeight: 500 }}>
                    {isRescued ? (
                      `✓ ${order.rescueState?.actionTitle}`
                    ) : (
                      `⚠ ${order.risk.primaryRisk}`
                    )}
                  </div>

                  {/* Bottom Row: Reliability Meter & ETA */}
                  <div className="order-card-bottom">
                    <div className="reliability-meter">
                      <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Reliability</span>
                      <div className="meter-bar-track" aria-hidden="true">
                        <div 
                          className={`meter-bar-fill ${getMeterColorClass(order.risk.reliabilityScore)}`}
                          style={{ width: `${order.risk.reliabilityScore}%` }}
                        />
                      </div>
                      <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.75rem' }}>
                        {order.risk.reliabilityScore}%
                      </span>
                    </div>

                    <div className={`eta-pill ${order.delivery.etaDelayMin > 5 ? 'delayed' : 'normal'}`}>
                      <Clock size={12} aria-hidden="true" />
                      <span>{order.delivery.currentEstimatedEtaMin}m ETA</span>
                      {order.delivery.etaDelayMin > 0 && (
                        <span style={{ fontSize: '0.6875rem', color: '#f87171' }}>
                          (+{order.delivery.etaDelayMin}m)
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
