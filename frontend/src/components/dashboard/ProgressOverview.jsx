/**
 * ProgressOverview — Donut chart showing completion stats.
 */
const ProgressOverview = ({ enrollments = [] }) => {
  const isPreview = !enrollments || enrollments.length === 0;

  const total = isPreview ? 8 : enrollments.length;
  const completed = isPreview ? 3 : enrollments.filter(e => e.progressPercent === 100).length;
  const inProgress = isPreview ? 3 : enrollments.filter(e => e.progressPercent > 0 && e.progressPercent < 100).length;
  const notStarted = isPreview ? 2 : total - completed - inProgress;

  const pctCompleted = isPreview ? 42 : (total > 0 ? Math.round((completed / total) * 100) : 0);
  const pctInProgress = isPreview ? 34 : (total > 0 ? Math.round((inProgress / total) * 100) : 0);
  const pctNotStarted = isPreview ? 24 : (total > 0 ? Math.round((notStarted / total) * 100) : 0);

  // SVG donut chart calculations
  const r = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { pct: pctCompleted, color: '#6FCF97', label: 'Completed', count: isPreview ? '42%' : completed },
    { pct: pctInProgress, color: '#7B68EE', label: 'In Progress', count: isPreview ? '34%' : inProgress },
    { pct: pctNotStarted, color: '#636979', label: 'Not Started', count: isPreview ? '24%' : notStarted },
  ];

  let offset = 0;

  return (
    <div className="widget-card progress-overview-card">
      <div className="widget-header">
        <h3 className="widget-title">Progress Overview</h3>
        <a href="/analytics" className="widget-link">View analytics →</a>
      </div>

      <div className="progress-donut-container">
        <svg viewBox="0 0 160 160" className="progress-donut-svg">
          {/* Background circle */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />

          {/* Segments */}
          {segments.map((seg, i) => {
            const dashLen = (seg.pct / 100) * circumference;
            const dashGap = circumference - dashLen;
            const currentOffset = offset;
            offset += dashLen;

            if (seg.pct === 0) return null;

            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="16"
                strokeDasharray={`${dashLen} ${dashGap}`}
                strokeDashoffset={-currentOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                className="donut-segment"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            );
          })}

          {/* Center text */}
          <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text-primary)" fontSize="20" fontWeight="800" fontFamily="var(--font-display)">
            {total}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)" textTransform="uppercase">
            COURSES
          </text>
        </svg>

        {/* Legend */}
        <div className="progress-donut-legend">
          {segments.map((seg, i) => (
            <div key={i} className="donut-legend-item">
              <span className="donut-legend-dot" style={{ background: seg.color }}></span>
              <span className="donut-legend-label">{seg.label}</span>
              <span className="donut-legend-count">{seg.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressOverview;
