const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function takeScreenshot(page, filename, description) {
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`✓ Saved: ${filename} - ${description}`);
}

async function getIdsFromDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const Course = require('./models/Course');
    const Lesson = require('./models/Lesson');
    const Quiz = require('./models/Quiz');
    const Certificate = require('./models/Certificate');
    
    const course = await Course.findOne();
    const lesson = await Lesson.findOne();
    const quiz = await Quiz.findOne();
    const certificate = await Certificate.findOne();
    
    await mongoose.connection.close();
    
    return {
      courseId: course?._id?.toString(),
      lessonId: lesson?._id?.toString(),
      quizId: quiz?._id?.toString(),
      certId: certificate?._id?.toString(),
      certCode: certificate?.verificationCode
    };
  } catch (error) {
    console.error('Error fetching IDs from DB:', error);
    return {};
  }
}

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Starting screenshot capture...\n');

    // Get IDs from database
    const ids = await getIdsFromDB();
    console.log('Database IDs:', ids);

    // 1. HomePage (/)
    console.log('1. Capturing HomePage...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '01-homepage.png', 'Landing page');

    // 2. LoginPage (/login)
    console.log('\n2. Capturing LoginPage...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '02-login.png', 'Login page');

    // 3. SignupPage (/signup)
    console.log('\n3. Capturing SignupPage...');
    await page.goto(`${BASE_URL}/signup`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '03-signup.png', 'Signup page');

    // 4. Login to access protected routes
    console.log('\n4. Logging in...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation - either to dashboard or stay on login with error
    try {
      await page.waitForURL('**/dashboard', { timeout: 5000 });
      await page.waitForLoadState('networkidle');
    } catch (e) {
      // Check if there's an error message
      const errorElement = await page.$('div[class*="error"]');
      if (errorElement) {
        const errorText = await errorElement.textContent();
        console.log('  ⚠ Login error:', errorText);
      }
      // Try to navigate to dashboard anyway
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
    }

    // 5. DashboardPage (/dashboard)
    console.log('\n5. Capturing DashboardPage...');
    await takeScreenshot(page, '04-dashboard.png', 'User dashboard');

    // 6. OnboardingPage (/onboarding)
    console.log('\n6. Capturing OnboardingPage...');
    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '05-onboarding.png', 'Onboarding flow');

    // 7. CourseCatalogPage (/courses)
    console.log('\n7. Capturing CourseCatalogPage...');
    await page.goto(`${BASE_URL}/courses`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '06-course-catalog.png', 'Course catalog');

    // 8. CourseDetailPage (/courses/:id)
    if (ids.courseId) {
      console.log('\n8. Capturing CourseDetailPage...');
      await page.goto(`${BASE_URL}/courses/${ids.courseId}`);
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, '07-course-detail.png', 'Course detail page');
    } else {
      console.log('\n8. ⚠ No course ID found, skipping course detail');
    }

    // 9. LessonViewerPage (/lessons/:id)
    if (ids.lessonId) {
      console.log('\n9. Capturing LessonViewerPage...');
      await page.goto(`${BASE_URL}/lessons/${ids.lessonId}`);
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, '08-lesson-viewer.png', 'Lesson viewer');
    } else {
      console.log('\n9. ⚠ No lesson ID found, skipping lesson viewer');
    }

    // 10. QuizPage (/quizzes/:id)
    if (ids.quizId) {
      console.log('\n10. Capturing QuizPage...');
      await page.goto(`${BASE_URL}/quizzes/${ids.quizId}`);
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, '09-quiz.png', 'Quiz page');
    } else {
      console.log('\n10. ⚠ No quiz ID found, skipping quiz page');
    }

    // 11. InstructorDashboardPage (/instructor)
    console.log('\n11. Capturing InstructorDashboardPage...');
    await page.goto(`${BASE_URL}/instructor`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '10-instructor-dashboard.png', 'Instructor dashboard');

    // 12. CourseEditorPage (/instructor/courses/:id/edit)
    if (ids.courseId) {
      console.log('\n12. Capturing CourseEditorPage...');
      await page.goto(`${BASE_URL}/instructor/courses/${ids.courseId}/edit`);
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, '11-course-editor.png', 'Course editor');
    } else {
      console.log('\n12. ⚠ No course ID found, skipping course editor');
    }

    // 13. AnalyticsPage (/analytics)
    console.log('\n13. Capturing AnalyticsPage...');
    await page.goto(`${BASE_URL}/analytics`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '12-analytics.png', 'Analytics page');

    // 14. LearningLogPage (/learning-log)
    console.log('\n14. Capturing LearningLogPage...');
    await page.goto(`${BASE_URL}/learning-log`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '13-learning-log.png', 'Learning log');

    // 15. CertificatePage (/certificates/:id)
    if (ids.certId) {
      console.log('\n15. Capturing CertificatePage...');
      await page.goto(`${BASE_URL}/certificates/${ids.certId}`);
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, '14-certificate.png', 'Certificate page');
    } else {
      console.log('\n15. ⚠ No certificate ID found, skipping certificate page');
    }

    // 16. VerifyCertificatePage (/verify/:code) - Public route
    const verifyCode = ids.certCode || 'TEST123';
    console.log('\n16. Capturing VerifyCertificatePage...');
    await page.goto(`${BASE_URL}/verify/${verifyCode}`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '15-verify-certificate.png', 'Certificate verification page');

    console.log('\n✅ All screenshots captured successfully!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);

  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
}

main();
