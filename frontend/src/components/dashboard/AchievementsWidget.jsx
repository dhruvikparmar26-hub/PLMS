import { useEffect, useState } from 'react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

/**
 * AchievementsWidget — Row of achievement badges with earned/locked states.
 */
const AchievementsWidget = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState({ earned: [], locked: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAchievements({
        earned: [
          { _id: '1', title: '7 Day Streak', icon: '🔥', description: 'Studied 7 days in a row' },
          { _id: '2', title: 'Quick Learner', icon: '⚡', description: 'Complete 5 lessons in one day' },
        ],
        locked: [
          { _id: '3', title: 'Quiz Master', icon: '🧠', description: 'Score 100% on 10 quizzes' },
          { _id: '4', title: 'Concept Explorer', icon: '🕸', description: 'Master 20 concepts' },
        ],
      });
      setLoading(false);
      return;
    }
    const fetchAchievements = async () => {
      try {
        const res = await api.get('/achievements/user');
        const data = res.data?.data || { earned: [], locked: [] };
        setAchievements(data);
      } catch {
        setAchievements({
          earned: [
            { _id: '1', title: '7 Day Streak', icon: '🔥', description: 'Studied 7 days in a row' },
            { _id: '2', title: 'Quick Learner', icon: '⚡', description: 'Complete 5 lessons in one day' },
          ],
          locked: [
            { _id: '3', title: 'Quiz Master', icon: '🧠', description: 'Score 100% on 10 quizzes' },
            { _id: '4', title: 'Concept Explorer', icon: '🕸', description: 'Master 20 concepts' },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, [user]);

  if (loading) {
    return (
      <div className="widget-card achievements-card">
        <div className="widget-shimmer"></div>
      </div>
    );
  }

  const allBadges = [
    ...achievements.earned.map(a => ({ ...a, isEarned: true })),
    ...achievements.locked.slice(0, 4 - achievements.earned.length).map(a => ({ ...a, isEarned: false })),
  ].slice(0, 4);

  // Fallback icons for badges without custom icons
  const fallbackIcons = ['🔥', '⚡', '🧠', '🕸'];

  return (
    <div className="widget-card achievements-card">
      <div className="widget-header">
        <h3 className="widget-title">Achievements</h3>
        <Link to="/achievements" className="widget-link">View all →</Link>
      </div>

      <div className="achievements-grid">
        {allBadges.map((badge, i) => (
          <div
            key={badge._id || i}
            className={`achievement-badge-item ${badge.isEarned ? 'badge--earned' : 'badge--locked'}`}
          >
            <div className="achievement-badge-icon">
              {badge.icon || fallbackIcons[i] || '⭐'}
            </div>
            <div className="achievement-badge-label">{badge.title}</div>
            {!badge.isEarned && <div className="achievement-badge-lock">🔒</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsWidget;
