import { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api';

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/qa');
      setPosts(res.data.posts || res.data.data || []);
    } catch (err) {
      console.error(err);
      setPosts([
        { _id: '1', title: 'Why does useEffect call twice in React 18?', body: 'I noticed my console logs are appearing twice when mounting components. Any solutions?', author: { name: 'Alice Smith' }, answers: [ { body: 'This is due to StrictMode in development.', author: { name: 'Bob Jones' } } ], createdAt: new Date() },
        { _id: '2', title: 'How does BullMQ handle job failures?', body: 'Im trying to configure retries with exponential backoff on BullMQ.', author: { name: 'Charlie Dave' }, answers: [], createdAt: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;
    try {
      await api.post('/qa', { title: newTitle, content: newBody });
      setNewTitle('');
      setNewBody('');
      setCreating(false);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div className="notebook-margin">
            <h1>Community Forum</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
              Interact, consult, and collaborate with peer researchers and mentors.
            </p>
          </div>
          <button onClick={() => setCreating(!creating)} className="btn-primary">
            {creating ? 'Cancel' : 'Ask Question'}
          </button>
        </div>

        {creating && (
          <form onSubmit={handlePostQuestion} className="blueprint-card animate-fade-in-up" style={{ padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Submit New Question</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>QUESTION TITLE</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="e.g. How does Redux middleware work?"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>QUESTION BODY</label>
                <textarea 
                  className="input-field" 
                  value={newBody} 
                  onChange={(e) => setNewBody(e.target.value)} 
                  placeholder="Describe your issue or conceptual query..."
                  style={{ minHeight: '120px' }}
                />
              </div>
              <button type="submit" className="btn-primary">Publish Question</button>
            </div>
          </form>
        )}

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CONNECTING_FORUM_SOCKET...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts.map((post) => (
              <div key={post._id} className="blueprint-card" style={{ padding: '20px' }}>
                <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--accent-primary)' }}>
                  Asked by {post.author?.name || 'Anonymous'} · {new Date(post.createdAt).toLocaleDateString()}
                </span>
                <h3 style={{ margin: '8px 0' }}>{post.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{post.body || post.content}</p>
                
                <div style={{ borderTop: '1px solid var(--border-default)', marginTop: '16px', paddingTop: '12px' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {post.answers?.length || 0} Replies
                  </span>
                  {post.answers?.slice(0, 1).map((ans, idx) => (
                    <div key={idx} style={{ marginTop: '8px', background: 'var(--bg-elevated)', padding: '10px', borderRadius: '4px' }}>
                      <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--success)' }}>
                        Replied by {ans.author?.name || 'User'}
                      </span>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '4px' }}>{ans.body}</p>
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
