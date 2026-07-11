import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AccessibilityBar from './components/AccessibilityBar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import CourseCatalogPage from './pages/CourseCatalogPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LessonViewerPage from './pages/LessonViewerPage';
import QuizPage from './pages/QuizPage';
import InstructorDashboardPage from './pages/InstructorDashboardPage';
import CourseEditorPage from './pages/CourseEditorPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LearningLogPage from './pages/LearningLogPage';
import CertificatePage from './pages/CertificatePage';
import VerifyCertificatePage from './pages/VerifyCertificatePage';
import SchedulePage from './pages/SchedulePage';

// New sidebar route pages
import MasteryGraphPage from './pages/MasteryGraphPage';
import ReviewQueuePage from './pages/ReviewQueuePage';
import AdaptivePathPage from './pages/AdaptivePathPage';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizzesPage from './pages/QuizzesPage';
import CommunityPage from './pages/CommunityPage';
import LiveSessionsPage from './pages/LiveSessionsPage';
import StudyGroupsPage from './pages/StudyGroupsPage';
import MentorMatchPage from './pages/MentorMatchPage';
import AchievementsPage from './pages/AchievementsPage';
import NotesPage from './pages/NotesPage';
import BookmarksPage from './pages/BookmarksPage';
import SettingsPage from './pages/SettingsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import NotificationsPage from './pages/NotificationsPage';

/**
 * App — Root component.
 * AuthProvider wraps everything so all pages can access auth state.
 * /dashboard, /courses, /lessons, /quizzes, and /onboarding are protected.
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CourseCatalogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <CourseDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/:id"
            element={
              <ProtectedRoute>
                <LessonViewerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/:id"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor"
            element={
              <ProtectedRoute>
                <InstructorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses/:id/edit"
            element={
              <ProtectedRoute>
                <CourseEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <SchedulePage />
              </ProtectedRoute>
            }
          />
           <Route
            path="/learning-log"
            element={
              <ProtectedRoute>
                <LearningLogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mastery-graph"
            element={
              <ProtectedRoute>
                <MasteryGraphPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review-queue"
            element={
              <ProtectedRoute>
                <ReviewQueuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adaptive-path"
            element={
              <ProtectedRoute>
                <AdaptivePathPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flashcards"
            element={
              <ProtectedRoute>
                <FlashcardsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <ProtectedRoute>
                <QuizzesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/live-sessions"
            element={
              <ProtectedRoute>
                <LiveSessionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-groups"
            element={
              <ProtectedRoute>
                <StudyGroupsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor-match"
            element={
              <ProtectedRoute>
                <MentorMatchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <AchievementsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <NotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <ProtectedRoute>
                <BookmarksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificates/:id"
            element={
              <ProtectedRoute>
                <CertificatePage />
              </ProtectedRoute>
            }
          />
          {/* Public certificate verification - no auth needed */}
          <Route path="/verify/:code" element={<VerifyCertificatePage />} />
        </Routes>
        <AccessibilityBar />
      </AuthProvider>
    </Router>
  );
}

export default App;
