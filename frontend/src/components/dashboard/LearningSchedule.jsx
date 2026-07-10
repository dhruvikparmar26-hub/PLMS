import { useEffect, useState } from 'react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

/**
 * LearningSchedule — Mini calendar + today's schedule matching the image.
 */
const LearningSchedule = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEvents(getFallbackData());
      setLoading(false);
      return;
    }
    const fetchEvents = async () => {
      try {
        const res = await api.get('/study-sessions/today');
        const data = res.data?.sessions || [];
        if (data.length > 0) {
          setEvents(data);
        } else {
          setEvents(getFallbackData());
        }
      } catch {
        setEvents(getFallbackData());
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [user]);

  const getFallbackData = () => [
    { title: 'System Design Live Session', time: '10:00 AM', type: 'live', live: true },
    { title: 'DSA Practice Quiz', time: '2:00 PM', type: 'quiz' },
    { title: 'AI Study Group', time: '4:30 PM', type: 'group' },
    { title: 'Spaced Repetition Review', time: '7:00 PM', type: 'review' },
  ];

  const now = new Date();
  const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

  const typeIcons = {
    live: { icon: '🎥', color: '#E8745C' },
    quiz: { icon: '📝', color: '#7B68EE' },
    group: { icon: '👥', color: '#6FCF97' },
    review: { icon: '🧠', color: '#F2B056' },
  };

  // Generate calendar grid
  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  if (loading) {
    return (
      <div className="widget-card schedule-card">
        <div className="widget-shimmer"></div>
      </div>
    );
  }

  return (
    <div className="widget-card schedule-card">
      <div className="widget-header">
        <h3 className="widget-title">Learning Schedule</h3>
        <a href="/schedule" className="widget-link">View full calendar →</a>
      </div>

      {/* Mini Calendar */}
      <div className="mini-calendar">
        <div className="mini-calendar-header">{currentMonth}</div>
        <div className="mini-calendar-weekdays">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i} className="mini-cal-weekday">{d}</span>
          ))}
        </div>
        <div className="mini-calendar-grid">
          {calendarDays.map((day, i) => (
            <span
              key={i}
              className={`mini-cal-day ${day === currentDay ? 'mini-cal-day--today' : ''} ${!day ? 'mini-cal-day--empty' : ''}`}
            >
              {day || ''}
            </span>
          ))}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="schedule-today">
        <div className="schedule-today-label">Today's Schedule</div>
        <div className="schedule-events">
          {events.map((event, i) => {
            const config = typeIcons[event.type] || typeIcons.review;
            return (
              <div key={i} className="schedule-event">
                <div className="schedule-event-time">{event.time}</div>
                <div className="schedule-event-bar" style={{ background: config.color }}></div>
                <div className="schedule-event-info">
                  <span className="schedule-event-title">
                    {config.icon} {event.title}
                    {event.live && <span className="live-badge">🔴 LIVE</span>}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LearningSchedule;
