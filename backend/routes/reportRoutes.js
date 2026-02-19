const express = require('express');
const router  = express.Router();
const { getDaily, getWeekly, getMonthly } = require('../controllers/reportController');
const { authenticate } = require('../middleware/authMiddleware');

// Apply authentication to ALL report routes
router.use(authenticate);

// GET /api/reports/daily?date=2026-02-17
router.get('/daily', getDaily);

// GET /api/reports/weekly?start=2026-02-10&end=2026-02-17
router.get('/weekly', getWeekly);

// GET /api/reports/monthly?month=2&year=2026
router.get('/monthly', getMonthly);

module.exports = router;