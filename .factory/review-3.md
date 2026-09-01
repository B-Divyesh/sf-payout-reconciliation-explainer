# Adversarial first-read review 3 — FAIL

**Reviewed:** 1 September 2026 UTC
**Candidate:** `9034907f3fcbff332746f69bf055a2dbc59abf95`
**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>
**Contexts:** fresh Chromium contexts at 390 × 844 and 1440 × 900; clean temporary clone for every registered claim command.

## Verdict

**FAIL.** Two blocking claim-coverage findings remain. The first screen, demo isolation, live routes, accessibility, offline behavior, and all 15 registered claim commands pass. PASS still requires every visitor-facing statement and action to have complete registered evidence.

## Cold read before scrolling

### 390 px phone

- **What does it do?** It reconciles one payout with order events and bank deposits.
- **For whom?** Ecommerce operators and bookkeepers who need to explain a payout difference.
- **What should I select first?** **Try it with sample data**. The next sentence says this opens a completed reconciliation with an accountant report.

All three answers were visible before scrolling. The headline, audience sentence, primary action, stated result, real-data link, and three facts ended at 656 px in the 844 px viewport. There was no horizontal overflow, console error, or page error.

### 1440 px desktop

The same answers were clear before scrolling. The primary action, stated result, real-data link, and three facts were visible within the 900 px viewport. There was no horizontal overflow, console error, or page error.

## Findings

### F-3-1 — BLOCKING — JSON backup import and full-content statements have no complete registered test

**Exact quote/location:** landing workspace: **“Import JSON backup”** and “The JSON backup contains your current files, mappings, and explanations.” README: “Every visitor-facing claim is listed in `.factory/claims.json`.”

**Observed evidence:** `.factory/claims.json` lists `free-exports`, but that claim covers exports only. Its test confirms one source row in the JSON. It does not activate **Import JSON backup**, confirm a round trip, or confirm that mappings and manual explanations return. No other tagged test uses `#backup-file`. A manual live check confirmed that the current sample backup can be imported, but that check had no manual explanation and is not the registered clean-sandbox evidence promised by the README.

**Why the check fails:** The landing page offers import as a supported result and describes three kinds of backup content. A visitor could rely on that action when restoring financial work. The registry and its exact commands do not confirm the complete promise. This also means review-2 finding F-2-2 was only partly closed.

**Concrete fix:** Add a `backup-roundtrip` entry to `.factory/claims.json`. Its one tagged browser test should create a real draft with files, a changed mapping, and a valid manual explanation; export it; erase the draft; import the downloaded JSON; and confirm all three data classes and the reconciliation result return. Keep `free-exports` focused on download availability.

### F-3-2 — BLOCKING — The demo states broader calculation and traceability rules than its registered claim confirms

**Exact quotes/location:** `/demo`, completed result:

- “Every figure below traces back to a mapped field or your written explanation.”
- “Currency precision: USD uses 2 decimal places; calculations use integer minor units.”
- “Events rule: positive rows count as orders; negative rows or types containing refund, chargeback, return, or reversal count as refunds.”
- “Fee rule: the mapped event-fee values are deducted by absolute value.”

**Observed evidence:** `visible-reconciliation` confirms the sample totals, three evidence tables, one known order row, and the visible waterfall labels. The sample includes one negative row whose type is `refund` and positive fee values. It does not check `chargeback`, `return`, `reversal`, positive rows carrying a refund-like type, negative fee values, another currency precision, or a figure produced from a written explanation. Unit tests confirm minor-unit arithmetic and one manual explanation, but these visitor-facing statements have no corresponding entries and browser commands in `.factory/claims.json`.

**Why the check fails:** These rules tell a visitor how financial rows will be classified and calculated. The current registered evidence does not cover their full wording, so the claims contract is incomplete.

**Concrete fix:** Add a `calculation-rules` claim with one tagged browser test that imports fixtures covering each named event type, positive and negative fees, zero- and three-decimal currencies, and a supported written explanation. Confirm every displayed total and its source row. Alternatively, narrow the demo text to only the sample behavior already confirmed by `visible-reconciliation`.

## Copy audit

Counts treat a currency amount, version, file name, or code token as one word. Repeated text is listed once with its repetition count. `C` marks claim coverage in a finding. No sentence exceeds 22 words. No banned marketing adjective, metaphor heading, unexplained slogan, or inconsistent product term was found. Every action label starts with a result-naming verb; the import action's wording passes even though its evidence does not.

### Landing page and shared chrome

| Location | Exact copy | Words | Result |
| --- | --- | ---: | --- |
| Skip link | Skip to main content | 4 | Pass |
| Wordmark | Payout Explainer | 2 | Pass |
| Header links | Home / Demo / Privacy / Terms | 1 / 1 / 1 / 1 | Pass |
| Theme control | Switch color theme | 3 | Pass |
| Hero label | Reconcile one payout | 3 | Pass |
| Hero h1 | Reconcile a payout with order events and bank deposits. | 9 | Pass |
| Hero body | For ecommerce operators and bookkeepers who need to explain a payout difference. | 12 | Pass |
| Primary action | Try it with sample data | 5 | Pass |
| Action result | See a completed reconciliation and download its accountant report. | 9 | Pass |
| Secondary action | Import my CSVs | 3 | Pass |
| Hero fact | CSV data stays in this browser | 6 | Pass — `local-privacy` |
| Hero fact | No account | 2 | Pass — `local-privacy` |
| Hero fact | Free exports | 2 | Pass — `free-exports` |
| Artwork label | Order events · Processor payout · Bank deposits | 6 | Pass |
| Progress rail | Add files / Map columns / Reconcile / Hand off | 7 | Pass |
| Workspace label | Reconciliation workspace | 2 | Pass |
| Workspace h2 | Reconcile one payout period | 4 | Pass |
| Workspace body | Use one currency and one payout period. | 7 | Pass |
| File section label | Step 01 · Add evidence | 4 | Pass |
| File section h2 | Add three source files | 4 | Pass |
| File section body | The app reads each CSV in this browser. | 8 | Pass — `local-privacy` |
| Sample action | Try it with sample data | 5 | Pass |
| Source h3 | Order events | 2 | Pass |
| Source body | Sales, refunds, and processor fees. | 5 | Pass |
| File action | Choose order events CSV | 4 | Pass |
| Source h3 | Processor payout | 2 | Pass |
| Source body | The batch total the processor says it sent. | 8 | Pass |
| File action | Choose processor payout CSV | 4 | Pass |
| Source h3 | Bank deposits | 2 | Pass |
| Source body | The amounts that reached the bank. | 6 | Pass |
| File action | Choose bank deposits CSV | 4 | Pass |
| File limit, 3× | Maximum 10 MB and 50,000 data rows. | 7 | Pass — `file-limits` |
| Header rule, 3× | A header row is required. | 5 | Pass — `file-limits` |
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
| Scope item | It does not provide accounting, legal, or tax advice. | 9 | Pass |
| Scope item | It does not send CSV contents to a server. | 9 | Pass — `local-privacy` |
| Paid label | Optional saved-history license | 3 | Pass |
| Paid h2 | Save past reconciliations | 3 | Pass |
| Paid body | Pay US $19 once to add named history and reusable column mappings on this device. | 15 | Pass — `saved-history-license` |
| Paid body | Reconciliation and every export remain free. | 6 | Pass — `free-exports` |
| Paid action | Buy saved history for US $19 | 6 | Pass |
| Paid note | One-time purchase. | 2 | Pass — `saved-history-license` |
| Paid note | Payment opens on Sociobot’s hosted checkout. | 6 | Pass — `hosted-checkout` |
| Paid link | Read purchase terms. | 3 | Pass |
| License label | Have a license? | 3 | Pass |
| License instruction | Paste it here. | 3 | Pass |
| License action | Verify license | 2 | Pass |
| License help | Stored in this browser. | 4 | Pass — `license-verification-privacy` |
| License help | Sent to Sociobot only for license checks. | 7 | Pass — `license-verification-privacy` |
| Saved-work h3 | Saved reconciliations | 2 | Pass |
| Saved-work body | Your current draft remains after a refresh. | 7 | Pass — `draft-persistence` |
| Saved-work body | The license adds named history and reusable mappings. | 8 | Pass — `saved-history-license` |
| Data h3 | Back up or remove local data | 6 | Pass |
| Data body | The JSON backup contains your current files, mappings, and explanations. | 10 | C — F-3-1 |
| Data action | Export JSON backup | 3 | Pass — `free-exports` |
| Data action | Import JSON backup | 3 | C — F-3-1 |
| Data action | Erase current draft | 3 | Pass — `erase-scope` |
| Dialog h2 | Erase the current draft? | 4 | Pass |
| Dialog body | This removes the active draft and its imported CSV contents. | 10 | Pass — `erase-scope` |
| Dialog body | Saved history remains. | 3 | Pass — `erase-scope` |
| Dialog actions | Erase current draft / Keep working | 5 | Pass |
| Footer | Explain one payout from local CSV files. | 7 | Pass |
| Footer | Original generated artwork. | 3 | Pass; provenance is in `.factory/design.md` |
| Footer | Version 1.1 · Built by Param Factory. | 6 | Pass |
| Footer links | Privacy / Terms / Source on GitHub | 1 / 1 / 3 | Pass |

### README

| Location | Exact copy | Words | Result |
| --- | --- | ---: | --- |
| H1 | Payout Reconciliation Explainer | 3 | Pass |
| Intro | A local payout tool for small ecommerce operators and bookkeepers. | 10 | Pass |
| Intro | Reconcile order events, one processor payout, and bank deposits. | 9 | Pass |
| Links | Live product / Try the completed sample | 2 / 4 | Pass |
| H2 | What it does | 3 | Pass |
| Bullet | Shows a completed sample reconciliation in one click. | 8 | Pass — `demo-ready` |
| Bullet | Keeps sample work separate from real drafts. | 7 | Pass — `demo-isolation` |
| Bullet | Shows source rows and arithmetic in the result. | 8 | Pass — `visible-reconciliation` |
| Bullet | Exports a row-level CSV, accountant PDF, printable report, and JSON backup without a license. | 14 | Pass — `free-exports` |
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
| Body | It is not accounting, legal, or tax advice. | 8 | Pass |
| H2 | Run locally | 2 | Pass |
| Body | Use Node.js 22 or newer. | 5 | Pass |
| Body | Open the printed URL. | 4 | Pass |
| Body | Use `/demo` for the isolated sample. | 6 | Pass — `demo-ready`, `demo-isolation` |
| H2 | Test and build | 3 | Pass |
| Body | Every visitor-facing claim is listed in `.factory/claims.json`. | 7 | C — contradicted by F-3-1 and F-3-2 |
| Body | Each entry names the browser test that proves it. | 9 | C — incomplete for F-3-1 and F-3-2 |
| Body | The build writes the installable offline site to `dist/`. | 9 | Pass — `build-output` |
| Body | Playwright is pinned to version `1.58.2`. | 6 | Pass; confirmed in `package.json` |
| H2 | CSV expectations | 2 | Pass |
| Body | Use one currency and one payout period. | 7 | Pass |
| Body | Confirm the suggested mapping before reconciling real files. | 8 | Pass |
| Bullet | Order events CSV: date and amount are required. | 8 | Pass — `required-columns` |
| Bullet | Processor payout CSV: date and net amount are required. | 9 | Pass — `required-columns` |
| Bullet | Bank deposits CSV: date and amount are required. | 8 | Pass — `required-columns` |
| Body | The `required-columns` browser test removes and repairs every required mapping. | 10 | Pass |
| H2 | Privacy and storage | 3 | Pass |
| Body | The browser’s built-in database stores the current draft, saved history, and mapping presets. | 13 | Pass — `draft-persistence`, `saved-history-license` |
| Body | Browser storage keeps the license token and latest check result. | 10 | Pass — `license-verification-privacy`, `saved-history-license` |
| Link sentence | Read the product’s privacy page and terms. | 7 | Pass |
| H2 | Deployment | 1 | Pass |
| Body | Run `npm run build`, then deploy the site files in `dist/`. | 11 | Pass — `build-output` |
| Body | The factory owns infrastructure and DNS. | 6 | Pass |
| Body | Purchase and license checks use product-specific Sociobot URLs. | 8 | Pass — `hosted-checkout`, `license-verification-privacy` |
| Body | The app contains no card form or payment-provider script. | 9 | Pass — `hosted-checkout` |
| H2 | Project notes | 2 | Pass |
| Links | Demo sandbox / Visual system / Repair handoff / MIT license | 2 / 2 / 2 / 2 | Pass |

### Terminology

| Concept | Term used consistently |
| --- | --- |
| Source orders, refunds, and fees | Order events CSV |
| Processor-sent total | Processor payout |
| Amounts received | Bank deposits CSV |
| Tryable seed | Sample data |
| Paid saved-work feature | Saved-history license |
| Export for an accountant | Accountant report or accountant PDF |

## Demo, privacy, and offline checks

- Confirmed one activation from the cold landing page opened `/demo` with a completed reconciliation: expected, reported, and deposited totals were each `$168.62`; remaining variance was `$0.00`.
- Confirmed the persistent banner, **Reset demo**, **Start for real**, source rows, waterfall, and export controls were present on the first demo screen.
- Confirmed the demo database was `demo:payout-reconciliation-explainer`. A marked draft in `payout-reconciliation-explainer` remained unchanged after reset and exit.
- Confirmed Reset restored `Sample payout PO-0822`. Confirmed Start for real removed the demo database and opened the marked real draft.
- Confirmed the live CSV, PDF, print, and JSON export flow requested only `payout-reconciliation-explainer.sociobot.in`. No console or page errors occurred.
- Confirmed a completed live demo reloaded offline with the banner, balanced result, and offline notice.

## Registered claims

Every exact command in `.factory/claims.json` ran separately in `/tmp/payout-review3-clean-BBcTrU`.

| Claim | Command result | Review result |
| --- | --- | --- |
| `demo-ready` | PASS | Confirmed |
| `demo-isolation` | PASS | Confirmed |
| `local-privacy` | PASS | Confirmed for the complete demo and export flow |
| `file-limits` | PASS | Confirmed |
| `free-exports` | PASS | Registered wording confirmed; separate landing backup claims remain F-3-1 |
| `offline-reload` | PASS | Confirmed in a dedicated context |
| `draft-persistence` | PASS | Confirmed |
| `saved-history-license` | PASS | Confirmed |
| `license-verification-privacy` | PASS | Confirmed |
| `hosted-checkout` | PASS | Confirmed |
| `required-columns` | PASS | Confirmed |
| `erase-scope` | PASS | Confirmed |
| `visible-reconciliation` | PASS | Registered wording confirmed; broader demo rules remain F-3-2 |
| `no-integrations` | PASS | Confirmed |
| `build-output` | PASS | Confirmed |

Each registered ID appears exactly once in `tests/e2e/app.spec.ts`. The exact commands pass, but they do not list or confirm the additional statements in F-3-1 and F-3-2.

## Earlier findings checked again

| Earlier finding | Current live and code result |
| --- | --- |
| F-1-1 first-screen clarity | Fixed. The job, users, first action, and result are visible at both widths. |
| F-1-2 completed one-click demo | Fixed. One activation opens a completed result with the required banner and controls. |
| F-1-3 demo isolation | Fixed. Separate demo storage is removed on exit; marked real data remains unchanged. |
| F-1-4 direct demo route | Fixed. `/demo` and `?demo=1` open the completed sample. |
| F-1-5 claims contract | Partly fixed. All registered commands pass, but additional live statements remain unlisted in F-3-1 and F-3-2. |
| F-1-6 titles, metadata, and 404 | Fixed. All routes have complete metadata, and a cold unknown URL returns the designed page with HTTP 404. |
| F-1-7 navigation and route focus | Fixed. Shared navigation is present; forward and Back navigation focus and announce the new h1. |
| F-1-8 landing structure | Fixed. The required product, three-step, scope, paid, and footer sections appear in order. |
| F-1-9 AVIF MIME | Fixed. The live response is `image/avif`. |
| F-1-10 copy and terms | Fixed. The current landing page and README use consistent, plain terms and stay within 22 words per sentence. |
| F-2-1 visible source rows | Fixed. Three source tables show filenames, row numbers, mapped values, and original values. |
| F-2-2 export evidence | **Partly fixed; reopened as F-3-1.** CSV/PDF/print/JSON output checks improved, but backup import and all stated backup contents remain unregistered or incompletely checked. |
| F-2-3 paid feature exercise | Fixed. The registered test saves, reloads, opens, reuses, and deletes paid records. |
| F-2-4 license token wording | Fixed. Copy and request checks agree. |
| F-2-5 hosted checkout wording | Fixed. Copy states the observable behavior, and the registered test confirms it. |
| F-2-6 required mappings | Fixed. All six required mappings and recovery paths are checked. |
| F-2-7 one-click claim | Fixed. The tagged test begins on `/` and uses one activation. |
| F-2-8 terminology and plain copy | Fixed. The current terms are consistent and the previous vague phrases are absent. |

## Structure, links, accessibility, and build

- Confirmed `/`, `/demo`, `/privacy/`, `/terms/`, and the designed 404 each have `lang=en`, one h1, one main landmark, route-specific title, description, canonical, Open Graph/Twitter data, favicons, consistent header, and consistent footer.
- Confirmed title lengths are 53, 38, 41, 39, and 48 characters. The product social image is 1200 × 630; the touch icon is 180 × 180.
- Confirmed a cold unknown URL returns HTTP 404. Root, demo, Privacy, Terms, the manifest, social image, touch icon, and GitHub source return 200. The product checkout returns the expected 303 response. All fragment links have targets.
- Confirmed internal forward and Back navigation focus the destination h1 and update the polite live region.
- Confirmed the factory URL check passes for root and demo with no console errors, one h1, one main, complete image alternatives, and labelled buttons.
- The standalone axe command could not locate its own Chrome binary. The repository's Playwright integration using `axe-core` completed instead: zero violations on all five routes, at desktop and 390 px, in light and dark themes.
- Confirmed all visible mobile controls meet the 44 px target check, the skip link receives first keyboard focus, dialog focus returns after Escape, reduced-motion CSS is present, and no route has horizontal overflow.
- Confirmed `npm test` passed 14 tests, type checking passed, `npm run build` produced `dist/`, and the full browser suite passed 40 checks with 2 intended offline-project skips.
- Confirmed the initial app JavaScript is 53,757 bytes raw and 17.68 KB gzip. The CSS is 25,905 bytes raw and 6.21 KB gzip.
- Confirmed local and live `index.html` hashes match. Local and live `sw.js` hashes also match.
- Confirmed the ruled paper, cut geometry, balance-field art, teal/amber/violet palette, and tabular figures match `.factory/design.md` and do not present a generic SaaS layout.

## Missed leverage

No additional AI step is justified. The product depends on deterministic financial arithmetic, visible source evidence, and offline use. Three CSV imports and four export formats already meet the brief's import/export need, and sync would conflict with the stated local-only scope. The existing JSON import is valuable, but it needs the registered round-trip evidence in F-3-1.

## What would make this perfect

Add and pass the backup round-trip claim test described in F-3-1. Then register and fully check the calculation and traceability statements in F-3-2, or narrow those statements to the behavior already covered. Rerun every registered command and the full live checklist; PASS requires zero remaining findings.
