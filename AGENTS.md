# MandateOS - Project Instructions

This file defines the working rules for all AI agents collaborating on the MandateOS project.

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

### What This Project Is

- **Name:** MandateOS
- **Type:** AI-powered seller mandate operating system for real estate agents
- **MVP Scope:**
  - Seller leads management
  - Mandates tracking
  - Exclusivity logic
  - Follow-up workflows
  - Activity management

### What This Project Is NOT

- It is NOT a scraping bot
- It is NOT an unsolicited bulk WhatsApp sender

### Language & Localization Requirements

- Must support: French, Portuguese, and English
- The commercial logic must stay consistent across all 3 languages

### Ethics & Compliance

- No fake buyer claims
- No invented offers
- No deceptive claims

---

## 5. DESIGN RULES

- Premium aesthetic
- Executive styling
- Minimal interface
- Clean spacing
- Strong readability
- No clutter
- No gimmicks

---

## 6. DEVELOPMENT RULES

- Always inspect existing code before changing structure
- Prefer simple and maintainable solutions
- Avoid overengineering
- Keep the app modular
- Keep naming clear
- Build production-ready foundations

---

## 7. OUTPUT RULES

After any requested phase, the agent must:

1. Explain what was built
2. List changed files
3. Explain how to test
4. Provide a quick QA checklist
5. Then stop and wait for further instructions

---

*This document is the single source of truth for AI agent behavior on the MandateOS project.*
