const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/authMiddleware');
const upload = require('../config/upload');

// Apply authentication to ALL product routes
router.use(authenticate);

// SEARCH products by name (before /:id to avoid conflicts)
router.get('/search', productController.searchProducts);

// GET products by price range
router.get('/price-range', productController.getProductsByPriceRange);

// GET all products
router.get('/', productController.getAllProducts);

// GET single product by ID
router.get('/:id', productController.getProductById);

// CREATE new product with image upload
router.post('/', upload.single('image'), productController.createProduct);

// UPDATE product with optional image upload
router.put('/:id', upload.single('image'), productController.updateProduct);

// DELETE product (soft delete)
router.delete('/:id', productController.deleteProduct);

// PERMANENT DELETE product
router.delete('/permanent/:id', productController.permanentDeleteProduct);

module.exports = router;