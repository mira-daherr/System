const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Import Database
const db = require('./config/db');

// Test Route - Home
app.get('/', (req, res) => {
  res.json({ 
    message: 'Computer Center Management System API',
    status: 'Running',
    version: '1.0.0'
  });
});

// Test Route - Database Connection
app.get('/api/test', (req, res) => {
  db.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database connection failed',
        error: err.message 
      });
    }
    res.json({ 
      success: true, 
      message: 'Database connected successfully',
      result: results[0].result 
    });
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('Visit: http://localhost:' + PORT);
});