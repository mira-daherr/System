const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticate } = require('../middleware/authMiddleware');

// Apply authentication to ALL expense routes
router.use(authenticate);

// GET recent expenses
router.get('/recent', expenseController.getRecentExpenses);

// GET expense analytics
router.get('/analytics', expenseController.getExpenseAnalytics);

// GET expenses by date range
router.get('/date-range', expenseController.getExpensesByDateRange);

// GET all expenses
router.get('/', expenseController.getAllExpenses);

// GET single expense by ID
router.get('/:id', expenseController.getExpenseById);

// CREATE new expense
router.post('/', expenseController.createExpense);

// UPDATE expense
router.put('/:id', expenseController.updateExpense);

// DELETE expense
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
