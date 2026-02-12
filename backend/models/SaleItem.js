const db = require('../config/db');

class SaleItem {
  // Create sale item
  static async create(itemData) {
    const { 
      sale_id, 
      item_type, 
      item_id, 
      item_name, 
      quantity, 
      price, 
      total 
    } = itemData;
    
    const [result] = await db.query(
      `INSERT INTO sale_items 
       (sale_id, item_type, item_id, item_name, quantity, price, total) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sale_id, item_type, item_id, item_name, quantity, price, total]
    );
    return result.insertId;
  }

  // Get items by sale ID
  static async getBySaleId(saleId) {
    const [rows] = await db.query(
      'SELECT * FROM sale_items WHERE sale_id = ?',
      [saleId]
    );
    return rows;
  }

  // Delete items by sale ID
  static async deleteBySaleId(saleId) {
    await db.query(
      'DELETE FROM sale_items WHERE sale_id = ?',
      [saleId]
    );
  }
}

module.exports = SaleItem;
