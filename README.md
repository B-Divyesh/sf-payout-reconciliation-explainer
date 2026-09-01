# Payout Reconciliation Explainer

A local payout tool for small ecommerce operators and bookkeepers. Reconcile order events, one processor payout, and bank deposits.

Live product: <https://payout-reconciliation-explainer.sociobot.in>

Try the completed sample: <https://payout-reconciliation-explainer.sociobot.in/demo>

## What it does

- Shows a completed sample reconciliation in one click. (`demo-ready`)
- Keeps sample work separate from real drafts. (`demo-isolation`)
- Shows source rows and arithmetic in the result. (`visible-reconciliation`)
- Exports a row-level CSV, accountant PDF, printable report, and JSON backup without a license. (`free-exports`)
- Restores files, mappings, explanations, and recalculated results from a JSON backup. (`backup-roundtrip`)
- Applies mapped-row rules for refunds, fees, currencies, and signed explanations. (`calculation-rules`)
- Keeps the current real draft after refresh. (`draft-persistence`)
- Reloads the completed sample offline after its first visit. (`offline-reload`)
- Rejects CSVs without headers, above 10 MB, or above 50,000 rows. (`file-limits`)
- Sends no CSV data, analytics, or tracking requests during reconciliation. (`local-privacy`)
- Adds saved history and reusable mappings with an optional US $19 license. (`saved-history-license`)
- Stores a license token here and sends it only for license checks. CSV contents are excluded. (`license-verification-privacy`)
- Opens payment on Sociobot’s hosted checkout. This app has no card form. (`hosted-checkout`)
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

Every visitor-facing claim is listed in [`.factory/claims.json`](.factory/claims.json). Each entry names the browser test that proves it.

The build writes the installable offline site to `dist/`. Playwright is pinned to version `1.58.2`.

## CSV expectations

Use one currency and one payout period. Confirm the suggested mapping before reconciling real files.

- Order events CSV: date and amount are required.
- Processor payout CSV: date and net amount are required.
- Bank deposits CSV: date and amount are required.

The `required-columns` browser test removes and repairs every required mapping.

## Privacy and storage

The browser’s built-in database stores the current draft, saved history, and mapping presets. Browser storage keeps the license token and latest check result.

Read the product’s [privacy page](https://payout-reconciliation-explainer.sociobot.in/privacy/) and [terms](https://payout-reconciliation-explainer.sociobot.in/terms/).

## Deployment

Run `npm run build`, then deploy the site files in `dist/`. The factory owns infrastructure and DNS.

Purchase and license checks use product-specific Sociobot URLs. The app contains no card form or payment-provider script. (`hosted-checkout`)

## Project notes

- [Demo sandbox](.factory/demo.md)
- [Visual system](.factory/design.md)
- [Repair handoff](.factory/handoff.md)
- [MIT license](LICENSE)
