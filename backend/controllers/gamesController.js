const Game = require('../models/Game');

// GET all games
exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.findAll();

    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching games',
      error: error.message
    });
  }
};

// GET single game by ID
exports.getGameById = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching game',
      error: error.message
    });
  }
};

// CREATE new game
exports.createGame = async (req, res) => {
  try {
    const { name, price_per_hour, price_per_round } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide game name'
      });
    }

    const gameId = await Game.create({
      name,
      price_per_hour: parseFloat(price_per_hour) || 0,
      price_per_round: parseFloat(price_per_round) || 0
    });

    const newGame = await Game.findById(gameId);

    res.status(201).json({
      success: true,
      message: 'Game created successfully',
      data: newGame
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating game',
      error: error.message
    });
  }
};

// UPDATE game
exports.updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price_per_hour, price_per_round, is_active } = req.body;

    const gameExists = await Game.exists(id);
    if (!gameExists) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    const updateData = {
      name,
      price_per_hour: price_per_hour !== undefined && price_per_hour !== null ? parseFloat(price_per_hour) : undefined,
      price_per_round: price_per_round !== undefined && price_per_round !== null ? parseFloat(price_per_round) : undefined,
      is_active
    };

    const affectedRows = await Game.update(id, updateData);

    if (affectedRows === null) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const updatedGame = await Game.findById(id);

    res.status(200).json({
      success: true,
      message: 'Game updated successfully',
      data: updatedGame
    });
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating game',
      error: error.message
    });
  }
};

// SOFT DELETE game
exports.deleteGame = async (req, res) => {
  try {
    const { id } = req.params;

    const gameExists = await Game.exists(id);
    if (!gameExists) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    await Game.softDelete(id);

    res.status(200).json({
      success: true,
      message: 'Game deleted successfully (soft delete)'
    });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting game',
      error: error.message
    });
  }
};

// RESTORE soft-deleted game
exports.restoreGame = async (req, res) => {
  try {
    const { id } = req.params;
    
    const gameExists = await Game.exists(id);
    if (!gameExists) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    await Game.restore(id);

    res.status(200).json({
      success: true,
      message: 'Game restored successfully'
    });
  } catch (error) {
    console.error('Error restoring game:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring game',
      error: error.message
    });
  }
};

// PERMANENT DELETE game
exports.permanentDeleteGame = async (req, res) => {
  try {
    const { id } = req.params;

    const gameExists = await Game.exists(id);
    if (!gameExists) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    await Game.hardDelete(id);

    res.status(200).json({
      success: true,
      message: 'Game permanently deleted'
    });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting game',
      error: error.message
    });
  }
};

// SEARCH games by name
exports.searchGames = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search term'
      });
    }

    const games = await Game.searchByName(search);

    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    console.error('Error searching games:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching games',
      error: error.message
    });
  }
};