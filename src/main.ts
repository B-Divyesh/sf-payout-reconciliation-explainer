import './styles/main.css';
import { parseCsv } from './lib/csv';
import { exportBackup, exportPdf, exportReconcilerCsv, downloadBlob } from './lib/export';
import { captureReturnedLicense, checkoutUrl, clearLicense, getLicenseState, storeLicense, type LicenseState } from './lib/license';
import { formatMoney, minorToDecimal, parseMoney } from './lib/money';
import { mappingRequirements, reconcile, suggestMapping, validateManualAdjustment } from './lib/reconcile';
import { clearDraft, deleteDemoStorage, deleteHistory, loadDraft, loadHistory, loadPresets, saveDraft, saveHistory, savePreset, useDemoStorage } from './lib/storage';
import type { AppState, ColumnMapping, DatasetKind, SavedReconciliation } from './lib/types';

const root = document.querySelector<HTMLDivElement>('#app')!;
const kinds: DatasetKind[] = ['events', 'payout', 'bank'];
const kindLabels: Record<DatasetKind, { title: string; description: string }> = {
  events: { title: 'Order events', description: 'Sales, refunds, and processor fees.' },
  payout: { title: 'Processor payout', description: 'The batch total the processor says it sent.' },
  bank: { title: 'Bank deposits', description: 'The amounts that reached the bank.' },
};
const emptyState = (): AppState => ({
  version: 1, datasets: {}, mappings: {}, mappingConfirmed: false, currency: 'USD', adjustments: [],
  reconciliationName: `Payout ${new Date().toISOString().slice(0, 10)}`, updatedAt: new Date().toISOString(),
});
let state: AppState = emptyState();
let license: LicenseState = { unlocked: false, checking: true, message: '' };
let historyItems: SavedReconciliation[] = [];
let presets: { name: string; value: unknown }[] = [];
let workspaceError = '';
let adjustmentError = '';
let liveMessage = '';
let updateRequested = false;
let isDemoMode = location.pathname.startsWith('/demo') || new URLSearchParams(location.search).get('demo') === '1';
let eraseReturnFocus: HTMLElement | null = null;

type BackupDocument = { product?: string; state?: unknown };

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);
}

function restoreBackup(document: BackupDocument): AppState {
  if (document.product !== 'payout-reconciliation-explainer' || !document.state || typeof document.state !== 'object') {
    throw new Error('This is not a compatible Payout Explainer backup.');
  }
  const restored = structuredClone(document.state) as Partial<AppState>;
  if (restored.version !== 1 || !restored.datasets || typeof restored.datasets !== 'object'
    || !restored.mappings || typeof restored.mappings !== 'object' || !Array.isArray(restored.adjustments)
    || typeof restored.currency !== 'string' || typeof restored.reconciliationName !== 'string') {
    throw new Error('This backup is missing reconciliation files, mappings, or explanations.');
  }
  for (const dataset of Object.values(restored.datasets)) {
    if (!dataset || !Array.isArray(dataset.headers) || !Array.isArray(dataset.rows) || typeof dataset.fileName !== 'string') {
      throw new Error('This backup has an invalid CSV dataset.');
    }
  }
  const next: AppState = {
    version: 1,
    datasets: restored.datasets,
    mappings: restored.mappings,
    mappingConfirmed: false,
    currency: restored.currency,
    adjustments: restored.adjustments,
    reconciliationName: restored.reconciliationName,
    updatedAt: new Date().toISOString(),
  };
  if (kinds.every((kind) => next.datasets[kind]) && kinds.every((kind) => next.mappings[kind])) {
    next.result = reconcile(next.datasets, next.mappings, next.currency, next.adjustments);
    next.mappingConfirmed = true;
  }
  return next;
}

function header(): string {
  return `<header class="site-header"><div class="container header-inner">
    <a class="brand" href="/" aria-label="Payout Reconciliation Explainer home"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span><span>Payout<br>Explainer</span></a>
    <nav class="site-nav" aria-label="Primary"><a href="/">Home</a><a href="/demo">Demo</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav>
    <div class="header-actions"><span id="offline-status" class="offline-pill" role="status">Offline · work remains available</span><button class="icon-button" type="button" data-action="theme" aria-label="Switch color theme" title="Switch color theme"><span aria-hidden="true">◐</span></button></div>
  </div></header>`;
}

function footer(): string {
  return `<footer class="site-footer"><div class="container footer-inner"><p>Explain one payout from local CSV files. Version 1.1 · Built by Param Factory.</p><nav class="footer-links" aria-label="Footer"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://github.com/B-Divyesh/sf-payout-reconciliation-explainer">Source on GitHub <span aria-hidden="true">↗</span></a></nav></div></footer>`;
}

function renderLegal(kind: 'privacy' | 'terms'): void {
  const privacy = `<article><p class="eyebrow">Effective 30 August 2026</p><h1 tabindex="-1">Privacy in plain words</h1><p class="measure">Financial CSV data stays in this browser during reconciliation.</p>
    <section><h2>Data on this device</h2><p>The browser stores your current draft, saved history, and mapping presets on this device.</p><p>It also stores your license token and the latest license result.</p></section>
    <section><h2>Network requests</h2><p>The app requests its own files and updates. It has no analytics or advertising trackers.</p><p>License verification sends only the license token to the Sociobot billing API. It never sends CSV contents.</p></section>
    <section><h2>Payments</h2><p>Payment opens on Sociobot’s hosted checkout. This app does not load a payment form or receive card details.</p></section>
    <section><h2>Your control</h2><p>Export your work before removing browser data. “Erase current draft” clears only the current draft.</p></section></article>`;
  const terms = `<article><p class="eyebrow">Effective 30 August 2026</p><h1 tabindex="-1">Plain-language terms</h1><p class="measure">This tool explains imported payout evidence. It does not replace your books, accountant, processor statement, or bank record.</p>
    <section><h2>Permitted use</h2><p>You may use the app for lawful reconciliation work. You remain responsible for checking source files, column mappings, signs, currencies, explanations, and exported reports.</p></section>
    <section><h2>No accounting or tax advice</h2><p>Results are arithmetic based on the visible rules and data you map. They are not accounting, legal, or tax advice and do not create journal entries or file anything on your behalf.</p></section>
    <section><h2>Saved-history license</h2><p>The optional license costs US $19 once. It adds saved history and reusable mapping presets on this device.</p><p>Reconciliation and CSV, PDF, print, and JSON exports remain free.</p><p>Payment opens on Sociobot’s hosted checkout. This app does not ask for card details.</p></section>
    <section><h2>Warranty and liability</h2><p>The software is provided as-is. To the extent allowed by law, the authors are not liable for losses from incorrect data, mapping, interpretation, or use. Always retain and compare original evidence.</p></section></article>`;
  root.innerHTML = `${header()}<main id="main" class="legal"><div class="container">${kind === 'privacy' ? privacy : terms}<p><a class="button secondary" href="/">Return home</a></p></div></main>${footer()}<div id="live" class="live-region" aria-live="polite"></div><div id="update-notice"></div>`;
  updateOfflineStatus();
}

function currentStep(): number {
  if (!kinds.every((kind) => state.datasets[kind])) return 1;
  if (!state.mappingConfirmed) return 2;
  if (!state.result) return 3;
  return 4;
}

function renderSteps(): string {
  const active = currentStep();
  return `<ol class="step-rail" aria-label="Reconciliation progress">${['Add files', 'Map columns', 'Reconcile', 'Hand off'].map((label, index) => {
    const step = index + 1;
    return `<li class="${step === active ? 'active' : step < active ? 'done' : ''}" ${step === active ? 'aria-current="step"' : ''}><span class="step-number">${step < active ? '✓' : step}</span><span>${label}</span></li>`;
  }).join('')}</ol>`;
}

function renderFileCard(kind: DatasetKind, index: number): string {
  const dataset = state.datasets[kind];
  const label = kindLabels[kind];
  return `<section class="file-card ${dataset ? 'loaded' : ''}" aria-labelledby="${kind}-title">
    <span class="file-index mono">0${index + 1} / CSV</span><h3 id="${kind}-title">${label.title}</h3><p>${label.description}</p>
    ${dataset ? `<div class="file-meta"><p class="file-name" title="${escapeHtml(dataset.fileName)}">${escapeHtml(dataset.fileName)}</p><p>${dataset.rows.length.toLocaleString()} rows · ${dataset.headers.length} columns</p></div><button class="button quiet small-button" type="button" data-action="remove-file" data-kind="${kind}">Remove file</button>`
      : `<label class="button secondary file-label" for="file-${kind}">Choose ${label.title.toLocaleLowerCase()} CSV</label><input class="file-input" id="file-${kind}" type="file" accept=".csv,text/csv" data-file-kind="${kind}"><p class="small">Maximum 10 MB and 50,000 data rows. A header row is required.</p>`}
  </section>`;
}

function renderFiles(): string {
  return `<section class="panel file-panel" aria-labelledby="files-title"><div class="panel-head"><div><p class="eyebrow">Step 01 · Add evidence</p><h2 id="files-title">Add three source files</h2><p>The app reads each CSV in this browser.</p></div><a class="button secondary" href="/demo">Try it with sample data</a></div>
    <div class="file-grid">${kinds.map(renderFileCard).join('')}</div>${workspaceError && !kinds.every((kind) => state.datasets[kind]) ? `<p class="form-error" role="alert">${escapeHtml(workspaceError)}</p>` : ''}</section>`;
}

function optionList(headers: string[], selected?: string, required = false): string {
  return `<option value="">${required ? 'Choose a column…' : 'Not mapped'}</option>${headers.map((header) => `<option value="${escapeHtml(header)}" ${header === selected ? 'selected' : ''}>${escapeHtml(header)}</option>`).join('')}`;
}

function renderMapping(): string {
  if (!kinds.every((kind) => state.datasets[kind])) return '';
  return `<section class="panel mapping-panel" aria-labelledby="mapping-title"><div class="panel-head"><div><p class="eyebrow">Step 02 · Map columns</p><h2 id="mapping-title">Confirm what each column means</h2><p>Check every required field before calculating.</p></div></div>
    <div class="mapping-grid"><div class="field"><label for="reconciliation-name">Reconciliation name</label><input id="reconciliation-name" maxlength="80" value="${escapeHtml(state.reconciliationName)}"></div><div class="field currency-row"><label for="currency">Reconciliation currency</label><input id="currency" maxlength="3" autocomplete="off" value="${escapeHtml(state.currency)}" aria-describedby="currency-help"><span class="field-help" id="currency-help">Three-letter ISO code. Mixed currencies must be split.</span></div></div>
    <div class="mapping-grid">${kinds.map((kind) => {
      const dataset = state.datasets[kind]!;
      const mapping = state.mappings[kind] ?? ({} as ColumnMapping);
      return `<fieldset class="mapping-group"><legend><strong>${kindLabels[kind].title}</strong></legend>${mappingRequirements(kind).map((requirement) => `<div class="field"><label for="map-${kind}-${requirement.field}">${requirement.label}${requirement.required ? ' *' : ''}</label><select id="map-${kind}-${requirement.field}" data-map-kind="${kind}" data-map-field="${requirement.field}" ${requirement.required ? 'required' : ''}>${optionList(dataset.headers, mapping[requirement.field], requirement.required)}</select><span class="field-help">${requirement.help}</span></div>`).join('')}</fieldset>`;
    }).join('')}</div>
    <div class="action-row"><button class="button" type="button" data-action="reconcile">Run reconciliation</button>${license.unlocked ? '<button class="button secondary" type="button" data-action="save-preset">Save mapping preset</button>' : ''}${presets.length && license.unlocked ? '<button class="button quiet" type="button" data-action="load-preset">Use saved preset</button>' : ''}</div>
    ${workspaceError ? `<p class="form-error" role="alert">${escapeHtml(workspaceError)}</p>` : ''}</section>`;
}

function statusCopy(): { title: string; text: string; symbol: string } {
  if (state.result?.status === 'balanced') return { title: 'The bank deposits balance', text: 'The payout-to-bank variance is within one minor unit.', symbol: '✓' };
  if (state.result?.status === 'explained') return { title: 'The variance is explained', text: 'Your signed explanations account for the payout-to-bank difference.', symbol: '✓' };
  return { title: 'A variance still needs review', text: 'Add evidence-backed explanations until the remaining difference reaches zero.', symbol: '!' };
}

function renderSourceEvidence(): string {
  if (!state.result) return '';
  const records = {
    events: state.result.events,
    payout: state.result.payouts,
    bank: state.result.banks,
  };
  return kinds.map((kind) => {
    const dataset = state.datasets[kind]!;
    return `<section class="source-group" aria-labelledby="source-${kind}-title"><h4 id="source-${kind}-title">${kindLabels[kind].title}</h4><div class="source-table-wrap"><table class="source-table" role="table"><caption>${escapeHtml(dataset.fileName)} · ${records[kind].length} rows</caption><thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Source row</th><th scope="col" role="columnheader">Mapped ID</th><th scope="col" role="columnheader">Mapped date</th><th scope="col" role="columnheader">Mapped amount</th><th scope="col" role="columnheader">Original values</th></tr></thead><tbody role="rowgroup">${records[kind].map((row) => `<tr role="row"><td role="cell" data-label="Source row">${row.row}</td><td role="cell" data-label="Mapped ID">${escapeHtml(row.id)}</td><td role="cell" data-label="Mapped date">${escapeHtml(row.date)}</td><td role="cell" data-label="Mapped amount" class="money">${minorToDecimal(row.amountMinor, state.result!.decimals)} ${state.result!.currency}</td><td role="cell" data-label="Original values"><dl class="original-values">${Object.entries(row.original).map(([header, value]) => `<div><dt>${escapeHtml(header)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl></td></tr>`).join('')}</tbody></table></div></section>`;
  }).join('');
}

function renderResults(): string {
  const result = state.result;
  if (!result) return '';
  const money = (minor: number) => formatMoney(minor, result.currency, result.decimals);
  const status = statusCopy();
  const maximum = Math.max(...result.waterfall.flatMap((row) => [Math.abs(row.runningMinor), Math.abs(row.amountMinor)]), 1);
  return `<section class="panel results-panel" aria-labelledby="results-title"><div class="panel-head"><div><p class="eyebrow">Steps 03–04 · Explain and hand off</p><h2 id="results-title">${escapeHtml(state.reconciliationName)}</h2><p>The totals below use the mapped rows and any written explanation.</p></div><button class="button quiet" type="button" data-action="edit-mapping">Edit mapping</button></div>
    <div class="result-banner ${result.status}" role="status"><span class="result-symbol" aria-hidden="true">${status.symbol}</span><div><h3>${status.title}</h3><p>${status.text}</p></div><div class="score"><strong>${result.explainedPercent.toFixed(1)}%</strong><span>bank variance explained</span></div></div>
    <div class="summary-strip" aria-label="Reconciliation totals"><div class="summary-item"><span>Expected payout</span><strong>${money(result.expectedPayoutMinor)}</strong></div><div class="summary-item"><span>Reported payout</span><strong>${money(result.payoutNetMinor)}</strong></div><div class="summary-item"><span>Bank deposits</span><strong>${money(result.bankMinor)}</strong></div><div class="summary-item"><span>Remaining variance</span><strong>${money(result.remainingVarianceMinor)}</strong></div></div>
    <div><p class="eyebrow">Arithmetic waterfall</p><h3>How the totals reconcile</h3><p class="muted small" id="chart-description">Text alternative: ${money(result.ordersMinor)} of positive order events, less ${money(result.refundsMinor)} refunds and ${money(result.eventFeesMinor)} fees, gives ${money(result.expectedPayoutMinor)} expected. The processor payout reports ${money(result.payoutNetMinor)}. Bank deposits total ${money(result.bankMinor)}.</p>
      <ol class="waterfall" aria-describedby="chart-description">${result.waterfall.map((row, index) => `<li class="waterfall-row tone-${row.tone}" style="--i:${index}"><div class="wf-label"><strong>${row.label}</strong><span>${escapeHtml(row.explanation)}</span></div><div class="wf-track" aria-hidden="true"><div class="wf-bar" style="width:${Math.max(1, Math.abs(row.runningMinor) / maximum * 100).toFixed(2)}%"></div></div><div class="wf-value">${row.amountMinor === 0 ? money(row.runningMinor) : `${row.amountMinor > 0 ? '+' : '−'}${money(Math.abs(row.amountMinor))}`}<small>${row.amountMinor === 0 ? 'subtotal' : `running ${money(row.runningMinor)}`}</small></div></li>`).join('')}</ol>
    </div>
    <div class="result-columns"><div><p class="eyebrow">Open rules</p><h3>What the app did</h3><ul class="audit-list">${result.audit.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
      <div class="explain-box"><h3>Explain the bank difference</h3><p class="small muted">Remaining: <strong class="money">${money(result.remainingVarianceMinor)}</strong>. Enter a signed amount: positive when the bank is higher, negative when lower.</p>
        ${state.adjustments.length ? `<ul class="adjustment-list">${state.adjustments.map((item) => `<li><span><strong>${escapeHtml(item.category)}</strong><br><span class="small">${escapeHtml(item.note)}</span></span><span class="money">${money(item.amountMinor)}</span><button class="button quiet small-button" type="button" data-action="remove-adjustment" data-id="${item.id}" aria-label="Remove ${escapeHtml(item.note)}">Remove</button></li>`).join('')}</ul>` : '<p class="small">No manual explanations yet.</p>'}
        ${Math.abs(result.remainingVarianceMinor) <= 1
    ? '<p class="locked-note"><strong>No explanation needed.</strong> The remaining variance is within one minor unit, so an adjustment would overstate the evidence trail.</p>'
    : `<form id="adjustment-form"><div class="field"><label for="adjustment-category">Reason</label><select id="adjustment-category"><option value="timing">Timing difference</option><option value="bank-fee">Bank fee</option><option value="rounding">Rounding</option><option value="other">Other documented item</option></select></div><div class="field"><label for="adjustment-amount">Signed amount (${result.currency})</label><input id="adjustment-amount" inputmode="decimal" required placeholder="-0.12"${adjustmentError ? ' aria-describedby="adjustment-error" aria-invalid="true"' : ''}>${adjustmentError ? `<p class="form-error" id="adjustment-error" role="alert">${escapeHtml(adjustmentError)}</p>` : ''}</div><div class="field"><label for="adjustment-note">Evidence note</label><textarea id="adjustment-note" required maxlength="240" placeholder="Why this amount belongs here"></textarea></div><button class="button secondary" type="submit">Add explanation</button></form>`}
      </div></div><details class="source-evidence" open><summary>Mapped source evidence</summary>${renderSourceEvidence()}</details>
    <div class="action-row"><button class="button" type="button" data-action="export-csv">Export reconciler CSV</button><button class="button secondary" type="button" data-action="export-pdf">Export accountant PDF</button><button class="button quiet" type="button" data-action="print">Print report</button><button class="button quiet" type="button" data-action="export-backup">Export JSON backup</button></div>
  </section>`;
}

function renderPaid(): string {
  return `<section class="paid-section" aria-labelledby="desk-title"><div class="paid-grid"><div><p class="eyebrow">Optional saved-history license</p><h2 id="desk-title">Save past reconciliations</h2><p>Pay US $19 once to add named history and reusable column mappings on this device.</p><p>Reconciliation and every export remain free.</p>
    ${license.unlocked ? `<p class="locked-note"><strong>Saved history is active.</strong> ${escapeHtml(license.message)}</p><div class="action-row"><button class="button" type="button" data-action="save-history" ${state.result ? '' : 'disabled'}>Save this reconciliation</button><button class="button quiet" type="button" data-action="remove-license">Remove license</button></div>`
      : `<div class="action-row"><a class="button" href="${checkoutUrl}">Buy saved history for US $19</a></div><p class="small muted">One-time purchase. Payment opens on Sociobot’s hosted checkout. <a class="inline-link-target" href="/terms/">Read purchase terms</a>.</p>${license.checking || license.message ? `<div class="locked-note">${license.checking ? '<strong>Checking for a license…</strong>' : ''} ${escapeHtml(license.message)}</div>` : ''}<form id="license-form"><div class="field"><label for="license-token">Have a license? Paste it here</label><div class="license-form"><input id="license-token" type="text" autocomplete="off" required aria-describedby="license-help"><button class="button secondary" type="submit">Verify license</button></div><span class="field-help" id="license-help">Stored in this browser. Sent to Sociobot only for license checks.</span></div></form>`}</div>
    <div><h3>Saved reconciliations</h3>${license.unlocked ? (historyItems.length ? `<ul class="history-list">${historyItems.map((item) => `<li><p><strong>${escapeHtml(item.name)}</strong><br><span class="small muted">${new Date(item.savedAt).toLocaleString()}</span></p><span><button class="button quiet small-button" data-action="restore-history" data-id="${item.id}">Open</button><button class="button quiet small-button" data-action="delete-history" data-id="${item.id}">Delete</button></span></li>`).join('')}</ul>` : '<p class="muted">No saved reconciliations yet. Run one, then save it here.</p>') : '<p class="muted">Your current draft remains after a refresh. The license adds named history and reusable mappings.</p>'}</div></div>
    <div class="data-tools"><h3>Back up or remove local data</h3><p class="small muted">The JSON backup restores your current files, mappings, and explanations.</p><div class="action-row"><button class="button secondary" type="button" data-action="export-backup">Export JSON backup</button><label class="button quiet" for="backup-file">Import JSON backup</label><input class="file-input" id="backup-file" type="file" accept="application/json,.json"><button class="button danger" type="button" data-action="erase">Erase current draft</button></div></div>
  </section>`;
}

function renderHowItWorks(): string {
  return `<section class="explain-section" aria-labelledby="how-title"><p class="eyebrow">Three steps</p><h2 id="how-title">How it works</h2><ol class="how-grid"><li><span>01</span><h3>Add three CSVs</h3><p>Choose an order events CSV, processor payout, and bank deposits CSV.</p></li><li><span>02</span><h3>Check the column mappings</h3><p>Confirm dates, amounts, fees, and identifiers before calculating.</p></li><li><span>03</span><h3>Export the explanation</h3><p>Review the waterfall, then export CSV, PDF, print, or JSON.</p></li></ol></section>`;
}

function renderLimits(): string {
  return `<section class="limits-section" aria-labelledby="limits-title"><p class="eyebrow">Scope and privacy</p><h2 id="limits-title">What this app does not do</h2><ul><li>It does not connect to banks or commerce platforms.</li><li>It does not create or post ledger entries.</li><li>It does not provide accounting, legal, or tax advice.</li><li>It does not send CSV contents to a server.</li></ul></section>`;
}

function demoBanner(): string {
  return `<aside class="demo-banner" aria-label="Demo mode"><div class="container demo-banner-inner"><p><strong>Demo — sample data, nothing is saved</strong><span>The sample uses a separate browser database.</span></p><div><button class="button secondary small-button" type="button" data-action="reset-demo">Reset demo</button><button class="button quiet small-button" type="button" data-action="start-real">Start for real</button></div></div></aside>`;
}

function renderApp(): void {
  const hero = `<section class="hero"><div class="container hero-grid"><div class="hero-copy"><p class="eyebrow">Reconcile one payout</p><h1 tabindex="-1">Reconcile a payout with order events and bank deposits.</h1><p>For ecommerce operators and bookkeepers who need to explain a payout difference.</p><div class="hero-actions"><a class="button" href="/demo">Try it with sample data</a><span>See a completed reconciliation and download its accountant report.</span></div><a class="quiet-link" href="#workbench">Import my CSVs</a><ul class="plain-facts"><li>CSV data stays in this browser</li><li>No account</li><li>Free exports</li></ul></div><figure class="hero-art"><picture><source type="image/avif" srcset="/art/balance-field-720.avif 720w, /art/balance-field.avif 1200w" sizes="(max-width: 820px) 92vw, 44vw"><source type="image/webp" srcset="/art/balance-field-720.webp 720w, /art/balance-field.webp 1200w" sizes="(max-width: 820px) 92vw, 44vw"><img src="/art/balance-field.png" width="1200" height="800" alt="Paper transaction tiles align into one settlement bar" decoding="async" fetchpriority="high"></picture><figcaption class="art-label">ORDER EVENTS · PROCESSOR PAYOUT · BANK DEPOSITS</figcaption></figure></div></section>`;
  const demoIntro = `<section class="demo-intro"><div class="container"><p class="eyebrow">Completed sample</p><h1 tabindex="-1">Review a completed payout reconciliation.</h1><p>Inspect the sample waterfall or export its accountant report.</p></div></section>`;
  const workspace = `<section class="workflow" id="workbench"><div class="container">${isDemoMode ? renderResults() : `${renderSteps()}<div class="section-intro"><div><p class="eyebrow">Reconciliation workspace</p><h2>Reconcile one payout period</h2></div><p>Use one currency and one payout period.</p></div>${renderFiles()}${renderMapping()}${renderResults()}${renderHowItWorks()}${renderLimits()}${renderPaid()}`}</div></section>`;
  root.innerHTML = `${header()}${isDemoMode ? demoBanner() : ''}<main id="main">${isDemoMode ? demoIntro : hero}${workspace}</main>${footer()}<div id="live" class="live-region" aria-live="polite">${escapeHtml(liveMessage)}</div><div id="update-notice"></div>
  ${!isDemoMode ? `<dialog id="erase-dialog"><h2>Erase the current draft?</h2><p>This removes the active draft and its imported CSV contents. Saved history remains.</p><div class="action-row"><button class="button danger" type="button" data-action="confirm-erase">Erase current draft</button><button class="button secondary" type="button" data-action="cancel-erase">Keep working</button></div></dialog>` : ''}`;
  updateOfflineStatus();
}

function announce(message: string): void {
  liveMessage = message;
  const region = document.querySelector('#live');
  if (region) region.textContent = message;
}

function setStateChanged(message?: string): void {
  state.updatedAt = new Date().toISOString();
  void saveDraft(state).catch(() => { workspaceError = 'This browser could not save the local draft. Export a JSON backup before closing.'; renderApp(); });
  if (message) announce(message);
}

async function addFile(kind: DatasetKind, file: File): Promise<void> {
  if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name} is larger than 10 MB. Split the period and try again.`);
  const parsed = parseCsv(await file.text(), kind, file.name);
  if (parsed.rows.length > 50_000) throw new Error(`${file.name} has more than 50,000 rows. Split it into payout periods.`);
  state.datasets[kind] = parsed;
  state.mappings[kind] = suggestMapping(parsed);
  state.mappingConfirmed = false;
  state.result = undefined;
  workspaceError = '';
  setStateChanged(`${file.name} added with ${parsed.rows.length} rows.`);
  renderApp();
}

function loadSample(complete = false, moveToResult = true): void {
  const sample: Record<DatasetKind, string> = {
    events: `order_id,event_date,event_type,amount,fee,payout_id,currency\nORD-1001,2026-08-18,sale,120.00,3.78,PO-0822,USD\nORD-1002,2026-08-19,sale,80.00,2.60,PO-0822,USD\nREF-1001,2026-08-20,refund,-25.00,0.00,PO-0822,USD`,
    payout: `payout_id,payout_date,gross,refunds,fees,net,currency\nPO-0822,2026-08-22,200.00,25.00,6.38,168.62,USD`,
    bank: `deposit_date,reference,amount,currency\n2026-08-23,PO-0822,168.50,USD\n2026-08-24,PO-0822,0.12,USD`,
  };
  for (const kind of kinds) {
    const parsed = parseCsv(sample[kind], kind, `sample-${kind}.csv`);
    state.datasets[kind] = parsed;
    state.mappings[kind] = suggestMapping(parsed);
  }
  state.reconciliationName = 'Sample payout PO-0822';
  state.currency = 'USD'; state.mappingConfirmed = false; state.result = undefined; state.adjustments = [];
  workspaceError = '';
  adjustmentError = '';
  if (complete) {
    state.result = reconcile(state.datasets, state.mappings, state.currency, state.adjustments);
    state.mappingConfirmed = true;
  }
  setStateChanged(complete ? 'Sample reconciliation is ready.' : 'Sample data loaded. Review the column mappings.');
  renderApp();
  if (moveToResult) document.querySelector(complete ? '#results-title' : '#mapping-title')?.scrollIntoView({ block: 'start' });
}

function runReconciliation(): void {
  try {
    state.result = reconcile(state.datasets, state.mappings, state.currency, state.adjustments);
    state.mappingConfirmed = true; workspaceError = ''; adjustmentError = '';
    setStateChanged(`Reconciliation complete: ${state.result.explainedPercent.toFixed(1)}% of bank variance explained.`);
    renderApp();
    document.querySelector('#results-title')?.scrollIntoView({ block: 'start' });
  } catch (error) {
    state.result = undefined; state.mappingConfirmed = false; workspaceError = (error as Error).message;
    renderApp();
    document.querySelector('.form-error')?.scrollIntoView({ block: 'center' });
  }
}

async function refreshPaidData(): Promise<void> {
  if (!license.unlocked) { historyItems = []; presets = []; return; }
  [historyItems, presets] = await Promise.all([loadHistory(), loadPresets()]);
}

async function handleClick(button: HTMLElement): Promise<void> {
  const action = button.dataset.action;
  if (!action) return;
  if (action === 'theme') {
    const current = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next; localStorage.setItem(isDemoMode ? 'demo:pre-theme' : 'pre-theme', next); announce(`${next} theme selected.`); return;
  }
  if (action === 'sample') { await navigateTo('/demo'); return; }
  if (action === 'reset-demo') {
    await deleteDemoStorage();
    useDemoStorage(true);
    state = emptyState();
    loadSample(true);
    announce('Demo reset to the original sample.');
    return;
  }
  if (action === 'start-real') {
    await leaveDemo();
    history.pushState({}, '', '/');
    await renderRoute(true);
    return;
  }
  if (action === 'remove-file') {
    const kind = button.dataset.kind as DatasetKind; delete state.datasets[kind]; delete state.mappings[kind]; state.mappingConfirmed = false; state.result = undefined; setStateChanged(`${kindLabels[kind].title} removed.`); renderApp(); return;
  }
  if (action === 'reconcile') { runReconciliation(); return; }
  if (action === 'edit-mapping') { state.result = undefined; state.mappingConfirmed = false; setStateChanged(); renderApp(); document.querySelector('#mapping-title')?.scrollIntoView(); return; }
  if (action === 'remove-adjustment') { state.adjustments = state.adjustments.filter((item) => item.id !== button.dataset.id); runReconciliation(); return; }
  if (action === 'export-csv' && state.result) { exportReconcilerCsv(state, state.result); announce('Reconciler CSV downloaded.'); return; }
  if (action === 'export-pdf' && state.result) { exportPdf(state, state.result); announce('Accountant PDF downloaded.'); return; }
  if (action === 'print') { window.print(); return; }
  if (action === 'export-backup') { exportBackup(state); announce('JSON backup downloaded.'); return; }
  if (action === 'erase') { eraseReturnFocus = button; (document.querySelector('#erase-dialog') as HTMLDialogElement).showModal(); return; }
  if (action === 'cancel-erase') { (document.querySelector('#erase-dialog') as HTMLDialogElement).close(); eraseReturnFocus?.focus(); return; }
  if (action === 'confirm-erase') { await clearDraft(); state = emptyState(); workspaceError = ''; adjustmentError = ''; renderApp(); announce('Current local work erased.'); return; }
  if (action === 'save-history' && state.result && license.unlocked) {
    const item: SavedReconciliation = { id: crypto.randomUUID(), name: state.reconciliationName, savedAt: new Date().toISOString(), state: structuredClone(state) };
    await saveHistory(item); await refreshPaidData(); renderApp(); announce('Reconciliation saved to history.'); return;
  }
  if (action === 'restore-history' && license.unlocked) {
    const item = historyItems.find((entry) => entry.id === button.dataset.id); if (item) { state = structuredClone(item.state); setStateChanged('Saved reconciliation opened.'); renderApp(); } return;
  }
  if (action === 'delete-history' && license.unlocked && button.dataset.id) {
    const item = historyItems.find((entry) => entry.id === button.dataset.id); if (item && confirm(`Delete saved reconciliation “${item.name}”?`)) { await deleteHistory(item.id); await refreshPaidData(); renderApp(); announce('Saved reconciliation deleted.'); } return;
  }
  if (action === 'save-preset' && license.unlocked) {
    const name = prompt('Name this mapping preset:', 'My processor export'); if (name?.trim()) { await savePreset(name.trim(), structuredClone(state.mappings)); await refreshPaidData(); renderApp(); announce('Mapping preset saved.'); } return;
  }
  if (action === 'load-preset' && license.unlocked && presets[0]) {
    state.mappings = structuredClone(presets[0].value) as AppState['mappings']; state.mappingConfirmed = false; state.result = undefined; setStateChanged(`${presets[0].name} mapping loaded.`); renderApp(); return;
  }
  if (action === 'remove-license') { clearLicense(); license = { unlocked: false, checking: false, message: 'License removed from this browser.' }; historyItems = []; presets = []; renderApp(); return; }
  if (action === 'activate-update') { updateRequested = true; const registration = await navigator.serviceWorker.getRegistration(); registration?.waiting?.postMessage({ type: 'SKIP_WAITING' }); return; }
}

function bindGlobalUi(): void {
  root.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
    if (link && link.origin === location.origin && !link.hasAttribute('download') && !link.hash) {
      event.preventDefault();
      void navigateTo(`${link.pathname}${link.search}`);
      return;
    }
    const button = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (button) void handleClick(button);
  });
  root.addEventListener('cancel', (event) => {
    const dialog = event.target as HTMLDialogElement;
    if (dialog.id !== 'erase-dialog') return;
    event.preventDefault();
    dialog.close();
    eraseReturnFocus?.focus();
  });
}

root.addEventListener('change', (event) => {
  const input = event.target as HTMLInputElement | HTMLSelectElement;
  if (input.dataset.fileKind && input instanceof HTMLInputElement && input.files?.[0]) {
    void addFile(input.dataset.fileKind as DatasetKind, input.files[0]).catch((error) => { workspaceError = (error as Error).message; renderApp(); }); return;
  }
  if (input.dataset.mapKind && input.dataset.mapField) {
    const kind = input.dataset.mapKind as DatasetKind;
    const mapping = state.mappings[kind] ?? ({} as ColumnMapping);
    const field = input.dataset.mapField as keyof ColumnMapping;
    if (input.value) mapping[field] = input.value; else delete mapping[field];
    state.mappings[kind] = mapping; state.mappingConfirmed = false; state.result = undefined; workspaceError = ''; adjustmentError = ''; setStateChanged(); return;
  }
  if (input.id === 'currency') { state.currency = input.value.toUpperCase(); state.mappingConfirmed = false; state.result = undefined; setStateChanged(); return; }
  if (input.id === 'reconciliation-name') { state.reconciliationName = input.value.trim() || 'Untitled reconciliation'; setStateChanged(); return; }
  if (input.id === 'backup-file' && input instanceof HTMLInputElement && input.files?.[0]) {
    void input.files[0].text().then((text) => {
      state = restoreBackup(JSON.parse(text) as BackupDocument); setStateChanged('JSON backup imported.'); renderApp();
    }).catch((error) => { workspaceError = (error as Error).message; renderApp(); });
  }
});

root.addEventListener('input', (event) => {
  const input = event.target as HTMLInputElement;
  if (input.id === 'currency') input.value = input.value.toUpperCase().replace(/[^A-Z]/g, '');
});

root.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  if (form.id === 'adjustment-form' && state.result) {
    const amount = (document.querySelector('#adjustment-amount') as HTMLInputElement).value;
    const note = (document.querySelector('#adjustment-note') as HTMLTextAreaElement).value.trim();
    try {
      const amountMinor = parseMoney(amount, state.result.decimals);
      if (!amountMinor) throw new Error('Enter a non-zero signed amount.');
      if (!note) throw new Error('Add a short evidence note.');
      validateManualAdjustment(state.result, amountMinor);
      state.adjustments.push({ id: crypto.randomUUID(), category: (document.querySelector('#adjustment-category') as HTMLSelectElement).value as 'timing' | 'bank-fee' | 'rounding' | 'other', amountMinor, note, createdAt: new Date().toISOString() });
      runReconciliation();
    } catch (error) { adjustmentError = (error as Error).message; announce(adjustmentError); renderApp(); }
  }
  if (form.id === 'license-form') {
    const token = (document.querySelector('#license-token') as HTMLInputElement).value.trim(); storeLicense(token); license = { unlocked: false, checking: true, message: 'Checking license…' }; renderApp();
    void getLicenseState(true).then(async (next) => { license = next; await refreshPaidData(); renderApp(); announce(next.message); });
  }
});

function updateOfflineStatus(): void {
  document.querySelector('#offline-status')?.classList.toggle('visible', !navigator.onLine);
}
window.addEventListener('online', () => { updateOfflineStatus(); announce('Back online. Your work stayed on this device.'); });
window.addEventListener('offline', () => { updateOfflineStatus(); announce('You are offline. The app and current draft remain available.'); });

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  const registration = await navigator.serviceWorker.register('/sw.js');
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) {
        const notice = document.querySelector('#update-notice');
        if (notice) notice.innerHTML = '<div class="notice" role="status"><strong>Update ready</strong><br><span class="small">Reload to use the newest app.</span><br><button class="button quiet small-button" data-action="activate-update">Reload update</button></div>';
      }
    });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (updateRequested) location.reload(); });
}

function setMetadata(title: string, description: string, path: string): void {
  document.title = title;
  const absolute = `https://payout-reconciliation-explainer.sociobot.in${path}`;
  const values: Record<string, string> = {
    'meta[name="description"]': description,
    'meta[property="og:title"]': title,
    'meta[property="og:description"]': description,
    'meta[property="og:url"]': absolute,
    'meta[name="twitter:title"]': title,
    'meta[name="twitter:description"]': description,
  };
  Object.entries(values).forEach(([selector, value]) => document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', value));
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', absolute);
}

function renderNotFound(): void {
  root.innerHTML = `${header()}<main id="main" class="not-found"><div class="container not-found-grid"><div><p class="eyebrow">404 · Page not found</p><h1 tabindex="-1">This payout path does not exist.</h1><p>Return home or open the completed sample reconciliation.</p><div class="action-row"><a class="button" href="/">Return home</a><a class="button secondary" href="/demo">Open sample data</a></div></div><div class="broken-balance" aria-hidden="true"><i></i><i></i><i></i></div></div></main>${footer()}<div id="live" class="live-region" aria-live="polite"></div>`;
}

async function leaveDemo(): Promise<void> {
  if (!isDemoMode) return;
  await deleteDemoStorage();
  isDemoMode = false;
  useDemoStorage(false);
  localStorage.removeItem('demo:pre-theme');
}

async function navigateTo(path: string): Promise<void> {
  const nextDemo = path.startsWith('/demo') || new URL(path, location.origin).searchParams.get('demo') === '1';
  if (isDemoMode && !nextDemo) await leaveDemo();
  history.pushState({}, '', path);
  await renderRoute(true);
}

async function renderRoute(focusHeading = false): Promise<void> {
  const path = location.pathname;
  const requestedDemo = path.startsWith('/demo') || new URLSearchParams(location.search).get('demo') === '1';
  if (isDemoMode && !requestedDemo) await leaveDemo();
  isDemoMode = requestedDemo;
  useDemoStorage(isDemoMode);
  const theme = localStorage.getItem(isDemoMode ? 'demo:pre-theme' : 'pre-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;

  if (path.startsWith('/privacy')) {
    setMetadata('Privacy — Payout Reconciliation Explainer', 'How payout CSVs, drafts, licenses, and exports are handled in your browser.', '/privacy/');
    renderLegal('privacy');
  } else if (path.startsWith('/terms')) {
    setMetadata('Terms — Payout Reconciliation Explainer', 'Terms for the local payout reconciliation tool and optional saved-history license.', '/terms/');
    renderLegal('terms');
  } else if (path === '/' && !requestedDemo) {
    setMetadata('Payout Reconciliation Explainer — explain differences', 'Reconcile a processor payout with order events and bank deposits in your browser.', '/');
    captureReturnedLicense();
    root.innerHTML = `${header()}<main id="main" class="skeleton"><div><p class="eyebrow">Reconciliation workspace</p><h1>Opening your saved draft…</h1></div></main>`;
    try { state = (await loadDraft()) ?? emptyState(); } catch { state = emptyState(); workspaceError = 'This browser could not open local storage. You can still work and export in this tab.'; }
    if (state.mappingConfirmed === undefined) state.mappingConfirmed = Boolean(state.result);
    renderApp();
    void getLicenseState().then(async (next) => {
      if (isDemoMode || location.pathname !== '/') return;
      license = next; await refreshPaidData(); renderApp();
    });
  } else if (requestedDemo && (path === '/' || path === '/demo' || path === '/demo/')) {
    setMetadata('Demo — Payout Reconciliation Explainer', 'Review a completed sample payout reconciliation and export its handoff files.', '/demo');
    try { state = (await loadDraft()) ?? emptyState(); } catch { state = emptyState(); }
    if (!state.result) loadSample(true, false); else renderApp();
  } else {
    setMetadata('Page not found — Payout Reconciliation Explainer', 'The requested page does not exist. Return to the payout reconciliation tool.', path);
    renderNotFound();
  }
  if (focusHeading) {
    requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>('h1');
      heading?.focus();
      announce(heading?.textContent?.trim() ?? document.title);
      scrollTo({ top: 0, behavior: 'auto' });
    });
  }
}

async function init(): Promise<void> {
  bindGlobalUi();
  window.addEventListener('popstate', () => { void renderRoute(true); });
  await renderRoute();
  void registerServiceWorker().catch(() => announce('Offline installation is unavailable in this browser.'));
}

void init();
