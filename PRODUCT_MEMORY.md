# Dealock — Product Memory

**Purpose:** Capture important product decisions already made. Preserve strategic logic. Record what must not be forgotten.

---

## Major Product Evolution

### MandateOS → Dealock

**What happened:**
The product started as "MandateOS" — focused solely on seller mandate conversion. Over time, it became clear that agents need a unified platform covering the full deal lifecycle, not just the seller side.

**The expansion:**
- Added Buyer Qualification layer
- Added Match Intelligence layer
- Added Finance Readiness layer
- Kept Mandate Management as core
- Evolved name to "Dealock" — the deal lock system

**Why this matters:**
Don't think of Dealock as "seller CRM with extras." The 5 layers are intentionally equal. A user might enter via buyers, matches, or mandates — not just sellers.

---

## Core Product Decisions

### 1. The Detail Pages Are Strategic Cockpits

**Decision:** Invest heavily in Seller Detail and Buyer Detail pages.

**Rationale:**
- These are where agents spend most of their time
- Generic forms are insufficient — need guided intelligence
- Each detail page should feel like a premium command center

**Result:**
- Seller Detail has seller intelligence, next best moves, mandate status
- Buyer Detail mirrors that quality with qualification profile, finance status
- Both use the same elevated design language

**Don't forget:**
If redesigning detail pages, preserve this cockpit quality. Don't reduce them to basic forms.

---

### 2. Guided UX Over Dashboard Widgets

**Decision:** Replace generic analytics with guided action recommendations.

**Rationale:**
- Agents don't need more charts — they need to know what to do
- The Command Center shows "Urgent Now" not "Leads This Month"
- Every screen should answer: "What should I do next?"

**Don't forget:**
Avoid adding "nice to have" widgets that don't drive action. Every element should earn its place.

---

### 3. Premium Dark UI Is Intentional

**Decision:** Commit to a dark, executive aesthetic.

**Rationale:**
- Differentiates from generic light-themed CRMs
- Signals premium positioning
- Reduces eye strain for heavy users
- Feels more "intelligence tool" than "database"

**Don't forget:**
Don't introduce light themes without careful consideration. The dark UI is part of the brand.

---

### 4. Multilingual From Day One

**Decision:** Build full i18n architecture early, not as afterthought.

**Rationale:**
- Target markets are France, Portugal, Spain, and English-speaking
- Translations affect layout (some languages are longer)
- Easier to maintain strings from the start

**Result:**
- Full type-safe translation system
- Settings page allows live switching
- All 4 languages have complete coverage on core screens

**Don't forget:**
When adding new UI, always use `t.key` pattern. Don't hardcode English.

---

### 5. Sidebar Symbol Branding

**Decision:** Use symbol-only logo + wordmark, not full horizontal lockup.

**Rationale:**
- Horizontal logos don't work well in compact sidebars
- Symbol is recognizable, scalable, premium
- Wordmark "Dealock" reinforces brand

**Implementation:**
- `public/brand/dealock-symbol-white.svg` — the approved asset
- 32px height, clean spacing
- Don't replace with generic icons

---

### 6. Finance Is Readiness Layer, Not Full Engine

**Decision:** Track finance readiness, don't process mortgages.

**Rationale:**
- Agents need to know if buyers are ready — not originate loans
- Document checklist + completion % is enough for MVP
- Can expand later if needed

**Don't forget:**
Don't turn Finance into a mortgage calculator or loan origination tool. Keep it as qualification tracking.

---

### 7. Match Is Strategic Layer, Not Just Search

**Decision:** Treat Match as intelligence, not just property search.

**Rationale:**
- Good matches need scoring, not just filtering
- Fit percentage helps agents prioritize
- Recommended actions per match add value

**Don't forget:**
Don't reduce Match to a simple filter view. The scoring and recommendations are the value.

---

## Technical Decisions

### Supabase for Production Data

**Decision:** Use Supabase (PostgreSQL) for production persistence.

**Rationale:**
- Real data persistence required for pilot agencies
- Row-level security for multi-user scenarios
- PostgreSQL is reliable and well-understood
- Good TypeScript support

**Implementation:**
- All data functions in `src/lib/data/*.ts`
- Supabase client fully integrated
- Types match Supabase schema exactly
- E2E tests run against production build with real Supabase

---

### Custom Components Over Library

**Decision:** Build custom UI components, not use shadcn/ui.

**Rationale:**
- Full control over styling
- Consistent with premium aesthetic
- No dependency bloat
- Easier to tune for dark theme

**Don't forget:**
Don't introduce shadcn/ui or Material UI without reconsidering this decision. The custom component library is intentional.

---

### E2E Testing Foundation

**Decision:** Maintain Playwright E2E test suite as quality gate.

**Rationale:**
- Ensures critical user flows work
- Catches regressions in data loading
- Validates performance improvements
- Required for confident deployment

**Current State:**
- 14 E2E tests covering all core flows
- 100% pass rate after performance stabilization
- Tests run against production build
- Deterministic test data with fixed UUIDs

---

## Future Strategic Axes (Not Immediate Build Priorities)

### AI Onboarding Accelerator

**Concept:** Ultra-efficient onboarding via AI inference from limited input.

**How it works:**
- From agency name/website, infer and prefill useful context
- Intelligent workspace initialization
- Possible import/migration of existing CRM data

**Strategic Value:**
- Major time-to-value accelerator
- Key product differentiator
- Reduces friction for new agency adoption

**Timeline:** Post-core stabilization. Not before pilot validation.

---

### Agentic Execution Layer

**Concept:** AI agents accessible outside the platform via WhatsApp/Telegram.

**How it works:**
- Users interact with Dealock AI via messaging apps
- Actions: check priorities, create profiles, add activities, surface matches
- Supports text now, voice/audio later

**Strategic Value:**
- Execution interface sitting on top of Dealock cockpit
- Major product differentiator
- Fits natural agent workflow

**Timeline:** Post-core stabilization. Not before product-market fit.

---

## What to Preserve

| Element | Why It Matters |
|---------|---------------|
| Detail page quality | Core user workflow, strategic cockpits |
| Guided action UX | Differentiator from generic CRM |
| Dark premium UI | Brand identity |
| Multilingual architecture | Market requirements |
| Symbol branding | Visual identity |
| 5-layer product model | Strategic scope definition |
| Component library | Consistency and control |
| E2E test coverage | Quality assurance |
| Product plasticity | Ability to iterate based on real usage |

---

## What to Avoid

| Anti-Pattern | Why |
|--------------|-----|
| Generic dashboard widgets | Clutter without action |
| Light theme introduction | Breaks brand |
| Feature bloat | Dilutes focus |
| Hardcoded English strings | Breaks i18n |
| Complex state management | Unnecessary for this scope |
| Horizontal logo in sidebar | Doesn't fit compact space |
| Premature scale architecture | Pilot-first approach |
| Frozen architecture | Product plasticity principle |

---

*For current state, see PROJECT_CONTEXT.md*
*For what's next, see ROADMAP.md*
