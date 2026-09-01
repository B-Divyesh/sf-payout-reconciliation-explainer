# Verification 8 handoff — PASS

**Tested candidate:** `459d9b03b74dc9773d76b52474311ace29f07ef1`

**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>

**Checked:** 2026-09-01 UTC

## Result

**PASS.** Independent QA found no release-blocking or lower-severity product defect. The deployed PWA matches the candidate build byte-for-byte for the HTML, service worker, JavaScript, and CSS. Product code was not modified.

The full evidence and exact measurements are in [verification-8.md](verification-8.md).

## What was verified

- All 17 exact `.factory/claims.json` commands passed independently before broader QA.
- The cold desktop and 390 px first screens state the job, audience, first action, outcome, privacy, account, and export facts.
- The one-click sample opens a completed, isolated demo with reset and real-work exit controls.
- `npm ci`, 14 unit tests, typecheck, production build, diff check, dependency audit, and full local browser suite passed.
- The full production browser suite passed: 46 checks with two expected project-specific skips.
- A separate live real-work reconciliation recovered from invalid currency and explanation sign, reached zero variance, and exported its evidence.
- Desktop/mobile, keyboard, focus, both themes, reduced motion, 44 px targets, routes, links, metadata, and axe serious/critical checks passed.
- Live workflow requests stayed same-origin; headers, caching, offline reload, service-worker update activation, purchase redirect, and billing rate limiting passed.
- Lighthouse mobile scored 100 in Performance, Accessibility, Best Practices, and SEO. LCP was 1.4 s, TBT 80 ms, and CLS 0.

## Reproduce

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:e2e
PLAYWRIGHT_BASE_URL=https://payout-reconciliation-explainer.sociobot.in npm run test:e2e
```

There is no separate lint script.

## Defects and known gaps

- Critical: none.
- High: none.
- Medium: none.
- Low: none.
- The app's stated single-period, CSV-only scope is intentional and matches the brief.

## Next step

The candidate is ready for release. Preserve the current production artifact and rerun the claim suite if any product code, copy, billing URL, or service-worker content changes.
