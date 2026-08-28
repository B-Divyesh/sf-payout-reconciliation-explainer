export type DatasetKind = 'events' | 'payout' | 'bank';

export interface CsvData {
  kind: DatasetKind;
  fileName: string;
  headers: string[];
  rows: Record<string, string>[];
  importedAt: string;
}

export interface ColumnMapping {
  id?: string;
  date: string;
  amount?: string;
  type?: string;
  fee?: string;
  payoutRef?: string;
  net?: string;
  gross?: string;
  refunds?: string;
  fees?: string;
  reference?: string;
  currency?: string;
}

export type Mappings = Partial<Record<DatasetKind, ColumnMapping>>;

export interface ManualAdjustment {
  id: string;
  category: 'timing' | 'bank-fee' | 'rounding' | 'other';
  amountMinor: number;
  note: string;
  createdAt: string;
}

export interface NormalizedRecord {
  source: DatasetKind;
  row: number;
  id: string;
  date: string;
  amountMinor: number;
  feeMinor?: number;
  type?: string;
  payoutRef?: string;
  currency?: string;
  original: Record<string, string>;
}

export interface WaterfallItem {
  key: string;
  label: string;
  amountMinor: number;
  runningMinor: number;
  tone: 'base' | 'refund' | 'fee' | 'timing' | 'total' | 'variance';
  explanation: string;
}

export interface ReconciliationResult {
  currency: string;
  decimals: number;
  ordersMinor: number;
  refundsMinor: number;
  eventFeesMinor: number;
  expectedPayoutMinor: number;
  payoutNetMinor: number;
  payoutDifferenceMinor: number;
  bankMinor: number;
  rawBankVarianceMinor: number;
  explainedAdjustmentsMinor: number;
  remainingVarianceMinor: number;
  explainedPercent: number;
  status: 'balanced' | 'explained' | 'review';
  waterfall: WaterfallItem[];
  events: NormalizedRecord[];
  payouts: NormalizedRecord[];
  banks: NormalizedRecord[];
  audit: string[];
}

export interface AppState {
  version: 1;
  datasets: Partial<Record<DatasetKind, CsvData>>;
  mappings: Mappings;
  mappingConfirmed: boolean;
  currency: string;
  adjustments: ManualAdjustment[];
  reconciliationName: string;
  result?: ReconciliationResult;
  updatedAt: string;
}

export interface SavedReconciliation {
  id: string;
  name: string;
  savedAt: string;
  state: AppState;
}
