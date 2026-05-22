const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('🔍 Testing http://127.0.0.1\n');

  try {
    await page.goto('http://127.0.0.1', { waitUntil: 'networkidle' });

    // Check network requests
    console.log('📡 Checking network requests:');
    const responses = [];
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        type: response.request().resourceType()
      });
    });

    // Get all resources
    const resources = await page.evaluate(() => {
      return {
        stylesheets: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(el => ({
          href: el.href,
          loaded: el.sheet !== null
        })),
        styles: document.querySelectorAll('style').length,
        bodyBg: window.getComputedStyle(document.body).backgroundColor,
        bodyColor: window.getComputedStyle(document.body).color
      };
    });

    console.log('  Stylesheets:', resources.stylesheets);
    console.log('  Inline styles:', resources.styles);
    console.log('  Body background:', resources.bodyBg);
    console.log('  Body color:', resources.bodyColor);
    console.log();

    // Take screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'dashboard-broken.png', fullPage: true });
    console.log('  Saved: dashboard-broken.png\n');

    // Check for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    if (errors.length > 0) {
      console.log('⚠️ Console errors:');
      errors.forEach(e => console.log('  -', e));
    }

    // Get HTML source
    const html = await page.content();
    console.log('\n✓ HTML loads correctly');
    console.log(`  Page length: ${html.length} characters`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
