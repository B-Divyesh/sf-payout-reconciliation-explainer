# Repair handoff — work order `payout-reconciliation-explainer-repair-3`

## Outcome

The release-blocking intermittent mobile `@claim:file-limits` browser check from `.factory/verification-5.md` is repaired. The product scope, UI, local data model, PWA behavior, limits, exports, and deployment class are unchanged.

- Source candidate: `6dd7260bafa6c2ef12eb22e0e7593393c0590d8f`
- Verifier report: `a7c5c87cd36c8d3e2a1f20c3ba5f73c3bea8e3fa`
- Repair code commit: `2132a1b`
- Live URL: <https://payout-reconciliation-explainer.sociobot.in>

## Finding and repair

The unchanged candidate was installed with `npm ci`, then the verifier's exact `npm run test:e2e -- --repeat-each=2` command was run before editing. That baseline attempt passed 80 tests with 4 expected project skips in 2.2 minutes, consistent with the verifier's finding that the failure was intermittent. The verifier had captured the same mobile case timing out twice while assigning the final file.

The former check submitted nine large fixtures in one 30-second test: each of three file inputs received a 10 MB-plus file, an empty file, and a 50,001-row file. Its repeated protocol transfers and parsing, not product behavior, exhausted the test budget under two-worker contention.

The repaired test now:

- creates and closes a dedicated browser context for every limit class;
- preserves desktop and 390 × 844 mobile context behavior;
- waits for the completed demo, real-mode URL, removed demo banner, workspace heading, all three file inputs, and the target input;
- checks the real 10 MB + 1 byte, empty/headerless, and 50,001-row boundaries through the UI;
- assigns one boundary class to each of the three file pickers, which all use the same production import validator;
- uses the smallest valid 50,001-row CSV fixture and removes six redundant 10 MB protocol transfers;
- closes each context in `finally`, so state and storage cannot leak between cases or repeats.

`.factory/claims.json` now records this exact isolated sandbox.

## Local verification

Run from a clean checkout:

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:e2e
npm run test:e2e -- --repeat-each=2
```

Results on 1 September 2026 UTC:

- Clean install: 62 packages audited, 0 vulnerabilities.
- Unit tests: 14/14 passed in 4 files.
- TypeScript: passed. No separate lint script exists; TypeScript is the repository's static check.
- Production build: passed; `dist/index.html` and versioned `sw.js` were created. Service-worker revision: `ddf09aa9c4d5`.
- Standard browser suite: 40 passed, 2 expected offline-project skips, in 1.0 minute.
- Complete repeated suite: 80 passed, 4 expected offline-project skips, in 2.0 minutes.
- Focused mobile stress check: `npm run test:e2e -- --project=mobile --grep @claim:file-limits --repeat-each=10` passed 10/10 in 41.8 seconds.
- Every one of the 15 commands in `.factory/claims.json` passed separately. The repaired exact Chromium claim command passed in 7.3 seconds.
- `npm audit --omit=dev` and `git diff --check`: passed.
- Package/consumer verification: not applicable to this static PWA.

The full browser suite covers desktop Chromium and 390 px mobile, keyboard focus and dialog behavior, all public routes, light/dark axe scans, 44 px targets, horizontal overflow, errors, privacy, exports, persistence, and a dedicated offline context. Axe found no serious or critical issues.

Factory URL verification passed local `/` and `/demo` at desktop and 390 px with one `h1`, one `main`, `lang=en`, complete image alternatives, labelled buttons, and no console errors. Evidence is in `.factory/evidence/repair-3-local-*`.

Bundle and performance evidence:

- Initial JavaScript: 53,757 bytes raw / 17,646 bytes gzip.
- CSS: 25,905 bytes raw / 6,219 bytes gzip.
- Local Lighthouse JSON: performance 99, accessibility 100, best practices 100, SEO 100; FCP 1.35 s, LCP 1.80 s, TBT 0 ms, CLS 0.
- Lighthouse emitted its known tab-close error after writing the complete JSON. Independent Playwright and factory URL checks completed without errors.

A byte-distinct service worker was offered from an isolated local copy of `dist`. It reached `waiting`, displayed **Update ready**, activated through **Reload update**, and returned to the completed demo with an activated controller and no console errors. Offline reload also passed in a dedicated context.

## Deployment and live evidence

The repair commit was pushed to `origin/main`. `dist/` was uploaded to the production environment of the existing `sf-payout-reconciliation-explainer` Static Web App. Only that exact Static Web App resource was read for deployment and changed by the upload. DNS, databases, key vaults, billing, shared services, and unrelated resources were not accessed.

Live identity and policy checks:

- Live `index.html` equals local `dist/index.html`: SHA-256 `a8d5e049b97aebe6ad4c2b0d310a8086af9d7e9b7036b5997ab66d516f86885a`.
- Live `sw.js` equals local `dist/sw.js`: SHA-256 `e396dbc7bc086b1d9f7ffda2345d9625cffe16913e62c7760a972829b3b84538`.
- `/`, `/demo`, `/privacy/`, `/terms/`, manifest, robots, sitemap, and offline page return 200. A cold unknown route returns 404 with the designed page.
- CSP is delivered as a response header with `frame-ancestors 'none'`. HSTS, `nosniff`, Referrer-Policy, Permissions-Policy, and `X-Frame-Options: DENY` are present.
- Factory URL verification passed live `/` and `/demo` at desktop and 390 px with no console errors. Evidence is in `.factory/evidence/repair-3-live-*`.
- Live Playwright checked root, demo, Privacy, Terms, and 404 UI at desktop and 390 px: zero serious/critical axe findings, one `h1` and `main`, no overflow, and no mobile target below 44 px.
- Keyboard first focus is **Skip to main content**. Reduced-motion maximum computed timing is 0.00001 seconds.
- The completed live demo/export flow made only same-origin requests. A dedicated context reloaded the completed demo offline. No sign-in control exists, so an identity-tenant test is not applicable.
- Live Lighthouse JSON: 100 performance, 100 accessibility, 100 best practices, 100 SEO; FCP 1.20 s, LCP 1.35 s, TBT 0 ms, CLS 0.00004. Lighthouse again emitted a tab-close error only after writing the complete report.

Live screenshots, verifier JSON, and Lighthouse reports are under `.factory/evidence/repair-3-*`.

## Known gaps

No release blocker or known product gap remains. The live billing endpoint and hosted checkout were not contacted because this work order forbids connecting to services outside the named Static Web App. Their product behavior remains covered by the mocked privacy and exact-link claim tests.
