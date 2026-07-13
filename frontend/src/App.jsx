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

import DashboardLayout from './components/layout/DashboardLayout';

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          
          {/* Protected Dashboard Layout Routes - Persistent Sidebar & Navbar */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CourseCatalogPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/lessons/:id" element={<LessonViewerPage />} />
            <Route path="/quizzes/:id" element={<QuizPage />} />
            <Route path="/instructor" element={<InstructorDashboardPage />} />
            <Route path="/instructor/courses/:id/edit" element={<CourseEditorPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/learning-log" element={<LearningLogPage />} />
            <Route path="/mastery-graph" element={<MasteryGraphPage />} />
            <Route path="/review-queue" element={<ReviewQueuePage />} />
            <Route path="/adaptive-path" element={<AdaptivePathPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/quizzes" element={<QuizzesPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/live-sessions" element={<LiveSessionsPage />} />
            <Route path="/study-groups" element={<StudyGroupsPage />} />
            <Route path="/mentor-match" element={<MentorMatchPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/certificates/:id" element={<CertificatePage />} />
          </Route>

          {/* Public certificate verification - no auth needed */}
          <Route path="/verify/:code" element={<VerifyCertificatePage />} />
        </Routes>
        <AccessibilityBar />
      </AuthProvider>
    </Router>
  );
}

export default App;
