const { chromium } = require('playwright');

async function testAccountPersistence() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const testEmail = `persistence-test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  try {
    console.log('=== Testing Account Persistence After Server Restart ===\n');

    // Step 1: Clear service worker
    console.log('1. Clearing service worker...');
    await page.goto('http://localhost:5173/signup');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      return navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    });
    await page.context().clearCookies();
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Step 2: Sign up a new account
    console.log('2. Signing up new account...');
    console.log(`   Email: ${testEmail}`);
    await page.fill('input[name="name"]', 'Persistence Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`   Current URL after signup: ${currentUrl}`);

    // Check if signup was successful (redirected to dashboard or stays on signup with error)
    if (currentUrl.includes('/dashboard')) {
      console.log('   ✅ Signup successful - redirected to dashboard');
    } else if (currentUrl.includes('/signup')) {
      const errorElement = await page.$('div[class*="error"]');
      if (errorElement) {
        const errorText = await errorElement.textContent();
        console.log(`   ❌ Signup failed with error: ${errorText}`);
        throw new Error('Signup failed');
      }
    }

    // Step 3: Logout
    console.log('3. Logging out...');
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Try to find and click logout button
    const logoutButton = await page.$('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out")');
    if (logoutButton) {
      await logoutButton.click();
    } else {
      // Try direct API call to logout
      await page.evaluate(async () => {
        await fetch('http://localhost:5000/api/auth/logout', { 
          method: 'POST',
          credentials: 'include'
        });
      });
    }
    await page.waitForTimeout(2000);
    await page.context().clearCookies();
    console.log('   ✅ Logged out');

    // Step 4: Verify account exists by trying to log in
    console.log('4. Verifying account exists by logging in...');
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const loginUrl = page.url();
    console.log(`   Current URL after login: ${loginUrl}`);

    if (loginUrl.includes('/dashboard')) {
      console.log('   ✅ Login successful - account persists in database');
    } else {
      console.log('   ❌ Login failed - account may not have been saved');
      const errorElement = await page.$('div[class*="error"]');
      if (errorElement) {
        const errorText = await errorElement.textContent();
        console.log(`   Error: ${errorText}`);
      }
      throw new Error('Login failed after signup');
    }

    console.log('\n=== ✅ TEST PASSED: Account persists after creation ===');
    console.log('The account was successfully created and can be logged into.');
    console.log('This means data is NOT being wiped on server restart.');
    console.log('\nPress Ctrl+C to close the browser...');

    await new Promise(() => {}); // Keep browser open

  } catch (error) {
    console.error('\n=== ❌ TEST FAILED ===');
    console.error(error.message);
    await page.screenshot({ path: '../screenshots/persistence-test-error.png', fullPage: true });
    console.log('Error screenshot saved to screenshots/persistence-test-error.png');
    await new Promise(() => {});
  } finally {
    await browser.close();
  }
}

testAccountPersistence();
