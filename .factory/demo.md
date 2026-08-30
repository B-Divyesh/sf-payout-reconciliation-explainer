# Demo sandbox

- URL: `https://payout-reconciliation-explainer.sociobot.in/demo` (`?demo=1` also works).
- Sample: three order events, one processor payout, and two bank-deposit rows for payout `PO-0822`.
- Ready state: the sample is mapped and reconciled before the demo appears.
- Storage: IndexedDB database `demo:payout-reconciliation-explainer`, separate from `payout-reconciliation-explainer`.
- Reset: **Reset demo** deletes only the demo database and recreates the original completed sample.
- Exit: **Start for real** deletes the demo database, then opens the untouched real draft.
