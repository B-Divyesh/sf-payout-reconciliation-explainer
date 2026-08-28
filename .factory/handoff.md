# Repair handoff — Payout Reconciliation Explainer

Work order: `payout-reconciliation-explainer-repair-1`

Repair commits: `6561543`, `44f5481`, `7178b96`

Deployed URL: <https://payout-reconciliation-explainer.sociobot.in>
Artifact: static offline PWA (`dist/`)

## Release decision

The static-product defects from the independent report are repaired and deployed. **Do not mark the entire work order release-ready yet:** the Sociobot billing service's verify endpoint still has no server-side rate limit, which is an external release blocker that this static repository cannot enforce.

## What changed

- The billing base now defaults to `https://api.sociobot.in` (production), not the pilot service. The deployed app embeds only the production host. `GET /api/v1/products/payout-reconciliation-explainer/checkout` returned HTTP `303` to hosted Dodo checkout on 2026-08-28 UTC. A build-time unit test locks the default checkout URL.
- Manual explanations may only reduce an outstanding bank variance. A settled payout no longer renders the adjustment form; wrong-sign and overshooting entries are rejected. The reconciliation engine now derives `balanced`/`explained` from the **remaining** variance, so a restored legacy/JSON adjustment cannot falsely claim a balanced result.
- Exact regression coverage was added for the verifier reproduction: a zero-variance reconciliation plus `+0.12` is `review`, has `-$0.12` remaining, and reports `0%`; the browser test confirms the balanced labelled example exposes no adjustment form. Valid signed explanations remain covered.
- Added Static Web Apps response policy: CSP, frame protection, permissions policy, manifest MIME type, and immutable cache policy for `/assets/*` and `/art/*`.
- Removed opacity from the waterfall entrance animation so text contrast never dips during motion. Live axe now has zero serious/critical violations.
- Fixed a live-only PWA installation bug discovered during repair: Azure consumes `staticwebapp.config.json` rather than serving it, so it must not be precached. The worker build excludes it and fails the build if it re-enters the precache shell.

## Verification evidence

Clean install and local gates:

```bash
npm ci                         # 62 packages audited, 0 vulnerabilities
npm test                       # 4 files, 14 tests passed
npm run typecheck              # passed
npm run build                  # passed; dist/index.html exists
npm run test:e2e               # 8 passed, 2 expected project-specific skips
npm audit --omit=dev           # 0 vulnerabilities
npm pack --dry-run             # passed
```

- Built bundle: 47,068 B JS and 21,050 B CSS uncompressed (under 200 KB / 50 KB budgets).
- Browser local and live desktop journey: labelled three-CSV example reconciles at 100%, CSV/PDF exports work, balanced result has no manual adjustment form, no console/page errors.
- Live 390 px browser: skip link receives first Tab focus; no horizontal overflow.
- Live axe-core scan after reconciliation: **0 serious/critical** violations.
- Live PWA: worker controlled the page; after `context.setOffline(true)`, reload retained `example-events.csv` and showed `Offline · work stays local`; no console errors.
- Live artifact identity: SHA-256 matches between local `dist/` and production for `/`, `/manifest.webmanifest`, `/offline.html`, `/sw.js`, `/privacy/`, `/terms/`, and `/robots.txt`.
- Live response policy: CSP, `Permissions-Policy`, `X-Frame-Options: DENY`, and `Referrer-Policy` are present; manifest is `application/manifest+json`; AVIF assets return `Cache-Control: public, max-age=31536000, immutable`.
- Deploy: `/opt/fleet/lib/deploy-static.sh payout-reconciliation-explainer dist` completed successfully to the existing Azure Static Web App and custom domain returned HTTP 200.

## Remaining external blocker

The factory billing API still needs a server-side limiter for verify (and checkout as appropriate), returning HTTP `429` with `Retry-After`. On 2026-08-28 UTC, a direct production burst matching the verifier's method — **100 requests at concurrency 20** to:

```text
https://api.sociobot.in/api/v1/products/payout-reconciliation-explainer/verify?license=qa-repair-burst-<n>
```

returned **100 × 200** and no `Retry-After`. This cannot be repaired in a static PWA repo without changing the shared Sociobot billing service, which is out of this work order's repository/deployment scope. The client now handles a future `429` quietly and preserves a previously verified local license where available.

The worker's skip-waiting, `clients.claim`, and in-app update-notice paths remain implemented and source-reviewed. A brand-new live worker version cannot be induced without another deployment; the installed-worker offline path was executed above.

## Run/deploy

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:e2e
/opt/fleet/lib/deploy-static.sh payout-reconciliation-explainer dist
```
