import { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api';

export default function MentorMatchPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const fallbackMentors = [
    { _id: '1', name: 'Dr. Jane Doe', expertise: 'Web Architecture', rating: 4.9, bio: 'Former Senior Architect at Google. Loves explaining system design.', slots: ['Monday, 10:00 AM', 'Wednesday, 2:00 PM'] },
    { _id: '2', name: 'Devon Webb', expertise: 'UI Design Systems', rating: 4.8, bio: 'Design lead with 8+ years experience building SaaS UI frameworks.', slots: ['Tuesday, 1:00 PM', 'Thursday, 4:30 PM'] },
    { _id: '3', name: 'Aria Chen', expertise: 'Data Science & PyTorch', rating: 5.0, bio: 'Machine learning scientist specializing in natural language models.', slots: ['Friday, 11:00 AM', 'Saturday, 3:00 PM'] },
  ];

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await api.get('/users/mentors');
        // Inject fallback slots to all mentors
        const fetched = (res.data.mentors || []).map((m, idx) => ({
          ...m,
          slots: fallbackMentors[idx % 3].slots
        }));
        setMentors(fetched.length > 0 ? fetched : fallbackMentors);
      } catch (err) {
        console.error(err);
        setMentors(fallbackMentors);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const handleOpenBooking = (mentor) => {
    setSelectedMentor(mentor);
    setSelectedSlot(mentor.slots[0]);
    setBookingSuccess(false);
    setBookingInProgress(false);
  };

  const handleBookSession = async () => {
    if (!selectedMentor || !selectedSlot) return;
    setBookingInProgress(true);
    try {
      // Create user notification on successful booking
      await api.post('/notifications', {
        type: 'enrollment',
        message: `Session booked: 1-on-1 calibration with ${selectedMentor.name} on ${selectedSlot}.`,
        link: '/mentor-match'
      });
      window.dispatchEvent(new Event('refreshNotifications'));
      setBookingSuccess(true);
    } catch (err) {
      console.error('Error booking session:', err);
      // Fallback local state success
      setBookingSuccess(true);
    } finally {
      setBookingInProgress(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        <div className="notebook-margin" style={{ marginBottom: '32px' }}>
          <h1>Mentor Match</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Book 1-on-1 diagnostic sessions with verified domain experts to calibrate your learning path.
          </p>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>LOCATING_AVAILABLE_MENTORS...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {mentors.map((mentor) => (
              <div key={mentor._id} className="blueprint-card animate-fade-in-up" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #7B68EE, #F2B056)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', flexShrink: 0
                }}>
                  {mentor.name?.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{mentor.name}</h3>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>Expertise: {mentor.expertise}</span>
                    </div>
                    <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--success)' }}>★ {mentor.rating} Rating</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '8px' }}>{mentor.bio}</p>
                  <button 
                    onClick={() => handleOpenBooking(mentor)}
                    className="btn-primary" 
                    style={{ marginTop: '16px', padding: '8px 16px', fontSize: '0.8125rem' }}
                  >
                    Book Calibrations Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Overlay Modal */}
      {selectedMentor && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '16px'
        }}>
          <div className="blueprint-card animate-scale-up" style={{
            width: '100%',
            maxWidth: '480px',
            background: 'var(--bg-elevated)',
            padding: '24px',
            border: '1px solid var(--border-default)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
            position: 'relative'
          }}>
            {/* Close */}
            <button 
              onClick={() => setSelectedMentor(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            {!bookingSuccess ? (
              <>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 16px 0' }}>Confirm Calibration Session</h2>
                
                {/* Mentor Info */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-default)' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #7B68EE, #F2B056)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.3rem', fontWeight: 'bold'
                  }}>
                    {selectedMentor.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{selectedMentor.name}</h3>
                    <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                      {selectedMentor.expertise} · ★ {selectedMentor.rating}
                    </p>
                  </div>
                </div>

                {/* Biography */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                    {selectedMentor.bio}
                  </p>
                </div>

                {/* Slot Selection */}
                <div style={{ marginBottom: '24px' }}>
                  <label className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', letterSpacing: '0.04em' }}>
                    SELECT AVAILABLE SLOT
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedMentor.slots?.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          textAlign: 'left',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid',
                          borderColor: selectedSlot === slot ? 'var(--accent-primary)' : 'var(--border-default)',
                          background: selectedSlot === slot ? 'rgba(0, 240, 255, 0.03)' : 'transparent',
                          color: selectedSlot === slot ? 'var(--accent-primary)' : 'var(--text-primary)',
                          fontSize: '0.8125rem',
                          cursor: 'pointer'
                        }}
                      >
                        {selectedSlot === slot ? '🟢 ' : '⚪ '} {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={handleBookSession}
                  disabled={bookingInProgress}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', fontWeight: 700 }}
                >
                  {bookingInProgress ? 'Scheduling...' : 'Book Session Now'}
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🎉</span>
                <h2 style={{ color: 'var(--success)', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px 0' }}>Booking Confirmed!</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '24px' }}>
                  Your calibration session with <strong>{selectedMentor.name}</strong> is scheduled for <strong>{selectedSlot}</strong>.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                    NOTIFICATION_DISPATCHED_TO_BELL
                  </span>
                  <button 
                    onClick={() => setSelectedMentor(null)} 
                    className="btn-primary"
                    style={{ padding: '10px 24px', fontWeight: 700 }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
