import { useState } from 'react';
import { DxcApplicationLayout, DxcFlex, DxcTypography } from '@dxc-technology/halstack-react';
import Dashboard from './components/Dashboard/Dashboard';
import UnderwritingWorkbench from './components/UnderwritingWorkbench/UnderwritingWorkbench';
import SubmissionIntake from './components/SubmissionIntake/SubmissionIntake';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [sidenavExpanded, setSidenavExpanded] = useState(true);

  const user = {
    name: 'Sarah Chen',
    email: 'sarah.chen@insurance.com'
  };

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
      selected: currentView === 'dashboard',
      onClick: () => handleNavigationClick('dashboard')
    },
    {
      label: "My Queue",
      icon: "assignment",
      selected: currentView === 'queue',
      onClick: () => handleNavigationClick('dashboard')
    },
    {
      label: "New Submission",
      icon: "add_circle",
      selected: currentView === 'intake',
      onClick: () => handleNavigationClick('intake')
    },
  ];

  return (
    <DxcApplicationLayout
      header={
        <DxcApplicationLayout.Header
          appTitle="Underwriter Assistant"
          sideContent={(isResponsive) =>
            isResponsive ? null : (
              <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                <DxcFlex direction="column" gap="var(--spacing-gap-none)">
                  <DxcTypography>{user.name}</DxcTypography>
                  <DxcTypography
                    fontSize="font-scale-01"
                    color="var(--color-fg-neutral-stronger)"
                  >
                    {user.email}
                  </DxcTypography>
                </DxcFlex>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "#0095FF",
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
