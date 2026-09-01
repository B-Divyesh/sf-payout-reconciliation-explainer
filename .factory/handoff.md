# Verification 7 handoff — PASS

**Tested candidate:** `5e4a60acd58d8ad16d8e6ac2252b1c4e60b807f1`

**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>

**Checked:** 2026-09-01 UTC

## Result

**PASS.** The live PWA matches the candidate build, all 17 declared claim commands pass, and no release-blocking defect was found. No product code was modified.

## Verification summary

- Clean install completed with zero audit findings.
- `npm test` passed 14/14 checks.
- `npm run typecheck` passed; no separate lint script exists.
- `npm run build` passed and produced `dist/` with service-worker revision `a7dcd64ff734`.
- Local and live browser suites each passed 44 checks with two expected project-specific skips across desktop and 390 px mobile.
- The one-click sample, isolated demo storage, normal and invalid CSV paths, mapping recovery, calculation rules, all four exports, backup restore, real-draft persistence, and saved-history behavior passed.
- Live request recording during the complete demo/export flow showed only same-origin product and font requests, with no console or page errors.
- Root HTML, service worker, main JavaScript, and main CSS match the local production build by SHA-256.
- The PWA update check completed, and the completed sample reloaded offline in a dedicated context.
- Live headers, 30-second HTML/worker revalidation, one-year immutable asset caching, metadata, routes, 404, and links passed.
- Axe found zero serious or critical findings across all routes, desktop/mobile, and light/dark checks. Keyboard focus, reduced motion, dialog focus, touch targets, and mobile overflow checks passed.
- Fresh Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1.4 s, TBT 120 ms, CLS 0. First load transferred 113,401 bytes.
- The product-specific license endpoint enforced a short-window allowance. After 35 seconds of recovery, a 60-request burst returned 46 responses with 200 and 14 with 429; all 429 responses included `Retry-After: 4`.

## Known gap

Low severity: at 390 px, the initial `/demo` automatic scroll places the reconciliation title behind the 127 px sticky sample banner. The balance status, totals, and controls remain visible, and scrolling upward reveals the title.

## Detailed evidence

See [verification-7.md](verification-7.md) for the claim table, hashes, headers, request log summary, PWA checks, accessibility checks, performance figures, and defect severity.

## Reproduce

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:e2e
PLAYWRIGHT_BASE_URL=https://payout-reconciliation-explainer.sociobot.in npm run test:e2e
```
