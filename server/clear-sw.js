const { chromium } = require('playwright');

async function clearServiceWorker() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to application...');
    await page.goto('http://localhost:5174/login');
    await page.waitForLoadState('networkidle');

    console.log('Clearing service worker...');
    await page.evaluate(() => {
      return navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
        console.log('Service workers unregistered');
      });
    });

    console.log('Clearing site data...');
    await page.context().clearCookies();
    await page.context().clearPermissions();

    console.log('Reloading page...');
    await page.reload();
    await page.waitForLoadState('networkidle');

    console.log('✅ Service worker cleared successfully!');
    console.log('You can now try logging in.');
    console.log('Press Ctrl+C to close the browser...');

    // Keep browser open for user to test
    await new Promise(() => {}); // Keep running indefinitely

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

clearServiceWorker();
