require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ============ Routes ============
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const gameRoutes = require('./routes/gameRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const customerPurchaseRoutes = require('./routes/customerPurchaseRoutes');
const reportRoutes = require('./routes/reportRoutes');

// ============ Base Path (pkg-aware) ============
// When compiled with pkg, __dirname points inside the snapshot.
// Use process.execPath dirname so dist/ and public/ are found next to the .exe
const basePath = process.pkg
  ? path.dirname(process.execPath)
  : __dirname;

// ============ Middleware ============
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ Static Files ============
// Serve uploaded product images (live on the real filesystem, always writable)
app.use('/products', express.static(path.join(basePath, 'public', 'products')));

// Serve React frontend build (dist/ folder next to the .exe)
app.use(express.static(path.join(basePath, 'dist')));

// ============ API Routes ============
app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/customer-purchases', customerPurchaseRoutes);
app.use('/api/reports', reportRoutes);

// ============ SPA Fallback ============
// Return index.html for any non-API GET so React Router handles the navigation
app.use((req, res, next) => {
  if (
    req.method === 'GET' &&
    !req.path.startsWith('/api') &&
    !req.path.startsWith('/auth') &&
    !req.path.startsWith('/products')
  ) {
    return res.sendFile(path.join(basePath, 'dist', 'index.html'));
  }
  next();
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
  console.log(`Server running - open http://localhost:${PORT} in your browser`);
});
