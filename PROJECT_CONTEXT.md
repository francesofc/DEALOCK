# Dealock — Project Context

**Last Updated:** March 2026

---

## What Dealock Is Today

Dealock is a premium commercial real estate operating system for elite agents. It goes beyond traditional CRM to provide intelligence, guidance, and strategic tooling for the entire deal lifecycle — from first contact to signed mandate to match and close.

The product is built around **5 core layers** that work together:

---

## The 5 Core Layers

### 1. Seller Intelligence
The original foundation. Helps agents convert seller leads into signed mandates.

- Lead tracking with priority scoring
- AI-powered seller analysis (mindset, relationship, momentum)
- Mandate readiness scoring
- Next best action recommendations
- Strategic guidance for each interaction

### 2. Buyer Qualification
Expanded scope. Tracks buyer readiness and purchase intent.

- Buyer profile management
- Seriousness levels (browsing → committed)
- Timeline tracking (just browsing → immediate)
- Search criteria documentation
- Pre-approval status

### 3. Match Intelligence
Strategic opportunity layer. Identifies and tracks potential deals.

- Match scoring between buyers and properties
- Fit percentage calculations
- Recommended actions per match
- Priority classification (urgent, high, normal)

### 4. Mandate Management
Exclusivity tracking and post-mandate activation.

- Mandate status workflow (draft → sent → signed)
- Exclusive vs non-exclusive tracking
- Expiration monitoring
- Activation strategy generation UX

### 5. Finance Readiness
Buyer qualification layer. Tracks financial readiness.

- Document checklist management
- Completion percentage tracking
- Annual income / down payment records
- Missing document identification

---

## App Structure

```
/src/app/
├── page.tsx              # Command Center — daily focus cockpit
├── sellers/
│   ├── page.tsx          # Seller list with priority grouping
│   └── [id]/page.tsx     # Seller Detail — strategic cockpit
├── buyers/
│   ├── page.tsx          # Buyer list with qualification view
│   └── [id]/page.tsx     # Buyer Detail — mirrors seller quality
├── match/page.tsx        # Match opportunities and fit scoring
├── mandates/page.tsx     # Mandate portfolio management
├── finance/page.tsx      # Finance readiness overview
├── activities/page.tsx   # Activity timeline and history
├── pipeline/page.tsx     # Pipeline kanban view
└── settings/page.tsx     # Configuration including languages

/src/components/
├── layout/
│   ├── Sidebar.tsx       # Navigation with Dealock symbol branding
│   └── Header.tsx        # Search and notifications
├── ui/                   # Reusable UI components
├── sellers/
│   └── SellerEditPanel.tsx
└── buyers/
    └── BuyerEditPanel.tsx

/src/lib/
├── i18n/                 # Full i18n architecture
│   ├── LanguageContext.tsx
│   ├── useTranslation.ts
│   └── translations/     # EN, FR, PT, ES dictionaries
├── data/                 # Data service layer
├── intelligence/         # Seller intelligence (mock → live)
└── supabase/             # Backend scaffold
```

---

## Design System

**Visual Identity:**
- Base: `#0d0d0f` (near-black)
- Surfaces: subtle gradients, 0.02–0.06 opacity whites
- Accents: emerald (success), amber (warning), violet (match), red (urgent)
- Typography: Inter, clean weights

**Key Patterns:**
- `surface-elevated` — cards with gradient + border
- `surface-subtle` — flat muted backgrounds
- Rounded corners: `rounded-xl` (cards), `rounded-lg` (buttons)
- Spacing: generous, executive feel

**Logo:**
- Symbol-only white SVG in sidebar (`public/brand/dealock-symbol-white.svg`)
- 32px height, paired with "Dealock" wordmark

---

## Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS
- **Components:** Custom (not shadcn/ui)
- **Icons:** Lucide React
- **Backend:** Supabase scaffold (PostgreSQL + Auth)
- **State:** React Context for language
- **i18n:** Custom implementation with full type safety

---

## Current Data Strategy

Currently using **typed mock data** with a clear path to live backend:

- All data functions in `src/lib/data/*.ts`
- Mock data is typed to match Supabase schema
- Easy swap: uncomment Supabase client code when ready
- No backend dependency for development

---

## Multilingual Architecture

**Active Languages:**
- English (en) ✅
- French (fr) ✅
- Portuguese (pt) ✅
- Spanish (es) ✅

**How It Works:**
- `LanguageContext` provides global language state
- `useTranslation()` hook returns current dictionary
- Dictionaries are fully typed in `src/types/i18n.ts`
- Settings page allows live language switching
- All major UI strings are translated

---

## What Makes Dealock Different

| Traditional CRM | Dealock |
|----------------|---------|
| Generic dashboards | Command Center with daily focus |
| Static lead lists | Intelligence-powered prioritization |
| Manual note-taking | Guided next actions |
| Reactive workflows | Proactive strategic guidance |
| One-size-fits-all | Premium executive experience |

---

*For strategic decisions, see PRODUCT_MEMORY.md*
*For what's next, see ROADMAP.md*
