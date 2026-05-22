const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('🔍 Detailed Chrome CSS Check\n');

  try {
    await page.goto('http://127.0.0.1', { waitUntil: 'networkidle' });

    // Check computed styles
    const styles = await page.evaluate(() => {
      const body = document.body;
      const computed = window.getComputedStyle(body);

      return {
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage,
        color: computed.color,
        fontFamily: computed.fontFamily,
        display: computed.display,
        flexDirection: computed.flexDirection
      };
    });

    console.log('📋 Body Computed Styles:');
    Object.entries(styles).forEach(([key, val]) => {
      console.log(`  ${key}: ${val}`);
    });

    // Check if gradient is present
    const hasGradient = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundImage.includes('gradient');
    });

    console.log(`\n🎨 Dark theme gradient applied: ${hasGradient ? '✓ YES' : '✗ NO'}`);

    // Take screenshot
    await page.screenshot({ path: 'chrome-test.png', fullPage: true });
    console.log('\n📸 Screenshot: chrome-test.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
