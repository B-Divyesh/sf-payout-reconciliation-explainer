# Repair handoff — perfection loop round 1

## Outcome

All findings in `.factory/review-1.md` are resolved. The original balance-field visual identity and static offline PWA class remain intact.

The live product is <https://payout-reconciliation-explainer.sociobot.in>. The isolated sample is <https://payout-reconciliation-explainer.sociobot.in/demo>.

## What changed

- Rewrote the first screen around one clear payout-reconciliation job and one sample-data action.
- Added a completed, resettable demo with its own IndexedDB namespace and safe exit.
- Added 12 registered claims and one observable Playwright test for each claim.
- Added real Demo, Privacy, Terms, and styled 404 entries with route metadata.
- Added History API navigation, route announcements, h1 focus, dialog focus return, and shared navigation.
- Added the required three-step explanation and explicit product limits.
- Added Open Graph art, a touch icon, sitemap coverage, and AVIF MIME configuration.
- Fixed the HTML inliner so minified `$&` sequences cannot reinsert the removed script tag.
- Standardized product terms and completed `.factory/copy-audit.md`.

## Verification

Run from a clean checkout:

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:e2e
```

Results on 30 August 2026:

- `npm test`: 14/14 passed.
- `npm run typecheck`: passed.
- `npm run build`: passed; `dist/index.html`, physical route entries, `404.html`, and `sw.js` produced.
- `npm run test:e2e`: 33 passed across desktop and 390×844 mobile; one intentional duplicate offline test skipped on mobile.
- Every command in `.factory/claims.json`: passed from a clean clone.
- Worker URL verifier: root and demo each report one h1, one main, `lang=en`, complete image alt text, and zero console errors.
- Playwright axe: zero serious or critical findings in light and dark themes across every route.
- SWA emulator: real `/demo` returns 200; unknown route returns 404; both AVIF assets return `image/avif` with `nosniff`.
- Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.8 s, CLS 0, TBT 0 ms.
- Built JS is 52.01 KB raw / 17.18 KB gzip. Built CSS is 24.06 KB raw / 5.88 KB gzip.

Evidence is in `.factory/evidence/` and the complete finding map is `.factory/polish-1.md`.

## Deployment

Build `dist/`, then deploy it to the existing `sf-payout-reconciliation-explainer` Static Web App. No infrastructure, DNS, billing, database, or unrelated resource change is required.

## Known gaps and next steps

None for this work order.
