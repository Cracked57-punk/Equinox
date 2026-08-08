# Equinox — Agent Onboarding & Context Brief

Read this first, alongside `Round2.md` and `format.md` in this same folder.
This file exists so any agent session (Antigravity or otherwise) starts
with full context instead of the human re-explaining from scratch.

---

## 0. How to work with this project (read before doing anything)

- **This is a planning-first project.** Architectural and product decisions
  are made *before* code is written. If you (the agent) are about to make a
  non-trivial design choice that isn't already locked below, **stop and ask,
  don't assume.**
- **Push back, don't just execute.** If a request conflicts with a decision
  already locked in this doc, or seems like a bad idea, say so before
  implementing it.
- **This is a live-event system with a hard deadline.** There is no
  "redeploy later" — it has to work correctly on the day. Prefer boring,
  well-tested patterns over clever ones. Flag anything that introduces
  fragility (race conditions, unhandled edge cases in live scoring/timer
  logic, etc.) explicitly.
- **Don't touch schema, auth, or scoring logic in Autopilot/parallel mode.**
  These are interdependent — sequence changes, don't run them concurrently
  across multiple agent sessions.
- **Update `Round2.md` / `format.md`** (or ask the human to) whenever a new
  decision is locked, so this stays a living source of truth.

---

## 1. What Equinox is

A live, multi-round team contest platform for a club called **Enigma**.
35 two-member teams, 5 rounds, progressive elimination. **Current build
scope is Round 2 only.** Full 5-round context is in `format.md`; all
Round 2 detail is in `Round2.md`. This brief just summarizes the locked
decisions so far.

**Scope boundary:** We build platform/infrastructure only (admin panel,
login, exam UI, timer, scoring, leaderboard, data handoff). We do **not**
design or curate question content — that's a separate question-setting
team's job.

---

## 2. Locked architecture decisions

- **Stack:** Next.js (frontend + API routes), PostgreSQL via Neon or
  Supabase, deployed on Vercel (free tier).
- **Live sync:** Polling for timer/leaderboard updates — **not**
  WebSockets.
- **Team login:** Magic-link email to each team's registered Enigma email.
  One click, no typed credentials. Tier 3 admins have a fallback panel
  (copy-link, resend-email, short human-readable backup code) for teams
  without email access.
  - ❌ Rejected: physical credential slips (logistics), password = team
    name (spoofable, names are public).
- **Round 1 → Round 2 handoff:** Pre-loaded checklist of all 35 team names
  entered before Round 1 starts; admin checks off the 25 qualifiers after.
  No typing/parsing needed.
  - ❌ Rejected: CSV parsing, scraping quiz.com.
- **Access tiers:**
  - Tier 1 — Question contributors: Google Sheet edit access only, no
    platform login.
  - Tier 2 — Content admins: platform login limited to question-pool
    import/preview.
  - Tier 3 — Event admins: full control (team checklist, timer, round
    start/stop, leaderboard).
- **Question pool:** Structured Google Sheet (question, 4 options, correct
  answer, solution/explanation, image links). Images in a shared Google
  Drive folder ("Anyone with link can view"). Multi-image questions use
  comma-separated links in one cell. Import flow: Tier 2 admin imports via
  Google Sheets API, previews parsed result, confirms before it lands in
  Postgres.
- **Exam UI:** JEE Mains/Advanced style — pooled (not per-question) timer,
  free navigation, skip/clear response, question palette, force-submit on
  timeout. Scoring: +20 correct, 0 wrong, no negative marking (Round 2
  specifically has no negative marking, unlike later rounds).
- **Question assignment:** Randomized **server-side** per team (never
  client-side — prevents pool exposure). Session state persisted
  server-side.
- **Leaderboard:** Round 2 scores only, live. Cumulative (R1+R2) scoring
  is a deferred future option, not in current scope.

## 3. Rejected approaches (don't re-suggest these)

- Physical credential slips for team login
- Password = team name
- CSV bulk-paste for Round 1→2 handoff
- Scraping quiz.com
- Client-side question randomization
- Raw CSV or free-form doc for question pool delivery (no image support /
  high parse-failure risk)

## 4. Open items still pending (ask the human, don't guess)

| Area | Question |
|---|---|
| Format | Exact questions-per-team count (placeholder: 10) |
| Timing | Default time-per-question value |
| Timing | Round start gate: all-logged-in vs manual trigger |
| Question pool | Image naming convention (exact string) |
| Access tiers | Tier 2 / Tier 3 exact headcount |
| Access tiers | Login mechanism for admins — leaning individual named accounts, not shared |

## 5. Out of scope for now (context only)

Rounds 3–5 exist and are documented in `format.md` for continuity, but are
**not** being built currently:
- Round 3: Buzzer round (25 → 15 teams)
- Round 4: "Full Game" round (15 → 10 teams)
- Round 5: Story-mode finale (top 10, determines winner)

Don't build toward these unless explicitly instructed.

## 6. Tooling note

Planning and architectural decisions for this project happen in a separate
Claude conversation (chat-based, not this IDE). This IDE/agent is used for
**execution** once a decision is already locked in `Round2.md` /
`format.md`. If you're an agent reading this and a request seems to
involve a decision that isn't captured above, that's a sign to pause and
ask the human to confirm it's actually been decided — not to invent one.
