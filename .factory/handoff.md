# Verification handoff — PASS

**Candidate commit:** `3b6481251ad4b60d635e54aafbfc5ba591f49217`

**Verified:** 2026-09-01 UTC
**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>

## Result

**PASS.** The deployed PWA matches the candidate and meets the researched brief's local CSV reconciliation, sample-demo, privacy, export, accessibility, and offline requirements. No product code was changed in this verification.

## What was checked

- Confirmed a clean `npm ci` completed with 62 packages and `npm audit --omit=dev` reported zero vulnerabilities.
- Confirmed every one of the 15 exact commands in `.factory/claims.json` passed separately from the demo entry point: `demo-ready`, `demo-isolation`, `local-privacy`, `file-limits`, `free-exports`, `offline-reload`, `draft-persistence`, `saved-history-license`, `license-verification-privacy`, `hosted-checkout`, `required-columns`, `erase-scope`, `visible-reconciliation`, `no-integrations`, and `build-output`.
- Confirmed `npm test` passed 14/14 tests, `npm run typecheck` passed, and `npm run build` passed and produced `dist/` with service-worker revision `ddf09aa9c4d5`. No separate lint command is defined.
- Confirmed `npm run test:e2e` passed 40 checks with 2 expected project-specific offline skips in 1.8 minutes. The suite covers desktop Chromium and 390 px mobile, keyboard interaction, routes, dialogs, CSV limits, recovery, exports, privacy, storage, and offline reload.
- Confirmed the local initial application bundle is 53,757 bytes raw / 17.68 KB gzip JavaScript and 25,905 bytes raw / 6.21 KB gzip CSS, within the static-product budgets.

## Live product evidence

- Confirmed the cold first screen says what the product does, who it serves, and what to do first: it reconciles a payout with order events and bank deposits for ecommerce operators and bookkeepers; **Try it with sample data** opens the completed sample in one activation.
- Confirmed the live demo shows its persistent sample-data banner, a completed balanced result, Reset demo, Start for real, and free accountant-PDF export. Keyboard Enter on the primary sample action worked.
- Confirmed representative normal input completes on live. Checked invalid empty CSV input shows `empty.csv is empty.`, then checked valid replacement files recover to a completed reconciliation.
- Confirmed the completed demo and export path made only same-origin requests. No account control, analytics request, tracking request, third-party script, or CDN font request was observed.
- Confirmed a fresh live context receives an active service-worker controller. Checked `registration.update()` completes without error; no waiting worker is expected when the deployed revision is current. Confirmed the completed `/demo` reloads offline with the banner and balanced result intact.
- Confirmed the live root HTML SHA-256 equals local `dist/index.html`: `a8d5e049b97aebe6ad4c2b0d310a8086af9d7e9b7036b5997ab66d516f86885a`. Confirmed live `sw.js` equals local `dist/sw.js`: `e396dbc7bc086b1d9f7ffda2345d9625cffe16913e62c7760a972829b3b84538`.
- Confirmed `/`, `/demo`, `/privacy`, `/terms`, `sw.js`, the manifest, robots, sitemap, offline page, and the AVIF hero return 200. Confirmed an unknown route returns the designed 404 with status 404.
- Confirmed the response headers include CSP with response-header `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, Referrer-Policy, Permissions-Policy, and `X-Frame-Options: DENY`. Checked that HTML uses 30-second revalidation and images/assets use long-lived immutable caching.
- Confirmed the product license-verification endpoint accepts 30 requests from one client before returning `429`. Checked requests 31–35 returned `429` with `Retry-After` values of 3, 2, 2, 2, and 2 seconds.

## Accessibility and performance

- Confirmed desktop and 390 px mobile pages have no horizontal overflow, one main heading, a main landmark, `lang=en`, labelled controls, and visible 3 px focus styling. The live visual review found the first screen clear and usable at both sizes.
- Confirmed keyboard activation works for the sample action. Confirmed reduced-motion media preference is recognised and CSS reduces animation and transition durations to 0.01 ms.
- Confirmed axe returned zero serious or critical findings on the live desktop demo, mobile landing, and dark theme. Confirmed no console or page errors during the live flows.
- Confirmed a live Lighthouse run recorded Performance 100, Accessibility 100, Best Practices 100, and SEO 100; FCP 1.4 s, LCP 1.4 s, TBT 10 ms, and CLS 0. The Lighthouse runner recorded a browser-tab close after writing its complete JSON report; the recorded scores and independent Playwright checks completed successfully.

## Defects and next steps

| Severity | Finding |
| --- | --- |
| None | No release-blocking or product defects found. |

No further product work is required for this candidate. Future revisions should repeat the same claims, offline, and live deployment identity checks.
