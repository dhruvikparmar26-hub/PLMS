import { useState, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const LayoutContext = createContext(false);

/**
 * DashboardLayout — Shell wrapping Sidebar + TopBar + content area.
 * All authenticated pages use this layout for consistent navigation.
 */
const DashboardLayout = ({ children }) => {
  const isNested = useContext(LayoutContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  // If already nested inside a parent layout, just render children/outlet directly
  if (isNested) {
    return children || <Outlet />;
  }

  return (
    <LayoutContext.Provider value={true}>
      <div className="dashboard-layout">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onOpenAI={() => setAiPanelOpen(true)}
        />

        <div className="dashboard-main">
          <TopBar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <main className="dashboard-content">
            {children || <Outlet />}
          </main>
        </div>

        {/* AI Tutor Panel */}
        {aiPanelOpen && (
          <>
            <div className="ai-panel-overlay" onClick={() => setAiPanelOpen(false)} />
            <div className="ai-panel">
              <div className="ai-panel-header">
                <div className="ai-panel-title">
                  <span className="ai-panel-icon">✦</span>
                  Ask Momentum AI
                </div>
                <button
                  className="ai-panel-close"
                  onClick={() => setAiPanelOpen(false)}
                  aria-label="Close AI panel"
                >
                  ✕
                </button>
              </div>
              <div className="ai-panel-body">
                <div className="ai-panel-welcome">
                  <div className="ai-panel-welcome-icon">🧠</div>
                  <h3>Hi! I'm Momentum AI</h3>
                  <p>Ask me anything about your courses, concepts, or learning path. I can help you review, explain topics, or suggest what to study next.</p>
                </div>
              </div>
              <div className="ai-panel-input-area">
                <input
                  type="text"
                  placeholder="Ask anything about your courses..."
                  className="ai-panel-input"
                />
                <button className="ai-panel-send-btn">→</button>
              </div>
            </div>
          </>
        )}
      </div>
    </LayoutContext.Provider>
  );
};

export default DashboardLayout;
