# Equinox — Round 2 Portal

Live team-contest platform for Enigma's Round 2: admin panel, team login,
JEE-style exam UI, pooled timer, scoring, and leaderboard.

Full product decisions and rationale live in the planning docs
(`Round2.md`, `format.md`) — this README only covers setup and the
technical shape of the code.

## Stack

- **Next.js** (App Router, TypeScript) — frontend + API routes in one app
- **PostgreSQL** via Prisma — hosted on [Neon](https://neon.tech) or
  [Supabase](https://supabase.com) (free tier)
- **Resend** — transactional email for team magic-link logins
- **Google Sheets API** (`googleapis`) — question pool import
- **Vercel** — deployment target
- **Polling** (not WebSockets) — live timer/leaderboard sync

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
   (this also runs `prisma generate` automatically via `postinstall`)

2. **Create a Postgres database**
   Sign up at Neon or Supabase, create a project, and copy its connection
   string.

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in `DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, and the Google
   service account values. See comments in `.env.example` for where each
   one comes from.

4. **Push the schema to your database**
   ```bash
   npm run db:push
   ```
   (use `db:migrate` instead once we want tracked migration history)

5. **Run the dev server**
   ```bash
   npm run dev
   ```
   App runs at http://localhost:3000

6. **Deploy**
   Push this repo to GitHub, import it into Vercel, and add the same env
   vars there. Vercel auto-detects Next.js — no extra config needed.

## Project structure (grows as we build)

```
prisma/schema.prisma   — all database models
src/app/                — pages + API routes (App Router)
src/lib/                — shared server logic (auth, email, scoring, etc.)
```

## Build status

This codebase is being built incrementally in chat, in the order tracked
below. Each step is a working, committable chunk.

- [x] 1. Project scaffold — Next.js + TypeScript + Tailwind, Prisma schema,
      env config
- [ ] 2. Auth/session helpers — magic-link generation + verification,
      admin session
- [ ] 3. API routes — team checklist, round settings, timer/round control
- [ ] 4. Admin panel UI (Tier 2 / Tier 3 views)
- [ ] 5. Team login + JEE-style exam UI
- [ ] 6. Scoring engine + leaderboard (polling)
- [ ] 7. Google Sheets question import
