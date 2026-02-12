const express = require('express');
const router = express.Router();
const customerPurchaseController = require('../controllers/customerPurchaseController');
const { authenticate } = require('../middleware/authMiddleware');

// Apply authentication to ALL customer purchase routes
router.use(authenticate);

// ===================================
// PURCHASE ROUTES
// ===================================

// CREATE new purchase
router.post('/purchase', customerPurchaseController.createPurchase);

// GET all purchases
router.get('/purchases', customerPurchaseController.getAllPurchases);

// GET single purchase by ID with items
router.get('/purchase/:id', customerPurchaseController.getPurchaseById);

// DELETE purchase (soft delete)
router.delete('/purchase/:id', customerPurchaseController.deletePurchase);

// ===================================
// CUSTOMER ROUTES
// ===================================

// GET all customers
router.get('/customers', customerPurchaseController.getAllCustomers);

// GET single customer by ID with sales
router.get('/customer/:id', customerPurchaseController.getCustomerById);

module.exports = router;