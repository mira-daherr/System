const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login route
router.post('/login', authController.login);

// Logout route
router.post('/logout', authController.logout);

// NEW: Reset password routes
router.post('/request-reset-code', authController.requestResetCode);
router.post('/reset-password', authController.resetPassword);

module.exports = router;