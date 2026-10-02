/**
 * NOVA RESCUE - Core Data Types & Schemas
 * AI-Powered Order Reliability & Retention Engine for Quick-Commerce
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'STALE_STOCK' | 'UNCONFIRMED';

export type PartnerStatus = 'RELIABLE' | 'DEGRADED' | 'HIGH_FRICTION';

export type RiderStatus = 'ASSIGNED' | 'SEARCHING' | 'DELAYED_PICKUP' | 'REASSIGNED';

export type TrafficCondition = 'LOW' | 'MODERATE' | 'SEVERE';

export type WeatherCondition = 'CLEAR' | 'HEAVY_RAIN' | 'WATERLOGGING';

export type RetentionMilestone = 
  | '1st_ORDER_NEW' 
  | '2nd_ORDER_AT_RISK' 
  | '3rd_ORDER_CRITICAL_MILESTONE' 
  | '4th_PLUS_LOYAL';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number; // in INR (₹)
  category: string;
  availabilityConfidence: number; // 0 to 100%
  inventorySyncAgeHours: number; // hours since last store update
  stockStatus: StockStatus;
  isHighRiskItem: boolean;
  substituteAvailable?: {
    id: string;
    name: string;
    price: number;
    availabilityConfidence: number;
  };
}

export interface StoreContext {
  storeId: string;
  storeName: string;
  city: 'Bengaluru' | 'Mumbai' | 'Delhi-NCR';
  locality: string;
  inventoryLastUpdatedHoursAgo: number;
  historicalFulfillmentRate: number; // e.g. 0.88 = 88%
  rejectionRate: number; // e.g. 0.14 = 14%
  averagePrepTimeMin: number;
  activePartnerStatus: PartnerStatus;
  distanceKm: number;
}

export interface DeliveryConditions {
  distanceKm: number;
  assignedRiderStatus: RiderStatus;
  trafficCongestion: TrafficCondition;
  weatherCondition: WeatherCondition;
  standardEtaMin: number;
  currentEstimatedEtaMin: number;
  etaDelayMin: number;
}

export interface CustomerContext {
  customerId: string;
  customerName: string;
  phone: string;
  totalCompletedOrders: number;
  retentionMilestone: RetentionMilestone;
  pastCancellationsCount: number;
  lifetimeValue: number; // ₹
}

export type RiskCategory = 'INVENTORY' | 'STORE_RELIABILITY' | 'DELIVERY' | 'RETENTION_STAKE';

export interface RiskDriverBreakdown {
  category: RiskCategory;
  label: string;
  severity: RiskLevel;
  description: string;
  scoreContribution: number; // 0 to 100
  metricValue: string;
}

export interface OrderRiskEvaluation {
  reliabilityScore: number; // 0 - 100 (Higher is safer/more reliable)
  riskScore: number; // 100 - reliabilityScore
  riskLevel: RiskLevel;
  cancellationProbability: number; // 0 - 100 (%)
  primaryRisk: string;
  riskDrivers: RiskDriverBreakdown[];
  scenarioFactors: {
    inventoryRisk: number; // 0 - 100
    storeReliabilityRisk: number; // 0 - 100
    deliveryDelayRisk: number; // 0 - 100
  };
}

export type RescueActionType = 
  | 'SWITCH_STORE' 
  | 'SUBSTITUTE_PRODUCT' 
  | 'PROACTIVE_NOTIFY' 
  | 'ADJUST_DELIVERY' 
  | 'PROCEED';

export interface RescueState {
  applied: boolean;
  actionType: RescueActionType;
  appliedAt: string;
  originalReliabilityScore: number;
  newReliabilityScore: number;
  originalCancellationRisk: number;
  newCancellationRisk: number;
  originalEtaMin: number;
  newEtaMin: number;
  actionTitle: string;
  actionSummary: string;
  explanation: string;
  actionDetails?: Record<string, any>;
}

export interface Order {
  id: string;
  orderValue: number; // ₹
  createdAt: string;
  status: 'ACTIVE' | 'AT_RISK' | 'RESCUED' | 'CANCELLED';
  items: OrderItem[];
  store: StoreContext;
  delivery: DeliveryConditions;
  customer: CustomerContext;
  risk: OrderRiskEvaluation;
  rescueState: RescueState | null;
}

export interface AIAnalysisResult {
  risk_summary: string;
  primary_risk: string;
  risk_drivers: string[];
  root_cause: string;
  recommended_action: RescueActionType;
  reason: string;
  expected_effect: string;
  source: 'AI_GEMINI' | 'DETERMINISTIC_FALLBACK';
  modelUsed?: string;
  timestamp: string;
}

export interface BusinessImpactMetrics {
  ordersAnalyzed: number;
  highRiskDetected: number;
  ordersRescued: number;
  cancellationsAvoided: number;
  supportInteractionsAvoided: number;
  avgDeliveryImprovementMin: number;
  retentionOpportunityOrders: number;
  estimatedRevenueProtected: number; // ₹
  baselineCancellationRate: number; // 11%
  targetCancellationRate: number; // e.g. 5.5%
}

export interface AlternativeStoreOption {
  storeId: string;
  storeName: string;
  locality: string;
  distanceKm: number;
  inventoryAgeHours: number;
  fulfillmentRate: number;
  estimatedEtaMin: number;
  reliabilityDelta: number;
}
