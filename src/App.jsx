import { useState } from 'react';
import { DxcApplicationLayout, DxcFlex, DxcTypography } from '@dxc-technology/halstack-react';
import Dashboard from './components/Dashboard/Dashboard';
import UnderwritingWorkbench from './components/UnderwritingWorkbench/UnderwritingWorkbench';
import SubmissionIntake from './components/SubmissionIntake/SubmissionIntake';
// import Login from './components/Login/Login';
import ServiceNowConnect from './components/ServiceNowConnect/ServiceNowConnect';
import './App.css';

function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [user, setUser] = useState(null);
  const [user] = useState({ name: 'Aniket Chaudhari', role: 'Underwriter' });
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [sidenavExpanded, setSidenavExpanded] = useState(true);
  const [snConnected, setSnConnected] = useState(false);

  // const handleLogin = (userData) => {
  //   setUser(userData);
  //   setIsAuthenticated(true);
  // };

  // const handleLogout = () => {
  //   setUser(null);
  //   setIsAuthenticated(false);
  //   setCurrentView('dashboard');
  //   setSelectedSubmission(null);
  // };

  // Login disabled for now
  // if (!isAuthenticated) {
  //   return <Login onLogin={handleLogin} />;
  // }

  const handleSubmissionSelect = (submission) => {
    setSelectedSubmission(submission);
    setCurrentView('workbench');
  };

  const handleNavigationClick = (view) => {
    setCurrentView(view);
    if (view !== 'workbench') {
      setSelectedSubmission(null);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onSubmissionSelect={handleSubmissionSelect} snConnected={snConnected} />;
      case 'submissions':
        return <Dashboard onSubmissionSelect={handleSubmissionSelect} snConnected={snConnected} />;
      case 'workbench':
        return <UnderwritingWorkbench submission={selectedSubmission} />;
      case 'intake':
        return <SubmissionIntake />;
      default:
        return <Dashboard onSubmissionSelect={handleSubmissionSelect} />;
    }
  };

  const sidenavItems = [
    {
      label: "Dashboard",
      icon: "dashboard",
      selected: currentView === 'dashboard',
      onClick: () => handleNavigationClick('dashboard')
    },
    {
      label: "Submissions",
      icon: "assignment",
      selected: currentView === 'submissions',
      onClick: () => handleNavigationClick('submissions')
    },
    {
      label: "New Submission",
      icon: "note_add",
      selected: currentView === 'intake',
      onClick: () => handleNavigationClick('intake')
    },
    {
      label: "Quotes",
      icon: "request_quote",
      selected: currentView === 'quotes',
      onClick: () => handleNavigationClick('dashboard')
    },
    {
      label: "Renewals",
      icon: "event_repeat",
      selected: currentView === 'renewals',
      onClick: () => handleNavigationClick('dashboard')
    },
  ];

  return (
    <DxcApplicationLayout
      header={(
        <div className="app-header">
          <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
            {/* Bloom Insurance Logo */}
            <img
              src="/bloom-logo.jpg"
              alt="Bloom Insurance"
              style={{ height: '40px', width: 'auto' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div style={{ width: '1px', height: '28px', backgroundColor: '#e0e0e0' }} />
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
              Underwriter Assistant
            </DxcTypography>
          </DxcFlex>

          <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
            {/* Search Icon */}
            <button
              onClick={() => alert('Search functionality would open here')}
              className="header-icon-btn"
              title="Search"
            >
              <span className="material-icons" style={{ fontSize: '22px', color: '#666666' }}>
                search
              </span>
            </button>

            {/* Assure Answers Chat Icon */}
            <button
              onClick={() => alert('Assure Answers chat would open here')}
              className="header-icon-btn"
              title="Assure Answers - AI Assistant"
            >
              <img
                src="/ai-icon.png"
                alt="Assure Answers"
                style={{ width: '24px', height: '24px', borderRadius: '50%' }}
              />
            </button>

            {/* ServiceNow Connect */}
            <ServiceNowConnect onConnectionChange={setSnConnected} />

            {/* Divider */}
            <div style={{ width: '1px', height: '28px', backgroundColor: '#e0e0e0' }} />

            <div className="header-user-text">
              <DxcTypography fontWeight="font-weight-semibold" fontSize="font-scale-02">{user.name}</DxcTypography>
              <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-medium)">
                {user.role}
              </DxcTypography>
            </div>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#1B75BB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          </DxcFlex>
        </div>
      )}
      sidenav={
        <DxcApplicationLayout.Sidenav
          navItems={sidenavItems}
          expanded={sidenavExpanded}
          onExpandedChange={setSidenavExpanded}
        />
      }
      footer={
        <div className="app-footer">
          <DxcFlex justifyContent="space-between" alignItems="center" style={{ width: '100%', padding: '0 24px' }}>
            <DxcTypography fontSize="font-scale-01" color="#808285">
              &copy; 2026 Bloom Insurance. All rights reserved.
            </DxcTypography>
            <DxcFlex gap="var(--spacing-gap-l)" alignItems="center">
              <DxcTypography fontSize="font-scale-01" color="#808285">
                Privacy Policy
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01" color="#808285">
                Terms of Service
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01" color="#808285">
                Contact Support
              </DxcTypography>
            </DxcFlex>
          </DxcFlex>
        </div>
      }
    >
      <DxcApplicationLayout.Main>
        {renderContent()}
      </DxcApplicationLayout.Main>
    </DxcApplicationLayout>
  );
}

export default App;
