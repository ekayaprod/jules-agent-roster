const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[PAGE ERROR]: ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    console.log(`[UNCAUGHT EXCEPTION]: ${err.message}`);
  });

  await page.goto(`file://${path.resolve('index.html')}`);
  await page.waitForTimeout(2000);
  await browser.close();
})();
