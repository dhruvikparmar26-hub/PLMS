import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  
  // Daily Goal state
  const [goalType, setGoalType] = useState('time');
  const [goalValue, setGoalValue] = useState(30);
  const [savingGoal, setSavingGoal] = useState(false);

  // Accessibility state
  const [fontSize, setFontSize] = useState('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [savingAccessibility, setSavingAccessibility] = useState(false);

  // Preferences state
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load daily goal
    api.get('/daily-goal').then((res) => {
      if (res.data?.dailyGoal) {
        setGoalType(res.data.dailyGoal.goalType || 'time');
        setGoalValue(res.data.dailyGoal.goalValue || 30);
      }
    }).catch(console.error);

    // Load accessibility settings
    api.get('/users/accessibility').then((res) => {
      if (res.data?.accessibility) {
        const acc = res.data.accessibility;
        setFontSize(acc.fontSize || 'medium');
        setHighContrast(acc.highContrast || false);
        setDyslexicFont(acc.dyslexicFont || false);
        setReduceMotion(acc.reduceMotion || false);
      }
    }).catch(console.error);

    // Load user profile preferences
    if (user) {
      setSkillLevel(user.skillLevel || 'beginner');
    }
  }, [user]);

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    setSavingGoal(true);
    setMessage('');
    setError('');
    try {
      await api.patch('/daily-goal', { goalType, goalValue });
      setMessage('Daily study goal updated successfully.');
    } catch (err) {
      setError('Failed to update daily goal.');
    } finally {
      setSavingGoal(false);
    }
  };

  const handleSaveAccessibility = async (e) => {
    e.preventDefault();
    setSavingAccessibility(true);
    setMessage('');
    setError('');
    try {
      const config = { fontSize, highContrast, dyslexicFont, reduceMotion };
      await api.patch('/users/accessibility', config);
      await refreshUser();
      setMessage('Accessibility parameters updated successfully.');
    } catch (err) {
      setError('Failed to update accessibility configuration.');
    } finally {
      setSavingAccessibility(false);
    }
  };

  const handleSavePrefs = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    setMessage('');
    setError('');
    try {
      await api.patch('/users/me/preferences', { skillLevel });
      await refreshUser();
      setMessage('Learning preference baseline updated.');
    } catch (err) {
      setError('Failed to update preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        <div className="notebook-margin" style={{ marginBottom: '32px' }}>
          <h1>Settings & Calibrations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Configure your personalized learning lab and accessibility specifications.
          </p>
        </div>

        {message && (
          <div className="blueprint-card" style={{ padding: '12px 16px', borderColor: 'var(--success)', color: 'var(--success)', marginBottom: '24px', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
            SUCCESS: {message}
          </div>
        )}
        {error && (
          <div className="blueprint-card" style={{ padding: '12px 16px', borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: '24px', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
            ERROR: {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Daily study goals calibration */}
          <div className="blueprint-card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Daily Goal Calibrations</h3>
            <form onSubmit={handleSaveGoal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>GOAL CALIBRATION METRIC</label>
                  <select className="input-field" value={goalType} onChange={(e) => setGoalType(e.target.value)}>
                    <option value="time">Study Time (Minutes)</option>
                    <option value="lessons">Completed Lessons</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>GOAL TARGET SPECIFICATION</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={goalValue} 
                    onChange={(e) => setGoalValue(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>
              </div>
              <button type="submit" disabled={savingGoal} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                {savingGoal ? 'Saving...' : 'Update Study Goal'}
              </button>
            </form>
          </div>

          {/* Accessibility Settings */}
          <div className="blueprint-card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Accessibility Configuration</h3>
            <form onSubmit={handleSaveAccessibility} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>FONT SCALE PARAMETER</label>
                <select className="input-field" value={fontSize} onChange={(e) => setFontSize(e.target.value)} style={{ width: '200px' }}>
                  <option value="small">Small (14px)</option>
                  <option value="medium">Medium (16px)</option>
                  <option value="large">Large (18px)</option>
                  <option value="xl">Extra Large (21px)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input 
                    type="checkbox" 
                    checked={highContrast} 
                    onChange={(e) => setHighContrast(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  High Contrast Colors (Contrast Calibrations)
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input 
                    type="checkbox" 
                    checked={dyslexicFont} 
                    onChange={(e) => setDyslexicFont(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  OpenDyslexic Font Specifier
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input 
                    type="checkbox" 
                    checked={reduceMotion} 
                    onChange={(e) => setReduceMotion(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  Reduce Layout Animations (Prefers Reduced Motion)
                </label>
              </div>

              <button type="submit" disabled={savingAccessibility} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                {savingAccessibility ? 'Saving...' : 'Apply Layout Calibration'}
              </button>
            </form>
          </div>

          {/* Preferences Settings */}
          <div className="blueprint-card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Adaptive Placement Calibrations</h3>
            <form onSubmit={handleSavePrefs} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>CURRENT DIAGNOSED SKILL LEVEL</label>
                <select className="input-field" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} style={{ width: '200px' }}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <button type="submit" disabled={savingPrefs} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                {savingPrefs ? 'Updating...' : 'Update skillLevel'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
