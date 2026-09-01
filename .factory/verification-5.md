# Independent verification 5 — FAIL

**Candidate:** `6dd7260bafa6c2ef12eb22e0e7593393c0590d8f`
**Checked:** 2026-09-01 UTC
**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>

## Release result

**FAIL.** The deployed app matches the candidate and the product checks below passed, but the required browser quality gate is not reliable in its normal two-worker configuration. `npm run test:e2e` timed out in the mobile `@claim:file-limits` case on its first standard run. A second standard run passed, but `npm run test:e2e -- --repeat-each=2` failed the same mobile case again. A candidate cannot be accepted while its required browser suite has an intermittent failure.

No product code was changed during this verification.

## First read and one-click demo

Confirmed on a cold live desktop and 390 px visit that the first screen says what it does: “Reconcile a payout with order events and bank deposits.” It names the audience: “ecommerce operators and bookkeepers.” It states what to do first with the visible **Try it with sample data** link and explains the outcome: “See a completed reconciliation and download its accountant report.”

Checked that one activation opens `/demo`, shows the persistent “Demo — sample data, nothing is saved” banner, Reset demo and Start for real controls, and the completed “The bank deposits balance” result. This check passed on desktop and at 390 px. Screenshots are in `.factory/evidence/verification-5-live-*-landing.png` and `verification-5-live-*-demo.png`.

## Claims checks

Confirmed that `.factory/claims.json` is present and has 15 entries. From this clean candidate after `npm ci`, every exact command in that file passed against the demo entry point:

| Claim | Result |
| --- | --- |
| `demo-ready` | PASS |
| `demo-isolation` | PASS |
| `local-privacy` | PASS |
| `file-limits` | PASS |
| `free-exports` | PASS |
| `offline-reload` | PASS |
| `draft-persistence` | PASS |
| `saved-history-license` | PASS |
| `license-verification-privacy` | PASS |
| `hosted-checkout` | PASS |
| `required-columns` | PASS |
| `erase-scope` | PASS |
| `visible-reconciliation` | PASS |
| `no-integrations` | PASS |
| `build-output` | PASS |

Checked the landing page and README claim-like copy against this list. No unlisted user-facing product claim was found.

## Local quality checks

- Confirmed `npm ci` completed: 62 packages audited and no package vulnerabilities reported.
- Confirmed `npm test` passed: 14 tests in 4 files.
- Confirmed `npm run typecheck` passed.
- Confirmed `npm run build` passed and created `dist/`; the generated service-worker revision was `ddf09aa9c4d5`.
- Confirmed initial application JavaScript is 53,757 bytes raw / 17,682 bytes gzip and CSS is 25,913 bytes raw / 6,214 bytes gzip, within the static-product budgets.
- Checked `npm run test:e2e` twice: the first run failed at the mobile file-limit case after 30 seconds; the second run passed all 42 tests.
- Checked the mobile file-limit case alone: it passed in 12.2 seconds.
- Checked `npm run test:e2e -- --repeat-each=2`: it failed the same mobile file-limit case. The trace shows the test timed out while setting the final 10 MB-plus bank CSV after the preceding eight large-file checks. Evidence: `test-results/app--claim-file-limits-rej-dc940-ess-and-over-row-limit-CSVs-mobile/trace.zip`.

## Live deployment, privacy, PWA, and usability checks

- Confirmed the live root HTML equals `dist/index.html` (SHA-256 `a8d5e049b97aebe6ad4c2b0d310a8086af9d7e9b7036b5997ab66d516f86885a`).
- Confirmed the live application script equals `dist/assets/main-DwwjkXmI.js` (SHA-256 `25d5881a5310aeb38f76ac0849a033b7f6c45e4458967e6507b19643a93ebbd2`) and the live worker equals `dist/sw.js` (SHA-256 `e396dbc7bc086b1d9f7ffda2345d9625cffe16913e62c7760a972829b3b84538`).
- Checked `/`, `/demo`, `/privacy/`, `/terms/`, the manifest, robots, sitemap, and offline page: each returned 200. Checked an unknown path: it returned 404 with the designed page.
- Confirmed the completed live demo exports a reconciler CSV containing `events,2,ORD-1001`, a PDF beginning `%PDF-1.4` containing `ORD-1001`, a JSON backup named `Sample payout PO-0822`, and a printable report.
- Confirmed the live demo and export sequence made only same-origin requests. No analytics, tracking, third-party scripts, or CDN font request was observed. No account control is present.
- Confirmed a dedicated fresh context received a live service-worker controller, reloaded `/demo` offline, retained the completed result and demo banner, and displayed the offline status. A local harness serving the exact built app confirmed an updated worker enters waiting state and displays **Update ready** with **Reload update**.
- Checked the live response headers: HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY`, Permissions-Policy, and response-header CSP with `frame-ancestors 'none'` are present. HTML uses 30-second revalidation and `/assets/*` uses immutable one-year caching.
- Checked the product-specific license verification request allowance with one client: requests 1–30 returned 200; requests 31–35 returned 429. `Retry-After` was 3 seconds for the first four 429 responses and 2 seconds for the fifth. The observed allowance is 30 requests per burst. No sign-in flow exists, so an identity-tenant check is not applicable.

## Accessibility and performance checks

- Confirmed on live `/`, `/demo`, `/privacy/`, `/terms/`, and the designed 404 page at desktop and 390 px that there is one `h1`, one `main`, no horizontal overflow, no visible target below 44 × 44 CSS px, and no console or page errors.
- Confirmed the first Tab reaches the visible Skip to main content link. Checked keyboard Enter on the primary sample action and Space on Reset demo; both work. The visible focus outline is 3 px.
- Checked light and dark routes with axe. There were zero serious or critical findings.
- Checked reduced motion: the maximum computed animation or transition duration was 0.00001 seconds.
- Checked a mobile Lighthouse report. It records performance 93, accessibility 100, best practices 100, and SEO 100; FCP 1.4 s, LCP 1.4 s, CLS 0, and TBT 310 ms. The report is `.factory/evidence/verification-5-live-lighthouse.json`. Lighthouse reported a tab-close error after writing the complete JSON report; the independent browser checks completed without errors.

## Defects by severity

### High — required browser suite is intermittent

`npm run test:e2e` does not reliably pass. The mobile `@claim:file-limits` case has a 30-second test limit while it sequentially creates and submits nine large CSV fixtures. It failed on the first normal two-worker run and again during `--repeat-each=2`, but passed alone and once in a normal run. Increase the test allowance or reduce the fixture setup cost, then confirm repeated normal two-worker runs pass. This is a release-blocking quality-gate finding.

### No other defects found

All declared claim commands, product flows, live identity checks, privacy checks, accessibility checks, PWA checks, headers, caching, and bundle-budget checks passed.
