import { escapeCsv } from './csv';
import { formatMoney, minorToDecimal } from './money';
import type { AppState, ReconciliationResult } from './types';

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeName(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'reconciliation';
}

export function exportReconcilerCsv(state: AppState, result: ReconciliationResult): void {
  const headers = ['source', 'row', 'record_id', 'date', 'category', 'amount', 'currency', 'status', 'note'];
  const lines: (string | number)[][] = [headers];
  for (const row of result.events) {
    const refund = /refund|chargeback|return|reversal/i.test(row.type ?? '') || row.amountMinor < 0;
    lines.push(['events', row.row, row.id, row.date, refund ? 'refund' : 'order', minorToDecimal(row.amountMinor, result.decimals), result.currency, 'included', row.payoutRef ? `Payout reference: ${row.payoutRef}` : '']);
  }
  for (const row of result.payouts) {
    lines.push(['payout', row.row, row.id, row.date, 'reported payout net', minorToDecimal(row.amountMinor, result.decimals), result.currency, 'included', '']);
  }
  for (const row of result.banks) {
    lines.push(['bank', row.row, row.id, row.date, 'bank deposits', minorToDecimal(row.amountMinor, result.decimals), result.currency, 'included', '']);
  }
  for (const adjustment of state.adjustments) {
    lines.push(['explanation', '', adjustment.id, adjustment.createdAt.slice(0, 10), adjustment.category, minorToDecimal(adjustment.amountMinor, result.decimals), result.currency, 'user explained', adjustment.note]);
  }
  lines.push(['summary', '', '', '', 'remaining variance', minorToDecimal(result.remainingVarianceMinor, result.decimals), result.currency, result.status, `${result.explainedPercent.toFixed(1)}% of payout-to-bank variance explained`]);
  const csv = lines.map((line) => line.map(escapeCsv).join(',')).join('\r\n');
  downloadBlob(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }), `${safeName(state.reconciliationName)}-reconciler.csv`);
}

function ascii(value: string): string {
  return value.normalize('NFKD').replace(/[^\x20-\x7E]/g, (char) => char === '−' ? '-' : '?');
}

function wrap(text: string, width = 88): string[] {
  const words = ascii(text).split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (`${line} ${word}`.trim().length > width) { if (line) lines.push(line); line = word; }
    else line = `${line} ${word}`.trim();
  }
  if (line) lines.push(line);
  return lines;
}

function pdfEscape(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
}

function makePdfPages(lines: { text: string; bold?: boolean }[]): string[][] {
  const expanded = lines.flatMap((line) => wrap(line.text).map((text) => `${line.bold ? 'B' : 'R'}|${text}`));
  const pages: string[][] = [];
  for (let index = 0; index < expanded.length; index += 50) pages.push(expanded.slice(index, index + 50));
  return pages.length ? pages : [[]];
}

export function accountantPdfBlob(state: AppState, result: ReconciliationResult): Blob {
  const money = (value: number) => formatMoney(value, result.currency, result.decimals);
  const lines: { text: string; bold?: boolean }[] = [
    { text: 'PAYOUT RECONCILIATION HANDOFF', bold: true },
    { text: state.reconciliationName || 'Untitled reconciliation', bold: true },
    { text: `Prepared locally ${new Date().toISOString().slice(0, 10)} | Currency ${result.currency}` },
    { text: '' },
    { text: 'RESULT', bold: true },
    { text: `${result.status.toUpperCase()} | ${result.explainedPercent.toFixed(1)}% of payout-to-bank variance explained` },
    { text: `Gross order events: ${money(result.ordersMinor)}` },
    { text: `Refunds and reversals: -${money(result.refundsMinor)}` },
    { text: `Event fees: -${money(result.eventFeesMinor)}` },
    { text: `Expected processor payout: ${money(result.expectedPayoutMinor)}` },
    { text: `Reported payout net: ${money(result.payoutNetMinor)}` },
    { text: `Bank deposits: ${money(result.bankMinor)}` },
    { text: `Raw payout-to-bank variance: ${money(result.rawBankVarianceMinor)}` },
    { text: `Remaining variance after explanations: ${money(result.remainingVarianceMinor)}` },
    { text: '' },
    { text: 'USER EXPLANATIONS', bold: true },
    ...(state.adjustments.length ? state.adjustments.map((item) => ({ text: `${item.category}: ${money(item.amountMinor)} - ${item.note}` })) : [{ text: 'None.' }]),
    { text: '' },
    { text: 'VISIBLE RULES', bold: true },
    ...result.audit.map((text) => ({ text: `- ${text}` })),
    { text: '' },
    { text: 'SOURCE EVIDENCE', bold: true },
    ...([
      ['Order events', state.datasets.events?.fileName ?? '', result.events],
      ['Processor payout', state.datasets.payout?.fileName ?? '', result.payouts],
      ['Bank deposits', state.datasets.bank?.fileName ?? '', result.banks],
    ] as const).flatMap(([label, fileName, rows]) => [
      { text: `${label}: ${fileName} (${rows.length} rows)`, bold: true },
      ...rows.map((row) => ({ text: `Source row ${row.row} | ID ${row.id} | Date ${row.date} | Amount ${minorToDecimal(row.amountMinor, result.decimals)} ${result.currency} | Original ${Object.entries(row.original).map(([key, value]) => `${key}=${value}`).join('; ')}` })),
    ]),
    { text: '' },
    { text: 'This is a reconciliation aid, not accounting or tax advice. Source files remain on the user device.' },
  ];
  const pages = makePdfPages(lines);
  const objects: string[] = ['', '', '', ''];
  const pageIds: number[] = [];
  pages.forEach((page, pageIndex) => {
    const pageId = 5 + pageIndex * 2;
    const contentId = pageId + 1;
    pageIds.push(pageId);
    let y = 758;
    const commands = page.map((entry) => {
      const [kind, ...rest] = entry.split('|');
      const text = rest.join('|');
      const command = `BT /F${kind === 'B' ? '2' : '1'} ${kind === 'B' ? '11' : '9'} Tf 54 ${y} Td (${pdfEscape(text)}) Tj ET`;
      y -= kind === 'B' ? 18 : 14;
      return command;
    }).join('\n');
    objects[pageId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId - 1] = `<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`;
  });
  objects[0] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  objects[2] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';
  let pdf = '%PDF-1.4\n%PAYOUT\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}

export function exportPdf(state: AppState, result: ReconciliationResult): void {
  downloadBlob(accountantPdfBlob(state, result), `${safeName(state.reconciliationName)}-accountant-handoff.pdf`);
}

export function exportBackup(state: AppState): void {
  downloadBlob(new Blob([JSON.stringify({ product: 'payout-reconciliation-explainer', exportedAt: new Date().toISOString(), state }, null, 2)], { type: 'application/json' }), `${safeName(state.reconciliationName)}-backup.json`);
}
