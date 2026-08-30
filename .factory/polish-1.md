# Perfection loop — polish round 1

Source candidate: `2a05d69e6b0187752ebc8ae2c10327695054593b`  
Review source: `c03e594f3d2d0a274f5eabbb33aebc888c35d677`  
Target: <https://payout-reconciliation-explainer.sociobot.in>

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Replaced the metaphor headline with the prescribed reconciliation job. Named ecommerce operators and bookkeepers. Made “Try it with sample data” the only filled first action, with its outcome beside it. Kept “Import my CSVs” as a quiet link and added three tested facts. | `landing reaches the completed demo in one click`; `.factory/evidence/polish-1-landing-mobile.png`; live `/` |
| F-1-2 | The primary action now opens an already reconciled sample with waterfall, balanced status, and four export actions. Added the persistent demo banner, Reset demo, and Start for real. | `@claim:demo-ready`; `.factory/evidence/polish-1-demo-mobile.png`; live `/demo` |
| F-1-3 | Added `demo:payout-reconciliation-explainer` as a separate IndexedDB database. Reset deletes only that database. Leaving demo deletes it and loads the untouched real database. Demo theme storage is also namespaced. | `@claim:demo-isolation`; `.factory/demo.md`; live `/demo` reset/exit check |
| F-1-4 | Added a physical `demo/index.html`, `/demo` host rewrite, service-worker route, sitemap entry, README link, and working `?demo=1` parser. | `@claim:demo-ready`; `query-string demo entry opens the same isolated completed sample`; live `/demo` and `/?demo=1` |
| F-1-5 | Added `.factory/claims.json` with 12 claims. Each has exactly one tagged observable test. Removed or rewrote unbounded marketing claims. | Every `npm run test:e2e -- --project=chromium --grep @claim:<id>` command passes from the clean clone; full suite passes |
| F-1-6 | Added route-specific titles, descriptions, canonicals, Open Graph, Twitter metadata, 1200×630 product art, and a 180 px touch icon. Added a styled geometric 404 and host-level 404 override. | `routes set metadata, focus headings, support Back, and show the designed 404`; SWA emulator: unknown URL is HTTP 404; live metadata and `/does-not-exist` |
| F-1-7 | Added Home, Demo, Privacy, and Terms to the shared header. Internal navigation uses History API. Route changes and Back focus the destination h1 and update the polite live region. | `routes set metadata, focus headings, support Back, and show the designed 404`; `erase dialog contains focus and returns it after Escape` |
| F-1-8 | Added “How it works” with three concrete steps. Added “What this app does not do” before the paid section. | `@claim:no-integrations`; landing screenshots; live `/` |
| F-1-9 | Added `.avif: image/avif` to the Static Web Apps MIME map. | SWA emulator `HEAD /art/balance-field-720.avif` and `HEAD /art/balance-field.avif` return `Content-Type: image/avif`; live header checks |
| F-1-10 | Replaced slogan and desk language, standardized order events CSV / processor payout / bank deposit / sample data / saved-history license, and rewrote README. Added the required copy audit. | `.factory/copy-audit.md`; `rg` terminology check; landing screenshots |

## Earlier verification items checked again

| Earlier item | Current evidence |
| --- | --- |
| Production billing base | Unit test `uses the production Sociobot billing host by default`; browser claim `@claim:saved-history-license` checks the exact checkout URL without contacting it. |
| False balanced status after adjustment | Unit tests `never marks a settled payout balanced after an unsupported adjustment` and `rejects manual explanations that reverse or overstate the remaining variance`. |
| Rate-limit handling | Existing license code retains its explicit HTTP 429 state. No separate billing resource was contacted, as required by the work-order boundary. |
| AVIF MIME P3 | Resolved by F-1-9 and checked in the SWA emulator and live site. |

## Verification evidence

- Unit: 14 passing.
- Browser: 33 passing across desktop Chromium and 390×844 mobile; one intentional mobile duplicate of the dedicated offline-context test is skipped.
- Accessibility: serious/critical axe checks pass in light and dark themes on `/`, `/demo`, `/privacy/`, `/terms/`, and 404.
- Offline: `@claim:offline-reload` passes in a dedicated browser context.
- Static host: `/demo` is 200, unknown paths are 404 with the designed page, and AVIF responses use `image/avif`.
- Clean clone: all 12 claim commands passed at `11432886c9d101453bdd6379bd388268bee7bb18`.
- Live cold checks: `/`, `/demo`, `/?demo=1`, `/privacy/`, and `/terms/` return 200. `/does-not-exist` returns 404 with the designed page.
- Live demo: the banner and completed result render at 390×844; CSV, PDF, and JSON downloads complete; reset and exit remove the demo database.
- Live privacy: the checked demo flow issued only same-origin requests and logged no browser errors.
- Live performance: Lighthouse mobile scored 100 in performance, accessibility, best practices, and SEO; LCP 1.4 s, CLS 0, TBT 0 ms.
- Screenshots: `.factory/evidence/polish-1-landing-desktop.png`, `.factory/evidence/polish-1-landing-mobile.png`, `.factory/evidence/polish-1-demo-mobile.png`.

No review finding remains open.
