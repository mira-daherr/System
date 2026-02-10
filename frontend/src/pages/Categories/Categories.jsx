import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Fab,
  Menu,
  MenuItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { categoriesAPI } from '../../services/api';
import { getAuthToken, isAuthenticated } from '../../utils/auth';
import './Categories.css';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    icon: '📦',
    color: '#FF3333',
    description: ''
  });

  // Available emojis for categories
  const availableIcons = ['🍬', '🥪', '🍟', '🥤', '☕', '🍕', '🍔', '🌮', '🍜', '🍰', '🧃', '🥗', '🍱', '🍩', '🧁', '📦'];
  const availableColors = ['#FF6B9D', '#FFA726', '#FFCA28', '#42A5F5', '#8D6E63', '#4CAF50', '#9C27B0', '#F44336', '#2196F3', '#FF5722'];

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchCategories();
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getAuthToken();
      const response = await categoriesAPI.getAll(token);
      
      if (response.success) {
        setCategories(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/products/category/${categoryName}`);
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditMode(true);
      setCurrentCategory(category);
      setFormData({
        name: category.name,
        icon: category.icon,
        color: category.color,
        description: category.description || ''
      });
    } else {
      setEditMode(false);
      setCurrentCategory(null);
      setFormData({
        name: '',
        icon: '📦',
        color: '#FF3333',
        description: ''
      });
    }
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentCategory(null);
    setFormData({ name: '', icon: '📦', color: '#FF3333', description: '' });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      const token = getAuthToken();
      let response;

      if (editMode && currentCategory) {
        response = await categoriesAPI.update(currentCategory.id, formData, token);
      } else {
        response = await categoriesAPI.create(formData, token);
      }

      if (response.success) {
        setSuccess(editMode ? 'Category updated successfully' : 'Category created successfully');
        handleCloseDialog();
        fetchCategories();
      } else {
        setError(response.message || 'Operation failed');
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleMenuOpen = (event, category) => {
    event.stopPropagation();
    console.log('Menu opening for:', category.name); // للتأكد
    setAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleMenuClose = () => {
    console.log('Menu closing'); // للتأكد
    setAnchorEl(null);
    setSelectedCategory(null);
  };

  const handleEdit = () => {
    handleOpenDialog(selectedCategory);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setCurrentCategory(selectedCategory);
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = getAuthToken();
      const response = await categoriesAPI.delete(currentCategory.id, token);

      if (response.success) {
        setSuccess('Category deleted successfully');
        setOpenDeleteDialog(false);
        setCurrentCategory(null);
        fetchCategories();
      } else {
        setError(response.message || 'Failed to delete category');
        setOpenDeleteDialog(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete category');
      setOpenDeleteDialog(false);
    }
  };

  return (
    <Box className="categories-container">
      {/* Header */}
      <Box className="categories-header">
        <Box className="header-top">
          <IconButton onClick={() => navigate('/dashboard')} className="back-button">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" className="page-title">
            Products Management
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#999', mt: 1 }}>
          Select a category to view and manage products
        </Typography>
      </Box>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Categories Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#FF3333' }} />
        </Box>
      ) : (
        <Grid container spacing={3} className="categories-grid">
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card
                className="category-card"
                sx={{
                  '--card-color': category.color,
                  '--card-color-alpha': `${category.color}33`,
                  cursor: 'pointer',
                  position: 'relative',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px'
                }}
              >
                {/* Menu Button - FIXED VERSION */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1000
                  }}
                >
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, category)}
                    sx={{
                      color: '#999',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      '&:hover': { 
                        color: category.color,
                        backgroundColor: 'rgba(0,0,0,0.7)' 
                      }
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <CardContent 
                  sx={{ textAlign: 'center', py: 4 }}
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <Box
                    className="category-icon-box"
                    sx={{
                      backgroundColor: `${category.color}20`,
                      color: category.color
                    }}
                  >
                    <span style={{ fontSize: 60 }}>{category.icon}</span>
                  </Box>
                  <Typography variant="h5" className="category-name" sx={{ mt: 2 }}>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" className="category-description" sx={{ mt: 1, color: '#999' }}>
                    {category.description}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    className="category-count"
                    sx={{ 
                      mt: 2, 
                      display: 'block',
                      color: category.color,
                      fontWeight: 'bold'
                    }}
                  >
                    {category.product_count || 0} products
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Add Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => handleOpenDialog()}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          backgroundColor: '#FF3333',
          '&:hover': { backgroundColor: '#cc0000' }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: '#2a2a2a',
            color: '#fff',
            backgroundImage: 'none'
          }
        }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: '#ff4444' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            color: '#fff',
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {editMode ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Category Name"
              type="text"
              fullWidth
              required
              value={formData.name}
              onChange={handleInputChange}
              sx={{
                mb: 2,
                '& .MuiInputLabel-root': { color: '#999' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#FF3333' },
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: '#FF3333' },
                  '&.Mui-focused fieldset': { borderColor: '#FF3333' }
                }
              }}
            />

            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={handleInputChange}
              sx={{
                mb: 2,
                '& .MuiInputLabel-root': { color: '#999' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#FF3333' },
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: '#FF3333' },
                  '&.Mui-focused fieldset': { borderColor: '#FF3333' }
                }
              }}
            />

            {/* Icon Selector */}
            <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
              Select Icon:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {availableIcons.map((icon) => (
                <Box
                  key={icon}
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  sx={{
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    cursor: 'pointer',
                    borderRadius: 1,
                    border: formData.icon === icon ? '2px solid #FF3333' : '2px solid transparent',
                    backgroundColor: formData.icon === icon ? 'rgba(255,51,51,0.1)' : 'rgba(255,255,255,0.05)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(255,51,51,0.2)',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  {icon}
                </Box>
              ))}
            </Box>

            {/* Color Selector */}
            <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
              Select Color:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {availableColors.map((color) => (
                <Box
                  key={color}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: formData.color === color ? '3px solid #fff' : '3px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.15)',
                      boxShadow: `0 0 15px ${color}`
                    }
                  }}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Button onClick={handleCloseDialog} sx={{ color: '#999' }}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{
                backgroundColor: '#FF3333',
                '&:hover': { backgroundColor: '#cc0000' }
              }}
            >
              {editMode ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            color: '#fff',
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography>
            Are you sure you want to delete "{currentCategory?.name}"?
          </Typography>
          {currentCategory?.product_count > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This category has {currentCategory.product_count} product(s). 
              You need to move or delete them first.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button onClick={() => setOpenDeleteDialog(false)} sx={{ color: '#999' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={currentCategory?.product_count > 0}
            sx={{
              backgroundColor: '#ff4444',
              '&:hover': { backgroundColor: '#cc0000' },
              '&:disabled': { backgroundColor: '#666' }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;
