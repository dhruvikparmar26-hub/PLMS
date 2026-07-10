import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/bookmarks');
      setBookmarks(res.data.bookmarks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await api.delete(`/bookmarks/${bookmarkId}`);
      fetchBookmarks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        <div className="notebook-margin" style={{ marginBottom: '32px' }}>
          <h1>My Bookmarks</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Bookmarked lesson coordinates saved for rapid access.
          </p>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>RETRIEVING_BOOKMARKS...</div>
        ) : bookmarks.length === 0 ? (
          <div className="blueprint-card" style={{ padding: '40px', textAlign: 'center', borderStyle: 'dashed' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No bookmarks yet. Bookmark lessons to save them here.</p>
            <Link to="/courses" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px', textDecoration: 'none' }}>
              Browse Courses
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookmarks.map((b) => (
              <div key={b._id} className="blueprint-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--accent-primary)' }}>
                    {b.course?.title}
                  </span>
                  <h3 style={{ margin: '4px 0 8px' }}>
                    <Link to={`/lessons/${b.lesson?._id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {b.lesson?.title}
                    </Link>
                  </h3>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    Bookmarked on {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button onClick={() => handleRemoveBookmark(b._id)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8125rem', color: 'var(--danger)', borderColor: 'rgba(232, 116, 92, 0.2)' }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
