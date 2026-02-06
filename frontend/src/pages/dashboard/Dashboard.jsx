import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  SportsEsports as GamesIcon,
  Inventory as ProductsIcon,
  BarChart as ChartIcon
} from '@mui/icons-material';
import { getUserData, clearAuthData } from '../../utils/auth';
import { authAPI } from '../../services/api';
import './style.css';

function Dashboard() {
  const navigate = useNavigate();
  const user = getUserData();

  const handleLogout = async () => {
    try {
      // Call logout API
      if (user?.id) {
        await authAPI.logout(user.id);
      }

      // Clear local auth data
      clearAuthData();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data and navigate even if logout API fails
      clearAuthData();
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

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3, marginTop: 4 }}>
            {/* Customers Card */}
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 51, 51, 0.3)',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  borderColor: '#ff3333',
                  boxShadow: '0 10px 30px rgba(255, 51, 51, 0.3)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', padding: 4 }}>
                <Box sx={{
                  display: 'inline-flex',
                  padding: 2.5,
                  borderRadius: '50%',
                  background: 'rgba(63, 81, 181, 0.15)',
                  marginBottom: 2
                }}>
                  <PeopleIcon sx={{ fontSize: 48, color: '#3f51b5' }} />
                </Box>
                <Typography variant="h5" sx={{ color: '#ff3333', fontWeight: 'bold', marginBottom: 1 }}>
                  Customers
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Manage customer accounts and information
                </Typography>
              </CardContent>
            </Card>

            {/* Customer Purchases Card */}
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 51, 51, 0.3)',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  borderColor: '#ff3333',
                  boxShadow: '0 10px 30px rgba(255, 51, 51, 0.3)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', padding: 4 }}>
                <Box sx={{
                  display: 'inline-flex',
                  padding: 2.5,
                  borderRadius: '50%',
                  background: 'rgba(255, 152, 0, 0.15)',
                  marginBottom: 2
                }}>
                  <ShoppingCartIcon sx={{ fontSize: 48, color: '#ff9800' }} />
                </Box>
                <Typography variant="h5" sx={{ color: '#ff3333', fontWeight: 'bold', marginBottom: 1 }}>
                  Customer Purchases
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  View and track customer purchase history
                </Typography>
              </CardContent>
            </Card>

            {/* Expenses Card */}
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 51, 51, 0.3)',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  borderColor: '#ff3333',
                  boxShadow: '0 10px 30px rgba(255, 51, 51, 0.3)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', padding: 4 }}>
                <Box sx={{
                  display: 'inline-flex',
                  padding: 2.5,
                  borderRadius: '50%',
                  background: 'rgba(244, 67, 54, 0.15)',
                  marginBottom: 2
                }}>
                  <ReceiptIcon sx={{ fontSize: 48, color: '#f44336' }} />
                </Box>
                <Typography variant="h5" sx={{ color: '#ff3333', fontWeight: 'bold', marginBottom: 1 }}>
                  Expenses
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Track and manage business expenses
                </Typography>
              </CardContent>
            </Card>

            {/* Games Card */}
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 51, 51, 0.3)',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  borderColor: '#ff3333',
                  boxShadow: '0 10px 30px rgba(255, 51, 51, 0.3)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', padding: 4 }}>
                <Box sx={{
                  display: 'inline-flex',
                  padding: 2.5,
                  borderRadius: '50%',
                  background: 'rgba(156, 39, 176, 0.15)',
                  marginBottom: 2
                }}>
                  <GamesIcon sx={{ fontSize: 48, color: '#9c27b0' }} />
                </Box>
                <Typography variant="h5" sx={{ color: '#ff3333', fontWeight: 'bold', marginBottom: 1 }}>
                  Games
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Manage available games and sessions
                </Typography>
              </CardContent>
            </Card>

            {/* Products Card */}
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 51, 51, 0.3)',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  borderColor: '#ff3333',
                  boxShadow: '0 10px 30px rgba(255, 51, 51, 0.3)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', padding: 4 }}>
                <Box sx={{
                  display: 'inline-flex',
                  padding: 2.5,
                  borderRadius: '50%',
                  background: 'rgba(76, 175, 80, 0.15)',
                  marginBottom: 2
                }}>
                  <ProductsIcon sx={{ fontSize: 48, color: '#4caf50' }} />
                </Box>
                <Typography variant="h5" sx={{ color: '#ff3333', fontWeight: 'bold', marginBottom: 1 }}>
                  Products
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Browse and manage product inventory
                </Typography>
              </CardContent>
            </Card>

            {/* Graphics/Reports Card */}
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 51, 51, 0.3)',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  borderColor: '#ff3333',
                  boxShadow: '0 10px 30px rgba(255, 51, 51, 0.3)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', padding: 4 }}>
                <Box sx={{
                  display: 'inline-flex',
                  padding: 2.5,
                  borderRadius: '50%',
                  background: 'rgba(33, 150, 243, 0.15)',
                  marginBottom: 2
                }}>
                  <ChartIcon sx={{ fontSize: 48, color: '#2196f3' }} />
                </Box>
                <Typography variant="h5" sx={{ color: '#ff3333', fontWeight: 'bold', marginBottom: 1 }}>
                  Reports & Analytics
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  View usage reports and financial analytics
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
