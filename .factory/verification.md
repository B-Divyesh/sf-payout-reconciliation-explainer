# Independent verification — FAIL

**Candidate:** `09abc53c01e7380b2813e2fee92463407e88b685` (`fix: route offline fallbacks by page`)  
**Verified:** 2026-08-28 UTC  
**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>  
**Verdict:** **FAIL — do not release this candidate.**

## Exact artifact and build evidence

- Started on a clean, clean-status checkout at the candidate SHA.
- `npm ci` completed (62 packages audited; 0 vulnerabilities).
- `npm test`: **11/11** tests passed (3 files).
- `npm run typecheck`: passed.
- `npm run build`: passed; generated `dist/` and versioned `sw.js` (`payout-explainer-0c0b364326b0`).
- `npm run test:e2e`: **6 passed, 2 skipped**. The skips are project-targeted duplicate checks (desktop-only offline and mobile-only layout), not failures.
- Fresh live downloads exactly matched the locally built candidate by SHA-256 for `/`, `/manifest.webmanifest`, `/offline.html`, `/sw.js`, `/robots.txt`, `/privacy/`, and `/terms/`. This is the deployed candidate, not a stale deployment.

## Product exercise

- Desktop: the labelled three-CSV case mapped, reconciled at **100.0%**, and exported both reconciler CSV and accountant PDF. The repository test also validates the PDF starts `%PDF-1.4`.
- Invalid/recovery: an empty CSV produced `empty.csv is empty.`; a two-letter currency produced `Choose a three-letter ISO currency code.`; correcting it to USD recovered to a balanced result.
- Boundary coverage: the passing unit suite covers integer minor-unit arithmetic, zero-decimal JPY, three-decimal KWD, accounting parentheses, locale number formats, mixed-currency rejection, and non-numeric amount rejection. The UI enforces 10 MB and 50,000-row file limits.
- Mobile/live at 390 px: no horizontal overflow; keyboard Tab reached the skip link; settled axe 4.10.3 scan had **0 serious/critical** findings; no console or page errors.
- Focus and motion: live/local focus was a visible `rgb(0, 95, 204) solid 3px` outline; reduced-motion computed to `0.01ms` transition and `scroll-behavior: auto`.
- PWA: on the live site a service-worker-controlled offline reload retained `example-events.csv` and showed `Offline · work stays local`. The worker has a versioned cache, `skipWaiting`, `clients.claim`, and update-toast implementation. A truly new worker version could not be induced without changing the deployment, so only the installed-worker/offline path was executed.
- Privacy/network: a fresh normal reconciliation made no third-party requests and produced no console errors. Source review confirms CSVs/drafts use IndexedDB and only a license token/verdict uses localStorage. Fonts and assets are self-hosted.

## Release-blocking defects

### P1 — Paid checkout is unavailable, and production points at the pilot billing host

The byte-identical live artifact embeds `https://pilot-api.sociobot.in` as its billing base. The product's **Buy Desk for US $19** link therefore targets that pilot host. Fresh GET requests to both:

```
https://pilot-api.sociobot.in/api/v1/products/payout-reconciliation-explainer/checkout
https://api.sociobot.in/api/v1/products/payout-reconciliation-explainer/checkout
```

returned `404 {"error":"enabled factory product","status":404}` on 2026-08-28. A buyer cannot purchase the advertised one-time unlock. This contradicts the product's paid-unlock contract and its own launch copy.

Required remediation: register/enable the product in the billing service and deploy a production build with `VITE_BILLING_BASE=https://api.sociobot.in`; then verify a real checkout redirect and licensed restore flow.

### P1 — Financial result can be falsely labeled balanced after an unsupported manual adjustment

Reproduction on a fresh local production build:

1. Load the labelled example and run it (raw payout-to-bank variance is `$0.00`).
2. Enter a valid manual explanation of `+0.12` with a note.
3. The UI accepts it, then still shows **“The bank deposit balances”** and **100.0%** while the visible summary says **Remaining variance `-$0.12`**.

This is a contradictory accountant handoff and violates the brief's transparent, accurate evidence trail. The status calculation treats a raw variance within tolerance as balanced without considering a subsequently non-zero manual explanation.

Required remediation: prevent adjustments when no bank variance remains, or calculate balanced/explained status from the remaining variance and reject/flag over-explanations. Add regression coverage for this case.

### P1 — Required API rate limiting is absent

The license verification endpoint is a server-side product endpoint. A burst of **100 requests at concurrency 20** to:

```
https://pilot-api.sociobot.in/api/v1/products/payout-reconciliation-explainer/verify?license=qa-burst-<n>
```

returned **100 × 200**; no response returned `429` or `Retry-After`. Threshold observed: **not reached through 100 rapid requests**. This fails the stated server-endpoint acceptance requirement.

Required remediation: enforce a documented rate limit for verify (and checkout as appropriate) that returns `429` with `Retry-After`; re-test and record the observed threshold.

## Non-blocking deployment findings

- Static HTML, the manifest, AVIF, and PNG all use `Cache-Control: public, must-revalidate, max-age=30`; hashed/static assets are not immutable/long-lived as required by the PWA performance policy.
- `/manifest.webmanifest` is served as `application/octet-stream`, not `application/manifest+json` or `application/json`.
- The live response has HSTS, `Referrer-Policy`, and `X-Content-Type-Options`, but no `Content-Security-Policy`, `Permissions-Policy`, or frame-ancestors/X-Frame-Options response policy.
- Build budgets themselves pass: main JS is 46,098 bytes and CSS 21,060 bytes uncompressed (both below the 200 KB / 50 KB budgets); mobile hero AVIF is 4,756 bytes. Lighthouse execution was attempted against `vite preview` with the supplied Chromium but Lighthouse 13.4.1 terminated during full-page screenshot capture, so no new Lighthouse score is claimed.

## Re-run after remediation

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:e2e
```

Then repeat the live hash comparison, normal/offline mobile journey, actual checkout redirect/restore, and an API burst until the first `429` and `Retry-After` are recorded.
