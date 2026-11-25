# Smart Campus Room Availability Checker

Practice 12: the first tab "Practice 12 checker" is the code-based solution of the shared contract (`docs/contract.md`): one room A-101, start time + duration, blocked switch, result with reason code. Tests T1-T8 are in `src/contract.test.tsx`. The low-code version (Power Apps) is in `low-code/`. The second tab is the old room catalog.

Small React + TypeScript (Vite) app. A student filters rooms by attendees and equipment, picks one room and a time slot, and sees Available or Unavailable with reasons. All rooms and bookings are fictional. The app only checks availability, it does not create or save bookings. No backend, no login, no database, no API keys.

The "Explain availability" button uses a local mock adapter (no real AI API call). The rule checker always decides the status, the explanation only describes it. On timeout, error or bad output the app shows a deterministic fallback text.

## Setup and commands

Node.js 18+ and npm (checked with Node 24.19.0 and npm 11.17.0).

```
npm ci                 # install exact versions from package-lock.json
npm run dev            # local dev server, http://localhost:5173
npm test               # all Vitest tests
npm run lint           # ESLint (ts/tsx files)
npm run typecheck      # tsc --noEmit
npm run build          # production build to dist/
npm audit              # dependency check (read only)
```

## Structure

- `src/booking.js` - booking rules (AC1-AC4), pure functions.
- `src/lib/` - availability check for one room, room filter, explanation adapter, formatting.
- `src/data/rooms.ts` - fictional rooms and bookings, fixed current time 08:00.
- `src/components/` - UI components.
- `src/*.test.*` - tests (rules, regression, UI in jsdom, explanation).

Agent rules, acceptance criteria and forbidden actions are in `AGENTS.md` (Claude Code reads it through `CLAUDE.md`).

Times are whole minutes after midnight, for example 600 = 10:00.

## Practice 12 files
- `docs/contract.md` - shared user story, AC1-AC6, inputs/outputs, test inputs T1-T8.
- `src/lib/contract.ts`, `src/components/ContractChecker.tsx`, `src/contract.test.tsx` - code-based solution.
- `low-code/` - Power Apps export (`SmartCampusP12LowCode.msapp`) and readable YAML source (`App.pa.yaml`, `Screen1.pa.yaml`).
- `report/` - report (PDF, DOCX). `screenshots/` - both apps and test results. `evidence/` - real command outputs and time log.
- `docs/ai-use.md` - AI prompts, problems and verification.
- Live demo: https://smart-campus-room-av-idf7.bolt.host
