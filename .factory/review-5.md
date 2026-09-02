# Adversarial first-read review 5 — PASS

**Reviewed:** 2026-09-02 UTC  
**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>  
**Candidate:** `1bbf0d7214b67752a1c3cc23779a89db9625b02a`  
**Contexts:** fresh Chromium at 390 × 844 and 1440 × 900; fresh clone `/tmp/payout-review5-HT3jC0/repo`.

## Verdict

**PASS.** Zero blocking findings, zero minor findings, and zero untested visitor-facing claims were found.

## Cold read before scrolling

- **What it does:** reconciles one processor payout against order events and bank deposits, then explains the difference.
- **For whom:** ecommerce operators and bookkeepers who need to explain a payout difference.
- **What to click first:** **Try it with sample data**. Its adjacent sentence promises a completed reconciliation and accountant report.

Both viewports showed the exact supporting copy before scrolling: “Reconcile a payout with order events and bank deposits.” and “For ecommerce operators and bookkeepers who need to explain a payout difference.” Mobile also showed “CSV data stays in this browser”, “No account”, and “Free exports”.

## Findings

None.

## Copy audit

Counts treat numbers, currency amounts, versions, and code spans as one word. Repeated units are listed once. Headings and actions are included so they can be checked out of context. No unit exceeds 22 words. No banned marketing adjective, jargon needing a rewrite, metaphor/mood heading, inconsistent product term, or non-result action was found.

### Landing page

| Location | Exact copy | Words | Result |
| --- | --- | ---: | --- |
| Skip link | Skip to main content | 4 | Pass |
| Wordmark | Payout Explainer | 2 | Pass |
| Header links | Home / Demo / Privacy / Terms | 4 | Pass |
| Offline status | Offline · work remains available | 4 | Pass — `offline-reload` |
| Theme control | Switch color theme | 3 | Pass |
| Hero label | Reconcile one payout | 3 | Pass |
| Hero h1 | Reconcile a payout with order events and bank deposits. | 9 | Pass |
| Hero body | For ecommerce operators and bookkeepers who need to explain a payout difference. | 12 | Pass |
| Primary action | Try it with sample data | 5 | Pass |
| Action result | See a completed reconciliation and download its accountant report. | 9 | Pass — `demo-ready`, `free-exports` |
| Secondary action | Import my CSVs | 3 | Pass |
| Hero fact | CSV data stays in this browser | 6 | Pass — `local-privacy` |
| Hero fact | No account | 2 | Pass — `local-privacy` |
| Hero fact | Free exports | 2 | Pass — `free-exports` |
| Artwork alt | Paper transaction tiles align into one settlement bar | 8 | Pass |
| Artwork label | Order events · Processor payout · Bank deposits | 6 | Pass |
| Progress | Add files / Map columns / Reconcile / Hand off | 7 | Pass |
| Workspace label | Reconciliation workspace | 2 | Pass |
| Workspace h2 | Reconcile one payout period | 4 | Pass |
| Workspace body | Use one currency and one payout period. | 7 | Pass |
| File label | Step 01 · Add evidence | 4 | Pass |
| File h2 | Add three source files | 4 | Pass |
| File body | The app reads each CSV in this browser. | 8 | Pass — `local-privacy` |
| Sample action | Try it with sample data | 5 | Pass |
| Source h3 | Order events | 2 | Pass |
| Source body | Sales, refunds, and processor fees. | 5 | Pass |
| File action | Choose order events CSV | 4 | Pass |
| Limit, 3× | Maximum 10 MB and 50,000 data rows. | 7 | Pass — `file-limits` |
| Limit, 3× | A header row is required. | 5 | Pass — `file-limits` |
| Source h3 | Processor payout | 2 | Pass |
| Source body | The batch total the processor says it sent. | 8 | Pass |
| File action | Choose processor payout CSV | 4 | Pass |
| Source h3 | Bank deposits | 2 | Pass |
| Source body | The amounts that reached the bank. | 6 | Pass |
| File action | Choose bank deposits CSV | 4 | Pass |
| Section label | Three steps | 2 | Pass |
| Section h2 | How it works | 3 | Pass |
| Step h3 | Add three CSVs | 3 | Pass |
| Step body | Choose an order events CSV, processor payout, and bank deposits CSV. | 11 | Pass |
| Step h3 | Check the column mappings | 4 | Pass |
| Step body | Confirm dates, amounts, fees, and identifiers before calculating. | 8 | Pass |
| Step h3 | Export the explanation | 3 | Pass |
| Step body | Review the waterfall, then export CSV, PDF, print, or JSON. | 10 | Pass — `free-exports` |
| Section label | Scope and privacy | 3 | Pass |
| Section h2 | What this app does not do | 6 | Pass |
| Scope item | It does not connect to banks or commerce platforms. | 9 | Pass — `no-integrations` |
| Scope item | It does not create or post ledger entries. | 8 | Pass — `no-integrations` |
| Scope item | It does not provide accounting, legal, or tax advice. | 9 | Pass; disclaimer |
| Scope item | It does not send CSV contents to a server. | 9 | Pass — `local-privacy` |
| Paid label | Optional saved-history license | 3 | Pass |
| Paid h2 | Save past reconciliations | 3 | Pass |
| Paid body | Pay US $19 once to add named history and reusable column mappings on this device. | 15 | Pass — `saved-history-license` |
| Paid body | Reconciliation and every export remain free. | 6 | Pass — `free-exports` |
| Paid action | Buy saved history for US $19 | 6 | Pass |
| Paid note | One-time purchase. | 2 | Pass — `saved-history-license` |
| Paid note | Payment opens on Sociobot’s hosted checkout. | 6 | Pass — `hosted-checkout` |
| Paid link | Read purchase terms | 3 | Pass |
| License prompt | Have a license? | 3 | Pass |
| License instruction | Paste it here | 3 | Pass |
| License action | Verify license | 2 | Pass |
| License help | Stored in this browser. | 4 | Pass — `license-verification-privacy` |
| License help | Sent to Sociobot only for license checks. | 7 | Pass — `license-verification-privacy` |
| Saved h3 | Saved reconciliations | 2 | Pass |
| Saved body | Your current draft remains after a refresh. | 7 | Pass — `draft-persistence` |
| Saved body | The license adds named history and reusable mappings. | 8 | Pass — `saved-history-license` |
| Data h3 | Back up or remove local data | 6 | Pass |
| Data body | The JSON backup restores your current files, mappings, and explanations. | 10 | Pass — `backup-roundtrip` |
| Data actions | Export JSON backup / Import JSON backup / Erase current draft | 9 | Pass |
| Dialog h2 | Erase the current draft? | 4 | Pass |
| Dialog body | This removes the active draft and its imported CSV contents. | 10 | Pass — `erase-scope` |
| Dialog body | Saved history remains. | 3 | Pass — `erase-scope` |
| Dialog actions | Erase current draft / Keep working | 5 | Pass |
| Footer | Explain one payout from local CSV files. | 7 | Pass |
| Footer | Version 1.1 · Built by Param Factory. | 6 | Pass |
| Footer links | Privacy / Terms / Source on GitHub | 5 | Pass |

Conditional landing sentences also pass: “No saved reconciliations yet.” (4), “Run one, then save it here.” (6), “Saved history is active.” (4), “Update ready” (2), and “Reload to use the newest app.” (6).

### README

| Location | Exact copy | Words | Result |
| --- | --- | ---: | --- |
| H1 | Payout Reconciliation Explainer | 3 | Pass |
| Intro | A local payout tool for small ecommerce operators and bookkeepers. | 10 | Pass |
| Intro | Reconcile order events, one processor payout, and bank deposits. | 9 | Pass |
| Link labels | Live product / Try the completed sample | 6 | Pass |
| H2 | What it does | 3 | Pass |
| Bullet | Shows a completed sample reconciliation in one click. | 8 | Pass — `demo-ready` |
| Bullet | Keeps sample work separate from real drafts. | 7 | Pass — `demo-isolation` |
| Bullet | Shows source rows and arithmetic in the result. | 8 | Pass — `visible-reconciliation` |
| Bullet | Exports a row-level CSV, accountant PDF, printable report, and JSON backup without a license. | 14 | Pass — `free-exports` |
| Bullet | Restores files, mappings, explanations, and recalculated results from a JSON backup. | 11 | Pass — `backup-roundtrip` |
| Bullet | Applies mapped-row rules for refunds, fees, currencies, and signed explanations. | 10 | Pass — `calculation-rules` |
| Bullet | Keeps the current real draft after refresh. | 7 | Pass — `draft-persistence` |
| Bullet | Reloads the completed sample offline after its first visit. | 9 | Pass — `offline-reload` |
| Bullet | Rejects CSVs without headers, above 10 MB, or above 50,000 rows. | 11 | Pass — `file-limits` |
| Bullet | Sends no CSV data, analytics, or tracking requests during reconciliation. | 10 | Pass — `local-privacy` |
| Bullet | Adds saved history and reusable mappings with an optional US $19 license. | 12 | Pass — `saved-history-license` |
| Bullet | Stores a license token here and sends it only for license checks. | 12 | Pass — `license-verification-privacy` |
| Bullet | CSV contents are excluded. | 4 | Pass — `license-verification-privacy` |
| Bullet | Opens payment on Sociobot’s hosted checkout. | 6 | Pass — `hosted-checkout` |
| Bullet | This app has no card form. | 6 | Pass — `hosted-checkout` |
| Bullet | Removes only the current draft when you confirm “Erase current draft.” | 11 | Pass — `erase-scope` |
| Body | The app has no bank connection, commerce connection, or ledger-posting action. | 11 | Pass — `no-integrations` |
| Body | This is a reconciliation aid. | 5 | Pass |
| Body | It is not accounting, legal, or tax advice. | 8 | Pass; disclaimer |
| H2 | Run locally | 2 | Pass |
| Body | Use Node.js 22 or newer. | 5 | Pass |
| Body | Open the printed URL. | 4 | Pass |
| Body | Use `/demo` for the isolated sample. | 6 | Pass — `demo-ready`, `demo-isolation` |
| H2 | Test and build | 3 | Pass |
| Body | Every visitor-facing claim is listed in `.factory/claims.json`. | 7 | Pass; cross-check below |
| Body | Each entry names the browser test that proves it. | 9 | Pass; all 17 passed |
| Body | The build writes the installable offline site to `dist/`. | 9 | Pass — `build-output` |
| Body | Playwright is pinned to version `1.58.2`. | 6 | Pass |
| H2 | CSV expectations | 2 | Pass |
| Body | Use one currency and one payout period. | 7 | Pass |
| Body | Confirm the suggested mapping before reconciling real files. | 8 | Pass |
| Bullet | Order events CSV: date and amount are required. | 8 | Pass — `required-columns` |
| Bullet | Processor payout CSV: date and net amount are required. | 9 | Pass — `required-columns` |
| Bullet | Bank deposits CSV: date and amount are required. | 8 | Pass — `required-columns` |
| Body | The `required-columns` browser test removes and repairs every required mapping. | 9 | Pass |
| H2 | Privacy and storage | 3 | Pass |
| Body | The browser’s built-in database stores the current draft, saved history, and mapping presets. | 13 | Pass — `draft-persistence`, `saved-history-license` |
| Body | Browser storage keeps the license token and latest check result. | 10 | Pass — `license-verification-privacy` |
| Link sentence | Read the product’s privacy page and terms. | 7 | Pass |
| H2 | Deployment | 1 | Pass |
| Body | Run `npm run build`, then deploy the site files in `dist/`. | 11 | Pass — `build-output` |
| Body | The factory owns infrastructure and DNS. | 6 | Pass; repository responsibility |
| Body | Purchase and license checks use product-specific Sociobot URLs. | 8 | Pass — `hosted-checkout`, `license-verification-privacy` |
| Body | The app contains no card form or payment-provider script. | 9 | Pass — `hosted-checkout` |
| H2 | Project notes | 2 | Pass |
| Link labels | Demo sandbox / Visual system / Latest handoff / MIT license | 8 | Pass |

Terminology is consistent: **order events CSV**, **processor payout**, **bank deposits CSV**, **sample data**, **saved-history license**, and **accountant report/accountant PDF**.

## Demo and sandbox behavior

- One click opened `/demo` at `scrollY = 0` with `Sample payout PO-0822`, a balanced result, exports, and the persistent demo banner.
- **Reset demo** restored the completed sample.
- The demo used `demo:payout-reconciliation-explainer`. **Start for real** deleted it and preserved the real marker `LIVE REAL MARKER`.
- The complete observed live flow made no cross-origin request. A dedicated offline context reloaded the completed demo successfully.

## Registered claims

Every exact `.factory/claims.json` command ran separately from the fresh clone.

| Claims | Result |
| --- | --- |
| `demo-ready`, `demo-isolation`, `local-privacy`, `file-limits` | PASS |
| `free-exports`, `backup-roundtrip`, `offline-reload`, `draft-persistence` | PASS |
| `saved-history-license`, `license-verification-privacy`, `hosted-checkout` | PASS |
| `required-columns`, `erase-scope`, `visible-reconciliation`, `calculation-rules` | PASS |
| `no-integrations`, `build-output` | PASS |

The live landing, demo, Privacy, Terms, and README were reread after these runs. Every product-behavior, privacy, export, storage, price, and offline statement maps to a registered claim. No unlisted claim remains.

## Earlier findings checked from scratch

| Earlier finding | Live and code confirmation |
| --- | --- |
| F-1-1 | Fixed: both cold viewports show the job, audience, one primary sample action, outcome, and three facts; source matches. |
| F-1-2 | Fixed: one click shows the completed sample, banner, Reset, Start for real, result, and exports; `demo-ready` passed. |
| F-1-3 | Fixed: live isolation preserved seeded real data; separate demo database code and `demo-isolation` passed. |
| F-1-4 | Fixed: `/demo` and `?demo=1` work; physical entry and route/query tests remain. |
| F-1-5 | Fixed: all live/README product claims are registered; all 17 exact commands passed with one tag each. |
| F-1-6 | Fixed: route metadata is complete; cold unknown URL is a designed HTTP 404; host config and assets remain. |
| F-1-7 | Fixed: shared nav, skip link, h1 focus, announcement, and Back behavior passed live and in the route test. |
| F-1-8 | Fixed: hero, workbench, three steps, scope, paid section, and footer remain in the required order. |
| F-1-9 | Fixed: live AVIF is `image/avif`; the host MIME mapping remains. |
| F-1-10 | Fixed: current source/README pass the complete audit above. |
| F-2-1 | Fixed: live source tables show filenames, rows, mapped fields, and original values; `visible-reconciliation` passed. |
| F-2-2 | Fixed: `free-exports` inspected known row evidence in CSV, PDF, print, and JSON. |
| F-2-3 | Fixed: `saved-history-license` exercised save, reload, reopen, preset reuse, and deletion. |
| F-2-4 | Fixed: live wording and `license-verification-privacy` confirm local storage and a token-only request. |
| F-2-5 | Fixed: hosted checkout wording, exact product URL, GET navigation, and absence of embedded card UI passed. |
| F-2-6 | Fixed: `required-columns` removed, rejected, repaired, and reran all six required mappings. |
| F-2-7 | Fixed: the tagged demo test begins at `/` and reaches the result in one activation. |
| F-2-8 | Fixed: standardized product terms remain in live copy and source. |
| F-3-1 | Fixed: `backup-roundtrip` restored files, changed mapping, explanation, and recalculated result. |
| F-3-2 | Fixed: `calculation-rules` covered refund types, fee signs, explanations, and USD/JPY/BHD precision. |
| F-4-1 | Fixed: “Original generated artwork.” is absent live and from product source; provenance is internal only. |
| F-4-2 | Fixed: direct demo starts at zero at both sizes with its heading/sample visible; the regression test passed live. |
| F-4-3 | Fixed: README says “Latest handoff” and the repository link resolves. |

No finding from reviews 1–4 is unfixed, partial, or regressed.

## Structure, accessibility, links, and identity

- `/`, `/demo`, `/privacy/`, and `/terms/` return 200; a cold unknown URL returns 404 with a designed recovery page.
- Each route has `lang=en`, one h1/main/header/footer, a route-specific title under 60 characters, description, canonical, OG/Twitter metadata, SVG favicon, and touch icon.
- All crawled internal routes/assets and GitHub source return 200. The checkout returns its expected 303. No dead link was found.
- Navigation and Back focus and announce the new h1. First Tab reaches the skip link.
- The full live suite passed 46 checks with two intentional duplicate offline skips: no serious/critical axe issue, console error, mobile overflow, or undersized mobile target.
- Reduced motion is handled. Built JavaScript is 53.58 KB raw and 17.54 KB gzip.
- Ruled paper, clipped transaction geometry, balance-field art, mono figures, and teal/amber/violet accents match `.factory/design.md` and are not a generic SaaS template.

The fresh clone also passed 14 unit tests, typecheck, and build. Live and built `index.html` share SHA-256 `06b2b237640a1d13aa609e93b91cdb260c8632fab2074955cdf29637eddf7544`.

## Missed leverage

None. Three CSV imports, JSON restore, four exports, and optional local history cover the brief. AI would weaken deterministic, auditable arithmetic and offline privacy. Sync and direct bank/commerce connections are explicit non-goals.

## What would make this perfect

Nothing remains from this checklist. Preserve the current artifact and rerun the claim and full browser suites after any change.
