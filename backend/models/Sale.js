const db = require('../config/db');

class Sale {
  // Create new sale
  static async create(saleData) {
    const { 
      customer_id, 
      customer_name, 
      total_amount, 
      paid_amount, 
      remaining_amount, 
      notes 
    } = saleData;
    
    const [result] = await db.query(
      `INSERT INTO sales 
       (customer_id, customer_name, total_amount, paid_amount, remaining_amount, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [customer_id, customer_name, total_amount, paid_amount, remaining_amount, notes]
    );
    return result.insertId;
  }

  // Get all sales (not deleted)
  static async getAll() {
    const [rows] = await db.query(`
      SELECT 
        s.*,
        c.name as customer_name,
        c.phone
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.is_deleted = 0
      ORDER BY s.sale_date DESC
    `);
    return rows;
  }

  // Get sale by ID
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM sales WHERE id = ? AND is_deleted = 0',
      [id]
    );
    return rows[0];
  }

  // Get sales by customer ID
  static async getByCustomerId(customerId) {
    const [rows] = await db.query(
      'SELECT * FROM sales WHERE customer_id = ? AND is_deleted = 0 ORDER BY sale_date DESC',
      [customerId]
    );
    return rows;
  }

  // Soft delete sale
  static async delete(id) {
    await db.query(
      'UPDATE sales SET is_deleted = 1 WHERE id = ?',
      [id]
    );
  }
}

module.exports = Sale;