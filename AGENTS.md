# Dealock — Agent Instructions

This file defines the working rules for all AI agents collaborating on the Dealock project.

---

## 1. PHASE EXECUTION RULES

- Execute only one phase at a time
- After each phase, stop immediately
- Never continue automatically
- Wait for explicit instruction before starting the next phase

---

## 2. GIT / GITHUB RULES

- Never commit automatically
- Never push automatically
- Never work directly on main or master unless explicitly instructed
- Always assume work happens on a feature branch
- Before any git write action, show:
  - current branch
  - git status
  - changed files
  - short summary of changes
- If asked to commit, suggest a commit message first
- Only commit after explicit confirmation
- Only push after explicit confirmation
- Never rewrite git history unless explicitly requested
- Never use destructive git commands unless explicitly requested

---

## 3. FORBIDDEN GIT COMMANDS UNLESS EXPLICITLY REQUESTED

The following git commands must NEVER be used unless explicitly requested by the user:

- `git reset --hard`
- `git clean -fd`
- `git checkout -- .`
- Force push (`--force` or `-f`)
- Branch deletion (`git branch -D`)
- Rebase operations
- Amend commits
- Stash drop
- Remote modification

---

## 4. PRODUCT RULES

### What Dealock Is

- **Name:** Dealock
- **Type:** AI-powered commercial real estate operating system for elite agents
- **Core Layers (5):**
  1. Seller Intelligence — mandate conversion, strategic guidance
  2. Buyer Qualification — readiness tracking, criteria matching
  3. Match Intelligence — opportunity identification, fit scoring
  4. Mandate Management — exclusivity tracking, activation
  5. Finance Readiness — buyer qualification, document tracking

### What Dealock Is NOT

- It is NOT a scraping bot
- It is NOT an unsolicited bulk WhatsApp sender
- It is NOT a generic CRM
- It is NOT a property listing site

### Language & Localization Requirements

- Must support: English (EN), French (FR), Portuguese (PT), Spanish (ES)
- Russian (RU) planned for future
- The commercial logic must stay consistent across all languages

### Ethics & Compliance

- No fake buyer claims
- No invented offers
- No deceptive claims
- No manipulation of sellers or buyers

---

## 5. DESIGN RULES

- **Premium aesthetic** — executive-level quality
- **Dark theme** — #0d0d0f base, elegant contrasts
- **Minimal interface** — high signal, low noise
- **Clean spacing** — breathing room is intentional
- **Strong readability** — clarity first
- **No clutter** — every element earns its place
- **No gimmicks** — no trends that age poorly
- **Guided UX** — user should know what to do next

---

## 6. DEVELOPMENT RULES

- Always inspect existing code before changing structure
- Prefer simple and maintainable solutions
- Avoid overengineering
- Keep the app modular
- Keep naming clear and consistent
- Build production-ready foundations
- Don't break existing patterns without good reason
- Preserve the premium feel in every change

### List Rendering Stability Rules

- **Never use slice()** to truncate list sections that should show all records
- **Always use functional state updates** when adding records (setItems(prev => [...]))
- **Never use conditional guards** that silently skip creating records
- **Always include secondary sorting** by created_at to ensure new records appear predictably
- **Ensure safe defaults** so new records fall into a visible group (not hidden/filtered out)

---

## 7. OUTPUT RULES

After any requested phase, the agent must:

1. Explain what was built
2. List changed files
3. Explain how to test
4. Provide a quick QA checklist
5. Then stop and wait for further instructions

---

## 8. PROJECT CONTEXT

When working on Dealock, remember:

- **Product evolved:** Started as MandateOS, expanded to full Dealock platform
- **Detail pages are strategic:** Seller Detail and Buyer Detail are core cockpits
- **Multilingual is active:** UI translations exist for EN/FR/PT/ES
- **Sidebar branding:** Uses approved Dealock symbol asset
- **Architecture:** Next.js + TypeScript + Tailwind + Supabase scaffold

For full context, see:
- `PROJECT_CONTEXT.md` — what Dealock is today
- `PRODUCT_MEMORY.md` — decisions already made
- `ROADMAP.md` — what's done and what's next

---

*This document is the single source of truth for AI agent behavior on the Dealock project.*
