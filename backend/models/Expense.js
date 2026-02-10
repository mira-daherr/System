const db = require('../config/db');

class Expense {
  // Get all expenses
  static async findAll() {
    try {
      const [expenses] = await db.query(
        'SELECT * FROM expenses ORDER BY date DESC, created_at DESC'
      );
      return expenses;
    } catch (error) {
      throw error;
    }
  }

  // Find expense by ID
  static async findById(id) {
    try {
      const [expense] = await db.query(
        'SELECT * FROM expenses WHERE id = ?',
        [id]
      );
      return expense[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new expense
  static async create(expenseData) {
    try {
      const { description, amount, date, notes } = expenseData;
      const [result] = await db.query(
        'INSERT INTO expenses (description, amount, date, notes, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [description, amount, date, notes || null]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Update expense
  static async update(id, expenseData) {
    try {
      const { description, amount, date, notes } = expenseData;
      const [result] = await db.query(
        'UPDATE expenses SET description = ?, amount = ?, date = ?, notes = ?, updated_at = NOW() WHERE id = ?',
        [description, amount, date, notes || null, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete expense
  static async delete(id) {
    try {
      const [result] = await db.query(
        'DELETE FROM expenses WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get expenses by date range
  static async findByDateRange(startDate, endDate) {
    try {
      const [expenses] = await db.query(
        'SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC',
        [startDate, endDate]
      );
      return expenses;
    } catch (error) {
      throw error;
    }
  }

  // Get total expenses by date range
  static async getTotalByDateRange(startDate, endDate) {
    try {
      const [result] = await db.query(
        'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date BETWEEN ? AND ?',
        [startDate, endDate]
      );
      return result[0].total;
    } catch (error) {
      throw error;
    }
  }

  // Get expenses grouped by date (for daily analytics)
  static async getGroupedByDate(startDate, endDate) {
    try {
      const [result] = await db.query(
        `SELECT 
          DATE(date) as expense_date,
          COUNT(*) as count,
          SUM(amount) as total
        FROM expenses 
        WHERE date BETWEEN ? AND ?
        GROUP BY DATE(date)
        ORDER BY expense_date DESC`,
        [startDate, endDate]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get expenses grouped by month (for monthly analytics)
  static async getGroupedByMonth(startDate, endDate) {
    try {
      const [result] = await db.query(
        `SELECT 
          YEAR(date) as year,
          MONTH(date) as month,
          DATE_FORMAT(date, '%Y-%m') as month_year,
          COUNT(*) as count,
          SUM(amount) as total
        FROM expenses 
        WHERE date BETWEEN ? AND ?
        GROUP BY YEAR(date), MONTH(date)
        ORDER BY year DESC, month DESC`,
        [startDate, endDate]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get expense statistics for a date range
  static async getStatistics(startDate, endDate) {
    try {
      const [result] = await db.query(
        `SELECT 
          COUNT(*) as total_count,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(AVG(amount), 0) as avg_amount,
          COALESCE(MIN(amount), 0) as min_amount,
          COALESCE(MAX(amount), 0) as max_amount
        FROM expenses 
        WHERE date BETWEEN ? AND ?`,
        [startDate, endDate]
      );
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Get recent expenses (last N records)
  static async getRecent(limit = 10) {
    try {
      const [expenses] = await db.query(
        'SELECT * FROM expenses ORDER BY date DESC, created_at DESC LIMIT ?',
        [limit]
      );
      return expenses;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Expense;
