# Payout Reconciliation Explainer

An offline-first web workbench for small ecommerce operators and bookkeepers. It explains one processor payout against order/refund events and bank deposits, keeps the arithmetic visible, and exports an evidence CSV plus a real accountant handoff PDF.

Live product: <https://payout-reconciliation-explainer.sociobot.in>

## What it does

- Imports orders/events, processor payout, and bank CSVs locally.
- Requires the user to review column mappings and a single ISO currency.
- Calculates in integer minor units, including zero- and three-decimal currencies.
- Separates orders, refunds, event fees, processor-file differences, and payout-to-bank variance in an auditable waterfall.
- Lets users document signed timing, bank-fee, rounding, or other evidence-backed differences.
- Exports a row-level reconciler CSV, accountant PDF, printable report, and full JSON backup.
- Persists the active draft in IndexedDB and works after refresh or offline installation.
- Offers an optional US $19 one-time Desk license for reusable mappings and named reconciliation history. The core workflow and every export remain free.

This is a reconciliation aid, not accounting or tax advice. It does not connect to banks or commerce platforms, create ledger entries, or upload financial files.

## Run locally

Requires Node.js 22 or newer.

```bash
npm ci
npm run dev
```

Open the printed local URL. “Use labelled example” provides a complete safe test path.

## Test and build

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
```

`npm run build` is the deployment command. It writes the static app to `./dist`, with `dist/index.html` at its root. The build step inlines the small entry CSS/JS into each HTML entry and generates a deterministic, versioned service worker so the workbench reloads reliably offline.

Playwright is pinned to `1.58.2`. The e2e suite checks the complete example workflow, downloads, axe serious/critical findings, 390 px layout, keyboard entry, console errors, draft persistence, and offline reload.

## CSV expectations

Every file needs a header row. The UI suggests likely columns but does not reconcile until the user reviews them.

- Orders/events: date and amount are required; ID, type, fee, payout reference, and currency are optional. Negative amounts or types containing `refund`, `chargeback`, `return`, or `reversal` become deductions.
- Processor payout: date and net are required; payout ID, gross, refunds, fees, and currency are optional.
- Bank: date and amount are required; reference and currency are optional.

All imported rows are treated as one payout period. Split currencies and unrelated batches before importing. Limits are 10 MB and 50,000 rows per file.

## Privacy and storage

CSV data never leaves the browser. The current draft, named history, and presets use IndexedDB. A license token and daily cached verdict use localStorage. There are no analytics, third-party runtime scripts, or CDN fonts. See `/privacy/` and `/terms/` in the app.

## Billing configuration

Checkout and verification use the Sociobot billing contract with the product slug in the path; no payment provider or product ID is embedded. Staging defaults to `https://pilot-api.sociobot.in`. The factory should set the release build explicitly:

```bash
VITE_BILLING_BASE=https://api.sociobot.in npm run build
```

## Project notes

- [Visual system](.factory/design.md)
- [Build handoff](.factory/handoff.md)
- [MIT license](LICENSE)
