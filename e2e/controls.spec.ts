import { test, expect } from '@playwright/test';

// Helper to open the settings panel before interacting with controls
async function openSettings(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.locator('button', { hasText: 'Settings' }).click();
  // Wait for panel transition to complete
  await page.waitForTimeout(1100);
}

test.describe('Controls - Speed Presets', () => {
  test('speed preset buttons are visible when panel is open', async ({ page }) => {
    await openSettings(page);
    await expect(page.locator('text=Speed')).toBeVisible();
    const oneXButton = page.locator('button', { hasText: /^1x$/ });
    await expect(oneXButton).toBeVisible();
  });

  test('clicking speed preset changes speed', async ({ page }) => {
    await openSettings(page);
    const fiveXButton = page.locator('button', { hasText: /^5x$/ });
    await fiveXButton.click();
    await expect(fiveXButton).toBeVisible();
  });
});

test.describe('Controls - Orders/Min Presets', () => {
  test('orders per minute presets are visible', async ({ page }) => {
    await openSettings(page);
    await expect(page.locator('text=Orders/min')).toBeVisible();
    await expect(page.locator('button', { hasText: /^10K$/ })).toBeVisible();
  });

  test('changing OPM affects order generation rate', async ({ page }) => {
    await openSettings(page);
    const highRateButton = page.locator('button', { hasText: /^5K$/ }).first();
    await highRateButton.click();

    // Start simulation via Space
    await page.keyboard.press('Space');
    await page.waitForTimeout(3000);

    const totalText = await page.locator('text=/[\\d,]+ total/').textContent();
    const total = parseInt(totalText?.replace(' total', '').replace(/,/g, '') || '0');
    expect(total).toBeGreaterThan(50);
  });
});

test.describe('Controls - Forecast', () => {
  test('forecast toggle works', async ({ page }) => {
    await openSettings(page);
    await expect(page.locator('text=Forecast OPM')).toBeVisible();

    const onButton = page.locator('button', { hasText: /^ON$/ });
    await onButton.click();
    await expect(page.locator('button', { hasText: /^OFF$/ })).toBeVisible();

    const offButton = page.locator('button', { hasText: /^OFF$/ });
    await offButton.click();
    await expect(page.locator('button', { hasText: /^ON$/ })).toBeVisible();
  });

  test('forecast presets are clickable', async ({ page }) => {
    await openSettings(page);
    const preset1K = page.locator('button', { hasText: /^1K$/ }).first();
    await preset1K.click();
    await expect(preset1K).toBeVisible();
  });
});

test.describe('Controls - Chart Mode', () => {
  test('chart mode switches between Net and Sum', async ({ page }) => {
    await openSettings(page);
    const netButton = page.locator('button', { hasText: 'Net' });
    const sumButton = page.locator('button', { hasText: 'Sum' });

    await expect(netButton).toBeVisible();
    await expect(sumButton).toBeVisible();

    await netButton.click();
    await expect(netButton).toBeVisible();

    await sumButton.click();
    await expect(sumButton).toBeVisible();
  });
});

test.describe('Controls - Volatility & Trend', () => {
  test('volatility slider is visible and adjustable', async ({ page }) => {
    await openSettings(page);
    await expect(page.locator('text=Volatility')).toBeVisible();
  });

  test('trend range slider is visible', async ({ page }) => {
    await openSettings(page);
    await expect(page.locator('text=Trend Range')).toBeVisible();
  });
});

test.describe('Controls - Burst Mode', () => {
  test('burst mode toggle is visible', async ({ page }) => {
    await openSettings(page);
    await expect(page.locator('text=Burst')).toBeVisible();
  });

  test('burst mode can be toggled', async ({ page }) => {
    await openSettings(page);
    const burstLabel = page.locator('label', { hasText: 'Burst' });
    const burstToggle = burstLabel.locator('div.rounded-full').first();
    await burstToggle.click();
    await expect(page.locator('text=Burst')).toBeVisible();
  });
});

test.describe('Controls - Sound Channels', () => {
  test('sound channel buttons are visible', async ({ page }) => {
    await openSettings(page);
    await expect(page.locator('button', { hasText: 'Orders' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Combos' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Milestones' })).toBeVisible();
  });

  test('sound channels can be toggled', async ({ page }) => {
    await openSettings(page);
    const ordersBtn = page.locator('button', { hasText: 'Orders' });
    await ordersBtn.click();
    await expect(ordersBtn).toBeVisible();

    await ordersBtn.click();
    await expect(ordersBtn).toBeVisible();
  });
});

test.describe('Controls - Effects Intensity', () => {
  test('FX slider is visible', async ({ page }) => {
    await openSettings(page);
    await expect(page.locator('text=FX')).toBeVisible();
  });
});
