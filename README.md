# NOVA RESCUE

> **AI-Powered Order Reliability & Retention Engine**  
> *Developed for the PROMPTWARS Business Rescue Challenge*

---

## Live Demo

**Live application:** https://nova-rescue.onrender.com

**Deployment:** Render Web Service (free instance). The service runs the production Vite build through the native Node.js server and exposes the `/api/status` and `/api/analyze-order` endpoints. The free instance may spin down after inactivity, so the first request can take longer to wake the service.

---

## Problem Diagnosis

**NOVA CART** is a quick-commerce and local shopping platform operating across three major Indian metropolitan cities (Bengaluru, Mumbai, Delhi-NCR) with a network of 620 local partner stores. 

While top-of-funnel customer acquisition has expanded rapidly, the core customer journey has suffered severe operational degradation. Fragmented internal software systems have created critical information silos between merchant inventory, rider dispatch, and customer service. Consequently, operational bottlenecks—principally inventory stockouts and delivery delays—turn high-intent, valuable orders into cancellations, support friction, and long-term customer attrition.

---

## Key Evidence

The empirical operational telemetry reveals a sharp contrast between growth and retention:

| Metric | Baseline | Current Value | Direction & Impact |
| :--- | :--- | :--- | :--- |
| **Registered Users** | 82,000 | 120,000 | ↗ +46.3% top-of-funnel growth |
| **Monthly Active Users (MAU)** | 39,000 | 46,000 | ↗ +17.9% active audience |
| **Monthly Orders** | 31,200 | 38,500 | ↗ +23.4% volume demand |
| **Average Order Value (AOV)** | ₹452 | ₹486 | ↗ +7.5% basket spend |
| **Repeat Purchase Rate** | **41%** | **27%** | **↘ -14% severe retention collapse** |
| **Average Delivery Time** | 29 mins | 37 mins | ↗ +27.6% customer waiting time |
| **Cancellation Rate** | 6% | **11%** | **↗ Nearly doubled (4,235 orders/mo lost)** |
| **Monthly Support Tickets** | 3,100 | **5,900** | ↗ +90.3% customer dissatisfaction |
| **Root Cause: Product Unavailability** | — | **35%** | Primary cancellation driver |
| **Root Cause: Delivery Delay** | — | **27%** | Secondary cancellation driver |
| **Partner Inventory Friction** | — | **39%** | Stores find online catalog maintenance burdensome |
| **Store Inventory Sync Lag** | — | **1 to 3 days** | Physical shelves desynchronized from app |
| **Post-Order Stockout Exposure** | — | **29%** | Shoppers see available goods become unavailable |
| **Search Frustration** | — | **19%** | Shoppers repeatedly search unavailable local SKUs |
| **Critical Retention Milestone** | — | **72%** | **Probability of reordering next month if order #3 completes** |

---

## Insight

### The Reliability-Retention Multiplier

In quick-commerce, **customer retention is not won with marketing discounts; it is earned through operational predictability**.

1. **The 3rd-Order Retention Milestone (72% Rule):** Platform telemetry proves that customers who reach **3 completed orders** achieve a **72% probability of ordering again the following month**. When an order fails during the customer's early journey (Orders 1, 2, or 3), that customer is permanently lost to competing platforms.
2. **Operational Rescue Opportunity (The 62% Cancellation Share):** 62% of recorded cancellations are attributed to two operational categories in the case data: product unavailability (35%) and customer cancellation because of delivery delay (27%). These categories represent the primary operational rescue opportunity; the case does not prove that all 62% are fully preventable.
3. **The Information Asymmetry:** Customers do not cancel because a store is busy; they cancel because the system is silent until failure occurs. Real-time pre-failure intervention transforms potential churn into sustained brand trust.

---

## Solution

**NOVA RESCUE** is a purpose-built B2B SaaS operations engine that intercepts at-risk orders **before** the failure turns into a cancellation or negative customer experience.

Rather than acting as a generic conversational chatbot, NOVA RESCUE serves as an **active decision and execution cockpit** for NOVA CART operations teams. It evaluates physical catalog freshness, merchant fulfillment history, courier transit conditions, and customer retention stakes, generates structured AI root-cause reasoning, and provides direct, one-click operational rescues.

---

## Prompt Journey

> *Note: These prompts represent the key decision points in the reasoning journey; the complete AI conversation is not included.*

### Prompt 1 — Business Diagnosis
Analyzed the six-month performance data and customer signals to identify the underlying business problem rather than optimizing for surface-level growth.

### Prompt 2 — Hypothesis Challenge
Compared retention, delivery, inventory, marketing and partner-store hypotheses against the case evidence.

### Prompt 3 — Root Cause
Investigated the relationship between order reliability, cancellations, support interactions and repeat purchasing.

### Prompt 4 — Product Direction
Explored digital interventions that could be implemented without warehouses, major infrastructure expansion, hundreds of employees or unsustainable discounts.

### Prompt 5 — Rescue Workflow
Designed a system that detects risky orders, identifies likely failure causes and recommends an operational intervention.

### Prompt 6 — Business Impact
Designed a scenario model to estimate the potential effect on cancellation, support load, GMV and retention.

---

## Target User

- **Primary User:** NOVA CART Operations Control Desk & Business Rescue Specialists.
- **Operator Goal:** Rapidly isolate orders facing failure probability, diagnose operational root causes, dispatch immediate automated or guided mitigations, and safeguard high-stake customer cohorts.

---

## User Journey

```
┌─────────────────┐       ┌────────────────────┐       ┌────────────────────────┐
│  Rescue Console │  ──>  │ Order Intelligence │  ──>  │  AI Root-Cause Reason  │
│  (KPIs & Queue) │       │ (Full Telemetry)   │       │ (Diagnosis & Action)   │
└─────────────────┘       └────────────────────┘       └────────────────────────┘
                                                                    │
┌─────────────────┐       ┌────────────────────┐                    │
│ Business Impact │  <──  │  Post-Rescue State │  <─────────────────┘
│ (GMV & LTV)     │       │ (Risk Recalculated)│       Apply Rescue Action
└─────────────────┘       └────────────────────┘  (Switch / Sub / Courier / Notify)
```

1. **Stream Surveillance:** The operator monitors the active order queue sorted by risk level, flagged with clear badges (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `RESCUED`).
2. **Order Selection & Inspection:** Selecting an order reveals customer profile (highlighting the critical 3rd-order milestone), cart item stock confidence, partner inventory sync age, and live courier transit telemetry.
3. **Structured AI Diagnosis:** The system generates an actionable root-cause diagnosis identifying the exact operational bottleneck.
4. **Rescue Execution:** The operator triggers one of 5 realistic interventions:
   - **Switch Store:** Automatically reroutes fulfillment to a verified partner store with fresh inventory (<1h sync) and high fulfillment rates (>98%).
   - **Substitute Product:** Swaps stale or unconfirmed SKUs with verified in-stock equivalents at price parity.
   - **Adjust Delivery:** Reassigns dedicated priority express couriers and optimizes route corridors to bypass weather/traffic bottlenecks.
   - **Proactively Notify:** Dispatches real-time SMS/WhatsApp expectation management to prevent support escalation.
   - **Proceed As-Is:** Operator verification under active surveillance.
5. **Dynamic State Recalculation:** The engine recalculates reliability score, drops cancellation risk, updates projected ETA, and provides a clear audit log of why the rescue succeeded.
6. **Business Impact Attribution:** Measures protected GMV, cancellations avoided, support tickets saved, and customer lifetime value preserved.

---

## AI Role

AI in NOVA RESCUE is **strictly dedicated to business reasoning, operational diagnosis, and structured decision recommendation**. It is **not** a chatbot.

### Structured Output Schema
The AI reasoning engine communicates strictly via strongly validated JSON:

```json
{
  "risk_summary": "Order ORD-9401 (₹548) flagged with Reliability Score of 44/100. Critical 3rd-Order Retention Stake.",
  "primary_risk": "Imminent Store Stockout & Catalog Desynchronization",
  "risk_drivers": [
    "Store inventory last synced 38.5 hrs ago (>24h threshold)",
    "2 unconfirmed dairy SKUs: Amul Taaza Milk, Aashirvaad Atta",
    "Partner store historical rejection rate: 11%"
  ],
  "root_cause": "Store Shree Krishna Supermarket has not synchronized physical inventory in 38.5 hours. Cart contains 2 unconfirmed fast-moving SKUs physically absent from shelves, triggering NOVA CART's primary cancellation pathway (35% platform churn).",
  "recommended_action": "SWITCH_STORE",
  "reason": "Switching fulfillment to a verified partner hub with inventory synchronized under 1 hour guarantees physical SKU availability, bypassing merchant order cancellation.",
  "expected_effect": "Eliminates the 35% probability of item unavailability cancellation and improves fulfillment reliability from 44% to >92%."
}
```

### Zero-Dependency Fallback Engine
If an external AI API key is not supplied, network latency occurs, or rate limits are reached, the application **automatically and seamlessly switches to its deterministic local fallback reasoning engine**. The fallback engine evaluates the exact same operational telemetry and returns the identical structured schema. The application is **100% demonstrable offline without external dependencies**.

---

## Risk Engine

The baseline risk engine is a **deterministic, explainable rule-based scoring engine** (not an unverified "black box ML" model).

### Scoring Formulation
Composite Reliability Score ($R \in [0, 100]$):
$$R = 100 - \left( 0.40 \cdot \text{Risk}_{\text{inventory}} + 0.30 \cdot \text{Risk}_{\text{store}} + 0.30 \cdot \text{Risk}_{\text{delivery}} \right)$$

1. **Inventory Risk Component ($\text{Risk}_{\text{inventory}}$):**
   - **Sync Age Factor:** Store sync age $> 48\text{h} \rightarrow 95\text{ pts}$; $> 24\text{h} \rightarrow 75\text{ pts}$; $> 8\text{h} \rightarrow 40\text{ pts}$.
   - **SKU Confidence:** Evaluates unconfirmed stock (`UNCONFIRMED`, `STALE_STOCK`) and average availability confidence across line items.
2. **Store Reliability Component ($\text{Risk}_{\text{store}}$):**
   - **Rejection History:** Benchmark quick-commerce rejection is $< 3\%$; penalizes stores rejecting $> 10\%$.
   - **Partner Friction Status:** Captures the 39% of stores reporting inventory maintenance friction.
   - **Average Packing Prep Time:** Normalizes against 7–10 minute quick-commerce SLAs.
3. **Delivery Delay Component ($\text{Risk}_{\text{delivery}}$):**
   - **SLA Breach:** Current ETA vs Standard Promised SLA (penalizes delays $> 10\text{m}$ and $> 20\text{m}$).
   - **Courier Status:** Penalizes delayed pickups and unassigned couriers (`SEARCHING`).
   - **Environmental Impediments:** Monsoon rainfall, waterlogging, and severe arterial congestion.
4. **Retention Milestone Multiplier:**
   - Orders corresponding to customer order #3 (`3rd_ORDER_CRITICAL_MILESTONE`) receive elevated priority tags reflecting the 72% month-over-month retention value.

---

## Google Technology

NOVA RESCUE integrates **Google Gemini 2.5 Flash** through Google's official REST API endpoint:
- **Model:** `gemini-2.5-flash` (configurable via `process.env.GEMINI_MODEL`)
- **Output Enforcement:** `responseMimeType: "application/json"` with prompt-constrained JSON schema.
- **Failover Architecture:** Complete programmatic fallback to internal deterministic reasoning if keys are absent or invalid.
- *Technology verified & implemented:* Direct Google Gemini API generation with structured output. No unimplemented services are claimed.

---

## Business Impact & Methodological Framework

The platform rigorously and transparently separates **four distinct analytical categories**:

### 1. Historical Case Evidence (Empirical Case Facts)
Direct metrics from the NOVA CART competition case brief:
- **Monthly Orders:** 38,500
- **Average Order Value (AOV):** ₹486
- **Current Cancellation Rate:** 11.0% (4,235 orders/month)
- **Monthly Customer Support Inquiries:** 5,900
- **Repeat Order Collapse:** Dropped from 41% to 27%
- **Cancellation Root Causes:** 35% product unavailability, 27% delivery delay (62% combined operational categories)
- **Retention Probability:** 72% probability of ordering next month after completing order #3

### 2. Deterministic Calculations (Live Session State)
- Mathematical operations evaluated on the active order objects in the local session (measuring exact GMV protected, orders rescued, and risk score deltas across demonstrated orders).

### 3. Synthetic Demonstration Data (Sample Orders)
- Representative operational scenarios across Bengaluru, Mumbai, and Delhi-NCR created for operator evaluation.

### 4. Scenario Projections & Modeled Impact (Forward-Looking Estimates)
Forward-looking projections are mathematical estimates derived from explicit, stated assumptions:

| Projected Metric (at 85% Store Coverage) | Scenario Estimate | Underlying Modeling Assumptions |
| :--- | :--- | :--- |
| **Modeled Monthly Cancellations Avoided** | **~1,940 orders/mo** | Derived from 74% resolution of the 62% addressable cancellation causes across covered stores. |
| **Projected Cancellation Rate** | **11.0% → 6.2%** | Modeled reduction assuming addressable causes are mitigated through proactive rerouting/substitutions. |
| **Modeled Monthly GMV Preserved** | **~₹9.4 Lakhs / mo** | Projected at historical ₹486 AOV across modeled cancellations avoided. |
| **Modeled Support Inquiries Averted** | **~2,690 tickets / mo** | Assumes 1.38 support tickets generated per order cancellation; saves estimated ₹3.2L in OPEX at ₹120/ticket. |
| **Modeled Annualized Retention LTV** | **~₹88 Lakhs** | Assumes 38% of rescued orders belong to early cohorts converting past the 72% 3rd-order repeat threshold (2.8 orders/mo). |

*Note: Projections are simulation estimates based on mathematical models and must never be confused with historical platform actuals.*

---

## Security

1. **Zero-Secret Client Architecture:** The browser client is completely isolated from credentials. Real API keys are never exposed, requested, or stored in the browser (no React state, no `localStorage`, no `sessionStorage`, no `VITE_*` client variables, and no URL parameters).
2. **Server-Side API Proxy (`/api/analyze-order`):** The browser dispatches only sanitized order telemetry to the server-side proxy endpoint. The Node.js server reads `process.env.GEMINI_API_KEY` securely from the backend environment and performs server-to-server TLS calls to Google's official Gemini endpoint.
3. **Production-Safe Deterministic Default:** If no `GEMINI_API_KEY` is provided on the server, the application automatically operates in deterministic production fallback mode with zero downtime or broken workflows.
4. **Strict Server-Side & Client-Side Schema Validation:** All order payloads and AI-generated responses are validated against strongly typed schemas (`validateStructuredSchema` and `validateAIAnalysisSchema`).
5. **Git Hygiene & Secret Prevention:** Strict `.gitignore` protecting `.env`, `.env.local`, build artifacts, `dist`, `coverage`, and `node_modules` ensuring the repository size remains **~110 KB (under 0.2 MB)**.

---

## Testing

Comprehensive automated tests written in **Vitest**:

```bash
npm test
```

### Test Coverage (21 Passing Tests across 5 Suites)
1. **Server Proxy Security (`src/tests/serverProxy.test.ts` - 4 tests):**
   - Secure fallback when no `GEMINI_API_KEY` is configured on the server.
   - Safe rejection of placeholder or empty keys.
   - Structured JSON operational schema validation.
   - Rejection and safe fallback on null or invalid order telemetry payloads.
2. **Risk Engine (`src/tests/riskEngine.test.ts` - 8 tests):**
   - Low inventory risk on fresh sync (<1h).
   - Critical inventory risk detection on stale inventory (>24h, >48h).
   - High store rejection and catalog friction scoring.
   - Severe delivery delay during rain and courier shortages.
   - Low-risk healthy order classification (Reliability >= 80%).
   - Multi-factor high/critical risk classification.
   - 3rd-order customer retention stake (72% probability) annotation.
   - Graceful handling of invalid/null order payloads without crashing.
3. **Rescue Engine (`src/tests/rescueEngine.test.ts` - 4 tests):**
   - `SWITCH_STORE` state mutation, store rerouting, and reliability score improvement.
   - `SUBSTITUTE_PRODUCT` replacing unconfirmed SKUs and eliminating stockout penalties.
   - `ADJUST_DELIVERY` priority courier dispatch and ETA reduction.
   - `PROACTIVE_NOTIFY` reducing customer cancellation probability.
4. **AI & Fallback Engine (`src/tests/fallbackEngine.test.ts` - 3 tests):**
   - JSON schema validation of structured operational diagnosis.
   - Rejection of malformed or incomplete responses.
   - Deterministic offline diagnosis generation for inventory, delivery, and store friction.
5. **Business Impact Model (`src/tests/businessImpact.test.ts` - 2 tests):**
   - Live session rescued order metrics, GMV protection, and retention count.
   - Macro platform scenario mathematical modeling against NOVA CART benchmarks.

---

## Accessibility

- **Semantic HTML5:** Built using `<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<table>`, and native `<button>` controls.
- **Accessible Colors:** Contrast ratios exceed WCAG AA standards; high-contrast deep slate background (`#090d16`) with crisp typography.
- **Not Color Alone:** Every risk state pairs color badges with explicit text labels (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `RESCUED`) and semantic icons.
- **Keyboard Navigation & Focus:** Full keyboard navigation support with prominent `:focus-visible` outlines (`outline: 2px solid #3b82f6`) and `Escape` key dismissal for all operational dialogs.
- **Screen Reader Support:** ARIA attributes (`role="region"`, `role="tablist"`, `role="dialog"`, `aria-modal="true"`, `aria-selected`, `aria-label`) for accessible stream navigation and dialogs.

---

## Setup

### Prerequisites
- Node.js (v18 or higher; tested on Node.js v25)
- npm (v9 or higher)

### Installation
```bash
# 1. Clone repository
git clone https://github.com/Sharanteja07/nova-rescue.git
cd nova-rescue

# 2. Install dependencies
npm install

# 3. (Optional) Configure Server-Side Gemini API Key
cp .env.example .env.local
# Add your key to GEMINI_API_KEY in .env.local (runs strictly on Node.js server)
```

### Running Locally
```bash
# Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) or [http://localhost:5173](http://localhost:5173) in your browser.

### Running Test Suite
```bash
npm test
```

### Production Build
```bash
npm run build
```

---

## Environment Variables

See [.env.example](file:///.env.example):

```bash
# Google Gemini API Key (Optional)
# If omitted, NOVA RESCUE operates seamlessly via deterministic fallback
GEMINI_API_KEY=your_gemini_api_key_here

# Selected Gemini Model
GEMINI_MODEL=gemini-2.5-flash

# Port Configuration (Google Cloud Run defaults to 8080)
PORT=8080
```

---

## Deployment

### Deploy to Render (Current Live Deployment)
The competition build is currently deployed at **https://nova-rescue.onrender.com**.

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Branch:** `main`
- **Server:** Native Node.js `server.js`
- **AI:** Server-side Gemini integration with deterministic fallback

### Deploy to Google Cloud Run (Optional)
NOVA RESCUE includes a minimal, multi-stage [Dockerfile](file:///Dockerfile) configured specifically for Cloud Run:
```bash
# 1. Build and deploy container directly to Cloud Run
gcloud run deploy nova-rescue \
  --source . \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_MODEL=gemini-2.5-flash

# 2. (Optional) Set secure Gemini API key as a Secret or Env Var:
gcloud run services update nova-rescue \
  --set-env-vars GEMINI_API_KEY=your_gemini_api_key_here
```
- **Port:** Listens dynamically on `process.env.PORT` (defaults to `8080`).
- **Entrypoint:** `npm start` (executes native `node server.js` serving `/api/status`, `/api/analyze-order`, and the Vite frontend).

### Standalone Production Server
```bash
# 1. Build client bundle
npm run build

# 2. Start server
npm start
# Server starts on http://127.0.0.1:8080
```

### Deploy to Vercel or Netlify
1. Connect this repository to Vercel or Netlify.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set optional server environment variable: `GEMINI_API_KEY` (server-side only). If omitted, deterministic fallback operates automatically.
5. Deploy.

---

*PROMPTWARS Business Rescue Challenge Submission — NOVA RESCUE Engine*
