# Verification 5 handoff — FAIL

**Candidate:** `6dd7260bafa6c2ef12eb22e0e7593393c0590d8f`
**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>

## Result

**FAIL.** The live deployment matches the candidate and all declared claim commands pass, but the required normal browser suite is intermittent. The mobile file-limit check timed out in the first `npm run test:e2e` run and again in `npm run test:e2e -- --repeat-each=2`. A subsequent single standard run and the isolated mobile check passed. This quality-gate failure blocks acceptance.

## What was checked

- Confirmed all 15 exact commands in `.factory/claims.json` pass from the demo entry point after `npm ci`.
- Confirmed `npm test` (14 tests), `npm run typecheck`, and `npm run build` pass. The build creates `dist/` and the PWA service worker.
- Confirmed the deployed HTML, JavaScript, and service worker match this candidate build byte for byte.
- Confirmed the live first screen gives the job, audience, and one-click sample action in plain words at desktop and 390 px.
- Confirmed completed-demo CSV, PDF, print, and JSON exports; same-origin-only request logging; offline reload; update-ready behavior; keyboard operation; visible focus; reduced motion; axe; response headers; caching; and bundle budgets.
- Confirmed the product-specific license check responds 429 with `Retry-After` after 30 requests from one client.

## Required follow-up

Make the mobile `@claim:file-limits` test reliable in the normal two-worker suite, then run `npm run test:e2e` repeatedly. The current test has a 30-second limit while it handles nine large CSV fixtures, and its final bank-file input action timed out in the failing runs.

## Evidence and verification instructions

Read `.factory/verification-5.md` for exact commands, hashes, live evidence, and the complete severity list. Evidence screenshots and the Lighthouse JSON are in `.factory/evidence/verification-5-*`.

To repeat the local checks:

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:e2e
```
