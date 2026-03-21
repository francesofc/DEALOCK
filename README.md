# Dealock

**Commercial Real Estate Intelligence** — AI-powered seller mandate operating system for real estate agents.

## Overview

Dealock is a premium commercial real estate platform that helps agents manage seller leads, track mandates, and streamline the path to exclusivity agreements. The system provides intelligent workflows, AI-powered seller insights, and comprehensive pipeline management.

## Current Phase

**Product Experience Refocus** ✅

This phase transforms Dealock from a generic dashboard into a premium, guided, seller intelligence platform focused on mandate conversion.

### Product Experience Highlights

- **Command Center**: Executive action cockpit replacing generic analytics
- **Seller Intelligence**: AI-powered analysis including mindset, relationship state, deal momentum
- **Commercial Cockpit**: Lead detail page with strategic guidance and next best actions
- **Guided UX**: Clear action guidance, prioritization, and premium executive design
- **Multilingual Scaffold**: Full i18n architecture for EN, FR, PT, ES (RU planned)
- **Mandate Activation**: Post-mandate strategy generation UX

### Previous Phases

**Phase 2: Backend Foundation** ✅
- Supabase integration scaffold
- Database schema (leads, activities, mandates, ai_outputs)
- Typed data service layer
- Auth scaffold

**Phase 1: Frontend Foundation** ✅
- Premium dashboard shell
- UI component library
- Dark executive theme

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom components
- **Icons:** Lucide React
- **Backend:** Supabase (PostgreSQL + Auth)
- **Deployment:** Vercel-ready

## Project Structure

```
dealock/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── leads/             # Leads management with intelligence
│   │   ├── pipeline/          # Pipeline kanban with bottlenecks
│   │   ├── activities/        # Activity tracking
│   │   ├── mandates/          # Mandate management with activation
│   │   ├── settings/          # Settings with languages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Command Center (dashboard)
│   ├── components/
│   │   ├── layout/            # Layout components
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── supabase/          # Supabase client setup
│   │   ├── data/              # Data service layer
│   │   ├── auth/              # Auth configuration
│   │   ├── i18n/              # Internationalization
│   │   │   └── translations/  # EN, FR, PT, ES dictionaries
│   │   ├── intelligence/      # Seller intelligence (transitional)
│   │   └── utils.ts           # Utility functions
│   └── types/
│       ├── database.ts        # Database types
│       ├── seller-intelligence.ts  # Intelligence types
│       └── i18n.ts            # i18n types
├── supabase/
│   ├── schema.sql             # Database schema
│   └── seed.sql               # Demo/seed data
└── ...config files
```

## Key Features

### Command Center (/)
Your mandate conversion command center:
- **Today's Focus**: Priority actions needing immediate attention
- **Key Metrics**: Active mandates, pipeline value, conversion rate
- **Priority Sellers**: High-value leads ranked by mandate readiness
- **AI Signals**: Strategic insights and recommendations

### Leads Management (/leads)
Curated commercial leads list:
- Scannable table with mandate readiness bars
- Visual priority indicators
- Quick "Analyze" actions
- Contact methods at a glance

### Commercial Cockpit (/leads/[id])
The main commercial interface for each lead:
- **Hero Summary**: Lead status, mandate readiness bar, property details
- **Seller Intelligence Panel** (4-quadrant analysis):
  - Seller Mindset (frustrated, rational, emotional, urgent, etc.)
  - Relationship State (cold, engaged, developing trust, etc.)
  - Deal Momentum (weak, stable, improving, near mandate, etc.)
  - Recommended Angle (data-driven, emotional, exclusivity value, etc.)
- **Next Best Move** card with suggested timing and tone
- **What to Avoid** card
- **Suggested Opening** message
- **Signals**: Positive (green) and Risk (red)
- **Property Details** grid
- **Mandate Status** with activation strategy action

### Pipeline (/pipeline)
Strategic deal flow with bottleneck detection:
- **Bottleneck Summary**: Stuck deals, awaiting reply, proposals, hot leads
- **Kanban Board**: Larger cards with value, days in stage, actions
- **Value Tracking**: Totals per stage
- **Horizontal scrolling** with snap points

### Mandates (/mandates)
Active asset management with portfolio view:
- **Portfolio Hero**: Total value, active count, exclusive count, expiring
- **Segmentation Tabs**: Active, Pending Signature, At Risk
- **Activation Strategy** CTA for signed mandates
- Asset table with key metrics

### Settings (/settings)
- Profile management
- **Languages**: Interface language + communication language preferences
- AI settings
- Business defaults
- Notifications

## Seller Intelligence (Transitional)

The app includes a transitional seller intelligence layer that simulates AI analysis:

```typescript
// Intelligence outputs include:
- seller_mindset: 'frustrated' | 'rational' | 'emotional' | 'urgent' | ...
- relationship_state: 'cold' | 'engaged' | 'developing_trust' | ...
- deal_momentum: 'weak' | 'stable' | 'improving' | 'near_mandate' | ...
- recommended_angle: 'data_driven' | 'emotional' | 'exclusivity_value' | ...
- tone_to_use: 'professional_confident' | 'warm_personal' | ...
- next_best_move: 'schedule_call' | 'send_mandate_proposal' | ...
- suggested_timing: 'immediate' | 'today' | 'tomorrow' | ...
- mandate_readiness_score: 0-100
- exclusivity_potential: 'low' | 'medium' | 'high' | 'very_high'
```

This layer is powered by `src/lib/intelligence/mock-intelligence.ts` and generates realistic analysis based on lead characteristics. It will be replaced with live AI integration in a future phase.

## Multilingual Support

Full i18n architecture in place:

```typescript
// Supported languages
- English (en) ✅
- French (fr) ✅
- Portuguese (pt) ✅
- Spanish (es) ✅
- Russian (ru) 📝 Planned
```

Translation dictionaries are in `src/lib/i18n/translations/`.

## Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for production)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Database Setup (Optional for Phase 2)

The app works with mock data out of the box. To connect to Supabase:

1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL Editor
3. Add credentials to `.env.local`
4. Uncomment Supabase client code in `src/lib/data/*.ts`

## Design Principles

- **Premium**: Executive-level quality with dark theme (#0a0a0a, #111, #171717)
- **Action-First**: Focus on what to do next
- **Intelligent**: AI-powered seller insights
- **Guided**: Clear next actions, not just data
- **Minimal**: Clean, uncluttered interface with breathing room
- **Multilingual**: Ready for international markets

## Roadmap

### Completed ✅
- Phase 1: Frontend foundation
- Phase 2: Backend foundation
- Product Experience Refocus
- UX Refactor: All pages updated for Dealock premium positioning

### Planned
- **Phase 3**: Full authentication, protected routes, live Supabase data
- **Phase 4**: Live AI integration for seller intelligence
- **Phase 5**: WhatsApp/email automation, advanced reporting

## License

Private - All rights reserved.

---

*Dealock — Commercial Real Estate Intelligence*
