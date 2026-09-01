# Perfection loop — polish round 3

Source candidate: `9034907f3fcbff332746f69bf055a2dbc59abf95`
Review source: `4076d790199b13ef6eaad2c6451f521601beb62b`
Repair commits: `0305893`, `4373a52`, and the documentation handoff commit
Live URL: <https://payout-reconciliation-explainer.sociobot.in>

## Finding map

| Finding | Change made or rechecked | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the plain job headline, named ecommerce operators and bookkeepers, and retained one primary sample action with its result. | `@claim:demo-ready`; [live root screenshot](evidence/polish-3-live-root/screenshot-mobile.png); live `/` passed the full browser suite. |
| F-1-2 | Kept the completed one-click sample with the persistent banner, reset, exit, result, and exports. | `@claim:demo-ready`; [live demo screenshot](evidence/polish-3-live-demo/screenshot-mobile.png); live `/demo`. |
| F-1-3 | Rechecked the separate `demo:payout-reconciliation-explainer` database and reset/exit isolation. | `@claim:demo-isolation`; live full browser suite; live `/demo`. |
| F-1-4 | Rechecked `/demo` and `?demo=1` direct entries. | `query-string demo entry opens the same isolated completed sample`; live `/demo` and `/?demo=1` both return 200. |
| F-1-5 | Expanded the registry from 15 to 17 claims. Every ID has exactly one tag and exact command. | Clean-clone claim matrix; `rg -o '@claim:…' tests/e2e/app.spec.ts`; live full browser suite. |
| F-1-6 | Rechecked route titles, metadata, canonical tags, focus behavior, and designed 404. | `routes set metadata, focus headings, support Back, and show the designed 404`; live `/privacy/`, `/terms/`, and `/does-not-exist` (404). |
| F-1-7 | Rechecked shared Home/Demo/Privacy/Terms navigation, h1 focus, live announcement, and skip link. | `routes set metadata, focus headings, support Back, and show the designed 404`; live full browser suite. |
| F-1-8 | Rechecked the required workbench, three-step, scope, paid, and footer order. | `@claim:no-integrations`; [live root screenshot](evidence/polish-3-live-root/screenshot-desktop.png); live `/`. |
| F-1-9 | Rechecked the deployed AVIF MIME mapping. | `curl -I /art/balance-field-720.avif` returned `content-type: image/avif`; live asset URL. |
| F-1-10 | Updated the catalog sentence and audited current product, backup, and rule copy. | `.factory/copy-audit.md`; catalog line is verb-first and 68 characters; live `/`. |
| F-2-1 | Rechecked accessible row-level source tables with mapped and original values. | `@claim:visible-reconciliation`; [live demo screenshot](evidence/polish-3-live-demo/screenshot-desktop.png); live `/demo`. |
| F-2-2 | Kept the four free exports and added a separate restore claim rather than overloading the download claim. | `@claim:free-exports`, `@claim:backup-roundtrip`; live `/demo`. |
| F-2-3 | Rechecked fixture-license history, mapping preset save/reuse, reopen, and delete behavior. | `@claim:saved-history-license`; live full browser suite. |
| F-2-4 | Rechecked that license verification sends only the token and not CSV contents. | `@claim:license-verification-privacy`; live full browser suite. |
| F-2-5 | Rechecked the product-specific hosted-checkout link with no embedded card form. | `@claim:hosted-checkout`; live `/`. |
| F-2-6 | Rechecked all six required mappings and their recovery paths. | `@claim:required-columns`; live full browser suite. |
| F-2-7 | Rechecked that the registered demo claim begins on `/` and uses one activation. | `@claim:demo-ready`; live `/` to `/demo`. |
| F-2-8 | Rechecked consistent product terms and removed stale source-mapping hints that implied unused identifier matching. | `.factory/copy-audit.md`; live `/` and `/demo`. |
| F-3-1 | Added schema checks and recalculation on backup import. Added the `backup-roundtrip` claim. Its browser flow creates files, changes a mapping, adds a valid explanation, exports, erases, imports, and proves all content and the result return. | `@claim:backup-roundtrip` passed locally, from a clean clone, and live; [live demo screenshot](evidence/polish-3-live-demo/screenshot-desktop.png); live `/`. |
| F-3-2 | Added the `calculation-rules` claim and fixtures for positive refund-like types, a negative event, positive/negative fees, USD/JPY/BHD precision, visible source rows, and a signed explanation. Replaced the overbroad trace sentence and removed unused component/reference audit messages. | `@claim:calculation-rules` passed locally, from a clean clone, and live; [live demo screenshot](evidence/polish-3-live-demo/screenshot-mobile.png); live `/demo`. |

## Verification evidence

- Clean clone: `npm ci` and all 17 exact commands in `.factory/claims.json` passed independently. The matrix records `ALL_CLAIM_COMMANDS_PASSED`.
- Local final gates: `npm test` (14), `npm run typecheck`, `npm run build`, and `npm run test:e2e` (46 checks, both viewports) passed.
- Live final gates: `PLAYWRIGHT_BASE_URL=https://payout-reconciliation-explainer.sociobot.in npm run test:e2e` passed all 46 checks. The root and worker SHA-256 values match `dist/`.
- Factory cold checks: root and demo have no console errors, one h1, one main, `lang=en`, complete image alternatives, and labelled controls. See [root evidence](evidence/polish-3-live-root/verify.json) and [demo evidence](evidence/polish-3-live-demo/verify.json).
- Accessibility: the Playwright axe integration found zero serious or critical violations across all routes, both themes, and desktop/mobile checks. The first Tab reaches the skip link; no route overflows at 390 px.
- Performance: live Lighthouse recorded 100 performance, 100 accessibility, 100 best practices, and 100 SEO; LCP 1.36 s, TBT 0 ms, CLS 0. See [live report](evidence/polish-3-live-lighthouse.json).

No finding from reviews 1–3 remains open.
