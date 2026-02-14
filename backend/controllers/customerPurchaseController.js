const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const db = require('../config/db'); 
// ===================================
// CREATE new purchase
// ===================================
exports.createPurchase = async (req, res) => {
  const { 
    customerId: existingCustomerId,
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

    let customerId;
    
    // 1. Handle customer (existing or new)
    if (existingCustomerId) {
      // Use existing customer and update their debt
      customerId = existingCustomerId;
      await Customer.updateDebt(customerId, remainingAmount);
    } else {
      // Check if customer with this name already exists
      const existingCustomer = await Customer.findByName(customerName);
      if (existingCustomer) {
        customerId = existingCustomer.id;
        await Customer.updateDebt(customerId, remainingAmount);
      } else {
        // Create new customer
        customerId = await Customer.create({
          name: customerName,
          total_debt: remainingAmount
        });
      }
    }

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
// SEARCH customers by name
// ===================================
exports.searchCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search) {
      const customers = await Customer.getAll();
      return res.json({ 
        success: true, 
        data: customers 
      });
    }
    
    const customers = await Customer.searchByName(search);
    res.json({ 
      success: true, 
      data: customers 
    });
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching customers',
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

// ===================================
// PROCESS PAYMENT - Update customer debt
// ===================================
exports.processPayment = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { id } = req.params;
    const { paymentAmount } = req.body;
    
    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment amount' 
      });
    }

    await connection.beginTransaction();
    
    // Get customer
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    const currentDebt = parseFloat(customer.total_debt) || 0;
    
    // Validate payment doesn't exceed debt
    if (paymentAmount > currentDebt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment amount cannot exceed current debt' 
      });
    }

    // Update customer debt (subtract payment)
    await Customer.updateDebt(id, -paymentAmount);

    // Create a payment record as a sale with negative amounts
    await Sale.create({
      customer_id: id,
      customer_name: customer.name,
      total_amount: 0,
      paid_amount: paymentAmount,
      remaining_amount: -paymentAmount,
      notes: `Payment received: L.L ${paymentAmount.toFixed(3)}`
    });

    await connection.commit();
    
    // Fetch updated customer
    const updatedCustomer = await Customer.findById(id);
    
    res.json({ 
      success: true, 
      message: 'Payment processed successfully',
      data: {
        previousDebt: currentDebt,
        paymentAmount: paymentAmount,
        newDebt: parseFloat(updatedCustomer.total_debt) || 0
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error processing payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing payment',
      error: error.message 
    });
  } finally {
    connection.release();
  }
};

// ===================================
// GET customers with purchase history and filtering
// ===================================
exports.getCustomersWithHistory = async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query; // 'day', 'week', 'month', 'custom', or 'all'
    
    let dateCondition = '';
    const now = new Date();
    
    if (filter === 'custom' && startDate && endDate) {
      // Custom date range
      dateCondition = `AND s.created_at BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'`;
    } else if (filter === 'day') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      dateCondition = `AND s.created_at >= '${startOfDay.toISOString().slice(0, 19).replace('T', ' ')}'`;
    } else if (filter === 'week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - 7));
      dateCondition = `AND s.created_at >= '${startOfWeek.toISOString().slice(0, 19).replace('T', ' ')}'`;
    } else if (filter === 'month') {
      const startOfMonth = new Date(now.setDate(now.getDate() - 30));
      dateCondition = `AND s.created_at >= '${startOfMonth.toISOString().slice(0, 19).replace('T', ' ')}'`;
    }

    const query = `
      SELECT 
        c.id,
        c.name,
        c.total_debt,
        c.created_at,
        c.updated_at,
        GROUP_CONCAT(
          DISTINCT DATE_FORMAT(
            CASE 
              WHEN s.sale_date IS NULL OR s.sale_date = '0000-00-00 00:00:00' 
              THEN s.created_at 
              ELSE s.sale_date 
            END, 
            '%Y-%m-%d'
          ) 
          ORDER BY s.created_at DESC 
          SEPARATOR ','
        ) as purchase_dates,
        COUNT(DISTINCT s.id) as total_purchases,
        SUM(CASE WHEN s.total_amount > 0 THEN s.total_amount ELSE 0 END) as total_spent
      FROM customers c
      INNER JOIN sales s ON c.id = s.customer_id ${dateCondition}
      GROUP BY c.id, c.name, c.total_debt, c.created_at, c.updated_at
      HAVING total_purchases > 0
      ORDER BY c.total_debt DESC, c.name ASC
    `;

    const [rows] = await db.query(query);
    
    res.json({ 
      success: true, 
      data: rows 
    });
  } catch (error) {
    console.error('Error fetching customers with history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching customers',
      error: error.message 
    });
  }
};