import { useEffect, useState } from 'react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

/**
 * RecentActivity — XP-tagged activity feed showing latest learning events.
 */
const RecentActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setActivities(getFallbackData());
      setLoading(false);
      return;
    }
    const fetchActivity = async () => {
      try {
        const res = await api.get('/analytics/activity');
        const data = res.data?.activities || res.data?.logs || [];
        if (data.length > 0) {
          setActivities(data.slice(0, 6));
        } else {
          setActivities(getFallbackData());
        }
      } catch {
        setActivities(getFallbackData());
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [user]);

  const getFallbackData = () => [
    { type: 'lesson_completed', title: 'Completed "Binary Trees"', time: '2 hours ago', xp: 50 },
    { type: 'quiz_attempted', title: 'DSA Quiz — Score: 85%', time: '4 hours ago', xp: 75 },
    { type: 'flashcard_review', title: 'Reviewed 15 flashcards', time: '5 hours ago', xp: 25 },
    { type: 'achievement_unlocked', title: 'Unlocked "Quiz Master"', time: '1 day ago', xp: 100 },
    { type: 'lesson_completed', title: 'Completed "Graph Traversal"', time: '1 day ago', xp: 50 },
    { type: 'note_created', title: 'Created note on "React Hooks"', time: '2 days ago', xp: 15 },
  ];

  const typeConfig = {
    lesson_completed: { icon: '✅', color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.12)' },
    quiz_attempted: { icon: '📝', color: 'var(--accent-secondary)', bg: 'rgba(59, 130, 246, 0.12)' },
    flashcard_review: { icon: '🧠', color: 'var(--accent-primary)', bg: 'rgba(14, 165, 164, 0.12)' },
    achievement_unlocked: { icon: '🏆', color: '#E8745C', bg: 'rgba(232, 116, 92, 0.12)' },
    note_created: { icon: '📄', color: 'var(--text-secondary)', bg: 'rgba(75, 85, 99, 0.12)' },
  };

  if (loading) {
    return (
      <div className="widget-card activity-card">
        <div className="widget-shimmer"></div>
      </div>
    );
  }

  return (
    <div className="widget-card activity-card">
      <div className="widget-header">
        <h3 className="widget-title">Recent Activity</h3>
        <Link to="/learning-log" className="widget-link">View all →</Link>
      </div>

      <div className="activity-list">
        {activities.map((activity, i) => {
          const config = typeConfig[activity.type] || typeConfig.lesson_completed;
          return (
            <div key={i} className="activity-item animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="activity-icon" style={{ background: config.bg, color: config.color }}>
                {config.icon}
              </div>
              <div className="activity-info">
                <span className="activity-title">{activity.title}</span>
                <span className="activity-time">{activity.time}</span>
              </div>
              <div className="activity-xp" style={{ color: config.color }}>
                +{activity.xp} XP
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
