import { test, expect } from '@playwright/test';
test('Check for console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:8080'); // Assuming it serves on 8080 or something, I should check playwright.config.ts
  await page.waitForTimeout(2000); // give it time to load

  console.log('Errors:', errors);
});
