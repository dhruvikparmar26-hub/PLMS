import { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export default function DailyGoalWidget() {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setGoal({
        goalType: 'time',
        goalValue: 30,
        currentProgress: 15,
        percentage: 50
      });
      setLoading(false);
      return;
    }
    const fetchDailyGoal = async () => {
      try {
        const res = await api.get('/daily-goal');
        if (res.data?.success) {
          setGoal(res.data.dailyGoal);
        }
      } catch (err) {
        console.error('Failed to fetch daily goal:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDailyGoal();
  }, [user]);

  if (loading) {
    return <div className="widget-card widget-shimmer" />;
  }

  if (!goal) {
    return null;
  }

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (goal.percentage / 100) * circumference;

  return (
    <div className="widget-card daily-goal-widget animate-fade-in-up">
      <div className="widget-header">
        <div>
          <h3 className="widget-title">Daily Study Goal</h3>
          <p className="widget-subtitle">Stay consistent to lock in your daily streak coefficients.</p>
        </div>
        <a href="/settings" className="widget-link">Configure →</a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '12px' }}>
        {/* SVG Progress Circle */}
        <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg style={{ transform: 'rotate(-90deg)', width: '90px', height: '90px' }}>
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke="var(--accent-primary)"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="donut-segment"
            />
          </svg>
          <span style={{ position: 'absolute', fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {goal.percentage}%
          </span>
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Goal Type: {goal.goalType === 'time' ? 'Study Time' : 'Lessons Completed'}
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {goal.currentProgress} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/ {goal.goalValue} {goal.goalType === 'time' ? 'min' : 'lessons'}</span>
            </div>
            {goal.completed ? (
              <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--success)', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                ✓ GOAL_COMPLETED (+50 XP)
              </span>
            ) : (
              <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {goal.goalValue - goal.currentProgress} {goal.goalType === 'time' ? 'more minutes' : 'more lessons'} remaining today
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
