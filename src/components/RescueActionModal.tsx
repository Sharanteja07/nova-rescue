import React, { useState } from 'react';
import { 
  Order, 
  RescueActionType, 
  AlternativeStoreOption 
} from '../types';
import { getAlternativeStoresForOrder, ApplyRescuePayload } from '../engine/rescueEngine';
import { 
  X, 
  Store, 
  Package, 
  Phone, 
  Clock, 
  Check, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface RescueActionModalProps {
  order: Order;
  actionType: RescueActionType;
  onClose: () => void;
  onApplyRescue: (payload: ApplyRescuePayload) => void;
}

export const RescueActionModal: React.FC<RescueActionModalProps> = ({
  order,
  actionType,
  onClose,
  onApplyRescue
}) => {
  const alternativeStores = getAlternativeStoresForOrder(order);
  const [selectedStore, setSelectedStore] = useState<AlternativeStoreOption>(alternativeStores[0]);
  const [notifyMessage, setNotifyMessage] = useState(
    `Hi ${order.customer.customerName}, your NOVA CART order (${order.id}) is being fulfilled with priority. To guarantee peak quality, our operations team has assigned a dedicated priority courier with live temperature tracking. Track your delivery: https://novacart.in/track/${order.id}`
  );
  const [operatorNote, setOperatorNote] = useState('');

  const handleConfirm = () => {
    onApplyRescue({
      order,
      actionType,
      details: {
        newStore: selectedStore,
        operatorNote
      }
    });
    onClose();
  };

  const getModalTitle = () => {
    switch (actionType) {
      case 'SWITCH_STORE': return 'Switch Fulfillment Store';
      case 'SUBSTITUTE_PRODUCT': return 'Substitute Unconfirmed Items';
      case 'PROACTIVE_NOTIFY': return 'Proactively Notify Customer';
      case 'ADJUST_DELIVERY': return 'Adjust Delivery & Dispatch Priority Courier';
      default: return 'Confirm Order Proceed';
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="#3b82f6" aria-hidden="true" />
            <h2 id="modal-title" className="modal-title">{getModalTitle()}</h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn-secondary" 
            style={{ padding: '4px', border: 'none' }}
            aria-label="Close rescue modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content based on Action */}
        <div className="modal-body">
          {actionType === 'SWITCH_STORE' && (
            <div style={{ display: 'flex', flexDirectio: 'column', gap: '1rem' } as any}>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                Current store <strong>{order.store.storeName}</strong> has stale inventory ({order.store.inventoryLastUpdatedHoursAgo.toFixed(1)} hrs old) 
                and a {(order.store.rejectionRate * 100).toFixed(0)}% rejection rate. Select an alternative partner hub with fresh inventory:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {alternativeStores.map((alt) => (
                  <div
                    key={alt.storeId}
                    className={`selection-card ${selectedStore.storeId === alt.storeId ? 'selected' : ''}`}
                    onClick={() => setSelectedStore(alt)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedStore(alt); }}
                  >
                    <input
                      type="radio"
                      name="storeSelect"
                      checked={selectedStore.storeId === alt.storeId}
                      onChange={() => setSelectedStore(alt)}
                      aria-label={alt.storeName}
                      style={{ marginTop: '3px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.875rem', color: '#ffffff' }}>{alt.storeName}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
                          +{alt.reliabilityDelta} Reliability pts
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        {alt.locality} • {alt.distanceKm} km away • Synced {alt.inventoryAgeHours} hrs ago
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6ee7b7', marginTop: '2px' }}>
                        ✓ {(alt.fulfillmentRate * 100).toFixed(0)}% fulfillment rate • Estimated arrival in ~{alt.estimatedEtaMin} mins
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {actionType === 'SUBSTITUTE_PRODUCT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                The following unconfirmed/stale SKUs will be replaced with verified in-stock alternatives to prevent order cancellation:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {order.items
                  .filter(i => i.isHighRiskItem || i.stockStatus === 'UNCONFIRMED' || i.stockStatus === 'STALE_STOCK')
                  .map(item => (
                    <div 
                      key={item.id} 
                      style={{ 
                        padding: '0.75rem 1rem', 
                        backgroundColor: '#090d16', 
                        border: '1px solid #1e293b', 
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.8125rem', color: '#f87171', textDecoration: 'line-through' }}>
                          {item.name} (Conf: {item.availabilityConfidence}%)
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} />
                          {item.substituteAvailable?.name ?? `Verified Fresh ${item.name}`}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.8125rem', color: '#f8fafc', fontWeight: 700 }}>
                          ₹{item.substituteAvailable?.price ?? item.price}
                        </span>
                        <div style={{ fontSize: '0.6875rem', color: '#10b981' }}>100% In-Stock</div>
                      </div>
                    </div>
                  ))}
              </div>

              <div style={{ fontSize: '0.75rem', color: '#94a3b8', backgroundColor: '#162035', padding: '0.625rem', borderRadius: '4px' }}>
                ℹ Customer receives an SMS notification regarding the equivalent replacement without price surcharge.
              </div>
            </div>
          )}

          {actionType === 'PROACTIVE_NOTIFY' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                Send a real-time proactive notification to <strong>{order.customer.customerName}</strong> ({order.customer.phone}) 
                to set accurate expectations and prevent support tickets or panic cancellations:
              </p>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Customer Communication Template (SMS / WhatsApp)
                </label>
                <textarea
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  className="text-input"
                  rows={4}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ fontSize: '0.75rem', color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.625rem', borderRadius: '4px' }}>
                ✓ Modeled impact: Proactive notification directly manages customer expectations and prevents inbound support ticket escalation.
              </div>
            </div>
          )}

          {actionType === 'ADJUST_DELIVERY' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                Current ETA is <strong>{order.delivery.currentEstimatedEtaMin} minutes</strong> (+{order.delivery.etaDelayMin}m SLA delay) 
                due to {order.delivery.weatherCondition.toLowerCase()} and {order.delivery.assignedRiderStatus.toLowerCase()}.
              </p>

              <div style={{ padding: '0.875rem', backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '6px' }}>
                <strong style={{ fontSize: '0.875rem', color: '#ffffff', display: 'block', marginBottom: '4px' }}>
                  Deploy Priority Express Courier & Arterial Route Diversion
                </strong>
                <ul style={{ fontSize: '0.75rem', color: '#94a3b8', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                  <li>Reassigns to dedicated tier-1 express runner immediately</li>
                  <li>Diverts delivery routing away from waterlogged / congested corridors</li>
                  <li>Projected ETA reduction: <strong>18 to 22 minutes</strong></li>
                </ul>
              </div>
            </div>
          )}

          {actionType === 'PROCEED' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                Confirm that you have reviewed the order telemetry and wish to allow the order to proceed under active surveillance without mutating route or inventory.
              </p>
              <div style={{ fontSize: '0.75rem', color: '#fb923c', backgroundColor: 'rgba(249, 115, 22, 0.1)', padding: '0.625rem', borderRadius: '4px' }}>
                ⚠ Order will remain flagged in the operations pipeline if SLA thresholds are breached.
              </div>
            </div>
          )}

          {/* Optional Operator Note */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
              Operations Log Note (Optional)
            </label>
            <input
              type="text"
              value={operatorNote}
              onChange={(e) => setOperatorNote(e.target.value)}
              placeholder="e.g. Verified with store merchant; approved express courier surcharge"
              className="text-input"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} className="btn-rescue-action primary">
            <Check size={14} aria-hidden="true" />
            Apply Rescue Action
          </button>
        </div>
      </div>
    </div>
  );
};
