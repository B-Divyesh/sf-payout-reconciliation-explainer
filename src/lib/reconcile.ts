import { currencyDecimals, minorToDecimal, parseMoney } from './money';
import { suggestColumn } from './csv';
import type {
  AppState, ColumnMapping, CsvData, DatasetKind, ManualAdjustment,
  NormalizedRecord, ReconciliationResult, WaterfallItem,
} from './types';

const aliases: Record<DatasetKind, Record<string, string[]>> = {
  events: {
    id: ['orderid', 'transactionid', 'id', 'order'], date: ['date', 'createdat', 'processedat', 'timestamp'],
    amount: ['amount', 'gross', 'total', 'value'], type: ['type', 'eventtype', 'kind', 'status'],
    fee: ['fee', 'fees', 'processingfee'], payoutRef: ['payoutid', 'payoutref', 'batchid'], currency: ['currency', 'currencycode'],
  },
  payout: {
    id: ['payoutid', 'id', 'batchid', 'reference'], date: ['date', 'arrivaldate', 'paidat', 'createdat'],
    net: ['net', 'payoutamount', 'amount', 'total'], gross: ['gross', 'sales', 'charges'],
    refunds: ['refunds', 'refund'], fees: ['fees', 'fee'], currency: ['currency', 'currencycode'],
  },
  bank: {
    reference: ['reference', 'description', 'memo', 'payoutid', 'id'], date: ['date', 'posteddate', 'valuedate'],
    amount: ['amount', 'credit', 'deposit', 'value'], currency: ['currency', 'currencycode'],
  },
};

export function suggestMapping(data: CsvData): ColumnMapping {
  const fields = aliases[data.kind];
  return Object.fromEntries(Object.entries(fields).flatMap(([field, names]) => {
    const suggested = suggestColumn(data.headers, names);
    return suggested ? [[field, suggested]] : [];
  })) as unknown as ColumnMapping;
}

export function mappingRequirements(kind: DatasetKind): { field: keyof ColumnMapping; label: string; required: boolean; help: string }[] {
  if (kind === 'events') return [
    { field: 'id', label: 'Order / event ID', required: false, help: 'Used in the evidence export' },
    { field: 'date', label: 'Event date', required: true, help: 'Original date is retained' },
    { field: 'amount', label: 'Event amount', required: true, help: 'Sales positive; refunds negative or identified by type' },
    { field: 'type', label: 'Event type', required: false, help: 'Words like refund or chargeback become deductions' },
    { field: 'fee', label: 'Fee', required: false, help: 'Fees are treated as deductions' },
    { field: 'payoutRef', label: 'Payout reference', required: false, help: 'Recorded for audit matching' },
    { field: 'currency', label: 'Currency column', required: false, help: 'Checked against the selected currency' },
  ];
  if (kind === 'payout') return [
    { field: 'id', label: 'Payout ID', required: false, help: 'Used to match references' },
    { field: 'date', label: 'Payout date', required: true, help: 'Used for the audit trail' },
    { field: 'net', label: 'Net payout', required: true, help: 'Amount the processor says it sent' },
    { field: 'gross', label: 'Gross', required: false, help: 'Included as supporting evidence' },
    { field: 'refunds', label: 'Refunds', required: false, help: 'Included as supporting evidence' },
    { field: 'fees', label: 'Fees', required: false, help: 'Included as supporting evidence' },
    { field: 'currency', label: 'Currency column', required: false, help: 'Checked against the selected currency' },
  ];
  return [
    { field: 'reference', label: 'Bank reference', required: false, help: 'Used to compare payout IDs' },
    { field: 'date', label: 'Deposit date', required: true, help: 'Original bank date is retained' },
    { field: 'amount', label: 'Deposit amount', required: true, help: 'All imported rows are summed' },
    { field: 'currency', label: 'Currency column', required: false, help: 'Checked against the selected currency' },
  ];
}

function required(mapping: ColumnMapping, field: keyof ColumnMapping, kind: string): string {
  const value = mapping[field];
  if (!value) throw new Error(`Map the ${kind} “${String(field)}” column before reconciling.`);
  return value;
}

function normalize(
  data: CsvData,
  mapping: ColumnMapping,
  currency: string,
  decimals: number,
): NormalizedRecord[] {
  const amountField = data.kind === 'payout'
    ? required(mapping, 'net', 'payout')
    : required(mapping, 'amount', data.kind);
  const dateField = required(mapping, 'date', data.kind);
  return data.rows.map((row, index) => {
    const date = row[dateField]?.trim() ?? '';
    if (!date) throw new Error(`${data.fileName}, row ${index + 2}: the mapped date is empty.`);
    const rawAmount = row[amountField] ?? '';
    let amountMinor: number;
    try { amountMinor = parseMoney(rawAmount, decimals); }
    catch (error) { throw new Error(`${data.fileName}, row ${index + 2}: ${(error as Error).message}`); }
    const rowCurrency = mapping.currency ? row[mapping.currency]?.trim().toUpperCase() : undefined;
    if (rowCurrency && rowCurrency !== currency) {
      throw new Error(`${data.fileName}, row ${index + 2}: currency is ${rowCurrency}, not ${currency}. Split currencies into separate reconciliations.`);
    }
    const idField = data.kind === 'bank' ? mapping.reference : mapping.id;
    return {
      source: data.kind, row: index + 2, id: (idField ? row[idField] : '') || `${data.kind}-${index + 1}`,
      date, amountMinor,
      feeMinor: data.kind === 'events' && mapping.fee ? Math.abs(parseMoney(row[mapping.fee] ?? '', decimals)) : undefined,
      type: mapping.type ? row[mapping.type]?.trim() : undefined,
      payoutRef: mapping.payoutRef ? row[mapping.payoutRef]?.trim() : undefined,
      currency: rowCurrency, original: row,
    };
  });
}

export function reconcile(
  datasets: AppState['datasets'],
  mappings: AppState['mappings'],
  currencyInput: string,
  adjustments: ManualAdjustment[],
): ReconciliationResult {
  const currency = currencyInput.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Choose a three-letter ISO currency code.');
  const decimals = currencyDecimals(currency);
  const missing = (['events', 'payout', 'bank'] as DatasetKind[]).filter((kind) => !datasets[kind]);
  if (missing.length) throw new Error(`Add the ${missing.join(', ')} CSV${missing.length > 1 ? 's' : ''} first.`);
  const missingMappings = (['events', 'payout', 'bank'] as DatasetKind[]).filter((kind) => !mappings[kind]);
  if (missingMappings.length) throw new Error(`Confirm column mappings for ${missingMappings.join(', ')}.`);

  const events = normalize(datasets.events!, mappings.events!, currency, decimals);
  const payouts = normalize(datasets.payout!, mappings.payout!, currency, decimals);
  const banks = normalize(datasets.bank!, mappings.bank!, currency, decimals);

  let ordersMinor = 0;
  let refundsMinor = 0;
  let eventFeesMinor = 0;
  for (const event of events) {
    const isRefund = /refund|chargeback|return|reversal/i.test(event.type ?? '') || event.amountMinor < 0;
    if (isRefund) refundsMinor += Math.abs(event.amountMinor);
    else ordersMinor += event.amountMinor;
    eventFeesMinor += Math.abs(event.feeMinor ?? 0);
  }
  const expectedPayoutMinor = ordersMinor - refundsMinor - eventFeesMinor;
  const payoutNetMinor = payouts.reduce((sum, row) => sum + row.amountMinor, 0);
  const payoutDifferenceMinor = payoutNetMinor - expectedPayoutMinor;
  const bankMinor = banks.reduce((sum, row) => sum + row.amountMinor, 0);
  const rawBankVarianceMinor = bankMinor - payoutNetMinor;
  const explainedAdjustmentsMinor = adjustments.reduce((sum, adjustment) => sum + adjustment.amountMinor, 0);
  const remainingVarianceMinor = rawBankVarianceMinor - explainedAdjustmentsMinor;
  const explainedPercent = rawBankVarianceMinor === 0
    ? (Math.abs(remainingVarianceMinor) <= 1 ? 100 : 0)
    : Math.max(0, Math.min(100, (1 - Math.abs(remainingVarianceMinor) / Math.abs(rawBankVarianceMinor)) * 100));
  const tolerance = 1;
  const status = Math.abs(remainingVarianceMinor) <= tolerance
    ? (Math.abs(rawBankVarianceMinor) <= tolerance ? 'balanced' : 'explained')
    : 'review';

  let running = ordersMinor;
  const waterfall: WaterfallItem[] = [
    { key: 'orders', label: 'Gross order events', amountMinor: ordersMinor, runningMinor: running, tone: 'base', explanation: `${events.filter((event) => !(/refund|chargeback|return|reversal/i.test(event.type ?? '') || event.amountMinor < 0)).length} positive event rows` },
  ];
  running -= refundsMinor;
  waterfall.push({ key: 'refunds', label: 'Refunds & reversals', amountMinor: -refundsMinor, runningMinor: running, tone: 'refund', explanation: 'Negative values or refund-like event types' });
  running -= eventFeesMinor;
  waterfall.push({ key: 'fees', label: 'Event fees', amountMinor: -eventFeesMinor, runningMinor: running, tone: 'fee', explanation: 'Absolute value of the mapped fee column' });
  waterfall.push({ key: 'expected', label: 'Expected processor payout', amountMinor: 0, runningMinor: expectedPayoutMinor, tone: 'total', explanation: 'Gross orders − refunds − event fees' });
  running += payoutDifferenceMinor;
  waterfall.push({ key: 'payout-difference', label: 'Processor timing / file difference', amountMinor: payoutDifferenceMinor, runningMinor: running, tone: 'timing', explanation: 'Reported payout net − expected processor payout; review cutoff timing when non-zero' });
  waterfall.push({ key: 'payout', label: 'Reported payout net', amountMinor: 0, runningMinor: payoutNetMinor, tone: 'total', explanation: `${payouts.length} payout row${payouts.length === 1 ? '' : 's'} summed` });
  running += rawBankVarianceMinor;
  waterfall.push({ key: 'bank-variance', label: 'Payout-to-bank variance', amountMinor: rawBankVarianceMinor, runningMinor: running, tone: rawBankVarianceMinor === 0 ? 'total' : 'variance', explanation: 'Bank deposits − reported payout net' });
  waterfall.push({ key: 'bank', label: 'Bank deposits', amountMinor: 0, runningMinor: bankMinor, tone: 'total', explanation: `${banks.length} bank row${banks.length === 1 ? '' : 's'} summed` });

  const payoutIds = new Set(payouts.map((row) => row.id.toLocaleLowerCase()).filter(Boolean));
  const refMatches = banks.filter((row) => payoutIds.has(row.id.toLocaleLowerCase())).length;
  const eventRefs = events.filter((row) => row.payoutRef);
  const eventRefMatches = eventRefs.filter((row) => payoutIds.has(row.payoutRef!.toLocaleLowerCase())).length;
  let componentCheck = 'Processor component check: gross, refunds, and fees were not all mapped, so reported net is used directly.';
  const payoutMapping = mappings.payout!;
  if (payoutMapping.gross && payoutMapping.refunds && payoutMapping.fees) {
    const componentNet = datasets.payout!.rows.reduce((sum, row) => sum
      + parseMoney(row[payoutMapping.gross!] ?? '', decimals)
      - Math.abs(parseMoney(row[payoutMapping.refunds!] ?? '', decimals))
      - Math.abs(parseMoney(row[payoutMapping.fees!] ?? '', decimals)), 0);
    componentCheck = `Processor component check: gross − refunds − fees = ${minorToDecimal(componentNet, decimals)}; reported net differs by ${minorToDecimal(payoutNetMinor - componentNet, decimals)} ${currency}.`;
  }
  const audit = [
    `Currency precision: ${currency} uses ${decimals} decimal place${decimals === 1 ? '' : 's'}; calculations use integer minor units.`,
    `Events rule: positive rows count as orders; negative rows or types containing refund, chargeback, return, or reversal count as refunds.`,
    `Fee rule: ${mappings.events?.fee ? 'the mapped event-fee values are deducted by absolute value' : 'no event fee column was mapped'}.`,
    `Batch rule: all ${events.length} event, ${payouts.length} payout, and ${banks.length} bank rows in these files belong to this reconciliation.`,
    componentCheck,
    `Event reference rule: ${eventRefs.length ? `${eventRefMatches} of ${eventRefs.length} event payout references exactly matched an imported payout ID` : 'no event payout references were mapped'}.`,
    `Reference rule: ${mappings.payout?.id && mappings.bank?.reference ? `${refMatches} bank reference${refMatches === 1 ? '' : 's'} exactly matched a payout ID` : 'reference matching was not available; totals and the visible date evidence were used'}.`,
    `Manual explanations: ${adjustments.length} item${adjustments.length === 1 ? '' : 's'} account for the signed payout-to-bank variance only.`,
  ];

  return {
    currency, decimals, ordersMinor, refundsMinor, eventFeesMinor, expectedPayoutMinor, payoutNetMinor,
    payoutDifferenceMinor, bankMinor, rawBankVarianceMinor, explainedAdjustmentsMinor, remainingVarianceMinor,
    explainedPercent, status, waterfall, events, payouts, banks, audit,
  };
}

/**
 * Manual evidence is only meaningful when it reduces an outstanding
 * payout-to-bank variance. Keeping this rule outside the renderer makes
 * restored JSON drafts and future clients subject to the same guard.
 */
export function validateManualAdjustment(result: ReconciliationResult, amountMinor: number): void {
  const tolerance = 1;
  if (Math.abs(result.rawBankVarianceMinor) <= tolerance || Math.abs(result.remainingVarianceMinor) <= tolerance) {
    throw new Error('No manual explanation is needed: the payout-to-bank variance is already within one minor unit.');
  }
  if (Math.sign(amountMinor) !== Math.sign(result.remainingVarianceMinor)) {
    throw new Error('The explanation must use the same sign as the remaining variance.');
  }
  if (Math.abs(amountMinor) > Math.abs(result.remainingVarianceMinor)) {
    throw new Error('The explanation cannot exceed the remaining variance. Split or correct the evidence instead.');
  }
}
