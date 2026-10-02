/**
 * NOVA RESCUE - Synthetic Demonstration Dataset
 * Demonstrating operational scenarios across Bengaluru, Mumbai, and Delhi-NCR:
 * 1. High Inventory Risk (Stale inventory > 24h, unconfirmed SKUs)
 * 2. High Delivery Risk (Heavy rain/traffic, rider searching, severe delay)
 * 3. High Store Reliability Risk (High partner rejection rate, high friction)
 * 4. Combined High Risk (Multi-vector failure: stale stock + store delay + transit)
 * 5. Low-Risk Healthy Order (Fresh sync < 1h, high fulfillment, on-time rider)
 * 6. High Inventory Acquisition Risk (First-time customer order)
 */

import { Order } from '../types';
import { evaluateOrderRisk } from '../engine/riskEngine';

const RAW_DEMO_ORDERS: Omit<Order, 'risk' | 'rescueState'>[] = [
  {
    id: 'ORD-9401',
    orderValue: 548,
    createdAt: '10 mins ago',
    status: 'AT_RISK',
    customer: {
      customerId: 'CUST-BLR-8419',
      customerName: 'Rahul Sharma',
      phone: '+91 98450 12849',
      totalCompletedOrders: 2, // Next order is #3 -> CRITICAL 72% RETENTION THRESHOLD!
      retentionMilestone: '3rd_ORDER_CRITICAL_MILESTONE',
      pastCancellationsCount: 1,
      lifetimeValue: 1096
    },
    store: {
      storeId: 'STR-BLR-02',
      storeName: 'Shree Krishna Supermarket',
      city: 'Bengaluru',
      locality: 'Koramangala 4th Block',
      inventoryLastUpdatedHoursAgo: 38.5, // > 1.5 days stale!
      historicalFulfillmentRate: 0.84,
      rejectionRate: 0.11,
      averagePrepTimeMin: 14,
      activePartnerStatus: 'HIGH_FRICTION',
      distanceKm: 1.9
    },
    delivery: {
      distanceKm: 1.9,
      assignedRiderStatus: 'ASSIGNED',
      trafficCongestion: 'MODERATE',
      weatherCondition: 'CLEAR',
      standardEtaMin: 28,
      currentEstimatedEtaMin: 31,
      etaDelayMin: 3
    },
    items: [
      {
        id: 'SKU-MILK-01',
        name: 'Amul Taaza Toned Fresh Milk (1L)',
        quantity: 2,
        price: 56,
        category: 'Dairy & Eggs',
        availabilityConfidence: 34,
        inventorySyncAgeHours: 38.5,
        stockStatus: 'UNCONFIRMED',
        isHighRiskItem: true,
        substituteAvailable: {
          id: 'SKU-MILK-02',
          name: 'Nandini GoodLife Toned Milk (1L)',
          price: 56,
          availabilityConfidence: 98
        }
      },
      {
        id: 'SKU-ATTA-05',
        name: 'Aashirvaad Superior MP Chakki Atta (5kg)',
        quantity: 1,
        price: 310,
        category: 'Atta & Rice',
        availabilityConfidence: 45,
        inventorySyncAgeHours: 38.5,
        stockStatus: 'STALE_STOCK',
        isHighRiskItem: true,
        substituteAvailable: {
          id: 'SKU-ATTA-06',
          name: 'Fortune Chakki Fresh Sharbati Atta (5kg)',
          price: 305,
          availabilityConfidence: 99
        }
      },
      {
        id: 'SKU-BREAD-01',
        name: 'Britannia 100% Whole Wheat Bread (400g)',
        quantity: 1,
        price: 50,
        category: 'Bakery',
        availabilityConfidence: 75,
        inventorySyncAgeHours: 38.5,
        stockStatus: 'IN_STOCK',
        isHighRiskItem: false
      },
      {
        id: 'SKU-BUTTER-02',
        name: 'Amul Salted Butter (100g)',
        quantity: 1,
        price: 60,
        category: 'Dairy & Eggs',
        availabilityConfidence: 82,
        inventorySyncAgeHours: 38.5,
        stockStatus: 'IN_STOCK',
        isHighRiskItem: false
      }
    ]
  },
  {
    id: 'ORD-9402',
    orderValue: 692,
    createdAt: '16 mins ago',
    status: 'AT_RISK',
    customer: {
      customerId: 'CUST-MUM-4921',
      customerName: 'Pooja Iyer',
      phone: '+91 98201 44102',
      totalCompletedOrders: 1,
      retentionMilestone: '2nd_ORDER_AT_RISK',
      pastCancellationsCount: 0,
      lifetimeValue: 486
    },
    store: {
      storeId: 'STR-MUM-01',
      storeName: 'GreenBasket Mart',
      city: 'Mumbai',
      locality: 'Bandra West (Hill Road)',
      inventoryLastUpdatedHoursAgo: 0.8, // Fresh inventory!
      historicalFulfillmentRate: 0.96,
      rejectionRate: 0.03,
      averagePrepTimeMin: 9,
      activePartnerStatus: 'RELIABLE',
      distanceKm: 3.8
    },
    delivery: {
      distanceKm: 3.8,
      assignedRiderStatus: 'SEARCHING', // Bottleneck: No courier yet
      trafficCongestion: 'SEVERE',
      weatherCondition: 'HEAVY_RAIN', // Monsoon transit impairment
      standardEtaMin: 25,
      currentEstimatedEtaMin: 54, // +29 mins delay!
      etaDelayMin: 29
    },
    items: [
      {
        id: 'SKU-GHEE-01',
        name: 'Nandini Pure Cow Ghee (500ml Pouch)',
        quantity: 1,
        price: 380,
        category: 'Cooking Essentials',
        availabilityConfidence: 98,
        inventorySyncAgeHours: 0.8,
        stockStatus: 'IN_STOCK',
        isHighRiskItem: false
      },
      {
        id: 'SKU-DAL-03',
        name: 'Tata Sampann Unpolished Toor Dal (1kg)',
        quantity: 1,
        price: 195,
        category: 'Dals & Pulses',
        availabilityConfidence: 95,
        inventorySyncAgeHours: 0.8,
        stockStatus: 'IN_STOCK',
        isHighRiskItem: false
      },
      {
        id: 'SKU-SALT-01',
        name: 'Tata Salt Lite Low Sodium (1kg)',
        quantity: 1,
        price: 45,
        category: 'Spices & Seasonings',
        availabilityConfidence: 99,
        inventorySyncAgeHours: 0.8,
        stockStatus: 'IN_STOCK',
        isHighRiskItem: false
      },
      {
        id: 'SKU-SNACK-01',
        name: 'Haldiram Nagpur Aloo Bhujia (200g)',
        quantity: 1,
        price: 72,
        category: 'Snacks & Munchies',
        availabilityConfidence: 96,
        inventorySyncAgeHours: 0.8,
        stockStatus: 'IN_STOCK',
        isHighRiskItem: false
      }
    ]
  },
  {
    id: 'ORD-9403',
    orderValue: 415,
    createdAt: '12 mins ago',
    status: 'AT_RISK',
    customer: {
      customerId: 'CUST-DEL-3382',
      customerName: 'Vikram Mehta',
      phone: '+91 98110 59203',
      totalCompletedOrders: 6,
      retentionMilestone: '4th_PLUS_LOYAL',
      pastCancellationsCount: 1,
      lifetimeValue: 3120
    },
    store: {
      storeId: 'STR-DEL-04',
      storeName: 'Om Sai Daily Needs',
      city: 'Delhi-NCR',
      locality: 'Sector 29 Gurgaon',
      inventoryLastUpdatedHoursAgo: 16.5,
      historicalFulfillmentRate: 0.81,
      rejectionRate: 0.17, // 17% rejections!
      averagePrepTimeMin: 26, // 26 min prep time
      activePartnerStatus: 'HIGH_FRICTION', // 39% partner friction issue
      distanceKm: 2.2
    },
    delivery: {
      distanceKm: 2.2,
      assignedRiderStatus: 'ASSIGNED',
      trafficCongestion: 'MODERATE',
      weatherCondition: 'CLEAR',
      standardEtaMin: 28,
      currentEstimatedEtaMin: 42,
      etaDelayMin: 14
    },
    items: [
      {
        id: 'SKU-OIL-02',
        name: 'Fortune Sunlite Refined Sunflower Oil (1L Pouch)',
        quantity: 1,
        price: 155,
        category: 'Oils & Ghee',
        availabilityConfidence: 74,
        inventorySyncAgeHours: 16.5,
        stockStatus: 'IN_STOCK',
        isHighRiskItem: false
      },
      {
        id: 'SKU-SPICE-01',
        name: 'Everest Royal Garam Masala (100g)',
        quantity: 1,
        price: 92,
        category: 'Spices',
        availabilityConfidence: 70,
        inventorySyncAgeHours: 16.5,
        stockStatus: 'IN_STOCK',
        isHighRiskItem: false
      },
      {
        id: 'SKU-SPICE-02',
        name: 'MDH Deggi Mirch Powder (100g)',
        quantity: 1,
        price: 88,
        category: 'Spices',
        availabilityConfidence: 68,
        inventorySyncAgeHours: 16.5,
        stockStatus: 'LOW_STOCK',
        isHighRiskItem: true,
        substituteAvailable: {
          id: 'SKU-SPICE-03',
          name: 'Catch Kashmiri Mirch Powder (100g)',
          price: 90,
          availabilityConfidence: 97
        }
      },
      {
        id: 'SKU-BEV-01',
        name: 'Red Label Natural Care Tea (250g)',
        quantity: 1,
        price: 80,
        category: 'Beverages',
        availabilityConfidence: 80,
        inventorySyncAgeHours: 16.5,
        stockStatus: 'IN_STOCK',
        isHighRiskItem: false
      }
    ]
  },
  {
    id: 'ORD-9404',
    orderValue: 635,
    createdAt: '22 mins ago',
    status: 'AT_RISK',
    customer: {
      customerId: 'CUST-BLR-1102',
      customerName: 'Sneha Kulkarni',
      phone: '+91 97412 88391',
      totalCompletedOrders: 2, // Crucial 3rd order milestone
      retentionMilestone: '3rd_ORDER_CRITICAL_MILESTONE',
      pastCancellationsCount: 2,
      lifetimeValue: 1180
    },
    store: {
      storeId: 'STR-BLR-07',
      storeName: 'Balaji Kirana & Provisions',
      city: 'Bengaluru',
      locality: 'Indiranagar 100ft Road',
      inventoryLastUpdatedHoursAgo: 52.0, // > 2 days stale inventory!
      historicalFulfillmentRate: 0.79,
      rejectionRate: 0.16,
      averagePrepTimeMin: 22,
      activePartnerStatus: 'HIGH_FRICTION',
      distanceKm: 3.5
    },
    delivery: {
      distanceKm: 3.5,
      assignedRiderStatus: 'DELAYED_PICKUP',
      trafficCongestion: 'SEVERE',
      weatherCondition: 'WATERLOGGING',
      standardEtaMin: 28,
      currentEstimatedEtaMin: 49,
      etaDelayMin: 21
    },
    items: [
      {
        id: 'SKU-DAIRY-09',
        name: 'Heritage Special Toned Milk (500ml)',
        quantity: 2,
        price: 28,
        category: 'Dairy',
        availabilityConfidence: 28,
        inventorySyncAgeHours: 52.0,
        stockStatus: 'UNCONFIRMED',
        isHighRiskItem: true,
        substituteAvailable: {
          id: 'SKU-DAIRY-10',
          name: 'Nandini Toned Milk (500ml Fresh Batch)',
          price: 28,
          availabilityConfidence: 99
        }
      },
      {
        id: 'SKU-YOGURT-01',
        name: 'Epigamia Greek Yogurt Natural (400g)',
        quantity: 1,
        price: 180,
        category: 'Dairy',
        availabilityConfidence: 42,
        inventorySyncAgeHours: 52.0,
        stockStatus: 'STALE_STOCK',
        isHighRiskItem: true,
        substituteAvailable: {
          id: 'SKU-YOGURT-02',
          name: 'Milky Mist Natural Greek Yogurt (400g)',
          price: 175,
          availabilityConfidence: 98
        }
      },
      {
        id: 'SKU-TEA-04',
        name: 'Organic India Tulsi Green Tea (25 Envelopes)',
        quantity: 1,
        price: 199,
        category: 'Health & Wellness',
        availabilityConfidence: 50,
        inventorySyncAgeHours: 52.0,
        stockStatus: 'LOW_STOCK',
        isHighRiskItem: false
      },
      {
        id: 'SKU-HONEY-01',
        name: 'Dabur 100% Pure Honey Squeezy (250g)',
        quantity: 1,
        price: 200,
        category: 'Breakfast',
        availabilityConfidence: 65,
        inventorySyncAgeHours: 52.0,
        stockStatus: 'IN_STOCK',
        isHighRiskItem: false
      }
    ]
  },
  {
    id: 'ORD-9405',
    orderValue: 580,
    createdAt: '5 mins ago',
    status: 'ACTIVE',
    customer: {
      customerId: 'CUST-MUM-9912',
      customerName: 'Arun Swaminathan',
      phone: '+91 99308 19044',
      totalCompletedOrders: 8,
      retentionMilestone: '4th_PLUS_LOYAL',
      pastCancellationsCount: 0,
      lifetimeValue: 4320
    },
    store: {
      storeId: 'STR-MUM-09',
      storeName: 'NOVA QuickStore Central Hub',
      city: 'Mumbai',
      locality: 'Powai Hiranandani',
      inventoryLastUpdatedHoursAgo: 0.2, // 12 minutes ago!
      historicalFulfillmentRate: 0.99,
      rejectionRate: 0.01,
      averagePrepTimeMin: 6,
      activePartnerStatus: 'RELIABLE',
      distanceKm: 1.4
    },
    delivery: {
      distanceKm: 1.4,
      assignedRiderStatus: 'ASSIGNED',
      trafficCongestion: 'LOW',
      weatherCondition: 'CLEAR',
      standardEtaMin: 22,
      currentEstimatedEtaMin: 21,
      etaDelayMin: 0
    },
    items: [
      {
        id: 'SKU-BUTTER-05',
        name: 'Amul Pasteurised Salted Butter (500g)',
        quantity: 1,
        price: 285,
        category: 'Dairy',
        availabilityConfidence: 100,
        inventorySyncAgeHours: 0.2,
        stockStatus: 'IN_STOCK',
        isHighRiskItem: false
      },
      {
        id: 'SKU-COFFEE-01',
        name: 'Bru Instant Coffee Granules (200g Jar)',
        quantity: 1,
        price: 210,
        category: 'Beverages',
        availabilityConfidence: 98,
        inventorySyncAgeHours: 0.2,
        stockStatus: 'IN_STOCK',
        isHighRiskItem: false
      },
      {
        id: 'SKU-HYG-01',
        name: 'Dettol Liquid Handwash Refill Pouch (750ml)',
        quantity: 1,
        price: 85,
        category: 'Personal Care',
        availabilityConfidence: 99,
        inventorySyncAgeHours: 0.2,
        stockStatus: 'IN_STOCK',
        isHighRiskItem: false
      }
    ]
  },
  {
    id: 'ORD-9406',
    orderValue: 365,
    createdAt: '8 mins ago',
    status: 'AT_RISK',
    customer: {
      customerId: 'CUST-DEL-7711',
      customerName: 'Ananya Roy',
      phone: '+91 99100 28190',
      totalCompletedOrders: 0, // 1st Order - Acquisition risk!
      retentionMilestone: '1st_ORDER_NEW',
      pastCancellationsCount: 0,
      lifetimeValue: 365
    },
    store: {
      storeId: 'STR-DEL-08',
      storeName: 'Gupta Traders & General Store',
      city: 'Delhi-NCR',
      locality: 'South Extension Part II',
      inventoryLastUpdatedHoursAgo: 41.0, // Stale inventory
      historicalFulfillmentRate: 0.85,
      rejectionRate: 0.12,
      averagePrepTimeMin: 18,
      activePartnerStatus: 'HIGH_FRICTION',
      distanceKm: 2.7
    },
    delivery: {
      distanceKm: 2.7,
      assignedRiderStatus: 'ASSIGNED',
      trafficCongestion: 'MODERATE',
      weatherCondition: 'CLEAR',
      standardEtaMin: 27,
      currentEstimatedEtaMin: 34,
      etaDelayMin: 7
    },
    items: [
      {
        id: 'SKU-MILK-11',
        name: 'Mother Dairy Full Cream Milk (1L)',
        quantity: 2,
        price: 68,
        category: 'Dairy',
        availabilityConfidence: 36,
        inventorySyncAgeHours: 41.0,
        stockStatus: 'UNCONFIRMED',
        isHighRiskItem: true,
        substituteAvailable: {
          id: 'SKU-MILK-12',
          name: 'Amul Gold Full Cream Milk (1L)',
          price: 68,
          availabilityConfidence: 99
        }
      },
      {
        id: 'SKU-BISCUIT-01',
        name: 'Parle-G Gold Biscuits (1kg Family Pack)',
        quantity: 1,
        price: 120,
        category: 'Biscuits',
        availabilityConfidence: 65,
        inventorySyncAgeHours: 41.0,
        stockStatus: 'LOW_STOCK',
        isHighRiskItem: false
      },
      {
        id: 'SKU-SPICE-08',
        name: 'Catch Table Salt Sprinkler (200g)',
        quantity: 1,
        price: 45,
        category: 'Spices',
        availabilityConfidence: 88,
        inventorySyncAgeHours: 41.0,
        stockStatus: 'IN_STOCK',
        isHighRiskItem: false
      },
      {
        id: 'SKU-SNACK-09',
        name: 'Kurkure Masala Munch (90g)',
        quantity: 2,
        price: 20,
        category: 'Snacks',
        availabilityConfidence: 90,
        inventorySyncAgeHours: 41.0,
        stockStatus: 'IN_STOCK',
        isHighRiskItem: false
      }
    ]
  }
];

export function getInitialDemoOrders(): Order[] {
  return RAW_DEMO_ORDERS.map(raw => {
    const risk = evaluateOrderRisk(raw.items, raw.store, raw.delivery, raw.customer);
    return {
      ...raw,
      risk,
      rescueState: null
    };
  });
}
