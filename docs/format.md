# Equinox — Contest Context & Planning Document

## 1. Overview

Equinox is a multi-round team contest run by the club. Teams compete in pairs (2
players/team) across 5 rounds with progressive elimination, culminating in a
final winner. This document captures the full contest structure at a high
level. Detailed, round-specific planning lives in separate files as rounds
enter active build — see **Round2.md** for all Round 2 specifics.

**Current build scope: Round 2 only.** Rounds 1, 3, 4, 5 are summarized here
for context/continuity but are not being built yet — they'll get their own
detailed doc (e.g. `Round3.md`) when picked up.

**Site name:** "Equinox" — the portal being built (currently just Round 2)
is named Equinox.

**Scope boundary (important, confirmed):** We are building the **platform/
infrastructure only** — admin panels, team login, exam/round UIs, timer
logic, scoring engines, leaderboards, data handoff mechanisms. We are
**not** responsible for designing questions, setting problems, or curating
content itself. That is the club's job; the site just needs a way for
admins to input/manage whatever content they provide.

---

## 2. Global Constants

| Variable | Value |
|---|---|
| Total teams | 35 |
| Players per team | 2 |
| Total participants | 70 |
| Total rounds | 5 |
| Round 1 quiz platform | quiz.com (external, PIN-based, Kahoot-style) |

## 3. Team Progression (Elimination Funnel)

| After Round | Teams Remaining | Teams Eliminated |
|---|---|---|
| Start | 35 | — |
| Round 1 | 25 | 10 |
| Round 2 | 25 | 0 (no elimination) |
| Round 3 | 15 | 10 |
| Round 4 | 10 | 5 |
| Round 5 | Winner(s) determined | — |

---

## 4. Round-by-Round Summary

### Round 1 — Quiz Round
- **Platform:** quiz.com (existing external tool, not built by us)
- **Teams in:** 35 → **Teams out:** 25 (10 eliminated)
- **Purpose:** Pure shortlisting filter — Round 1 scores do **not** carry
  forward. Round 2 scoring starts every qualifying team at 0.
- **Output needed:** Just the list of 25 qualifying team names.
- Handoff mechanism details → see **Round2.md, Section 5**.

### Round 2 — Custom Scoring Round *(current build focus — see Round2.md)*
- **Format:** Custom web portal (Equinox), built in-house
- **Teams:** 25 (all continue, no elimination — points carry forward)
- **Question pool:** 60–70 MCQs; **Per team:** 10 questions (placeholder)
- **Scoring:** +20 correct / 0 wrong (no negative marking)
- **UI:** JEE Mains/Advanced-style — pooled timer, free navigation,
  skip/clear, auto force-submit on timeout
- **Leaderboard:** Live, Round 2 scores only
- Full details, open items, access tiers, data handoff → **Round2.md**

### Round 3 — Buzzer Round *(context only, not building yet)*
- **Teams:** 25 → 15 (10 eliminated)
- **Format:** 20 problems, displayed on projector/board. Teams buzz in;
  first to buzz gets the opportunity to answer.
- **Scoring:** +10 correct / -5 wrong
- On wrong answer, opportunity passes to "the next team on the line" —
  **exact rule still TBD** (fixed rotation vs open re-buzz vs
  wrong-team-excluded-this-question-only)
- **Buzzer mechanism** (hardware vs software/app) — **still TBD**

### Round 4 — "Full Game" *(context only, not building yet)*
- **Teams:** 15 → 10 (5 eliminated)
- **Problems:** 10 (= Round 3 problem count ÷ 2)
- **Scoring:** +20 correct / -10 wrong
- Format/mechanic (same as Round 3 buzzer style, or different) — **still TBD**

### Round 5 — Story Mode *(context only, not building yet)*
- **Teams:** 10 → Winner(s)
- **Format:** 3 parts, each with 2–4 problems, parts are narratively/logically
  dependent on each other
- **Scoring:** +30 if fully correct / -20 wrong
- **Open questions:**
  - Scored per problem, per part, or only on the final outcome?
  - Is Part 2/3 access **hard-gated** by correctly solving the prior part, or
    **soft-linked** (thematically connected but accessible regardless)?

---

## 5. Cross-Round Open Items Tracker

| Round | Open Question | Status |
|---|---|---|
| 2 | See Round2.md, Section 8 for full Round 2 open items list | — |
| 3 | Buzzer hardware vs software | Pending |
| 3 | "Next team in line" exact rule | Pending |
| 4 | Round format/mechanic | Pending |
| 5 | Scoring granularity (per-problem/part/whole) | Pending |
| 5 | Hard gate vs soft dependency between parts | Pending |

---

## 6. Tooling

Planning and architecture decisions are made in planning chat first;
Google Antigravity IDE + Antigravity 2.0 is used for execution only, once
a decision is locked. Repo: `github.com/Cracked57-punk/Equinox` (private).
Full tooling/repo conventions → **Round2.md, Section 9**.

## 7. Build Priority

**Phase 1 (current):** Round 2 portal — see Round2.md for full scope.

**Phase 2+ (future, on further instruction):** Rounds 3, 4, 5 tooling,
each to get its own detailed doc when active.
