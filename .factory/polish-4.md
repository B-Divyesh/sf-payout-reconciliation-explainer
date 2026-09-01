# Perfection loop — polish round 4

- Source candidate: `43acce9c28d2efd986d544bf41450aeee43dcad0`
- Review source: `d3b6bbd805fb1f9a4efc814010d115513f2e03de`
- Repair commit: `459d9b0`
- Live URL: <https://payout-reconciliation-explainer.sociobot.in>

## Finding map

| Finding | Change made or rechecked | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the nine-word job headline, named ecommerce operators and bookkeepers, and retained one primary sample action with its result. | `@claim:demo-ready`; [cold live root](evidence/polish-4-live-root/screenshot-mobile.png); live `/`. |
| F-1-2 | Rechecked the one-click completed sample, persistent demo banner, reset, exit, balanced result, and exports. | `@claim:demo-ready`; [live demo](evidence/polish-4-live-demo/screenshot-mobile.png); live `/demo`. |
| F-1-3 | Rechecked the separate `demo:payout-reconciliation-explainer` database and reset/exit isolation from real data. | `@claim:demo-isolation`; live `/demo`. |
| F-1-4 | Rechecked direct `/demo` and `?demo=1` entry. The new initial-position test also covers desktop and phone. | `query-string demo entry opens the same isolated completed sample`; `direct demo entry keeps its heading and sample name in the initial viewport`; live `/demo` and `/?demo=1`. |
| F-1-5 | Audited `.factory/claims.json`: all 17 IDs occur exactly once in the browser suite and every exact command passed independently from a clean clone. | Clean clone `/tmp/payout-polish4-clean-2Mqk21`; `ALL_CLAIM_COMMANDS_PASSED`. |
| F-1-6 | Rechecked route-specific titles, descriptions, canonicals, social metadata, touch icon, and the designed HTTP 404. | `routes set metadata, focus headings, support Back, and show the designed 404`; live `/privacy/`, `/terms/`, and `/does-not-exist` (404). |
| F-1-7 | Rechecked shared navigation, skip link, h1 focus, polite route announcement, and Back behavior. | Route/focus browser test; live two-viewport suite. |
| F-1-8 | Rechecked the landing order: first screen, workbench, three-step explanation, scope/privacy, paid section, and footer. | `@claim:no-integrations`; [live root](evidence/polish-4-live-root/screenshot-desktop.png). |
| F-1-9 | Rechecked both host configuration and the deployed response type. | Live `/art/balance-field-720.avif` returned `200 image/avif`. |
| F-1-10 | Kept consistent product terms and refreshed the sentence audit after removing the footer provenance line. | `.factory/copy-audit.md`; live root/demo text; banned-word scan. |
| F-2-1 | Rechecked three accessible row-level evidence tables with filenames, row numbers, mapped fields, and original values. | `@claim:visible-reconciliation`; live `/demo`. |
| F-2-2 | Rechecked the free row-level CSV, accountant PDF, printable report, and JSON backup contents. | `@claim:free-exports`; live `/demo`. |
| F-2-3 | Rechecked licensed save, reload, reopen, preset reuse, and deletion. | `@claim:saved-history-license`; clean-clone and live runs. |
| F-2-4 | Rechecked that license verification sends only the token and excludes CSV contents. | `@claim:license-verification-privacy`; clean-clone and live runs. |
| F-2-5 | Rechecked the product-specific hosted checkout and absence of embedded payment fields or scripts. | `@claim:hosted-checkout`; live root. |
| F-2-6 | Rechecked all six required source mappings and each recovery path. | `@claim:required-columns`; clean-clone and live runs. |
| F-2-7 | Rechecked that the registered demo claim starts at `/` and reaches a complete demo in one activation. | `@claim:demo-ready`; live root to demo. |
| F-2-8 | Rechecked consistent “order events,” “processor payout,” “bank deposits,” “sample data,” and “saved-history license” wording. | `.factory/copy-audit.md`; live root, Privacy, and Terms. |
| F-3-1 | Rechecked backup export/import with files, changed mapping, explanation, and recalculated result. | `@claim:backup-roundtrip`; clean-clone and live runs. |
| F-3-2 | Rechecked refund types, fee signs, USD/JPY/BHD precision, visible rows, and a signed explanation. | `@claim:calculation-rules`; clean-clone and live runs. |
| F-4-1 | Removed “Original generated artwork.” from the shared footer and copy audit. Kept internal asset provenance in `.factory/design.md` without making a visitor-facing claim. | Full live route crawl and `rg` absence check; [live root](evidence/polish-4-live-root/screenshot-desktop.png). |
| F-4-2 | Initial demo seeding no longer scrolls to the results. Explicit reset/recalculate actions retain result scrolling. Added a fresh-context test for both configured viewports. | `direct demo entry keeps its heading and sample name in the initial viewport`; [mobile](evidence/polish-4-live-demo-direct-mobile.png); [desktop](evidence/polish-4-live-demo-direct-desktop.png); live scrollY `0` at both sizes. |
| F-4-3 | Renamed the README link from “Repair handoff” to “Latest handoff.” | `README.md`; repository link check. |

## Verification evidence

- Clean clone: `npm ci` completed with zero audit findings. All 17 exact claim commands passed separately.
- Local gates: 14 unit tests passed; typecheck and build passed; the full browser suite reported 46 passed and 2 intentional offline duplicates skipped.
- Live gates: the full browser suite reported the same 46 passed and 2 skipped. It includes axe serious/critical checks across all routes, both themes, and both viewports.
- Factory verifier: root and demo have one h1, one main, `lang=en`, complete image alternatives, labelled buttons, and no console errors. See [root](evidence/polish-4-live-root/verify.json) and [demo](evidence/polish-4-live-demo/verify.json).
- Live routes: `/`, `/demo`, `/?demo=1`, `/privacy/`, and `/terms/` return 200; `/does-not-exist` returns 404; AVIF returns `image/avif`.
- Live integrity: deployed and local `index.html` SHA-256 values both equal `06b2b237640a1d13aa609e93b91cdb260c8632fab2074955cdf29637eddf7544`.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.4 s, TBT 0 ms, CLS 0. See [report](evidence/polish-4-live-lighthouse.json).
- Production assets: JavaScript is 53.58 KB raw / 17.54 KB gzip; CSS is 25.91 KB raw / 6.21 KB gzip.

No finding from reviews 1–4 remains unresolved.
