const { chromium } = require('playwright');

async function clearSWAndTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('=== Clearing Service Worker and Testing Login ===\n');

    // Step 1: Navigate to login page
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    // Step 2: Clear service worker
    console.log('2. Clearing service worker...');
    await page.evaluate(() => {
      return navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log('Found registrations:', registrations.length);
        registrations.forEach(registration => {
          console.log('Unregistering:', registration.scope);
          registration.unregister();
        });
        return registrations.length;
      });
    });
    console.log('   ✅ Service worker cleared');

    // Step 3: Clear all caches
    console.log('3. Clearing caches...');
    await page.evaluate(() => {
      return caches.keys().then(keys => {
        console.log('Found caches:', keys);
        return Promise.all(keys.map(key => caches.delete(key)));
      });
    });
    console.log('   ✅ Caches cleared');

    // Step 4: Clear cookies and reload
    console.log('4. Clearing cookies and reloading...');
    await page.context().clearCookies();
    await page.reload();
    await page.waitForLoadState('networkidle');
    console.log('   ✅ Page reloaded');

    // Step 5: Test login
    console.log('5. Testing login...');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    // Check for offline error
    const offlineError = await page.$('text=Offline');
    if (offlineError) {
      console.log('   ❌ Still showing offline error');
      await page.screenshot({ path: '../screenshots/after-sw-clear.png', fullPage: true });
    } else if (currentUrl.includes('/dashboard')) {
      console.log('   ✅ Login successful - redirected to dashboard');
      await page.screenshot({ path: '../screenshots/login-success-after-fix.png', fullPage: true });
    } else {
      console.log('   ⚠ Unexpected state - checking for errors...');
      const errorElement = await page.$('div[class*="error"]');
      if (errorElement) {
        const errorText = await errorElement.textContent();
        console.log(`   Error: ${errorText}`);
      }
      await page.screenshot({ path: '../screenshots/unexpected-state.png', fullPage: true });
    }

    console.log('\n=== Test Complete ===');
    console.log('The service worker has been disabled in sw.js.');
    console.log('If you still see offline errors, hard refresh the page (Ctrl+Shift+R).');
    console.log('Press Ctrl+C to close the browser...');

    await new Promise(() => {}); // Keep browser open

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: '../screenshots/sw-clear-error.png', fullPage: true });
    await new Promise(() => {});
  } finally {
    await browser.close();
  }
}

clearSWAndTest();
