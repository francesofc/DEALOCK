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

### Mock Data → Live Backend

**Decision:** Start with typed mock data, build clear path to Supabase.

**Rationale:**
- Frontend can be built without backend dependency
- Types enforce contract between frontend and eventual backend
- Easy to test different data scenarios

**Implementation:**
- All data functions in `src/lib/data/*.ts`
- Supabase client code is commented out but ready
- Types match Supabase schema exactly

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

### Context for Language, Not Global State

**Decision:** Use React Context for language, not Redux/Zustand.

**Rationale:**
- Language is the only true global state needed
- Context is sufficient for this use case
- Avoids unnecessary dependency

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

---

*For current state, see PROJECT_CONTEXT.md*
*For what's next, see ROADMAP.md*
