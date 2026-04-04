import { test, expect } from '@playwright/test';

test.describe('Search End-to-End', () => {
  test('User completes search flow and clears results', async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('#initial-loading-overlay.hidden', { state: 'attached' });

    const searchBtn = page.getByRole('button', { name: /Search/i });
    await searchBtn.click();

    const searchInput = page.locator('#searchInput');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Paramedic');

    const searchResultsHeading = page.getByRole('heading', { name: /Search Results/i });
    await expect(searchResultsHeading).toBeVisible();

    const resultsGrid = page.locator('#searchResultsGrid');
    await expect(resultsGrid.getByRole('heading', { name: /Paramedic/i }).first()).toBeVisible();

    const clearBtn = page.getByRole('button', { name: /Clear search/i });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    await expect(searchResultsHeading).not.toBeVisible();
    await expect(searchInput).toHaveValue('');
  });
});
