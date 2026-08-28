# Independent verification — PASS

**Candidate:** `2a05d69e6b0187752ebc8ae2c10327695054593b` (`docs: hand off verified repair`)  
**Verified:** 2026-08-28 UTC  
**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>  
**Verdict:** **PASS — candidate satisfies the researched brief and current acceptance contract.**

This was a fresh verification from a clean checkout at the stated SHA. No product code was changed.

## Local reproducibility and gates

```text
npm ci                         PASS — 62 packages; 0 audit vulnerabilities
npm test                       PASS — 4 files, 14 tests
npm run typecheck              PASS
npm run build                  PASS — dist/ created; service worker revision d28eb7b97a17
npm run test:e2e               PASS — 8 passed, 2 expected project-target skips
npm audit --omit=dev           PASS — 0 vulnerabilities
git diff --check               PASS
```

There is no lint script in `package.json`. The build's initial source assets are 47,068 B JavaScript and 21,050 B CSS (within the 200 KB / 50 KB budgets); the mobile AVIF is 4,756 B. Lighthouse 13.4.1 was attempted with the supplied Chromium, but Chromium terminated during the run (`Browser tab has unexpectedly crashed`), so no Lighthouse score is asserted.

## Deployment identity and response policy

Fresh production SHA-256 checksums exactly equal the fresh local `dist/` output:

| Path | SHA-256 |
| --- | --- |
| `/` | `07698f6e28874f97ddaff05778320f75a8236980a018e0e4babbb82e715d5501` |
| `/manifest.webmanifest` | `361633265fd6b9128ca26d9909d793656afa1893f5d032822fcda264cc49a6c7` |
| `/offline.html` | `4d6feabd6a37d78d258f57440d9ebd4e789289c3a327a37514f9a7f94beccac9` |
| `/sw.js` | `c4690e51ca5dc18758edf0d4f75bb1ffe0748ad28f3606b608d36c0ee9e6bd81` |
| `/robots.txt` | `99388a89592b260a96cc08bbcf59998497b00bf56cbdc73d73a4dcd1b2599385` |
| `/privacy/` | `61c170f2d250267b3bd8bc61ad0d4db6912c6018771bba814ef5ab9ab025126c` |
| `/terms/` | `586321c503edd54800bd701fac6ffc5578708d1a45e7e0dd7f99202f962d0297` |

The live root is HTTP 200 with HSTS, CSP, `Permissions-Policy`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`. The manifest is `application/manifest+json`. Hashed JS and artwork use `Cache-Control: public, max-age=31536000, immutable`; HTML uses short revalidation.

## End-to-end product exercise

- Loaded the labelled three-CSV dataset, reviewed visible mappings, reconciled to **100.0%**, and downloaded `payout-2026-08-28-reconciler.csv` and `payout-2026-08-28-accountant-handoff.pdf`.
- Supplied independent events, payout, and bank CSVs with a -$0.12 bank variance. The app showed review; it rejected a +$0.12 wrong-sign explanation and a -$0.13 overstatement, then accepted an evidence-backed -$0.12 explanation and showed “The variance is explained” at 100.0%.
- Empty CSV recovery reported `empty.csv is empty.`; a two-letter currency reported `Choose a three-letter ISO currency code.`; correcting to USD recovered to a balanced result.
- A 50,001-row CSV and a 10 MB + 1 B file produced the documented limits. Passing unit coverage includes integer minor units, parentheses/locale values, JPY, KWD, mixed currencies, non-numeric cells, valid PDF structure, and the earlier unsupported-adjustment regression.

## Browser, accessibility, privacy, and PWA evidence

- Desktop and 390 × 844 mobile were exercised against production. Mobile has no horizontal overflow. The first desktop Tab focuses the skip link with a visible `rgb(0, 95, 204) solid 3px` outline.
- Reduced motion computes waterfall animation and transition durations to `0.01ms` and scroll behavior to `auto`.
- Axe-core 4.10.3 found **0 serious or critical** violations in both light and dark reconciled views. The loaded page has title, `lang=en`, exactly one `h1`, one `main`, a manifest link, and zero images without `alt`.
- Production normal-path desktop, mobile, and offline checks had no console or page errors. Normal workflow requests were only to `https://payout-reconciliation-explainer.sociobot.in`; no analytics, trackers, third-party runtime scripts, or CDN fonts were observed.
- Free-path localStorage contained only the theme preference. Source and behavior review confirm reconciliation drafts/files use IndexedDB and license token/verdict storage is localStorage only. Financial CSV data is not sent to billing.
- The installed live service worker controlled the page. With the browser offline, reload retained `example-events.csv` and displayed `Offline · work stays local`, without errors. A local static server serving the exact built `dist/` presented one new service-worker revision: the app displayed **Update ready**, exposed a waiting worker, and **Reload update** activated and reloaded it.
- The PWA manifest has standalone display, versioned start URL, matching colors, and any/512/maskable icons. Privacy and terms routes load directly.

## Billing API and rate limiting

The production buy endpoint returned HTTP **303** to hosted Dodo checkout.

A fresh burst of 100 product verify requests at concurrency 20 returned **30 × HTTP 200** and **70 × HTTP 429**. Every observed rate-limited response included `Retry-After: 4`. The observed threshold was after 30 accepted requests in this burst. This resolves the external rate-limit blocker in the earlier report. No sign-in flow exists.

## Defects by severity

### P3 — AVIF response MIME is generic

`/art/balance-field-720.avif` is served as `application/octet-stream`, rather than `image/avif`. Chromium renders it successfully, fallback assets are available, and it does not affect the verified workflow or cache policy. Configure the host MIME mapping when practical.

No P0, P1, or P2 defects were found.

## Re-run

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:e2e
```

Then compare the listed live checksums, repeat the normal/offline browser journey, and repeat the 100-request verification burst.

