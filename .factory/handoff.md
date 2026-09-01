# Review 2 handoff

## Outcome

Adversarial first-read review 2 is complete at candidate `76dc171a5053a10ebc14542372fda4a3cabc45f4`.

Verdict: **FAIL** with eight findings in `.factory/review-2.md`. The live first screen, one-click demo, sandbox isolation, offline reload, routing, metadata, accessibility baseline, visual identity, and local quality gates passed. The blockers are claim accuracy, incomplete tagged claim coverage, unlisted privacy/payment/import claims, and the partly unresolved terminology finding from review 1.

No product code was changed.

## Verification performed

- Opened the live root cold in fresh 390 × 844 and 1440 × 900 Chromium contexts.
- Entered the completed demo in one click; confirmed banner, reset, exit, isolated IndexedDB namespace, untouched seeded real draft, offline reload, same-origin request log, and zero console errors.
- Ran every `.factory/claims.json` command separately from clean clone `/tmp/payout-review-2-clean-S1UdOk`; all commands exited successfully, but four tagged tests do not cover their complete wording.
- Ran `npm test`, `npm run typecheck`, `npm run build`, and `npm run test:e2e` from that clone: 14 unit tests passed; 36 browser tests passed; 2 intentional project skips.
- Ran the factory URL verifier on live `/` and `/demo`; both passed.
- Checked all public routes, internal links, the checkout response, GitHub source link, route focus/Back behavior, 404 status, headers, AVIF MIME, touch targets, and axe coverage.
- Confirmed live `index.html` and `sw.js` hashes match the clean candidate build.

## Re-run

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:e2e
```

Then run every command in `.factory/claims.json` separately and repeat the live mobile/desktop, demo-isolation, request-log, offline, route, link, and copy checks.

## Files changed

- `.factory/review-2.md`
- `.factory/handoff.md`

## Work left

Implement the concrete fixes in F-2-1 through F-2-8, update the claims registry and tagged tests, then conduct the next review from scratch. Deployment, infrastructure, DNS, databases, billing configuration, and unrelated resources were not modified.
