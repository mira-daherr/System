const db = require('../config/db');

class User {
  // Find user by username
  static async findByUsername(username) {
    try {
      const [results] = await db.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return results[0] || null;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  // Find user by ID
  static async findById(userId) {
    try {
      const [results] = await db.query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
      return results[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Update user status
  static async updateStatus(userId, status) {
    try {
      const [results] = await db.query(
        'UPDATE users SET status = ? WHERE id = ?',
        [status, userId]
      );
      return results;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  }

  // Verify password
  static verifyPassword(user, password) {
    return user.password === password;
  }

  // Get safe user (without password)
  static getSafeUser(user) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}

module.exports = User;