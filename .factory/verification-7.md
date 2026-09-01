# Independent verification 7 — PASS

**Candidate:** `5e4a60acd58d8ad16d8e6ac2252b1c4e60b807f1`

**Checked:** 2026-09-01 UTC

**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>

## Release result

**PASS.** The deployed PWA matches the candidate build, every declared claim check passes after a clean install, and no release-blocking product defect was found. Product code was not changed during verification.

## First read and sample entry

Confirmed in fresh desktop and 390 px browser contexts that the first screen answers all three required questions:

- What it does: “Reconcile a payout with order events and bank deposits.”
- Who it serves: ecommerce operators and bookkeepers who need to explain a payout difference.
- What to do first: **Try it with sample data**, followed by the stated outcome of a completed reconciliation and accountant report.

Confirmed the action opens `/demo` in one activation. The sample immediately shows a completed USD reconciliation, the persistent “Demo — sample data, nothing is saved” banner, **Reset demo**, **Start for real**, source evidence, and free handoff controls.

## Declared claims

Confirmed `.factory/claims.json` is present with 17 entries. After `npm ci`, every exact listed command passed independently against the demo entry point.

| Claim | Result |
| --- | --- |
| `demo-ready` | PASS |
| `demo-isolation` | PASS |
| `local-privacy` | PASS |
| `file-limits` | PASS |
| `free-exports` | PASS |
| `backup-roundtrip` | PASS |
| `offline-reload` | PASS |
| `draft-persistence` | PASS |
| `saved-history-license` | PASS |
| `license-verification-privacy` | PASS |
| `hosted-checkout` | PASS |
| `required-columns` | PASS |
| `erase-scope` | PASS |
| `visible-reconciliation` | PASS |
| `calculation-rules` | PASS |
| `no-integrations` | PASS |
| `build-output` | PASS |

Cross-checked the rendered home, demo, Privacy, Terms, README, and copy audit against the register. No unlisted product promise was found.

## Clean local checks

- `npm ci`: passed; 62 packages installed and zero audit findings reported.
- `npm test`: passed 14/14 checks in four files.
- `npm run typecheck`: passed. There is no separate lint script.
- `npm run build`: passed and produced `dist/`; service-worker revision `a7dcd64ff734` precaches 19 files.
- `npm run test:e2e`: passed 44 checks with two expected project-specific skips across desktop and 390 px mobile.
- `PLAYWRIGHT_BASE_URL=https://payout-reconciliation-explainer.sociobot.in npm run test:e2e`: passed the same 44 live checks with two expected skips.

## End-to-end product checks

Confirmed representative normal flow from three CSV files through suggested mappings, visible rules, reconciliation, source-row evidence, and CSV/PDF/print/JSON handoff. The completed sample calculates $200.00 positive events less $25.00 refunds and $6.38 fees to the reported and deposited $168.62.

Confirmed these boundary, invalid-input, and recovery cases:

- A file larger than 10 MB, a file without usable headers, and a file with 50,001 data rows each show their specific rejection.
- Removing each of the six required date/amount mappings shows a source-specific error; restoring the mapping completes reconciliation.
- Mixed currencies, non-numeric money, duplicate headers, empty data, invalid manual-explanation sign, and an explanation above the remaining variance are rejected.
- Refund, chargeback, return, reversal, negative-event, positive/negative fee, JPY, and BHD fixtures retain the stated minor-unit rules.
- A JSON backup restores source files, a changed mapping, written evidence, and a recalculated result after the current draft is erased.
- A real draft remains after refresh. Demo reset and exit do not change a marked real draft.

Also checked the ambiguous value `10.009` in a USD column. The app treats it as a grouped value and visibly shows `$10,009.00` beside the original source value. Because USD uses two minor-unit decimals and the interpretation remains visible for review, this is recorded as a format observation rather than a defect.

## Privacy, requests, and purchase flow

Recorded the full outgoing request log in a fresh live demo while exporting CSV, PDF, JSON, and invoking print. Requests were limited to the product document and three self-hosted font files. There were no off-origin requests, request bodies, analytics requests, third-party scripts, console errors, or page errors.

Confirmed license verification sends the token only to the product-specific Sociobot URL and excludes CSV contents. Confirmed the purchase action returns HTTP 303 from the product-specific Sociobot checkout URL to its hosted payment page. The product contains no payment form. Sign-in is not required, so the identity-provider requirement does not apply.

Confirmed the product-specific license endpoint enforces a short-window allowance. A paced 40-request sequence returned 200 throughout. An immediate 80-request burst from the same client returned 25 responses with 200 and 55 with 429; every 429 included `Retry-After` of 3 or 4 seconds. After 35 seconds of recovery, a 60-request burst returned 46 responses with 200 and 14 with 429; every 429 included `Retry-After: 4`. Observed recovered burst acceptance in this run: **46 of 60 requests**. Accepted and limited responses were interleaved, so the external check does not establish a fixed sequential threshold.

## Deployment identity, routes, headers, and caching

Confirmed the checked-out candidate is exactly `5e4a60acd58d8ad16d8e6ac2252b1c4e60b807f1` before documentation updates. Live and local build files match byte-for-byte:

- `index.html`: `fa46ac08900a6343306f1885512db714bb4edd50f1a0cddac7bc757851d291ae`
- `sw.js`: `360f8d02fd0653fb8071e768488a8fb2fa5917370019daf48b773b3cd1306fcf`
- `main-BhslIdVe.js`: `ef5bad919538378ad7c7007caa4108ed1d8a6179314089fec00ec57b2dd3a392`
- `main-DL6pxrWB.css`: `2b9bfb0fa7b47297015960890366cd28dc411a7eec58c5c8d5a91010111ddd05`

Confirmed 200 responses for `/`, `/demo`, `/?demo=1`, `/privacy/`, `/terms/`, the manifest, robots, sitemap, offline page, and hero AVIF. An unknown route returns the designed page with HTTP 404. Internal links resolve, the source repository returns 200, and the purchase link returns the expected 303.

Confirmed response headers include HSTS, CSP with response-header `frame-ancestors 'none'`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `X-Frame-Options`. HTML and `sw.js` revalidate after 30 seconds. Hashed assets and product art use a one-year immutable cache policy.

## PWA and offline checks

Confirmed the manifest declares standalone display, a versioned start URL, 192 px and 512 px icons, and a 512 px maskable icon. Confirmed the active worker is `/sw.js`, controls `/`, uses cache `payout-explainer-a7dcd64ff734`, and completes `registration.update()` without an error. No waiting worker remained because the current revision was already active.

After the first online visit, a dedicated browser context was set offline and `/demo` reloaded successfully with the completed result and sample banner. No browser error was recorded.

## Accessibility and responsive behavior

The factory URL checker passed both home and demo: title, `lang=en`, one h1, main landmark, image alternatives, labeled buttons, and zero browser errors.

Independent axe checks found zero serious or critical findings on home, demo, Privacy, Terms, and 404 at desktop and 390 px mobile widths. Home and demo also passed in dark mode. Confirmed no horizontal overflow on any checked route.

Keyboard checks confirmed the skip link is first, Enter reaches `#main`, the sample action has a visible `3px` focus outline with `3px` offset, and Enter opens `/demo`. The browser suite also confirms dialog focus containment/return, associated form errors, and 44 px visible targets.

Confirmed `prefers-reduced-motion: reduce` is detected and reduces animations and transitions to `0.01 ms`. The viewport permits zoom. Responsive tables become labeled stacked rows at 390 px.

## Performance and bundle budgets

Fresh Lighthouse 12.8.2 mobile results:

| Category or metric | Result |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| First Contentful Paint | 1.4 s |
| Largest Contentful Paint | 1.4 s |
| Total Blocking Time | 120 ms |
| Cumulative Layout Shift | 0 |
| Measured theme-switch interaction duration | 48 ms |

First load transferred 113,401 bytes across eight requests, with zero third-party bytes. The built inline application JavaScript is 53,597 bytes and CSS is 25,905 bytes. The three loaded local font files transfer 79,023 bytes. The mobile hero AVIF is 4,756 bytes. All are within the product budgets.

## Defects by severity

| Severity | Finding |
| --- | --- |
| Critical | None. |
| High | None. |
| Medium | None. |
| Low | On initial `/demo` load at 390 px, automatic result scrolling positions the reconciliation title behind the 127 px sticky sample banner. The balance status and totals remain visible, and scrolling upward reveals the title. This does not block the sample or any control. |

## Known limits

The app intentionally handles one user-prepared payout period and sums all mapped rows. It does not connect to a bank, commerce platform, or ledger. These limits are stated in the interface and README and match the brief’s non-goals.
