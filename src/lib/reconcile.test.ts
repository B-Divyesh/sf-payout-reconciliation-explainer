import { describe, expect, it } from 'vitest';
import { parseCsv } from './csv';
import { accountantPdfBlob } from './export';
import { reconcile, suggestMapping, validateManualAdjustment } from './reconcile';
import type { AppState, DatasetKind } from './types';

function fixture(bankAmount = '168.62'): AppState {
  const texts: Record<DatasetKind, string> = {
    events: 'order_id,date,type,amount,fee,currency\nA,2026-08-01,sale,120.00,3.78,USD\nB,2026-08-02,sale,80.00,2.60,USD\nR,2026-08-03,refund,-25.00,0,USD',
    payout: 'payout_id,date,net,currency\nP1,2026-08-04,168.62,USD',
    bank: `date,reference,amount,currency\n2026-08-05,P1,${bankAmount},USD`,
  };
  const datasets: AppState['datasets'] = {};
  const mappings: AppState['mappings'] = {};
  for (const kind of ['events', 'payout', 'bank'] as DatasetKind[]) {
    datasets[kind] = parseCsv(texts[kind], kind);
    mappings[kind] = suggestMapping(datasets[kind]!);
  }
  return { version: 1, datasets, mappings, mappingConfirmed: true, currency: 'USD', adjustments: [], reconciliationName: 'August batch', updatedAt: new Date().toISOString() };
}

describe('transparent reconciliation', () => {
  it('balances orders, refunds, fees, payout, and bank in minor units', () => {
    const state = fixture();
    const result = reconcile(state.datasets, state.mappings, state.currency, []);
    expect(result.ordersMinor).toBe(20_000);
    expect(result.refundsMinor).toBe(2_500);
    expect(result.eventFeesMinor).toBe(638);
    expect(result.expectedPayoutMinor).toBe(16_862);
    expect(result.status).toBe('balanced');
    expect(result.explainedPercent).toBe(100);
  });

  it('tracks a signed manual explanation without changing source totals', () => {
    const state = fixture('168.50');
    const initial = reconcile(state.datasets, state.mappings, state.currency, []);
    expect(initial.rawBankVarianceMinor).toBe(-12);
    expect(initial.status).toBe('review');
    const explained = reconcile(state.datasets, state.mappings, state.currency, [{ id: 'x', category: 'rounding', amountMinor: -12, note: 'Bank rounding', createdAt: '2026-08-05T00:00:00Z' }]);
    expect(explained.remainingVarianceMinor).toBe(0);
    expect(explained.status).toBe('explained');
    expect(explained.explainedPercent).toBe(100);
  });

  it('never marks a settled payout balanced after an unsupported adjustment', () => {
    const state = fixture();
    const falselyAdjusted = reconcile(state.datasets, state.mappings, state.currency, [{ id: 'x', category: 'rounding', amountMinor: 12, note: 'Unsupported', createdAt: '2026-08-05T00:00:00Z' }]);
    expect(falselyAdjusted.rawBankVarianceMinor).toBe(0);
    expect(falselyAdjusted.remainingVarianceMinor).toBe(-12);
    expect(falselyAdjusted.status).toBe('review');
    expect(falselyAdjusted.explainedPercent).toBe(0);
    expect(() => validateManualAdjustment(reconcile(state.datasets, state.mappings, state.currency, []), 12)).toThrow(/No manual explanation is needed/i);
  });

  it('rejects manual explanations that reverse or overstate the remaining variance', () => {
    const state = fixture('168.50');
    const initial = reconcile(state.datasets, state.mappings, state.currency, []);
    expect(() => validateManualAdjustment(initial, 12)).toThrow(/same sign/i);
    expect(() => validateManualAdjustment(initial, -13)).toThrow(/cannot exceed/i);
  });

  it('rejects mixed currency evidence', () => {
    const state = fixture();
    state.datasets.bank!.rows[0]!.currency = 'EUR';
    expect(() => reconcile(state.datasets, state.mappings, 'USD', [])).toThrow(/Split currencies/i);
  });

  it('produces a real PDF document for handoff', async () => {
    const state = fixture();
    const result = reconcile(state.datasets, state.mappings, state.currency, []);
    const blob = accountantPdfBlob(state, result);
    expect(blob.type).toBe('application/pdf');
    expect(await blob.text()).toMatch(/^%PDF-1.4/);
  });
});
