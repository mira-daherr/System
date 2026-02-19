import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  SportsEsports as GamesIcon,
  Inventory as ProductsIcon,
  Category as CategoryIcon,
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
      if (user?.id) await authAPI.logout(user.id);
      clearAuthData();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      clearAuthData();
      navigate('/login');
    }
  };

  if (!user) { navigate('/login'); return null; }

  const cards = [
    { label: 'Customers',          desc: 'Manage customer accounts and information',     path: '/customers',         icon: <PeopleIcon sx={{ fontSize: 48, color: '#3f51b5' }} />,  bg: 'rgba(63,81,181,0.15)' },
    { label: 'Customer Purchases', desc: 'View and track customer purchase history',      path: '/customer-purchase', icon: <ShoppingCartIcon sx={{ fontSize: 48, color: '#ff9800' }} />, bg: 'rgba(255,152,0,0.15)' },
    { label: 'Expenses',           desc: 'Track and manage business expenses',            path: '/expenses',          icon: <ReceiptIcon sx={{ fontSize: 48, color: '#f44336' }} />,  bg: 'rgba(244,67,54,0.15)' },
    { label: 'Games',              desc: 'Manage available games and sessions',           path: '/games',             icon: <GamesIcon sx={{ fontSize: 48, color: '#9c27b0' }} />,    bg: 'rgba(156,39,176,0.15)' },
    { label: 'Categories',         desc: 'Browse products by category',                  path: '/categories',        icon: <CategoryIcon sx={{ fontSize: 48, color: '#ffc107' }} />, bg: 'rgba(255,193,7,0.15)' },
    { label: 'All Products',       desc: 'View complete product inventory',              path: '/products',          icon: <ProductsIcon sx={{ fontSize: 48, color: '#4caf50' }} />, bg: 'rgba(76,175,80,0.15)' },
    { label: 'Reports & Analytics',desc: 'View usage reports and financial analytics',   path: '/reports',           icon: <ChartIcon sx={{ fontSize: 48, color: '#2196f3' }} />,    bg: 'rgba(33,150,243,0.15)' }, // ← fixed
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Computer Center Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user.username}!</span>
            <span className={`user-role ${user.role}`}>{user.role}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <h2>Welcome to The Punisher Gaming Lounge</h2>
          <p>You have successfully logged in to the Computer Center Management System.</p>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3, marginTop: 4 }}>
            {cards.map((card) => (
              <Card
                key={card.label}
                onClick={() => navigate(card.path)}
                sx={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,51,51,0.3)',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    borderColor: '#ff3333',
                    boxShadow: '0 10px 30px rgba(255,51,51,0.3)'
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', padding: 4 }}>
                  <Box sx={{ display: 'inline-flex', padding: 2.5, borderRadius: '50%', background: card.bg, marginBottom: 2 }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h5" sx={{ color: '#ff3333', fontWeight: 'bold', marginBottom: 1 }}>
                    {card.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ccc' }}>
                    {card.desc}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
