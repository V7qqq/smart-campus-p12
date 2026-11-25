# Practice 12 - AI use record

Tool: Claude Code (Sonnet 5.5), desktop app. Date: 2026-11-25.
Platforms: Bolt.new (code-based, run / test / publish), Microsoft Power Apps developer plan (low-code).

Why Claude Code and not Bolt AI: the Bolt free plan had only 4K monthly tokens left. That is not enough for one
implementation prompt. So the code was written and tested locally with Claude Code, pushed to GitHub, and copied
into the same Bolt project with one `node` command in the Bolt terminal (no Bolt AI tokens used). Bolt was used to
run `npm ci`, `npm test`, lint, typecheck, build and to publish.

## Prompt 1 - implementation (from the practice slides, environment filled in)

> Act as a software engineering assistant. Implement the Smart Campus availability contract in [React/TypeScript
> project in Bolt, then Power Apps canvas app]. Keep all six acceptance criteria unchanged. Use fictional data only.
> Separate deterministic booking rules from presentation. Explain limitations and provide tests. Do not invent
> successful test results.

Output used: `src/lib/contract.ts` (validate -> calculate -> message), `src/components/ContractChecker.tsx`,
`src/contract.test.tsx` (12 tests), Power Apps screen YAML (`low-code/Screen1-controls.pa.yaml`) and App.Formulas
(`Bookings`, `NowMin`).

Problems found during the work:
- First commit converted all files to CRLF (Windows checkout). Fixed with LF normalisation before Bolt transfer.
- First Power Apps paste failed: `YamlInvalidSyntax ... found invalid mapping` because a formula had `": "` inside
  ("Reason code: "). Fixed by using `|-` block style for those formulas.
- Power Apps page blocks `fetch` to GitHub (CSP), so the YAML was put into the clipboard directly.
- Power Apps formula bar uses Russian separators (`;` and `;;`), YAML paste uses `,`. Only App.Formulas was typed
  in the formula bar.

## Prompt 2 - comparison and review (from the practice slides)

> Compare these code-based and low-code implementations against the same requirements and test evidence. Assess
> correctness, maintainability, portability, cost, and security. Identify unsupported assumptions. For each risk,
> provide the observable evidence needed to verify it. Do not treat a platform as secure merely because it is
> low-code.

Unsupported assumptions found and how they were checked:

| Assumption | Result | Evidence |
|---|---|---|
| Low-code is secure because Microsoft hosts it | Unsupported. Sharing, connectors, DLP and data are still the maker's job | share dialog, app has no connectors, msapp scan |
| The Power Apps app is usable on a phone | False for this version (tablet layout scaled down) | `screenshots/pa_phone.png` |
| The Bolt live site has security headers | Only HSTS. No CSP, X-Frame-Options, X-Content-Type-Options | `evidence/security-code-based.txt` |
| Measured minutes = human effort | Unsupported. Times are for the AI agent doing the work | `evidence/time-log.txt` |
| Both versions validate the same way | Confirmed for T1-T8 + decimal 1.5 + script string | screenshots `code_*`, `pa_*` |

## Human verification
Rodion Titov approved the plan (local code + Bolt transfer, new GitHub repo, .msapp download) and the publishing.
All test results come from real runs: `evidence/*.txt` and screenshots. Nothing was simulated except that both
apps use fixed fictional data and a fixed current time (08:00).
