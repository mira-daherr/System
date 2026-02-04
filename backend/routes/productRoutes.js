const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/authMiddleware');

// Apply authentication to ALL product routes
// User must be logged in to access any product API
router.use(authenticate);

// SEARCH products by name (before /:id to avoid conflicts)
router.get('/search', productController.searchProducts);

// GET products by price range
router.get('/price-range', productController.getProductsByPriceRange);

// GET all products
router.get('/', productController.getAllProducts);

// GET single product by ID
router.get('/:id', productController.getProductById);

// CREATE new product
router.post('/', productController.createProduct);

// UPDATE product
router.put('/:id', productController.updateProduct);

// DELETE product (soft delete)
router.delete('/:id', productController.deleteProduct);

// PERMANENT DELETE product
router.delete('/permanent/:id', productController.permanentDeleteProduct);

module.exports = router;