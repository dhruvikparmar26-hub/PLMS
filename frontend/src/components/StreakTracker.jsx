import { useState, useEffect } from 'react';
import api from '../api';

export default function StreakTracker({ compact = false }) {
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [dailyGoal, setDailyGoal] = useState({
    goalType: 'lessons',
    goalValue: 3,
    currentProgress: 0,
    percentage: 0,
    completed: false,
    xp: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreakAndGoal();
  }, []);

  const fetchStreakAndGoal = async () => {
    try {
      setLoading(true);
      const [streakRes, goalRes] = await Promise.all([
        api.get('/streak'),
        api.get('/daily-goal')
      ]);
      
      setStreak(streakRes.data);
      setDailyGoal(goalRes.data.dailyGoal);
    } catch (error) {
      console.error('Error fetching streak and daily goal data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div 
        style={{
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem'
        }}
      >
        Loading...
      </div>
    );
  }

  /* ---- Compact layout: for embedding inside hero bento cell ---- */
  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {/* Streak + Daily Goal row */}
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          {/* Streak pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
            background: 'linear-gradient(135deg, rgba(14, 165, 164, 0.1) 0%, rgba(59, 130, 246, 0.03) 100%)',
            border: '1px solid var(--accent-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            flex: '1 1 auto',
            minWidth: '160px',
          }}>
            <span style={{ fontSize: '1.5rem' }}>🔥</span>
            <div>
              <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--accent-primary)', fontWeight: 700, display: 'block', letterSpacing: '0.08em' }}>
                Activity Streak
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {streak.currentStreak} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>days</span>
              </span>
              <span className="font-mono" style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', display: 'block' }}>
                Record: {streak.longestStreak} days
              </span>
            </div>
          </div>
          
          {/* Daily goal pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            flex: '1 1 auto',
            minWidth: '160px',
          }}>
            <span style={{ fontSize: '1.5rem' }}>🎯</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--accent-primary)', fontWeight: 700, display: 'block', letterSpacing: '0.08em' }}>
                Daily Goal
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    width: '100%', height: '6px',
                    backgroundColor: 'var(--bg-canvas)',
                    borderRadius: '3px', overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${dailyGoal.percentage}%`, height: '100%',
                      backgroundColor: dailyGoal.completed ? 'var(--success)' : 'var(--accent-primary)',
                      transition: 'width var(--transition-base)',
                    }} />
                  </div>
                </div>
                <span className="font-mono" style={{
                  fontSize: '0.75rem', fontWeight: 700,
                  color: dailyGoal.completed ? 'var(--success)' : 'var(--text-secondary)',
                }}>
                  {dailyGoal.percentage}%
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', display: 'block' }}>
                {dailyGoal.currentProgress}/{dailyGoal.goalValue} {dailyGoal.goalType === 'lessons' ? 'lessons' : 'minutes'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Default full layout (backward compatible) ---- */
  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 'var(--space-md)'
      }}
    >
      {/* Streak Section */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(14, 165, 164, 0.1) 0%, rgba(59, 130, 246, 0.03) 100%)',
          border: '1px solid var(--accent-primary)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
            🔥 Activity Streak
          </span>
          <p style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            {streak.currentStreak} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>days</span>
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Record: {streak.longestStreak} days
          </span>
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(14, 165, 164, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          border: '1px solid var(--accent-primary)'
        }}>
          🔥
        </div>
      </div>

      {/* Daily Goal Section */}
      <div 
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
              🎯 Daily Goal
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {dailyGoal.goalType === 'lessons' 
                ? `${dailyGoal.currentProgress} / ${dailyGoal.goalValue} Lessons Completed`
                : `${dailyGoal.currentProgress} / ${dailyGoal.goalValue} Minutes Learned`}
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 'bold', color: dailyGoal.completed ? 'var(--success)' : 'var(--text-secondary)' }}>
            {dailyGoal.percentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          border: '1px solid var(--border-default)'
        }}>
          <div style={{
            width: `${dailyGoal.percentage}%`,
            height: '100%',
            backgroundColor: dailyGoal.completed ? 'var(--success)' : 'var(--accent-primary)',
            transition: 'width var(--transition-base)'
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          <span>Status: {dailyGoal.completed ? 'Goal completed' : 'In progress'}</span>
          <span>XP earned: {dailyGoal.xp}</span>
        </div>
      </div>
    </div>
  );
}
