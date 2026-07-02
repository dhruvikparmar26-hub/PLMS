export default function AchievementBadge({ achievement, earned }) {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        border: '2px solid',
        background: earned ? 'var(--bg-elevated)' : 'rgba(0, 0, 0, 0.2)',
        borderColor: earned ? 'var(--accent-primary)' : 'var(--border-default)',
        color: earned ? 'var(--text-primary)' : 'var(--text-muted)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ fontSize: '1.5rem' }}>{achievement.icon}</div>
      <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>{achievement.title}</h4>
      <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0 }}>{achievement.description}</p>
      {!earned && (
        <div style={{ marginTop: '4px', fontSize: '0.6875rem', fontWeight: 600, opacity: 0.6 }}>🔒 Locked</div>
      )}
    </div>
  );
}
