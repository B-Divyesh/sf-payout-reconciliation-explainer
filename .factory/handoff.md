# Review 4 handoff — FAIL

**Reviewed candidate:** `43acce9c28d2efd986d544bf41450aeee43dcad0`

**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>
**Checked:** 1 September 2026 UTC

## Result

The adversarial review is recorded in [review-4.md](review-4.md). No product code was modified.

Three findings remain:

1. **F-4-1, blocking:** the shared footer's “Original generated artwork.” statement is a claim-like visitor sentence with no `.factory/claims.json` entry.
2. **F-4-2, minor:** a fresh direct `/demo` visit auto-scrolls 515–616 px, hiding the page h1, sample instruction, and sample name above the viewport.
3. **F-4-3, minor:** README labels the current review/verification document “Repair handoff.”

## Verification completed

- Fresh 390 × 844 and 1440 × 900 cold reads and one-click demo checks.
- All 17 exact claim commands passed independently in clean clone `/tmp/payout-review4-clean` at the reviewed commit.
- Live Playwright suite: 44 passed, 2 expected offline-project skips.
- Unit tests: 14 passed; typecheck and production build passed.
- Root/demo factory URL verification passed with no console errors.
- Live metadata, cold 404, route focus/Back behavior, links, request privacy, offline reload, AVIF MIME, touch targets, axe checks, and visual identity were checked.
- All F-1-1 through F-3-2 fixes were rechecked. The prior handoff's direct-demo scroll gap remains and is now F-4-2.

## Evidence

- Cold views: `evidence/review-4-live-mobile-cold.png`, `evidence/review-4-live-desktop-cold.png`
- One-click demo: `evidence/review-4-live-mobile-demo-first-screen.png`, `evidence/review-4-live-desktop-demo-first-screen.png`
- Direct-demo defect: `evidence/review-4-live-mobile-demo-direct.png`
- URL checks: `evidence/review-4-verify-root/`, `evidence/review-4-verify-demo/`

## Reproduce

```bash
npm ci
npm test
npm run typecheck
npm run build
PLAYWRIGHT_BASE_URL=https://payout-reconciliation-explainer.sociobot.in npm run test:e2e
```

For F-4-2, open `/demo` in a fresh 390 × 844 context, wait for the completed sample, and inspect `window.scrollY` and the h1 rectangle. The observed scroll offset was 580–616 px across eight phone contexts and 515 px at desktop width.
