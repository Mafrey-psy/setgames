# Responsive QA

Quick smoke test across mobile / tablet / desktop on key routes. Catches horizontal overflow and console errors per breakpoint, and saves screenshots to `responsive-report/`.

## Setup (one-time)

```bash
bun add -d playwright
bunx playwright install chromium
```

## Run

Against local dev:

```bash
BASE_URL=http://localhost:3000 node scripts/responsive-check.mjs
```

Against the deployed preview/prod:

```bash
BASE_URL=https://setgames.lovable.app node scripts/responsive-check.mjs
```

## What it checks

- **Breakpoints**: 390×844 (mobile), 820×1180 (tablet), 1440×900 (desktop)
- **Routes**: `/`, `/epic`, `/steam`, `/gog`, `/prime`, `/itch`, `/xbox`, `/discord`, `/guias`, `/cultura`, `/sobre`
- **Per route**: no horizontal scroll (>2px overflow fails), no console/page errors, screenshot saved
- Exits non-zero if any check fails — wire into your deploy workflow.
