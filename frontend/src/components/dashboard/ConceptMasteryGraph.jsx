import { useEffect, useState, useRef } from 'react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ConceptMasteryGraph — Interactive SVG-based concept mastery visualization.
 * Central hub node with connected satellite nodes showing mastery percentages.
 * Color-coded by mastery level: green(80-100), blue(60-79), amber(40-59), red(<40), gray(locked).
 */
const ConceptMasteryGraph = () => {
  const { user } = useAuth();
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setConcepts(getFallbackData());
      setLoading(false);
      return;
    }
    const fetchConcepts = async () => {
      try {
        const res = await api.get('/concepts/mastery');
        const data = res.data?.mastery || [];
        if (data.length > 0) {
          setConcepts(data);
        } else {
          setConcepts(getFallbackData());
        }
      } catch {
        setConcepts(getFallbackData());
      } finally {
        setLoading(false);
      }
    };
    fetchConcepts();
  }, [user]);

  const getFallbackData = () => [
    { name: 'Arrays', score: 0.92, status: 'mastered' },
    { name: 'Linked Lists', score: 0.85, status: 'mastered' },
    { name: 'Trees', score: 0.45, status: 'learning' },
    { name: 'Graphs', score: 0.38, status: 'weak' },
    { name: 'Hash Maps', score: 0.78, status: 'learning' },
    { name: 'Sorting', score: 0.95, status: 'mastered' },
    { name: 'Recursion', score: 0.62, status: 'learning' },
    { name: 'Dynamic Prog.', score: 0.25, status: 'weak' },
  ];

  const getMasteryColor = (score) => {
    if (score >= 0.8) return '#6FCF97';
    if (score >= 0.6) return '#7B68EE';
    if (score >= 0.4) return '#F2B056';
    return '#E8745C';
  };

  const getMasteryBg = (score) => {
    if (score >= 0.8) return 'rgba(111, 207, 151, 0.15)';
    if (score >= 0.6) return 'rgba(123, 104, 238, 0.15)';
    if (score >= 0.4) return 'rgba(242, 176, 86, 0.15)';
    return 'rgba(232, 116, 92, 0.15)';
  };

  if (loading) {
    return (
      <div className="widget-card concept-graph-card">
        <div className="widget-shimmer"></div>
      </div>
    );
  }

  // Calculate positions for satellite nodes in a circle
  const centerX = 200;
  const centerY = 170;
  const radius = 120;
  const nodeRadius = 32;
  const avgMastery = concepts.length > 0
    ? Math.round(concepts.reduce((s, c) => s + (c.score || 0), 0) / concepts.length * 100)
    : 0;
  const mainTopic = 'Data Structures';

  // Decaying concepts warning
  const decaying = concepts.filter(c => c.score < 0.4);

  return (
    <div className="widget-card concept-graph-card">
      <div className="widget-header">
        <div>
          <h3 className="widget-title">Concept Mastery Graph</h3>
          <p className="widget-subtitle">Interactive visualization of your concept understanding</p>
        </div>
        <a href="/mastery-graph" className="widget-link">View full map →</a>
      </div>

      <div className="concept-graph-container">
        <svg
          ref={svgRef}
          viewBox="0 0 400 340"
          className="concept-graph-svg"
        >
          {/* Connection lines */}
          {concepts.map((concept, i) => {
            const angle = (i / concepts.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return (
              <line
                key={`line-${i}`}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke={getMasteryColor(concept.score)}
                strokeWidth="1.5"
                strokeOpacity="0.3"
                strokeDasharray={concept.score < 0.4 ? '4,4' : 'none'}
              />
            );
          })}

          {/* Center hub */}
          <circle cx={centerX} cy={centerY} r={44} fill="rgba(242, 176, 86, 0.1)" stroke="#F2B056" strokeWidth="2" />
          <circle cx={centerX} cy={centerY} r={38} fill="var(--bg-elevated)" />
          <text x={centerX} y={centerY - 8} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="700" fontFamily="var(--font-display)">
            {mainTopic}
          </text>
          <text x={centerX} y={centerY + 8} textAnchor="middle" fill="#F2B056" fontSize="16" fontWeight="800" fontFamily="var(--font-display)">
            {avgMastery}%
          </text>
          <text x={centerX} y={centerY + 22} textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="var(--font-mono)">
            MASTERY
          </text>

          {/* Satellite nodes */}
          {concepts.map((concept, i) => {
            const angle = (i / concepts.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const color = getMasteryColor(concept.score);
            const pct = Math.round(concept.score * 100);
            return (
              <g key={`node-${i}`} className="concept-node">
                {/* Glow */}
                <circle cx={x} cy={y} r={nodeRadius + 2} fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.2" />
                {/* Node bg */}
                <circle cx={x} cy={y} r={nodeRadius} fill={getMasteryBg(concept.score)} stroke={color} strokeWidth="1.5" />
                {/* Label */}
                <text x={x} y={y - 6} textAnchor="middle" fill="var(--text-primary)" fontSize="8" fontWeight="600" fontFamily="var(--font-display)">
                  {concept.name}
                </text>
                {/* Percentage */}
                <text x={x} y={y + 8} textAnchor="middle" fill={color} fontSize="11" fontWeight="700" fontFamily="var(--font-display)">
                  {pct}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="concept-graph-legend">
        <span className="legend-item"><span className="legend-dot" style={{ background: '#6FCF97' }}></span> Mastered (80-100%)</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#7B68EE' }}></span> Learning (60-79%)</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#F2B056' }}></span> Developing (40-59%)</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#E8745C' }}></span> Weak (&lt;40%)</span>
      </div>

      {/* Decay warning */}
      {decaying.length > 0 && (
        <div className="concept-decay-alert">
          ⚠ {decaying.map(c => c.name).join(', ')} mastery may decay — review recommended
        </div>
      )}
    </div>
  );
};

export default ConceptMasteryGraph;
