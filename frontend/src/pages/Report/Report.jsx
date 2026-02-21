import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, IconButton, CircularProgress,
  Alert, Grid, Card, CardContent
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  SportsEsports as GamesIcon,
  ShoppingCart as ProductsIcon,
  MoneyOff as ExpensesIcon,
  AccountBalance as ProfitIcon,
  TrendingUp as GainIcon,
  AttachMoney as RevenueIcon,
  LocalAtm as CostIcon
} from '@mui/icons-material';
import { reportsAPI } from '../../services/api';
import { getAuthToken, isAuthenticated } from '../../utils/auth';
import './style.css';

const Reports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [rate, setRate] = useState('');

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);

  const [dailyDate, setDailyDate] = useState(today.toISOString().split('T')[0]);
  const [weekStart, setWeekStart] = useState(weekAgo.toISOString().split('T')[0]);
  const [weekEnd,   setWeekEnd]   = useState(today.toISOString().split('T')[0]);
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [year,  setYear]  = useState(String(today.getFullYear()));

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login'); return; }
    fetchReport();
  }, [activeTab]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError('');
      setData(null);
      const token = getAuthToken();
      let response;

      if (activeTab === 'daily') {
        response = await reportsAPI.getDaily(dailyDate, token);
      } else if (activeTab === 'weekly') {
        response = await reportsAPI.getWeekly(weekStart, weekEnd, token);
      } else {
        response = await reportsAPI.getMonthly(month, year, token);
      }

      if (response.success) setData(response.data);
      else setError(response.message || 'Failed to fetch report');
    } catch (err) {
      setError(err.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const fmtLL = (val) =>
  (Number(val || 0) * 1000).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmtUSD = (val) => {
  if (!rate || parseFloat(rate) <= 0) return null;
  const usd = (Number(val || 0) * 1000) / parseFloat(rate);
  return usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

  const monthName = (m) => new Date(2000, parseInt(m) - 1).toLocaleString('en', { month: 'long' });

  const getPeriodLabel = () => {
    if (activeTab === 'daily')  return dailyDate;
    if (activeTab === 'weekly') return `${weekStart} → ${weekEnd}`;
    return `${monthName(month)} ${year}`;
  };

  const SummaryCard = ({ label, val, cardClass, iconClass, icon, isExpense, isProfit }) => (
    <Card className={`summary-card ${cardClass}`}>
      <CardContent className="summary-card-inner">
        <Box className={`summary-icon ${iconClass}`}>{icon}</Box>
        <Typography className="summary-label">{label}</Typography>
        <Typography className={`summary-value ${isExpense ? 'expenses-val' : ''} ${isProfit && val < 0 ? 'profit-neg' : ''}`}>
          {fmtLL(val)} <span className="currency">L.L</span>
        </Typography>
        {fmtUSD(val) && (
          <Typography className="summary-usd">
            ≈ ${fmtUSD(val)} USD
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box className="reports-container">

      {/* Header */}
      <Box className="reports-header">
        <Box className="header-top">
          <IconButton onClick={() => navigate('/dashboard')} className="back-button">
            <ArrowBackIcon />
          </IconButton>
          <Typography className="page-title">REPORTS</Typography>
        </Box>

        <Box className="report-tabs">
          {['daily', 'weekly', 'monthly'].map(tab => (
            <button
              key={tab}
              className={`report-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </Box>
      </Box>

      {/* Filters */}
      <Box className="report-filters">
        {activeTab === 'daily' && (
          <Box className="filter-row">
            <label className="filter-label">DATE</label>
            <input type="date" value={dailyDate} onChange={e => setDailyDate(e.target.value)} className="filter-input" />
            <button onClick={fetchReport} className="fetch-btn">GENERATE</button>
          </Box>
        )}
        {activeTab === 'weekly' && (
          <Box className="filter-row">
            <label className="filter-label">FROM</label>
            <input type="date" value={weekStart} onChange={e => setWeekStart(e.target.value)} className="filter-input" />
            <label className="filter-label">TO</label>
            <input type="date" value={weekEnd} onChange={e => setWeekEnd(e.target.value)} className="filter-input" />
            <button onClick={fetchReport} className="fetch-btn">GENERATE</button>
          </Box>
        )}
        {activeTab === 'monthly' && (
          <Box className="filter-row">
            <label className="filter-label">MONTH</label>
            <select value={month} onChange={e => setMonth(e.target.value)} className="filter-input filter-select">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i+1} value={String(i+1)}>{monthName(i+1)}</option>
              ))}
            </select>
            <label className="filter-label">YEAR</label>
            <input type="number" value={year} onChange={e => setYear(e.target.value)} className="filter-input" style={{ width: 90 }} min="2020" max="2100" />
            <button onClick={fetchReport} className="fetch-btn">GENERATE</button>
          </Box>
        )}

        {/* USD Rate */}
        <Box className="rate-row">
          <label className="filter-label">1 USD =</label>
          <input
            type="number"
            value={rate}
            onChange={e => setRate(e.target.value)}
            className="filter-input rate-input"
            placeholder="e.g. 90000"
            min="1"
          />
          <label className="filter-label">L.L</label>
          {rate && <span className="rate-preview">1 USD = {Number(rate).toLocaleString()} L.L</span>}
        </Box>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

      {loading && (
        <Box className="loading-container">
          <CircularProgress sx={{ color: '#e8001c' }} />
        </Box>
      )}

      {/* Report */}
      {!loading && data && (
        <Box className="report-content">

          <Typography className="period-label">📅 {getPeriodLabel()}</Typography>

          {/* All Financial Metrics */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <SummaryCard
                label="TOTAL REVENUE"
                val={data.total_revenue}
                cardClass="revenue"
                iconClass=""
                icon={<RevenueIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <SummaryCard
                label="PRODUCT COSTS"
                val={data.product_costs}
                cardClass="costs"
                iconClass=""
                icon={<CostIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <SummaryCard
                label="TOTAL GAIN"
                val={data.total_gain}
                cardClass="total-gain"
                iconClass=""
                icon={<GainIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <SummaryCard
                label="GAMES GAIN"
                val={data.games_gain}
                cardClass="games"
                iconClass=""
                icon={<GamesIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <SummaryCard
                label="PRODUCTS GAIN"
                val={data.products_gain}
                cardClass="products"
                iconClass=""
                icon={<ProductsIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <SummaryCard
                label="TOTAL EXPENSES"
                val={data.total_expenses}
                cardClass="expenses"
                iconClass="expenses-icon"
                icon={<ExpensesIcon />}
                isExpense
              />
            </Grid>
          </Grid>

          {/* Net Profit Banner - Final Result */}
          <Box className={`profit-banner ${data.net_profit >= 0 ? 'banner-pos' : 'banner-neg'}`}>
            <Box>
              <Typography className="profit-banner-label">NET PROFIT</Typography>
              <Typography className="profit-banner-formula">
                {fmtLL(data.total_gain)} (Gain) − {fmtLL(data.total_expenses)} (Expenses)
              </Typography>
            </Box>
            <Box className="profit-banner-values">
              <Typography className="profit-banner-value">
                {data.net_profit >= 0 ? '+' : ''}{fmtLL(data.net_profit)} L.L
              </Typography>
              {fmtUSD(data.net_profit) && (
                <Typography className="profit-banner-usd">
                  ≈ {data.net_profit >= 0 ? '+' : ''}${fmtUSD(data.net_profit)} USD
                </Typography>
              )}
            </Box>
          </Box>

        </Box>
      )}
    </Box>
  );
};

export default Reports;