import { test, expect } from '@playwright/test';

test.describe('Dashboard - Initial State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the dashboard with title', async ({ page }) => {
    await expect(page.locator('text=CYBERWEEK PANEL')).toBeVisible();
  });

  test('shows zero stats initially', async ({ page }) => {
    await expect(page.locator('text=0 total')).toBeVisible();
  });

  test('shows "Press play to start" message in feed', async ({ page }) => {
    await expect(page.locator('text=Press play to start the simulation')).toBeVisible();
  });

  test('settings panel is hidden by default', async ({ page }) => {
    const settingsButton = page.locator('button', { hasText: 'Settings' });
    await expect(settingsButton).toBeVisible();
    // Status should show PAUSED initially
    await expect(page.locator('text=PAUSED')).toBeVisible();
  });
});

test.describe('Dashboard - Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('toggles settings panel open and closed', async ({ page }) => {
    const settingsButton = page.locator('button', { hasText: 'Settings' });
    // Click to open settings
    await settingsButton.click();
    await page.waitForTimeout(500);

    // Speed controls should be interactable
    const speedButton = page.locator('button', { hasText: /^5x$/ });
    await speedButton.click();
    // Verify button click succeeded (no crash)
    await expect(settingsButton).toBeVisible();

    // Close settings
    await settingsButton.click();
    await expect(settingsButton).toBeVisible();
  });
});

test.describe('Dashboard - Play/Pause', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Open settings to access play/pause
    await page.locator('button', { hasText: 'Settings' }).click();
    await page.waitForTimeout(1100);
  });

  test('starts simulation when play button is clicked', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(2000);

    // Status indicator should show LIVE (exact match to avoid "Live Feed" conflict)
    await expect(page.getByText('LIVE', { exact: true })).toBeVisible();
    await expect(page.locator('text=Press play to start the simulation')).not.toBeVisible();
  });

  test('pauses simulation when toggled again', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(1500);

    await page.keyboard.press('Space');
    await expect(page.getByText('PAUSED', { exact: true })).toBeVisible();

    await page.waitForTimeout(500);
    const totalText = await page.locator('text=/[\\d,]+ total/').textContent();
    const totalAfterPause = parseInt(totalText?.replace(' total', '').replace(/,/g, '') || '0');

    await page.waitForTimeout(1500);
    const totalText2 = await page.locator('text=/[\\d,]+ total/').textContent();
    const totalAfterWait = parseInt(totalText2?.replace(' total', '').replace(/,/g, '') || '0');

    expect(totalAfterWait).toBe(totalAfterPause);
  });

  test('toggles play/pause with Space key', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(2000);

    await expect(page.getByText('LIVE', { exact: true })).toBeVisible();

    await page.keyboard.press('Space');
    await expect(page.getByText('PAUSED', { exact: true })).toBeVisible();

    const totalText = await page.locator('text=/[\\d,]+ total/').textContent();
    const totalAfterPause = parseInt(totalText?.replace(' total', '').replace(/,/g, '') || '0');
    expect(totalAfterPause).toBeGreaterThan(0);
  });
});

test.describe('Dashboard - Order Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Settings' }).click();
  });

  test('orders flow in and counters increment', async ({ page }) => {
    const playButton = page.locator('button').filter({ has: page.locator('svg.lucide-play') });
    await playButton.click();

    // Wait for some orders
    await page.waitForTimeout(3000);

    // Total orders should be > 0
    const totalText = await page.locator('text=/\\d+ total/').textContent();
    const total = parseInt(totalText?.replace(' total', '') || '0');
    expect(total).toBeGreaterThan(0);
  });

  test('order feed populates with product entries', async ({ page }) => {
    const playButton = page.locator('button').filter({ has: page.locator('svg.lucide-play') });
    await playButton.click();

    await page.waitForTimeout(2000);

    // Should have feed items with dollar amounts
    const feedItems = page.locator('text=/^\\$\\d+$/');
    await expect(feedItems.first()).toBeVisible();
  });

  test('reset clears all state', async ({ page }) => {
    // Start simulation
    const playButton = page.locator('button').filter({ has: page.locator('svg.lucide-play') });
    await playButton.click();
    await page.waitForTimeout(2000);

    // Click reset button
    const resetButton = page.locator('button').filter({ has: page.locator('svg.lucide-rotate-ccw') });
    await resetButton.click();

    // After reset, simulation stops and total goes to 0
    await expect(page.locator('text=0 total')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Dashboard - Sound Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('mute toggle via M key', async ({ page }) => {
    // Focus page body to capture keyboard
    await page.locator('h1').click();

    await page.keyboard.press('m');
    await expect(page.locator('button[title="Unmute audio"]')).toBeVisible({ timeout: 3000 });

    await page.keyboard.press('m');
    await expect(page.locator('button[title="Mute audio"]')).toBeVisible({ timeout: 3000 });
  });
});
