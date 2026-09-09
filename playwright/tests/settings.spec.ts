import { test, expect } from '@playwright/test';

test.describe('Settings Modal', () => {
  test('User can open and close settings modal', async ({ page }) => {
    await page.goto('/');

    try {
      await page.waitForSelector('#initial-loading-overlay', { state: 'detached', timeout: 5000 });
    } catch (e) {
      // ignore timeout
    }

    const settingsBtn = page.locator('#openSettingsBtn');
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();

    const settingsModal = page.getByRole('dialog', { name: /API Configuration/i });
    await expect(settingsModal).toBeVisible();

    const cancelBtn = page.locator('#closeSettingsBtn');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    await expect(settingsModal).not.toHaveClass(/visible/);
  });
});
