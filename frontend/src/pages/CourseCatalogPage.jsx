import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import CourseRating from '../components/CourseRating';
import { getLabel } from '../utils/labelMap';
import DashboardLayout from '../components/layout/DashboardLayout';

const CourseCatalogPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch all quizzes on load for local filtering during search
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get('/quizzes');
        setAllQuizzes(res.data.quizzes || []);
      } catch (err) {
        console.error(err);
        setAllQuizzes([
          { _id: '1', title: 'React for Beginners: Build Dynamic Web Apps', category: 'Web Development', questionsCount: 5, difficulty: 'beginner' },
          { _id: '2', title: 'Advanced Node.js and Microservices Architecture', category: 'Web Development', questionsCount: 5, difficulty: 'advanced' },
          { _id: '3', title: 'Introduction to Python and Data Science', category: 'Data Science', questionsCount: 5, difficulty: 'beginner' },
          { _id: '4', title: 'Modern UI/UX Design Fundamentals', category: 'Design', questionsCount: 5, difficulty: 'beginner' },
          { _id: '5', title: 'Growth Marketing and SEO Strategy', category: 'Marketing', questionsCount: 5, difficulty: 'intermediate' },
          { _id: '6', title: 'Mastering Machine Learning with TensorFlow', category: 'Data Science', questionsCount: 5, difficulty: 'advanced' },
        ]);
      }
    };
    fetchQuizzes();
  }, []);

  // 22 Categories — 12 Technical + 10 Non-Technical
  const categories = [
    // Technical
    'Web Development', 'Data Science', 'Mobile Development', 'Cloud Computing',
    'Cybersecurity', 'DevOps', 'Artificial Intelligence', 'Blockchain',
    'Database Management', 'Game Development', 'Embedded Systems', 'Networking',
    // Non-Technical
    'Design', 'Marketing', 'Business', 'Finance',
    'Communication', 'Psychology', 'Photography', 'Music Production',
    'Writing', 'Health & Fitness',
  ];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError('');
        
        const params = {
          page,
          limit: 15,
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
    }, 300);

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

  const filteredQuizzes = allQuizzes.filter((quiz) => {
    if (!search) return false;
    const matchesSearch = quiz.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || quiz.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header section */}
            <div className="notebook-margin">
              <h1>
                Explore <span style={{ color: 'var(--accent-primary)' }}>Courses</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                Browse {categories.length}+ categories — from coding to creativity, find the perfect course for you.
              </p>
            </div>

            {/* Filters panel */}
            <div className="blueprint-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {/* Search — Simple search icon + placeholder */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="input-field"
                    style={{ paddingLeft: '40px' }}
                  />
                  <svg
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '18px', height: '18px' }}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>

                {/* Category Filter */}
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  className="input-field"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
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
                    <option key={diff} value={diff} style={{ textTransform: 'capitalize' }}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
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
                  Try adjusting your filters or search terms.
                </p>
                <button onClick={clearFilters} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '8px 20px' }}>
                  Reset Active Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* ============ 3-Per-Row Course Grid ============ */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '20px',
                }}>
                  {courses.map((course) => {
                    const diff = getDifficultyColor(course.difficulty);
                    return (
                      <div key={course._id}
                           className="blueprint-card"
                           style={{
                             padding: 0,
                             display: 'flex',
                             flexDirection: 'column',
                             justifyContent: 'space-between',
                             overflow: 'hidden',
                             borderRadius: 'var(--radius-lg)',
                             transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                             cursor: 'pointer',
                           }}
                           onMouseEnter={(e) => {
                             e.currentTarget.style.transform = 'translateY(-4px)';
                             e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
                           }}
                           onMouseLeave={(e) => {
                             e.currentTarget.style.transform = 'translateY(0)';
                             e.currentTarget.style.boxShadow = 'none';
                           }}
                      >
                        <div>
                          {/* Thumbnail */}
                          <div style={{
                            position: 'relative', aspectRatio: '3/2', width: '100%',
                            background: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-default)',
                            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                loading="lazy"
                              />
                            ) : (
                              <div className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                                [{getLabel('WIREFRAME_PREVIEW')}]
                              </div>
                            )}
                            {/* Category badge */}
                            <div style={{
                              position: 'absolute', top: '10px', left: '10px',
                              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                              padding: '3px 8px', borderRadius: 'var(--radius-sm)',
                              fontSize: '0.5625rem', fontFamily: 'var(--font-mono)', fontWeight: 700,
                              color: 'var(--accent-primary)', letterSpacing: '0.05em',
                            }}>
                              {course.category?.toUpperCase()}
                            </div>
                          </div>

                          {/* Info Block */}
                          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span className="font-mono" style={{
                                fontSize: '0.5625rem', fontWeight: 700, padding: '2px 6px',
                                border: `1px solid ${diff.border}`, borderRadius: 'var(--radius-sm)',
                                color: diff.color, textTransform: 'uppercase',
                              }}>
                                {course.difficulty}
                              </span>
                            </div>

                            <h3 style={{
                              fontSize: '0.875rem', fontWeight: 700, margin: 0,
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                              overflow: 'hidden', lineHeight: 1.4,
                            }}>
                              {course.title}
                            </h3>

                            <p style={{
                              fontSize: '0.75rem', color: 'var(--text-secondary)',
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                              overflow: 'hidden', lineHeight: 1.5, margin: 0,
                            }}>
                              {course.description}
                            </p>
                          </div>
                        </div>

                        {/* Footer */}
                        <div style={{
                          padding: '12px 16px', borderTop: '1px solid var(--border-default)',
                          background: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '8px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ minWidth: 0 }}>
                              <span className="font-mono" style={{ fontSize: '0.5rem', color: 'var(--text-muted)', display: 'block' }}>{getLabel('INSTRUCTOR_REF')}</span>
                              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {course.instructor?.name || 'System'}
                              </span>
                            </div>
                            <Link
                              to={`/courses/${course._id}`}
                              className="btn-primary"
                              style={{
                                fontSize: '0.6875rem', padding: '6px 14px', whiteSpace: 'nowrap',
                                textDecoration: 'none', display: 'inline-block',
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

                {/* Pagination Controls */}
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

            {/* Matching Calibration Quizzes Section (only shown when search is active) */}
            {search && filteredQuizzes.length > 0 && (
              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-default)', paddingTop: '24px' }}>
                <h2 className="notebook-margin" style={{ marginBottom: '16px', fontSize: '1.25rem' }}>
                  Matching Calibration Quizzes
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredQuizzes.map((quiz) => (
                    <div key={quiz._id} className="blueprint-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{quiz.title}</h4>
                        <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          {quiz.category} · {quiz.questionsCount || 5} Questions · {quiz.difficulty?.toUpperCase()}
                        </span>
                      </div>
                      <Link to={`/quizzes/${quiz._id}`} className="btn-primary" style={{ textDecoration: 'none', padding: '6px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        Attempt Quiz
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
    </DashboardLayout>
  );
};

export default CourseCatalogPage;
