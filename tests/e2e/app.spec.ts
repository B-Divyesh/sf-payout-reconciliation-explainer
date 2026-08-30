import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import axe from 'axe-core';

const origin = 'http://127.0.0.1:4173';

async function openDemo(page: Page): Promise<void> {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The bank deposit balances' })).toBeVisible();
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

test('@claim:demo-ready opens a completed sample directly', async ({ page }) => {
  await openDemo(page);
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start for real' })).toBeVisible();
  await expect(page.getByText('100.0%').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export accountant PDF' })).toBeVisible();
});

test('landing reaches the completed demo in one click', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Reconcile a payout with orders and bank deposits.');
  await page.getByRole('link', { name: 'Try it with sample data' }).first().click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole('heading', { name: 'The bank deposit balances' })).toBeVisible();
});

test('query-string demo entry opens the same isolated completed sample', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page).toHaveTitle('Demo — Payout Reconciliation Explainer');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The bank deposit balances' })).toBeVisible();
});

test('@claim:demo-isolation keeps real data unchanged and discards demo data', async ({ page }) => {
  await page.goto('/');
  await putRealRecords(page);
  await page.getByRole('link', { name: 'Demo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The bank deposit balances' })).toBeVisible();
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
  expect(requests.filter((url) => !url.startsWith(origin))).toEqual([]);
  await expect(page.getByRole('link', { name: /sign in|create account/i })).toHaveCount(0);
});

test('@claim:file-limits rejects oversized, headerless, and over-row-limit CSVs', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: 'Start for real' }).click();
  const input = page.locator('#file-events');
  await input.setInputFiles({ name: 'oversized.csv', mimeType: 'text/csv', buffer: Buffer.alloc(10 * 1024 * 1024 + 1, 65) });
  await expect(page.getByRole('alert')).toContainText('larger than 10 MB');
  await input.setInputFiles({ name: 'headerless.csv', mimeType: 'text/csv', buffer: Buffer.from('') });
  await expect(page.getByRole('alert')).toContainText(/header|empty/i);
  const tooManyRows = `event_date,amount\n${'2026-08-01,1\n'.repeat(50_001)}`;
  await input.setInputFiles({ name: 'too-many.csv', mimeType: 'text/csv', buffer: Buffer.from(tooManyRows) });
  await expect(page.getByRole('alert')).toContainText('more than 50,000 rows');
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

  const jsonEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON backup' }).click();
  const json = await jsonEvent;
  const backup = JSON.parse(await readFile(await json.path() as string, 'utf8'));
  expect(backup.state.reconciliationName).toBe('Sample payout PO-0822');

  await page.evaluate(() => { window.print = () => document.documentElement.setAttribute('data-print-called', 'yes'); });
  await page.getByRole('button', { name: 'Print report' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-print-called', 'yes');
});

test('@claim:offline-reload reloads the completed demo offline in its own context', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'one dedicated browser context is sufficient');
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${origin}/demo`);
  await expect(page.getByRole('heading', { name: 'The bank deposit balances' })).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The bank deposit balances' })).toBeVisible();
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

test('@claim:saved-history-license proves price, free scope, and license activation', async ({ page }) => {
  await page.route('https://api.sociobot.in/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"valid":true,"reason":"ok"}' }));
  await openDemo(page);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page.getByText('Pay US $19 once')).toBeVisible();
  await expect(page.getByText('Reconciliation and every export remain free.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy saved history for US $19' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/payout-reconciliation-explainer/checkout');
  await expect(page.locator('a[href*="dodo"]')).toHaveCount(0);
  await page.getByLabel('Have a license? Paste it here').fill('test-license-token');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('Saved history is active.')).toBeVisible();
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
  await expect(page.locator('.summary-strip')).toContainText('Bank deposit$168.62');
  await expect(page.locator('.summary-strip')).toContainText('Remaining variance$0.00');
  await page.getByText('Mapped source evidence').click();
  await expect(page.getByText('sample-events.csv · 3 rows')).toBeVisible();
  await expect(page.getByText('sample-bank.csv · 2 rows')).toBeVisible();
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
  const files = await Promise.all(['index.html', 'demo/index.html', 'privacy/index.html', 'terms/index.html', '404.html', 'sw.js'].map(async (name) => {
    const value = await readFile(new URL(`../../dist/${name}`, import.meta.url), 'utf8');
    return value.length;
  }));
  expect(files.every((size) => size > 100)).toBe(true);
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
