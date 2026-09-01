# Polish 3 handoff — PASS

**Review source:** `4076d790199b13ef6eaad2c6451f521601beb62b`
**Repair commits:** `0305893` (claims and restore), `4373a52` (truthful mapping help), `ca3c338` (catalog description)
**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>

## What changed

- Added `backup-roundtrip`: JSON imports now validate the backup shape, restore files/mappings/explanations, and recalculate a complete reconciliation instead of trusting a stale saved result.
- Added `calculation-rules`: browser fixtures prove refund/chargeback/return/reversal classification, negative events, absolute fees, USD/JPY/BHD minor-unit precision, source rows, and signed explanations.
- Replaced the broad trace statement with precise mapped-row wording. Removed component/reference audit messages because the app does not use them to filter or calculate a payout.
- Kept the existing distinct balance-field visual system, isolated `/demo` sandbox, real routes, legal pages, PWA, and local-first storage. Updated `.factory/claims.json`, README, copy audit, and the verb-first catalog sentence.

## Verification

- Clean clone: `npm ci`, then all 17 exact `.factory/claims.json` commands independently passed. The log ends with `ALL_CLAIM_COMMANDS_PASSED`.
- Local: `npm test` passed 14 tests; `npm run typecheck`, `npm run build`, and `npm run test:e2e` passed. The browser suite passed 46 checks across desktop and 390 px mobile.
- Accessibility: the repository’s Playwright `axe-core` integration found zero serious/critical violations on root, demo, Privacy, Terms, and 404 in light/dark and mobile/desktop. Keyboard, skip-link, focus-return, target-size, reduced-motion, and no-overflow checks passed.
- Offline/privacy: the dedicated offline context reloaded the completed demo; the privacy claim recorded only same-origin demo/export requests.
- Deployment: deployed `dist/` with `/opt/fleet/lib/deploy-static.sh payout-reconciliation-explainer dist`. Live root HTML SHA-256 is `fa46ac08900a6343306f1885512db714bb4edd50f1a0cddac7bc757851d291ae` locally and remotely. Live `sw.js` SHA-256 is `360f8d02fd0653fb8071e768488a8fb2fa5917370019daf48b773b3cd1306fcf` locally and remotely.
- Live cold check: root, `/demo`, `?demo=1`, Privacy, Terms, manifest, robots, sitemap, and offline page return 200. The designed unknown route returns 404. The hero AVIF returns `image/avif`.
- Live browser check: the complete 46-check browser suite passed with `PLAYWRIGHT_BASE_URL=https://payout-reconciliation-explainer.sociobot.in`; this includes the real backup round trip and calculation fixture.
- Lighthouse: live scores are performance 100, accessibility 100, best practices 100, and SEO 100; LCP 1.36 s, TBT 0 ms, CLS 0. Evidence: `.factory/evidence/polish-3-live-lighthouse.json`.

## Evidence and next steps

See `.factory/polish-3.md` for finding-by-finding evidence and `.factory/evidence/polish-3-live-root/` plus `.factory/evidence/polish-3-live-demo/` for cold live screenshots and reports.

Known gaps: none. The product intentionally does not connect to banks, commerce platforms, or a ledger; that is its stated privacy scope rather than missing functionality.
