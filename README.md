# Dealock

**Commercial Real Estate Operating System** — Premium SaaS for real estate agents and agencies managing mandates, sellers, buyers, and deals.

## What Dealock Is

Dealock is a serious proptech SaaS focused on commercial execution. It transforms a blurry real estate pipeline into a structured, actionable commercial cockpit.

**Core Purpose:**
- Help agents and agencies operate and manage sellers, mandates, buyers, finance, match opportunities, activities, and next actions
- Turn scattered deal information into clear commercial priorities
- Provide a premium, executive-grade daily operating environment

**Target Users:**
- Strong individual agents
- Boutique and premium agencies
- Agencies dealing with demanding, international, off-market, or relationship-driven clients

## What Dealock Is NOT

- Not a simple contact CRM
- Not a property listing site
- Not a scraping bot
- Not an unsolicited bulk messaging tool

## The 5 Core Layers

### 1. Seller Intelligence
Lead tracking, mandate readiness scoring, and strategic guidance for seller conversion.

### 2. Buyer Qualification
Buyer profiles, seriousness tracking, search criteria, and pre-approval status.

### 3. Match Intelligence
Opportunity identification, fit scoring, and recommended actions between buyers and properties.

### 4. Mandate Management
Exclusivity tracking, mandate lifecycle (draft → sent → signed), and activation strategies.

### 5. Finance Readiness
Document checklist tracking, completion percentages, and buyer financial qualification status.

## Current Product State

**Advanced and Functional:**
- ✅ Supabase persistence foundation (PostgreSQL + Auth)
- ✅ All 5 core layers operational
- ✅ Sellers, buyers, mandates, finance profiles, match opportunities
- ✅ Activities and next actions tracking
- ✅ Mandate ↔ seller status synchronization
- ✅ Manual match override flow
- ✅ Automatic match generation (Phase 1)
- ✅ Playwright E2E foundation with 100% test pass rate
- ✅ Performance optimizations on key loading pages
- ✅ Multilingual support (EN, FR, PT, ES)
- ✅ Premium dark UI design system

**Status:** Pilot-ready. Not yet deployed at scale with production agencies.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS
- **Components:** Custom library
- **Backend:** Supabase (PostgreSQL + Auth)
- **Testing:** Playwright E2E
- **Deployment:** Vercel-ready

## Project Structure

```
dealock/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Command Center
│   │   ├── sellers/           # Seller management
│   │   ├── buyers/            # Buyer management
│   │   ├── match/             # Match opportunities
│   │   ├── mandates/          # Mandate portfolio
│   │   ├── finance/           # Finance readiness
│   │   ├── activities/        # Activity timeline
│   │   └── settings/          # Configuration
│   ├── components/
│   │   ├── layout/            # Sidebar, Header
│   │   └── ui/                # Reusable components
│   ├── lib/
│   │   ├── data/              # Data service layer
│   │   ├── i18n/              # Internationalization
│   │   ├── intelligence/      # AI/analysis layer
│   │   └── supabase/          # Backend client
│   └── types/                 # TypeScript types
├── tests/
│   └── e2e/                   # Playwright E2E tests
├── supabase/
│   └── schema.sql             # Database schema
└── scripts/
    └── start-e2e-server.sh    # E2E test server
```

## Development

### Prerequisites
- Node.js 18+
- Supabase account (for production data)

### Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

### E2E Testing
```bash
# Start test server
./scripts/start-e2e-server.sh

# Run E2E tests
npx playwright test
```

## Strategic Direction

**Near-Term (Pilot Phase):**
1. Deploy with 2-3 pilot agencies
2. Observe real usage patterns
3. Iterate based on field feedback
4. Maintain product plasticity

**Future Strategic Axes (Post-Core Stabilization):**

**AI Onboarding Accelerator:**
Ultra-efficient onboarding via AI inference from limited input (agency website, public data) to prefill context and accelerate time-to-value.

**Agentic Execution Layer:**
WhatsApp/Telegram AI agents allowing users to interact with Dealock outside the platform (check priorities, create profiles, add activities, surface matches via voice/text).

## License

Private — All rights reserved.

---

*Dealock — Commercial Real Estate Operating System*
