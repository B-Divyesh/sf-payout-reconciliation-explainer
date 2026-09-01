# Adversarial first-read review 2 — FAIL

**Reviewed:** 1 September 2026 UTC  
**Candidate:** `76dc171a5053a10ebc14542372fda4a3cabc45f4`  
**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>  
**Contexts:** fresh Chromium contexts at 390 × 844 and 1440 × 900; clean temporary clone for every claim command.

## Verdict

**FAIL.** The first screen, demo, routes, offline behavior, visual identity, and automated quality gates work. The product still has eight findings. Seven concern claim accuracy or claim-test coverage. One is an incompletely resolved copy finding from review 1. There is no basis for PASS while a visitor-facing claim remains unconfirmed.

## Cold read before scrolling

### 390 px phone

- **What does it do?** It reconciles one payout against orders and bank deposits.
- **For whom?** Ecommerce operators and bookkeepers explaining a payout difference.
- **What should I click first?** **Try it with sample data**. The adjacent sentence says it opens a completed reconciliation and exportable handoff.

All three answers were available before scrolling. The primary action began at 418 px and the three short facts ended at 656 px. The page had no horizontal overflow and no console errors.

### 1440 px desktop

The same three answers were clear before scrolling. The primary action, its outcome, the secondary import link, and all three facts were visible in the 900 px viewport. There were no console errors.

## Findings

### F-2-1 — BLOCKING — “Visible source rows” are not visible, and the claim test checks only filenames and counts

**Exact claim:** README: “Shows source rows and arithmetic in the result.” Claims registry: “The sample reconciles order events, the processor payout, and the bank deposit with visible source rows.”

**Observed location:** `/demo` → **Mapped source evidence**.

**Observed result:** the disclosure contains only:

- `Order events: sample-events.csv · 3 rows`
- `Processor payout: sample-payout.csv · 1 rows`
- `Bank deposit: sample-bank.csv · 2 rows`

It does not show `ORD-1001`, a source date, a source amount, an original value, or a source row number. The tagged `@claim:visible-reconciliation` test asserts totals, filenames, and row counts only.

**Why this fails:** A visitor cannot inspect the source rows that the copy promises. The passing test does not check the promised outcome.

**Concrete fix:** Render an accessible source-evidence table with each original row, source filename, row number, mapped fields, and original values. Change the tagged test to assert a known row such as `sample-events.csv`, row 2, `ORD-1001`, `2026-08-18`, and `120.00`. If row display is not intended, rewrite both claims to “Shows source filenames and row counts.”

### F-2-2 — BLOCKING — The export claim says row evidence is preserved, but the PDF and print checks do not confirm it

**Exact claim:** `.factory/claims.json`: “CSV, accountant PDF, print, and JSON exports are free and preserve row evidence.”

**Observed result:** The sample PDF was 3,081 bytes and contained `sample-events.csv`, but it did not contain `ORD-1001`. The PDF generator writes source filenames and row counts, not source rows. The tagged test checks one CSV row, the PDF signature `%PDF-1.4`, one JSON name, and whether `window.print` was called. It does not check row evidence in the PDF, print view, or JSON.

**Why this fails:** The plural claim applies “preserve row evidence” to all four exports. The implementation and test establish that only some outputs preserve row-level data.

**Concrete fix:** Either include source row identifiers and values in the PDF and printable report, then inspect those values in the tagged test, or narrow the claim to: **“Export a row-level CSV, a summary PDF, a printable report, and a JSON backup for free.”** Test the promised content of each output.

### F-2-3 — BLOCKING — The paid-feature claim is not exercised by its tagged test

**Exact claim:** “US $19 once adds named history and reusable mappings; reconciliation and exports remain free.”

**Observed test:** `@claim:saved-history-license` confirms the displayed price, checkout URL, free-scope sentence, and a mocked valid license response. It stops after “Saved history is active.” It does not save, name, reopen, or delete a reconciliation. It does not save or reuse a mapping.

**Why this fails:** The test confirms activation copy, not either feature sold for US $19.

**Concrete fix:** In the tagged test, activate the fixture license, complete a real-mode reconciliation, save it under a name, reload and reopen it, save a changed mapping preset, start another draft, and apply that preset. Inspect the history and preset IndexedDB records as evidence.

### F-2-4 — BLOCKING — “The token stays in this browser” is unlisted and contradicts verification behavior

**Exact quote/location:** landing license form: “The token stays in this browser.”

**Code evidence:** `src/lib/license.ts` stores the token in localStorage and sends it in `GET https://api.sociobot.in/api/v1/products/payout-reconciliation-explainer/verify?license=…` when the visitor selects **Verify license**. The Privacy page correctly says verification sends the token to the billing API.

**Why this fails:** “Stays in this browser” normally means the token does not leave the browser. That is not true during verification. No claim entry states or tests this data flow.

**Concrete fix:** Replace it with **“Stored in this browser. Sent to Sociobot only when you verify it.”** Add a claim test that records the verification request, confirms only the token is sent, and confirms no CSV or reconciliation data is included.

### F-2-5 — BLOCKING — The merchant-of-record statement is an unlisted claim

**Exact quotes/locations:** landing and Terms: “Sociobot/Dodo is the merchant of record.” Privacy: “Sociobot and Dodo process payment details on their hosted pages.”

**Observed coverage:** The saved-license test confirms the product-specific Sociobot checkout URL and checks that no `dodo` link is embedded. It does not confirm the legal merchant role or the payment-data statement.

**Why this fails:** These are payment and data-handling statements a buyer may rely on, but neither appears as a claim with an observable test.

**Concrete fix:** Prefer the plain, observable sentence **“Payment opens on Sociobot’s hosted checkout.”** Add a tagged test that confirms the checkout response redirects to the expected hosted checkout without loading payment scripts in the app. Keep legal merchant wording only where its source of truth can be verified.

### F-2-6 — BLOCKING — README mapping requirements are unlisted claims

**Exact quotes:**

- “Order events CSV: date and amount are required.”
- “Processor payout CSV: date and net amount are required.”
- “Bank deposit CSV: date and amount are required.”

**Observed coverage:** No `.factory/claims.json` entry or tagged browser test checks these three required-field combinations or the recovery path after a missing mapping.

**Why this fails:** These import requirements directly affect whether a visitor can complete the job. They are visitor-facing claims without a registry entry.

**Concrete fix:** Add one `required-columns` claim and tagged test that omits each required mapping in turn, confirms the specific error, repairs the mapping, and reaches a result. Otherwise remove these requirements from visitor-facing copy.

### F-2-7 — BLOCKING — The listed demo claim command does not test “one click”

**Exact claim:** “Try sample data in one click and see a completed reconciliation.”

**Observed coverage:** The tagged `@claim:demo-ready` test navigates directly to `/demo`. The separate untagged test `landing reaches the completed demo in one click` checks the landing action, but the exact command in `claims.json` uses `--grep @claim:demo-ready` and excludes it.

**Why this fails:** An independent verifier running only the registered command does not confirm the “one click” part of the claim.

**Concrete fix:** Merge the landing-click assertion into the single tagged test: open `/`, select **Try it with sample data** once, assert `/demo`, the banner, completed totals, and exports. Keep a separate untagged direct-route test if desired.

### F-2-8 — BLOCKING — F-1-10 is only partly fixed: terms still vary and several phrases are vague or technical

**Carried finding:** F-1-10.

**Exact locations:**

- Hero: “Reconcile a payout with **orders** and **bank deposits**.” The input and terminology table use “**Order events**” and singular “**Bank deposit**.”
- Privacy: “**Erase local work** clears only the current draft.” The actual control is **Erase current draft**.
- Hero outcome: “exportable handoff” does not name the actual accountant PDF/report.
- Hero fact: “Works on this device” does not say whether this means local processing, persistence, or offline use.
- License status: “Free tools are ready” does not name the available tools.
- README: “static PWA”, “configured static artifact”, “IndexedDB”, “localStorage”, and “Sociobot billing contract” are unexplained technical terms.
- Landing and Terms: “merchant of record” is unexplained payment jargon.

**Why this fails:** Review 1 required one term for each concept and plain standalone copy. Most of F-1-10 was repaired, but these variants and vague phrases remain. Under the review instructions, a half-fixed earlier finding is blocking again.

**Concrete fix:** Use **“Reconcile a payout with order events and bank deposits.”** Standardize the input and README to “bank deposits.” Replace the Privacy instruction with **“‘Erase current draft’ clears only the current draft.”** Replace the hero outcome with **“See a completed reconciliation and download its accountant report.”** Replace “Works on this device” with **“CSV data stays in this browser.”** Delete the redundant “Free tools are ready.” Explain implementation terms in the README, for example: **“The build writes the installable offline site to `dist/`.”**

## Copy audit

Counts exclude punctuation. Repeated text is listed once with its repetition count. `C` means a claim issue, `I` inconsistent terminology, `J` unexplained jargon, and `V` vague copy. There are no sentences over 22 words and no banned marketing adjectives.

### Landing page and shared chrome

| Location | Exact copy | Words | Result |
| --- | --- | ---: | --- |
| Skip link | Skip to main content | 4 | Pass |
| Wordmark | Payout Explainer | 2 | Pass |
| Header links | Home / Demo / Privacy / Terms | 1 / 1 / 1 / 1 | Pass |
| Theme control name | Switch color theme | 3 | Pass |
| Hero label | Reconcile one payout | 3 | Pass |
| Hero h1 | Reconcile a payout with orders and bank deposits. | 8 | I — F-2-8 |
| Hero body | For ecommerce operators and bookkeepers who need to explain a payout difference. | 12 | Pass |
| Primary action | Try it with sample data | 5 | Pass |
| Action outcome | See a completed reconciliation and exportable handoff. | 7 | J — F-2-8 |
| Secondary action | Import my CSVs | 3 | Pass |
| Hero fact | Works on this device | 4 | V — F-2-8 |
| Hero fact | No account | 2 | Pass; covered by local-privacy test |
| Hero fact | Free exports | 2 | C — see F-2-2 |
| Artwork label | Order events · Processor payout · Bank deposit | 6 | I — F-2-8 |
| Progress steps | Add files / Map columns / Reconcile / Hand off | 7 | Pass |
| Workspace label | Reconciliation workspace | 2 | Pass |
| Workspace h2 | Reconcile one payout period | 4 | Pass |
| Workspace body | Use one currency and one payout period. | 7 | Pass |
| File label | Step 01 · Add evidence | 4 | Pass |
| Files h2 | Add three source files | 4 | Pass |
| Files body | The app reads each CSV in this browser. | 8 | Covered by local-privacy |
| Sample action | Try it with sample data | 5 | Pass |
| Input h3 | Order events | 2 | Pass |
| Input body | Sales, refunds, and processor fees. | 5 | Pass |
| Input action | Choose order events CSV | 4 | Pass |
| Input h3 | Processor payout | 2 | Pass |
| Input body | The batch total the processor says it sent. | 8 | Pass |
| Input action | Choose processor payout CSV | 4 | Pass |
| Input h3 | Bank deposit | 2 | I — F-2-8 |
| Input body | The amount that reached the bank. | 6 | Pass |
| Input action | Choose bank deposit CSV | 4 | I — F-2-8 |
| File limit, 3× | Maximum 10 MB and 50,000 data rows. | 7 | Covered by file-limits |
| Header rule, 3× | A header row is required. | 6 | Covered by file-limits |
| Section label | Three steps | 2 | Pass |
| Section h2 | How it works | 3 | Pass |
| Step h3 | Add three CSVs | 3 | Pass |
| Step body | Choose an order events CSV, processor payout, and bank deposit. | 10 | I — F-2-8 |
| Step h3 | Check the column mappings | 4 | Pass |
| Step body | Confirm dates, amounts, fees, and identifiers before calculating. | 8 | Pass |
| Step h3 | Export the explanation | 3 | Pass |
| Step body | Review the waterfall, then export CSV, PDF, print, or JSON. | 10 | Pass |
| Section label | Scope and privacy | 3 | Pass |
| Section h2 | What this app does not do | 6 | Pass |
| Scope item | It does not connect to banks or commerce platforms. | 9 | Covered by no-integrations |
| Scope item | It does not create or post ledger entries. | 8 | Covered by no-integrations |
| Scope item | It does not provide accounting, legal, or tax advice. | 9 | Pass; limitation |
| Scope item | It does not send CSV contents to a server. | 9 | Covered by local-privacy |
| Paid label | Optional saved-history license | 3 | Pass |
| Paid h2 | Save past reconciliations | 3 | C — F-2-3 |
| Paid body | Pay US $19 once to add named history and reusable column mappings on this device. | 15 | C — F-2-3 |
| Paid body | Reconciliation and every export remain free. | 6 | C — F-2-2 |
| Paid action | Buy saved history for US $19 | 6 | Pass |
| Paid note | One-time purchase. | 2 | Covered by saved-history-license |
| Paid note | Sociobot/Dodo is the merchant of record. | 6 | C, J — F-2-5/F-2-8 |
| Paid link | Read refund terms. | 3 | Pass |
| Status | Free tools are ready. | 4 | V — F-2-8 |
| License label | Have a license? | 3 | Pass |
| License label | Paste it here. | 3 | Pass |
| License action | Verify license | 2 | Pass |
| License help | The token stays in this browser. | 6 | C — F-2-4 |
| Saved-work h3 | Saved reconciliations | 2 | Pass |
| Saved-work body | Your current draft remains after a refresh. | 8 | Covered by draft-persistence |
| Saved-work body | The license adds named history and reusable mappings. | 8 | C — F-2-3 |
| Data h3 | Back up or remove local data | 6 | Pass |
| Data body | The JSON backup contains your current files, mappings, and explanations. | 10 | C — F-2-2 |
| Data actions | Export JSON backup / Import JSON backup / Erase current draft | 9 | Pass |
| Dialog h2 | Erase the current draft? | 4 | Pass |
| Dialog body | This removes the active draft and its imported CSV contents. | 10 | Covered by erase-scope |
| Dialog body | Saved history remains. | 3 | Covered by erase-scope |
| Dialog actions | Erase current draft / Keep working | 5 | Pass |
| Footer | Explain one payout from local CSV files. | 7 | Pass |
| Footer | Original generated artwork. | 3 | Provenance is documented in `.factory/design.md` |
| Footer | Version 1.1 · Built by Param Factory. | 6 | Pass |
| Footer links | Privacy / Terms / Source on GitHub | 1 / 1 / 3 | Pass |

### README

| Location | Exact copy | Words | Result |
| --- | --- | ---: | --- |
| H1 | Payout Reconciliation Explainer | 3 | Pass |
| Intro | A local payout tool for small ecommerce operators and bookkeepers. | 10 | Pass |
| Intro | Reconcile order events, one processor payout, and a bank deposit. | 10 | I — F-2-8 |
| Links | Live product / Try the completed sample | 2 / 4 | Pass |
| H2 | What it does | 3 | Pass |
| Bullet | Shows a completed sample reconciliation in one click. | 8 | C — F-2-7 |
| Bullet | Keeps sample work separate from real drafts. | 7 | Covered by demo-isolation |
| Bullet | Shows source rows and arithmetic in the result. | 8 | C — F-2-1 |
| Bullet | Exports CSV, accountant PDF, print, and JSON files for free. | 10 | C — F-2-2 |
| Bullet | Keeps the current real draft after refresh. | 7 | Covered by draft-persistence |
| Bullet | Reloads the completed sample offline after its first visit. | 9 | Covered by offline-reload |
| Bullet | Rejects CSVs without headers, above 10 MB, or above 50,000 rows. | 12 | Covered by file-limits |
| Bullet | Sends no CSV data, analytics, or tracking requests during reconciliation. | 10 | Covered by local-privacy |
| Bullet | Adds saved history and reusable mappings with an optional US $19 license. | 12 | C — F-2-3 |
| Bullet | Removes only the current draft when you confirm “Erase current draft.” | 11 | Covered by erase-scope |
| Body | The app has no bank connection, commerce connection, or ledger-posting action. | 11 | Covered by no-integrations |
| Body | This is a reconciliation aid. | 5 | Pass |
| Body | It is not accounting, legal, or tax advice. | 8 | Pass; limitation |
| H2 | Run locally | 2 | Pass |
| Body | Use Node.js 22 or newer. | 5 | Pass |
| Body | Open the printed URL. | 4 | Pass |
| Body | Use `/demo` for the isolated sample. | 6 | Covered by demo-ready/demo-isolation |
| H2 | Test and build | 3 | Pass |
| Body | Every visitor-facing claim is listed in `.factory/claims.json`. | 7 | C — contradicted by F-2-4/F-2-5/F-2-6 |
| Body | Each entry names its exact browser test. | 7 | C — F-2-7 |
| Body | The build writes the static PWA to `dist/`. | 8 | J — F-2-8; covered by build-output |
| Body | Playwright is pinned to version `1.58.2`. | 6 | Pass |
| H2 | CSV expectations | 2 | Pass |
| Body | Use one currency and one payout period. | 7 | Pass; usage instruction |
| Body | Confirm the suggested mapping before reconciling real files. | 8 | Pass; usage instruction |
| Bullet | Order events CSV: date and amount are required. | 8 | C — F-2-6 |
| Bullet | Processor payout CSV: date and net amount are required. | 9 | C — F-2-6 |
| Bullet | Bank deposit CSV: date and amount are required. | 8 | C, I — F-2-6/F-2-8 |
| H2 | Privacy and storage | 3 | Pass |
| Body | The current draft, saved history, and mapping presets use IndexedDB. | 10 | J — F-2-8 |
| Body | The license token and cached verdict use localStorage. | 8 | J, C — F-2-4/F-2-8 |
| Link | Read the product’s privacy page and terms. | 8 | Pass |
| H2 | Deployment | 1 | Pass |
| Body | Run `npm run build`, then deploy `dist/` as the configured static artifact. | 12 | J — F-2-8 |
| Body | The factory owns infrastructure and DNS. | 6 | Pass; repository responsibility |
| Body | The checkout and license verification URLs use the Sociobot billing contract. | 11 | J, C — F-2-5/F-2-8 |
| Body | No payment provider identifier is embedded in this app. | 9 | Covered only partly by saved-history-license; include in F-2-5 test |
| H2 | Project notes | 2 | Pass |
| Links | Demo sandbox / Visual system / Repair handoff / MIT license | 2 / 2 / 2 / 2 | Pass |

## Claims execution

Every exact command from `.factory/claims.json` ran separately in clean clone `/tmp/payout-review-2-clean-S1UdOk`.

| Claim id | Command result | Review result |
| --- | --- | --- |
| `demo-ready` | PASS | Incomplete tagged coverage — F-2-7 |
| `demo-isolation` | PASS | Confirmed |
| `local-privacy` | PASS | Confirmed for the demo/export flow |
| `file-limits` | PASS | Confirmed |
| `free-exports` | PASS | Claim content is not fully asserted — F-2-2 |
| `offline-reload` | PASS | Confirmed in its own browser context |
| `draft-persistence` | PASS | Confirmed |
| `saved-history-license` | PASS | Paid features are not exercised — F-2-3 |
| `erase-scope` | PASS | Confirmed |
| `visible-reconciliation` | PASS | Visible-row promise is absent and unasserted — F-2-1 |
| `no-integrations` | PASS | Confirmed |
| `build-output` | PASS | Confirmed |

The full clean-clone gates also passed: 14 unit tests; typecheck; production build; 36 Playwright tests passed and 2 intentional project skips. Initial application JavaScript was 52.16 KB raw / 17.24 KB gzip. The live root HTML and `sw.js` matched the clean build byte for byte.

## Demo and sandbox behavior

- The first landing click opened `/demo` and immediately showed `Sample payout PO-0822`, 100.0%, $168.62 expected/reported/deposited, and $0.00 remaining variance.
- The persistent banner said “Demo — sample data, nothing is saved” and showed **Reset demo** and **Start for real**.
- The demo used `demo:payout-reconciliation-explainer`; a seeded real draft in `payout-reconciliation-explainer` remained `REVIEW 2 REAL MARKER` after reset and exit.
- Reset restored the completed sample. Start for real deleted the demo database and returned to the untouched real draft.
- A live offline reload retained the completed demo and displayed “Offline · work remains available.”
- The live demo/export request log contained only `payout-reconciliation-explainer.sociobot.in`. No console error occurred.

## Earlier findings checked from scratch

| Earlier finding | Live and code result |
| --- | --- |
| F-1-1 first-screen clarity | Fixed: job, audience, primary action, outcome, and facts are visible at both widths. |
| F-1-2 completed one-click demo | Fixed in live behavior; claim tag wiring remains F-2-7. |
| F-1-3 demo isolation | Fixed: separate demo database; real marker unchanged. |
| F-1-4 direct demo route | Fixed: `/demo` and `?demo=1` open the completed sample. |
| F-1-5 claims contract absent | File and tags now exist and commands pass; substantive coverage gaps remain F-2-1 through F-2-7. |
| F-1-6 titles, metadata, 404 | Fixed: per-route metadata, product social image, icons, and HTTP 404 are present. |
| F-1-7 shared navigation and focus | Fixed: shared nav is present; link navigation and Back focus the destination h1 and update the live region. |
| F-1-8 landing structure | Fixed: product, three steps, scope/privacy, paid section, and footer are present in order. |
| F-1-9 AVIF MIME | Fixed: live response is `image/avif`. |
| F-1-10 copy and terms | **Partly fixed; blocking again as F-2-8.** |
| Verification-3 touch targets | Fixed: no visible 390 px target measured below 44 × 44 px. |
| Verification-3 duplicate alert | Fixed: the regression test confirms one associated alert. |
| Handoff stale rollout note | Fixed: live root and service-worker hashes equal the candidate build. |

## Structure, links, and accessibility

- `/`, `/demo`, `/privacy/`, `/terms/`, and the designed 404 each have one h1, one main landmark, route-specific titles, descriptions, canonicals, Open Graph/Twitter metadata, favicons, the shared header, and the shared footer.
- A fresh network request to `/does-not-exist` returned HTTP 404 and rendered the designed balance-field 404 with return actions.
- Every same-origin link resolved as expected. Root, demo, Privacy, and Terms returned 200. The product-specific checkout returned 303 without following the payment redirect. The GitHub source returned 200.
- Navigation and Back moved focus to the new h1. The first Tab focused the skip link.
- Playwright axe checks found no serious or critical issue across all routes in desktop/mobile and light/dark coverage. The factory URL verifier found `lang=en`, one h1, one main, complete image alt text, labeled buttons, and no console errors on `/` and `/demo`.
- The original paper-and-ledger balance-field art, ruled geometry, clipped surfaces, teal/amber/violet palette, and tabular type form a distinct product identity rather than a generic SaaS template.

## Missed leverage

No additional AI feature is justified. Reconciliation arithmetic and evidence trails need deterministic rules, and an optional model step would weaken offline/privacy clarity. The brief-implied imports and exports already exist: three CSV imports plus CSV, PDF, print, and JSON outputs. Sync is intentionally outside the local-first scope. The missing leverage is the already-promised visible row evidence in F-2-1, not an additional product category.

## What would make this perfect

Close all eight findings: show actual source rows, make every export claim match and test its content, exercise both paid features, correct and register the token/payment claims, register required mapping behavior, make the tagged demo test start on the landing page, and finish the terminology/plain-copy cleanup. Then rerun every claim command and the complete live checklist from fresh contexts.
