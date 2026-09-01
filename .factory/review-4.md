# Adversarial first-read review 4 — FAIL

**Reviewed:** 1 September 2026 UTC

**Candidate:** `43acce9c28d2efd986d544bf41450aeee43dcad0`

**Live URL:** <https://payout-reconciliation-explainer.sociobot.in>
**Contexts:** fresh Chromium contexts at 390 × 844 and 1440 × 900; clean temporary clone for every registered claim command.

## Verdict

**FAIL.** The product is clear and usable, and all 17 registered claim commands pass. Three findings remain: one unlisted visitor-facing provenance claim, one reproducible direct-demo scroll defect, and one stale README link label. PASS requires zero findings.

## Cold read before scrolling

### 390 px phone

- **What does it do?** It reconciles one payout with order events and bank deposits.
- **For whom?** Ecommerce operators and bookkeepers who need to explain a payout difference.
- **What should I select first?** **Try it with sample data**. The adjacent sentence says this opens a completed reconciliation and accountant report.

All three answers appear in the first 844 px. The primary action begins at 418 px; the real-data action and all three facts are also visible. There is no horizontal overflow, console error, or page error.

Evidence: [phone cold view](evidence/review-4-live-mobile-cold.png).

### 1440 px desktop

The same three answers are clear before scrolling. The primary action, its result, the real-data action, and all three facts appear in the first 900 px. There is no console error or page error.

Evidence: [desktop cold view](evidence/review-4-live-desktop-cold.png).

## Findings

### F-4-1 — BLOCKING — The footer makes an unlisted artwork-origin claim

**Exact quote/location:** shared footer on `/`, `/demo`, `/privacy/`, `/terms/`, and the 404: “Original generated artwork.” README: “Every visitor-facing claim is listed in `.factory/claims.json`.”

**Observed evidence:** `.factory/claims.json` has no entry for this claim. The repository does contain a prompt, source image, generation metadata, and C2PA metadata under `assets/src/`, and `.factory/design.md` records the provenance. Those files support an internal audit, but they do not satisfy the work order's rule that every claim-like visitor sentence have a claims entry and test.

**Why this fails:** “Original” is a factual authorship/provenance statement. A visitor could rely on it when assessing reuse or rights. It is therefore an unlisted claim even though the internal provenance appears credible.

**Concrete fix:** Remove “Original generated artwork.” from visitor-facing copy and keep the required provenance in `.factory/design.md`. If the sentence must remain public, add an `art-provenance` claim and a deterministic repository test for the retained prompt, generation record, and C2PA metadata; do not claim originality beyond what that evidence can prove.

### F-4-2 — MINOR — A direct demo visit starts below the page heading

**Exact location:** a fresh direct navigation to `/demo` at both tested widths.

**Observed evidence:** after network idle plus 500–800 ms, eight fresh 390 px contexts settled at `scrollY` 580–616. The h1 “Review a completed payout reconciliation.” was 256–292 px above the viewport. At 1440 px, `scrollY` was 515 and the h1 was 302 px above the viewport. The shared header, completed-sample label, h1, sample instruction, and “Sample payout PO-0822” heading are skipped. The sticky banner remains, but the result card begins partway through its content. This reproduces the low-severity gap recorded in the previous handoff.

**Why this fails:** A visitor following the README or catalog deep link lands midway through a card without the page heading or sample name. The result is usable, but the initial page position loses context and creates a layout jump.

**Concrete fix:** Do not call `scrollIntoView()` when `loadSample(true)` seeds an initial `/demo` route. Keep result scrolling only after a visitor explicitly runs or edits a reconciliation. Add a fresh-context desktop/mobile test that opens `/demo` directly, waits for the completed sample, asserts `scrollY === 0`, and confirms the h1 is visible below the sticky banner.

Evidence: [direct phone demo](evidence/review-4-live-mobile-demo-direct.png).

### F-4-3 — MINOR — The README links to the current review handoff as “Repair handoff”

**Exact quote/location:** `README.md`, Project notes: “Repair handoff” → `.factory/handoff.md`.

**Observed evidence:** the target is now “Review 4 handoff — FAIL”; before this review it was “Verification 7 handoff — PASS.” It is not a repair handoff in either state.

**Why this fails:** The link label does not name the document it opens. A reader looking for implementation repair notes instead receives the latest verification/review status.

**Concrete fix:** Rename the link **“Latest handoff”** or **“Review handoff.”**

## Copy audit

Counts treat a number, currency amount, version, or code token as one word. Repeated copy is listed once with its repetition count. The audit includes headings, labels, and actions so non-sentence interface copy is not omitted. No unit exceeds 22 words. No banned marketing adjective, metaphor heading, inconsistent product term, or non-result action was found. `C` marks the unlisted claim in F-4-1.

### Landing page and shared chrome

| Location | Exact copy | Words | Result |
| --- | --- | ---: | --- |
| Skip link | Skip to main content | 4 | Pass |
| Wordmark | Payout Explainer | 2 | Pass |
| Header link | Home | 1 | Pass |
| Header link | Demo | 1 | Pass |
| Header link | Privacy | 1 | Pass |
| Header link | Terms | 1 | Pass |
| Theme control name | Switch color theme | 3 | Pass |
| Hero label | Reconcile one payout | 3 | Pass |
| Hero h1 | Reconcile a payout with order events and bank deposits. | 9 | Pass |
| Hero body | For ecommerce operators and bookkeepers who need to explain a payout difference. | 12 | Pass |
| Primary action | Try it with sample data | 5 | Pass |
| Primary-action result | See a completed reconciliation and download its accountant report. | 9 | Pass |
| Secondary action | Import my CSVs | 3 | Pass |
| Hero fact | CSV data stays in this browser | 6 | Pass — `local-privacy` |
| Hero fact | No account | 2 | Pass — `local-privacy` |
| Hero fact | Free exports | 2 | Pass — `free-exports` |
| Artwork alt | Paper transaction tiles align into one settlement bar | 8 | Pass |
| Artwork label | Order events · Processor payout · Bank deposits | 6 | Pass |
| Progress step | Add files | 2 | Pass |
| Progress step | Map columns | 2 | Pass |
| Progress step | Reconcile | 1 | Pass |
| Progress step | Hand off | 2 | Pass |
| Workspace label | Reconciliation workspace | 2 | Pass |
| Workspace h2 | Reconcile one payout period | 4 | Pass |
| Workspace body | Use one currency and one payout period. | 7 | Pass |
| File-section label | Step 01 · Add evidence | 4 | Pass |
| File-section h2 | Add three source files | 4 | Pass |
| File-section body | The app reads each CSV in this browser. | 8 | Pass — `local-privacy` |
| Sample action | Try it with sample data | 5 | Pass |
| Source h3 | Order events | 2 | Pass |
| Source body | Sales, refunds, and processor fees. | 5 | Pass |
| File action | Choose order events CSV | 4 | Pass |
| File limit, 3× | Maximum 10 MB and 50,000 data rows. | 7 | Pass — `file-limits` |
| Header rule, 3× | A header row is required. | 5 | Pass — `file-limits` |
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
| License prompt | Have a license? | 3 | Pass |
| License instruction | Paste it here. | 3 | Pass |
| License action | Verify license | 2 | Pass |
| License help | Stored in this browser. | 4 | Pass — `license-verification-privacy` |
| License help | Sent to Sociobot only for license checks. | 7 | Pass — `license-verification-privacy` |
| Saved-work h3 | Saved reconciliations | 2 | Pass |
| Saved-work body | Your current draft remains after a refresh. | 7 | Pass — `draft-persistence` |
| Saved-work body | The license adds named history and reusable mappings. | 8 | Pass — `saved-history-license` |
| Empty state | No saved reconciliations yet. | 4 | Pass |
| Empty-state action | Run one, then save it here. | 6 | Pass |
| Active status | Saved history is active. | 4 | Pass |
| Data h3 | Back up or remove local data | 6 | Pass |
| Data body | The JSON backup restores your current files, mappings, and explanations. | 10 | Pass — `backup-roundtrip` |
| Data action | Export JSON backup | 3 | Pass |
| Data action | Import JSON backup | 3 | Pass |
| Data action | Erase current draft | 3 | Pass |
| Dialog h2 | Erase the current draft? | 4 | Pass |
| Dialog body | This removes the active draft and its imported CSV contents. | 10 | Pass — `erase-scope` |
| Dialog body | Saved history remains. | 3 | Pass — `erase-scope` |
| Dialog action | Erase current draft | 3 | Pass |
| Dialog action | Keep working | 2 | Pass |
| Footer sentence | Explain one payout from local CSV files. | 7 | Pass |
| Footer sentence | Original generated artwork. | 3 | **C — F-4-1** |
| Footer sentence | Version 1.1 · Built by Param Factory. | 6 | Pass |
| Footer link | Privacy | 1 | Pass |
| Footer link | Terms | 1 | Pass |
| Footer link | Source on GitHub | 3 | Pass |

### README

| Location | Exact copy | Words | Result |
| --- | --- | ---: | --- |
| H1 | Payout Reconciliation Explainer | 3 | Pass |
| Intro | A local payout tool for small ecommerce operators and bookkeepers. | 10 | Pass |
| Intro | Reconcile order events, one processor payout, and bank deposits. | 9 | Pass |
| Link label | Live product | 2 | Pass |
| Link label | Try the completed sample | 4 | Pass |
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
| Body | It is not accounting, legal, or tax advice. | 8 | Pass |
| H2 | Run locally | 2 | Pass |
| Body | Use Node.js 22 or newer. | 5 | Pass; environment requirement |
| Body | Open the printed URL. | 4 | Pass |
| Body | Use `/demo` for the isolated sample. | 6 | Pass — `demo-ready`, `demo-isolation` |
| H2 | Test and build | 3 | Pass |
| Body | Every visitor-facing claim is listed in `.factory/claims.json`. | 7 | **Fails because of F-4-1** |
| Body | Each entry names the browser test that proves it. | 9 | Pass for all 17 entries |
| Body | The build writes the installable offline site to `dist/`. | 9 | Pass — `build-output`, `offline-reload` |
| Body | Playwright is pinned to version `1.58.2`. | 6 | Pass; `package.json` |
| H2 | CSV expectations | 2 | Pass |
| Body | Use one currency and one payout period. | 7 | Pass |
| Body | Confirm the suggested mapping before reconciling real files. | 8 | Pass |
| Bullet | Order events CSV: date and amount are required. | 8 | Pass — `required-columns` |
| Bullet | Processor payout CSV: date and net amount are required. | 9 | Pass — `required-columns` |
| Bullet | Bank deposits CSV: date and amount are required. | 8 | Pass — `required-columns` |
| Body | The `required-columns` browser test removes and repairs every required mapping. | 10 | Pass |
| H2 | Privacy and storage | 3 | Pass |
| Body | The browser’s built-in database stores the current draft, saved history, and mapping presets. | 13 | Pass — `draft-persistence`, `saved-history-license` |
| Body | Browser storage keeps the license token and latest check result. | 10 | Pass — `license-verification-privacy` |
| Link sentence | Read the product’s privacy page and terms. | 7 | Pass |
| H2 | Deployment | 1 | Pass |
| Body | Run `npm run build`, then deploy the site files in `dist/`. | 11 | Pass — `build-output` |
| Body | The factory owns infrastructure and DNS. | 6 | Pass |
| Body | Purchase and license checks use product-specific Sociobot URLs. | 8 | Pass — `hosted-checkout`, `license-verification-privacy` |
| Body | The app contains no card form or payment-provider script. | 9 | Pass — `hosted-checkout` |
| H2 | Project notes | 2 | Pass |
| Link label | Demo sandbox | 2 | Pass |
| Link label | Visual system | 2 | Pass |
| Link label | Repair handoff | 2 | **Misnamed — F-4-3** |
| Link label | MIT license | 2 | Pass |

### Terminology

| Concept | Term used consistently |
| --- | --- |
| Source orders, refunds, and fees | Order events CSV |
| Processor-sent total | Processor payout |
| Amounts received | Bank deposits CSV |
| Tryable seed | Sample data |
| Paid saved-work feature | Saved-history license |
| Export for an accountant | Accountant report or accountant PDF |

## Demo and sandbox behavior

- One activation from the cold landing page opens `/demo` with the persistent “Demo — sample data, nothing is saved” banner, **Reset demo**, **Start for real**, `Sample payout PO-0822`, a balanced result, and export controls.
- The phone's first post-click viewport already shows the sample name and the beginning of the balanced result. The desktop viewport shows `$168.62` expected, reported, and deposited, with `$0.00` remaining variance.
- Reset restores the completed sample. Start for real removes `demo:payout-reconciliation-explainer` and preserves a seeded record in `payout-reconciliation-explainer`.
- The complete live demo/export request log is same-origin. No console or page error occurs.
- A dedicated live context reloads the completed demo offline.
- The direct-entry scroll defect is limited to F-4-2; the landing-page one-click path begins at the demo heading.

Evidence: [phone one-click demo](evidence/review-4-live-mobile-demo-first-screen.png), [desktop one-click demo](evidence/review-4-live-desktop-demo-first-screen.png), and the live `@claim:demo-isolation`, `@claim:local-privacy`, and `@claim:offline-reload` runs.

## Registered claims

The remote clean clone at `/tmp/payout-review4-clean` matched candidate `43acce9c`. `npm ci` completed with zero audit findings. Every exact command from `.factory/claims.json` ran separately.

| Claim | Command result | Review result |
| --- | --- | --- |
| `demo-ready` | PASS | Confirmed |
| `demo-isolation` | PASS | Confirmed |
| `local-privacy` | PASS | Confirmed |
| `file-limits` | PASS | Confirmed |
| `free-exports` | PASS | Confirmed |
| `backup-roundtrip` | PASS | Confirmed |
| `offline-reload` | PASS | Confirmed in its own context |
| `draft-persistence` | PASS | Confirmed |
| `saved-history-license` | PASS | Confirmed |
| `license-verification-privacy` | PASS | Confirmed |
| `hosted-checkout` | PASS | Confirmed |
| `required-columns` | PASS | Confirmed |
| `erase-scope` | PASS | Confirmed |
| `visible-reconciliation` | PASS | Confirmed |
| `calculation-rules` | PASS | Confirmed |
| `no-integrations` | PASS | Confirmed |
| `build-output` | PASS | Confirmed |

Each registered ID appears exactly once in `tests/e2e/app.spec.ts`. F-4-1 is the only claim-like visitor sentence found without a registry entry.

## Earlier findings checked from scratch

| Earlier finding | Live and code result |
| --- | --- |
| F-1-1 first-screen clarity | Fixed: the job, audience, first action, result, and three facts appear at both widths. |
| F-1-2 completed one-click demo | Fixed: the first activation opens a completed result with banner, reset, exit, and exports. |
| F-1-3 demo isolation | Fixed: code selects `demo:payout-reconciliation-explainer`; live seeded real data survives reset and exit. |
| F-1-4 direct demo route | Functionally fixed: `/demo` and `?demo=1` open the completed sample. Initial position remains the new F-4-2. |
| F-1-5 claims contract | Fixed for the 17 registered product claims; all exact commands pass. The new footer audit exposes F-4-1. |
| F-1-6 titles, metadata, and 404 | Fixed: every route has route-specific metadata; a cold unknown URL returns HTTP 404 and the designed page. |
| F-1-7 navigation and route focus | Fixed: shared navigation, skip link, History API, h1 focus, announcement, and Back behavior pass. |
| F-1-8 landing structure | Fixed: hero, live workbench, three steps, scope/privacy, paid section, and footer appear in order. |
| F-1-9 AVIF MIME | Fixed: live `balance-field-720.avif` returns `image/avif` with `nosniff`. |
| F-1-10 copy and terms | Fixed: current product terms are consistent; no sentence exceeds 22 words or uses a banned marketing adjective. |
| F-2-1 visible source rows | Fixed: the demo shows source tables with filenames, row numbers, mapped values, and original values. |
| F-2-2 export evidence | Fixed: CSV, PDF, print, and JSON checks inspect known row evidence. |
| F-2-3 paid feature exercise | Fixed: the tagged test saves, reloads, reopens, reuses, and deletes paid history/preset data. |
| F-2-4 license-token wording | Fixed: copy and request behavior state local storage plus Sociobot verification. |
| F-2-5 hosted-checkout wording | Fixed: the product names the observable hosted checkout and embeds no payment form. |
| F-2-6 required mappings | Fixed: all six required mappings and recovery paths pass. |
| F-2-7 one-click claim coverage | Fixed: the tagged test starts at `/` and performs one activation. |
| F-2-8 terminology and plain copy | Fixed: current terms are consistent and prior vague/technical phrases are absent. |
| F-3-1 backup round trip | Fixed: files, changed mapping, explanation, and recalculated result restore in the tagged test. |
| F-3-2 calculation rules | Fixed: the tagged fixtures cover named refund types, fee signs, explanations, and USD/JPY/BHD precision. |

The previous handoff's direct-demo scroll gap is not fixed; it is now recorded as F-4-2.

## Structure, links, accessibility, and visual identity

- `/`, `/demo`, `/privacy/`, and `/terms/` return 200. A cold `/does-not-exist` returns 404. A service-worker-controlled revisit returns the designed client 404.
- Each product route has `lang=en`, one h1, one main, one header, one footer, a route-specific title, description, canonical, Open Graph/Twitter metadata, SVG favicon, and 180 × 180 touch icon.
- The Open Graph image is the product-owned 1200 × 630 balance-field image.
- Root, demo, Privacy, Terms, manifest, robots, sitemap, social image, touch icon, source repository, and product checkout targets respond. The checkout returns the expected 303 without following it.
- Internal navigation and Back focus the new h1 and update the polite live region. The first Tab focuses the skip link.
- The full live browser suite passes 44 checks with two expected duplicate offline-project skips. Its axe integration reports no serious or critical violations across all routes, both viewports, and both themes. All visible 390 px controls meet the 44 px target check.
- The factory URL verifier reports no console errors on root or demo, one h1, one main, `lang=en`, complete image alternatives, and labelled buttons. Evidence: [root verifier](evidence/review-4-verify-root/verify.json) and [demo verifier](evidence/review-4-verify-demo/verify.json).
- Reduced-motion rules are present. The production app JavaScript is 53.60 KB raw and 17.54 KB gzip.
- The ruled-paper grid, clipped transaction geometry, generated balance-field art, teal/amber/violet accents, and mono figures match `.factory/design.md`. The site does not resemble a generic centered-gradient SaaS template.

## Other verification

- `npm test`: 14/14 passed.
- `npm run typecheck`: passed.
- `npm run build`: passed; `dist/` and service worker revision `a7dcd64ff734` were produced.
- `PLAYWRIGHT_BASE_URL=https://payout-reconciliation-explainer.sociobot.in npm run test:e2e`: 44 passed, 2 expected skips.
- Claim tag count: every registered ID appears exactly once.

## Missed leverage

No additional AI feature is justified. This product needs deterministic financial arithmetic, visible rules, and offline privacy. Three CSV imports, JSON restore, four export formats, and optional local saved history cover the useful import/export path. Sync and direct commerce/bank connections are explicit non-goals in the brief.

## What would make this perfect

Remove or register and test the footer's artwork-origin statement. Stop the initial completed-sample seed from scrolling a direct `/demo` visit past its h1 and sample name, and add a fresh-context regression test at both widths. Rename the README's “Repair handoff” link to match the current document. Rerun the claim matrix and full live suite. With those three findings closed, this review found no other remaining work.
