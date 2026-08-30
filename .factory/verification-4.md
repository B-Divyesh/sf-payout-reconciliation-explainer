# Independent verification 4 — PASS

**Candidate:** `0c43af415ba518bd0559bce6707135005938a462` (`docs: record pending static rollout`)

**Verified:** 2026-08-30 UTC  
**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>

## Release decision

**PASS.** The live deployment is the tested candidate and satisfies the researched brief: it is a local-first PWA for reconciling order events, one processor payout, and bank deposits from three CSVs, with transparent mappings, visible evidence, a waterfall explanation, and free CSV/PDF/print/JSON handoff exports.

No product code was changed during this verification. The former mobile-target and duplicate-alert blockers in `verification-3.md` are repaired in this candidate.

## Mandatory claims and cold first read

`.factory/claims.json` exists. From a fresh `npm ci`, every declared command was run against the product demo entry point and passed:

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
| `erase-scope` | PASS |
| `visible-reconciliation` | PASS |
| `no-integrations` | PASS |
| `build-output` | PASS |

Cold live-page result: **PASS**. The first screen plainly says “Reconcile a payout with orders and bank deposits,” names “ecommerce operators and bookkeepers,” and has the one-click **Try it with sample data** action with the result explained alongside it. Clicking it opens a completed, exportable sample reconciliation and its persistent “Demo — sample data, nothing is saved” banner, Reset demo, and Start for real controls.

## Local quality gates

- `npm ci` — PASS; 62 packages audited, no vulnerabilities.
- `npm test` — PASS; 14 tests in 4 files.
- `npm run typecheck` — PASS.
- `npm run test:e2e` — PASS; desktop and 390 px mobile suite, including its intentional duplicate-project offline skip.
- `npm run build` — PASS; static `dist/` and service worker cache revision `7b671128210b` created.
- `npm audit --omit=dev` — PASS; no vulnerabilities.
- `git diff --check` — PASS.
- Factory `verify-url.sh` — PASS for local production `/` and `/demo`: HTTP 200, title, `lang=en`, one h1, main landmark, image alt text, labelled controls, and no console errors.

Initial application JS is 52,158 bytes raw / 17,148 bytes gzip; CSS is 24,306 bytes raw / 5,872 bytes gzip, below the static-product budgets.

## Deployment identity, PWA, and headers

Fresh production `/` bytes are exactly equal to locally built `dist/index.html` (SHA-256 `2d2085edbd9dd06cf4c20644404a9dbba09cac37a0ea115294f407f6e841ef96`). Production `sw.js` also exactly equals the local build (SHA-256 `7822b2480477fdd631c5d908b822e8f2cba4ab13d16a00fc615732a9ce871ad6`). The former deployment-only stale-artifact issue is resolved.

The live service worker controls the product scope, precaches `payout-explainer-7b671128210b`, and reloaded the completed `/demo` offline with its offline status visible and no errors. A local harness using the exact built artifact then offered a byte-distinct worker: the app showed **Update ready**, exposed a waiting worker, and **Reload update** activated it, replacing the old cache without errors.

Production responses supplied CSP with response-header `frame-ancestors`, HSTS, Permissions-Policy, Referrer-Policy, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`. HTML revalidates after 30 seconds; `/assets/*` is immutable for one year. The manifest provides standalone display, versioned start URL, and any/512/maskable icons.

## Functional, privacy, and accessibility QA

- Completed sample: showed $168.62 expected payout, reported payout, and bank deposit; $0.00 remaining variance; and source evidence. Reconciler CSV, accountant PDF, print, and JSON exports worked.
- Independent real-mode case: a header-only CSV was rejected with a precise error; replacement USD order/payout/bank CSVs reconciled; a wrong-sign $0.12 explanation was rejected; the signed $-0.12 evidence note was accepted and reduced remaining variance to $0.00. No console/page errors occurred.
- Local privacy: request logging over the live demo/export flow found only same-origin requests; no analytics, tracking, third-party scripts, or CDN fonts. CSVs did not leave the browser.
- Billing verification allowance: 36 invalid-license requests from one client produced 30 HTTP 200 responses and then 6 HTTP 429 responses, each with `Retry-After: 4`. Observed allowance: 30 requests per burst. No sign-in flow exists, so Entra tenant verification is not applicable.
- Playwright + axe on live `/`, `/demo`, `/privacy/`, `/terms/`, and the 404 route at 390×844 found zero serious/critical violations, one h1 and main on each route, no horizontal overflow, and no visible interactive target under 44×44 CSS px. The first Tab focuses the visible skip link. With reduced motion, maximum computed animation/transition timing was 0.00001 s.
- Live cold page, demo, route sweep, offline reload, and update flow had no console or page errors.
- Lighthouse 13 mobile JSON report: performance 100, accessibility 100, best practices 100, SEO 100; FCP 1.4 s, LCP 1.4 s, TBT 80 ms, CLS 0. (The tool reported a tab crash while closing after it wrote the complete JSON report; the score data and independent Playwright checks completed.)

## Defects by severity

None found. No release-blocking findings remain.

