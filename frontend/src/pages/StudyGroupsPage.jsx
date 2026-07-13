import { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api';

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('notes'); // notes, qa, quiz, reviews

  // Live Q&A state for active room
  const [qaQuestions, setQaQuestions] = useState({});
  const [newQuestionText, setNewQuestionText] = useState('');
  const [answerInputs, setAnswerInputs] = useState({});

  // Mini quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Group reviews state
  const [groupReviews, setGroupReviews] = useState({});
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  const mockMembers = {
    '1': [
      { name: 'Alice Vance', status: 'Online', role: 'Moderator' },
      { name: 'Bob Jenkins', status: 'Online', role: 'Student' },
      { name: 'Dave Miller', status: 'Idle', role: 'Student' },
      { name: 'You', status: 'Online', role: 'Student' }
    ],
    '2': [
      { name: 'Dr. Sarah Jenkins', status: 'Online', role: 'Mentor' },
      { name: 'Elena Rostova', status: 'Online', role: 'Student' },
      { name: 'Hiroshi Tanaka', status: 'Online', role: 'Student' },
      { name: 'You', status: 'Online', role: 'Student' }
    ],
    '3': [
      { name: 'Prof. Alex Rivera', status: 'Online', role: 'Mentor' },
      { name: 'Marc Dupond', status: 'Online', role: 'Student' },
      { name: 'Chloe Watson', status: 'Idle', role: 'Student' },
      { name: 'You', status: 'Online', role: 'Student' }
    ]
  };

  const architectureNotes = {
    '1': {
      title: 'MERN Stack Production Architecture',
      content: `
### 🖥️ Client Layer (React)
- Single Page Application (SPA) bundled via Vite.
- Static assets hosted on CDN (Cloudflare) with cache-control headers.
- Client-side routing with React Router, auth guard context, and local state management.

### 🌐 Reverse Proxy & Security (Nginx)
- Nginx acting as a reverse proxy and SSL terminator.
- Forwards API requests (\`/api/*\`) to the Node.js application server.
- Sets standard security headers (CORS, CSP, X-Content-Type-Options).

### ⚙️ Application Logic Server (Node.js & Express)
- Stateless Node.js server clustered across CPU cores using PM2.
- Express framework handling request routing, validation middleware, and JWT authentication.
- Request rate limiting using Redis token bucket strategy.

### 🗄️ Database & Caching Layer (MongoDB & Redis)
- MongoDB Replica Set for high availability and primary document storage.
- Strategic indexes constructed on frequently queried fields (\`user\`, \`course\`, \`createdAt\`).
- Redis cache layer acting as a write-through store for hot session tokens and leaderboard records.
      `,
      diagram: `
+--------------------------------------------------------------+
|                         Vite React Client                    |
+--------------------------------------------------------------+
                                |  (HTTPS Requests)
                                v
+--------------------------------------------------------------+
|                      Nginx (Reverse Proxy)                   |
+--------------------------------------------------------------+
                                |  (Internal Forwarding)
                                v
+--------------------------------------------------------------+
|                      Node.js / Express Server                |
+--------------------------------------------------------------+
             |                                     |
             v (Caching)                           v (Queries)
+------------------------+           +-------------------------+
|      Redis Cache       |           |   MongoDB Replica Set   |
+------------------------+           +-------------------------+
      `
    },
    '2': {
      title: 'Deep Learning Data Pipeline & Ingestion Architecture',
      content: `
### 📥 Real-Time Data Ingestion
- Live streaming event logs emitted from clients pushed to Apache Kafka broker.
- Ingestion topics partition data based on student session IDs for parallel batch loading.

### 🔄 Stream Processing & ETL Pipeline
- Apache Spark structured streaming jobs parsing telemetry events in real time.
- Standardizes feature parameters (XP gains, quiz attempts, study durations).
- Computes sliding window averages and updates raw storage buckets.

### 🧠 Model Training & Neural Network Topology
- TensorFlow model runs asynchronously, pulling training events from a delta lake.
- Multi-layer Feedforward Neural Net predicting curriculum mastery rates:
  - Input Layer: Normalized feature vectors.
  - Hidden Layers: 3 dense layers (128x64x32 neurons) with ReLU activations.
  - Output Layer: Softmax distribution predicting next recommended learning path node.
      `,
      diagram: `
+------------+       +------------+
| Event Logs | ----> | Kafka Topic|
+------------+       +------------+
                            | (Stream)
                            v
                     +------------+
                     |Spark Streaming|
                     +------------+
                            | (ETL)
                            v
                     +------------+
                     | Delta Lake | <----+ (Periodic Re-eval)
                     +------------+      |
                            |            |
                            v            |
                     +------------+      |
                     | TensorFlow | -----+
                     | ML Model   |
                     +------------+
      `
    },
    '3': {
      title: 'Design System Token & Prototype Lifecycle Architecture',
      content: `
### 🎨 Design Tokens (The Core Constants)
- Centralized JSON storage mapping primitive colors, layout grids, spacing rules, and typography sizes.
- Built-in compilers (Style Dictionary) export platform-specific assets:
  - CSS custom properties (\`index.css\` variables) for Web.
  - JSON objects for iOS/SwiftUI.
  - XML properties for Android.

### 🛠️ Component Blueprint Registry
- Core layout components (cards, forms, buttons) mapped as nested symbols.
- High fidelity prototyping relying on Figma component overrides, responsive layouts, and interactive variants.

### 🔄 State & Transition Micro-interactions
- Transition states modeled using finite state machine frameworks.
- Hover, focus, active, loading, and completed variants mapped to CSS transition properties.
      `,
      diagram: `
+--------------------------------------------------------+
|                 Design Tokens (JSON)                   |
+--------------------------------------------------------+
                           |
            +--------------+--------------+
            v                             v
+-----------------------+     +-----------------------+
|   Style Dictionary    |     |   Figma Component     |
|   Compiler            |     |   Library Sync        |
+-----------------------+     +-----------------------+
            |
    +-------+-------+
    v               v
  [CSS]       [SwiftUI/XML]
      `
    }
  };

  const groupQuizzes = {
    '1': [
      { q: 'Which PM2 command restarts clustered processes gracefully?', a: ['pm2 reload all', 'pm2 restart all', 'pm2 stop all', 'pm2 list'], correct: 0 },
      { q: 'What MongoDB operator adds an element to an array only if it does not already exist?', a: ['$push', '$addToSet', '$set', '$inc'], correct: 1 },
      { q: 'What is the role of Nginx SSL termination?', a: 'Decrypting HTTPS requests at the proxy level and forwarding unencrypted HTTP requests to the backend server to save CPU cycles.', correct: true }
    ],
    '2': [
      { q: 'Which optimizer is commonly preferred for deep neural network training?', a: ['SGD', 'Adam', 'RMSprop', 'Adagrad'], correct: 1 },
      { q: 'What is the main function of the ReLU activation?', a: ['Outputs values between -1 and 1', 'Introduces non-linearity by outputting max(0, x)', 'Calculates binary probability', 'Normalizes batch scale'], correct: 1 }
    ],
    '3': [
      { q: 'What compiler tool generates CSS, XML, and iOS assets from JSON design tokens?', a: ['Style Dictionary', 'Webpack', 'Figma API', 'Babel'], correct: 0 },
      { q: 'What is the correct terminology for spacing, sizing, and color variables in design specs?', a: ['Design Tokens', 'Symbol overrides', 'Layout files', 'Proto layers'], correct: 0 }
    ]
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('/study-sessions/groups');
        setGroups(res.data.groups || []);
      } catch (err) {
        console.error(err);
        setGroups([
          { _id: '1', name: 'MERN Stack Masters', members: 4, topic: 'Web Development' },
          { _id: '2', name: 'Machine Learning Cohort 2', members: 6, topic: 'Data Science' },
          { _id: '3', name: 'Figma Prototypers', members: 3, topic: 'Design' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const handleJoinRoom = (group) => {
    setActiveGroup(group);
    setActiveTab('notes');
    setQuizSubmitted(false);
    setQuizAnswers({});
    
    // Initialize default questions for this room
    if (!qaQuestions[group._id]) {
      setQaQuestions(prev => ({
        ...prev,
        [group._id]: [
          { id: 'q-1', text: `Any guidelines for optimal database index configuration?`, answers: ['Ensure indices match the order of fields in compound queries.'] }
        ]
      }));
    }

    // Initialize default reviews
    if (!groupReviews[group._id]) {
      setGroupReviews(prev => ({
        ...prev,
        [group._id]: [
          { rating: 5, review: 'Fantastic discussion about backend clustering and scaling MongoDB.', author: 'Alice Vance' }
        ]
      }));
    }
  };

  // Collaborative Q&A posting
  const handlePostRoomQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const newQ = {
      id: `q-${Date.now()}`,
      text: newQuestionText,
      answers: []
    };

    setQaQuestions(prev => ({
      ...prev,
      [activeGroup._id]: [newQ, ...(prev[activeGroup._id] || [])]
    }));
    setNewQuestionText('');
  };

  const handlePostRoomAnswer = (qId) => {
    const input = answerInputs[qId];
    if (!input || !input.trim()) return;

    setQaQuestions(prev => {
      const roomQs = prev[activeGroup._id] || [];
      const updated = roomQs.map(q => {
        if (q.id === qId) {
          return { ...q, answers: [...q.answers, input.trim()] };
        }
        return q;
      });
      return { ...prev, [activeGroup._id]: updated };
    });

    setAnswerInputs(prev => ({ ...prev, [qId]: '' }));
  };

  // Group Review posting
  const handlePostReview = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    const newRev = {
      rating: newRating,
      review: newReviewText,
      author: 'You (Student)'
    };

    setGroupReviews(prev => ({
      ...prev,
      [activeGroup._id]: [newRev, ...(prev[activeGroup._id] || [])]
    }));
    setNewReviewText('');
  };

  if (activeGroup) {
    const members = mockMembers[activeGroup._id] || mockMembers['1'];
    const notes = architectureNotes[activeGroup._id] || architectureNotes['1'];
    const quizzes = groupQuizzes[activeGroup._id] || groupQuizzes['1'];
    const questions = qaQuestions[activeGroup._id] || [];
    const reviews = groupReviews[activeGroup._id] || [];

    return (
      <DashboardLayout>
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', background: 'var(--bg-canvas)' }} className="animate-fade-in">
          {/* Left Room Sidebar */}
          <aside style={{
            width: '280px',
            background: 'var(--bg-surface)',
            borderRight: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}>
            {/* Header / Leave */}
            <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border-default)' }}>
              <button 
                onClick={() => setActiveGroup(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: '14px',
                  display: 'block'
                }}
              >
                &lt; BACK TO LIST
              </button>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, lineHeight: 1.3 }}>
                {activeGroup.name}
              </h2>
              <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginTop: '4px' }}>
                Active Session
              </span>
            </div>

            {/* Navigation Tabs */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => setActiveTab('notes')}
                className={`sidebar-link ${activeTab === 'notes' ? 'sidebar-link--active' : ''}`}
                style={{ background: activeTab === 'notes' ? 'rgba(14, 165, 164, 0.05)' : 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}
              >
                📖 Architecture Notes
              </button>
              <button
                onClick={() => setActiveTab('qa')}
                className={`sidebar-link ${activeTab === 'qa' ? 'sidebar-link--active' : ''}`}
                style={{ background: activeTab === 'qa' ? 'rgba(14, 165, 164, 0.05)' : 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}
              >
                💬 Collaborative Q&A
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`sidebar-link ${activeTab === 'quiz' ? 'sidebar-link--active' : ''}`}
                style={{ background: activeTab === 'quiz' ? 'rgba(14, 165, 164, 0.05)' : 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}
              >
                📝 Interactive Quiz
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`sidebar-link ${activeTab === 'reviews' ? 'sidebar-link--active' : ''}`}
                style={{ background: activeTab === 'reviews' ? 'rgba(14, 165, 164, 0.05)' : 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}
              >
                ⭐ Room Reviews
              </button>
            </div>

            {/* Active Members section */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-default)', padding: '20px 16px' }}>
              <h4 className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px 0' }}>
                ACTIVE MEMBERS ({members.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {members.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                    <span 
                      style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        background: m.status === 'Online' ? 'var(--success)' : 'var(--text-muted)',
                        boxShadow: m.status === 'Online' ? '0 0 6px var(--success)' : 'none'
                      }} 
                    />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</span>
                    <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Display Area */}
          <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
            {activeTab === 'notes' && (
              <div className="animate-fade-in-up">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>{notes.title}</h1>
                <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  CORE_ARCHITECTURAL_SCHEMATIC_VIEW
                </p>

                <div className="blueprint-card" style={{ padding: '24px', marginBottom: '24px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', textTransform: 'uppercase', marginBottom: '16px' }}>
                    // ASCII ARCHITECTURE SCHEMATIC
                  </h3>
                  <pre style={{
                    background: 'var(--bg-canvas)',
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    overflowX: 'auto',
                    fontFamily: 'Space Mono, var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--accent-primary)',
                    border: '1px solid var(--border-default)',
                    lineHeight: 1.4
                  }}>
                    {notes.diagram}
                  </pre>
                </div>

                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {/* Process markdown-like headers */}
                  {notes.content.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('###')) {
                      return <h3 key={pIdx} style={{ fontSize: '1.1rem', fontWeight: 700, margin: '20px 0 8px 0', color: 'var(--text-primary)' }}>{paragraph.replace('###', '')}</h3>;
                    }
                    return (
                      <ul key={pIdx} style={{ margin: '0 0 16px 0', paddingLeft: '20px' }}>
                        {paragraph.split('\n- ').filter(Boolean).map((li, lIdx) => (
                          <li key={lIdx} style={{ marginBottom: '6px', color: 'var(--text-secondary)' }}>
                            {li.replace('- ', '')}
                          </li>
                        ))}
                      </ul>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="animate-fade-in-up" style={{ maxWidth: '700px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px' }}>Collaborative Classroom Q&A</h1>
                
                {/* Ask box */}
                <form onSubmit={handlePostRoomQuestion} className="blueprint-card" style={{ padding: '20px', marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 700 }}>Ask a Question to the Room</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="e.g., How does this architecture handle partition recovery?"
                      style={{
                        flex: 1,
                        background: 'var(--bg-canvas)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        padding: '10px 12px',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                      required
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0 20px', fontSize: '0.8125rem' }}>Post</button>
                  </div>
                </form>

                {/* Queue list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {questions.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>NO_LIVE_QUESTIONS_POSTED</p>
                  ) : (
                    questions.map((q) => (
                      <div key={q.id} className="blueprint-card" style={{ padding: '20px' }}>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px 0', fontSize: '0.95rem' }}>
                          ❓ {q.text}
                        </p>

                        {/* Answers */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                          {q.answers.map((ans, aIdx) => (
                            <div key={aIdx} style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-default)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                              💬 {ans}
                            </div>
                          ))}
                        </div>

                        {/* Reply input */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="Add your answer..."
                            value={answerInputs[q.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAnswerInputs(prev => ({ ...prev, [q.id]: val }));
                            }}
                            style={{
                              flex: 1,
                              background: 'var(--bg-canvas)',
                              border: '1px solid var(--border-default)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-primary)',
                              padding: '6px 10px',
                              fontSize: '0.78rem',
                              outline: 'none'
                            }}
                          />
                          <button 
                            onClick={() => handlePostRoomAnswer(q.id)}
                            className="btn-secondary" 
                            style={{ padding: '0 12px', fontSize: '0.75rem' }}
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="animate-fade-in-up" style={{ maxWidth: '600px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Interactive Group Calibration</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '24px' }}>Verify comprehension with the group.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {quizzes.map((item, qIdx) => (
                    <div key={qIdx} className="blueprint-card" style={{ padding: '20px' }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', marginBottom: '12px' }}>
                        {qIdx + 1}. {item.q}
                      </p>
                      
                      {Array.isArray(item.a) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {item.a.map((option, oIdx) => {
                            const isSelected = quizAnswers[qIdx] === oIdx;
                            const isCorrect = item.correct === oIdx;
                            const showResult = quizSubmitted;
                            return (
                              <button
                                key={oIdx}
                                disabled={quizSubmitted}
                                onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                style={{
                                  textAlign: 'left',
                                  padding: '10px 12px',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid',
                                  borderColor: isSelected 
                                    ? 'var(--accent-primary)' 
                                    : showResult && isCorrect 
                                      ? 'var(--success)' 
                                      : 'var(--border-default)',
                                  background: isSelected 
                                    ? 'rgba(14, 165, 164, 0.03)' 
                                    : showResult && isCorrect 
                                      ? 'rgba(34, 197, 94, 0.05)' 
                                      : 'transparent',
                                  color: showResult && isCorrect 
                                    ? 'var(--success)' 
                                    : 'var(--text-primary)',
                                  fontSize: '0.8125rem',
                                  cursor: quizSubmitted ? 'default' : 'pointer',
                                }}
                              >
                                {option} {showResult && isCorrect && '✓'} {showResult && isSelected && !isCorrect && '✗'}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        // Text prompt / description style
                        <textarea
                          disabled={quizSubmitted}
                          placeholder="Type your brief analytical explanation here..."
                          style={{
                            width: '100%',
                            minHeight: '80px',
                            background: 'var(--bg-canvas)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            padding: '10px 12px',
                            fontSize: '0.8125rem',
                            outline: 'none',
                            resize: 'none'
                          }}
                        />
                      )}
                    </div>
                  ))}
                  
                  {!quizSubmitted ? (
                    <button 
                      onClick={() => setQuizSubmitted(true)}
                      className="btn-primary" 
                      style={{ padding: '12px 24px', fontWeight: 700, alignSelf: 'flex-start' }}
                    >
                      Submit Calibration Answers
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span className="font-mono" style={{ color: 'var(--success)', fontSize: '0.875rem', fontWeight: 700 }}>
                        QUIZ_SUBMITTED_SUCCESSFULLY
                      </span>
                      <button 
                        onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}
                        className="btn-secondary" 
                        style={{ padding: '8px 16px', fontSize: '0.75rem' }}
                      >
                        Reset Quiz
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="animate-fade-in-up" style={{ maxWidth: '650px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px' }}>Study Group Reviews</h1>

                {/* Submit Review */}
                <form onSubmit={handlePostReview} className="blueprint-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Leave your feedback</h3>
                  
                  {/* Rating Selector */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RATING:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '1.25rem',
                          cursor: 'pointer',
                          opacity: star <= newRating ? 1 : 0.3
                        }}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>

                  {/* Review Text */}
                  <textarea
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="What did you think of today's group study session?"
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      padding: '10px 12px',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                    required
                  />

                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 20px', fontSize: '0.8125rem' }}>
                    Publish Review
                  </button>
                </form>

                {/* Reviews List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reviews.map((rev, idx) => (
                    <div key={idx} className="blueprint-card" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{rev.author}</span>
                        <span style={{ fontSize: '0.75rem' }}>{'⭐'.repeat(rev.rating)}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{rev.review}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        <div className="notebook-margin" style={{ marginBottom: '32px' }}>
          <h1>Study Groups</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Collaborate in small learning circles with automated progress synchronizations.
          </p>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CONNECTING_GROUP_REGISTRY...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {groups.map((group) => (
              <div key={group._id} className="blueprint-card animate-fade-in-up" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{group.topic}</span>
                  <h3 style={{ margin: '4px 0 8px' }}>{group.name}</h3>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
                    {mockMembers[group._id]?.length || group.members} active members
                  </span>
                </div>
                <button 
                  onClick={() => handleJoinRoom(group)}
                  className="btn-primary" 
                  style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.8125rem' }}
                >
                  Join Group Room
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
