# Independent verification — FAIL

**Candidate:** `b72d1000195cad83bb08cb46e3da66bd9726377c` (`docs: add cold live verification evidence`)

**Verified:** 2026-08-30 UTC

**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>

**Verdict:** **FAIL — the candidate violates the mandatory 44×44 px mobile target requirement.**

This was a fresh verification from a clean checkout at the stated SHA. No product code was changed.

## Mandatory gates

### Claims

`.factory/claims.json` exists. Every listed command was run separately before the remaining QA, against the built demo entry point. All 12 passed:

| Claim | Result |
| --- | --- |
| `demo-ready` | PASS |
| `demo-isolation` | PASS |
| `local-privacy` | PASS |
| `file-limits` | PASS |
| `free-exports` | PASS |
| `offline-reload` | PASS |
| `draft-persistence` | PASS |
| `saved-history-license` | PASS |
| `erase-scope` | PASS |
| `visible-reconciliation` | PASS |
| `no-integrations` | PASS |
| `build-output` | PASS |

### Cold first read

PASS. At 1440×900 and 390×844, the first screen states:

- What it does: “Reconcile a payout with orders and bank deposits.”
- Who it is for: “For ecommerce operators and bookkeepers who need to explain a payout difference.”
- What to click: “Try it with sample data,” followed by what the click shows.

One click opened `/demo`, whose first state already showed the completed sample, `$168.62` expected/reported/deposited, `$0.00` remaining variance, the persistent “Demo — sample data, nothing is saved” banner, **Reset demo**, and **Start for real**.

## Clean local reproduction

```text
npm ci                 PASS — 62 packages audited; 0 vulnerabilities
npm test               PASS — 4 files, 14 tests
npm run typecheck      PASS
npm run build          PASS — dist/ and service worker revision 492bb2d0de7e
npm run test:e2e       PASS — 33 passed, 1 intentional duplicate-project skip
npm audit --omit=dev   PASS — 0 vulnerabilities
git diff --check       PASS
```

There is no lint script in `package.json`. The build produced 52.01 KB raw / 17.18 KB gzip JavaScript and 24.06 KB raw / 5.88 KB gzip CSS.

## Live deployment identity

Fresh live bytes matched the local `dist/` produced from the candidate:

| Path | SHA-256 |
| --- | --- |
| `/` | `ddb0bc38994a918f0e74b0fdea9f82c7181da551040562bab947dc8d5f3b6b3d` |
| `/demo/` | `9782232b9459990cd2e923b574dd1fac84b07fcc9a5d96ffddd7bc321f9e4ad9` |
| `/privacy/` | `f780161e5076226055e908739c6a6f4847f994cae324bb09a1fe335b82c512c7` |
| `/terms/` | `85c55cea4711b2ef6cee36f56ef1a35e69e6dedb11e7640bb9f0e7e384569b1d` |
| `/404.html` | `ef0c8fd187d0f9cf7e777664f7bf62795bf80678277c895c62323e1f97cee4b4` |
| `/manifest.webmanifest` | `361633265fd6b9128ca26d9909d793656afa1893f5d032822fcda264cc49a6c7` |
| `/sw.js` | `97e6a2f2d5e97e69dcf3856a26bf3ba483180b533091ebf1ca766bea9db9cccd` |
| `/assets/main-9zsg-L3s.js` | `97f01505ff35c673c90d795acae51447f9560a3fb986f0fb8a181b4d5b323f80` |
| `/assets/main-BmxtCKqK.css` | `e2e505529571aeee9910e132daab39f09e08b8284ae8e08a2e9c4d8356ce5124` |

The live deployment is the candidate, not a stale artifact.

## End-to-end product exercise

- The completed sample exposed its source filenames and row counts and downloaded a reconciler CSV containing `events,2,ORD-1001`, an accountant PDF beginning `%PDF-1.4`, and a compatible JSON backup.
- An independent USD case used `$15.00` sales, `$2.00` refunds, `$0.50` fees, a `$12.50` processor payout, and a `$12.38` bank deposit. The app showed the variance for review, rejected a `+0.12` wrong-sign explanation, rejected a `-0.13` over-explanation, accepted an evidence-backed `-0.12`, reached “The variance is explained” at 100.0%, and exported the note with a zero remaining variance.
- A header-only CSV reported that it had no data rows. A mixed EUR bank row named the file and row and instructed the user to split currencies. A two-letter currency reported “Choose a three-letter ISO currency code.” Replacing the input with valid USD evidence recovered to a balanced result.
- Exactly 10 MB was accepted; 10 MB + 1 byte was rejected. Exactly 50,000 data rows was accepted; 50,001 was rejected. Unit coverage also passed for quoted/escaped CSV, semicolon delimiters, duplicate headers, JPY/KWD precision, accounting negatives, and non-numeric cells.

## Privacy, networking, and billing

- The live completed-demo/export flow made no cross-origin request. There were no analytics, tracking, third-party scripts, or CDN fonts. The tested invalid-license action sent only a GET token query to the product-specific Sociobot verify endpoint, with no CSV data.
- The verify response allowed the product origin through CORS. An invalid token stayed local and produced the quiet “License no longer active” state while free tools remained available.
- The production checkout returned HTTP 303 to the hosted Dodo checkout. No payment-provider script is embedded in the product UI.
- A fresh 60-request verify burst from one client produced 30 × HTTP 200 and 30 × HTTP 429. Every 429 included `Retry-After: 4`. Observed allowance: 30 accepted requests in the burst.
- No sign-in flow exists, so the Entra authority check is not applicable.

## PWA, headers, caching, and performance

- The installed live worker controlled `/demo` with cache `payout-explainer-492bb2d0de7e`. After the browser was set offline, reload retained the completed reconciliation and displayed “Offline · work remains available,” with no console/page errors.
- A local HTTP harness served the exact built `dist/`, then offered a byte-distinct worker. The page displayed **Update ready**, exposed an installed waiting worker, and **Reload update** activated it and reloaded the completed demo without error.
- The manifest has standalone display, a versioned start URL, 192/512 icons, and a 512 maskable icon. The social preview is 1200×630; the touch icon is 180×180.
- Root and 404 responses carry CSP, HSTS, Permissions-Policy, Referrer-Policy, `nosniff`, frame denial, and the expected status. The manifest is `application/manifest+json`; AVIF is `image/avif`; hashed assets and artwork are immutable for one year. HTML uses 30-second revalidation.
- Lighthouse 13.0.1 mobile: performance 100, accessibility 100, best practices 100, SEO 100; FCP 1.4 s, LCP 1.4 s, TBT 40 ms, CLS 0. Initial transfer was 112,766 bytes, including 79,002 bytes of fonts and a 4,824-byte hero image.

## Accessibility and browser evidence

- The factory `verify-url.sh` passed root and demo: HTTPS 200, one h1, one main, `lang=en`, titles present, no missing alt text, no unlabeled buttons, and no console errors.
- Axe 4.10.3 found zero serious/critical violations on `/`, `/demo`, `/privacy/`, `/terms/`, and the 404 route at desktop and 390 px, including dark treatments of root and demo.
- Every checked route had one h1, one main, ordered headings, and no 390 px horizontal overflow. Route title/focus/Back behavior and the erase-dialog focus return passed the browser suite.
- Keyboard-only navigation reached the visible skip link first, then opened the sample using Enter. The normal focused skip link had a 3 px `rgb(0, 95, 204)` outline. Reduced motion computed to `0.01ms` maximum animation/transition duration and `scroll-behavior: auto`.

## Defects by severity

### P2 — Release blocker: multiple mobile touch targets are below 44×44 px

At a 390×844 viewport, fresh computed bounding boxes included:

| Interactive target | Rendered size |
| --- | ---: |
| Wordmark/home link | 118×34 px |
| Home nav link | 38×44 px |
| Demo nav link | 37×44 px |
| Terms nav link | 40×44 px |
| “Read refund terms” | 122×17 px |
| Footer Privacy | 56×25 px |
| Footer Terms | 46×25 px |
| Footer Source on GitHub | 152×25 px |

These are real visible links; hidden file inputs and non-interactive field labels are excluded. This violates the attached accessibility and design contracts, both of which require touch/click targets of at least 44×44 CSS px. Lighthouse uses a less strict target-size audit, so its 100 score does not override the explicit factory requirement.

Required remediation: add target-area padding/minimum dimensions without creating overlap, verify at 390 px, and add a browser assertion that every visible interactive target meets 44×44 px.

### P3 — Invalid explanation errors are announced twice

In the independent `$0.12` variance case, either invalid explanation created two visible `role="alert"` nodes with identical text: one in the still-rendered mapping panel and one in the explanation form. This can duplicate screen-reader announcements and repeats an error outside its form.

Required remediation: render the adjustment error only beside the adjustment form, or use separate error state for mapping and explanation failures. Associate it with the amount input using `aria-describedby`, and add a test asserting one alert.

## Release decision

**FAIL.** Functional, privacy, deployment, billing, offline, performance, and automated accessibility checks passed, but the explicit 44×44 px mobile target requirement is unmet. Re-run all claims and the measured mobile-target audit after repair.
