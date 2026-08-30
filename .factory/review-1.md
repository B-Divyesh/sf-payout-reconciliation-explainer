# Adversarial first-read review 1 — FAIL

**Reviewed:** 2026-08-30 UTC  
**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>  
**Contexts:** new Chromium contexts at 390 × 844 and 1440 × 900; no existing browser storage.  
**Verdict:** **FAIL.** The product has blocking demo, claims, first-read, routing, and metadata failures. There are also copy flags and one unfixed earlier finding. A passing unit/e2e suite does not make the visitor-facing contract pass.

## Cold read before scrolling

At 390 px, the first screen says “See where every payout penny went.” It appears to help someone compare orders, a processor payout, and bank deposits, then give an accountant an evidence pack. It does **not** say who the visitor is for. “Bring orders…” names inputs, not the intended small ecommerce operator or bookkeeper. Two competing actions are visible: “Start a reconciliation” and “Try the labelled example”; the screen does not say which to use first or what either result will be.

The same result occurred at desktop width. The 390 px screenshot had no horizontal overflow and no console errors, but usability of the first decision remains blocking.

## Findings

### F-1-1 — BLOCKING — First screen does not state the user or a single, safe first action

**Location / exact copy:** hero: “See where every payout penny went.”; “Bring orders, a processor payout, and bank deposits. Map the columns yourself, inspect the rules, explain the variance, then hand your accountant a clean evidence pack.”; actions “Start a reconciliation” and “Try the labelled example.”

**Why check fails:** A first-time phone visitor cannot answer “for whom?” from the first screen, and two equal actions leave “what should I click first?” ambiguous. The headline is also a metaphor, not the job. This fails the mandatory first-screen shape.

**Concrete fix:** Use the ≤9-word headline **“Reconcile a payout with orders and bank deposits.”** Follow with **“For ecommerce operators and bookkeepers who need to explain a payout difference.”** Make **“Try it with sample data”** the single primary action, with adjacent text **“See a completed reconciliation and exportable handoff.”** Keep a quiet secondary link, **“Import my CSVs.”** Add only proved short facts, for example “Works on this device”, “No account”, and “Free exports”, after adding their claim tests.

### F-1-2 — BLOCKING — The required one-click demo is absent and does not show a completed job

**Location / exact copy:** hero “Try the labelled example”; workbench “Use labelled example.”

**Evidence:** In a fresh 390 px context, clicking “Try the labelled example” scrolled to the mapping form with three files loaded. It did not run reconciliation or show the waterfall, balanced result, or an export. No persistent text matching “Demo”, “Reset”, or “Start for real” appeared. There is no `Reset demo` control.

**Why check fails:** “Labelled example” is not the prescribed visible “Try it with sample data” route, and the first post-click screen is setup rather than the product being used with realistic data. A visitor must still inspect mappings and press “Run reconciliation” before seeing the value.

**Concrete fix:** Make the hero action load a realistic sample, reconcile it immediately, and land on the visible waterfall/result/export state. Show a persistent **“Demo — sample data, nothing is saved”** banner with **“Reset demo”** and **“Start for real”**. Add a Playwright test that opens the demo from a fresh context and asserts all three controls plus a completed result before any second click.

### F-1-3 — BLOCKING — Demo mode is not isolated from real storage

**Location / exact behavior:** `https://payout-reconciliation-explainer.sociobot.in/?demo=1`; source `src/main.ts` uses IndexedDB database `payout-reconciliation-explainer` for all drafts.

**Evidence:** In a fresh context, `?demo=1` left the URL unchanged but rendered the ordinary landing screen; it had no demo banner. After “Try the labelled example”, `indexedDB.databases()` contained `payout-reconciliation-explainer`, not a `demo:` namespace. There is no `demo:` key, alternate database, reset handler, or exit-to-real handler in the repository.

**Why check fails:** Sample files are written into the same database as a visitor’s real work. The visitor cannot reset or leave the sample safely. This directly violates the demo isolation requirement.

**Concrete fix:** Parse `/demo` and `?demo=1` into an explicit demo state; use a separate `demo:payout-reconciliation-explainer` IndexedDB database (and similarly namespaced localStorage if used); never load or write the real database while the banner is present. Reset must delete only the demo namespace; “Start for real” must discard it. Test that real draft data remains unchanged before, during, and after the full demo flow.

### F-1-4 — BLOCKING — The documented direct demo route is broken

**Location:** `GET /demo`.

**Evidence:** Fresh navigation to `https://payout-reconciliation-explainer.sociobot.in/demo` returned HTTP 200 but rendered the offline fallback: title “Offline — Payout Reconciliation Explainer” and h1 “You’re offline”. `/demo` is absent from `public/sitemap.xml`. `?demo=1` is only an ignored normal-app query parameter.

**Why check fails:** Verifiers and catalog links cannot enter the required demo directly. A successful status code is misleading because it presents an unrelated offline page.

**Concrete fix:** Serve a real `/demo` (or make `?demo=1` a working documented entry point), include it in sitemap and README, and add a direct-navigation test that asserts the sample banner and completed reconciliation rather than status alone.

### F-1-5 — BLOCKING — No claims contract exists; all visitor-reliant claims are untested

**Location:** repository root and `.factory/`.

**Evidence:** `.factory/claims.json` does not exist. `rg` found no `@claim:` tags, claim test commands, or demo-sandbox test. `npm test`, `npm run typecheck`, `npm run build`, and `npm run test:e2e` pass locally (14 unit tests; 8 passed and 2 intentional project skips in Playwright), but none is a claim test.

**Why check fails:** There is no listed test to run from the demo entry point, so every promise below is an unlisted claim. Passing general tests cannot prove a claim registry requirement.

**Unlisted claims found on the live landing page:**

- “Your CSVs never leave this device.”
- “No account, upload, or tracking.”
- “Original values and row numbers remain visible in every export.”
- “Nothing uploads.”
- “Each CSV is read and saved only in this browser.”
- “Up to 10 MB. Headers required.” (shown for each input)
- “US $19 once unlocks named reconciliation history and reusable column-mapping presets on this device.”
- “The complete reconciliation, CSV, accountant PDF, and JSON backup stay free.”
- “Hosted checkout by Sociobot/Dodo, merchant of record.”
- “Stored only in this browser.”
- “Current work still survives refresh for everyone.”
- “JSON backup is free and contains your current files, mappings, and explanations.”
- “This removes the active draft and its imported CSV contents from this browser. Saved Desk history is not removed.”

**Unlisted claims found in README:**

- “Imports orders/events, processor payout, and bank CSVs locally.”
- “Requires the user to review column mappings and a single ISO currency.”
- “Calculates in integer minor units, including zero- and three-decimal currencies.”
- “Separates orders, refunds, event fees, processor-file differences, and payout-to-bank variance in an auditable waterfall.”
- “Exports a row-level reconciler CSV, accountant PDF, printable report, and full JSON backup.”
- “Persists the active draft in IndexedDB and works after refresh or offline installation.”
- “The core workflow and every export remain free.”
- “It does not connect to banks or commerce platforms, create ledger entries, or upload financial files.”
- “Use labelled example provides a complete safe test path.”
- “The build step … generates a deterministic, versioned service worker so the workbench reloads reliably offline.”
- “The e2e suite checks … downloads, … 390 px layout, keyboard entry, console errors, draft persistence, and offline reload.”
- “The UI suggests likely columns but does not reconcile until the user reviews them.”
- “Limits are 10 MB and 50,000 rows per file.”
- “CSV data never leaves the browser.”
- “There are no analytics, third-party runtime scripts, or CDN fonts.”
- “Checkout and verification use the Sociobot billing contract … no payment provider or product ID is embedded.”

**Concrete fix:** Create `.factory/claims.json`; give every retained promise one observable `@claim:<id>` test that starts from `/demo` in a fresh context. The privacy test must record all demo-flow requests and permit only the product origin. Add distinct offline, draft-isolation, limits, exports, pricing/license, and delete-scope tests. Remove claims that cannot be proven. Do not claim an offline demo until the sample is precached and the test reloads it offline.

### F-1-6 — BLOCKING — Required route, 404, title, and metadata behavior is missing

**Location / evidence:**

- Root title is only “Payout Reconciliation Explainer”, not `Product — what it does`.
- `/privacy/` and `/terms/` have titles but no meta description, canonical, Open Graph, or Twitter tags.
- Root has a description and SVG favicon only; it has no canonical, OG/Twitter tags, OG image, or apple-touch icon. `GET /apple-touch-icon.png` is 404.
- `GET /does-not-exist` returns HTTP 200 and the offline fallback (“You’re offline”), not a designed 404. The same occurs for `/demo`.
- `public/sitemap.xml` omits the required demo route.

**Why check fails:** Search/share metadata is incomplete, the title does not explain the product, valid and invalid deep links are indistinguishable, and there is no recoverable 404 experience.

**Concrete fix:** Add per-route `<title>` values such as `Payout Reconciliation Explainer — explain payout differences`, `Demo — Payout Reconciliation Explainer`, `Privacy — Payout Reconciliation Explainer`, and `Terms — Payout Reconciliation Explainer`; add route-specific description, canonical, OG/Twitter metadata and a product-owned 1200×630 image. Add `apple-touch-icon.png`. Serve a styled 404 with HTTP 404 and a home link, configure the static fallback to preserve it, and include `/demo` in sitemap.

### F-1-7 — BLOCKING — Shared navigation and route-change focus requirements are not met

**Location / evidence:** The landing header contains only the wordmark and theme button. Privacy and Terms links exist only in the footer. In a live link navigation to Privacy and browser Back, `document.activeElement` was `BODY` both times, not the destination `<h1>`; there is no route announcement. The legal pages repeat this footer-only navigation.

**Why check fails:** The required shared header must include a short navigation including Demo and Privacy. Keyboard and screen-reader users receive neither a predictable route focus target nor a polite announcement after navigation.

**Concrete fix:** Put a consistent `nav` in every header with Home/Demo/Privacy/Terms (no more than four links), focus the new h1 and announce its title on each route change, and add a keyboard/Back test that asserts both. Preserve the existing skip link.

### F-1-8 — BLOCKING — The landing-page structure is incomplete

**Location:** landing page after the workbench.

**Evidence:** The page has hero, live product, paid area, and footer. It lacks a named “How it works” three-step section and lacks an on-page “What it does not do / privacy” section. The only non-goal wording is buried in README and Terms.

**Why check fails:** A visitor cannot scan the expected three-step path or limits before being asked to buy. The required skeleton is not present.

**Concrete fix:** After the live preview, add a plain “How it works” section with “Add three CSVs”, “Check the column mappings”, and “Export the explanation”; then add “What this app does not do” with no bank/commerce connections, no ledger entries, and no accounting or tax advice. Any retained privacy statements must be entered in claims.json and tested.

### F-1-9 — BLOCKING (carried forward from verification-2 P3) — AVIF is still served with the wrong MIME type

**Location:** `/art/balance-field-720.avif`.

**Evidence:** Live `HEAD` returns `content-type: application/octet-stream`, with `X-Content-Type-Options: nosniff`. This is the P3 recorded in `.factory/verification-2.md`; it has not been fixed.

**Why check fails:** The prior finding remains live. An image response must declare `image/avif`, particularly when `nosniff` is sent.

**Concrete fix:** Configure the static host MIME mapping for `.avif` as `image/avif`; verify both AVIF assets with a header check and add it to deployment verification.

### F-1-10 — MINOR — Copy uses metaphors, vague headings, mixed terms, and two oversized README sentences

**Location / exact copy:**

- “Local payout evidence, made legible”, “See where every payout penny went.”, and “THREE FILES → ONE EXPLANATION” are slogan/mood copy, not a section name or job.
- “Private workbench”, “One batch at a time”, “Keep a reconciliation desk”, and “Your data, portable” do not make sense as standalone section names.
- “Try the labelled example” and “Use labelled example” conflict with the mandatory and more familiar “sample data”.
- The same source is variously “orders”, “orders/events”, “events”, and “order events”; the output is “bank deposits”, “bank”, and “bank deposit”.
- README line 3 sentence two is 26 words: “It explains one processor payout against order/refund events and bank deposits, keeps the arithmetic visible, and exports an evidence CSV plus a real accountant handoff PDF.”
- README line 42 sentence two is 23 words: “The e2e suite checks the complete example workflow, downloads, axe serious/critical findings, 390 px layout, keyboard entry, console errors, draft persistence, and offline reload.”

**Why check fails:** These phrases make a cold visitor infer meaning, and inconsistent nouns make data inputs harder to compare. The two README sentences exceed the 22-word cap.

**Concrete fix:** Use the terminology table below. Replace the slogans/headings with **“Reconcile one payout”**, **“Reconciliation workspace”**, **“Reconcile one payout period”**, **“Optional saved-history license”**, and **“Back up or remove local data.”** Replace both example labels with **“Try it with sample data.”** Split the 26-word README sentence into: **“Explain one processor payout against order events and bank deposits. Export a CSV and accountant handoff PDF.”** Split the 23-word test sentence into two short sentences.

## Copy audit

Word counts exclude punctuation. “Flag” means one of: `M` metaphor/mood or heading without context; `J` jargon; `I` inconsistent term; `C` claim requiring registry coverage; `>22` sentence over the cap; `B` button/action wording. Repeated file-limit copy is listed once and shown three times. Code blocks and raw URLs are excluded.

### Landing page copy units

| Location | Copy | Words | Flag |
| --- | --- | ---: | --- |
| Hero eyebrow | Local payout evidence, made legible | 5 | M |
| Hero h1 | See where every payout penny went. | 6 | M |
| Hero body | Bring orders, a processor payout, and bank deposits. | 8 | I |
| Hero body | Map the columns yourself, inspect the rules, explain the variance, then hand your accountant a clean evidence pack. | 18 | I |
| Hero action | Start a reconciliation | 3 | B |
| Hero action | Try the labelled example | 4 | B, I |
| Hero fact | Your CSVs never leave this device. | 6 | C |
| Hero fact | No account, upload, or tracking. | 5 | C |
| Artwork caption | THREE FILES → ONE EXPLANATION | 4 | M |
| Step rail | Add files | 2 | — |
| Step rail | Map columns | 2 | — |
| Step rail | Reconcile | 1 | — |
| Step rail | Hand off | 2 | — |
| Workspace eyebrow | Private workbench | 2 | M |
| Workspace h2 | One batch at a time | 5 | M |
| Workspace body | Use one currency and one payout period. | 7 | — |
| Workspace body | Original values and row numbers remain visible in every export. | 10 | C |
| Files eyebrow | Step 01 · Evidence in | 4 | M |
| Files h2 | Add three source files | 4 | — |
| Files body | Nothing uploads. | 2 | C |
| Files body | Each CSV is read and saved only in this browser. | 10 | C |
| Files action | Use labelled example | 3 | B, I |
| Input heading | Orders & events | 2 | I |
| Input description | Sales, refunds, and processor fees. | 5 | I |
| Input action | Choose orders & events CSV | 4 | I |
| Limit, shown 3× | Up to 10 MB. | 4 | C |
| Limit, shown 3× | Headers required. | 2 | C |
| Input heading | Processor payout | 2 | I |
| Input description | The batch total the processor says it sent. | 8 | — |
| Input action | Choose processor payout CSV | 4 | — |
| Input heading | Bank deposits | 2 | I |
| Input description | The deposits that actually reached the bank. | 7 | I |
| Input action | Choose bank deposits CSV | 4 | I |
| Paid eyebrow | Optional one-time unlock | 3 | J |
| Paid h2 | Keep a reconciliation desk | 4 | M, J |
| Paid body | US $19 once unlocks named reconciliation history and reusable column-mapping presets on this device. | 14 | C, J |
| Paid body | The complete reconciliation, CSV, accountant PDF, and JSON backup stay free. | 11 | C |
| Paid action | Buy Desk for US $19 | 5 | — |
| Paid note | One-time purchase. | 2 | C |
| Paid note | Hosted checkout by Sociobot/Dodo, merchant of record. | 7 | C, J |
| Paid link | Refund terms | 2 | — |
| Paid status | Core tools are ready. | 4 | M |
| License label | Have a license? Paste it here | 6 | — |
| License action | Verify license | 2 | — |
| License help | Stored only in this browser. | 5 | C |
| Saved work h3 | Saved work | 2 | — |
| Saved work body | Current work still survives refresh for everyone. | 7 | C |
| Saved work body | Desk adds a library of named past work and mapping presets. | 10 | J |
| Data h3 | Your data, portable | 3 | M |
| Data body | JSON backup is free and contains your current files, mappings, and explanations. | 12 | C |
| Data body | Keep it somewhere secure. | 4 | — |
| Data action | Export JSON backup | 3 | — |
| Data action | Import JSON backup | 3 | — |
| Data action | Erase local work | 3 | — |
| Footer | Local-first by design. | 3 | M |
| Footer | Generated balance-field artwork; provenance in the project design notes. | 8 | J |
| Footer links | Privacy; Terms; Source | 3 | — |
| Erase dialog h2 | Erase the current work? | 4 | — |
| Erase dialog body | This removes the active draft and its imported CSV contents from this browser. | 13 | C |
| Erase dialog body | Saved Desk history is not removed. | 6 | C, J |
| Erase dialog actions | Erase current work; Keep working | 5 | — |

### README sentences

| Line | Sentence | Words | Flag |
| ---: | --- | ---: | --- |
| 3 | An offline-first web workbench for small ecommerce operators and bookkeepers. | 10 | J |
| 3 | It explains one processor payout against order/refund events and bank deposits, keeps the arithmetic visible, and exports an evidence CSV plus a real accountant handoff PDF. | 26 | >22, I, C |
| 9 | Imports orders/events, processor payout, and bank CSVs locally. | 10 | I, C |
| 10 | Requires the user to review column mappings and a single ISO currency. | 13 | J, C |
| 11 | Calculates in integer minor units, including zero- and three-decimal currencies. | 11 | J, C |
| 12 | Separates orders, refunds, event fees, processor-file differences, and payout-to-bank variance in an auditable waterfall. | 15 | J, C |
| 13 | Lets users document signed timing, bank-fee, rounding, or other evidence-backed differences. | 12 | J, C |
| 14 | Exports a row-level reconciler CSV, accountant PDF, printable report, and full JSON backup. | 14 | C |
| 15 | Persists the active draft in IndexedDB and works after refresh or offline installation. | 14 | J, C |
| 16 | Offers an optional US $19 one-time Desk license for reusable mappings and named reconciliation history. | 15 | J, C |
| 16 | The core workflow and every export remain free. | 8 | C |
| 18 | This is a reconciliation aid, not accounting or tax advice. | 10 | — |
| 18 | It does not connect to banks or commerce platforms, create ledger entries, or upload financial files. | 15 | C |
| 22 | Requires Node.js 22 or newer. | 6 | — |
| 29 | Open the printed local URL. | 5 | — |
| 29 | “Use labelled example” provides a complete safe test path. | 8 | I, C |
| 40 | `npm run build` is the deployment command. | 5 | — |
| 40 | It writes the static app to `./dist`, with `dist/index.html` at its root. | 12 | C |
| 40 | The build step inlines the small entry CSS/JS into each HTML entry and generates a deterministic, versioned service worker so the workbench reloads reliably offline. | 22 | J, C |
| 42 | Playwright is pinned to `1.58.2`. | 4 | — |
| 42 | The e2e suite checks the complete example workflow, downloads, axe serious/critical findings, 390 px layout, keyboard entry, console errors, draft persistence, and offline reload. | 23 | >22, J, C |
| 46 | Every file needs a header row. | 6 | C |
| 46 | The UI suggests likely columns but does not reconcile until the user reviews them. | 14 | C |
| 48 | Orders/events: date and amount are required; ID, type, fee, payout reference, and currency are optional. | 15 | I |
| 48 | Negative amounts or types containing `refund`, `chargeback`, `return`, or `reversal` become deductions. | 13 | C |
| 49 | Processor payout: date and net are required; payout ID, gross, refunds, fees, and currency are optional. | 16 | I |
| 50 | Bank: date and amount are required; reference and currency are optional. | 11 | I |
| 52 | All imported rows are treated as one payout period. | 9 | C |
| 52 | Split currencies and unrelated batches before importing. | 7 | — |
| 52 | Limits are 10 MB and 50,000 rows per file. | 10 | C |
| 56 | CSV data never leaves the browser. | 6 | C |
| 56 | The current draft, named history, and presets use IndexedDB. | 9 | J, C |
| 56 | A license token and daily cached verdict use localStorage. | 9 | J, C |
| 56 | There are no analytics, third-party runtime scripts, or CDN fonts. | 9 | C |
| 56 | See `/privacy/` and `/terms/` in the app. | 7 | — |
| 60 | Checkout and verification use the Sociobot billing contract with the product slug in the path; no payment provider or product ID is embedded. | 20 | J, C |
| 60 | Production defaults to `https://api.sociobot.in`; a registered staging product may explicitly override it. | 12 | J, C |

README headings and link labels were also checked: “Payout Reconciliation Explainer”, “What it does”, “Run locally”, “Test and build”, “CSV expectations”, “Privacy and storage”, “Billing configuration”, “Project notes”, “Visual system”, “Build handoff”, and “MIT license”. They are descriptive enough as headings; the body-copy flags above remain.

### Required terminology table

| Concept | Use everywhere |
| --- | --- |
| Source orders/refunds/fees file | Order events CSV |
| Processor-sent total | Processor payout |
| Amount received | Bank deposit |
| Tryable seed | Sample data |
| Saved-history paid feature | Saved-history license (or a clearly introduced product name) |

## Demo, privacy, and claim test record

- Fresh requests during the ordinary landing and sample click were only same-origin document, local fonts, and artwork requests. This is an observation, **not** a passing privacy claim test because the demo is absent and no request-log assertion is tagged in `claims.json`.
- Demo sample inputs are realistic in shape (three order-event rows, one payout row, two bank rows), but the completed result is one extra click away and the data reaches regular storage.
- No claim entry exists, so there were no listed claim test commands to execute. This is a failure, not “zero claims to test.”
- `npm test` passed 14 tests; `npm run typecheck` and `npm run build` passed; `npm run test:e2e` passed 8 tests with 2 expected project-target skips. These checks were run from the clean work-order checkout after `npm ci` and do not cover the absent contract.

## Earlier review and handoff history

No earlier `.factory/review-*.md` or `.factory/polish-*.md` files exist. I read `.factory/verification.md`, `.factory/verification-2.md`, and the prior handoff.

| Earlier item | Live/code confirmation | Result |
| --- | --- | --- |
| verification P1: production billing base | Live buy link targets `https://api.sociobot.in/api/v1/products/payout-reconciliation-explainer/checkout`; source default is `https://api.sociobot.in`. The external billing API itself was not contacted because this work order prohibits access to resources outside this product. | Code/link fixed; checkout outcome not re-run. |
| verification P1: false balanced status after adjustment | Live labelled data reconciled to “The bank deposit balances”; `#adjustment-form` was absent. Source rejects explanations when raw variance is within one minor unit; current regression test passed. | Fixed. |
| verification P1: rate limit absent | Prior verification-2 reports 429 behavior, but re-bursting the separate billing API is outside the permitted resource boundary. | Not independently re-run; no new product-code regression observed. |
| verification-2 P3: AVIF MIME | Live header remains `application/octet-stream`. | **Unfixed; carried forward as F-1-9.** |

## Other structure and quality observations

- Root has one h1, one main landmark, a visible skip link, self-hosted fonts, a distinct balance-field visual system, no landing console errors, and no 390 px horizontal overflow. These do not offset the findings.
- `robots.txt` is present. Sitemap lists only `/`, `/privacy/`, and `/terms/`.
- The live root, privacy, and terms links returned 200; the GitHub Source link was not crawled because it is outside the product resource boundary. Internal valid route checks are recorded above.
- An AI feature is not an obvious missing capability for this local arithmetic and evidence-trail product. Import/export already exists; no AI finding is recorded.

## What would make this perfect

Ship a direct, fully isolated `/demo` that opens on a completed, realistic reconciliation and makes reset/exit unmistakable; replace the hero with one plain job, named user, and one sample-data action; create and pass a complete claim registry from that demo; then finish the required route metadata, 404, navigation/focus, skeleton sections, MIME mapping, and copy cleanup. Re-run this whole review in fresh mobile and desktop contexts only after all findings have observable tests.
