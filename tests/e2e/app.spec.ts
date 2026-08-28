import { expect, test } from '@playwright/test';
import axe from 'axe-core';

test('runs the labelled reconciliation and exports both handoff files', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('See where every payout penny went.');
  await page.getByRole('button', { name: 'Use labelled example' }).first().click();
  await expect(page.getByRole('heading', { name: 'Confirm what each column means' })).toBeVisible();
  await page.getByRole('button', { name: 'Run reconciliation' }).click();
  await expect(page.getByRole('heading', { name: 'The bank deposit balances' })).toBeVisible();
  await expect(page.getByText('100.0%').first()).toBeVisible();

  const csvDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export reconciler CSV' }).click();
  expect((await csvDownload).suggestedFilename()).toMatch(/reconciler\.csv$/);
  const pdfDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export accountant PDF' }).click();
  expect((await pdfDownload).suggestedFilename()).toMatch(/accountant-handoff\.pdf$/);

  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async () => await (window as unknown as { axe: typeof axe }).axe.run(document));
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  await page.getByRole('button', { name: 'Switch color theme' }).click();
  const darkResults = await page.evaluate(async () => await (window as unknown as { axe: typeof axe }).axe.run(document));
  expect(darkResults.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('does not allow an explanation to overstate an already balanced payout', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Use labelled example' }).first().click();
  await page.getByRole('button', { name: 'Run reconciliation' }).click();
  await expect(page.getByRole('heading', { name: 'The bank deposit balances' })).toBeVisible();
  await expect(page.getByText('Remaining:')).toContainText('$0.00');
  await expect(page.getByText('No explanation needed.')).toBeVisible();
  await expect(page.locator('#adjustment-form')).toHaveCount(0);
});

test('supports keyboard mapping and 390px layout', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile-only check');
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.getByRole('button', { name: 'Try the labelled example' }).click();
  await page.getByLabel('Reconciliation name').fill('Phone batch');
  await page.getByRole('button', { name: 'Run reconciliation' }).click();
  await expect(page.getByRole('heading', { name: 'Phone batch' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test('reloads the installed workbench offline with the draft intact', async ({ page, context }) => {
  test.skip(test.info().project.name !== 'chromium', 'desktop-only service worker check');
  await page.goto('/');
  await page.getByRole('button', { name: 'Use labelled example' }).first().click();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('h1')).toHaveText('See where every payout penny went.');
  await expect(page.getByText('Offline · work stays local')).toBeVisible();
  await expect(page.getByText('example-events.csv')).toBeVisible();
});

test('serves direct privacy and terms pages', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.locator('h1')).toHaveText('Privacy, without fine print');
  await expect(page).toHaveTitle(/Privacy/);
  await page.goto('/terms/');
  await expect(page.locator('h1')).toHaveText('Plain-language terms');
  await expect(page).toHaveTitle(/Terms/);
});
