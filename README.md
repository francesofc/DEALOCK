# MandateOS

An AI-powered seller mandate operating system for real estate agents.

## Overview

MandateOS helps real estate agents manage seller leads, track mandates, and streamline the path to exclusivity agreements. The system provides intelligent workflows, AI-generated scripts, and comprehensive pipeline management.

## Current Phase

**Phase 1: Frontend Foundation** ✅

This phase establishes the premium dashboard shell and UI components. Backend, authentication, and database integration are planned for subsequent phases.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom components
- **Icons:** Lucide React
- **Deployment:** Vercel-ready

## Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. Clone the repository and navigate to the project:
```bash
cd mandate-os
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your values (not required for Phase 1)
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
mandate-os/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── leads/          # Leads management
│   │   │   └── [id]/       # Lead detail page
│   │   ├── pipeline/       # Pipeline kanban view
│   │   ├── activities/     # Activity tracking
│   │   ├── mandates/       # Mandate management
│   │   ├── settings/       # Settings page
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Dashboard
│   ├── components/
│   │   ├── layout/         # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── ui/             # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── Input.tsx
│   │       ├── Table.tsx
│   │       ├── SectionHeader.tsx
│   │       ├── KPICard.tsx
│   │       ├── ActivityItem.tsx
│   │       ├── PipelineStage.tsx
│   │       └── EmptyState.tsx
│   └── lib/
│       └── utils.ts        # Utility functions
├── public/                 # Static assets
├── .env.example           # Environment variables template
├── next.config.mjs        # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies
```

## Features (Phase 1)

### Pages
- **Dashboard:** KPI cards, priority actions, recent activity, pipeline snapshot
- **Leads:** Search, filters, leads table with row click navigation
- **Lead Detail:** Lead summary, seller intelligence, AI scripts, activity timeline
- **Pipeline:** Kanban-style layout with 9 stages
- **Activities:** Activity list with filters
- **Mandates:** Mandates table with status badges
- **Settings:** Profile, team, AI settings, business defaults, diagnostics

### UI Components
- Button (variants: default, outline, ghost, secondary)
- Card, CardHeader, CardTitle, CardContent
- Badge (variants: default, secondary, outline, success, warning, destructive)
- Input
- Table with row click support
- SectionHeader
- KPICard
- ActivityItem
- PipelineStage
- EmptyState

## Design Principles

- **Premium:** Executive-level quality and attention to detail
- **Minimal:** Clean interfaces without unnecessary elements
- **Readable:** Strong typography and spacing
- **Dark Mode:** Modern dark theme as default

## Internationalization

The application is designed to support:
- English
- French
- Portuguese

(Localization implementation coming in future phases)

## Roadmap

### Phase 1 ✅ (Current)
- Frontend foundation
- Dashboard shell
- Placeholder pages
- UI component library

### Phase 2 (Planned)
- Supabase integration
- Authentication
- Database schema
- Real data connections

### Phase 3 (Planned)
- AI integration
- Script generation
- Smart follow-ups
- Seller intelligence

### Phase 4 (Planned)
- WhatsApp integration
- Email automation
- Advanced reporting
- Team collaboration

## Development Rules

1. Inspect existing code before changing structure
2. Prefer simple and maintainable solutions
3. Avoid overengineering
4. Keep the app modular
5. Keep naming clear
6. Build production-ready foundations

## Git Workflow

- Work on feature branches
- No automatic commits or pushes
- All commits require explicit confirmation
- No destructive git commands without explicit request

## License

Private - All rights reserved.

---

**Note:** This is a work in progress. Backend, authentication, and database features are coming in subsequent phases.
