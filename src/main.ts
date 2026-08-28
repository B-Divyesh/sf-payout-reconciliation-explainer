import './styles/main.css';
import { parseCsv } from './lib/csv';
import { exportBackup, exportPdf, exportReconcilerCsv, downloadBlob } from './lib/export';
import { captureReturnedLicense, checkoutUrl, clearLicense, getLicenseState, storeLicense, type LicenseState } from './lib/license';
import { formatMoney, minorToDecimal, parseMoney } from './lib/money';
import { mappingRequirements, reconcile, suggestMapping } from './lib/reconcile';
import { clearDraft, deleteHistory, loadDraft, loadHistory, loadPresets, saveDraft, saveHistory, savePreset } from './lib/storage';
import type { AppState, ColumnMapping, DatasetKind, SavedReconciliation } from './lib/types';

const root = document.querySelector<HTMLDivElement>('#app')!;
const kinds: DatasetKind[] = ['events', 'payout', 'bank'];
const kindLabels: Record<DatasetKind, { title: string; description: string }> = {
  events: { title: 'Orders & events', description: 'Sales, refunds, and processor fees.' },
  payout: { title: 'Processor payout', description: 'The batch total the processor says it sent.' },
  bank: { title: 'Bank deposits', description: 'The deposits that actually reached the bank.' },
};
const emptyState = (): AppState => ({
  version: 1, datasets: {}, mappings: {}, mappingConfirmed: false, currency: 'USD', adjustments: [],
  reconciliationName: `Payout ${new Date().toISOString().slice(0, 10)}`, updatedAt: new Date().toISOString(),
});
let state: AppState = emptyState();
let license: LicenseState = { unlocked: false, checking: true, message: '' };
let historyItems: SavedReconciliation[] = [];
let presets: { name: string; value: unknown }[] = [];
let errorMessage = '';
let liveMessage = '';

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);
}

function header(): string {
  return `<header class="site-header"><div class="container header-inner">
    <a class="brand" href="/" aria-label="Payout Reconciliation Explainer home"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span><span>Payout<br>Explainer</span></a>
    <div class="header-actions"><span id="offline-status" class="offline-pill" role="status">Offline · work stays local</span><button class="icon-button" type="button" data-action="theme" aria-label="Switch color theme" title="Switch color theme"><span aria-hidden="true">◐</span></button></div>
  </div></header>`;
}

function footer(): string {
  return `<footer class="site-footer"><div class="container footer-inner"><p>Local-first by design. Generated balance-field artwork; provenance in the project design notes.</p><nav class="footer-links" aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://github.com/B-Divyesh/sf-payout-reconciliation-explainer">Source</a></nav></div></footer>`;
}

function renderLegal(kind: 'privacy' | 'terms'): void {
  const privacy = `<article><p class="eyebrow">Effective 28 August 2026</p><h1>Privacy, without fine print</h1><p class="measure">Your financial files stay in your browser. The app has no analytics, advertising trackers, or account database.</p>
    <section><h2>Data on this device</h2><p>CSV contents, your current draft, saved history, mapping presets, and manual explanations are stored locally in IndexedDB. A purchased license token and its most recent verification result are stored in localStorage. You can export your work or erase it from the workbench at any time.</p></section>
    <section><h2>Network requests</h2><p>The installed app checks its own files for updates. If you buy or restore Desk features, your browser contacts the Sociobot billing API to open hosted checkout or verify the license token. Financial CSV data is never included in those requests.</p></section>
    <section><h2>Payments</h2><p>Sociobot and its payment partner are the merchant of record and process payment details on their hosted pages. This app never receives card details.</p></section>
    <section><h2>Your control</h2><p>Use “Erase local work” in the app to clear the current draft. Browser site-data controls can remove saved history, presets, and the license token. JSON backup and CSV/PDF exports let you keep your own copies.</p></section></article>`;
  const terms = `<article><p class="eyebrow">Effective 28 August 2026</p><h1>Plain-language terms</h1><p class="measure">This tool explains imported payout evidence. It does not replace your books, accountant, processor statement, or bank record.</p>
    <section><h2>Permitted use</h2><p>You may use the app for lawful reconciliation work. You remain responsible for checking source files, column mappings, signs, currencies, explanations, and exported handoff material.</p></section>
    <section><h2>No accounting or tax advice</h2><p>Results are arithmetic based on the visible rules and data you map. They are not accounting, legal, or tax advice and do not create journal entries or file anything on your behalf.</p></section>
    <section><h2>Desk license</h2><p>The optional Desk unlock is a US $19 one-time purchase for saved reconciliation history and reusable mapping presets on this device. Core reconciliation and CSV/PDF/JSON exports remain free. Sociobot/Dodo is the merchant of record. Refunds are handled there and revoke the corresponding license.</p></section>
    <section><h2>Warranty and liability</h2><p>The software is provided as-is. To the extent allowed by law, the authors are not liable for decisions or losses arising from incorrect source data, mapping, interpretation, or use. Always retain and compare original evidence.</p></section></article>`;
  root.innerHTML = `${header()}<main id="main" class="legal"><div class="container">${kind === 'privacy' ? privacy : terms}<p><a class="button secondary" href="/">Return to workbench</a></p></div></main>${footer()}`;
  bindGlobalUi();
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
      : `<label class="button secondary file-label" for="file-${kind}">Choose ${label.title.toLocaleLowerCase()} CSV</label><input class="file-input" id="file-${kind}" type="file" accept=".csv,text/csv" data-file-kind="${kind}"><p class="small">Up to 10 MB. Headers required.</p>`}
  </section>`;
}

function renderFiles(): string {
  return `<section class="panel file-panel" aria-labelledby="files-title"><div class="panel-head"><div><p class="eyebrow">Step 01 · Evidence in</p><h2 id="files-title">Add three source files</h2><p>Nothing uploads. Each CSV is read and saved only in this browser.</p></div><button class="button secondary" type="button" data-action="sample">Use labelled example</button></div>
    <div class="file-grid">${kinds.map(renderFileCard).join('')}</div></section>`;
}

function optionList(headers: string[], selected?: string, required = false): string {
  return `<option value="">${required ? 'Choose a column…' : 'Not mapped'}</option>${headers.map((header) => `<option value="${escapeHtml(header)}" ${header === selected ? 'selected' : ''}>${escapeHtml(header)}</option>`).join('')}`;
}

function renderMapping(): string {
  if (!kinds.every((kind) => state.datasets[kind])) return '';
  return `<section class="panel mapping-panel" aria-labelledby="mapping-title"><div class="panel-head"><div><p class="eyebrow">Step 02 · Visible schema</p><h2 id="mapping-title">Confirm what each column means</h2><p>Suggestions are never applied invisibly. Check every required field before calculating.</p></div></div>
    <div class="mapping-grid"><div class="field"><label for="reconciliation-name">Reconciliation name</label><input id="reconciliation-name" maxlength="80" value="${escapeHtml(state.reconciliationName)}"></div><div class="field currency-row"><label for="currency">Reconciliation currency</label><input id="currency" maxlength="3" autocomplete="off" value="${escapeHtml(state.currency)}" aria-describedby="currency-help"><span class="field-help" id="currency-help">Three-letter ISO code. Mixed currencies must be split.</span></div></div>
    <div class="mapping-grid">${kinds.map((kind) => {
      const dataset = state.datasets[kind]!;
      const mapping = state.mappings[kind] ?? ({} as ColumnMapping);
      return `<fieldset class="mapping-group"><legend><strong>${kindLabels[kind].title}</strong></legend>${mappingRequirements(kind).map((requirement) => `<div class="field"><label for="map-${kind}-${requirement.field}">${requirement.label}${requirement.required ? ' *' : ''}</label><select id="map-${kind}-${requirement.field}" data-map-kind="${kind}" data-map-field="${requirement.field}" ${requirement.required ? 'required' : ''}>${optionList(dataset.headers, mapping[requirement.field], requirement.required)}</select><span class="field-help">${requirement.help}</span></div>`).join('')}</fieldset>`;
    }).join('')}</div>
    <div class="action-row"><button class="button" type="button" data-action="reconcile">Run reconciliation</button>${license.unlocked ? '<button class="button secondary" type="button" data-action="save-preset">Save mapping preset</button>' : ''}${presets.length && license.unlocked ? '<button class="button quiet" type="button" data-action="load-preset">Use saved preset</button>' : ''}</div>
    ${errorMessage ? `<p class="form-error" role="alert">${escapeHtml(errorMessage)}</p>` : ''}</section>`;
}

function statusCopy(): { title: string; text: string; symbol: string } {
  if (state.result?.status === 'balanced') return { title: 'The bank deposit balances', text: 'The payout-to-bank variance is within one minor unit.', symbol: '✓' };
  if (state.result?.status === 'explained') return { title: 'The variance is explained', text: 'Your signed explanations account for the payout-to-bank difference.', symbol: '✓' };
  return { title: 'A variance still needs review', text: 'Add evidence-backed explanations until the remaining difference reaches zero.', symbol: '!' };
}

function renderResults(): string {
  const result = state.result;
  if (!result) return '';
  const money = (minor: number) => formatMoney(minor, result.currency, result.decimals);
  const status = statusCopy();
  const maximum = Math.max(...result.waterfall.flatMap((row) => [Math.abs(row.runningMinor), Math.abs(row.amountMinor)]), 1);
  return `<section class="panel results-panel" aria-labelledby="results-title"><div class="panel-head"><div><p class="eyebrow">Steps 03–04 · Explain and hand off</p><h2 id="results-title">${escapeHtml(state.reconciliationName)}</h2><p>Every figure below traces back to a mapped field or your written explanation.</p></div><button class="button quiet" type="button" data-action="edit-mapping">Edit mapping</button></div>
    <div class="result-banner ${result.status}" role="status"><span class="result-symbol" aria-hidden="true">${status.symbol}</span><div><h3>${status.title}</h3><p>${status.text}</p></div><div class="score"><strong>${result.explainedPercent.toFixed(1)}%</strong><span>bank variance explained</span></div></div>
    <div class="summary-strip" aria-label="Reconciliation totals"><div class="summary-item"><span>Expected payout</span><strong>${money(result.expectedPayoutMinor)}</strong></div><div class="summary-item"><span>Reported payout</span><strong>${money(result.payoutNetMinor)}</strong></div><div class="summary-item"><span>Bank deposits</span><strong>${money(result.bankMinor)}</strong></div><div class="summary-item"><span>Remaining variance</span><strong>${money(result.remainingVarianceMinor)}</strong></div></div>
    <div><p class="eyebrow">Arithmetic waterfall</p><h3>How the numbers travel</h3><p class="muted small" id="chart-description">Text alternative: ${money(result.ordersMinor)} of positive events, less ${money(result.refundsMinor)} refunds and ${money(result.eventFeesMinor)} fees, gives ${money(result.expectedPayoutMinor)} expected. The payout reports ${money(result.payoutNetMinor)} and the bank contains ${money(result.bankMinor)}.</p>
      <ol class="waterfall" aria-describedby="chart-description">${result.waterfall.map((row, index) => `<li class="waterfall-row tone-${row.tone}" style="--i:${index}"><div class="wf-label"><strong>${row.label}</strong><span>${escapeHtml(row.explanation)}</span></div><div class="wf-track" aria-hidden="true"><div class="wf-bar" style="width:${Math.max(1, Math.abs(row.runningMinor) / maximum * 100).toFixed(2)}%"></div></div><div class="wf-value">${row.amountMinor === 0 ? money(row.runningMinor) : `${row.amountMinor > 0 ? '+' : '−'}${money(Math.abs(row.amountMinor))}`}<small>${row.amountMinor === 0 ? 'subtotal' : `running ${money(row.runningMinor)}`}</small></div></li>`).join('')}</ol>
    </div>
    <div class="result-columns"><div><p class="eyebrow">Open rules</p><h3>What the app did</h3><ul class="audit-list">${result.audit.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul><details><summary>Mapped source evidence</summary>${kinds.map((kind) => `<p><strong>${kindLabels[kind].title}:</strong> ${escapeHtml(state.datasets[kind]?.fileName)} · ${state.datasets[kind]?.rows.length} rows</p>`).join('')}</details></div>
      <div class="explain-box"><h3>Explain the bank difference</h3><p class="small muted">Remaining: <strong class="money">${money(result.remainingVarianceMinor)}</strong>. Enter a signed amount: positive when the bank is higher, negative when lower.</p>
        ${state.adjustments.length ? `<ul class="adjustment-list">${state.adjustments.map((item) => `<li><span><strong>${escapeHtml(item.category)}</strong><br><span class="small">${escapeHtml(item.note)}</span></span><span class="money">${money(item.amountMinor)}</span><button class="button quiet small-button" type="button" data-action="remove-adjustment" data-id="${item.id}" aria-label="Remove ${escapeHtml(item.note)}">Remove</button></li>`).join('')}</ul>` : '<p class="small">No manual explanations yet.</p>'}
        <form id="adjustment-form"><div class="field"><label for="adjustment-category">Reason</label><select id="adjustment-category"><option value="timing">Timing difference</option><option value="bank-fee">Bank fee</option><option value="rounding">Rounding</option><option value="other">Other documented item</option></select></div><div class="field"><label for="adjustment-amount">Signed amount (${result.currency})</label><input id="adjustment-amount" inputmode="decimal" required placeholder="-0.12"></div><div class="field"><label for="adjustment-note">Evidence note</label><textarea id="adjustment-note" required maxlength="240" placeholder="Why this amount belongs here"></textarea></div><button class="button secondary" type="submit">Add explanation</button>${errorMessage ? `<p class="form-error" role="alert">${escapeHtml(errorMessage)}</p>` : ''}</form>
      </div></div>
    <div class="action-row"><button class="button" type="button" data-action="export-csv">Export reconciler CSV</button><button class="button secondary" type="button" data-action="export-pdf">Export accountant PDF</button><button class="button quiet" type="button" data-action="print">Print report</button></div>
  </section>`;
}

function renderPaid(): string {
  return `<section class="paid-section" aria-labelledby="desk-title"><div class="paid-grid"><div><p class="eyebrow">Optional one-time unlock</p><h2 id="desk-title">Keep a reconciliation desk</h2><p>US $19 once unlocks named reconciliation history and reusable column-mapping presets on this device. The complete reconciliation, CSV, accountant PDF, and JSON backup stay free.</p>
    ${license.unlocked ? `<p class="locked-note"><strong>Desk unlocked.</strong> ${escapeHtml(license.message)}</p><div class="action-row"><button class="button" type="button" data-action="save-history" ${state.result ? '' : 'disabled'}>Save this to history</button><button class="button quiet" type="button" data-action="remove-license">Remove license</button></div>`
      : `<div class="action-row"><a class="button" href="${checkoutUrl}">Buy Desk for US $19</a></div><p class="small muted">One-time purchase. Hosted checkout by Sociobot/Dodo, merchant of record. <a href="/terms/">Refund terms</a>.</p><div class="locked-note"><strong>${license.checking ? 'Checking for a license…' : 'Core tools are ready.'}</strong> ${escapeHtml(license.message)}</div><form id="license-form"><div class="field"><label for="license-token">Have a license? Paste it here</label><div class="license-form"><input id="license-token" type="text" autocomplete="off" required aria-describedby="license-help"><button class="button secondary" type="submit">Verify license</button></div><span class="field-help" id="license-help">Stored only in this browser.</span></div></form>`}</div>
    <div><h3>Saved work</h3>${license.unlocked ? (historyItems.length ? `<ul class="history-list">${historyItems.map((item) => `<li><p><strong>${escapeHtml(item.name)}</strong><br><span class="small muted">${new Date(item.savedAt).toLocaleString()}</span></p><span><button class="button quiet small-button" data-action="restore-history" data-id="${item.id}">Open</button><button class="button quiet small-button" data-action="delete-history" data-id="${item.id}">Delete</button></span></li>`).join('')}</ul>` : '<p class="muted">No saved reconciliations yet. Run one, then save it here.</p>') : '<p class="muted">Current work still survives refresh for everyone. Desk adds a library of named past work and mapping presets.</p>'}</div></div>
    <div class="data-tools"><h3>Your data, portable</h3><p class="small muted">JSON backup is free and contains your current files, mappings, and explanations. Keep it somewhere secure.</p><div class="action-row"><button class="button secondary" type="button" data-action="export-backup">Export JSON backup</button><label class="button quiet" for="backup-file">Import JSON backup</label><input class="file-input" id="backup-file" type="file" accept="application/json,.json"><button class="button danger" type="button" data-action="erase">Erase local work</button></div></div>
  </section>`;
}

function renderApp(): void {
  root.innerHTML = `${header()}<main id="main"><section class="hero"><div class="container hero-grid"><div class="hero-copy"><p class="eyebrow">Local payout evidence, made legible</p><h1>See where every payout penny went.</h1><p>Bring orders, a processor payout, and bank deposits. Map the columns yourself, inspect the rules, explain the variance, then hand your accountant a clean evidence pack.</p><div class="hero-actions"><a class="button" href="#workbench">Start a reconciliation</a><button class="button secondary" type="button" data-action="sample">Try the labelled example</button></div><p class="privacy-note"><svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M5 8V6a5 5 0 0 1 10 0v2h1v10H4V8h1zm2 0h6V6a3 3 0 0 0-6 0v2z"/></svg><span>Your CSVs never leave this device. No account, upload, or tracking.</span></p></div><figure class="hero-art"><picture><source type="image/avif" srcset="/art/balance-field-720.avif 720w, /art/balance-field.avif 1200w" sizes="(max-width: 820px) 92vw, 44vw"><source type="image/webp" srcset="/art/balance-field-720.webp 720w, /art/balance-field.webp 1200w" sizes="(max-width: 820px) 92vw, 44vw"><img src="/art/balance-field.png" width="1200" height="800" alt="Three fields of paper transaction tiles converge into one dark settlement bar" decoding="async" fetchpriority="high"></picture><figcaption class="art-label">THREE FILES → ONE EXPLANATION</figcaption></figure></div></section>
    <section class="workflow" id="workbench"><div class="container">${renderSteps()}<div class="section-intro"><div><p class="eyebrow">Private workbench</p><h2>One batch at a time</h2></div><p>Use one currency and one payout period. Original values and row numbers remain visible in every export.</p></div>${renderFiles()}${renderMapping()}${renderResults()}${renderPaid()}</div></section>
  </main>${footer()}<div id="live" class="live-region" aria-live="polite">${escapeHtml(liveMessage)}</div><div id="update-notice"></div>
  <dialog id="erase-dialog"><h2>Erase the current work?</h2><p>This removes the active draft and its imported CSV contents from this browser. Saved Desk history is not removed.</p><div class="action-row"><button class="button danger" type="button" data-action="confirm-erase">Erase current work</button><button class="button secondary" type="button" data-action="cancel-erase">Keep working</button></div></dialog>`;
  updateOfflineStatus();
}

function announce(message: string): void {
  liveMessage = message;
  const region = document.querySelector('#live');
  if (region) region.textContent = message;
}

function setStateChanged(message?: string): void {
  state.updatedAt = new Date().toISOString();
  void saveDraft(state).catch(() => { errorMessage = 'This browser could not save the local draft. Export a JSON backup before closing.'; renderApp(); });
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
  errorMessage = '';
  setStateChanged(`${file.name} added with ${parsed.rows.length} rows.`);
  renderApp();
}

function loadSample(): void {
  const sample: Record<DatasetKind, string> = {
    events: `order_id,event_date,event_type,amount,fee,payout_id,currency\nORD-1001,2026-08-18,sale,120.00,3.78,PO-0822,USD\nORD-1002,2026-08-19,sale,80.00,2.60,PO-0822,USD\nREF-1001,2026-08-20,refund,-25.00,0.00,PO-0822,USD`,
    payout: `payout_id,payout_date,gross,refunds,fees,net,currency\nPO-0822,2026-08-22,200.00,25.00,6.38,168.62,USD`,
    bank: `deposit_date,reference,amount,currency\n2026-08-23,PO-0822,168.50,USD\n2026-08-24,PO-0822,0.12,USD`,
  };
  for (const kind of kinds) {
    const parsed = parseCsv(sample[kind], kind, `example-${kind}.csv`);
    state.datasets[kind] = parsed;
    state.mappings[kind] = suggestMapping(parsed);
  }
  state.currency = 'USD'; state.mappingConfirmed = false; state.result = undefined; state.adjustments = [];
  errorMessage = '';
  setStateChanged('Labelled example loaded. Review the suggested mappings.');
  renderApp();
  document.querySelector('#mapping-title')?.scrollIntoView({ block: 'start' });
}

function runReconciliation(): void {
  try {
    state.result = reconcile(state.datasets, state.mappings, state.currency, state.adjustments);
    state.mappingConfirmed = true; errorMessage = '';
    setStateChanged(`Reconciliation complete: ${state.result.explainedPercent.toFixed(1)}% of bank variance explained.`);
    renderApp();
    document.querySelector('#results-title')?.scrollIntoView({ block: 'start' });
  } catch (error) {
    state.result = undefined; state.mappingConfirmed = false; errorMessage = (error as Error).message;
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
    document.documentElement.dataset.theme = next; localStorage.setItem('pre-theme', next); announce(`${next} theme selected.`); return;
  }
  if (action === 'sample') { loadSample(); return; }
  if (action === 'remove-file') {
    const kind = button.dataset.kind as DatasetKind; delete state.datasets[kind]; delete state.mappings[kind]; state.mappingConfirmed = false; state.result = undefined; setStateChanged(`${kindLabels[kind].title} removed.`); renderApp(); return;
  }
  if (action === 'reconcile') { runReconciliation(); return; }
  if (action === 'edit-mapping') { state.result = undefined; state.mappingConfirmed = false; setStateChanged(); renderApp(); document.querySelector('#mapping-title')?.scrollIntoView(); return; }
  if (action === 'remove-adjustment') { state.adjustments = state.adjustments.filter((item) => item.id !== button.dataset.id); runReconciliation(); return; }
  if (action === 'export-csv' && state.result) { exportReconcilerCsv(state, state.result); announce('Reconciler CSV downloaded.'); return; }
  if (action === 'export-pdf' && state.result) { exportPdf(state, state.result); announce('Accountant handoff PDF downloaded.'); return; }
  if (action === 'print') { window.print(); return; }
  if (action === 'export-backup') { exportBackup(state); announce('JSON backup downloaded.'); return; }
  if (action === 'erase') { (document.querySelector('#erase-dialog') as HTMLDialogElement).showModal(); return; }
  if (action === 'cancel-erase') { (document.querySelector('#erase-dialog') as HTMLDialogElement).close(); return; }
  if (action === 'confirm-erase') { await clearDraft(); state = emptyState(); errorMessage = ''; renderApp(); announce('Current local work erased.'); return; }
  if (action === 'save-history' && state.result && license.unlocked) {
    const item: SavedReconciliation = { id: crypto.randomUUID(), name: state.reconciliationName, savedAt: new Date().toISOString(), state: structuredClone(state) };
    await saveHistory(item); await refreshPaidData(); renderApp(); announce('Reconciliation saved to Desk history.'); return;
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
  if (action === 'activate-update') { const registration = await navigator.serviceWorker.getRegistration(); registration?.waiting?.postMessage({ type: 'SKIP_WAITING' }); return; }
}

function bindGlobalUi(): void {
  root.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (button) void handleClick(button);
  });
}

root.addEventListener('change', (event) => {
  const input = event.target as HTMLInputElement | HTMLSelectElement;
  if (input.dataset.fileKind && input instanceof HTMLInputElement && input.files?.[0]) {
    void addFile(input.dataset.fileKind as DatasetKind, input.files[0]).catch((error) => { errorMessage = (error as Error).message; renderApp(); }); return;
  }
  if (input.dataset.mapKind && input.dataset.mapField) {
    const kind = input.dataset.mapKind as DatasetKind;
    const mapping = state.mappings[kind] ?? ({} as ColumnMapping);
    const field = input.dataset.mapField as keyof ColumnMapping;
    if (input.value) mapping[field] = input.value; else delete mapping[field];
    state.mappings[kind] = mapping; state.mappingConfirmed = false; state.result = undefined; errorMessage = ''; setStateChanged(); return;
  }
  if (input.id === 'currency') { state.currency = input.value.toUpperCase(); state.mappingConfirmed = false; state.result = undefined; setStateChanged(); return; }
  if (input.id === 'reconciliation-name') { state.reconciliationName = input.value.trim() || 'Untitled reconciliation'; setStateChanged(); return; }
  if (input.id === 'backup-file' && input instanceof HTMLInputElement && input.files?.[0]) {
    void input.files[0].text().then((text) => {
      const parsed = JSON.parse(text) as { product?: string; state?: AppState };
      if (parsed.product !== 'payout-reconciliation-explainer' || parsed.state?.version !== 1) throw new Error('This is not a compatible Payout Explainer backup.');
      state = parsed.state; setStateChanged('JSON backup imported.'); renderApp();
    }).catch((error) => { errorMessage = (error as Error).message; renderApp(); });
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
      state.adjustments.push({ id: crypto.randomUUID(), category: (document.querySelector('#adjustment-category') as HTMLSelectElement).value as 'timing' | 'bank-fee' | 'rounding' | 'other', amountMinor, note, createdAt: new Date().toISOString() });
      runReconciliation();
    } catch (error) { errorMessage = (error as Error).message; announce(errorMessage); renderApp(); }
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
window.addEventListener('offline', () => { updateOfflineStatus(); announce('You are offline. The workbench and current draft remain available.'); });

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  const registration = await navigator.serviceWorker.register('/sw.js');
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) {
        const notice = document.querySelector('#update-notice');
        if (notice) notice.innerHTML = '<div class="notice" role="status"><strong>Update ready</strong><br><span class="small">Reload to use the newest workbench.</span><br><button class="button quiet small-button" data-action="activate-update">Reload update</button></div>';
      }
    });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => location.reload());
}

async function init(): Promise<void> {
  const savedTheme = localStorage.getItem('pre-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') document.documentElement.dataset.theme = savedTheme;
  if (location.pathname.startsWith('/privacy')) { renderLegal('privacy'); void registerServiceWorker(); return; }
  if (location.pathname.startsWith('/terms')) { renderLegal('terms'); void registerServiceWorker(); return; }
  captureReturnedLicense();
  try { state = (await loadDraft()) ?? emptyState(); } catch { state = emptyState(); errorMessage = 'Local storage is unavailable. You can still reconcile and export in this tab.'; }
  if (state.mappingConfirmed === undefined) state.mappingConfirmed = Boolean(state.result);
  renderApp(); bindGlobalUi();
  void getLicenseState().then(async (next) => { license = next; await refreshPaidData(); renderApp(); });
  void registerServiceWorker().catch(() => announce('Offline installation is unavailable in this browser.'));
}

void init();
