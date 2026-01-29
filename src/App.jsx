import { useState } from 'react';
import { DxcApplicationLayout, DxcFlex, DxcTypography } from '@dxc-technology/halstack-react';
import Dashboard from './components/Dashboard/Dashboard';
import UnderwritingWorkbench from './components/UnderwritingWorkbench/UnderwritingWorkbench';
import SubmissionIntake from './components/SubmissionIntake/SubmissionIntake';
import Login from './components/Login/Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [sidenavExpanded, setSidenavExpanded] = useState(true);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('dashboard');
    setSelectedSubmission(null);
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

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
        return <Dashboard onSubmissionSelect={handleSubmissionSelect} />;
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
      selected: currentView === 'dashboard' && currentView !== 'intake',
      onClick: () => handleNavigationClick('dashboard')
    },
    {
      label: "Submissions",
      icon: "folder_open",
      selected: currentView === 'intake',
      items: [
        {
          label: "New Submission",
          icon: "add",
          selected: currentView === 'intake',
          onClick: () => handleNavigationClick('intake')
        }
      ]
    },
    {
      label: "Quotes",
      icon: "request_quote",
      selected: currentView === 'quotes',
      onClick: () => handleNavigationClick('dashboard')
    },
    {
      label: "Renewals and Servicing",
      icon: "autorenew",
      selected: currentView === 'renewals',
      onClick: () => handleNavigationClick('dashboard')
    },
  ];

  return (
    <DxcApplicationLayout
      header={
        <DxcApplicationLayout.Header
          customContent={(
            <DxcFlex gap="var(--spacing-gap-m)" alignItems="center" style={{ height: '64px', padding: '0 var(--spacing-padding-m)' }}>
              {/* Bloom Logo */}
              <svg width="32" height="32" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 0L37.5 15L52.5 7.5L45 22.5L60 30L45 37.5L52.5 52.5L37.5 45L30 60L22.5 45L7.5 52.5L15 37.5L0 30L15 22.5L7.5 7.5L22.5 15L30 0Z" fill="#4CAF50"/>
                <path d="M30 15L35 25L45 20L40 30L50 35L40 40L45 50L35 45L30 55L25 45L15 50L20 40L10 35L20 30L15 20L25 25L30 15Z" fill="#FFC107"/>
                <path d="M30 20L32.5 27.5L40 25L37.5 32.5L45 35L37.5 37.5L40 45L32.5 42.5L30 50L27.5 42.5L20 45L22.5 37.5L15 35L22.5 32.5L20 25L27.5 27.5L30 20Z" fill="#2196F3"/>
              </svg>
              <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold">
                Bloom
              </DxcTypography>
              <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--color-bg-neutral-light)', margin: '0 var(--spacing-gap-s)' }} />
              <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-stronger)">
                Underwriter Assistant
              </DxcTypography>
            </DxcFlex>
          )}
          sideContent={(isResponsive) =>
            isResponsive ? null : (
              <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                {/* Assure Answers Chat Icon */}
                <button
                  onClick={() => alert('Assure Answers chat would open here')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                  }}
                  title="Assure Answers - AI Assistant"
                >
                  <span className="material-icons" style={{ fontSize: '24px', color: '#0095FF' }}>
                    chat
                  </span>
                </button>

                <DxcFlex direction="column" gap="var(--spacing-gap-none)" alignItems="flex-end">
                  <DxcTypography fontWeight="font-weight-semibold">{user.name}</DxcTypography>
                  <DxcTypography
                    fontSize="font-scale-01"
                    color="var(--color-fg-neutral-stronger)"
                  >
                    {user.domain}
                  </DxcTypography>
                </DxcFlex>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#0095FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "16px",
                  }}
                >
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              </DxcFlex>
            )
          }
        />
      }
      sidenav={
        <DxcApplicationLayout.Sidenav
          navItems={sidenavItems}
          expanded={sidenavExpanded}
          onExpandedChange={setSidenavExpanded}
        />
      }
    >
      <DxcApplicationLayout.Main>
        {renderContent()}
      </DxcApplicationLayout.Main>
    </DxcApplicationLayout>
  );
}

export default App;
