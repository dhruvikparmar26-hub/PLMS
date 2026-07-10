import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { getLabel } from '../utils/labelMap';

export default function LessonQASection({ lessonId, courseId }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [type, setType] = useState('question');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/qa/${courseId}`, { params: { lessonId } });
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchPosts();
  }, [courseId, lessonId]);

  const handlePost = async () => {
    if (!body.trim()) return;
    try {
      setSubmitting(true);
      setError('');
      await api.post(`/qa/${courseId}`, { body, type, lessonId });
      setBody('');
      setType('question');
      fetchPosts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (postId) => {
    if (!replyBody.trim()) return;
    try {
      setSubmitting(true);
      await api.post(`/qa/${courseId}/posts/${postId}/reply`, { body: replyBody });
      setReplyBody('');
      setReplyingTo(null);
      fetchPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (postId) => {
    try {
      await api.patch(`/qa/posts/${postId}/upvote`);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (postId) => {
    try {
      await api.patch(`/qa/posts/${postId}/resolve`);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const typeColor = { question: 'var(--accent-primary)', discussion: 'var(--accent-secondary)', announcement: 'var(--success)' };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0, borderBottom: '1px solid var(--border-default)', paddingBottom: '8px' }}>
        // Q&amp;A &amp; DISCUSSION
      </h2>

      {/* Post composer */}
      <div className="blueprint-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['question', 'discussion'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
                padding: '3px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                background: type === t ? 'rgba(0,240,255,0.08)' : 'transparent',
                border: `1px solid ${type === t ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                color: type === t ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{error}</p>}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Ask a question or start a discussion..."
          rows={3}
          style={{
            background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '10px',
            fontFamily: 'var(--font-body)', fontSize: '0.875rem', resize: 'vertical',
          }}
        />
        <button
          onClick={handlePost}
          disabled={submitting || !body.trim()}
          className="btn-primary"
          style={{ alignSelf: 'flex-end', fontSize: '0.8rem', padding: '6px 18px' }}
        >
          {submitting ? 'POSTING...' : 'Post'}
        </button>
      </div>

      {/* Posts list */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{getLabel('LOADING_THREADS')}</div>
      ) : posts.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>
          No posts yet. Be the first to ask!
        </div>
      ) : (
        posts.map((post) => (
          <div key={post._id} className="blueprint-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Post header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
                  color: typeColor[post.type] || 'var(--accent-primary)',
                  border: `1px solid ${typeColor[post.type] || 'var(--accent-primary)'}`,
                  padding: '1px 6px', borderRadius: '3px',
                }}>
                  {post.type?.toUpperCase()}
                </span>
                {post.isPinned && <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)' }}>📌 PINNED</span>}
                {post.isResolved && <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>✅ RESOLVED</span>}
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {post.author?.name}
                  {post.author?.role === 'instructor' && <span style={{ color: 'var(--accent-secondary)', fontSize: '0.65rem', marginLeft: '4px', fontFamily: 'var(--font-mono)' }}>[INSTRUCTOR]</span>}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Post body */}
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{post.body}</p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={() => handleUpvote(post._id)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                ▲ {post.upvotes?.length || 0}
              </button>
              <button
                onClick={() => setReplyingTo(replyingTo === post._id ? null : post._id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}
              >
                Reply ({post.replies?.length || 0})
              </button>
              {(post.author?._id === user?._id || ['instructor', 'admin'].includes(user?.role)) && !post.isResolved && (
                <button
                  onClick={() => handleResolve(post._id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--success)' }}
                >
                  Mark Resolved
                </button>
              )}
            </div>

            {/* Replies */}
            {post.replies?.length > 0 && (
              <div style={{ borderLeft: '2px solid var(--border-default)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {post.replies.map((reply, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {reply.author?.name}
                        {reply.isInstructorReply && <span style={{ color: 'var(--accent-secondary)', fontSize: '0.65rem', marginLeft: '4px', fontFamily: 'var(--font-mono)' }}>[INSTRUCTOR]</span>}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>{reply.body}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply form */}
            {replyingTo === post._id && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  style={{
                    flex: 1, background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '8px',
                    fontFamily: 'var(--font-body)', fontSize: '0.875rem', resize: 'vertical',
                  }}
                />
                <button
                  onClick={() => handleReply(post._id)}
                  disabled={submitting || !replyBody.trim()}
                  className="btn-primary"
                  style={{ fontSize: '0.75rem', padding: '6px 14px', alignSelf: 'flex-start' }}
                >
                  Post
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </section>
  );
}
