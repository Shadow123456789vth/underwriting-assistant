import { useState } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcTypography,
  DxcButton,
  DxcTextInput,
  DxcCheckbox,
  DxcInset,
} from '@dxc-technology/halstack-react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.userId || !formData.password) {
      setError('Please enter both User ID and Password');
      return;
    }

    // Mock authentication - in real app, this would call ServiceNow API
    // For demo, accept any credentials
    const mockUser = {
      userId: formData.userId,
      name: 'Sarah Johnson',
      email: 's.johnson@insurance.com',
      domain: 'Commercial Lines', // Domain from ServiceNow domain separation
      role: 'Underwriter',
    };

    onLogin(mockUser);
  };

  const handleForgotPassword = () => {
    // In real app, this would navigate to password reset
    alert('Password reset functionality would be implemented here');
  };

  const handleCreateAccount = () => {
    // In real app, this would navigate to account creation
    alert('Account creation would be handled by ServiceNow admin');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <DxcFlex direction="column" gap="var(--spacing-gap-l)" alignItems="center">
          {/* Logo */}
          <div className="login-logo">
            <img
              src="/bloom-logo.jpg"
              alt="Bloom Insurance"
              style={{ height: '50px', width: 'auto' }}
            />
          </div>

          {/* Title */}
          <DxcHeading level={2} text="Sign in" />

          {/* Error Message */}
          {error && (
            <div className="login-error">
              <DxcTypography fontSize="font-scale-02" color="#D0021B">
                {error}
              </DxcTypography>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcTextInput
                label="User ID"
                placeholder="Enter your User ID"
                value={formData.userId}
                onChange={({ value }) => handleInputChange('userId', value)}
                size="fillParent"
              />

              <DxcTextInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={({ value }) => handleInputChange('password', value)}
                size="fillParent"
              />

              {/* Remember Me and Forgot Password */}
              <DxcFlex justifyContent="space-between" alignItems="center">
                <DxcCheckbox
                  label="Remember Me"
                  checked={formData.rememberMe}
                  onChange={(checked) => handleInputChange('rememberMe', checked)}
                />
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="forgot-password-link"
                >
                  Forgot Password?
                </button>
              </DxcFlex>

              {/* Sign In Button */}
              <DxcButton
                label="Sign In"
                mode="primary"
                type="submit"
                size="fillParent"
              />

              {/* Create Account Button */}
              <DxcButton
                label="Create Account"
                mode="secondary"
                onClick={handleCreateAccount}
                size="fillParent"
              />
            </DxcFlex>
          </form>
        </DxcFlex>
      </div>
    </div>
  );
};

export default Login;
