import { useEffect, useState } from 'react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

/**
 * AdaptivePath — "Your Adaptive Learning Path" section.
 * Shows current level badge and concept progression chain.
 */
const AdaptivePath = () => {
  const { user } = useAuth();
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPathData({
        level: 'intermediate',
        courses: [
          { _id: '1', title: 'JavaScript Basics', status: 'completed' },
          { _id: '2', title: 'Data Structures', status: 'completed' },
          { _id: '3', title: 'React Fundamentals', status: 'in_progress' },
          { _id: '4', title: 'Node.js & Express', status: 'locked' },
          { _id: '5', title: 'System Design', status: 'locked' },
        ],
      });
      setLoading(false);
      return;
    }
    const fetchPath = async () => {
      try {
        const res = await api.get('/adaptive/learning-path');
        setPathData(res.data);
      } catch {
        // Fallback demo data for when endpoint is not available
        setPathData({
          level: 'intermediate',
          courses: [
            { _id: '1', title: 'JavaScript Basics', status: 'completed' },
            { _id: '2', title: 'Data Structures', status: 'completed' },
            { _id: '3', title: 'React Fundamentals', status: 'in_progress' },
            { _id: '4', title: 'Node.js & Express', status: 'locked' },
            { _id: '5', title: 'System Design', status: 'locked' },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPath();
  }, [user]);

  if (loading) {
    return (
      <div className="widget-card adaptive-path-card">
        <div className="widget-shimmer"></div>
      </div>
    );
  }

  const level = pathData?.level || 'beginner';
  const courses = pathData?.courses || [];

  const levelColors = {
    beginner: { bg: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)', label: 'Beginner' },
    intermediate: { bg: 'rgba(14, 165, 164, 0.15)', color: 'var(--accent-primary)', label: 'Intermediate' },
    advanced: { bg: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-secondary)', label: 'Advanced' },
  };

  const lc = levelColors[level] || levelColors.beginner;

  const statusIcon = (status) => {
    switch (status) {
      case 'completed': return { icon: '✓', cls: 'path-node--completed' };
      case 'in_progress': return { icon: '◉', cls: 'path-node--active' };
      default: return { icon: '🔒', cls: 'path-node--locked' };
    }
  };

  return (
    <div className="widget-card adaptive-path-card">
      <div className="widget-header">
        <div>
          <h3 className="widget-title">Your Adaptive Learning Path</h3>
          <p className="widget-subtitle">Personalized from placement results and concept mastery</p>
        </div>
        <span className="adaptive-level-badge" style={{ background: lc.bg, color: lc.color }}>
          {lc.label}
        </span>
      </div>

      <div className="adaptive-path-chain">
        {courses.map((course, i) => {
          const { icon, cls } = statusIcon(course.status);
          return (
            <div key={course._id || i} className="adaptive-path-step">
              {i > 0 && <div className={`adaptive-path-connector ${course.status === 'locked' ? 'path-connector--locked' : ''}`} />}
              <div className={`path-node ${cls}`}>
                <span className="path-node-icon">{icon}</span>
              </div>
              <span className="path-node-label">{course.title}</span>
            </div>
          );
        })}
      </div>

      {/* Decorative gradient */}
      <div className="adaptive-path-glow"></div>
    </div>
  );
};

export default AdaptivePath;
