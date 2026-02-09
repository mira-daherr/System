const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/authMiddleware');
const upload = require('../config/upload');

// Apply authentication to ALL product routes
router.use(authenticate);

// SEARCH products by name (MUST be before /:id)
router.get('/search', productController.searchProducts);

// GET products by price range (MUST be before /:id)
router.get('/price-range', productController.getProductsByPriceRange);

// GET all products
router.get('/', productController.getAllProducts);

// CREATE new product with image upload
router.post('/', upload.single('image'), productController.createProduct);

// RESTORE soft-deleted product (MUST be before PUT /:id)
router.put('/:id/restore', productController.restoreProduct);

// UPDATE product with optional image upload
router.put('/:id', upload.single('image'), productController.updateProduct);

// PERMANENT DELETE product (MUST be before DELETE /:id)
router.delete('/permanent/:id', productController.permanentDeleteProduct);

// DELETE product (soft delete)
router.delete('/:id', productController.deleteProduct);

// GET single product by ID (MUST be LAST)
router.get('/:id', productController.getProductById);

module.exports = router;