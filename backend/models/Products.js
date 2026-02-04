const db = require('../config/db');

class Product {
  // Find all products
  static async findAll() {
    try {
      const [products] = await db.query(
        'SELECT * FROM products WHERE is_active = 1 ORDER BY id'
      );
      return products;
    } catch (error) {
      throw error;
    }
  }

  // Find product by ID
  static async findById(id) {
    try {
      const [product] = await db.query(
        'SELECT * FROM products WHERE id = ? AND is_active = 1',
        [id]
      );
      return product[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new product
  static async create(productData) {
    try {
      const { name, price, image } = productData;
      const [result] = await db.query(
        'INSERT INTO products (name, price, image, is_active) VALUES (?, ?, ?, 1)',
        [name, price, image || null]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Update product
  static async update(id, productData) {
    try {
      const { name, price, image, is_active } = productData;
      
      // Build update query dynamically
      const updates = [];
      const values = [];
      
      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }
      if (price !== undefined) {
        updates.push('price = ?');
        values.push(price);
      }
      if (image !== undefined) {
        updates.push('image = ?');
        values.push(image);
      }
      if (is_active !== undefined) {
        updates.push('is_active = ?');
        values.push(is_active);
      }
      
      if (updates.length === 0) {
        return null;
      }
      
      updates.push('updated_at = NOW()');
      values.push(id);
      
      const query = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await db.query(query, values);
      
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Soft delete product
  static async softDelete(id) {
    try {
      const [result] = await db.query(
        'UPDATE products SET is_active = 0, updated_at = NOW() WHERE id = ?',
        [id]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Hard delete product
  static async hardDelete(id) {
    try {
      const [result] = await db.query(
        'DELETE FROM products WHERE id = ?',
        [id]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Check if product exists
  static async exists(id) {
    try {
      const [product] = await db.query(
        'SELECT id FROM products WHERE id = ?',
        [id]
      );
      return product.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Find products by name (search)
  static async searchByName(searchTerm) {
    try {
      const [products] = await db.query(
        'SELECT * FROM products WHERE name LIKE ? AND is_active = 1',
        [`%${searchTerm}%`]
      );
      return products;
    } catch (error) {
      throw error;
    }
  }

  // Find products by price range
  static async findByPriceRange(minPrice, maxPrice) {
    try {
      const [products] = await db.query(
        'SELECT * FROM products WHERE price BETWEEN ? AND ? AND is_active = 1',
        [minPrice, maxPrice]
      );
      return products;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Product;