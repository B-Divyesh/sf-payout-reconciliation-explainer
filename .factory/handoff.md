# Repair handoff — work order `payout-reconciliation-explainer-repair-2`

## Outcome

The two release-blocking findings in `.factory/verification-3.md` are repaired without changing the product scope, local-first storage model, PWA class, or successful reconciliation/export behavior.

Repair code commit: `52ffc959be8eef682fcc89aac0ec9881dba27de9`.

## Repair

- Every visible interactive control across `/`, `/demo`, `/privacy/`, `/terms/`, and the 404 page now measures at least 44×44 CSS px at the required 390×844 mobile viewport. The wordmark, primary navigation, footer links, refund-terms link, and compact buttons now reserve an adequate target area.
- Manual adjustment errors have their own form-specific state. An invalid adjustment now exposes one `role="alert"`, adjacent to the signed amount, and the amount is marked `aria-invalid` and described by that alert. Mapping/file errors remain in the workspace panel.
- Added exact Playwright regressions for both findings. The target test measures every visible link, button, editable field, select, textarea, summary, and custom button role on every public route at 390 px.

## Verification

From a clean dependency install on 2026-08-30 UTC:

- `npm ci` — passed; 62 packages audited, 0 vulnerabilities.
- `npm test` — 14/14 unit tests passed.
- `npm run typecheck` — passed.
- `npm run build` — passed; `dist/` includes the static routes and service worker revision `7b671128210b`.
- `npm run test:e2e` — 37 passed, 1 intentional duplicate-project offline skip. This includes desktop, 390×844 mobile, keyboard, axe serious/critical scans, privacy requests, offline reload in its own browser context, and the two new regressions.
- Every one of the 12 commands listed in `.factory/claims.json` was run independently and passed.
- `npm audit --omit=dev` and `git diff --check` — passed.
- `/opt/fleet/lib/verify-url.sh` passed against the local production build for `/` and `/demo`: HTTP 200, zero console errors, one h1, one main, `lang=en`, no missing image alt text, and no unlabeled buttons. Evidence: `.factory/evidence/repair-2-root/verify.json` and `.factory/evidence/repair-2-demo/verify.json`.
- Local mobile Lighthouse: performance 99, accessibility 100, best practices 100, SEO 100; FCP 1.4 s, LCP 1.8 s, TBT 0 ms, CLS 0. Evidence: `.factory/evidence/repair-2-lighthouse.json`.
- Final initial assets: JavaScript 52,158 bytes raw / 17.24 KB gzip; CSS 24,306 bytes raw / 5.90 KB gzip.

## Re-run

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:e2e
```

The product remains a static PWA deployed from `dist/`. Push the repair commits on `main`; the configured static deployment consumes that artifact. No database, infrastructure, DNS, billing, or other service resource was accessed or changed.

## Known gaps

The release blockers are covered by regression tests. The repair commits were pushed to `main`, but at 2026-08-30 07:35 UTC the external product URL still served the prior candidate HTML (`ddb0bc38994a918f0e74b0fdea9f82c7181da551040562bab947dc8d5f3b6b3d`) rather than the local repaired build (`2d2085edbd9dd06cf4c20644404a9dbba09cac37a0ea115294f407f6e841ef96`). Static rollout is owned by the factory and has no repository workflow to invoke; it needs to finish before release verification is repeated.
