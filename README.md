# Payout Reconciliation Explainer

A local payout tool for small ecommerce operators and bookkeepers. Reconcile order events, one processor payout, and a bank deposit.

Live product: <https://payout-reconciliation-explainer.sociobot.in>

Try the completed sample: <https://payout-reconciliation-explainer.sociobot.in/demo>

## What it does

- Shows a completed sample reconciliation in one click. (`demo-ready`)
- Keeps sample work separate from real drafts. (`demo-isolation`)
- Shows source rows and arithmetic in the result. (`visible-reconciliation`)
- Exports CSV, accountant PDF, print, and JSON files for free. (`free-exports`)
- Keeps the current real draft after refresh. (`draft-persistence`)
- Reloads the completed sample offline after its first visit. (`offline-reload`)
- Rejects CSVs without headers, above 10 MB, or above 50,000 rows. (`file-limits`)
- Sends no CSV data, analytics, or tracking requests during reconciliation. (`local-privacy`)
- Adds saved history and reusable mappings with an optional US $19 license. (`saved-history-license`)
- Removes only the current draft when you confirm “Erase current draft.” (`erase-scope`)

The app has no bank connection, commerce connection, or ledger-posting action. (`no-integrations`)

This is a reconciliation aid. It is not accounting, legal, or tax advice.

## Run locally

Use Node.js 22 or newer.

```bash
npm ci
npm run dev
```

Open the printed URL. Use `/demo` for the isolated sample.

## Test and build

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
```

Every visitor-facing claim is listed in [`.factory/claims.json`](.factory/claims.json). Each entry names its exact browser test.

The build writes the static PWA to `dist/`. Playwright is pinned to version `1.58.2`.

## CSV expectations

Use one currency and one payout period. Confirm the suggested mapping before reconciling real files.

- Order events CSV: date and amount are required.
- Processor payout CSV: date and net amount are required.
- Bank deposit CSV: date and amount are required.

## Privacy and storage

The current draft, saved history, and mapping presets use IndexedDB. The license token and cached verdict use localStorage.

Read the product’s [privacy page](https://payout-reconciliation-explainer.sociobot.in/privacy/) and [terms](https://payout-reconciliation-explainer.sociobot.in/terms/).

## Deployment

Run `npm run build`, then deploy `dist/` as the configured static artifact. The factory owns infrastructure and DNS.

The checkout and license verification URLs use the Sociobot billing contract. No payment provider identifier is embedded in this app.

## Project notes

- [Demo sandbox](.factory/demo.md)
- [Visual system](.factory/design.md)
- [Repair handoff](.factory/handoff.md)
- [MIT license](LICENSE)
