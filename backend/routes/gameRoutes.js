const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gamesController');
const { authenticate } = require('../middleware/authMiddleware');

// Apply authentication to ALL game routes
router.use(authenticate);

// SEARCH games by name (MUST be before /:id)
router.get('/search', gameController.searchGames);

// GET all games
router.get('/', gameController.getAllGames);

// CREATE new game
router.post('/', gameController.createGame);

// RESTORE soft-deleted game (MUST be before PUT /:id)
router.put('/:id/restore', gameController.restoreGame);

// UPDATE game
router.put('/:id', gameController.updateGame);

// PERMANENT DELETE game (MUST be before DELETE /:id)
router.delete('/permanent/:id', gameController.permanentDeleteGame);

// SOFT DELETE game
router.delete('/:id', gameController.deleteGame);

// GET single game by ID (MUST be LAST)
router.get('/:id', gameController.getGameById);

module.exports = router;