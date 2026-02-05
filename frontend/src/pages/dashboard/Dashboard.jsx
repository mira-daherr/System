import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserData, clearAuthData } from '../../utils/auth';
import './style.css';

function Dashboard() {
  const navigate = useNavigate();
  const user = getUserData();

  const handleLogout = async () => {
    try {
      // Clear local auth data
      clearAuthData();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate even if logout API fails
      navigate('/login');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Computer Center Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user.username}!</span>
            <span className={`user-role ${user.role}`}>{user.role}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <h2>Welcome to The Punisher Gaming Lounge</h2>
          <p>You have successfully logged in to the Computer Center Management System.</p>
          
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h3>🎮 Gaming Sessions</h3>
              <p>Manage gaming sessions and time tracking</p>
            </div>
            
            <div className="dashboard-card">
              <h3>💻 Computer Management</h3>
              <p>Monitor and manage computer stations</p>
            </div>
            
            <div className="dashboard-card">
              <h3>👥 User Management</h3>
              <p>Manage user accounts and permissions</p>
            </div>
            
            <div className="dashboard-card">
              <h3>📊 Reports</h3>
              <p>View usage reports and analytics</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
