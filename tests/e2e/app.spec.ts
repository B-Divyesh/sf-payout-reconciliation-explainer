import { expect, test, type BrowserContextOptions, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import axe from 'axe-core';

const origin = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173';
const checkout = 'https://api.sociobot.in/api/v1/products/payout-reconciliation-explainer/checkout';

const sampleFiles = {
  events: { name: 'order-events.csv', mimeType: 'text/csv', buffer: Buffer.from('order_id,event_date,event_type,amount,fee,payout_id,currency\nORD-2001,2026-08-18,sale,120.00,3.78,PO-2000,USD\nORD-2002,2026-08-19,sale,80.00,2.60,PO-2000,USD\nREF-2001,2026-08-20,refund,-25.00,0.00,PO-2000,USD') },
  payout: { name: 'processor-payout.csv', mimeType: 'text/csv', buffer: Buffer.from('payout_id,payout_date,gross,refunds,fees,net,currency\nPO-2000,2026-08-22,200.00,25.00,6.38,168.62,USD') },
  bank: { name: 'bank-deposits.csv', mimeType: 'text/csv', buffer: Buffer.from('deposit_date,reference,amount,currency\n2026-08-23,PO-2000,168.50,USD\n2026-08-24,PO-2000,0.12,USD') },
} as const;

const roundTripFiles = {
  events: { name: 'roundtrip-events.csv', mimeType: 'text/csv', buffer: Buffer.from('order_id,event_date,event_type,amount,fee,payout_id,currency\nORD-ROUND,2026-08-18,sale,15.00,0.50,PO-ROUND,USD') },
  payout: { name: 'roundtrip-payout.csv', mimeType: 'text/csv', buffer: Buffer.from('payout_id,payout_date,net,currency\nPO-ROUND,2026-08-22,12.50,USD') },
  bank: { name: 'roundtrip-bank.csv', mimeType: 'text/csv', buffer: Buffer.from('deposit_date,reference,amount,currency\n2026-08-23,PO-ROUND,12.38,USD') },
} as const;

const calculationFiles = {
  events: { name: 'calculation-events.csv', mimeType: 'text/csv', buffer: Buffer.from('order_id,event_date,event_type,amount,fee,payout_id,currency\nSALE-1,2026-08-01,sale,100.00,2.00,PO-RULES,USD\nREF-1,2026-08-02,refund,25.00,0.00,PO-RULES,USD\nCB-1,2026-08-03,chargeback,-10.00,0.00,PO-RULES,USD\nRETURN-1,2026-08-04,return,5.00,0.00,PO-RULES,USD\nREV-1,2026-08-05,reversal,4.00,0.00,PO-RULES,USD\nNEG-1,2026-08-06,sale,-3.00,0.00,PO-RULES,USD\nFEE-NEG,2026-08-07,sale,20.00,-1.50,PO-RULES,USD') },
  payout: { name: 'calculation-payout.csv', mimeType: 'text/csv', buffer: Buffer.from('payout_id,payout_date,net,currency\nPO-RULES,2026-08-08,70.00,USD') },
  bank: { name: 'calculation-bank.csv', mimeType: 'text/csv', buffer: Buffer.from('deposit_date,reference,amount,currency\n2026-08-09,PO-RULES,69.88,USD') },
} as const;

async function uploadSampleFiles(page: Page): Promise<void> {
  await page.locator('#file-events').setInputFiles(sampleFiles.events);
  await page.locator('#file-payout').setInputFiles(sampleFiles.payout);
  await page.locator('#file-bank').setInputFiles(sampleFiles.bank);
}

async function uploadFiles(page: Page, files: Record<'events' | 'payout' | 'bank', { name: string; mimeType: string; buffer: Buffer }>): Promise<void> {
  await page.locator('#file-events').setInputFiles(files.events);
  await page.locator('#file-payout').setInputFiles(files.payout);
  await page.locator('#file-bank').setInputFiles(files.bank);
}

async function eraseCurrentDraft(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Erase current draft' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Erase current draft' }).click();
  await expect(page.getByRole('heading', { name: 'Add three source files' })).toBeVisible();
}

async function reconcileCurrencyFixture(page: Page, currency: 'JPY' | 'BHD'): Promise<void> {
  const decimal = currency === 'JPY' ? '100' : '10.001';
  const fee = currency === 'JPY' ? '1' : '0.001';
  const expected = currency === 'JPY' ? '99' : '10.000';
  const files = {
    events: { name: `${currency.toLowerCase()}-events.csv`, mimeType: 'text/csv', buffer: Buffer.from(`order_id,event_date,event_type,amount,fee,payout_id,currency\n${currency}-1,2026-08-10,sale,${decimal},${fee},PO-${currency},${currency}`) },
    payout: { name: `${currency.toLowerCase()}-payout.csv`, mimeType: 'text/csv', buffer: Buffer.from(`payout_id,payout_date,net,currency\nPO-${currency},2026-08-11,${expected},${currency}`) },
    bank: { name: `${currency.toLowerCase()}-bank.csv`, mimeType: 'text/csv', buffer: Buffer.from(`deposit_date,reference,amount,currency\n2026-08-12,PO-${currency},${expected},${currency}`) },
  } as const;
  await uploadFiles(page, files);
  await page.getByLabel('Reconciliation currency').fill(currency);
  await page.getByLabel('Reconciliation currency').press('Tab');
  await page.getByRole('button', { name: 'Run reconciliation' }).click();
  await expect(page.getByText(`Currency precision: ${currency} uses ${currency === 'JPY' ? '0 decimal places' : '3 decimal places'}; calculations use integer minor units.`)).toBeVisible();
  await expect(page.locator('.source-table tbody tr').first()).toContainText(`${decimal} ${currency}`);
  await expect(page.getByRole('heading', { name: 'The bank deposits balance' })).toBeVisible();
}

async function openDemo(page: Page): Promise<void> {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The bank deposits balance' })).toBeVisible();
}

function isolatedContextOptions(projectName: string): BrowserContextOptions {
  return projectName === 'mobile'
    ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
    : { viewport: { width: 1280, height: 720 } };
}

async function openReadyRealWorkspace(page: Page): Promise<void> {
  await page.goto(`${origin}/demo`);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The bank deposits balance' })).toBeVisible();
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(`${origin}/`);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Add three source files' })).toBeVisible();
  await expect(page.locator('input[type="file"][data-file-kind]')).toHaveCount(3);
}

async function putRealRecords(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const state = {
      version: 1, datasets: {}, mappings: {}, mappingConfirmed: false, currency: 'USD', adjustments: [],
      reconciliationName: 'REAL DRAFT MARKER', updatedAt: '2026-08-30T00:00:00.000Z',
    };
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('payout-reconciliation-explainer', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('draft')) db.createObjectStore('draft');
        if (!db.objectStoreNames.contains('history')) db.createObjectStore('history', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('presets')) db.createObjectStore('presets', { keyPath: 'name' });
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(['draft', 'history'], 'readwrite');
        tx.objectStore('draft').put(state, 'current');
        tx.objectStore('history').put({ id: 'real-history', name: 'Saved real payout', savedAt: '2026-08-30T00:00:00.000Z', state });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  });
}

test('@claim:demo-ready opens a completed sample from the landing action in one click', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Reconcile a payout with order events and bank deposits.');
  await page.getByRole('link', { name: 'Try it with sample data' }).first().click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The bank deposits balance' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start for real' })).toBeVisible();
  await expect(page.getByText('100.0%').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export accountant PDF' })).toBeVisible();
});

test('query-string demo entry opens the same isolated completed sample', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page).toHaveTitle('Demo — Payout Reconciliation Explainer');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The bank deposits balance' })).toBeVisible();
});

test('direct demo entry keeps its heading and sample name in the initial viewport', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'The bank deposits balance' })).toBeVisible();

  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  const bannerBottom = await page.locator('.demo-banner').evaluate((element) => element.getBoundingClientRect().bottom);
  const heading = page.getByRole('heading', { name: 'Review a completed payout reconciliation.' });
  const headingBox = await heading.boundingBox();
  expect(headingBox).not.toBeNull();
  expect(headingBox!.y).toBeGreaterThanOrEqual(bannerBottom);
  expect(headingBox!.y + headingBox!.height).toBeLessThanOrEqual(await page.evaluate(() => innerHeight));
  await expect(page.getByRole('heading', { name: 'Sample payout PO-0822' })).toBeVisible();
});

test('@claim:demo-isolation keeps real data unchanged and discards demo data', async ({ page }) => {
  await page.goto('/');
  await putRealRecords(page);
  await page.getByRole('link', { name: 'Demo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The bank deposits balance' })).toBeVisible();
  let databases = await page.evaluate(async () => (await indexedDB.databases()).map((item) => item.name));
  expect(databases).toContain('demo:payout-reconciliation-explainer');
  expect(databases).toContain('payout-reconciliation-explainer');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Sample payout PO-0822')).toBeVisible();
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL('/');
  databases = await page.evaluate(async () => (await indexedDB.databases()).map((item) => item.name));
  expect(databases).not.toContain('demo:payout-reconciliation-explainer');
  const realName = await page.evaluate(async () => await new Promise<string>((resolve, reject) => {
    const request = indexedDB.open('payout-reconciliation-explainer', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const get = db.transaction('draft').objectStore('draft').get('current');
      get.onsuccess = () => { db.close(); resolve(get.result.reconciliationName); };
      get.onerror = () => reject(get.error);
    };
  }));
  expect(realName).toBe('REAL DRAFT MARKER');
});

test('@claim:local-privacy keeps the complete demo flow same-origin', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await openDemo(page);
  const csv = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export reconciler CSV' }).click();
  await csv;
  const pdf = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export accountant PDF' }).click();
  await pdf;
  const json = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON backup' }).click();
  await json;
  await page.evaluate(() => { window.print = () => document.documentElement.setAttribute('data-private-print-called', 'yes'); });
  await page.getByRole('button', { name: 'Print report' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-private-print-called', 'yes');
  expect(requests.filter((url) => !url.startsWith(origin))).toEqual([]);
  await expect(page.getByRole('link', { name: /sign in|create account/i })).toHaveCount(0);
});

test('@claim:file-limits rejects oversized, headerless, and over-row-limit CSVs', async ({ browser }, testInfo) => {
  const cases = [
    {
      label: 'file larger than 10 MB',
      kind: 'events',
      file: { name: 'events-oversized.csv', mimeType: 'text/csv', buffer: Buffer.alloc(10 * 1024 * 1024 + 1, 65) },
      error: 'larger than 10 MB',
    },
    {
      label: 'file without a header',
      kind: 'payout',
      file: { name: 'payout-headerless.csv', mimeType: 'text/csv', buffer: Buffer.from('') },
      error: /header|empty/i,
    },
    {
      label: 'file with 50,001 data rows',
      kind: 'bank',
      file: { name: 'bank-too-many.csv', mimeType: 'text/csv', buffer: Buffer.from(`a,b\n${'1,\n'.repeat(50_001)}`) },
      error: 'more than 50,000 rows',
    },
  ] as const;

  for (const limitCase of cases) {
    await test.step(limitCase.label, async () => {
      const context = await browser.newContext(isolatedContextOptions(testInfo.project.name));
      try {
        const isolatedPage = await context.newPage();
        await openReadyRealWorkspace(isolatedPage);
        const input = isolatedPage.locator(`#file-${limitCase.kind}`);
        await expect(input).toBeAttached();
        await input.setInputFiles(limitCase.file);
        await expect(isolatedPage.getByRole('alert')).toContainText(limitCase.error);
      } finally {
        await context.close();
      }
    });
  }
});

test('@claim:free-exports produces CSV, PDF, print, and JSON handoffs', async ({ page }) => {
  await openDemo(page);
  const csvEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export reconciler CSV' }).click();
  const csv = await csvEvent;
  expect(csv.suggestedFilename()).toMatch(/reconciler\.csv$/);
  const csvText = await readFile(await csv.path() as string, 'utf8');
  expect(csvText).toContain('source,row,record_id');
  expect(csvText).toContain('events,2,ORD-1001');

  const pdfEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export accountant PDF' }).click();
  const pdf = await pdfEvent;
  expect(pdf.suggestedFilename()).toMatch(/accountant-handoff\.pdf$/);
  const pdfBytes = await readFile(await pdf.path() as string);
  expect(pdfBytes.subarray(0, 8).toString()).toContain('%PDF-1.4');
  expect(pdfBytes.toString('latin1')).toContain('ORD-1001');
  expect(pdfBytes.toString('latin1')).toContain('Source row 2');

  const jsonEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON backup' }).click();
  const json = await jsonEvent;
  const backup = JSON.parse(await readFile(await json.path() as string, 'utf8'));
  expect(backup.state.reconciliationName).toBe('Sample payout PO-0822');
  expect(backup.state.datasets.events.rows[0]).toMatchObject({ order_id: 'ORD-1001', amount: '120.00' });

  await page.evaluate(() => { window.print = () => document.documentElement.setAttribute('data-print-called', 'yes'); });
  await expect(page.locator('td[data-label="Mapped ID"]', { hasText: 'ORD-1001' })).toBeVisible();
  await page.getByRole('button', { name: 'Print report' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-print-called', 'yes');
});

test('@claim:backup-roundtrip restores files, changed mappings, explanations, and the reconciliation', async ({ page }) => {
  await openReadyRealWorkspace(page);
  await uploadFiles(page, roundTripFiles);
  await page.getByLabel('Reconciliation name').fill('Round-trip payout');
  await page.locator('#map-events-id').selectOption('event_type');
  await page.getByRole('button', { name: 'Run reconciliation' }).click();
  await expect(page.locator('.summary-strip')).toContainText('Expected payout$14.50');
  await expect(page.locator('.summary-strip')).toContainText('Remaining variance-$0.12');
  await page.getByLabel(/Signed amount/).fill('-0.12');
  await page.getByLabel('Evidence note').fill('Round-trip timing evidence');
  await page.getByRole('button', { name: 'Add explanation' }).click();
  await expect(page.getByRole('heading', { name: 'The variance is explained' })).toBeVisible();

  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON backup' }).first().click();
  const download = await downloadEvent;
  const backupPath = await download.path();
  expect(backupPath).toBeTruthy();
  const backup = JSON.parse(await readFile(backupPath as string, 'utf8'));
  expect(backup.state.datasets.events).toMatchObject({ fileName: 'roundtrip-events.csv' });
  expect(backup.state.mappings.events).toMatchObject({ id: 'event_type' });
  expect(backup.state.adjustments).toEqual(expect.arrayContaining([expect.objectContaining({ amountMinor: -12, note: 'Round-trip timing evidence' })]));

  await eraseCurrentDraft(page);
  await page.locator('#backup-file').setInputFiles(backupPath as string);
  await expect(page.getByRole('heading', { name: 'Round-trip payout' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The variance is explained' })).toBeVisible();
  await expect(page.getByText('roundtrip-events.csv · 1 rows')).toBeVisible();
  await expect(page.locator('td[data-label="Mapped ID"]').first()).toHaveText('sale');
  await expect(page.getByText('Round-trip timing evidence')).toBeVisible();
  await expect(page.locator('.summary-strip')).toContainText('Remaining variance$0.00');
});

test('@claim:offline-reload reloads the completed demo offline in its own context', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'one dedicated browser context is sufficient');
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${origin}/demo`);
  await expect(page.getByRole('heading', { name: 'The bank deposits balance' })).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The bank deposits balance' })).toBeVisible();
  await context.close();
});

test('@claim:draft-persistence keeps a real draft after refresh', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#file-events').setInputFiles({
    name: 'my-order-events.csv', mimeType: 'text/csv',
    buffer: Buffer.from('order_id,event_date,event_type,amount,fee,currency\nA1,2026-08-01,sale,10.00,0.30,USD'),
  });
  await expect(page.getByText('my-order-events.csv', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('my-order-events.csv', { exact: true })).toBeVisible();
});

test('@claim:saved-history-license saves and reopens history and reuses a changed mapping', async ({ page }) => {
  await page.route('https://api.sociobot.in/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"valid":true,"reason":"ok"}' }));
  await openDemo(page);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await uploadSampleFiles(page);
  await expect(page.getByText('Pay US $19 once')).toBeVisible();
  await expect(page.getByText('Reconciliation and every export remain free.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy saved history for US $19' })).toHaveAttribute('href', checkout);
  await expect(page.locator('a[href*="dodo"]')).toHaveCount(0);
  await page.getByLabel('Have a license? Paste it here').fill('test-license-token');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('Saved history is active.')).toBeVisible();

  await page.getByLabel('Reconciliation name').fill('August shop payout');
  await page.locator('#map-events-id').selectOption('event_type');
  page.once('dialog', (dialog) => dialog.accept('Changed processor columns'));
  await page.getByRole('button', { name: 'Save mapping preset' }).click();
  await page.getByRole('button', { name: 'Run reconciliation' }).click();
  await expect(page.getByRole('heading', { name: 'August shop payout' })).toBeVisible();
  await page.getByRole('button', { name: 'Save this reconciliation' }).click();
  await expect(page.getByText('August shop payout', { exact: true }).last()).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { name: 'Open' })).toBeVisible();
  await page.getByRole('button', { name: 'Open' }).click();
  await expect(page.getByRole('heading', { name: 'August shop payout' })).toBeVisible();
  const stored = await page.evaluate(async () => await new Promise<{ history: number; presets: number; presetId: string }>((resolve, reject) => {
    const request = indexedDB.open('payout-reconciliation-explainer', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(['history', 'presets']);
      const history = tx.objectStore('history').count();
      const presets = tx.objectStore('presets').getAll();
      tx.oncomplete = () => { db.close(); resolve({ history: history.result, presets: presets.result.length, presetId: presets.result[0].value.events.id }); };
      tx.onerror = () => reject(tx.error);
    };
  }));
  expect(stored).toEqual({ history: 1, presets: 1, presetId: 'event_type' });

  await page.getByRole('button', { name: 'Erase current draft' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Erase current draft' }).click();
  await uploadSampleFiles(page);
  await page.getByRole('button', { name: 'Use saved preset' }).click();
  await expect(page.locator('#map-events-id')).toHaveValue('event_type');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();
  const historyCount = await page.evaluate(async () => await new Promise<number>((resolve, reject) => {
    const request = indexedDB.open('payout-reconciliation-explainer', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const count = db.transaction('history').objectStore('history').count();
      count.onsuccess = () => { db.close(); resolve(count.result); };
      count.onerror = () => reject(count.error);
    };
  }));
  expect(historyCount).toBe(0);
});

test('@claim:license-verification-privacy sends only the stored token for a license check', async ({ page }) => {
  const billingRequests: { url: string; method: string; body: string | null }[] = [];
  await page.route('https://api.sociobot.in/**', async (route) => {
    const request = route.request();
    billingRequests.push({ url: request.url(), method: request.method(), body: request.postData() });
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"valid":true,"reason":"ok"}' });
  });
  await openDemo(page);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#file-events').setInputFiles({
    name: 'private-events.csv', mimeType: 'text/csv',
    buffer: Buffer.from('order_id,event_date,amount\nSECRET-CSV-MARKER,2026-08-18,10.00'),
  });
  await page.getByLabel('Have a license? Paste it here').fill('fixture-license-token');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('Saved history is active.')).toBeVisible();
  expect(billingRequests).toHaveLength(1);
  const requestUrl = new URL(billingRequests[0]!.url);
  expect(requestUrl.pathname).toBe('/api/v1/products/payout-reconciliation-explainer/verify');
  expect([...requestUrl.searchParams.keys()]).toEqual(['license']);
  expect(requestUrl.searchParams.get('license')).toBe('fixture-license-token');
  expect(billingRequests[0]).toMatchObject({ method: 'GET', body: null });
  expect(JSON.stringify(billingRequests)).not.toContain('SECRET-CSV-MARKER');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:payout-reconciliation-explainer'))).toBe('fixture-license-token');
});

test('@claim:hosted-checkout opens the product checkout without embedding payment fields', async ({ page }) => {
  await page.route(checkout, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Sociobot checkout fixture</title><h1>Hosted checkout</h1>' }));
  await page.goto('/');
  await expect(page.locator('input[autocomplete="cc-number"], input[name*="card" i]')).toHaveCount(0);
  await expect(page.locator('script[src^="http"]')).toHaveCount(0);
  const requestPromise = page.waitForRequest(checkout);
  await page.getByRole('link', { name: 'Buy saved history for US $19' }).click();
  const request = await requestPromise;
  expect(request.method()).toBe('GET');
  await expect(page).toHaveURL(checkout);
  await expect(page).toHaveTitle('Sociobot checkout fixture');
});

test('@claim:required-columns identifies and recovers from every missing required mapping', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await uploadSampleFiles(page);
  const required = [
    ['#map-events-date', 'event_date', 'Event date', 'Order events'],
    ['#map-events-amount', 'amount', 'Event amount', 'Order events'],
    ['#map-payout-date', 'payout_date', 'Payout date', 'Processor payout'],
    ['#map-payout-net', 'net', 'Net payout', 'Processor payout'],
    ['#map-bank-date', 'deposit_date', 'Deposit date', 'Bank deposits'],
    ['#map-bank-amount', 'amount', 'Deposit amount', 'Bank deposits'],
  ] as const;
  for (const [selector, value, label, source] of required) {
    await page.locator(selector).selectOption('');
    await page.getByRole('button', { name: 'Run reconciliation' }).click();
    await expect(page.getByRole('alert')).toContainText(`Choose the ${label} column for ${source}`);
    await page.locator(selector).selectOption(value);
    await page.getByRole('button', { name: 'Run reconciliation' }).click();
    await expect(page.getByRole('heading', { name: 'The bank deposits balance' })).toBeVisible();
    if (selector !== '#map-bank-amount') await page.getByRole('button', { name: 'Edit mapping' }).click();
  }
});

test('@claim:erase-scope erases only the real current draft', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await putRealRecords(page);
  await page.reload();
  await page.getByRole('button', { name: 'Erase current draft' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Erase current draft' }).click();
  const records = await page.evaluate(async () => await new Promise<{ draft: unknown; history: number }>((resolve, reject) => {
    const request = indexedDB.open('payout-reconciliation-explainer', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(['draft', 'history']);
      const draft = tx.objectStore('draft').get('current');
      const history = tx.objectStore('history').count();
      tx.oncomplete = () => { db.close(); resolve({ draft: draft.result, history: history.result }); };
      tx.onerror = () => reject(tx.error);
    };
  }));
  expect(records.draft).toBeUndefined();
  expect(records.history).toBe(1);
});

test('@claim:visible-reconciliation calculates the sample and shows its evidence', async ({ page }) => {
  await openDemo(page);
  await expect(page.locator('.summary-strip')).toContainText('Expected payout$168.62');
  await expect(page.locator('.summary-strip')).toContainText('Reported payout$168.62');
  await expect(page.locator('.summary-strip')).toContainText('Bank deposits$168.62');
  await expect(page.locator('.summary-strip')).toContainText('Remaining variance$0.00');
  await expect(page.getByRole('heading', { name: 'How the totals reconcile' })).toBeVisible();
  await expect(page.locator('.waterfall')).toContainText('Gross order events');
  await expect(page.locator('.waterfall')).toContainText('Refunds & reversals');
  await expect(page.locator('.waterfall')).toContainText('Event fees');
  await expect(page.locator('.waterfall')).toContainText('Expected processor payout');
  await expect(page.getByText('sample-events.csv · 3 rows')).toBeVisible();
  await expect(page.getByText('sample-bank.csv · 2 rows')).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(3);
  expect(await page.getByRole('cell').count()).toBeGreaterThan(0);
  await expect(page.locator('td[data-label="Mapped ID"]', { hasText: 'ORD-1001' })).toBeVisible();
  const row = page.locator('.source-table tbody tr').filter({ hasText: 'ORD-1001' });
  await expect(row).toContainText('2');
  await expect(row).toContainText('2026-08-18');
  await expect(row).toContainText('120.00 USD');
  await expect(row).toContainText('order_id');
  await expect(row).toContainText('120.00');
});

test('@claim:calculation-rules applies mapped rows, minor-unit currencies, refunds, fees, and written explanations', async ({ page }) => {
  await openReadyRealWorkspace(page);
  await uploadFiles(page, calculationFiles);
  await page.getByRole('button', { name: 'Run reconciliation' }).click();
  await expect(page.locator('.summary-strip')).toContainText('Expected payout$69.50');
  await expect(page.locator('.summary-strip')).toContainText('Reported payout$70.00');
  await expect(page.locator('.summary-strip')).toContainText('Bank deposits$69.88');
  await expect(page.locator('.summary-strip')).toContainText('Remaining variance-$0.12');
  await expect(page.getByText('The totals below use the mapped rows and any written explanation.')).toBeVisible();
  await expect(page.getByText('Currency precision: USD uses 2 decimal places; calculations use integer minor units.')).toBeVisible();
  await expect(page.getByText('Events rule: positive rows count as orders; negative rows or types containing refund, chargeback, return, or reversal count as refunds.')).toBeVisible();
  await expect(page.getByText('Fee rule: the mapped event-fee values are deducted by absolute value.')).toBeVisible();
  await expect(page.getByText('Scope rule: this result sums all 7 imported event, 1 payout, and 1 bank rows.')).toBeVisible();
  const eventBody = page.locator('.source-group').filter({ has: page.getByRole('heading', { name: 'Order events' }) }).locator('tbody');
  const eventRows = eventBody.locator('tr');
  await expect(eventRows).toHaveCount(7);
  await expect(eventBody).toContainText('refund');
  await expect(eventBody).toContainText('chargeback');
  await expect(eventBody).toContainText('return');
  await expect(eventBody).toContainText('reversal');
  await expect(eventBody).toContainText('-1.50');
  await expect(page.getByText('calculation-payout.csv · 1 rows')).toBeVisible();
  await expect(page.getByText('calculation-bank.csv · 1 rows')).toBeVisible();

  await page.getByLabel(/Signed amount/).fill('-0.12');
  await page.getByLabel('Evidence note').fill('Bank timing rule evidence');
  await page.getByRole('button', { name: 'Add explanation' }).click();
  await expect(page.getByRole('heading', { name: 'The variance is explained' })).toBeVisible();
  await expect(page.locator('.summary-strip')).toContainText('Remaining variance$0.00');
  await expect(page.getByText('Manual explanations: 1 item accounts for the signed payout-to-bank variance only.')).toBeVisible();

  await eraseCurrentDraft(page);
  await reconcileCurrencyFixture(page, 'JPY');
  await eraseCurrentDraft(page);
  await reconcileCurrencyFixture(page, 'BHD');
});

test('@claim:no-integrations exposes no connection or ledger-posting action', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'What this app does not do' })).toBeVisible();
  await expect(page.getByText('It does not connect to banks or commerce platforms.')).toBeVisible();
  await expect(page.getByText('It does not create or post ledger entries.')).toBeVisible();
  await expect(page.getByRole('button', { name: /connect|post.*ledger/i })).toHaveCount(0);
});

test('@claim:build-output creates the static deployment root', async ({ page }) => {
  await openDemo(page);
  const files = await Promise.all(['index.html', 'demo/index.html', 'privacy/index.html', 'terms/index.html', '404.html', 'sw.js', 'manifest.webmanifest'].map(async (name) => {
    const value = await readFile(new URL(`../../dist/${name}`, import.meta.url), 'utf8');
    return value.length;
  }));
  expect(files.every((size) => size > 100)).toBe(true);
  const manifest = JSON.parse(await readFile(new URL('../../dist/manifest.webmanifest', import.meta.url), 'utf8'));
  expect(manifest).toMatchObject({ display: 'standalone' });
  expect(manifest.icons).toEqual(expect.arrayContaining([expect.objectContaining({ sizes: '192x192' }), expect.objectContaining({ sizes: '512x512' })]));
});

test('routes set metadata, focus headings, support Back, and show the designed 404', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Payout Reconciliation Explainer — explain differences');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://payout-reconciliation-explainer.sociobot.in/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-preview\.png$/);
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await expect(page.locator('h1')).toBeFocused();
  await expect(page).toHaveTitle('Privacy — Payout Reconciliation Explainer');
  await page.goBack();
  await expect(page.locator('h1')).toBeFocused();
  await page.goto('/does-not-exist');
  await expect(page.locator('h1')).toHaveText('This payout path does not exist.');
  await expect(page.getByRole('link', { name: 'Return home' })).toBeVisible();
});

test('erase dialog contains focus and returns it after Escape', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Erase current draft' });
  await trigger.click();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Erase current draft' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('invalid manual explanations expose one associated error', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#file-events').setInputFiles({
    name: 'orders.csv', mimeType: 'text/csv',
    buffer: Buffer.from('order_id,event_date,event_type,amount,fee,payout_id,currency\nORD-1,2026-08-01,sale,15.00,0.50,PO-1,USD'),
  });
  await page.locator('#file-payout').setInputFiles({
    name: 'payout.csv', mimeType: 'text/csv',
    buffer: Buffer.from('payout_id,payout_date,net,currency\nPO-1,2026-08-02,12.50,USD'),
  });
  await page.locator('#file-bank').setInputFiles({
    name: 'bank.csv', mimeType: 'text/csv',
    buffer: Buffer.from('deposit_date,reference,amount,currency\n2026-08-03,PO-1,12.38,USD'),
  });
  await page.getByRole('button', { name: 'Run reconciliation' }).click();
  await page.getByLabel(/Signed amount/).fill('0.12');
  await page.getByLabel('Evidence note').fill('Bank timing evidence');
  await page.getByRole('button', { name: 'Add explanation' }).click();
  const error = page.locator('#adjustment-error');
  await expect(error).toContainText('same sign as the remaining variance');
  await expect(page.getByRole('alert')).toHaveCount(1);
  await expect(page.getByLabel(/Signed amount/)).toHaveAttribute('aria-describedby', 'adjustment-error');
  await expect(page.getByLabel(/Signed amount/)).toHaveAttribute('aria-invalid', 'true');
});

test('at 390px every visible interactive target is at least 44px', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'the mobile project fixes the viewport at 390px');
  const selector = 'a[href], button:not(:disabled), input:not([type="hidden"]):not([type="file"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [role="button"]:not([aria-disabled="true"])';
  for (const path of ['/', '/demo', '/privacy/', '/terms/', '/does-not-exist']) {
    await page.goto(path);
    const undersized = await page.locator(selector).evaluateAll((elements) => elements.flatMap((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) return [];
      return rect.width < 44 || rect.height < 44 ? [{ label: (element.getAttribute('aria-label') || element.textContent || element.tagName).trim(), width: rect.width, height: rect.height }] : [];
    }));
    expect(undersized, `${path} has an undersized visible interactive target`).toEqual([]);
  }
});

test('passes keyboard, mobile, console, and axe checks on every route', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  for (const path of ['/', '/demo', '/privacy/', '/terms/', '/does-not-exist']) {
    await page.goto(path);
    await page.addScriptTag({ content: axe.source });
    const results = await page.evaluate(async () => await (window as unknown as { axe: typeof axe }).axe.run(document));
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? '')), path).toEqual([]);
    expect(await page.locator('h1').count(), path).toBe(1);
    expect(await page.locator('main').count(), path).toBe(1);
    if (testInfo.project.name === 'mobile') expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), path).toBe(false);
  }
  for (const path of ['/', '/demo']) {
    await page.goto(path);
    await page.getByRole('button', { name: 'Switch color theme' }).click();
    await page.addScriptTag({ content: axe.source });
    const darkResults = await page.evaluate(async () => await (window as unknown as { axe: typeof axe }).axe.run(document));
    expect(darkResults.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? '')), `${path} dark`).toEqual([]);
  }
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  expect(errors).toEqual([]);
});
