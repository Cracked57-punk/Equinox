# Round 2 — Equinox Portal — Detailed Planning Document

This document tracks all Round 2–specific decisions in detail. High-level
contest context (all 5 rounds, global constants, elimination funnel) lives
in `format.md`. This file is the working doc for the current build.

**Site name:** Equinox

**Scope boundary (confirmed):** We build the **platform/infrastructure
only** — admin panel, team login, exam UI, timer logic, scoring engine,
leaderboard, data handoff mechanisms. We are **not** responsible for
designing questions, setting problems, or curating question content. That
is the club's question-setting team's job; the site just needs solid
tooling for admins to input/manage whatever questions they provide.

---

## 1. Format Summary

- **Teams:** 25 (all continue from Round 1, no elimination — points carry
  forward into later rounds)
- **Question pool:** 60–70 MCQs, roughly uniform difficulty
- **Per team:** 10 questions (placeholder — exact number still pending
  final decision), randomly selected from the pool
- **Scoring:** +20 correct / 0 wrong (no negative marking — intentional,
  to let teams bank points for later rounds which do have negative
  marking)

---

## 2. Timing

- Total time is **pooled** per team (not strictly per-question), calculated
  from number of questions × an **admin-editable time-per-question**
  setting
- Round starts **simultaneously for all 25 teams** — gated by either:
  (a) all teams logged in, or
  (b) a manual "start" trigger from the conductors
  (conductors choose which; a grace period/timeout for stragglers should
  be considered under option (a))
- Exact time-per-question default value — **still pending** (admin-editable
  regardless of default)
- Behavior on time-out: **confirmed** — force-submit current state
  (whatever's selected, or blank), JEE-style

---

## 3. Exam UI/UX

JEE Mains/Advanced-style exam interface:
- Overall countdown timer (not per-question)
- Free navigation between questions (not forced sequential)
- Skip button, Clear Response button
- Question palette / answered-unanswered indicator
- Auto force-submit of whatever is selected (or blank) when time expires

---

## 4. Leaderboard

- Shown live at end of Round 2, showing **Round 2 scores only**
- Round 1 scores are **not** carried forward — Round 1 was purely a
  shortlisting filter, so a team's Round 1 standing didn't matter once
  they made top 25
- **Future consideration (deferred, out of scope for current build):** if
  the contest structure expands later, a *cumulative* leaderboard
  (Round 1 + Round 2 combined) could be introduced

---

## 5. Round 1 → Round 2 Data Handoff (Team Qualifiers)

**Problem:** Round 1 runs on quiz.com (external, not built by us). After
it concludes, Round 2 needs to know which 25 of the 35 teams qualified.
Since Round 1 scores don't carry forward (Round 2 starts every team at 0),
the only data needed is **which 25 team names qualified** — not scores.
This is a smaller, lower-risk problem than a full name+score transfer.

- ❌ Rejected: scraping quiz.com (ToS risk, fragile, unnecessary effort)
- ❌ Rejected (superseded): bulk paste / CSV of name+score pairs — no
  longer needed since scores aren't required, and free-text name entry
  still carries typo/fuzzy-match risk
- ✅ **Chosen approach: pre-loaded checklist, admin checks off qualifiers**
  - All 35 team names are known ahead of time (from registration), so they
    can be pre-loaded into the admin panel **before Round 1 even starts**
  - After Round 1 concludes, admin opens a checklist/multi-select UI
    showing all 35 team names and simply **checks off the 25 that
    qualified**
  - No typing, no pasting, no name-matching/parsing — eliminates typo
    risk entirely since names are selected from a known list, not
    re-entered
  - Fast enough for live crowd conditions; admin still does one **confirm
    action** to lock in the qualifier list before Round 2 opens
  - (CSV/bulk-paste import kept as a documented fallback option only if a
    pre-loaded team list isn't ready in time — not the primary path)

---

## 6. Question Pool Delivery

Question-setting team is non-technical; questions may include diagrams/
vector images, standard 4-option MCQ format.

- ❌ Rejected: raw CSV (can't hold images) and free-form "question paper"
  doc without strict template (high parse-failure risk across 60–70
  entries, harder to bulk-review before import)
- ✅ **Chosen approach: structured Google Sheet with image links**
  - Columns: Question text | Option A | Option B | Option C | Option D |
    Correct Answer | Image Link
  - Question-setters upload diagrams to a **shared Google Drive folder**
    — ownership doesn't matter (either admin or the question-setting team
    head can create it), as long as it's **one shared folder** with
    consistent edit access for contributors and "Anyone with the link can
    view" sharing so the import tool can fetch images
  - Naming convention: **confirmed — question-setting team will follow
    whatever convention is set** (exact convention string still TBD)
  - Multi-image questions: **confirmed — multiple links, comma-separated,
    in the same Image Link cell**
  - Reliable to parse (already tabular), easy to bulk-review before
    import, reuses the same preview-then-confirm pattern used for the
    Round 1 qualifier checklist

---

## 7. Access Tiers (confirmed structure)

Two different concerns kept deliberately separate: **who can contribute
question content** (low risk, open to many) vs **who can operate the live
platform** (high risk, small trusted set).

**Tier 1 — Question Contributor**
- Access: edit rights to the Google Sheet only. No login to Equinox.
- Who: entire question-setting team, unlimited people.
- Risk: essentially zero — can't touch anything live.

**Tier 2 — Content Admin**
- Access: can log into Equinox's admin panel, but *only* the question-pool
  section — import the Sheet, review the parse preview, confirm/commit
  into the live question pool.
- Who: a slightly wider set than full admins — e.g. head of the
  question-setting team, or whoever's coordinating question submission.
- Cannot: touch the team qualifier checklist, timer settings, round
  start/stop, or leaderboard.

**Tier 3 — Event Admin (Super Admin)**
- Access: everything — question pool management, team checklist,
  timer-per-question setting, round start trigger, live leaderboard.
- Who: a small named set of trusted co-organizers who'll actually operate
  the system live on event day.
- Highest-stakes tier (wrong timer, premature start, etc.) — kept as small
  and trusted as possible.

**Admin login mechanism (confirmed):**
- Individual named accounts per admin, for both Tier 2 and Tier 3 — no
  shared tier-wide password, so live actions stay attributable to a
  specific person.
- **Email + password login** (bcrypt-hashed passwords), *not* magic-link.
  This is a deliberate departure from team login: admins are a small,
  repeat-use group who need fast, dependency-free access during a live
  event, whereas a magic link introduces an email-deliverability
  dependency (Resend latency, spam filters, venue wifi) at exactly the
  moment stakes are highest (premature start, wrong timer, etc.).
- **Password recovery:** self-serve — a reset link is emailed to the
  admin's registered email address. This reuses the Resend
  infrastructure already built for team magic-links, but as a distinct
  password-reset token flow (separate token type/table from the team
  login token, since the two are functionally different: one logs you
  in directly, the other lets you set a new password).
- **No backup codes for admins.** Backup codes remain a team-only
  mechanism (for teams without email access). For admins, self-serve
  email reset was judged sufficient — a third fallback (backup code) adds
  a code to generate/store/remember without meaningfully improving
  reliability over password + email reset. Can be revisited as a future
  addition if reset-via-email proves insufficient in practice.
- Teams are **unaffected** by this — team login stays magic-link +
  backup-code fallback, unchanged.

**Open sub-decisions:**
- Exact headcount for Tier 2 and Tier 3 — **pending**

---

## 8. Open Items Tracker (Round 2)

| Area | Open Question | Status |
|---|---|---|
| Format | Exact number of questions per team (placeholder: 10) | Pending |
| Timing | Exact time-per-question default value | Pending (admin-editable regardless) |
| Timing | Round start gate: all-logged-in vs manual trigger | Pending decision |
| Question pool | Image naming convention (exact string) | Pending |
| Access tiers | Tier 2 / Tier 3 headcount | Pending |
| Access tiers | Admin login mechanism | ✅ Confirmed: individual email+password (bcrypt) per admin, self-serve reset via registered email, no backup codes for admins |
| — | Team login/credential mechanism (players logging into exam) | ✅ Confirmed: magic-link + backup code fallback (see Section 5/7 history) |

---

## 9. Repository & Tooling

- **Repository:** Private GitHub repo —
  `github.com/Cracked57-punk/Equinox`.
- **Directory convention (confirmed):** `src/app` for Next.js App
  Router. A stray root-level `app/` conflict was found early in the
  build and resolved by deletion — `src/app` is the only routing tree.
- **Folder structure (confirmed):** structured for readability —
  anyone new to the codebase should be able to tell "where's a URL"
  from "where's logic" at a glance.
  - `src/app/` — routes only (`page.tsx`, `layout.tsx`, `route.ts`).
    No business logic or Server Actions live here.
  - `src/actions/` — Server Actions, grouped by domain. Team and
    admin auth are kept as **separate files**
    (`actions/auth/team.ts`, `actions/auth/admin.ts`), since they're
    two functionally distinct auth systems, not one — mixing them in
    a single file previously contributed to confusion during the
    admin-auth build.
  - `src/components/` — React UI, grouped by domain
    (`components/admin/`, `components/team/`, `components/ui/` for
    shared generic primitives).
  - `src/lib/` — non-action business/utility logic. General infra
    (`prisma.ts` — Prisma client, `email.ts` — Resend wrapper) stays
    at the top level; auth-specific logic is grouped under
    `src/lib/auth/`:
    - `session.ts` — JWT cookie helpers, `requireTeam`/`requireAdmin`
      guards
    - `tokens.ts` — magic-link/reset token generation and hashing
    - `jwt.ts` — token sign/verify logic (`jose` library calls)
    - `backup-code.ts` — team backup code generation/validation
  - `src/types/` — shared TypeScript types (e.g. JWT payload
    interfaces).
- **Docs-must-be-committed rule:** planning documents (`format.md`,
  `Round2.md`, `PROJECT_CONTEXT.md`) live in `/docs` and must be
  pushed to GitHub, not kept only locally — a locally-only doc is a
  single point of failure if something happens to the machine it's
  on.
- **`.env` never-commit rule:** `.env` is never committed;
  `.env.example` is the committed placeholder template. `.gitignore`
  needs a `!.env.example` exception line so the placeholder itself
  isn't excluded along with the real file.
- **Secrets handling (confirmed):** the coding agent (Antigravity)
  must never view, print, or log the contents of `.env` or any
  secret value (DB URL, API keys, admin passwords, etc.). It may run
  commands that use env vars internally without issue. Local `.env`
  holds throwaway dev-only secrets; real production secrets are set
  directly in Vercel's dashboard at deploy time, not stored in any
  file the agent works from.

---

## 10. Build Priority

**Phase 1 (current):** Round 2 portal — admin panel (question pool
management via Sheet import/preview/confirm, time-per-question setting,
pre-loaded team list with qualifier checklist/confirm, tiered access
control), team login, JEE-style exam UI, pooled timer + auto-submit, live
Round-2-only leaderboard.
