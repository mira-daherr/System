
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes'); // ← ADD THIS

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
app.use('/products', express.static(path.join(__dirname, 'public', 'products')));
app.use('/auth', authRoutes);

// Connect product routes to app - PROTECTED BY AUTHENTICATION
// Any request starting with /api/products goes to productRoutes
app.use('/api/products', productRoutes); // ← ADD THIS

// Root route for testing (GET /)
app.get('/', (req, res) => {
  res.json({
    message: 'API is running successfully!',
    endpoints: {
      auth: {
        login: 'POST /auth/login',
        register: 'POST /auth/register' // if you have this
      },
      products: {
        getAll: 'GET /api/products',
        getById: 'GET /api/products/:id',
        search: 'GET /api/products/search?search=term',
        priceRange: 'GET /api/products/price-range?min=20&max=50',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id'
      },
      note: '⚠️ All product routes require authentication (JWT token)'
    }
  });
});

// ============ Start Server ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`📍 API endpoints:`);
  console.log(`   - Auth: http://localhost:${PORT}/auth/login`);
  console.log(`   - Products: http://localhost:${PORT}/api/products`);
  console.log(`🔐 Product routes require JWT token`);
});