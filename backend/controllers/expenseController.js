const Expense = require('../models/Expense');

// GET all expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    
    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error: error.message
    });
  }
};

// GET single expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense',
      error: error.message
    });
  }
};

// CREATE new expense
exports.createExpense = async (req, res) => {
  try {
    const { description, amount, date, notes } = req.body;

    // Validation
    if (!description || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide description, amount, and date'
      });
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    const expenseId = await Expense.create({
      description,
      amount: parseFloat(amount),
      date,
      notes
    });

    const newExpense = await Expense.findById(expenseId);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: newExpense
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating expense',
      error: error.message
    });
  }
};

// UPDATE expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, date, notes } = req.body;

    // Check if expense exists
    const existingExpense = await Expense.findById(id);
    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Validation
    if (!description || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide description, amount, and date'
      });
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    const updated = await Expense.update(id, {
      description,
      amount: parseFloat(amount),
      date,
      notes
    });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update expense'
      });
    }

    const updatedExpense = await Expense.findById(id);

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: updatedExpense
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense',
      error: error.message
    });
  }
};

// DELETE expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if expense exists
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const deleted = await Expense.delete(id);

    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete expense'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense',
      error: error.message
    });
  }
};

// GET expenses by date range
exports.getExpensesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startDate and endDate query parameters'
      });
    }

    const expenses = await Expense.findByDateRange(startDate, endDate);
    const total = await Expense.getTotalByDateRange(startDate, endDate);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total: parseFloat(total),
      data: expenses
    });
  } catch (error) {
    console.error('Error fetching expenses by date range:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses by date range',
      error: error.message
    });
  }
};

// GET expense analytics
exports.getExpenseAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startDate and endDate query parameters'
      });
    }

    const statistics = await Expense.getStatistics(startDate, endDate);
    
    let groupedData = [];
    if (groupBy === 'day') {
      groupedData = await Expense.getGroupedByDate(startDate, endDate);
    } else if (groupBy === 'month') {
      groupedData = await Expense.getGroupedByMonth(startDate, endDate);
    }

    res.status(200).json({
      success: true,
      period: {
        startDate,
        endDate
      },
      statistics: {
        totalCount: parseInt(statistics.total_count),
        totalAmount: parseFloat(statistics.total_amount),
        averageAmount: parseFloat(statistics.avg_amount),
        minAmount: parseFloat(statistics.min_amount),
        maxAmount: parseFloat(statistics.max_amount)
      },
      groupedData: groupedData.map(item => ({
        ...item,
        total: parseFloat(item.total)
      }))
    });
  } catch (error) {
    console.error('Error fetching expense analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense analytics',
      error: error.message
    });
  }
};

// GET recent expenses
exports.getRecentExpenses = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const expenses = await Expense.getRecent(limit);

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    console.error('Error fetching recent expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent expenses',
      error: error.message
    });
  }
};
