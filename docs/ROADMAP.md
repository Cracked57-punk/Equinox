# Equinox — Round 2 Build Roadmap

This tracks phase-by-phase build progress. Read this alongside
`PROJECT_CONTEXT.md`, `Round2.md`, and `format.md` for full context.
**Update the Status column whenever a phase is completed or started** —
this file is the source of truth for "where are we right now."

If you are an agent picking up this project: check the Status column
before doing anything. Do not start work on a phase marked "Not started"
if an earlier phase isn't yet "Done" — the phases build on each other
(e.g. the exam UI depends on the exam session engine, which depends on
auth). If asked to work on something out of sequence, flag it rather than
just proceeding.

| Step | What it covers | Status |
|---|---|---|
| 0. Planning | `format.md`, `Round2.md`, `PROJECT_CONTEXT.md` — scope, access tiers, data flows | ✅ Done |
| 1. Scaffold + schema | Next.js project setup, Prisma schema (Team, AdminUser, Question, ExamSession, TeamQuestionAnswer, RoundSettings) | ✅ Done |
| 2. Auth layer | Magic-link login (teams), email+password (admins), session guards (`requireTeam`, `requireAdmin`), backup codes (teams), Tier 2/3 enforcement | ✅ Done |
| 3. Admin panel shell | Tier-gated navigation/layout shell and Dashboard (other sections added incrementally per phase) | ✅ Done |
| 4. Round 1→2 handoff | Pre-loaded 35-team checklist UI, admin checks off 25 qualifiers, confirm-to-lock action | 🔶 Up next |
| 5. Question pool import | Google Sheets API integration, parse preview, image link handling, Tier 2 confirm-to-commit into Postgres | ⬜ Not started |
| 6. Exam session engine | Server-side random question assignment per team, pooled timer logic, admin-editable time-per-question, session persistence | ⬜ Not started |
| 7. Exam UI | JEE-style interface — free navigation, palette, skip/clear, force-submit on timeout | ⬜ Not started |
| 8. Scoring engine | +20/0 marking logic, answer submission handling | ⬜ Not started |
| 9. Live leaderboard | Polling-based live updates, Round 2 scores only | ⬜ Not started |
| 10. Live admin controls | Round-start trigger (all-logged-in vs manual gate), live timer/monitoring dashboard | ⬜ Not started |
| 11. Testing & rehearsal | Full dry-run with test teams, load-check polling under 25 concurrent teams, Vercel env setup | ⬜ Not started |
| 12. Event-day support | On-call plan for live issues, rollback plan | ⬜ Not started |

---

## Currently blocking / needs a decision before it can start

These aren't blocking Step 2, but will block the phase noted before that
phase can be completed — flag them if you reach that phase and they're
still unresolved:

| Open item | Blocks phase | Status |
|---|---|---|
| Exact questions-per-team count (placeholder: 10) | 6. Exam session engine | Pending |
| Default time-per-question value | 6. Exam session engine | Pending (admin-editable regardless of default) |
| Round start gate: all-logged-in vs manual trigger | 10. Live admin controls | Pending |
| Image naming convention (exact string) | 5. Question pool import | Pending |
| Tier 2 / Tier 3 exact headcount | 3. Admin panel shell (informs seed data) | Pending |

Full detail on each of these lives in `Round2.md`, Section 8.

---

## Working rules for whichever phase is active

- Planning/architecture decisions are made in a separate planning chat
  first, then handed off here for execution — don't make product
  decisions unilaterally mid-implementation.
- Don't skip ahead to a later phase's code because it seems related —
  each phase should be reviewed and committed before the next starts.
- If a phase's plan conflicts with something locked in `Round2.md` or
  `PROJECT_CONTEXT.md`, the docs win — flag the conflict rather than
  silently following the newer instruction.
