import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { productsAPI } from '../../services/api';
import { getAuthToken, isAuthenticated } from '../../utils/auth';
import './style.css';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');

  // Modal states
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: ''
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, [navigate]);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, priceFilter, customMinPrice, customMaxPrice]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getAuthToken();
      const response = await productsAPI.getAll(token);

      if (response.success) {
        setProducts(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply price filter
    if (priceFilter !== 'all') {
      if (priceFilter === 'custom') {
        const min = parseFloat(customMinPrice) || 0;
        const max = parseFloat(customMaxPrice) || Infinity;
        filtered = filtered.filter(product =>
          product.price >= min && product.price <= max
        );
      } else {
        const [min, max] = priceFilter.split('-').map(Number);
        filtered = filtered.filter(product =>
          product.price >= min && product.price <= max
        );
      }
    }

    setFilteredProducts(filtered);
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditMode(true);
      setCurrentProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        image: product.image || ''
      });
    } else {
      setEditMode(false);
      setCurrentProduct(null);
      setFormData({ name: '', price: '', image: '' });
    }
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentProduct(null);
    setFormData({ name: '', price: '', image: '' });
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

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Price must be a positive number');
      return;
    }

    try {
      const token = getAuthToken();
      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        image: formData.image.trim() || null
      };

      let response;
      if (editMode && currentProduct) {
        response = await productsAPI.update(currentProduct.id, productData, token);
      } else {
        response = await productsAPI.create(productData, token);
      }

      if (response.success) {
        setSuccess(editMode ? 'Product updated successfully' : 'Product added successfully');
        handleCloseDialog();
        fetchProducts();
      } else {
        setError(response.message || 'Operation failed');
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
      console.error('Error saving product:', err);
    }
  };

  const handleDeleteClick = (product) => {
    setCurrentProduct(product);
    setOpenDeleteDialog(true);
    setError('');
    setSuccess('');
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = getAuthToken();
      const response = await productsAPI.delete(currentProduct.id, token);

      if (response.success) {
        setSuccess('Product deleted successfully');
        setOpenDeleteDialog(false);
        setCurrentProduct(null);
        fetchProducts();
      } else {
        setError(response.message || 'Failed to delete product');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete product');
      console.error('Error deleting product:', err);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setCurrentProduct(null);
  };

  const getDefaultImage = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  };

  return (
    <Box className="products-container">
      {/* Header */}
      <Box className="products-header">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton
            onClick={() => navigate('/dashboard')}
            sx={{ color: '#FF3333' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold' }}>
            Products Management
          </Typography>
        </Box>

        {/* Search and Filters Bar */}
        <Box className="filters-bar">
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
            {/* Search */}
            <TextField
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                minWidth: '250px',
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover fieldset': { borderColor: '#FF3333' },
                  '&.Mui-focused fieldset': { borderColor: '#FF3333' }
                }
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: '#999', mr: 1 }} />
              }}
            />

            {/* Price Filter */}
            <FormControl
              size="small"
              sx={{
                minWidth: 180,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover fieldset': { borderColor: '#FF3333' },
                  '&.Mui-focused fieldset': { borderColor: '#FF3333' }
                },
                '& .MuiInputLabel-root': { color: '#999' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#FF3333' }
              }}
            >
              <InputLabel>Price Range</InputLabel>
              <Select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                label="Price Range"
                startAdornment={<FilterListIcon sx={{ color: '#999', mr: 1 }} />}
              >
                <MenuItem value="all">All Prices</MenuItem>
                <MenuItem value="0-10">$0 - $10</MenuItem>
                <MenuItem value="10-50">$10 - $50</MenuItem>
                <MenuItem value="50-100">$50 - $100</MenuItem>
                <MenuItem value="100-500">$100 - $500</MenuItem>
                <MenuItem value="500-99999">$500+</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>

            {/* Custom Price Range */}
            {priceFilter === 'custom' && (
              <>
                <TextField
                  placeholder="Min"
                  type="number"
                  value={customMinPrice}
                  onChange={(e) => setCustomMinPrice(e.target.value)}
                  size="small"
                  sx={{
                    width: '100px',
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&:hover fieldset': { borderColor: '#FF3333' },
                      '&.Mui-focused fieldset': { borderColor: '#FF3333' }
                    }
                  }}
                />
                <Typography sx={{ color: '#999' }}>to</Typography>
                <TextField
                  placeholder="Max"
                  type="number"
                  value={customMaxPrice}
                  onChange={(e) => setCustomMaxPrice(e.target.value)}
                  size="small"
                  sx={{
                    width: '100px',
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&:hover fieldset': { borderColor: '#FF3333' },
                      '&.Mui-focused fieldset': { borderColor: '#FF3333' }
                    }
                  }}
                />
              </>
            )}

            <Chip
              label={`${filteredProducts.length} products`}
              sx={{
                backgroundColor: 'rgba(255, 51, 51, 0.2)',
                color: '#FF3333',
                fontWeight: 'bold'
              }}
            />
          </Box>

          {/* Add Product Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: '#FF3333',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#cc0000' }
            }}
          >
            Add Product
          </Button>
        </Box>
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

      {/* Products Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress sx={{ color: '#FF3333' }} />
        </Box>
      ) : filteredProducts.length === 0 ? (
        <Box className="empty-state">
          <Typography variant="h6" sx={{ color: '#999' }}>
            {searchTerm || priceFilter !== 'all' ? 'No products match your filters' : 'No products found'}
          </Typography>
          {!searchTerm && priceFilter === 'all' && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                mt: 2,
                borderColor: '#FF3333',
                color: '#FF3333',
                '&:hover': { borderColor: '#cc0000', backgroundColor: 'rgba(255, 51, 51, 0.1)' }
              }}
            >
              Add Your First Product
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card className="product-card">
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image || getDefaultImage()}
                  alt={product.name}
                  sx={{ objectFit: 'cover', backgroundColor: '#333' }}
                  onError={(e) => { e.target.src = getDefaultImage(); }}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#fff',
                      fontWeight: 'bold',
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#FF3333',
                      fontWeight: 'bold',
                      mb: 2
                    }}
                  >
                    ${parseFloat(product.price).toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(product)}
                      sx={{
                        flex: 1,
                        borderColor: '#FF3333',
                        color: '#FF3333',
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#cc0000',
                          backgroundColor: 'rgba(255, 51, 51, 0.1)'
                        }
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteClick(product)}
                      sx={{
                        flex: 1,
                        borderColor: '#999',
                        color: '#999',
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#FF3333',
                          color: '#FF3333',
                          backgroundColor: 'rgba(255, 51, 51, 0.1)'
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'product-dialog'
        }}
      >
        <DialogTitle sx={{ color: '#fff', fontWeight: 'bold' }}>
          {editMode ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Product Name"
              type="text"
              fullWidth
              required
              value={formData.name}
              onChange={handleInputChange}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover fieldset': { borderColor: '#FF3333' },
                  '&.Mui-focused fieldset': { borderColor: '#FF3333' }
                },
                '& .MuiInputLabel-root': { color: '#999' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#FF3333' }
              }}
            />
            <TextField
              margin="dense"
              name="price"
              label="Price"
              type="number"
              fullWidth
              required
              value={formData.price}
              onChange={handleInputChange}
              inputProps={{ step: '0.01', min: '0' }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover fieldset': { borderColor: '#FF3333' },
                  '&.Mui-focused fieldset': { borderColor: '#FF3333' }
                },
                '& .MuiInputLabel-root': { color: '#999' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#FF3333' }
              }}
            />
            <TextField
              margin="dense"
              name="image"
              label="Image URL (optional)"
              type="url"
              fullWidth
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover fieldset': { borderColor: '#FF3333' },
                  '&.Mui-focused fieldset': { borderColor: '#FF3333' }
                },
                '& .MuiInputLabel-root': { color: '#999' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#FF3333' }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{ color: '#999', textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#FF3333',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#cc0000' }
              }}
            >
              {editMode ? 'Update' : 'Add'} Product
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        PaperProps={{
          className: 'product-dialog'
        }}
      >
        <DialogTitle sx={{ color: '#fff', fontWeight: 'bold' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#999' }}>
            Are you sure you want to delete "{currentProduct?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            sx={{ color: '#999', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              backgroundColor: '#FF3333',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#cc0000' }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
