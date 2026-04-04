import { test, expect } from '@playwright/test';

test.describe('Settings Modal', () => {
  test('User can open and close settings modal', async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('#initial-loading-overlay.hidden', { state: 'attached' });

    const settingsBtn = page.getByRole('button', { name: /Settings/i });
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();

    const settingsModal = page.getByRole('dialog', { name: /API Configuration/i });
    await expect(settingsModal).toBeVisible();

    const cancelBtn = settingsModal.getByRole('button', { name: /Cancel/i });
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    await expect(settingsModal).not.toBeVisible();
  });
});
