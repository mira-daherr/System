const Category = require('../models/Category');
const db = require('../config/db'); // أضف هذا في الأعلى

// GET all categories
exports.getAllCategories = async (req, res) => {
  try {
    console.log('🔵 getAllCategories called');
    const categories = await Category.findAllWithCounts();
    
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

// GET single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

// ✨ GET products by category name
exports.getProductsByCategory = async (req, res) => {
  try {
    const { name } = req.params;
    
    const [products] = await db.query(`
      SELECT * FROM products 
      WHERE category = ? 
      AND is_active = 1
      AND quantity > 0
      ORDER BY name
    `, [name]);
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// CREATE new category
exports.createCategory = async (req, res) => {
  try {
    const { name, icon, color, description } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findByName(name.trim());
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const categoryId = await Category.create({
      name: name.trim(),
      icon: icon || '📦',
      color: color || '#FF3333',
      description: description || ''
    });

    // Get the created category
    const newCategory = await Category.findById(categoryId);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

// UPDATE category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color, description } = req.body;

    // Check if category exists
    const categoryExists = await Category.exists(id);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // If name is being changed, check if new name already exists
    if (name) {
      const currentCategory = await Category.findById(id);
      if (name.trim() !== currentCategory.name) {
        const existingCategory = await Category.findByName(name.trim());
        if (existingCategory) {
          return res.status(400).json({
            success: false,
            message: 'Category with this name already exists'
          });
        }
      }
    }

    const updateData = {
      name: name ? name.trim() : undefined,
      icon,
      color,
      description
    };

    const affectedRows = await Category.update(id, updateData);

    if (affectedRows === null) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Fetch updated category
    const updatedCategory = await Category.findById(id);

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

// DELETE category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const categoryExists = await Category.exists(id);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get category to check product count
    const category = await Category.findById(id);
    const productCount = await Category.getProductCount(category.name);

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${productCount} active product(s). Please move or delete products first.`
      });
    }

    await Category.delete(id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};