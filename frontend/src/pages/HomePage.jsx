import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * HomePage — Public landing page.
 * Upgraded to a clean premium layout with an interactive circular/orbital diagram
 * matching the user's design reference with 8 technical and non-technical subjects.
 */
const HomePage = () => {
  // Subjects data: technical and non-technical for college students
  const [subjects, setSubjects] = useState([
    {
      id: 'dsa',
      name: 'DSA',
      fullName: 'Data Structures & Algorithms',
      type: 'Technical',
      progress: 75,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    {
      id: 'webdev',
      name: 'WEB DEV',
      fullName: 'Web Development (React & Node)',
      type: 'Technical',
      progress: 60,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'sql',
      name: 'SQL',
      fullName: 'SQL Database Querying',
      type: 'Technical',
      progress: 50,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      )
    },
    {
      id: 'dbms',
      name: 'DBMS',
      fullName: 'Database Management Systems',
      type: 'Technical',
      progress: 65,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      id: 'os',
      name: 'OS',
      fullName: 'Operating Systems',
      type: 'Technical',
      progress: 40,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'marketing',
      name: 'MARKETING',
      fullName: 'Marketing & Digital Strategy',
      type: 'Non-Technical',
      progress: 70,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      )
    },
    {
      id: 'finance',
      name: 'FINANCE',
      fullName: 'Financial Management',
      type: 'Non-Technical',
      progress: 65,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'management',
      name: 'MANAGEMENT',
      fullName: 'Business Management & HR',
      type: 'Non-Technical',
      progress: 80,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ]);

  // Selected Subject for info/focus
  const [selectedId, setSelectedId] = useState('dsa');

  // Calculate cumulative average progress to show in the center "Balance" node
  const averageProgress = Math.round(
    subjects.reduce((sum, sub) => sum + sub.progress, 0) / subjects.length
  );

  return (
    <div className="lab-page-wrapper">
      
      {/* Top Header (Outside the content card) */}
      <header className="lab-navbar mb-6 z-10">
        <div className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
            {/* Outer Hexagon */}
            <path d="M50 12L83 31V69L50 88L17 69V31L50 12Z" stroke="url(#logoGrad)" strokeWidth="6" strokeLinejoin="round" fill="none" />
            
            {/* Inner Cube - Top Face */}
            <path d="M50 34L68 44L50 54L32 44Z" fill="#F7B05B" />
            
            {/* Inner Cube - Left Face */}
            <path d="M32 44L50 54V72L32 62Z" fill="#313B64" />
            
            {/* Inner Cube - Right Face */}
            <path d="M50 54L68 44V62L50 72Z" fill="#E27429" />
            
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#F2B056" />
                <stop offset="100%" stop-color="#E27429" />
              </linearGradient>
            </defs>
          </svg>
          <span className="logo-text">LEARNING_LAB</span>
        </div>
        <Link to="/login" className="btn-signin">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Sign in</span>
        </Link>
      </header>

      {/* Middle Layout Wrapper */}
      <div className="flex flex-1 gap-6 items-stretch w-full mb-6 min-h-0">
        {/* Left Sidebar Navigation */}
        <aside className="lab-sidebar">
          <div className="lab-sidebar-nav" style={{ paddingTop: '12px' }}>
            {/* Navigation Buttons */}
            <button className="lab-sidebar-btn active" data-tooltip="Home" aria-label="Home">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </button>
            
            <button className="lab-sidebar-btn" data-tooltip="Analytics" aria-label="Analytics">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Analytics</span>
            </button>

            <button className="lab-sidebar-btn" data-tooltip="Courses" aria-label="Courses">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Courses</span>
            </button>

            <button className="lab-sidebar-btn" data-tooltip="Profile / Community" aria-label="Users">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Community</span>
            </button>

            <button className="lab-sidebar-btn" data-tooltip="Settings" aria-label="Settings">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </button>

            {/* Theme Toggle moved next to Settings */}
            <button className="lab-sidebar-btn" data-tooltip="Toggle Theme" aria-label="Toggle Theme" style={{ marginTop: '4px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
              <span>Theme</span>
            </button>
          </div>
        </aside>

        {/* Main Content Card Container */}
        <main className="lab-main-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full my-auto z-10 py-2">
            
            {/* Left Column: Hero Content */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div>
                <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 800, color: '#fff' }}>
                  Your Personal <br />
                  <span style={{ background: 'linear-gradient(120deg, #f2b056 0%, #ffc473 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Learning Lab
                  </span>
                </h1>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.7, maxWidth: '480px' }}>
                Verify your skills with secure OTP authentication and map your academic progression. Manage and balance your technical and non-technical subjects inside a custom workspace built for college students.
              </p>

              {/* Large Action CTAs */}
              <div className="flex flex-wrap gap-4 items-center pt-2">
                <Link to="/signup" className="btn-primary-orange">
                  <span>Create your lab</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <Link to="/login" className="btn-secondary-outline">
                  <span>Resume session</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Link>
              </div>

              {/* Features Row */}
              <div className="feat-row">
                <div className="feat-card">
                  <div className="feat-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="feat-title">Secure OTP</h4>
                    <p className="feat-desc">Two-factor authentication</p>
                  </div>
                </div>

                <div className="feat-card">
                  <div className="feat-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="feat-title">Track Progress</h4>
                    <p className="feat-desc">Visualize your academic growth</p>
                  </div>
                </div>

                <div className="feat-card">
                  <div className="feat-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="feat-title">Custom Workspace</h4>
                    <p className="feat-desc">Organized, focused and distraction-free</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Center Column: Orbital Diagram */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center">
              <div className="orbit-container">
                <div className="orbit-ring orbit-ring-inner" />
                <div className="orbit-ring orbit-ring-outer" />

                <div className="orbit-center-node">
                  <span style={{ fontSize: '0.6rem', opacity: 0.8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ffc473', fontWeight: 600 }}>Average</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '1px 0' }}>{averageProgress}%</span>
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', color: '#ffc473' }}>BALANCE</span>
                </div>
                <div className="orbit-center-glow" />

                {subjects.map((sub) => {
                  const isSelected = sub.id === selectedId;
                  return (
                    <div
                      key={sub.id}
                      className={`absolute flex flex-col items-center pos-${sub.id}`}
                      style={{ pointerEvents: 'auto', zIndex: isSelected ? 10 : 5 }}
                    >
                      <button
                        onClick={() => setSelectedId(sub.id)}
                        className={`orbit-subject-node node-${sub.id} ${isSelected ? 'selected' : ''}`}
                        style={{ position: 'relative', transform: 'none' }}
                        aria-label={`Select Subject ${sub.name}`}
                        title={sub.fullName}
                      >
                        {sub.icon}
                      </button>
                      <span className="orbit-subject-label" style={{ whiteSpace: 'nowrap', marginTop: '6px' }}>
                        {sub.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Stats Panel */}
            <div className="lg:col-span-3 h-full">
              <div className="journey-panel">
                <div>
                  <h3 className="journey-title">YOUR JOURNEY</h3>
                  <div className="journey-list">
                    <div className="journey-item">
                      <div className="journey-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="journey-meta">
                        <span className="journey-label">Courses</span>
                        <span className="journey-value">8</span>
                      </div>
                    </div>

                    {/* Progress replaced by Weekly Gain to remove redundancy */}
                    <div className="journey-item">
                      <div className="journey-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div className="journey-meta">
                        <span className="journey-label">Weekly Gain</span>
                        <span className="journey-value" style={{ color: '#10b981' }}>+4.2%</span>
                      </div>
                    </div>

                    <div className="journey-item">
                      <div className="journey-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016a11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="journey-meta">
                        <span className="journey-label">Skills Verified</span>
                        <span className="journey-value">24</span>
                      </div>
                    </div>

                    <div className="journey-item">
                      <div className="journey-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="journey-meta">
                        <span className="journey-label">Hours Spent</span>
                        <span className="journey-value">128h</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestone nudge replacing the orphaned quote block */}
                <div className="journey-quote-box">
                  <span className="journey-label" style={{ fontWeight: 600, color: '#f2b056', letterSpacing: '0.05em' }}>NEXT MILESTONE</span>
                  <p className="quote-text" style={{ fontStyle: 'normal', color: '#cbd5e1', fontSize: '0.8rem', lineHeight: '1.4' }}>
                    Reach 70% average progress to unlock your DBMS Certification Exam.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </main>

      </div>

      {/* Footer tagline rewritten for clarity and contrast */}
      <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 z-10 border-t border-[rgba(255,255,255,0.05)] pt-4 w-full">
        <p style={{ color: '#cbd5e1', fontSize: '11px', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
          Curriculum Alignment Platform // Version 2.0.4-LTS
        </p>
        <p style={{ color: '#cbd5e1', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          &copy; {new Date().getFullYear()} LEARNING LAB. ALL RIGHTS RESERVED.
        </p>
      </footer>

    </div>
  );
};

export default HomePage;
