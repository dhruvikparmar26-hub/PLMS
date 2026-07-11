import { Link } from 'react-router-dom';

/**
 * ContinueLearning — Horizontal scrollable course card carousel.
 * Shows in-progress enrollments with progress bars and play buttons.
 */
const ContinueLearning = ({ enrollments = [] }) => {
  const isPreview = !enrollments || enrollments.length === 0;

  const courses = isPreview ? [
    { _id: '1', course: { _id: '1', title: 'System Design Fundamentals' }, lessonsCompleted: 12, totalLessons: 24, progressPercent: 75 },
    { _id: '2', course: { _id: '2', title: 'Advanced Algorithms' }, lessonsCompleted: 8, totalLessons: 20, progressPercent: 40 },
    { _id: '3', course: { _id: '3', title: 'Database Management' }, lessonsCompleted: 15, totalLessons: 30, progressPercent: 50 },
    { _id: '4', course: { _id: '4', title: 'Machine Learning Basics' }, lessonsCompleted: 5, totalLessons: 18, progressPercent: 28 },
  ] : (enrollments.filter(e => e.course && e.progressPercent < 100 && e.progressPercent > 0).length > 0
    ? enrollments.filter(e => e.course && e.progressPercent < 100 && e.progressPercent > 0)
    : enrollments.filter(e => e.course).slice(0, 4));

  const courseColors = [
    { bg: 'linear-gradient(135deg, #7B68EE 0%, #5A4FCF 100%)', accent: '#7B68EE' },
    { bg: 'linear-gradient(135deg, #F2B056 0%, #E89B3E 100%)', accent: '#F2B056' },
    { bg: 'linear-gradient(135deg, #6FCF97 0%, #4CAF6E 100%)', accent: '#6FCF97' },
    { bg: 'linear-gradient(135deg, #E8745C 0%, #D05A42 100%)', accent: '#E8745C' },
  ];

  const getTotalLessons = (c) => {
    if (!c || !c.modules) return 0;
    return c.modules.reduce((sum, mod) => sum + (mod.lessons ? mod.lessons.length : 0), 0);
  };

  return (
    <div className="widget-card continue-learning-card">
      <div className="widget-header">
        <h3 className="widget-title">Continue Learning</h3>
        <Link to="/courses" className="widget-link">Browse all →</Link>
      </div>

      <div className="continue-learning-scroll">
        {courses.map((enrollment, i) => {
          const course = enrollment.course || {};
          const color = courseColors[i % courseColors.length];
          const totalLessons = isPreview ? enrollment.totalLessons : getTotalLessons(course);
          const completedLessons = enrollment.lessonsCompleted || 0;
          const progress = enrollment.progressPercent || 0;

          return (
            <Link
              key={enrollment._id || i}
              to={`/courses/${course._id}`}
              className="continue-course-card"
            >
              <div className="continue-course-icon" style={{ background: color.bg }}>
                {course.title?.charAt(0) || '📚'}
              </div>
              <div className="continue-course-info">
                <div className="continue-course-title">{course.title || 'Untitled Course'}</div>
                <div className="continue-course-lesson">
                  Lesson {completedLessons} of {totalLessons}
                </div>
                <div className="continue-course-progress">
                  <div className="continue-progress-track">
                    <div
                      className="continue-progress-fill"
                      style={{ width: `${progress}%`, background: color.accent }}
                    ></div>
                  </div>
                  <span className="continue-progress-pct" style={{ color: color.accent }}>{progress}%</span>
                </div>
              </div>
              <div className="continue-play-btn" style={{ background: color.bg }}>▶</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ContinueLearning;
