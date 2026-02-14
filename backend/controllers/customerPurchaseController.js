const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const db = require('../config/db'); 
// ===================================
// CREATE new purchase
// ===================================
exports.createPurchase = async (req, res) => {
  const { 
    customerName,
    selectedGames,
    selectedProducts,
    totalAmount,
    paidAmount,
    remainingAmount,
    notes
  } = req.body;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Create new customer record
    const customerId = await Customer.create({
      name: customerName,
      total_debt: remainingAmount
    });

    // 2. Create sale record
    const saleId = await Sale.create({
      customer_id: customerId,
      customer_name: customerName,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      remaining_amount: remainingAmount,
      notes
    });

    // 3. Add game items
    if (selectedGames && selectedGames.length > 0) {
      for (const game of selectedGames) {
        await SaleItem.create({
          sale_id: saleId,
          item_type: 'game',
          item_id: game.id,
          item_name: game.name,
          quantity: game.quantity,
          price: game.price,
          total: game.total
        });
      }
    }

    // 4. Add product items
    if (selectedProducts && selectedProducts.length > 0) {
      for (const product of selectedProducts) {
        await SaleItem.create({
          sale_id: saleId,
          item_type: 'product',
          item_id: product.id,
          item_name: product.name,
          quantity: product.quantity,
          price: product.price,
          total: product.total
        });
      }
    }

    await connection.commit();
    
    res.status(201).json({ 
      success: true, 
      message: 'Purchase created successfully!',
      data: {
        saleId,
        customerId
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating purchase:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating purchase',
      error: error.message 
    });
  } finally {
    connection.release();
  }
};

// ===================================
// GET all purchases
// ===================================
exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Sale.getAll();
    res.json({ 
      success: true, 
      data: purchases 
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching purchases',
      error: error.message 
    });
  }
};

// ===================================
// GET purchase by ID with items
// ===================================
exports.getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ 
        success: false, 
        message: 'Purchase not found' 
      });
    }
    
    const items = await SaleItem.getBySaleId(id);
    
    res.json({ 
      success: true, 
      data: {
        sale,
        items
      }
    });
  } catch (error) {
    console.error('Error fetching purchase:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching purchase',
      error: error.message 
    });
  }
};

// ===================================
// GET all customers
// ===================================
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.getAll();
    res.json({ 
      success: true, 
      data: customers 
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching customers',
      error: error.message 
    });
  }
};

// ===================================
// GET customer by ID with purchases
// ===================================
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }
    
    const sales = await Sale.getByCustomerId(id);
    
    res.json({ 
      success: true, 
      data: {
        customer,
        sales
      }
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching customer',
      error: error.message 
    });
  }
};

// ===================================
// DELETE purchase (soft delete)
// ===================================
exports.deletePurchase = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { id } = req.params;
    
    await connection.beginTransaction();
    
    // Get sale info before deleting
    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ 
        success: false, 
        message: 'Purchase not found' 
      });
    }
    
    // Update customer debt (subtract the remaining amount)
    await Customer.updateDebt(sale.customer_id, -sale.remaining_amount);
    
    // Soft delete sale
    await Sale.delete(id);
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: 'Purchase deleted successfully' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting purchase:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting purchase',
      error: error.message 
    });
  } finally {
    connection.release();
  }
};