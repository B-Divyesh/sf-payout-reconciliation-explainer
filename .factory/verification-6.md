# Independent verification 6 — PASS

**Candidate:** `3b6481251ad4b60d635e54aafbfc5ba591f49217`

**Checked:** 2026-09-01 UTC
**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>

## Release result

**PASS.** The production PWA matches the candidate commit and the required quality checks passed. No product code was modified during this verification.

## First read and sample sandbox

Confirmed on a cold live visit that the first screen explains the job in plain words: “Reconcile a payout with order events and bank deposits.” Confirmed it names ecommerce operators and bookkeepers as the audience. Confirmed the visible **Try it with sample data** action states the immediate result: a completed reconciliation and accountant report.

Confirmed keyboard Enter on that action opens `/demo` in one activation. Confirmed the completed sample presents the persistent “Demo — sample data, nothing is saved” banner, Reset demo, Start for real, visible balancing result, and free exports. This satisfies the required first-read and one-click-demo checks.

## Declared claims

Confirmed `.factory/claims.json` is present with 15 entries. From the clean candidate after `npm ci`, each exact declared test command passed against the product demo entry point.

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

Checked the landing-page and README product statements against this claim list. No unlisted user-facing product claim was found.

## Local quality checks

- Confirmed clean install: `npm ci` completed; 62 packages were installed and `npm audit --omit=dev` reported zero vulnerabilities.
- Confirmed unit checks: `npm test` passed 14/14 tests in four files.
- Confirmed static checks: `npm run typecheck` passed. No separate lint script is available.
- Confirmed production build: `npm run build` passed, generated `dist/`, and generated service-worker revision `ddf09aa9c4d5`.
- Confirmed complete browser suite: `npm run test:e2e` passed 40 checks with two expected project-specific skips in 1.8 minutes.
- Confirmed bundle budgets: initial application JavaScript is 53,757 bytes raw / 17.68 KB gzip; CSS is 25,905 bytes raw / 6.21 KB gzip.

## Product-flow checks

- Confirmed normal input flow: the completed sample reconciles order events, processor payout, and bank deposits and presents source evidence and exports.
- Confirmed invalid input and recovery on live mobile: an empty CSV shows `empty.csv is empty.`; valid replacement events, payout, and bank CSVs then complete the reconciliation.
- Confirmed boundary validation through the declared file-limit check: header requirement, 10 MB maximum, and 50,000-row maximum each reject the stated out-of-range input.
- Confirmed privacy: the live completed demo used only `https://payout-reconciliation-explainer.sociobot.in` requests. No account control, analytics, tracker, third-party script, or CDN font request was observed.
- Confirmed PWA behavior: a fresh live context installed and controlled the active worker; `registration.update()` completed without error and reported no waiting worker for the current revision. After the first visit, a dedicated offline context reloaded `/demo` with the completed result and demo banner present.
- Confirmed license allowance: the product verification endpoint returned 200 for requests 1–30 from one client, then returned `429` for requests 31–35. `Retry-After` was 3 seconds on request 31 and 2 seconds on requests 32–35. Observed allowance: 30 requests per burst.

## Deployment, routes, and headers

- Confirmed live `index.html` exactly matches local `dist/index.html`: SHA-256 `a8d5e049b97aebe6ad4c2b0d310a8086af9d7e9b7036b5997ab66d516f86885a`.
- Confirmed live `sw.js` exactly matches local `dist/sw.js`: SHA-256 `e396dbc7bc086b1d9f7ffda2345d9625cffe16913e62c7760a972829b3b84538`.
- Confirmed `/`, `/demo`, `/privacy`, `/terms`, `sw.js`, the manifest, robots, sitemap, offline page, and hero AVIF return 200. Confirmed an unknown route returns the designed 404 with status 404.
- Confirmed HSTS, CSP with response-header `frame-ancestors 'none'`, `X-Content-Type-Options`, Referrer-Policy, Permissions-Policy, and `X-Frame-Options` are present. Checked HTML has 30-second revalidation and assets/images have one-year immutable caching.

## Accessibility, responsive behavior, and performance

- Confirmed desktop and 390 px mobile have no horizontal overflow. Confirmed a single h1, a main landmark, `lang=en`, readable controls, visible 3 px focus, and keyboard activation for the primary demo action.
- Confirmed the live 390 px first screen remains clear: headline, audience sentence, sample action, outcome, and the three plain facts appear without horizontal clipping.
- Confirmed axe found zero serious or critical findings on live desktop demo, mobile landing, and dark-theme landing. Confirmed no console or page errors on these flows.
- Confirmed reduced-motion media preference is detected and CSS reduces animations and transitions to 0.01 ms.
- Confirmed live Lighthouse recorded Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.4 s, LCP 1.4 s, TBT 10 ms, CLS 0. The runner logged a browser-tab close after writing its JSON report; this did not affect the captured audit result or the independent browser checks.

## Defects by severity

| Severity | Finding |
| --- | --- |
| None | No defects found. |
