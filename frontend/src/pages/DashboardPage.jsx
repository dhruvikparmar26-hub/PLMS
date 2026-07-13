import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

// Layout
import DashboardLayout from '../components/layout/DashboardLayout';

// Dashboard widgets
import StatsCards from '../components/dashboard/StatsCards';
import AdaptivePath from '../components/dashboard/AdaptivePath';
import ConceptMasteryGraph from '../components/dashboard/ConceptMasteryGraph';
import RecentActivity from '../components/dashboard/RecentActivity';
import LearningSchedule from '../components/dashboard/LearningSchedule';
import AchievementsWidget from '../components/dashboard/AchievementsWidget';
import ContinueLearning from '../components/dashboard/ContinueLearning';
import ProgressOverview from '../components/dashboard/ProgressOverview';
import DailyGoalWidget from '../components/dashboard/DailyGoalWidget';

/**
 * DashboardPage — Main dashboard for authenticated users.
 * Composed of layout shell + modular widget components.
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user && (!user.learningPreferences || user.learningPreferences.length === 0)) {
      navigate('/onboarding');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !user.learningPreferences || user.learningPreferences.length === 0) return;
      try {
        setLoadingData(true);
        const res = await api.get('/enrollments/me');
        setEnrollments(res.data.enrollments || []);
      } catch (err) {
        console.error('Failed to fetch enrollments:', err);
        const cached = localStorage.getItem('dashboard_enrollments');
        if (cached) setEnrollments(JSON.parse(cached));
      } finally {
        setLoadingData(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    if (user && (!user.learningPreferences || user.learningPreferences.length === 0)) {
      navigate('/onboarding');
    }
  }, [user, navigate]);

  const greetingTitle = user ? `Welcome, ${user.name}! 👋` : 'Welcome to Momentum';
  const greetingSub = user ? 'Ready to continue your learning journey?' : 'Explore your customized technical learning lab and skill calibration board.';

  return (
    <DashboardLayout>
      <div className="dashboard-page animate-fade-in-up" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', width: '100%' }}>
        
        {/* Left Column (Main content) */}
        <div style={{ flex: '1 1 66%', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Greeting Header */}
          <div className="dashboard-greeting">
            <div>
              <h1 className="dashboard-greeting-title" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                {greetingTitle}
              </h1>
              <p className="dashboard-greeting-sub" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {greetingSub}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards enrollments={enrollments} user={user} />

          {/* Your Personalized Path */}
          <AdaptivePath />

          {/* Row: Concept Mastery Graph + Recent Activity */}
          <div className="dashboard-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <ConceptMasteryGraph />
            <RecentActivity />
          </div>

          {/* Continue Learning */}
          <ContinueLearning enrollments={enrollments} />
        </div>

        {/* Right Column (Sidebar widgets) */}
        <div style={{ flex: '1 1 28%', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Calendar & Today's Schedule */}
          <LearningSchedule />

          {/* Achievements */}
          <AchievementsWidget />

          {/* Progress Overview */}
          <ProgressOverview enrollments={enrollments} />

          {/* Daily Goal */}
          <DailyGoalWidget />

          {/* Smart Review Queue */}
          <div className="widget-card smart-review-card">
            <div className="widget-header">
              <h3 className="widget-title">Smart Review Queue</h3>
            </div>
            <div className="smart-review-content">
              <div className="smart-review-stats" style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0 16px' }}>
                <div className="smart-review-stat">
                  <span className="smart-review-stat-value" style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800 }}>12</span>
                  <span className="smart-review-stat-label" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cards due today</span>
                </div>
                <div className="smart-review-stat">
                  <span className="smart-review-stat-value" style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800 }}>3</span>
                  <span className="smart-review-stat-label" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Concepts to reinforce</span>
                </div>
                <div className="smart-review-stat">
                  <span className="smart-review-stat-value" style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800 }}>4:30 PM</span>
                  <span className="smart-review-stat-label" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Next review</span>
                </div>
              </div>
              <a href="/review-queue" className="smart-review-cta" style={{
                display: 'block',
                textAlign: 'center',
                background: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: '1px solid var(--border-default)',
                transition: 'all 0.2s'
              }}>
                Start Smart Review →
              </a>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
