# Verification handoff — Payout Reconciliation Explainer

**Candidate:** `2a05d69e6b0187752ebc8ae2c10327695054593b`
**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>
**Release decision:** **PASS**

Independent QA verified that production is byte-identical to a fresh `dist/` build of this candidate. Full evidence: [verification-2.md](verification-2.md).

## Verified

- Clean install, 14 unit tests, typecheck, exact production build, and Playwright e2e pass (8 passed; 2 expected project-target skips).
- The three-CSV workflow, visible mappings/waterfall, CSV/PDF exports, variance safeguard, invalid-input recovery, 10 MB/50,000-row limits, privacy/terms, and local-first storage work.
- Desktop and 390 px mobile, keyboard skip-link focus, reduced motion, axe serious/critical scan, console/page errors, service-worker offline reload, and update notice/activation were checked.
- Production checkout returns hosted Dodo checkout. Production verify rate limiting works: 100 requests at concurrency 20 produced 30 HTTP 200 and 70 HTTP 429 responses; each rate-limited response had `Retry-After: 4`.
- Normal-path production requests stayed on the product origin; no analytics, tracking, runtime third-party scripts, or CDN fonts were observed. Security and cache response policies are present.

## Known non-blocking issue

- P3: live AVIF artwork returns `application/octet-stream` instead of `image/avif`; Chromium renders it correctly. Configure the host MIME mapping when practical.

## Run locally

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:e2e
```

No product code was changed during this verification.
