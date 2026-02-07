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
    const { name, price } = req.body;

    // Validation
    if (!name || !price) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message: 'Please provide name and price'
      });
    }

    if (parseFloat(price) < 0) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }

    // 👇 إذا في ملف منرفع، احفظ الـ URL
    let imageUrl = null;
    if (req.file) {
      imageUrl = `http://localhost:5000/products/${req.file.filename}`;
    }

    const productId = await Product.create({
      name,
      price: parseFloat(price),
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
    const { name, price, is_active } = req.body;

    // Check if product exists
    const productExists = await Product.exists(id);

    if (!productExists) {
      // Delete uploaded file if product doesn't exist
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
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }

    // Get current product to check for old image
    const currentProduct = await Product.findById(id);

    // 👇 إذا في صورة جديدة، احذف القديمة
    if (req.file && currentProduct.image) {
      deleteImageFile(currentProduct.image);
    }

    // 👇 حضر الـ URL للصورة الجديدة
    let imageUrl = currentProduct.image; // Keep old image by default
    if (req.file) {
      imageUrl = `http://localhost:5000/products/${req.file.filename}`;
    }

    const updateData = {
      name,
      price: price ? parseFloat(price) : undefined,
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

    // Get product to delete its image
    const product = await Product.findById(id);

    // 👇 احذف الصورة من السيرفر
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