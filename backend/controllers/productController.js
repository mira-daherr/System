const Product = require('../models/Products');

// GET all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    
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
    const { name, price, image } = req.body;
    
    // Validation
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and price'
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }
    
    const productId = await Product.create({ name, price, image });
    
    // Get the created product
    const newProduct = await Product.findById(productId);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
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
    const { name, price, image, is_active } = req.body;
    
    // Check if product exists
    const productExists = await Product.exists(id);
    
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate price if provided
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }
    
    const affectedRows = await Product.update(id, { name, price, image, is_active });
    
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
    
    // Check if product exists
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
      message: 'Product deleted successfully'
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

// PERMANENT DELETE product (hard delete)
exports.permanentDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const productExists = await Product.exists(id);
    
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
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