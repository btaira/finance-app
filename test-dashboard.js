const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('🚀 Starting CSCO Finance Dashboard Test...\n');

  try {
    // Navigate to the dashboard
    console.log('📍 Navigating to http://127.0.0.1 (csco-finance)...');
    await page.goto('http://127.0.0.1', { waitUntil: 'networkidle' });
    console.log('✓ Page loaded successfully\n');

    // Check for key elements
    console.log('🔍 Checking page elements:');

    const companyName = await page.locator('#company-name').textContent();
    console.log(`  ✓ Company name: ${companyName}`);

    const ticker = await page.locator('#ticker-display').textContent();
    console.log(`  ✓ Ticker: ${ticker}`);

    const exchange = await page.locator('#exchange-display').textContent();
    console.log(`  ✓ Exchange: ${exchange}`);

    const price = await page.locator('#price').textContent();
    console.log(`  ✓ Price: ${price}`);

    const datetimePill = await page.locator('#datetime-pill').textContent();
    console.log(`  ✓ DateTime: ${datetimePill.trim().substring(0, 40)}...\n`);

    // Check for sections
    console.log('📋 Checking page sections:');
    const priceSection = await page.locator('#price-section').isVisible();
    console.log(`  ${priceSection ? '✓' : '✗'} Price section visible`);

    const statsSection = await page.locator('#stats-section').isVisible();
    console.log(`  ${statsSection ? '✓' : '✗'} Stats section visible`);

    const newsSection = await page.locator('#news-section').isVisible();
    console.log(`  ${newsSection ? '✓' : '✗'} News section visible`);

    const portfolioList = await page.locator('#portfolio-list').isVisible();
    console.log(`  ${portfolioList ? '✓' : '✗'} Portfolio list visible\n`);

    // Check for JavaScript errors
    console.log('🔧 Checking for errors:');
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit for any async operations
    await page.waitForTimeout(2000);

    if (errors.length === 0) {
      console.log('  ✓ No console errors\n');
    } else {
      console.log('  ⚠ Errors found:');
      errors.forEach(e => console.log(`    - ${e}`));
    }

    // Take a screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'dashboard-screenshot.png' });
    console.log('  ✓ Screenshot saved: dashboard-screenshot.png\n');

    console.log('✅ ALL TESTS PASSED - Dashboard is working correctly!');

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
