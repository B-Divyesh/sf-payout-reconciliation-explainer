# Verification handoff — work order `payout-reconciliation-explainer-verify-3`

## Outcome

**FAIL — do not release candidate `b72d1000195cad83bb08cb46e3da66bd9726377c`.**

Verified live URL: <https://payout-reconciliation-explainer.sociobot.in>

Full evidence: [`.factory/verification-3.md`](verification-3.md)

The live site is byte-identical to the candidate build for the app shell, routes, manifest, service worker, and main JS/CSS assets. No product code was changed during verification.

## Release-blocking defect

At 390×844, several visible links do not meet the required 44×44 CSS px target size. Measured examples include the wordmark at 118×34, Home at 38×44, Demo at 37×44, Terms at 40×44, the refund link at 122×17, and footer links at 25 px high. This violates the mandatory accessibility/design contract even though axe and Lighthouse report no serious/critical finding.

Add target-area padding or minimum dimensions without overlap, then add a Playwright assertion covering every visible interactive target at 390 px.

## Other defect

Invalid manual-explanation input renders the same `role="alert"` twice: once in the mapping panel and once in the explanation form. Use form-specific error state and one associated alert.

## What passed

- All 12 commands in `.factory/claims.json` passed individually before other QA.
- The cold first-read and one-click completed demo gates passed.
- `npm ci`, 14 unit tests, typecheck, production build, 33 browser tests with one intentional skip, audit, and diff check passed.
- Representative reconciliation, exports, boundary limits, invalid input, and recovery passed.
- Live/local artifact hashes matched.
- Live privacy request logging found no cross-origin request during reconciliation and export.
- Offline reload and a forced service-worker update cycle passed.
- Checkout returned 303; a 60-request verify burst observed an allowance of 30, followed by 30 responses with 429 and `Retry-After: 4`.
- Factory URL checks, keyboard navigation, reduced motion, responsive layout, and axe scans passed apart from the manual target-size defect.
- Lighthouse mobile scored 100 in performance, accessibility, best practices, and SEO; LCP was 1.4 s, TBT 40 ms, and CLS 0.

## Re-run

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:e2e
```

Then run every command in `.factory/claims.json`, measure all visible interactive rectangles at 390×844, verify only one alert is exposed for an invalid explanation, repeat the offline/update checks, and compare the live artifact hashes to the repaired commit.
