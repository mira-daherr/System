const db = require('../config/db');

class User {
  // Find user by username
  static async findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (error, results) => {
          if (error) {
            console.error('Error finding user:', error);
            return reject(error);
          }
          resolve(results[0] || null);
        }
      );
    });
  }

  // Find user by ID
  static async findById(userId) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM users WHERE id = ?',
        [userId],
        (error, results) => {
          if (error) {
            console.error('Error finding user by ID:', error);
            return reject(error);
          }
          resolve(results[0] || null);
        }
      );
    });
  }

  // Update user status
  static async updateStatus(userId, status) {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE users SET status = ? WHERE id = ?',
        [status, userId],
        (error, results) => {
          if (error) {
            console.error('Error updating status:', error);
            return reject(error);
          }
          resolve(results);
        }
      );
    });
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