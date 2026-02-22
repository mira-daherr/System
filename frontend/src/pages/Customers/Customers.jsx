import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, TextField, Button, Box } from '@mui/material';
import { customerPurchasesAPI } from '../../services/api';
import './customers-list.css';

const Customers = () => {
  const token = localStorage.getItem('token');

  // State
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [processingPayment, setProcessingPayment] = useState({});

  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch customers on mount and when filter or dates change
  useEffect(() => {
    fetchCustomers();
  }, [filter, startDate, endDate]);

  // ===================================
  // FETCH CUSTOMERS WITH HISTORY
  // ===================================
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerPurchasesAPI.getCustomersWithHistory(
        filter === 'custom' ? 'custom' : filter, 
        token,
        startDate,
        endDate
      );
      // Sort by most recent first (by updated_at or created_at)
      const sortedCustomers = (response.data || []).sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at);
        const dateB = new Date(b.updated_at || b.created_at);
        return dateB - dateA; // Most recent first
      });
      setCustomers(sortedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setSnackbar({
        open: true,
        message: '❌ Error loading customers!',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // ===================================
  // HANDLE PAYMENT AMOUNT CHANGE
  // ===================================
  const handlePaymentChange = (customerId, value) => {
    setPaymentAmounts(prev => ({
      ...prev,
      [customerId]: value
    }));
  };

  // ===================================
  // PROCESS PAYMENT
  // ===================================
  const handleProcessPayment = async (customer) => {
    const paymentAmount = parseFloat(paymentAmounts[customer.id]) || 0;

    if (paymentAmount <= 0) {
      setSnackbar({
        open: true,
        message: '⚠️ Please enter a valid payment amount',
        severity: 'warning'
      });
      return;
    }

    const currentDebt = parseFloat(customer.total_debt) || 0;
    if (paymentAmount > currentDebt) {
      setSnackbar({
        open: true,
        message: '⚠️ Payment amount cannot exceed current debt',
        severity: 'warning'
      });
      return;
    }

    setProcessingPayment(prev => ({ ...prev, [customer.id]: true }));

    try {
      const response = await customerPurchasesAPI.processPayment(
        customer.id,
        paymentAmount,
        token
      );

      if (response.success) {
        setSnackbar({
          open: true,
          message: `✅ Payment of L.L ${paymentAmount.toFixed(3)} processed for ${customer.name}!`,
          severity: 'success'
        });

        // Clear payment input
        setPaymentAmounts(prev => ({
          ...prev,
          [customer.id]: ''
        }));

        // Refresh customers list
        fetchCustomers();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setSnackbar({
        open: true,
        message: '❌ ' + (error.message || 'Error processing payment'),
        severity: 'error'
      });
    } finally {
      setProcessingPayment(prev => ({ ...prev, [customer.id]: false }));
    }
  };

  // ===================================
  // HANDLE SNACKBAR CLOSE
  // ===================================
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // ===================================
  // FORMAT PURCHASE DATES
  // ===================================
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // ===================================
  // RENDER
  // ===================================
  return (
    <div className="customers-page">
      <div className="header">
        <button 
          type="button"
          className="back-btn" 
          onClick={() => window.history.back()}
        >
          ←
        </button>
        <h1>Customers</h1>
        
        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'day' ? 'active' : ''}`}
            onClick={() => {
              setFilter('day');
              setStartDate('');
              setEndDate('');
            }}
          >
            Today
          </button>
          <button 
            className={`filter-tab ${filter === 'week' ? 'active' : ''}`}
            onClick={() => {
              setFilter('week');
              setStartDate('');
              setEndDate('');
            }}
          >
            Week
          </button>
          <button 
            className={`filter-tab ${filter === 'month' ? 'active' : ''}`}
            onClick={() => {
              setFilter('month');
              setStartDate('');
              setEndDate('');
            }}
          >
            Month
          </button>
        </div>
        
        <Box className="date-filter">
         <TextField
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => {
                setStartDate(e.target.value);
                setFilter('custom');
            }}
            InputLabelProps={{ shrink: true }}
            className="date-input"
            size="small"
            />

            <TextField
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => {
                setEndDate(e.target.value);
                setFilter('custom');
            }}
            InputLabelProps={{ shrink: true }}
            className="date-input"
            size="small"
            />

          <Button
            variant="outlined"
            onClick={() => {
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
              setStartDate(firstDay.toISOString().split('T')[0]);
              setEndDate(today.toISOString().split('T')[0]);
              setFilter('custom');
            }}
            className="reset-date-btn"
            size="small"
          >
            This Month
          </Button>
        </Box>
        
        <div className="stats">
          <span>📋 {customers.length} Customers</span>
          <span>•</span>
          <span>💳 {customers.filter(c => parseFloat(c.total_debt) > 0).length} With Debt</span>
          <span>•</span>
          <span>💰 Total: L.L {(customers.reduce((sum, c) => sum + (parseFloat(c.total_debt) || 0), 0) * 1000).toLocaleString()}</span>
        </div>
      </div>

      {/* Customers List */}
      <div className="customers-container">
        {loading ? (
          <div className="loading-state">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <p>No customers found</p>
          </div>
        ) : (
          <div className="customers-grid">
            {customers.map(customer => {
              const debt = parseFloat(customer.total_debt) || 0;
              const hasDebt = debt > 0;
              const totalPurchases = parseInt(customer.total_purchases) || 0;
              const totalSpent = parseFloat(customer.total_spent) || 0;
              const purchases = customer.purchases || [];

              return (
                <div 
                  key={customer.id} 
                  className="customer-card"
                >
                  <div className="customer-name">{customer.name}</div>
                  
                  <div className="customer-info">
                    <div className="purchases-by-date">
                      {purchases.length > 0 ? (
                        purchases.map((purchase, idx) => (
                          <div key={purchase.id} className="purchase-item">
                            <span className="purchase-date">{formatDate(purchase.purchase_date)}</span>
                            <span className="purchase-items">{purchase.items || 'No items'}</span>
                            <span className="purchase-amount">L.L {(purchase.total_amount * 1000).toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <div className="no-purchases">No purchases in this period</div>
                      )}
                    </div>
                    <div className="totals-summary">
                      <span className="total-label">Total:</span>
                      <span className="total-purchases">{totalPurchases} purchases</span>
                      <span className="total-spent">L.L {(totalSpent * 1000).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className={`customer-debt ${hasDebt ? 'has-debt' : 'no-debt'}`}>
                    {hasDebt ? (
                      <>
                        <div className="debt-label">Outstanding Debt</div>
                        <div className="debt-amount">L.L {(debt * 1000).toLocaleString()}</div>
                      </>
                    ) : (
                      <>
                        <div className="debt-label">Fully Paid</div>
                        <div className="debt-amount">✅ No Debt</div>
                      </>
                    )}
                  </div>

                  {hasDebt && (
                    <div className="payment-section">
                      <div className="payment-input-wrapper">
                        <label>Payment Amount (L.L)</label>
                        <input
                          type="number"
                          placeholder="amount"
                          step="0.001"
                          min="0"
                          max={debt}
                          value={paymentAmounts[customer.id] || ''}
                          onChange={(e) => handlePaymentChange(customer.id, e.target.value)}
                          disabled={processingPayment[customer.id]}
                        />
                      </div>
                      <div className="payment-buttons">
                        <button
                          className="btn-full"
                          onClick={() => handlePaymentChange(customer.id, debt.toFixed(3))}
                          disabled={processingPayment[customer.id]}
                        >
                          Pay Full Amount
                        </button>
                        <button
                          className="btn-save"
                          onClick={() => handleProcessPayment(customer)}
                          disabled={processingPayment[customer.id] || !paymentAmounts[customer.id]}
                        >
                          {processingPayment[customer.id] ? 'Processing...' : 'Process Payment'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            backgroundColor: 
              snackbar.severity === 'success' ? '#2e7d32' : 
              snackbar.severity === 'warning' ? '#ed6c02' : 
              '#d32f2f',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            '& .MuiAlert-icon': {
              color: '#fff'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Customers;