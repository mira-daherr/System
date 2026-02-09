const db = require('../config/db');

class Product {
  // Find all products (INCLUDING DELETED)
  static async findAll() {
    try {
      const [products] = await db.query(
        'SELECT * FROM products ORDER BY is_active DESC, id ASC'
      );
      console.log('📦 All products fetched:', products.length, 'products');
      return products;
    } catch (error) {
      throw error;
    }
  }

  // Find product by ID (INCLUDING DELETED)
  static async findById(id) {
    try {
      const [product] = await db.query(
        'SELECT * FROM products WHERE id = ?',
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
      console.log('🗑️ Soft deleted product ID:', id, '- Affected rows:', result.affectedRows);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Restore soft-deleted product
  static async restore(id) {
    try {
      console.log('🔄 Restoring product ID:', id);
      
      const [result] = await db.query(
        'UPDATE products SET is_active = 1, updated_at = NOW() WHERE id = ?',
        [id]
      );
      
      console.log('✅ Product restored - Affected rows:', result.affectedRows);
      
      return result.affectedRows;
    } catch (error) {
      console.error('❌ Database error in restore:', error);
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

  // Find products by name (INCLUDING DELETED)
  static async searchByName(searchTerm) {
    try {
      const [products] = await db.query(
        'SELECT * FROM products WHERE name LIKE ? ORDER BY is_active DESC, id ASC',
        [`%${searchTerm}%`]
      );
      return products;
    } catch (error) {
      throw error;
    }
  }

  // Find products by price range (INCLUDING DELETED)
  static async findByPriceRange(minPrice, maxPrice) {
    try {
      const [products] = await db.query(
        'SELECT * FROM products WHERE price BETWEEN ? AND ? ORDER BY is_active DESC, id ASC',
        [minPrice, maxPrice]
      );
      return products;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Product;