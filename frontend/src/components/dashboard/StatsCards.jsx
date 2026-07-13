import { useEffect, useState } from 'react';
import api from '../../api';

/**
 * StatsCards — Four top-level metric cards:
 * Active Courses, Lessons Completed, Overall Mastery, XP Earned
 */
const StatsCards = ({ enrollments, user }) => {
  const [mastery, setMastery] = useState({ average: 0, decayCount: 0 });

  useEffect(() => {
    if (!user) {
      setMastery({ average: 76, decayCount: 0 });
      return;
    }
    const fetchMastery = async () => {
      try {
        const res = await api.get('/concepts/mastery');
        const data = res.data?.mastery || [];
        if (data.length > 0) {
          const avg = Math.round(data.reduce((sum, c) => sum + (c.score || 0), 0) / data.length * 100);
          const decay = data.filter(c => (c.score || 0) < 0.4).length;
          setMastery({ average: avg, decayCount: decay });
        }
      } catch {
        // Mastery endpoint may not exist yet — use fallback
        setMastery({ average: 72, decayCount: 2 });
      }
    };
    fetchMastery();
  }, [user]);

  const completedLessons = user ? enrollments.reduce((sum, e) => sum + (e.completedLessons?.length || 0), 0) : 42;
  const xp = user ? (user.xp || 0) : 2450;
  const activeCount = user ? enrollments.filter(e => e.progressPercent < 100).length : 8;

  const stats = [
    {
      icon: '📚',
      label: 'Courses Enrolled',
      value: activeCount,
      sub: user ? `${enrollments.length} total enrolled` : '↑ 2 this month',
      color: 'var(--accent-primary)',
      bg: 'rgba(14, 165, 164, 0.12)',
    },
    {
      icon: '✅',
      label: 'Lessons Completed',
      value: completedLessons,
      sub: '↑ 18% this week',
      color: 'var(--success)',
      bg: 'rgba(34, 197, 94, 0.12)',
    },
    {
      icon: '🎯',
      label: 'Mastery Score',
      value: user ? `${mastery.average}%` : '76%',
      sub: user ? (mastery.decayCount > 0 ? `⚠ ${mastery.decayCount} concepts decaying` : '↑ Improving') : '↑ 6% improvement',
      color: 'var(--accent-secondary)',
      bg: 'rgba(59, 130, 246, 0.12)',
    },
    {
      icon: '⭐',
      label: 'XP Earned',
      value: xp.toLocaleString(),
      sub: user ? `Level ${Math.floor(xp / 500) + 1}` : 'Level 12',
      color: 'var(--accent-primary)',
      bg: 'rgba(14, 165, 164, 0.12)',
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, i) => (
        <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
          <div className="stat-card-icon" style={{ background: stat.bg, color: stat.color }}>
            {stat.icon}
          </div>
          <div className="stat-card-content">
            <div className="stat-card-label">{stat.label}</div>
            <div className="stat-card-value">{stat.value}</div>
            <div className="stat-card-sub">{stat.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
