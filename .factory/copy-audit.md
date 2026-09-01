# Copy audit — polish round 2

Audited 1 September 2026 from the rendered landing page at 390 × 844 and 1440 × 900. Counts treat a currency amount as one word. No sentence exceeds 22 words. No banned marketing word appears.

## First screen

| Copy unit | Words | Result |
| --- | ---: | --- |
| Reconcile one payout | 3 | Pass |
| Reconcile a payout with order events and bank deposits. | 9 | Pass |
| For ecommerce operators and bookkeepers who need to explain a payout difference. | 12 | Pass |
| Try it with sample data | 5 | Pass |
| See a completed reconciliation and download its accountant report. | 9 | Pass |
| Import my CSVs | 3 | Pass |
| CSV data stays in this browser | 6 | Pass — `local-privacy` |
| No account | 2 | Pass — `local-privacy` |
| Free exports | 2 | Pass — `free-exports` |
| Order events · Processor payout · Bank deposits | 6 | Pass |

The headline states the job in nine words. The next sentence names the user. The sample action is the only filled first action and states its result beside it.

## Reconciliation workspace

| Copy unit | Words | Result |
| --- | ---: | --- |
| Add files / Map columns / Reconcile / Hand off | 7 | Pass |
| Reconciliation workspace | 2 | Pass |
| Reconcile one payout period | 4 | Pass |
| Use one currency and one payout period. | 7 | Pass |
| Step 01 · Add evidence | 4 | Pass |
| Add three source files | 4 | Pass |
| The app reads each CSV in this browser. | 8 | Pass — `local-privacy` |
| Try it with sample data | 5 | Pass |
| Order events | 2 | Pass |
| Sales, refunds, and processor fees. | 5 | Pass |
| Choose order events CSV | 4 | Pass |
| Processor payout | 2 | Pass |
| The batch total the processor says it sent. | 8 | Pass |
| Choose processor payout CSV | 4 | Pass |
| Bank deposits | 2 | Pass |
| The amounts that reached the bank. | 6 | Pass |
| Choose bank deposits CSV | 4 | Pass |
| Maximum 10 MB and 50,000 data rows. | 7 | Pass — `file-limits` |
| A header row is required. | 6 | Pass — `file-limits` |

## Explanation, limits, and purchase

| Copy unit | Words | Result |
| --- | ---: | --- |
| Three steps | 2 | Pass |
| How it works | 3 | Pass |
| Add three CSVs | 3 | Pass |
| Choose an order events CSV, processor payout, and bank deposits CSV. | 10 | Pass |
| Check the column mappings | 4 | Pass |
| Confirm dates, amounts, fees, and identifiers before calculating. | 8 | Pass |
| Export the explanation | 3 | Pass |
| Review the waterfall, then export CSV, PDF, print, or JSON. | 10 | Pass — `free-exports` |
| Scope and privacy | 3 | Pass |
| What this app does not do | 6 | Pass |
| It does not connect to banks or commerce platforms. | 9 | Pass — `no-integrations` |
| It does not create or post ledger entries. | 8 | Pass — `no-integrations` |
| It does not provide accounting, legal, or tax advice. | 9 | Pass |
| It does not send CSV contents to a server. | 9 | Pass — `local-privacy` |
| Optional saved-history license | 3 | Pass |
| Save past reconciliations | 3 | Pass |
| Pay US $19 once to add named history and reusable column mappings on this device. | 15 | Pass — `saved-history-license` |
| Reconciliation and every export remain free. | 6 | Pass — `free-exports` |
| Buy saved history for US $19 | 6 | Pass |
| One-time purchase. | 2 | Pass — `saved-history-license` |
| Payment opens on Sociobot’s hosted checkout. | 6 | Pass — `hosted-checkout` |
| Read purchase terms. | 3 | Pass |
| Have a license? | 3 | Pass |
| Paste it here. | 3 | Pass |
| Stored in this browser. | 4 | Pass — `license-verification-privacy` |
| Sent to Sociobot only for license checks. | 7 | Pass — `license-verification-privacy` |
| Saved reconciliations | 2 | Pass |
| Your current draft remains after a refresh. | 8 | Pass — `draft-persistence` |
| The license adds named history and reusable mappings. | 8 | Pass — `saved-history-license` |
| Back up or remove local data | 6 | Pass |
| The JSON backup contains your current files, mappings, and explanations. | 10 | Pass — `free-exports` |
| Export JSON backup / Import JSON backup / Erase current draft | 9 | Pass |

## Dialog, footer, and conditional states

| Copy unit | Words | Result |
| --- | ---: | --- |
| Erase the current draft? | 4 | Pass |
| This removes the active draft and its imported CSV contents. | 10 | Pass — `erase-scope` |
| Saved history remains. | 3 | Pass — `erase-scope` |
| Erase current draft / Keep working | 5 | Pass |
| No saved reconciliations yet. | 4 | Pass |
| Run one, then save it here. | 6 | Pass |
| Saved history is active. | 4 | Pass |
| Explain one payout from local CSV files. | 7 | Pass |
| Original generated artwork. | 3 | Pass |
| Version 1.1 · Built by Param Factory. | 6 | Pass |

## Terminology

| Concept | One term used |
| --- | --- |
| Source orders, refunds, and fees | Order events CSV |
| Processor-sent total | Processor payout |
| Amounts received | Bank deposits CSV |
| Tryable seed | Sample data |
| Paid saved-work feature | Saved-history license |
| Export for an accountant | Accountant report or accountant PDF |

README, Privacy, and Terms were checked separately. Their prose contains no sentence above 22 words. Technical storage terms were replaced with plain explanations. “Merchant of record,” “static PWA,” “configured static artifact,” and “billing contract” no longer appear in current visitor or README copy.
