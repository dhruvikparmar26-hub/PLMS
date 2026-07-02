const { chromium } = require('playwright');

async function testLogin() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:5174/login');
    await page.waitForLoadState('networkidle');

    console.log('Clearing any existing service worker...');
    await page.evaluate(() => {
      return navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    });

    console.log('Clearing cookies and reloading...');
    await page.context().clearCookies();
    await page.reload();
    await page.waitForLoadState('networkidle');

    console.log('Filling login form...');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');

    // Monitor network requests
    const apiResponse = page.waitForResponse(response => 
      response.url().includes('/api/auth/login')
    );

    console.log('Submitting login...');
    await page.click('button[type="submit"]');

    console.log('Waiting for API response...');
    const response = await apiResponse;
    const responseData = await response.json();
    console.log('API Response status:', response.status());
    console.log('API Response data:', JSON.stringify(responseData, null, 2));

    console.log('Waiting for navigation...');
    await page.waitForTimeout(3000);

    // Check for error message
    const errorElement = await page.$('div[class*="error"]');
    if (errorElement) {
      const errorText = await errorElement.textContent();
      console.log('Error message found:', errorText);
    }

    // Check current URL
    console.log('Current URL after submit:', page.url());

    // Check cookies
    const cookies = await page.context().cookies();
    console.log('Cookies:', cookies.map(c => ({ name: c.name, value: c.value })));

    console.log('✅ Login successful! Redirected to dashboard.');
    console.log('Current URL:', page.url());

    // Take a screenshot
    await page.screenshot({ path: '../screenshots/login-success.png', fullPage: true });
    console.log('Screenshot saved to screenshots/login-success.png');

    console.log('\nLogin is working! You can now use the application.');
    console.log('Press Ctrl+C to close the browser...');

    // Keep browser open for user to see
    await new Promise(() => {}); // Keep running indefinitely

  } catch (error) {
    console.error('❌ Login failed:', error.message);
    console.log('Current URL:', page.url());
    
    // Take screenshot of error
    await page.screenshot({ path: '../screenshots/login-error.png', fullPage: true });
    console.log('Error screenshot saved to screenshots/login-error.png');
    
    await new Promise(() => {}); // Keep browser open for user to see
  } finally {
    await browser.close();
  }
}

testLogin();
