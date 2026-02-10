import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { expensesAPI } from '../../services/api';
import { getAuthToken, isAuthenticated } from '../../utils/auth';
import './style.css';

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Date filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analytics, setAnalytics] = useState(null);

  // Modal states
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Set default date range (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    
    fetchExpenses();
  }, [navigate]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAnalytics();
      filterExpensesByDateRange();
    }
  }, [startDate, endDate, expenses]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getAuthToken();
      const response = await expensesAPI.getAll(token);
      
      if (response.success) {
        setExpenses(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch expenses');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch expenses');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      if (!startDate || !endDate) return;
      
      const token = getAuthToken();
      const response = await expensesAPI.getAnalytics(startDate, endDate, 'day', token);
      
      if (response.success) {
        setAnalytics(response.statistics);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const filterExpensesByDateRange = () => {
    if (!startDate || !endDate) {
      setFilteredExpenses(expenses);
      return;
    }

    const filtered = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return expenseDate >= start && expenseDate <= end;
    });

    setFilteredExpenses(filtered);
  };

  const handleOpenDialog = (expense = null) => {
    if (expense) {
      setEditMode(true);
      setCurrentExpense(expense);
      setFormData({
        description: expense.description,
        amount: expense.amount,
        date: new Date(expense.date).toISOString().split('T')[0],
        notes: expense.notes || ''
      });
    } else {
      setEditMode(false);
      setCurrentExpense(null);
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentExpense(null);
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');

      // Validation
      if (!formData.description || !formData.amount || !formData.date) {
        setError('Please fill in all required fields');
        return;
      }

      if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
        setError('Amount must be a positive number');
        return;
      }

      const token = getAuthToken();
      let response;

      if (editMode && currentExpense) {
        response = await expensesAPI.update(currentExpense.id, formData, token);
      } else {
        response = await expensesAPI.create(formData, token);
      }

      if (response.success) {
        setSuccess(editMode ? 'Expense updated successfully' : 'Expense created successfully');
        handleCloseDialog();
        fetchExpenses();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Operation failed');
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
      console.error('Error saving expense:', err);
    }
  };

  const handleOpenDeleteDialog = (expense) => {
    setCurrentExpense(expense);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentExpense(null);
  };

  const handleDelete = async () => {
    try {
      setError('');
      setSuccess('');

      const token = getAuthToken();
      const response = await expensesAPI.delete(currentExpense.id, token);

      if (response.success) {
        setSuccess('Expense deleted successfully');
        handleCloseDeleteDialog();
        fetchExpenses();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to delete expense');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
      console.error('Error deleting expense:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box className="expenses-container">
      {/* Header */}
      <Box className="expenses-header">
        <Box className="header-top">
          <IconButton
            onClick={() => navigate('/dashboard')}
            className="back-button"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" className="page-title">
            💰 Expense Management
          </Typography>
        </Box>

        {/* Date Range Filter */}
        <Box className="date-filter">
          <TextField
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            className="date-input"
          />
          <TextField
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            className="date-input"
          />
          <Button
            variant="outlined"
            onClick={() => {
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
              setStartDate(firstDay.toISOString().split('T')[0]);
              setEndDate(today.toISOString().split('T')[0]);
            }}
            className="reset-date-btn"
          >
            This Month
          </Button>
        </Box>
      </Box>

      {/* Analytics Cards */}
      {analytics && (
        <Grid container spacing={3} className="analytics-cards">
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card">
              <CardContent>
                <Box className="stat-icon total">
                  <AttachMoneyIcon />
                </Box>
                <Typography className="stat-label">Total Expenses</Typography>
                <Typography className="stat-value">
                  {formatCurrency(analytics.totalAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card">
              <CardContent>
                <Box className="stat-icon count">
                  <ReceiptIcon />
                </Box>
                <Typography className="stat-label">Total Count</Typography>
                <Typography className="stat-value">
                  {analytics.totalCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card">
              <CardContent>
                <Box className="stat-icon date">
                  <CalendarTodayIcon />
                </Box>
                <Typography className="stat-label">Period</Typography>
                <Typography className="stat-value small">
                  {formatDate(startDate)} - {formatDate(endDate)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Expenses Table */}
      {loading ? (
        <Box className="loading-container">
          <CircularProgress sx={{ color: '#FF3333' }} />
        </Box>
      ) : (
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="table-header">Date</TableCell>
                <TableCell className="table-header">Description</TableCell>
                <TableCell className="table-header">Amount</TableCell>
                <TableCell className="table-header">Notes</TableCell>
                <TableCell className="table-header" align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" className="empty-state">
                    {expenses.length === 0 
                      ? 'No expenses found. Click the + button to add your first expense.'
                      : 'No expenses in the selected date range.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="table-row">
                    <TableCell className="table-cell">
                      {formatDate(expense.date)}
                    </TableCell>
                    <TableCell className="table-cell">
                      {expense.description}
                    </TableCell>
                    <TableCell className="table-cell amount">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell className="table-cell notes">
                      {expense.notes || '-'}
                    </TableCell>
                    <TableCell className="table-cell" align="center">
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => handleOpenDialog(expense)}
                          className="action-btn edit"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleOpenDeleteDialog(expense)}
                          className="action-btn delete"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Expense FAB */}
      <Fab
        color="primary"
        aria-label="add"
        className="add-fab"
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        className="expense-dialog"
      >
        <DialogTitle className="dialog-title">
          {editMode ? '✏️ Edit Expense' : '➕ Add New Expense'}
        </DialogTitle>
        <DialogContent className="dialog-content">
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Description *"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              className="dialog-input"
            />
            <TextField
              fullWidth
              label="Amount *"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              margin="normal"
              className="dialog-input"
              inputProps={{ step: '0.01', min: '0' }}
            />
            <TextField
              fullWidth
              label="Date *"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              className="dialog-input"
            />
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
              className="dialog-input"
            />
          </Box>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseDialog} className="cancel-btn">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" className="submit-btn">
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        className="delete-dialog"
      >
        <DialogTitle className="dialog-title">⚠️ Confirm Delete</DialogTitle>
        <DialogContent className="dialog-content">
          <Typography>
            Are you sure you want to delete this expense?
          </Typography>
          {currentExpense && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 51, 51, 0.1)', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Description:</strong> {currentExpense.description}
              </Typography>
              <Typography variant="body2">
                <strong>Amount:</strong> {formatCurrency(currentExpense.amount)}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {formatDate(currentExpense.date)}
              </Typography>
            </Box>
          )}
        </DialogContent>A
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseDeleteDialog} className="cancel-btn">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" className="delete-btn">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Expenses;
