import { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api';

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [creating, setCreating] = useState(false);

  // Fallback initial queue posts if DB yields nothing
  const fallbackPosts = [
    { 
      _id: 'fallback-1', 
      title: 'Why does useEffect call twice in React 18?', 
      body: 'I noticed my console logs are appearing twice when mounting components. Any solutions?', 
      author: { name: 'Alice Smith' }, 
      answers: [ { body: 'This is due to StrictMode in development.', author: { name: 'Bob Jones' } } ], 
      createdAt: new Date() 
    },
    { 
      _id: 'fallback-2', 
      title: 'How does BullMQ handle job failures?', 
      body: 'Im trying to configure retries with exponential backoff on BullMQ.', 
      author: { name: 'Charlie Dave' }, 
      answers: [], 
      createdAt: new Date() 
    },
  ];

  const fetchPosts = async (courseId) => {
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await api.get(`/qa/${courseId}`);
      // If we succeed, populate posts
      const fetched = res.data.posts || res.data.data?.posts || [];
      setPosts(fetched.length > 0 ? fetched : fallbackPosts);
    } catch (err) {
      console.error('Error fetching course Q&A posts, using fallback:', err);
      setPosts(fallbackPosts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      try {
        const res = await api.get('/courses');
        const courseList = res.data.courses || [];
        setCourses(courseList);
        if (courseList.length > 0) {
          setSelectedCourseId(courseList[0]._id);
        } else {
          // If no courses exist, load posts directly with fallback
          setPosts(fallbackPosts);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error listing courses:', err);
        setPosts(fallbackPosts);
        setLoading(false);
      }
    };
    initPage();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchPosts(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    const newLocalPost = {
      _id: `local-${Date.now()}`,
      title: newTitle,
      body: newBody,
      author: { name: 'You (Student)' },
      answers: [],
      createdAt: new Date()
    };

    try {
      if (selectedCourseId) {
        // Send to backend course Q&A endpoint with correct 'body' parameter mapping
        await api.post(`/qa/${selectedCourseId}`, { 
          title: newTitle, 
          body: newBody, 
          type: 'question' 
        });
        
        // Refresh from DB
        await fetchPosts(selectedCourseId);
      } else {
        // Queue locally on fallback/no course
        setPosts((prev) => [newLocalPost, ...prev]);
      }
    } catch (err) {
      console.error('Publish API call failed, adding to local queue:', err);
      // fallback: push to local queue so user sees it instantly
      setPosts((prev) => [newLocalPost, ...prev]);
    } finally {
      setNewTitle('');
      setNewBody('');
      setCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div className="notebook-margin">
            <h1>Community Forum</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
              Interact, consult, and collaborate with peer researchers and mentors.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {courses.length > 0 && (
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.75rem',
                  padding: '8px 12px',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                }}
              >
                {courses.map(c => (
                  <option key={c._id} value={c._id}>📚 {c.title}</option>
                ))}
              </select>
            )}
            
            <button onClick={() => setCreating(!creating)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8125rem' }}>
              {creating ? 'Cancel' : 'Ask Question'}
            </button>
          </div>
        </div>

        {creating && (
          <form onSubmit={handlePostQuestion} className="blueprint-card animate-fade-in-up" style={{ padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 700 }}>Submit New Question</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>QUESTION TITLE</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="e.g. How does Redux middleware work?"
                  style={{
                    width: '100%',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    padding: '10px 12px',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  required
                />
              </div>
              <div>
                <label className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>QUESTION BODY</label>
                <textarea 
                  className="input-field" 
                  value={newBody} 
                  onChange={(e) => setNewBody(e.target.value)} 
                  placeholder="Describe your issue or conceptual query..."
                  style={{ 
                    minHeight: '120px',
                    width: '100%',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    padding: '10px 12px',
                    fontSize: '0.875rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px', fontSize: '0.8125rem', fontWeight: 700 }}>
                Publish Question
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CONNECTING_FORUM_SOCKET...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts.map((post) => (
              <div key={post._id} className="blueprint-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Asked by {post.author?.name || 'Anonymous'} · {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 700 }}>{post.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>{post.body || post.content}</p>
                
                <div style={{ borderTop: '1px solid var(--border-default)', marginTop: '16px', paddingTop: '12px' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {post.answers?.length || 0} Replies
                  </span>
                  {post.answers?.slice(0, 3).map((ans, idx) => (
                    <div key={idx} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-default)', padding: '10px 14px', borderRadius: '4px' }}>
                      <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--success)' }}>
                        Replied by {ans.author?.name || 'User'}
                      </span>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '4px', margin: 0, lineHeight: 1.4 }}>{ans.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
