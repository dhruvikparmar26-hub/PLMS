import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const CourseEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Course metadata fields
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    thumbnail: '',
  });

  // Module state
  const [newModuleName, setNewModuleName] = useState('');

  // Lesson Modal / Form state
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    _id: '', // Empty if creating
    title: '',
    content: '',
    videoUrl: '',
    order: 0,
    moduleIndex: 0,
  });

  // Quiz Form state
  const [quiz, setQuiz] = useState({
    title: '',
    passingScore: 70,
    questions: [],
  });

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch public detail which includes modules and populated lessons
      const courseRes = await api.get(`/courses/${id}`);
      if (courseRes.data.success) {
        const c = courseRes.data.course;
        setCourse(c);
        setMetadata({
          title: c.title,
          description: c.description,
          category: c.category,
          difficulty: c.difficulty,
          thumbnail: c.thumbnail || '',
        });

        // Fetch quiz for this course
        try {
          const quizDetailRes = await api.get(`/instructor/courses/${id}/quiz`);
          if (quizDetailRes.data.success && quizDetailRes.data.quiz) {
            setQuiz(quizDetailRes.data.quiz);
          } else {
            // No quiz found, set default
            setQuiz({
              title: `${c.title} Final Assessment`,
              passingScore: 70,
              questions: [],
            });
          }
        } catch {
          // If fetch fails or quiz doesn't exist, set empty
          setQuiz({
            title: `${c.title} Final Assessment`,
            passingScore: 70,
            questions: [],
          });
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const handleUpdateMetadata = async (e) => {
    e.preventDefault();
    try {
      setSuccess('');
      setError('');
      const res = await api.put(`/instructor/courses/${id}`, metadata);
      if (res.data.success) {
        setSuccess('Course metadata updated successfully!');
        setCourse(res.data.course);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update course metadata.');
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;

    try {
      setError('');
      setSuccess('');
      const updatedModules = [...(course.modules || []), { title: newModuleName, lessons: [] }];
      const res = await api.put(`/instructor/courses/${id}`, {
        modules: updatedModules,
      });

      if (res.data.success) {
        setCourse(res.data.course);
        setNewModuleName('');
        setSuccess('Module added successfully!');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to add module.');
    }
  };

  const handleOpenLessonModal = (moduleIdx, lesson = null) => {
    if (lesson) {
      setLessonForm({
        _id: lesson._id,
        title: lesson.title,
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        order: lesson.order || 0,
        moduleIndex: moduleIdx,
      });
    } else {
      setLessonForm({
        _id: '',
        title: '',
        content: '',
        videoUrl: '',
        order: course.modules[moduleIdx].lessons.length,
        moduleIndex: moduleIdx,
      });
    }
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      if (lessonForm._id) {
        // Edit Lesson
        const res = await api.put(`/instructor/lessons/${lessonForm._id}`, {
          title: lessonForm.title,
          content: lessonForm.content,
          videoUrl: lessonForm.videoUrl,
          order: lessonForm.order,
        });
        if (res.data.success) {
          setSuccess('Lesson updated successfully!');
        }
      } else {
        // Create Lesson
        const res = await api.post(
          `/instructor/courses/${id}/modules/${lessonForm.moduleIndex}/lessons`,
          {
            title: lessonForm.title,
            content: lessonForm.content,
            videoUrl: lessonForm.videoUrl,
            order: lessonForm.order,
          }
        );
        if (res.data.success) {
          setSuccess('Lesson created successfully!');
        }
      }
      setShowLessonModal(false);
      fetchCourseDetails();
    } catch (err) {
      console.error(err);
      setError('Failed to save lesson.');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      setError('');
      setSuccess('');
      const res = await api.delete(`/instructor/lessons/${lessonId}`);
      if (res.data.success) {
        setSuccess('Lesson deleted successfully.');
        fetchCourseDetails();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete lesson.');
    }
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      const res = await api.post(`/instructor/courses/${id}/quiz`, quiz);
      if (res.data.success) {
        setSuccess('Quiz saved successfully!');
        fetchCourseDetails();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save quiz.');
    }
  };

  const handleAddQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          questionText: '',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ],
          points: 1,
        },
      ],
    });
  };

  const handleRemoveQuestion = (idx) => {
    const questions = [...quiz.questions];
    questions.splice(idx, 1);
    setQuiz({ ...quiz, questions });
  };

  const handleQuestionTextChange = (qIdx, text) => {
    const questions = [...quiz.questions];
    questions[qIdx].questionText = text;
    setQuiz({ ...quiz, questions });
  };

  const handleOptionTextChange = (qIdx, optIdx, text) => {
    const questions = [...quiz.questions];
    questions[qIdx].options[optIdx].text = text;
    setQuiz({ ...quiz, questions });
  };

  const handleOptionCorrectChange = (qIdx, optIdx, isChecked) => {
    const questions = [...quiz.questions];
    questions[qIdx].options.forEach((opt, idx) => {
      opt.isCorrect = idx === optIdx ? isChecked : false;
    });
    setQuiz({ ...quiz, questions });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-3">
        <div style={{
          width: '32px', height: '32px', border: '3px solid var(--accent-primary)',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>LOADING_COURSE_DESIGNER...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-canvas)', padding: '32px 24px' }}>
      <div className="animate-fade-in-up" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)', paddingBottom: '20px' }}>
          <div>
            <button
              onClick={() => navigate('/instructor')}
              className="font-mono"
              style={{
                fontSize: '0.6875rem', color: 'var(--text-muted)',
                textDecoration: 'none', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0
              }}
            >
              &lt; RETURN_TO_ANALYTICS
            </button>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '6px 0 0 0' }}>
              Design Course: <span style={{ color: 'var(--accent-primary)' }}>{course?.title}</span>
            </h1>
          </div>
          <button
            onClick={() => navigate(`/courses/${id}`)}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '8px 16px' }}
          >
            PREVIEW_SPEC
          </button>
        </div>

        {success && (
          <div style={{
            padding: '12px 16px', background: 'rgba(52,211,153,0.08)',
            border: '1px solid rgba(52,211,153,0.25)', borderRadius: 'var(--radius-md)',
            color: 'var(--success)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)',
          }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{
            padding: '12px 16px', background: 'rgba(255,77,106,0.08)',
            border: '1px solid rgba(255,77,106,0.25)', borderRadius: 'var(--radius-md)',
            color: 'var(--danger)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)',
          }}>
            {error}
          </div>
        )}

        {/* Grid: Left column (Metadata, Modules & Lessons), Right column (Quizzes) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '2fr 1fr', gap: '32px' }} className="grid lg:grid-cols-3">
          
          {/* Left Column: Metadata + Modules */}
          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Metadata Form */}
            <section className="blueprint-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 className="font-mono" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
                // COURSE_SPECIFICATION_METADATA
              </h2>

              <form onSubmit={handleUpdateMetadata} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>COURSE TITLE</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={metadata.title}
                      onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>DESCRIPTION</label>
                    <textarea
                      required
                      rows="3"
                      className="input-field"
                      value={metadata.description}
                      onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>CATEGORY</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={metadata.category}
                      onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>DIFFICULTY</label>
                    <select
                      className="input-field"
                      value={metadata.difficulty}
                      onChange={(e) => setMetadata({ ...metadata, difficulty: e.target.value })}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>THUMBNAIL URL</label>
                    <input
                      type="text"
                      className="input-field"
                      value={metadata.thumbnail}
                      onChange={(e) => setMetadata({ ...metadata, thumbnail: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <button type="submit" className="btn-primary" style={{ fontSize: '0.8125rem', padding: '10px 20px' }}>
                    SAVE_METADATA
                  </button>
                </div>
              </form>
            </section>

            {/* Modules and Lessons */}
            <section className="blueprint-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 className="font-mono" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
                // CURRICULUM_MODULE_INDEX
              </h2>

              {/* List Modules */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {course.modules?.map((module, modIdx) => (
                  <div key={module._id || modIdx} className="blueprint-card" style={{ background: 'var(--bg-canvas)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                      display: 'flex', justifycontent: 'space-between', alignItems: 'center',
                      borderBottom: '1px solid var(--border-default)', paddingBottom: '10px'
                    }} className="flex justify-between items-center">
                      <span className="font-display" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        Module {modIdx + 1}: {module.title}
                      </span>
                      <button
                        onClick={() => handleOpenLessonModal(modIdx)}
                        className="font-mono"
                        style={{
                          background: 'none', border: 'none', color: 'var(--accent-primary)',
                          fontSize: '0.6875rem', fontWeight: 700, cursor: 'pointer', padding: 0
                        }}
                      >
                        [+ ADD_LESSON]
                      </button>
                    </div>

                    {/* Lessons list inside Module */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {module.lessons?.length === 0 ? (
                        <p className="font-mono text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>No lessons in this module</p>
                      ) : (
                        module.lessons?.map((lesson) => (
                          <div
                            key={lesson._id}
                            style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '10px 14px', background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-default)', fontSize: '0.8125rem'
                            }}
                          >
                            <div>
                              <span className="font-mono text-muted" style={{ marginRight: '8px', fontSize: '0.6875rem' }}>ORDER_{String(lesson.order).padStart(2, '0')}</span>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lesson.title}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <button
                                onClick={() => handleOpenLessonModal(modIdx, lesson)}
                                className="font-mono"
                                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.6875rem', cursor: 'pointer', padding: 0 }}
                              >
                                EDIT
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(lesson._id)}
                                className="font-mono"
                                style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.6875rem', cursor: 'pointer', padding: 0 }}
                              >
                                DELETE
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Module Inline Form */}
              <form onSubmit={handleAddModule} style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  required
                  placeholder="NEW MODULE TITLE..."
                  className="input-field"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '10px 20px', whiteSpace: 'nowrap' }}
                >
                  ADD_MODULE
                </button>
              </form>
            </section>

          </div>

          {/* Right Column: Quiz Manager */}
          <div className="lg:col-span-1">
            <section className="blueprint-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '24px' }}>
              <h2 className="font-mono" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
                // EVALUATION_QUIZ_SETUP
              </h2>

              <form onSubmit={handleSaveQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>QUIZ TITLE</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={quiz.title}
                    onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>PASSING SCORE (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    className="input-field"
                    value={quiz.passingScore}
                    onChange={(e) => setQuiz({ ...quiz, passingScore: parseInt(e.target.value) })}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-default)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                      QUESTIONS ({quiz.questions?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="font-mono"
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.6875rem', cursor: 'pointer', padding: 0 }}
                    >
                      [+ ADD]
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                    {quiz.questions?.map((q, qIdx) => (
                      <div key={qIdx} className="blueprint-card" style={{ background: 'var(--bg-canvas)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="font-mono"
                          style={{
                            position: 'absolute', top: '12px', right: '12px', background: 'none',
                            border: 'none', color: 'var(--danger)', fontSize: '0.6875rem', cursor: 'pointer'
                          }}
                        >
                          [✕]
                        </button>

                        <div>
                          <label className="font-mono" style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>QUESTION_PROMPT_{qIdx + 1}</label>
                          <input
                            type="text"
                            required
                            placeholder="Prompt..."
                            className="input-field"
                            value={q.questionText}
                            onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                            style={{ padding: '8px 12px', fontSize: '0.75rem' }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label className="font-mono" style={{ fontSize: '0.5625rem', color: 'var(--text-muted)' }}>OPTIONS (CORRECT?)</label>
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="checkbox"
                                style={{
                                  width: '14px', height: '14px', accentColor: 'var(--accent-primary)',
                                  background: 'var(--bg-canvas)', border: '1px solid var(--border-default)'
                                }}
                                checked={opt.isCorrect}
                                onChange={(e) => handleOptionCorrectChange(qIdx, optIdx, e.target.checked)}
                              />
                              <input
                                type="text"
                                required
                                placeholder={`Option ${optIdx + 1}...`}
                                className="input-field"
                                value={opt.text}
                                onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                                style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.8125rem', background: 'var(--accent-secondary)', color: 'var(--bg-canvas)' }}
                >
                  SAVE_QUIZ_SPEC
                </button>
              </form>
            </section>
          </div>

        </div>

        {/* Lesson Add/Edit Modal */}
        {showLessonModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(11,15,16,0.85)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifycontent: 'center', padding: '16px'
          }} className="flex items-center justify-center">
            <div className="blueprint-card" style={{ maxWidth: '500px', width: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
                <h3 className="font-display" style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                  {lessonForm._id ? 'Edit Lesson Specification' : 'Add Lesson Specification'}
                </h3>
                <button
                  onClick={() => setShowLessonModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveLesson} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>LESSON TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Introduction to JSX"
                    className="input-field"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>VIDEO SOURCE URL (OPTIONAL)</label>
                  <input
                    type="text"
                    placeholder="https://example.com/video.mp4"
                    className="input-field"
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>TEXT CONTENT</label>
                  <textarea
                    placeholder="Markdown note description..."
                    rows="5"
                    className="input-field"
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ORDER INDEX</label>
                  <input
                    type="number"
                    required
                    className="input-field"
                    value={lessonForm.order}
                    onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.875rem' }}
                >
                  {lessonForm._id ? 'UPDATE_LESSON' : 'PROVISION_LESSON'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseEditorPage;
