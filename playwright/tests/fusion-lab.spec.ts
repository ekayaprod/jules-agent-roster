import { test, expect } from '@playwright/test';

test.describe('Fusion Lab End-to-End', () => {
  test('User completes agent fusion flow', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Ensure Fusion Lab section is visible
    await expect(page.getByRole('heading', { name: /The Fusion Lab/i })).toBeVisible();

    // Click on Slot A (Select Agent A) to select first agent
    const slotA = page.locator('#slotACard');
    await expect(slotA).toBeVisible();
    await slotA.click();

    // Select an agent from the picker modal
    const pickerModal = page.getByRole('dialog', { name: /Select Protocol Component/i });
    await expect(pickerModal).toBeVisible();
    await page.getByRole('option').first().click();

    // Click on Slot B (Select Agent B) to select second agent
    const slotB = page.locator('#slotBCard');
    await expect(slotB).toBeVisible();
    await slotB.click();

    // Select another agent from the picker modal
    await expect(pickerModal).toBeVisible();
    await page.getByRole('option').nth(1).click();

    // Verify fuse button is active and click it
    // The button has text "Ignite Protocol" (formerly had aria-label "Fuse Selected Protocols")
    const fuseBtn = page.getByRole('button', { name: /Ignite Fusion Protocol/i });
    await expect(fuseBtn).toHaveAttribute('aria-disabled', 'false');
    await fuseBtn.click();

    // Wait for result container to be visible
    // Wait for the "Fuse Another Protocol" button which indicates the result is shown and lab is resettable
    const resetBtn = page.getByRole('button', { name: /Fuse Another Protocol/i });
    await expect(resetBtn).toBeVisible({ timeout: 15000 });

    // Verify an agent card is actually displayed
    // It's inside a container, but looking for an article with a heading is a good semantic check.
    // The agent card itself will contain a heading with its name.
    await expect(page.locator('#fusionResultContainer').getByRole('heading')).not.toHaveCount(0);

    // Verify we can reset the lab
    await resetBtn.click();

    // Verify it's reset - fuseBtn should be disabled
    const fuseBtnAfterReset = page.locator('#fuseBtn');
    await expect(fuseBtnAfterReset).toHaveAttribute('aria-disabled', 'true');
  });
});
