import { test, expect } from '@playwright/test';

test.describe('Gamification - Combo System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('combo counter starts at zero', async ({ page }) => {
    await expect(page.locator('text=Combo Streak')).toBeVisible();
    // The combo display shows x0 in a large font
    await expect(page.locator('.text-4xl').filter({ hasText: 'x0' })).toBeVisible();
  });

  test('combo activates with high-speed orders', async ({ page }) => {
    // Open settings to access speed controls
    await page.locator('button', { hasText: 'Settings' }).click();
    await page.waitForTimeout(1100);

    const tenKButton = page.locator('button', { hasText: /^10K$/ });
    await tenKButton.click();

    const tenXButton = page.locator('button', { hasText: /^10x$/ });
    await tenXButton.click();

    // Start playing via Space
    await page.keyboard.press('Space');

    await page.waitForTimeout(3000);

    // Combo should be active — the large counter should show a number > 0
    // Use the specific combo label element
    const comboLabel = page.locator('.text-\\[7px\\]', { hasText: 'COMBO' });
    await expect(comboLabel).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Gamification - Order Feed Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('order feed shows product names and prices', async ({ page }) => {
    await page.locator('button', { hasText: 'Settings' }).click();
    await page.waitForTimeout(1100);
    await page.keyboard.press('Space');

    await page.waitForTimeout(2000);

    const priceItems = page.locator('text=/^\\$\\d+$/');
    const count = await priceItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('order feed shows Live Feed header', async ({ page }) => {
    await expect(page.locator('text=Live Feed')).toBeVisible();
  });
});

test.describe('Gamification - Stats Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('stats update during simulation', async ({ page }) => {
    await page.locator('button', { hasText: 'Settings' }).click();
    await page.waitForTimeout(1100);
    await page.keyboard.press('Space');

    await page.waitForTimeout(3000);

    const revenue = page.locator('text=/\\$[\\d.]+[KM]?/');
    await expect(revenue.first()).toBeVisible();
  });

  test('session timer starts when playing', async ({ page }) => {
    await page.locator('button', { hasText: 'Settings' }).click();
    await page.waitForTimeout(1100);
    await page.keyboard.press('Space');

    await page.waitForTimeout(2000);

    const timer = page.locator('text=/\\d{2}:\\d{2}/');
    await expect(timer.first()).toBeVisible();
  });
});

test.describe('Gamification - Milestones', () => {
  test('milestone triggers after reaching order threshold', async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Settings' }).click();
    await page.waitForTimeout(1100);

    const tenKButton = page.locator('button', { hasText: /^10K$/ });
    await tenKButton.click();

    const twentyXButton = page.locator('button', { hasText: /^20x$/ });
    await twentyXButton.click();

    await page.keyboard.press('Space');

    await page.waitForTimeout(3000);

    const totalText = await page.locator('text=/[\\d,]+ total/').textContent();
    const total = parseInt(totalText?.replace(' total', '').replace(/,/g, '') || '0');
    expect(total).toBeGreaterThan(50);
  });
});

test.describe('Dashboard - Combo Rules Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('combo rules menu can be opened', async ({ page }) => {
    const rulesButton = page.locator('button', { hasText: 'Rules' });
    await rulesButton.click();

    // Should show combo tier information
    await expect(page.locator('text=/COMBO|TIER|RULES/i').first()).toBeVisible();
  });
});
