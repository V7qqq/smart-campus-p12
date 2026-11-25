# AGENTS.md

Rules for any coding agent (Claude Code, Codex, Bolt, Copilot) working in this repository.
Read this file fully before any change. If something here is not clear, stop and ask the human.

## Purpose
Smart Campus room availability checker. One page, checks one selected room at a time, fictional sample data only.
A student filters rooms (attendees, equipment), picks a room and a time slot and sees Available / Unavailable with clear reasons.
Optional "Explain availability" button uses a local mock adapter, it never calls a real AI API.
The app only checks. It never creates, saves or changes a booking.

## Architecture (where things are)
- `src/booking.js` - core booking rules, pure functions `getBookingViolations()` and `canBook()`. Times are whole minutes after midnight (600 = 10:00). Single source of truth for the rules.
- `src/lib/bookingLogic.ts` - `checkAvailability()` for one room, `getRoomBookings()`, mapping of rule names to messages for the UI.
- `src/lib/filterRooms.ts` - room filter (F1, F2). It does not decide availability.
- `src/lib/explanation.ts` - explanation input/output validation, mock adapter, timeout and deterministic fallback.
- `src/lib/format.ts` - time formatting helpers. `src/lib/sampleData.ts` only re-exports data.
- `src/data/rooms.ts` - fictional rooms and bookings (fixtures). Fixed current time 08:00 (480).
- `src/lib/contract.ts` - Practice 12 contract: 1) validateRequest (start HH:MM, duration 1-120), 2) calculate (uses getBookingViolations), 3) messageFor. `checkSlot()` returns available, reasonCode, message. Contract text in `docs/contract.md`.
- `src/data/contractRoom.ts` - Practice 12 room A-101, now 08:00, bookings 09:00-10:00 and 12:00-13:00 (read only, from fixtures).
- `src/components/` - UI only. `RoomChecker.tsx` keeps state and calls lib functions, other components only render.
- Tests: `src/booking.test.js`, `src/booking.regression.test.js` (rules), `src/rooms.test.tsx` (AC/F rules + UI in jsdom), `src/explanation.test.tsx` (explanation T01-T16), `src/contract.test.tsx` (Practice 12 T1-T8, logic + UI).
- Flow: input -> `checkAvailability()` -> `CheckResult` -> ResultPanel / ExplanationPanel.

## Setup
- Node.js 18+ (checked with Node 24.19.0, npm 11.17.0).
- Install: `npm ci` (uses package-lock.json, do not use `npm install` for setup).
- No `.env` and no keys are needed. Nothing in this project needs a secret.

## Safe commands (agent can run without asking)
- `npm ci`
- `npm test` (= `vitest run`), `npm test -- --reporter=verbose`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run dev` (local only, port 5173), `npm run preview`
- `npm audit` (read only, NOT `npm audit fix`)
- `git status`, `git diff`, `git log`, `git show`
- read-only search in files (grep, find, cat)

## Ask the human first
- Any change in `package.json` or `package-lock.json` (add, remove or update a dependency, `npm install <pkg>`, `npm audit fix`).
- Any change in fixture data `src/data/rooms.ts`.
- Any change of an existing test or assertion.
- Change of lint, TypeScript or Vite config.
- Commit. Show the diff first, commit only after approval.

## Forbidden (never do)
- No secrets: do not create `.env`, do not write keys, tokens or passwords in code, docs or logs.
- No real personal data. Only fictional rooms and names.
- No deployment or publishing (Bolt publish, Netlify, Vercel, GitHub Pages and similar), no `git push`, no merge to `main`.
- No destructive commands: `rm -rf`, `git reset --hard`, `git clean -fd`, `git push --force`, `git checkout -- .`, deleting the `.git` folder.
- Do not delete, skip (`.skip`, `.only`) or weaken tests to make them pass.
- No backend, login, database, analytics, Supabase or real AI API calls.
- Do not change UI look or behavior if the task does not ask for it. No big refactoring "on the way".

## Acceptance criteria (must stay true after every change)
- AC1: reject if start < 0, end > 1440, start >= end, or start <= now. Start and end must be whole numbers.
- AC2: reject if duration is longer than 120 minutes (120 is ok, 121 is not).
- AC3: reject if the room is blocked.
- AC4: reject overlaps (start < b.end && end > b.start); touching endpoints are allowed.
- AC5: never mutate booking data; show a clear Available / Unavailable decision; booker names are not shown in the UI.
- AC6: usable on desktop and mobile with understandable validation feedback.
- F1: room is shown only if capacity >= attendees. F2: room has ALL selected equipment.
- F3: a blocked room may be shown but is never Available. F4: empty state when no room matches.
- F5: availability uses only the selected room's bookings.
- E1: the explanation never changes the main status; on timeout/error/bad output the deterministic fallback is shown.

## Coding conventions
- TypeScript strict for `.ts/.tsx`. Import with `@/` alias (`@/lib/format`), not deep `../../`.
- Pure functions for rules, no mutation of input arrays.
- Rule names (`RuleName` in `src/booking.js`) are mapped to messages only in `src/lib`, not inside components.
- Small focused changes. Use at most 1-2 justified patterns. No Singleton, Factory or class hierarchies without concrete need.
  Adapter only for really different shapes (the explanation adapter), Strategy only if there are two real policies.
- Tailwind classes for styles, lucide-react for icons. No new UI libraries.

## Test expectations and review gates
- Before a change: run `npm test` and write the exact result (files, passed/failed).
- After a change: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` must all pass.
- Every fixed bug gets a regression test that fails before the fix and passes after.
- Number of tests can only grow. Old tests stay the same.
- Do not say a check passed if you did not run it. Write "not run" and why.
- If no browser is available, say that the UI check was not done.
- Final report of the agent: changed files with reason, diff, test/lint/typecheck/build output, open risks.
- Human reviews the diff and approves before commit or merge. Only human can merge or deploy.

## Known gaps (not fixed yet)
- No CI and no pre-commit hooks, checks are run by hand.
- ESLint config covers only `**/*.{ts,tsx}` files, so `.js` files are not linted.
- No formatter (Prettier) config.
