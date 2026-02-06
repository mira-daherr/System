import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import { authAPI } from '../../services/api';

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = request code, 2 = reset password
  const [username, setUsername] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();

  // Countdown timer for code expiration
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Format time remaining
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Generate Reset Code
  const handleGenerateCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.requestResetCode(username);

      if (response.success) {
        setGeneratedCode(response.code);
        setStep(2);
        setTimeLeft(15 * 60); // 15 minutes
        setSuccess('Reset code generated successfully!');
      } else {
        setError(response.message || 'Failed to generate reset code');
      }
    } catch (error) {
      console.error('Generate code error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authAPI.resetPassword(username, resetCode, newPassword);

      if (response.success) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        {/* LEFT PANEL - BRANDING */}
        <div className="left-panel">
          <div className="logo-section">
            <img 
              src="/punisher-logo.jpg" 
              alt="The Punisher Gaming Lounge" 
              className="brand-logo"
            />
          </div>

          <div className="tagline">
            <h1>Reset Your Password</h1>
            <p>Get back to gaming in just a few steps</p>
          </div>
        </div>

        {/* RIGHT PANEL - RESET FORM */}
        <div className="right-panel">
          <div className="decorative-elements">
            <div className="floating-icon icon-1">🔑</div>
            <div className="floating-icon icon-2">🔐</div>
            <div className="floating-icon icon-3">🛡️</div>
          </div>

          <div className="login-card">
            <div className="card-glow"></div>
            
            <div className="welcome-text">
              <h2>{step === 1 ? 'Forgot Password?' : 'Reset Password'}</h2>
              <p style={{ fontSize: '14px', color: '#999', marginTop: '5px' }}>
                {step === 1 ? 'Enter your username to generate a reset code' : 'Enter the code and your new password'}
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div style={{
                backgroundColor: '#22c55e',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center',
                fontSize: '14px'
              }}>
                ✓ {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center',
                fontSize: '14px'
              }}>
                ✕ {error}
              </div>
            )}

            {/* STEP 1: Generate Code */}
            {step === 1 && (
              <form className="login-form" onSubmit={handleGenerateCode}>
                <InputField
                  type="text"
                  id="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />

                <button
                  type="submit"
                  className={`login-button ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  <span className="button-text">
                    {isLoading ? 'Generating...' : 'Generate Reset Code'}
                  </span>
                  <span className="button-glow"></span>
                </button>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#FF3333',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textDecoration: 'underline'
                    }}
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Reset Password */}
            {step === 2 && (
              <form className="login-form" onSubmit={handleResetPassword}>
                {/* Display Generated Code */}
                <div style={{
                  backgroundColor: '#1a1a1a',
                  border: '2px solid #FF3333',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                    Your Reset Code
                  </div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#FF3333',
                    letterSpacing: '8px',
                    fontFamily: 'monospace'
                  }}>
                    {generatedCode}
                  </div>
                  {timeLeft > 0 && (
                    <div style={{ fontSize: '12px', color: '#FF3333', marginTop: '8px' }}>
                      ⏱️ Expires in {formatTime(timeLeft)}
                    </div>
                  )}
                  {timeLeft === 0 && (
                    <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>
                      ⚠️ Code expired
                    </div>
                  )}
                </div>

                <InputField
                  type="text"
                  id="username-confirm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />

                <InputField
                  type="text"
                  id="reset-code"
                  placeholder="Enter Reset Code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                  maxLength={6}
                />

                <InputField
                  type="password"
                  id="new-password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />

                <InputField
                  type="password"
                  id="confirm-password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className={`login-button ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading || timeLeft === 0}
                >
                  <span className="button-text">
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </span>
                  <span className="button-glow"></span>
                </button>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setResetCode('');
                      setGeneratedCode('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setError('');
                      setSuccess('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#FF3333',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textDecoration: 'underline'
                    }}
                  >
                    ← Generate New Code
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Input Field Component (reuse from Login)
const InputField = ({ type, id, placeholder, value, onChange, required, autoFocus, maxLength }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  return (
    <div className={`input-group ${isFocused || value ? 'focused' : ''}`}>
      <input
        type={inputType}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        autoFocus={autoFocus}
        maxLength={maxLength}
        autoComplete="off"
      />
      {isPasswordField && (
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <span style={{ position: 'relative', display: 'inline-block' }}>
              👁️
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-45deg)',
                width: '100%',
                height: '2px',
                background: '#FF3333',
                borderRadius: '2px'
              }}></span>
            </span>
          ) : (
            '👁️'
          )}
        </button>
      )}
      <span className="input-focus-border"></span>
    </div>
  );
};

export default ForgotPassword;