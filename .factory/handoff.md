# Build handoff — Payout Reconciliation Explainer

Work order: `payout-reconciliation-explainer-build-1`  
Completed: 2026-08-28  
Deploy class: static PWA, `dist/`

## What was built

- A complete three-file workflow for orders/events, processor payout, and bank CSVs.
- Explicit column mapping with suggested-but-visible fields, ISO currency selection, mixed-currency rejection, source row retention, and integer minor-unit arithmetic (including zero- and three-decimal currencies).
- Transparent waterfall for orders, refunds, event fees, processor timing/file differences, payout net, and payout-to-bank variance.
- Exact payout/bank and event/payout reference checks, processor component checks, a readable rules log, and signed manual explanations for timing, bank fees, rounding, or other documented items.
- Row-level reconciler CSV, a dependency-free valid PDF accountant handoff, print layout, and portable JSON backup/import. Core reconciliation and all exports are free.
- IndexedDB draft persistence; paid Desk history and mapping presets; explicit erase controls.
- US $19 one-time Desk unlock through the Sociobot license contract. Hosted checkout and daily verification use the product slug, store only the license locally, never block the free first paint, and include paste-to-restore. Staging defaults to `pilot-api.sociobot.in`; release should set `VITE_BILLING_BASE=https://api.sociobot.in`.
- Installable manifest, 192/512/maskable icons, deterministic versioned service worker, app-shell precache, offline fallback, in-app update prompt, and an offline status message.
- Dedicated `/privacy/` and `/terms/` entries, local fonts, light/dark themes, responsive 390 px layout, keyboard/focus support, reduced motion, and print styling.
- Original generated balance-field illustration in AVIF/WebP/PNG. Source, exact prompt, provenance, and review criteria live in `.factory/design.md` and `assets/src/`.

## Run and verify

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:e2e
```

Production build command: `npm run build`  
Deployment directory: `dist/` (contains `index.html` at its root)

Verification completed against `vite preview` on 2026-08-28:

- Vitest: 3 files, 11 tests passed.
- Playwright 1.58.2: 6 passed, 2 intentionally skipped by project targeting (desktop-only offline and mobile-only 390 px checks); no failures.
- End-to-end example: 100% payout-to-bank variance explained; CSV and PDF downloads confirmed.
- Offline: service worker controlled reload passed with imported draft intact while the browser context was offline.
- Axe 4.10.3: no serious or critical findings in both light and dark result views.
- Factory `verify-url.sh`: HTTP 200, no console errors, title present, `lang=en`, exactly one `h1`, main landmark present, no missing image alt, no unlabeled buttons.
- Lighthouse 12.8.2 mobile: Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**.
- Lighthouse timings: FCP 1.4 s, LCP 1.8 s, TBT 0 ms, interactive 1.8 s, CLS 0.
- Initial transfer: 110,348 bytes across 8 requests. Built source bundle: 46.10 KB JS and 21.06 KB CSS before gzip; fonts actually requested total 79.7 KB; mobile AVIF hero 4.7 KB.
- Two consecutive production builds produced identical `index.html` and `sw.js` checksums.
- `npm audit --omit=dev`: 0 vulnerabilities.
- Visual captures and the machine-readable basic verification report are in `.factory/evidence/`.

## Known boundaries and next steps

- The workflow intentionally treats every imported row as one payout batch and one currency. Users must split unrelated periods/currencies first; the UI and README state this.
- Date values are retained verbatim for audit evidence rather than normalized, because processor and bank exports vary widely in timezone semantics.
- There are no direct Shopify, processor, bank, accounting, tax, or journal-posting integrations by design.
- The billing API cannot be end-to-end purchased from this disposable build environment. The contract, return token capture, local caching, once-per-day verify behavior, offline cached verdict, revoked-license lock, and restore UI are implemented. The factory still needs to register the test/production product and set the production billing base during release.
- Browsers expose PDF saving differently; the app also generates a direct PDF download so the handoff does not depend on print-dialog behavior.
