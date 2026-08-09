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
- **Do not silently revert or "correct" a locked decision below** — even if
  older code, comments, or an earlier version of this doc suggests
  otherwise. This has happened before on the admin login mechanism (see
  Section 2) and caused wasted work. If something in the codebase conflicts
  with what's written here, **this document wins** — flag the conflict to
  the human, don't resolve it by picking whichever side the old code
  already leans toward.
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
- **Never view, `cat`, or print the contents of `.env`, or echo/log any
  secret env var's value** (DB URL, Resend API key, JWT secret, admin
  passwords, etc.). Running commands that use these vars internally
  (e.g. `node prisma/seed.js`) is fine — printing or reading them
  directly is not. If you need to confirm a var is set, check truthiness
  only (e.g. log `true`/`false`, never the value). Local `.env` holds
  throwaway dev-only values; the real production secrets are set
  directly in Vercel's dashboard at deploy time and are not something
  you'll ever need to see. If a task seems to require the actual secret
  value, stop and ask the human to run that step themselves.
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
- **Team login (teams only — see below for admins, they are different):**
  Magic-link email to each team's registered Enigma email. One click, no
  typed credentials. Tier 3 admins have a Team Credentials fallback panel
  (copy-link, resend-email, short human-readable backup code) for teams
  without email access.
  - ❌ Rejected: physical credential slips (logistics), password = team
    name (spoofable, names are public).
- **Admin login (Tier 2 + Tier 3 — CONFIRMED, do not revert to
  magic-link):**
  - Individual named accounts per admin — **not** a shared tier-wide
    password, so live actions stay attributable to a specific person.
  - **Email + password login (bcrypt-hashed passwords).** This is
    deliberately different from team login. Admins are a small,
    repeat-use group who need fast, dependency-free access during a live
    event; a magic link would add an email-deliverability dependency
    (Resend latency, spam filters, venue wifi) at exactly the moment
    stakes are highest (premature start, wrong timer, etc.).
  - **Password recovery:** self-serve reset link emailed to the admin's
    registered email. Reuses the Resend infrastructure already built for
    team magic-links, but as a **distinct password-reset token flow**
    (separate token/table from the team login token — one logs you in
    directly, the other lets you set a new password).
  - **No backup codes for admins.** Backup codes are team-only. Password
    + self-serve email reset was judged sufficient for admins; a backup
    code would be a third fallback without meaningfully improving
    reliability. May be revisited later as a future addition — not
    currently in scope.
  - This decision was made after the codebase had already drifted toward
    magic-link for admins on its own (a stray `magicToken` field and a
    comment reading "corrected: passwordless, same as teams" were found
    in `AdminUser`, with no human sign-off). That drift is now
    superseded — password-based login is final.
- **Repository & folder structure:** Private GitHub repo
  (`github.com/Cracked57-punk/Equinox`), `src/app` is the only routing
  tree (routes only — no logic). Server Actions live in `src/actions/`,
  grouped by domain (team/admin auth kept as separate files). UI in
  `src/components/`, non-action logic in `src/lib/`, shared types in
  `src/types/`. Full detail and rationale in `Round2.md` §9 — check
  there before adding a new file if you're unsure where it belongs.
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
- **Admin Shell Pattern:** Incremental nav-per-phase architecture. The shell uses a single `nav-config.ts` source of truth. Nav items are rendered based on tier. Crucially, tier enforcement is handled server-side per route via `requireAdmin(minTier)`, ensuring proper distinction between "not logged in" (redirects to `/admin/login`) and "insufficient tier" (redirects to `/admin/access-denied`). Sections are added only when built; no pre-built placeholders.
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
- Magic-link login for admins (admins use email + password instead — see
  Section 2). Team magic-link is unaffected and correct — this rejection
  applies to admins only.
- Shared tier-wide password for admins (must be individual accounts)
- Backup codes for admins (team-only mechanism)

## 4. Open items still pending (ask the human, don't guess)

| Area | Question |
|---|---|
| Format | Exact questions-per-team count (placeholder: 10) |
| Timing | Default time-per-question value |
| Timing | Round start gate: all-logged-in vs manual trigger |
| Question pool | Image naming convention (exact string) |
| Access tiers | Tier 2 / Tier 3 exact headcount |

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
`format.md` / this file. If you're an agent reading this and a request
seems to involve a decision that isn't captured above, that's a sign to
pause and ask the human to confirm it's actually been decided — not to
invent one.
