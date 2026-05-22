const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({
    headless: false // Opens actual browser window
  });

  const page = await browser.newPage();

  console.log('🌐 Opening dashboard in Chrome...');
  await page.goto('http://127.0.0.1', { waitUntil: 'networkidle' });

  console.log('✓ Dashboard loaded - leaving browser open for 10 seconds');
  console.log('📸 Check the browser window to see how it looks\n');

  // Keep browser open for inspection
  await page.waitForTimeout(10000);

  await browser.close();
  console.log('✓ Test complete');
})();
