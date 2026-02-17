const Report = require('../models/Report');

// GET /api/reports/daily?date=2026-02-17
exports.getDaily = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date (format: YYYY-MM-DD)'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    const data = await Report.getDaily(date);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching daily report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily report',
      error: error.message
    });
  }
};

// GET /api/reports/weekly?start=2026-02-10&end=2026-02-17
exports.getWeekly = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Please provide start and end dates (format: YYYY-MM-DD)'
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start) || !dateRegex.test(end)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    if (new Date(start) > new Date(end)) {
      return res.status(400).json({
        success: false,
        message: 'start date must be before end date'
      });
    }

    const data = await Report.getWeekly(start, end);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching weekly report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching weekly report',
      error: error.message
    });
  }
};

// GET /api/reports/monthly?month=2&year=2026
exports.getMonthly = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month and year'
      });
    }

    const monthNum = parseInt(month);
    const yearNum  = parseInt(year);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month. Must be between 1 and 12'
      });
    }

    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year'
      });
    }

    const data = await Report.getMonthly(monthNum, yearNum);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly report',
      error: error.message
    });
  }
};