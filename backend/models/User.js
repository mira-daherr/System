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

  // ============================================
  // NEW: RESET PASSWORD METHODS
  // ============================================

  // Generate 6-digit random code
  static generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Save reset code for user
  static async saveResetCode(username, code) {
    try {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
      
      const [result] = await db.query(
        'UPDATE users SET reset_code = ?, reset_code_expires = ? WHERE username = ?',
        [code, expiresAt, username]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error saving reset code:', error);
      throw error;
    }
  }

  // Verify reset code
  static async verifyResetCode(username, code) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM users WHERE username = ? AND reset_code = ? AND reset_code_expires > NOW()',
        [username, code]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error verifying reset code:', error);
      throw error;
    }
  }

  // Clear reset code after use
  static async clearResetCode(username) {
    try {
      const [result] = await db.query(
        'UPDATE users SET reset_code = NULL, reset_code_expires = NULL WHERE username = ?',
        [username]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error clearing reset code:', error);
      throw error;
    }
  }

  // Update password
  static async updatePassword(username, newPassword) {
    try {
      // Check if you're using bcrypt or plain text passwords
      // If using bcrypt (recommended):
      // const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // If using plain text (like your current verifyPassword method):
      const passwordToStore = newPassword; // or use hashedPassword if using bcrypt
      
      const [result] = await db.query(
        'UPDATE users SET password = ? WHERE username = ?',
        [passwordToStore, username]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
}

module.exports = User;