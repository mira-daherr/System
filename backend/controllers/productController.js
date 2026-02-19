const Product = require('../models/Products');
const path = require('path');
const fs = require('fs');

// Helper function to delete old image file
const deleteImageFile = (imagePath) => {
  if (imagePath && imagePath.startsWith('http://localhost:5000/products/')) {
    const filename = imagePath.split('/').pop();
    const filePath = path.join(__dirname, '..', 'public', 'products', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Old image deleted:', filename);
    }
  }
};

// GET all products
exports.getAllProducts = async (req, res) => {
  try {
    console.log('🔵 getAllProducts called');
    const products = await Product.findAll();
    console.log('📦 Products returned:', products.length);
    console.log('📊 Active products:', products.filter(p => p.is_active === 1).length);
    console.log('📊 Deleted products:', products.filter(p => p.is_active === 0).length);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// GET products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    console.log('🔵 getProductsByCategory called for:', category);
    
    const products = await Product.findByCategory(category);
    
    res.status(200).json({
      success: true,
      count: products.length,
      category: category,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category',
      error: error.message
    });
  }
};

// GET all categories
exports.getCategories = async (req, res) => {
  try {
    console.log('🔵 getCategories called');
    const categories = await Product.getCategories();
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// GET single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// CREATE new product
exports.createProduct = async (req, res) => {
  try {
    const { name, price, initial_price, quantity, category } = req.body;  // ← added initial_price and quantity

    // Validation
    if (!name || !price) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message: 'Please provide name and price'
      });
    }

    if (parseFloat(price) < 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }

    if (quantity !== undefined && parseInt(quantity) < 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message: 'Quantity cannot be negative'
      });
    }

    // If file uploaded, save the URL
    let imageUrl = null;
    if (req.file) {
      imageUrl = `http://localhost:5000/products/${req.file.filename}`;
    }

    const productId = await Product.create({
      name,
      price: parseFloat(price),
      initial_price: initial_price ? parseFloat(initial_price) : 0,  // ← added initial_price
      quantity: quantity ? parseInt(quantity) : 0,  // ← added quantity
      category: category || 'Uncategorized',
      image: imageUrl
    });

    // Get the created product
    const newProduct = await Product.findById(productId);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    // Delete uploaded file if database operation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// UPDATE product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, initial_price, quantity, category, is_active } = req.body;  // ← added initial_price and quantity

    // Check if product exists
    const productExists = await Product.exists(id);

    if (!productExists) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate price if provided
    if (price !== undefined && parseFloat(price) < 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }

    // Validate quantity if provided
    if (quantity !== undefined && parseInt(quantity) < 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message: 'Quantity cannot be negative'
      });
    }

    // Get current product to check for old image
    const currentProduct = await Product.findById(id);

    // If new image, delete old one
    if (req.file && currentProduct.image) {
      deleteImageFile(currentProduct.image);
    }

    // Prepare URL for new image
    let imageUrl = currentProduct.image; // Keep old image by default
    if (req.file) {
      imageUrl = `http://localhost:5000/products/${req.file.filename}`;
    }

    const updateData = {
      name,
      price: price ? parseFloat(price) : undefined,
      initial_price: initial_price !== undefined ? parseFloat(initial_price) : undefined,  // ← added initial_price
      quantity: quantity !== undefined ? parseInt(quantity) : undefined,  // ← added quantity
      category,
      image: imageUrl,
      is_active
    };

    const affectedRows = await Product.update(id, updateData);

    if (affectedRows === null) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Fetch updated product
    const updatedProduct = await Product.findById(id);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    // Delete uploaded file if update fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// DELETE product (soft delete)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const productExists = await Product.exists(id);

    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.softDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully (soft delete)'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// RESTORE soft-deleted product
exports.restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔄 Restore request received for product ID:', id);
    
    const productExists = await Product.exists(id);
    console.log('📦 Product exists?', productExists);

    if (!productExists) {
      console.log('❌ Product not found');
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const result = await Product.restore(id);
    console.log('✅ Restore completed. Affected rows:', result);

    res.status(200).json({
      success: true,
      message: 'Product restored successfully'
    });
  } catch (error) {
    console.error('❌ Error restoring product:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring product',
      error: error.message
    });
  }
};

// PERMANENT DELETE product (hard delete)
exports.permanentDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const productExists = await Product.exists(id);

    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = await Product.findById(id);

    if (product && product.image) {
      deleteImageFile(product.image);
    }

    await Product.hardDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product permanently deleted'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// SEARCH products by name
exports.searchProducts = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search term'
      });
    }

    const products = await Product.searchByName(search);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
};

// GET products by price range
exports.getProductsByPriceRange = async (req, res) => {
  try {
    const { min, max } = req.query;

    if (!min || !max) {
      return res.status(400).json({
        success: false,
        message: 'Please provide min and max price'
      });
    }

    const products = await Product.findByPriceRange(parseFloat(min), parseFloat(max));

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products by price range:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};