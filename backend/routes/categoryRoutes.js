const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/authMiddleware');

// Apply authentication to ALL category routes
router.use(authenticate);

// GET all categories (with product counts)
router.get('/', categoryController.getAllCategories);

// GET single category by ID
router.get('/:id', categoryController.getCategoryById);

// CREATE new category
router.post('/', categoryController.createCategory);

// UPDATE category
router.put('/:id', categoryController.updateCategory);

// DELETE category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;