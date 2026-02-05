import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import { authAPI } from '../../services/api';
import { setAuthToken, setUserData } from '../../utils/auth';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Konami code easter egg
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    const handleKeyDown = (e) => {
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Login attempt:', { username, password: '***' });
      
      const response = await authAPI.login(username, password);
      
      if (response.success) {
        console.log('✅ Login successful, storing auth data...');
        console.log('Token:', response.token ? 'received' : 'missing');
        console.log('User:', response.user);

        // Store token and user data
        setAuthToken(response.token);
        setUserData(response.user);

        // Verify data was stored
        console.log('🔍 Verifying localStorage...');
        console.log('Stored token:', localStorage.getItem('token') ? 'YES' : 'NO');
        console.log('Stored user:', localStorage.getItem('user') ? 'YES' : 'NO');

        setIsLoading(false);
        setLoginSuccess(true);

        // Show success message briefly then redirect
        setTimeout(() => {
          console.log('🚀 Navigating to dashboard...');
          navigate('/dashboard', { replace: true });
        }, 1000);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      setIsLoading(false);
      setLoginSuccess(false);
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
            <h1>Level Up Your Game</h1>
            <p>Join the elite gaming community where legends are made</p>
          </div>

         
        </div>

        {/* RIGHT PANEL - LOGIN FORM */}
        <div className="right-panel">
          <div className="decorative-elements">
            <div className="floating-icon icon-1">🎮</div>
            <div className="floating-icon icon-2">💀</div>
            <div className="floating-icon icon-3">🎯</div>
          </div>

          <div className="login-card">
            <div className="card-glow"></div>
            
            <div className="welcome-text">
              <h2>Welcome Back!</h2>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message" style={{
                backgroundColor: '#ff4444',
                color: 'white',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '20px',
                textAlign: 'center',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <InputField
                type="text"
                id="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <InputField
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="form-options">
                
                <a href="#" className="forgot-password">Forgot Password?</a>
              </div>

              <button
                type="submit"
                className={`login-button ${isLoading ? 'loading' : ''} ${loginSuccess ? 'success' : ''}`}
                disabled={isLoading || loginSuccess}
              >
                <span className="button-text">
                  {loginSuccess ? 'Success! ✓' : isLoading ? 'Loading...' : 'Login'}
                </span>
                <span className="button-glow"></span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Confetti Effect */}
      {showConfetti && <Confetti />}
    </div>
  );
}

// Feature Item Component
const FeatureItem = ({ icon, title, description, delay }) => {
  return (
    <div className="feature-item" style={{ animationDelay: delay }}>
      <div className="feature-icon">{icon}</div>
      <div className="feature-text">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

// Input Field Component
const InputField = ({ type, id, placeholder, value, onChange, required }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`input-group ${isFocused || value ? 'focused' : ''}`}>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
      />
      <span className="input-focus-border"></span>
    </div>
  );
};

// Confetti Component
const Confetti = () => {
  const colors = ['#FF3333', '#E8E8E8', '#CC0000'];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    left: Math.random() * 100,
    delay: i * 0.03,
    duration: 3 + Math.random() * 2
  }));

  return (
    <div className="confetti-container">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            backgroundColor: piece.color,
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`
          }}
        />
      ))}
    </div>
  );
};

export default Login;