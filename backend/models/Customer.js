const db = require('../config/db');

class Customer {
  // Create new customer
  static async create(customerData) {
    const { name, total_debt } = customerData;
    const [result] = await db.query(
      'INSERT INTO customers (name, total_debt) VALUES (?, ?)',
      [name, total_debt || 0]
    );
    return result.insertId;
  }

  // Find customer by ID
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM customers WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Get all customers
  static async getAll() {
    const [rows] = await db.query(
      'SELECT * FROM customers ORDER BY created_at DESC'
    );
    return rows;
  }

  // Update customer debt
  static async updateDebt(id, debtAmount) {
    await db.query(
      'UPDATE customers SET total_debt = total_debt + ? WHERE id = ?',
      [debtAmount, id]
    );
  }

  // Delete customer (hard delete)
  static async delete(id) {
    await db.query(
      'DELETE FROM customers WHERE id = ?',
      [id]
    );
  }
}

module.exports = Customer;