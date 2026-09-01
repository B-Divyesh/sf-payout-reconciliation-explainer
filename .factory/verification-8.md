# Independent verification 8 — PASS

**Candidate:** `459d9b03b74dc9773d76b52474311ace29f07ef1`

**Checked:** 2026-09-01 UTC

**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>

## Release result

**PASS.** The live PWA is byte-for-byte identical to the candidate artifacts checked below. Every declared claim, clean-build gate, desktop/mobile browser check, privacy check, and PWA check passed. No product code was changed during this verification.

## Mandatory first read and sample entry

A cold 1440 × 900 visit answers the required questions on the first screen:

- What it does: “Reconcile a payout with order events and bank deposits.”
- Who it serves: ecommerce operators and bookkeepers who need to explain a payout difference.
- What to do first: **Try it with sample data**, beside “See a completed reconciliation and download its accountant report.”

The same content and three facts are visible without horizontal clipping at 390 × 844. One activation opens `/demo`. The first demo viewport starts at `scrollY = 0` and shows the demo banner, completed-reconciliation heading, sample name, balance status, reset action, and real-work exit. This confirms candidate `459d9b0` closes the prior direct-demo auto-scroll finding.

## Declared claims

`.factory/claims.json` exists and contains 17 entries. After `npm ci`, every listed command was run separately before broader inspection. All 17 passed:

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

The rendered home, demo, Privacy, Terms, README, and copy audit were cross-checked against the register. No unlisted visitor-facing product promise was found.

## Clean local and live suites

```text
npm ci                         PASS — 62 packages; 0 vulnerabilities
npm test                       PASS — 4 files, 14 tests
npm run typecheck              PASS
npm run build                  PASS — dist/ and service worker be50c79ad315
git diff --check               PASS
npm audit --omit=dev           PASS — 0 vulnerabilities
npm run test:e2e               PASS — 46 passed, 2 expected project skips
PLAYWRIGHT_BASE_URL=https://payout-reconciliation-explainer.sociobot.in npm run test:e2e
                               PASS — 46 passed, 2 expected project skips
```

There is no lint script in `package.json`. The two browser-suite skips are deliberate project filters: the offline-context check runs once in Chromium and the 390 px target-size check runs once in the mobile project.

The factory URL checker passed `/` and `/demo`: HTTP 200, title, `lang=en`, one h1, main landmark, image alternatives, labeled buttons, and zero console/page errors.

## End-to-end reconciliation evidence

The completed sample visibly reconciles $200.00 of positive events less $25.00 of refunds and $6.38 of fees to a $168.62 processor payout and $168.62 of bank deposits. It exposes all mapped source rows and original values, then downloads row-level CSV, accountant PDF, print output, and JSON backup without a license.

An independent live real-work flow used two event rows, one payout row, and one bank row. The expected and reported payout were $78.00; the bank deposit was $77.50. The app:

- rejected `US` with “Choose a three-letter ISO currency code”;
- recovered after correction to `USD`;
- rejected a `+0.50` explanation because its sign opposed the `-$0.50` variance;
- accepted a `-0.50` evidence-backed explanation and reduced remaining variance to $0.00; and
- exported a reconciler CSV containing both source rows and the written evidence note.

There were no console or page errors. The passing claim suite additionally exercises files over 10 MB and 50,000 rows, missing headers, every required mapping and recovery, backup round-trip, demo/real storage isolation, paid history, erase scope, refunds/chargebacks/returns/reversals, signed fees, JPY, BHD, and persistence after reload.

## Privacy, purchase, and request allowance

A fresh live demo recorded all outgoing requests while exporting CSV, PDF, JSON, and invoking print. Requests were only the product document and three self-hosted font files. There were no off-origin requests, request bodies, external scripts, analytics, trackers, or browser errors.

The product has no sign-in, so the Entra tenant requirement does not apply. License checks use the product-specific Sociobot URL; the claim test confirms the request contains only the token query value and no CSV contents. The purchase action contains no embedded card fields or payment script. Its production URL returned HTTP 303 to Sociobot's hosted Dodo checkout.

A fresh sequential burst against the product verify endpoint returned 200 for requests 1–30. Requests 31–35 returned 429, and every limited response included `Retry-After: 4`. **Observed allowance: 30 immediate verification requests from one client per short window.**

## Deployment identity, routes, headers, and caching

Fresh live downloads match the local production build exactly:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `06b2b237640a1d13aa609e93b91cdb260c8632fab2074955cdf29637eddf7544` |
| `sw.js` | `e64d13bb16f8a9a51ab9483fc0c93413cccc29a1e7a199fa926bcf0b8a104963` |
| `main-DKq5VQ9X.js` | `6854013fb226564f359a155cd530dccc9a608389a52a09c5e5ea8b628a00aaa9` |
| `main-DL6pxrWB.css` | `2b9bfb0fa7b47297015960890366cd28dc411a7eec58c5c8d5a91010111ddd05` |

`/`, `/demo`, `/?demo=1`, `/privacy/`, `/terms/`, the manifest, robots, sitemap, offline page, and mobile hero AVIF return 200. An unknown route returns the designed page with HTTP 404. All product links resolve; the source repository returns 200 and checkout returns the expected 303.

Responses include HSTS, CSP with response-header `frame-ancestors 'none'`, `X-Content-Type-Options`, Referrer-Policy, Permissions-Policy, and `X-Frame-Options`. The manifest has the correct MIME type. HTML and `sw.js` revalidate after 30 seconds; hashed assets and art use one-year immutable caching.

## PWA and offline behavior

The manifest declares standalone display, a versioned start URL, 192 px and 512 px icons, and a 512 px maskable icon. The live service worker controls `/demo` with cache `payout-explainer-be50c79ad315`. In a dedicated fresh context, an offline reload retained the completed reconciliation and demo banner with no errors.

The update path was exercised against an unchanged local build served with two controlled worker revisions. The second worker installed and remained waiting, the app displayed **Update ready**, and **Reload update** activated it. Cache `payout-explainer-qa-v1` was replaced by `payout-explainer-qa-v2`; the completed demo remained intact and no error was logged.

## Accessibility, responsive behavior, and performance

- Axe 4.10.3 found zero serious or critical findings on Home, Demo, Privacy, Terms, and 404 at desktop and 390 px. The full suite also checks Home and Demo after switching themes.
- Every checked route has `lang=en`, one h1, one main, complete image alternatives, no horizontal overflow, and zoom is not disabled.
- Keyboard order begins with the skip link. Every traversed control shows a `3px` focus outline with `3px` offset, and Enter on the sample action opens `/demo`.
- The dialog contains focus and returns it after Escape; form errors are associated and announced; visible 390 px targets are at least 44 px.
- Reduced-motion mode matches the media query, reduces animation and transition duration to `0.01ms`, and uses `scroll-behavior: auto`.
- A direct fresh 404 produces Chromium's expected top-level 404 failed-resource diagnostic; there are no JavaScript exceptions or failed subresources on product routes and workflows.

Fresh Lighthouse 12.8.2 mobile results:

| Category or metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| First Contentful Paint | 1.4 s |
| Largest Contentful Paint | 1.4 s |
| Total Blocking Time | 80 ms |
| Cumulative Layout Shift | 0 |
| Total first-load transfer | 109 KiB across 8 requests |

The built application JavaScript is 53,580 bytes, CSS is 25,905 bytes, the three loaded local font files total about 79 KiB transferred, and the mobile hero AVIF is 4,756 bytes. All stated static-product budgets pass; the measured first load has no third-party bytes.

## Defects by severity

| Severity | Finding |
| --- | --- |
| Critical | None. |
| High | None. |
| Medium | None. |
| Low | None. |

## Known limits

The app intentionally reconciles one user-prepared payout period and sums all mapped rows. It does not connect to a bank, commerce platform, or ledger. These are visible non-goals from the researched brief, not defects.
