const db = require('../config/db');

class Category {
  // Find all categories
  static async findAll() {
    try {
      const [categories] = await db.query(
        'SELECT * FROM categories ORDER BY name ASC'
      );
      console.log('📦 All categories fetched:', categories.length);
      return categories;
    } catch (error) {
      throw error;
    }
  }

  // Find category by ID
  static async findById(id) {
    try {
      const [category] = await db.query(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      );
      return category[0];
    } catch (error) {
      throw error;
    }
  }

  // Find category by name
  static async findByName(name) {
    try {
      const [category] = await db.query(
        'SELECT * FROM categories WHERE name = ?',
        [name]
      );
      return category[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new category
  static async create(categoryData) {
    try {
      const { name, icon, color, description } = categoryData;
      const [result] = await db.query(
        'INSERT INTO categories (name, icon, color, description) VALUES (?, ?, ?, ?)',
        [name, icon || '📦', color || '#FF3333', description || '']
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Update category
  static async update(id, categoryData) {
    try {
      const { name, icon, color, description } = categoryData;
      
      const updates = [];
      const values = [];
      
      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }
      if (icon !== undefined) {
        updates.push('icon = ?');
        values.push(icon);
      }
      if (color !== undefined) {
        updates.push('color = ?');
        values.push(color);
      }
      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
      }
      
      if (updates.length === 0) {
        return null;
      }
      
      updates.push('updated_at = NOW()');
      values.push(id);
      
      const query = `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await db.query(query, values);
      
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Delete category
  static async delete(id) {
    try {
      const [result] = await db.query(
        'DELETE FROM categories WHERE id = ?',
        [id]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Check if category exists
  static async exists(id) {
    try {
      const [category] = await db.query(
        'SELECT id FROM categories WHERE id = ?',
        [id]
      );
      return category.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get product count for category
  static async getProductCount(categoryName) {
    try {
      const [result] = await db.query(
        'SELECT COUNT(*) as count FROM products WHERE category = ? AND is_active = 1',
        [categoryName]
      );
      return result[0].count;
    } catch (error) {
      throw error;
    }
  }

  // Get all categories with product counts
  static async findAllWithCounts() {
    try {
      const [categories] = await db.query(`
        SELECT 
          c.*,
          COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.name = p.category COLLATE utf8mb4_unicode_ci AND p.is_active = 1
        GROUP BY c.id
        ORDER BY c.name ASC
      `);
      return categories;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Category;