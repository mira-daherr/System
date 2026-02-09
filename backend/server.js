require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// استدعي الـ routes بس، مش الـ controllers
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const gameRoutes = require('./routes/gameRoutes');

// ============ Middleware ============
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ Static Files ============
app.use('/products', express.static(path.join(__dirname, 'public', 'products')));

// ============ Routes ============
app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);

// Root route

// Connect product routes to app - PROTECTED BY AUTHENTICATION
// Any request starting with /api/products goes to productRoutes
app.use('/api/products', productRoutes); // ← ADD THIS
app.use('/api/games', gameRoutes); 
// Root route for testing (GET /)
app.get('/', (req, res) => {
  res.json({
    message: 'API is running successfully!',
    endpoints: {
      auth: {
        login: 'POST /auth/login',
        logout: 'POST /auth/logout',
        requestResetCode: 'POST /auth/request-reset-code',
        resetPassword: 'POST /auth/reset-password'
      },
      products: {
        getAll: 'GET /api/products',
        getById: 'GET /api/products/:id',
        search: 'GET /api/products/search?search=term',
        priceRange: 'GET /api/products/price-range?min=20&max=50',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        softDelete: 'DELETE /api/products/:id',
        restore: 'PUT /api/products/:id/restore',
        permanentDelete: 'DELETE /api/products/permanent/:id'
      },
      note: '⚠️ All product routes require authentication (JWT token)'
    }
  });
});

// ============ Error Handling ============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
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