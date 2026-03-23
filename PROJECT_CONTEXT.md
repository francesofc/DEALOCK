# Dealock — Project Context

**Last Updated:** March 2026

---

## What Dealock Is

Dealock is a premium commercial real estate operating system for agents and agencies. It goes beyond traditional CRM to provide structured execution for the entire deal lifecycle — from first contact to signed mandate to match and close.

**Core Value:** Transform a blurry real estate pipeline into a structured, actionable commercial cockpit.

**Target Users:**
- Strong individual agents
- Boutique and premium agencies
- Agencies handling demanding, international, off-market, or relationship-driven clients

---

## The 5 Core Layers

### 1. Seller Intelligence
Convert seller leads into signed mandates with priority scoring, readiness analysis, and strategic guidance.

### 2. Buyer Qualification
Track buyer readiness, seriousness levels, timelines, and search criteria.

### 3. Match Intelligence
Identify opportunities and score fit between buyers and properties/mandates.

### 4. Mandate Management
Manage exclusivity agreements through their lifecycle with activation strategies.

### 5. Finance Readiness
Track buyer financial qualification through document checklists and completion scoring.

---

## Strategic Positioning

### Not "Just Another CRM"
Dealock is purpose-built for real estate commercial execution. It is:
- **Action-oriented** — shows what to do next, not just what happened
- **Deal-centric** — tracks the full lifecycle, not just contacts
- **Intelligence-guided** — surfaces priorities and recommendations
- **Premium by design** — executive-grade experience

### Pilot-First Approach (Karim Chouikri Strategy)
1. Build a strong, genuinely useful daily product
2. Test with 2-3 pilot agencies
3. Observe real usage patterns
4. Let the product evolve with actual field usage
5. Structure multi-agent/multi-agency model later
6. Only later explore secure collaboration between professionals

---

## Strategic Feedback from Karim Chouikri

**Integrated into project direction:**

1. **Intellectual Property in Ireland**
   - Consider IP structure and entity setup
   - Factor into long-term legal/financial planning

2. **Strong Data and Site Security**
   - Security-first approach to all features
   - Data protection as core requirement
   - Row-level security in Supabase implementation

3. **Pilot with 2-3 Agencies**
   - Validate with real usage before scaling
   - Observe actual workflows
   - Iterate based on field feedback

4. **Product Plasticity**
   - Keep architecture evolutive
   - Don't freeze decisions too early
   - Build for iteration and adaptation
   - Modularity over premature optimization

---

## Current Product State

**Advanced and Production-Ready:**
- ✅ Supabase persistence foundation
- ✅ All 5 core layers fully operational
- ✅ Sellers, buyers, mandates, finance, matches, activities
- ✅ Mandate ↔ seller status synchronization
- ✅ Manual match override flow
- ✅ Automatic match generation
- ✅ Playwright E2E foundation (14 tests, 100% pass)
- ✅ Performance optimizations on data loading
- ✅ Multilingual support (EN, FR, PT, ES)
- ✅ Premium dark UI design system

**Status:** Pilot-ready. Core product complete. Ready for agency deployment.

---

## App Structure

```
/src/app/
├── page.tsx              # Command Center — daily priorities
├── sellers/              # Seller management with intelligence
├── buyers/               # Buyer qualification
├── match/                # Match opportunities
├── mandates/             # Mandate portfolio
├── finance/              # Finance readiness
├── activities/           # Activity timeline
└── settings/             # Configuration

/src/lib/
├── data/                 # Supabase data layer
├── i18n/                 # Internationalization
└── intelligence/         # AI/analysis layer

/tests/e2e/               # Playwright E2E tests
```

---

## Design System

**Visual Identity:**
- Base: `#0d0d0f` (near-black)
- Surfaces: subtle gradients, 0.02–0.06 opacity whites
- Accents: emerald (success), amber (warning), violet (match), red (urgent)
- Typography: Inter, clean weights

**Logo:**
- Symbol-only white SVG in sidebar
- 32px height, paired with "Dealock" wordmark

---

## Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS
- **Components:** Custom library
- **Backend:** Supabase (PostgreSQL + Auth)
- **Testing:** Playwright E2E
- **State:** React Context for language only
- **i18n:** Custom type-safe implementation

---

## Current Data Strategy

**Production Supabase:**
- All data persisted in PostgreSQL
- Row-level security enabled
- Real data for pilot agencies
- Typed data layer matching Supabase schema

**E2E Testing:**
- Deterministic test data with fixed UUIDs
- Upsert pattern for idempotency
- Parallel-friendly test setup

---

## Future Strategic Axes

### AI Onboarding Accelerator (Post-Pilot)
Ultra-efficient onboarding via AI inference from limited input (agency website, public data) to prefill context and accelerate time-to-value.

### Agentic Execution Layer (Post-Pilot)
WhatsApp/Telegram AI agents allowing users to interact with Dealock outside the platform (check priorities, create profiles, add activities via text/voice).

**Important:** These are strategic differentiators for future development, not immediate build priorities before core stabilization and pilot validation.

---

## What Makes Dealock Different

| Traditional CRM | Dealock |
|----------------|---------|
| Generic dashboards | Command Center with daily priorities |
| Static contact lists | Intelligence-powered deal tracking |
| Manual note-taking | Guided next actions |
| Reactive workflows | Proactive commercial guidance |
| One-size-fits-all | Premium execution cockpit |

---

*For product decisions, see PRODUCT_MEMORY.md*
*For roadmap, see ROADMAP.md*
