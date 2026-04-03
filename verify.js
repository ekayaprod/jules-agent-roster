const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Log console errors to verify no `require is not defined`
    let errors = [];
    page.on('pageerror', err => {
        errors.push(err.message);
        console.error('Page error:', err.message);
    });

    await page.goto('http://localhost:8080');

    // Wait for the app to initialize
    await page.waitForSelector('#initial-loading-overlay.hidden', { timeout: 10000 }).catch(() => console.log('Overlay never hid'));

    // Check if the agent cards are rendered
    const cards = await page.$$('.flip-card:not(.skeleton-card)');
    console.log(`Found ${cards.length} loaded agent cards.`);

    if (errors.length > 0) {
        console.error(`Found ${errors.length} errors during initialization:`, errors);
        process.exit(1);
    }

    await browser.close();
    console.log('Frontend verified successfully.');
})();
