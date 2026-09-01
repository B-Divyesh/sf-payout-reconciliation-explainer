# Polish round 4 handoff — PASS

- Reviewed candidate: `43acce9c28d2efd986d544bf41450aeee43dcad0`
- Review report: `d3b6bbd805fb1f9a4efc814010d115513f2e03de`
- Repair commit: `459d9b0`
- Live URL: <https://payout-reconciliation-explainer.sociobot.in>
- Verified: 1 September 2026 UTC

## What changed

- Removed the unregistered artwork-origin statement from every shared footer and refreshed the copy/design records.
- Prevented initial `/demo` and `?demo=1` sample seeding from scrolling past the page heading.
- Added a desktop/mobile regression that requires `scrollY === 0` and visible demo and sample headings.
- Renamed the README link to “Latest handoff.”
- Updated the catalog description to a 76-character, verb-first sentence.
- Recorded every F-1-1 through F-4-3 resolution in [polish-4.md](polish-4.md).

## How it was verified

From the working tree:

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
PLAYWRIGHT_BASE_URL=https://payout-reconciliation-explainer.sociobot.in npm run test:e2e
```

- Unit: 14/14 passed.
- Browser, local: 46 passed; 2 intentional duplicate offline checks skipped.
- Browser, live: 46 passed; 2 intentional duplicate offline checks skipped.
- Accessibility: integrated axe checks found no serious or critical violations across root, demo, legal, and 404 routes in both themes and viewports.
- Keyboard/mobile: skip link, route focus, Back navigation, dialog focus, 44 px targets, and 390 px overflow checks passed.
- Privacy/offline: same-origin demo request audit, separate demo database, reset/exit isolation, and a dedicated offline reload context passed.
- Build: `dist/` produced service-worker revision `be50c79ad315`; JS is 53.58 KB raw / 17.54 KB gzip and CSS is 25.91 KB raw / 6.21 KB gzip.

The 17 exact commands in `.factory/claims.json` passed independently after `npm ci` in fresh clone `/tmp/payout-polish4-clean-2Mqk21`. The registry has 17 unique IDs and each tag occurs exactly once.

## Deployment and cold evidence

The tested `dist/` was deployed to the existing product-scoped resource `sf-payout-reconciliation-explainer`. The custom domain returned HTTPS 200 immediately.

- Local and live `index.html` SHA-256: `06b2b237640a1d13aa609e93b91cdb260c8632fab2074955cdf29637eddf7544`.
- `/`, `/demo`, `/?demo=1`, `/privacy/`, and `/terms/`: HTTP 200.
- `/does-not-exist`: HTTP 404 with the designed page.
- `/art/balance-field-720.avif`: HTTP 200 and `image/avif`.
- Root/demo verifier: correct titles, `lang=en`, one h1/main, no missing alt text, labelled buttons, and zero console errors. Evidence: [root](evidence/polish-4-live-root/verify.json), [demo](evidence/polish-4-live-demo/verify.json).
- Fresh direct demo: `scrollY` was 0 at 390 × 844 and 1440 × 900. Both the page h1 and `Sample payout PO-0822` were visible. Evidence: [mobile](evidence/polish-4-live-demo-direct-mobile.png), [desktop](evidence/polish-4-live-demo-direct-desktop.png).
- Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.4 s, TBT 0 ms, CLS 0. Evidence: [JSON report](evidence/polish-4-live-lighthouse.json).

## Known gaps and next steps

No review finding, test failure, deployment mismatch, or known product gap remains. No infrastructure outside this product’s scoped Static Web App and DNS record was read or changed.
