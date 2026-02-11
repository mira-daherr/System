const db = require('../config/db');

class Customer {
  // Create new customer
  static async create(customerData) {
    const { name, phone, address, total_debt } = customerData;
    const [result] = await db.query(
      'INSERT INTO customers (name, phone, address, total_debt) VALUES (?, ?, ?, ?)',
      [name, phone, address, total_debt || 0]
    );
    return result.insertId;
  }

  // Find customer by phone
  static async findByPhone(phone) {
    const [rows] = await db.query(
      'SELECT * FROM customers WHERE phone = ? AND is_deleted = 0',
      [phone]
    );
    return rows[0];
  }

  // Find customer by ID
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM customers WHERE id = ? AND is_deleted = 0',
      [id]
    );
    return rows[0];
  }

  // Get all customers (not deleted)
  static async getAll() {
    const [rows] = await db.query(
      'SELECT * FROM customers WHERE is_deleted = 0 ORDER BY created_at DESC'
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

  // Soft delete customer
  static async delete(id) {
    await db.query(
      'UPDATE customers SET is_deleted = 1 WHERE id = ?',
      [id]
    );
  }
}

module.exports = Customer;