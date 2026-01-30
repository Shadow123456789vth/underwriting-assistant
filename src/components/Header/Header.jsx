import { DxcFlex, DxcTypography } from '@dxc-technology/halstack-react';
import './Header.css';

const Header = ({ userName = "Sarah Johnson", userRole = "Commercial Lines" }) => {
  return (
    <header className="app-header">
      <DxcFlex justifyContent="space-between" alignItems="center" style={{ width: '100%' }}>
        {/* Logo and Brand */}
        <DxcFlex alignItems="center" gap="var(--spacing-gap-m)">
          <img
            src="/bloom-logo.svg"
            alt="Bloom Insurance Logo"
            className="header-logo"
            onError={(e) => {
              // Fallback if logo doesn't load - show text logo
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="text-logo" style={{ display: 'none' }}>
            <DxcFlex alignItems="center" gap="var(--spacing-gap-xs)">
              <div className="bloom-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 5L25 15L20 20L15 15L20 5Z" fill="#FF8C42"/>
                  <path d="M35 20L25 15L20 20L25 25L35 20Z" fill="#5CB85C"/>
                  <path d="M20 35L25 25L20 20L15 25L20 35Z" fill="#D4E157"/>
                  <path d="M5 20L15 15L20 20L15 25L5 20Z" fill="#2196F3"/>
                  <path d="M20 20L25 25L20 30L15 25L20 20Z" fill="#00BCD4"/>
                </svg>
              </div>
              <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-bold" color="#666">
                Bloom
              </DxcTypography>
            </DxcFlex>
          </div>
          <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
            Underwriter Assistant
          </DxcTypography>
        </DxcFlex>

        {/* User Info */}
        <DxcFlex alignItems="center" gap="var(--spacing-gap-m)">
          <DxcFlex direction="column" alignItems="flex-end" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
              {userName}
            </DxcTypography>
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-medium)">
              {userRole}
            </DxcTypography>
          </DxcFlex>
          <div className="user-avatar">
            <span className="material-icons">account_circle</span>
          </div>
        </DxcFlex>
      </DxcFlex>
    </header>
  );
};

export default Header;
