const db = require('../config/db');

class Game {
  // Find all games
  static async findAll() {
    try {
      const [games] = await db.query(
        'SELECT * FROM games ORDER BY is_active DESC, id ASC'
      );
      return games;
    } catch (error) {
      throw error;
    }
  }

  // Find game by ID
  static async findById(id) {
    try {
      const [game] = await db.query(
        'SELECT * FROM games WHERE id = ?',
        [id]
      );
      return game[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new game
  static async create(gameData) {
    try {
      const { name, price_per_hour, price_per_round } = gameData;
      const [result] = await db.query(
        'INSERT INTO games (name, price_per_hour, price_per_round, is_active) VALUES (?, ?, ?, 1)',
        [name, price_per_hour || 0, price_per_round || 0]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Update game
  static async update(id, gameData) {
    try {
      const { name, price_per_hour, price_per_round, is_active } = gameData;
      
      const updates = [];
      const values = [];
      
      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }
      if (price_per_hour !== undefined) {
        updates.push('price_per_hour = ?');
        values.push(price_per_hour);
      }
      if (price_per_round !== undefined) {
        updates.push('price_per_round = ?');
        values.push(price_per_round);
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
      
      const query = `UPDATE games SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await db.query(query, values);
      
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Soft delete game
  static async softDelete(id) {
    try {
      const [result] = await db.query(
        'UPDATE games SET is_active = 0, updated_at = NOW() WHERE id = ?',
        [id]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Restore soft-deleted game
  static async restore(id) {
    try {
      const [result] = await db.query(
        'UPDATE games SET is_active = 1, updated_at = NOW() WHERE id = ?',
        [id]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Hard delete game
  static async hardDelete(id) {
    try {
      const [result] = await db.query(
        'DELETE FROM games WHERE id = ?',
        [id]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Check if game exists
  static async exists(id) {
    try {
      const [game] = await db.query(
        'SELECT id FROM games WHERE id = ?',
        [id]
      );
      return game.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Search games by name
  static async searchByName(searchTerm) {
    try {
      const [games] = await db.query(
        'SELECT * FROM games WHERE name LIKE ? ORDER BY is_active DESC, id ASC',
        [`%${searchTerm}%`]
      );
      return games;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Game;