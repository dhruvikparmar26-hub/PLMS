import { useState, useEffect } from 'react';
import api, { getApiBaseUrl } from '../api';
import { io } from 'socket.io-client';

export default function LeaderboardSection({ user, onOptInChange }) {
  const [optedIn, setOptedIn] = useState(user?.leaderboardOptIn || false);
  const [categories, setCategories] = useState(user?.learningPreferences || []);
  const [selectedCategory, setSelectedCategory] = useState(user?.learningPreferences?.[0] || '');
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (optedIn && selectedCategory) {
      fetchLeaderboard();

      // Establish Socket connection
      const socketUrl = getApiBaseUrl().replace(/\/api$/, '');
      const socket = io(socketUrl, { withCredentials: true });

      // Join the room for the selected category
      socket.emit('join_category', selectedCategory);

      // Listen for updates
      socket.on('leaderboard_updated', (data) => {
        if (data.category === selectedCategory) {
          fetchLeaderboard();
        }
      });

      return () => {
        socket.emit('leave_category', selectedCategory);
        socket.disconnect();
      };
    }
  }, [optedIn, selectedCategory]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/leaderboard/${selectedCategory}`);
      setLeaderboard(res.data.leaderboard || []);
      setCurrentUserRank(res.data.currentUserRank);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leaderboard data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOptIn = async (optInValue) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.patch('/leaderboard/opt-in', { optIn: optInValue });
      setOptedIn(res.data.leaderboardOptIn);
      if (onOptInChange) {
        onOptInChange(res.data.leaderboardOptIn);
      }
    } catch (err) {
      setError('Failed to update leaderboard preferences.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!optedIn) {
    return (
      <div 
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px dashed var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-lg)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-sm)'
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>🏆</span>
        <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', margin: 0 }}>
          Leaderboard isn't active yet
        </h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '400px', margin: 0 }}>
          Compete weekly with peers studying the same categories. Opt in to log your learning metrics on the public board.
        </p>
        <button
          onClick={() => handleToggleOptIn(true)}
          disabled={loading}
          className="btn-primary"
          style={{ padding: '8px 20px', fontSize: '0.8rem', marginTop: 'var(--space-xs)' }}
        >
          {loading ? 'Joining leaderboard...' : 'Join the leaderboard'}
        </button>
      </div>
    );
  }

  return (
    <div 
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)'
      }}
    >
      {/* Header Controls */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-sm)',
          borderBottom: '1px solid var(--border-default)',
          paddingBottom: 'var(--space-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
            🏆 Weekly Leaderboard
          </span>
          {categories.length > 1 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '2px 8px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none'
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} style={{ textTransform: 'uppercase' }}>
                  {cat}
                </option>
              ))}
            </select>
          )}
          {categories.length === 1 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              ({selectedCategory})
            </span>
          )}
        </div>

        <button
          onClick={() => handleToggleOptIn(false)}
          disabled={loading}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--danger)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer'
          }}
        >
          Leave leaderboard
        </button>
      </div>

      {error && (
        <div style={{ color: 'var(--danger)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          ERROR: {error}
        </div>
      )}

      {/* Leaderboard Table / List */}
      {loading && leaderboard.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textAlign: 'center', padding: 'var(--space-md) 0' }}>
          Loading leaderboard data...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
          {leaderboard.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', margin: 0, padding: 'var(--space-md) 0' }}>
              No active candidates logged in this category. Be the first!
            </p>
          ) : (
            leaderboard.map((entry) => {
              const isSelf = entry._id === user._id;
              return (
                <div
                  key={entry._id}
                  style={{
                    backgroundColor: isSelf ? 'rgba(14, 165, 164, 0.05)' : 'var(--bg-elevated)',
                    border: isSelf ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span 
                      style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '0.85rem', 
                        fontWeight: 'bold', 
                        color: entry.rank === 1 ? 'var(--accent-secondary)' : 
                               entry.rank === 2 ? 'var(--text-secondary)' : 
                               entry.rank === 3 ? 'var(--text-muted)' : 'var(--text-muted)',
                        width: '20px'
                      }}
                    >
                      #{entry.rank}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: isSelf ? 700 : 500, color: 'var(--text-primary)' }}>
                      {entry.name} {isSelf && <span style={{ color: 'var(--accent-primary)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>[YOU]</span>}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                        {entry.weeklyXP}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>
                        Weekly XP
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '60px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {entry.totalXP}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>
                        Total XP
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {currentUserRank && (
        <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 'var(--space-xs)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          <span>Your rank: #{currentUserRank}</span>
          <span>Online</span>
        </div>
      )}
    </div>
  );
}
