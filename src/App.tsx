import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Order, AIAnalysisResult, RescueActionType } from './types';
import { getInitialDemoOrders } from './data/demoOrders';
import { applyRescueAction, ApplyRescuePayload } from './engine/rescueEngine';
import { analyzeOrderWithAI, checkServerAiStatus, ServerAiStatus } from './services/aiService';

import { Header } from './components/Header';
import { RescueConsole } from './components/RescueConsole';
import { OrderIntelligence } from './components/OrderIntelligence';
import { RescueActionModal } from './components/RescueActionModal';
import { BusinessImpactView } from './components/BusinessImpactView';
import { AiArchitectureModal } from './components/AiArchitectureModal';
import { PromptJourneyModal } from './components/PromptJourneyModal';

export const App: React.FC = () => {
  // Demo orders state
  const [orders, setOrders] = useState<Order[]>(() => getInitialDemoOrders());
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ORD-9401');
  const [activeTab, setActiveTab] = useState<'CONSOLE' | 'IMPACT'>('CONSOLE');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  // AI & Modals state
  const [aiAnalyses, setAiAnalyses] = useState<Record<string, AIAnalysisResult>>({});
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState<boolean>(false);
  const [activeRescueAction, setActiveRescueAction] = useState<RescueActionType | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerAiStatus>({
    configured: false,
    model: 'gemini-2.5-flash',
    mode: 'DETERMINISTIC_FALLBACK'
  });

  // Query server-side AI connection on mount
  useEffect(() => {
    checkServerAiStatus().then(status => {
      setServerStatus(status);
    });
  }, []);

  // Find currently selected order
  const selectedOrder = useMemo(() => {
    return orders.find(o => o.id === selectedOrderId) || orders[0];
  }, [orders, selectedOrderId]);

  // Run AI / Fallback analysis for an order via server proxy
  const runAnalysis = useCallback(async (order: Order, force: boolean = false) => {
    if (!order) return;
    if (!force && aiAnalyses[order.id]) return;

    setIsAiLoading(true);
    try {
      const result = await analyzeOrderWithAI(order);
      setAiAnalyses(prev => ({
        ...prev,
        [order.id]: result
      }));
    } catch (e) {
      console.error('Failed to run AI analysis:', e);
    } finally {
      setIsAiLoading(false);
    }
  }, [aiAnalyses]);

  // Automatically trigger analysis whenever selected order changes
  useEffect(() => {
    if (selectedOrder && !aiAnalyses[selectedOrder.id]) {
      const timer = setTimeout(() => {
        runAnalysis(selectedOrder);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedOrder, aiAnalyses, runAnalysis]);

  // Handle order selection
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  // Open rescue modal
  const handleInitiateRescueAction = (actionType: RescueActionType) => {
    setActiveRescueAction(actionType);
  };

  // Apply rescue action and update order state
  const handleApplyRescue = (payload: ApplyRescuePayload) => {
    const updatedOrder = applyRescueAction(payload);
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));

    // Clear stale analysis for this order so fresh post-rescue diagnosis is displayed
    setAiAnalyses(prev => {
      const copy = { ...prev };
      delete copy[updatedOrder.id];
      return copy;
    });

    // Re-run analysis for updated order
    setTimeout(() => {
      runAnalysis(updatedOrder, true);
    }, 100);
  };

  // Reset demonstration data
  const handleResetDemoData = () => {
    const fresh = getInitialDemoOrders();
    setOrders(fresh);
    setSelectedOrderId('ORD-9401');
    setAiAnalyses({});
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        serverStatus={serverStatus}
        onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
        onOpenJourneyModal={() => setIsJourneyModalOpen(true)}
        onResetDemoData={handleResetDemoData}
      />

      {/* Main Content Area */}
      <main className="main-content" id="main-content">
        {activeTab === 'CONSOLE' ? (
          <div className="ops-workspace">
            {/* Left: Orders Stream Panel */}
            <RescueConsole
              orders={orders}
              selectedOrderId={selectedOrderId}
              onSelectOrder={handleSelectOrder}
              selectedCity={selectedCity}
            />

            {/* Right: Selected Order Intelligence & Rescue View */}
            {selectedOrder ? (
              <OrderIntelligence
                order={selectedOrder}
                aiAnalysis={aiAnalyses[selectedOrder.id] || null}
                isAiLoading={isAiLoading}
                onRunAiAnalysis={() => runAnalysis(selectedOrder, true)}
                onInitiateRescueAction={handleInitiateRescueAction}
              />
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                Select an order from the stream to inspect operational intelligence.
              </div>
            )}
          </div>
        ) : (
          /* Business Impact & Retention View */
          <BusinessImpactView orders={orders} />
        )}
      </main>

      {/* Rescue Action Modal */}
      {activeRescueAction && selectedOrder && (
        <RescueActionModal
          order={selectedOrder}
          actionType={activeRescueAction}
          onClose={() => setActiveRescueAction(null)}
          onApplyRescue={handleApplyRescue}
        />
      )}

      {/* Secure AI Architecture & Status Modal */}
      <AiArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
        serverStatus={serverStatus}
      />

      {/* PROMPTWARS Prompt Journey Modal */}
      <PromptJourneyModal
        isOpen={isJourneyModalOpen}
        onClose={() => setIsJourneyModalOpen(false)}
      />
    </div>
  );
};

export default App;
