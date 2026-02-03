const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const authRoutes = require('./routes/authRoutes');

// ============ Middleware ============
// Middleware = functions executed before reaching routes

// 1. Allow requests from any origin (useful for development)
app.use(cors());

// 2. Parse JSON in requests to JavaScript objects
app.use(express.json());

// 3. Parse form data
app.use(express.urlencoded({ extended: true }));

// ============ Routes ============
// Connect auth routes to app
// Any request starting with /auth goes to authRoutes
app.use('/auth', authRoutes);

// Root route for testing (GET /)
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running successfully!',
    endpoints: {
      login: 'POST /auth/login'
    }
  });
});

// ============ Start Server ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
