import { test, expect } from '@playwright/test';

async function openSettings(page: import('@playwright/test').Page) {
  const settingsButton = page.locator('button', { hasText: 'Settings' });
  await settingsButton.click();
  await page.waitForTimeout(1100);
}

test.describe('Multi-Source - Source Selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await openSettings(page);
  });

  test('source selector is visible in controls', async ({ page }) => {
    await expect(page.getByText('Source')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sim' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Live' })).toBeVisible();
  });

  test('simulation is the default source', async ({ page }) => {
    const simBtn = page.getByRole('button', { name: 'Sim' });
    // Sim button should have green active styling
    await expect(simBtn).toHaveCSS('border-color', 'rgba(34, 197, 94, 0.4)');
  });

  test('can switch to lightstep source', async ({ page }) => {
    const liveBtn = page.getByRole('button', { name: 'Live' });
    await liveBtn.click();
    // Live button should now have purple active styling
    await expect(liveBtn).toHaveCSS('border-color', 'rgba(168, 85, 247, 0.4)');
  });

  test('can switch back to simulation source', async ({ page }) => {
    const liveBtn = page.getByRole('button', { name: 'Live' });
    const simBtn = page.getByRole('button', { name: 'Sim' });

    await liveBtn.click();
    await expect(liveBtn).toHaveCSS('border-color', 'rgba(168, 85, 247, 0.4)');

    await simBtn.click();
    await expect(simBtn).toHaveCSS('border-color', 'rgba(34, 197, 94, 0.4)');
  });

  test('simulation source still works after selecting it', async ({ page }) => {
    const simBtn = page.getByRole('button', { name: 'Sim' });
    await simBtn.click();

    // Start simulation
    const playButton = page.locator('button').filter({ has: page.locator('svg.lucide-play') });
    await playButton.click();

    await page.waitForTimeout(2000);
    const totalText = page.locator('text=/\\d+ total/');
    await expect(totalText).toBeVisible({ timeout: 5000 });
  });

  test('switching source does not crash the dashboard', async ({ page }) => {
    // Start playing with simulation
    const playButton = page.locator('button').filter({ has: page.locator('svg.lucide-play') });
    await playButton.click();
    await page.waitForTimeout(1000);

    // Switch to lightstep while playing
    const liveBtn = page.getByRole('button', { name: 'Live' });
    await liveBtn.click();
    await page.waitForTimeout(500);

    // Switch back to simulation
    const simBtn = page.getByRole('button', { name: 'Sim' });
    await simBtn.click();
    await page.waitForTimeout(1000);

    // Dashboard should still be functional — no crash, page still renders
    await expect(page.locator('text=Live Feed')).toBeVisible();
  });
});
