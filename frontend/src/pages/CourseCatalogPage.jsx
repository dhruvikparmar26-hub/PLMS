import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import CourseRating from '../components/CourseRating';
import { getLabel } from '../utils/labelMap';

const CourseCatalogPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Categories list based on seed data
  const categories = ['Web Development', 'Data Science', 'Design', 'Marketing'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError('');
        
        const params = {
          page,
          limit: 6,
        };
        if (search) params.search = search;
        if (category) params.category = category;
        if (difficulty) params.difficulty = difficulty;

        const res = await api.get('/courses', { params });
        setCourses(res.data.courses || []);
        setTotalPages(res.data.pages || 1);
      } catch (err) {
        setError('Failed to fetch courses. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchCourses();
    }, 300); // debounce API calls for search input

    return () => clearTimeout(delayDebounce);
  }, [search, category, difficulty, page]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'beginner':
        return { color: 'var(--success)', border: 'rgba(52, 213, 153, 0.2)' };
      case 'intermediate':
        return { color: 'var(--accent-secondary)', border: 'rgba(255, 160, 58, 0.2)' };
      case 'advanced':
        return { color: 'var(--danger)', border: 'rgba(255, 77, 106, 0.2)' };
      default:
        return { color: 'var(--text-muted)', border: 'var(--border-default)' };
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setDifficulty('');
    setPage(1);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-canvas)' }}>
      {/* ============ Sidebar with notebook spine ============ */}
      <aside className="w-60 hidden md:flex flex-col justify-between sidebar-spine"
             style={{ background: 'var(--bg-surface)', padding: '24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <span className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '-0.02em' }}>
              Momentum
            </span>
            <span className="font-mono" style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', display: 'block', letterSpacing: '0.1em' }}>
              EST. 2026
            </span>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { label: 'Overview', path: '/dashboard' },
              { label: 'Schedule', path: '/analytics' },
              { label: 'Library', path: '/courses', active: true },
              { label: 'Certificates', path: '/learning-log' },
              { label: 'Support', path: '/onboarding' },
            ].map((item) => (
              <Link key={item.path} to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem', fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  background: item.active ? 'rgba(242, 176, 86, 0.06)' : 'transparent',
                  color: item.active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  border: item.active ? '1px solid rgba(242, 176, 86, 0.15)' : '1px solid transparent',
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                }}>
                {item.label}
              </Link>
            ))}
            {(user?.role === 'instructor' || user?.role === 'admin') && (
              <Link to="/instructor"
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem', fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-secondary)',
                  border: '1px solid transparent',
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                }}>
                Instructor Hub
              </Link>
            )}
          </nav>

          {/* New Study Session CTA */}
          <button
            onClick={() => navigate('/courses')}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.8125rem',
              padding: '10px 16px',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(242, 176, 86, 0.15)'
            }}
          >
            + New Study Session
          </button>
        </div>

        {/* User card */}
        <div style={{
          padding: '12px', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--bg-canvas)', fontWeight: 700, fontSize: '0.8125rem',
            fontFamily: 'var(--font-display)',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
            <p className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{user?.role}</p>
          </div>
        </div>
      </aside>

      {/* ============ Main Content ============ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: '56px', borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-surface)', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 24px', flexShrink: 0,
        }}>
          <span className="tech-header">CATALOG / {getLabel('COURSES_INDEX')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="font-mono md:hidden" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>PLMS</span>
            <button onClick={handleLogout} className="btn-secondary"
                    style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
              Sign out
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header section with notebook margin styling — outside grid */}
            <div className="notebook-margin">
              <h1>
                Explore <span style={{ color: 'var(--accent-primary)' }}>Courses</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                Self-paced blueprint modules designed to optimize your skill acquisition parameters.
              </p>
            </div>

            {/* Filters panel — outside grid */}
            <div className="blueprint-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {/* Search */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="QUERY: TITLE OR KEYWORDS..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="input-field"
                    style={{ paddingLeft: '36px' }}
                  />
                  <span className="font-mono" style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    &gt;
                  </span>
                </div>

                {/* Category Filter */}
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  className="input-field"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} style={{ textTransform: 'uppercase' }}>{cat}</option>
                  ))}
                </select>

                {/* Difficulty Filter */}
                <select
                  value={difficulty}
                  onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
                  className="input-field"
                >
                  <option value="">All Levels</option>
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff} style={{ textTransform: 'uppercase' }}>{diff}</option>
                  ))}
                </select>
              </div>

              {/* Clear filters link */}
              {(search || category || difficulty) && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={clearFilters}
                    className="font-mono"
                    style={{
                      background: 'none', border: 'none', color: 'var(--danger)',
                      fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      padding: 0, fontWeight: 700
                    }}
                  >
                    {getLabel('RESET_FILTERS')} [✕]
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div style={{
                padding: '12px 16px', background: 'rgba(255,77,106,0.08)',
                border: '1px solid rgba(255,77,106,0.25)', borderRadius: 'var(--radius-md)',
                color: 'var(--danger)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)',
              }}>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: '16px', textAlign: 'center' }}>
                <div style={{
                  width: '32px', height: '32px', border: '3px solid var(--accent-primary)',
                  borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto',
                  animation: 'spin 1s linear infinite'
                }} />
                <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{getLabel('FETCHING_MODULE_MANIFESTS')}</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="bento-cell bento-cell--empty" style={{ minHeight: '200px', borderStyle: 'dashed' }}>
                <span className="font-mono" style={{ fontSize: '1.5rem', display: 'block', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  [{getLabel('EMPTY_SET')}]
                </span>
                <p className="font-display" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No courses matching query</p>
                <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>
                  Parameters did not return matches in the active database registry.
                </p>
                <button onClick={clearFilters} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '8px 20px' }}>
                  Reset Active Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* ============ BENTO GRID — Course Cards ============ */}
                <div className="bento-grid" style={{ gridAutoRows: 'auto' }}>
                  {courses.map((course) => {
                    const diff = getDifficultyColor(course.difficulty);
                    return (
                      <div key={course._id} className="bento-cell bento-2x1"
                           style={{ padding: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          {/* Thumbnail / Technical Wireframe Block */}
                          <div style={{
                            position: 'relative', aspectRatio: '16/9', width: '100%',
                            background: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-default)',
                            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                          }}>
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                              />
                            ) : (
                              <div className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                                [{getLabel('WIREFRAME_PREVIEW')}]
                              </div>
                            )}
                            <div style={{
                              position: 'absolute', top: '12px', left: '12px',
                              background: 'var(--bg-surface)', padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)',
                              fontSize: '0.625rem', fontFamily: 'var(--font-mono)', fontWeight: 750,
                              color: 'var(--accent-primary)'
                            }}>
                              {course.category?.toUpperCase()}
                            </div>
                          </div>

                          {/* Info Block */}
                          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span className="font-mono" style={{
                                fontSize: '0.625rem', fontWeight: 700, padding: '2px 8px',
                                border: `1px solid ${diff.border}`, borderRadius: 'var(--radius-sm)',
                                color: diff.color
                              }}>
                                {course.difficulty?.toUpperCase()}
                              </span>
                            </div>

                            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                              {course.title}
                            </h3>

                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                              {course.description}
                            </p>
                          </div>
                        </div>

                        {/* Footer Info */}
                        <div style={{
                          padding: '16px 20px', borderTop: '1px solid var(--border-default)',
                          background: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '12px',
                          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                            <div style={{ minWidth: 0 }}>
                              <span className="font-mono" style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', display: 'block' }}>{getLabel('INSTRUCTOR_REF')}</span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {course.instructor?.name || 'System'}
                              </span>
                            </div>
                            <Link
                              to={`/courses/${course._id}`}
                              className="btn-primary"
                              style={{
                                fontSize: '0.75rem', padding: '8px 16px', whiteSpace: 'nowrap',
                                textDecoration: 'none', display: 'inline-block'
                              }}
                            >
                              {getLabel('OPEN_SPEC')}
                            </Link>
                          </div>
                          <CourseRating courseId={course._id} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls — outside grid */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '8px 16px' }}
                    >
                      &lt; PREV
                    </button>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      PAGE <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{page}</span> OF <span style={{ color: 'var(--text-primary)' }}>{totalPages}</span>
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '8px 16px' }}
                    >
                      NEXT &gt;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseCatalogPage;
