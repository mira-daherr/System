import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Chip,
  TableSortLabel,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DeleteForever as DeleteForeverIcon,
  RestoreFromTrash as RestoreFromTrashIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  FilterList as FilterListIcon,
  Image as ImageIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { productsAPI } from '../../services/api';
import { getAuthToken, isAuthenticated } from '../../utils/auth';
import './style.css';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');

  // Sorting states
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');

  // Debounce timer
  const [searchDebounce, setSearchDebounce] = useState(null);

  // Modal states
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPermanentDeleteDialog, setOpenPermanentDeleteDialog] = useState(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    imageFile: null
  });

  // Image preview
  const [imagePreview, setImagePreview] = useState(null);

  // Track image load errors
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, [navigate]);

  // Debounced search and filter effect
  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 500);

    setSearchDebounce(timeoutId);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchTerm, priceFilter, customMinPrice, customMaxPrice]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getAuthToken();
      let response;

      // Priority 1: Search by name if search term exists
      if (searchTerm.trim()) {
        response = await productsAPI.search(searchTerm.trim(), token);
      }
      // Priority 2: Filter by price range
      else if (priceFilter !== 'all') {
        let minPrice, maxPrice;

        if (priceFilter === 'custom') {
          minPrice = parseFloat(customMinPrice) || 0;
          maxPrice = parseFloat(customMaxPrice) || 999999;
        } else {
          [minPrice, maxPrice] = priceFilter.split('-').map(Number);
        }

        response = await productsAPI.getByPriceRange(minPrice, maxPrice, token);
      }
      // Priority 3: Get all products
      else {
        response = await productsAPI.getAll(token);
      }

      if (response.success) {
        setProducts(response.data || []);
        setImageErrors({});
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

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedProducts = React.useMemo(() => {
    const comparator = (a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle string comparisons
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (bValue < aValue) {
        return order === 'asc' ? 1 : -1;
      }
      if (bValue > aValue) {
        return order === 'asc' ? -1 : 1;
      }
      return 0;
    };

    return [...products].sort(comparator);
  }, [products, order, orderBy]);

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditMode(true);
      setCurrentProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        imageFile: null
      });
      setImagePreview(product.image);
    } else {
      setEditMode(false);
      setCurrentProduct(null);
      setFormData({ name: '', price: '', imageFile: null });
      setImagePreview(null);
    }
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentProduct(null);
    setFormData({ name: '', price: '', imageFile: null });
    setImagePreview(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, imageFile: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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

      // Use FormData for file upload
      const productData = new FormData();
      productData.append('name', formData.name.trim());
      productData.append('price', parseFloat(formData.price));

      if (formData.imageFile) {
        productData.append('image', formData.imageFile);
      }

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

  const handlePermanentDeleteClick = (product) => {
    setCurrentProduct(product);
    setOpenPermanentDeleteDialog(true);
    setError('');
    setSuccess('');
  };

  const handleRestoreClick = (product) => {
    setCurrentProduct(product);
    setOpenRestoreDialog(true);
    setError('');
    setSuccess('');
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = getAuthToken();
      const response = await productsAPI.delete(currentProduct.id, token);

      if (response.success) {
        setSuccess('Product deleted successfully (soft delete)');
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

  const handlePermanentDeleteConfirm = async () => {
    try {
      const token = getAuthToken();
      const response = await productsAPI.permanentDelete(currentProduct.id, token);

      if (response.success) {
        setSuccess('Product permanently deleted');
        setOpenPermanentDeleteDialog(false);
        setCurrentProduct(null);
        fetchProducts();
      } else {
        setError(response.message || 'Failed to permanently delete product');
      }
    } catch (err) {
      setError(err.message || 'Failed to permanently delete product');
      console.error('Error permanently deleting product:', err);
    }
  };

  const handleRestoreConfirm = async () => {
    try {
      console.log('🔄 Starting restore for product:', currentProduct);
      
      const token = getAuthToken();
      console.log('🔑 Token:', token ? 'exists' : 'missing');
      
      const response = await productsAPI.restore(currentProduct.id, token);
      console.log('📡 API Response:', response);

      if (response.success) {
        setSuccess('Product restored successfully');
        setOpenRestoreDialog(false);
        setCurrentProduct(null);
        await fetchProducts();
      } else {
        console.log('⚠️ Restore failed:', response.message);
        setError(response.message || 'Failed to restore product');
      }
    } catch (err) {
      console.error('❌ Error restoring product:', err);
      setError(err.message || 'Failed to restore product');
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setCurrentProduct(null);
  };

  const handlePermanentDeleteCancel = () => {
    setOpenPermanentDeleteDialog(false);
    setCurrentProduct(null);
  };

  const handleRestoreCancel = () => {
    setOpenRestoreDialog(false);
    setCurrentProduct(null);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setPriceFilter('all');
    setCustomMinPrice('');
    setCustomMaxPrice('');
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const hasActiveFilters = searchTerm || priceFilter !== 'all';

  return (
    <Box className="products-container">
      {/* Header */}
      <Box className="products-header">
        <Box className="header-top">
          <IconButton onClick={() => navigate('/dashboard')} className="back-button">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" className="page-title">
            Products Management
          </Typography>
        </Box>

        {/* Search and Filters Bar */}
        <Box className="filters-bar">
          <Box className="filters-left">
            {/* Search */}
            <TextField
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              className="search-field"
              InputProps={{
                startAdornment: <SearchIcon className="search-icon" />
              }}
            />

            {/* Price Filter */}
            <FormControl size="small" className="price-filter">
              <InputLabel>Price Range</InputLabel>
              <Select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                label="Price Range"
                startAdornment={<FilterListIcon className="filter-icon" />}
              >
                <MenuItem value="all">All Prices</MenuItem>
                <MenuItem value="0-10">L.L 0 - L.L 10</MenuItem>
                <MenuItem value="10-50">L.L 10 - L.L 50</MenuItem>
                <MenuItem value="50-100">L.L 50 - L.L 100</MenuItem>
                <MenuItem value="100-500">L.L 100 - L.L 500</MenuItem>
                <MenuItem value="500-99999">L.L 500+</MenuItem>
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
                  className="price-input"
                />
                <Typography className="price-separator">to</Typography>
                <TextField
                  placeholder="Max"
                  type="number"
                  value={customMaxPrice}
                  onChange={(e) => setCustomMaxPrice(e.target.value)}
                  size="small"
                  className="price-input"
                />
              </>
            )}

            <Chip
              label={`${products.length} product${products.length !== 1 ? 's' : ''}`}
              className="product-count-chip"
            />

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="text"
                size="small"
                onClick={handleClearFilters}
                className="clear-filters-btn"
              >
                Clear Filters
              </Button>
            )}
          </Box>

          {/* Add Product Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            className="add-product-btn"
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Messages */}
      {error && (
        <Alert severity="error" className="alert-message" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" className="alert-message" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Products Table */}
      {loading ? (
        <Box className="loading-container">
          <CircularProgress className="loading-spinner" />
        </Box>
      ) : products.length === 0 ? (
        <Box className="empty-state">
          <Typography variant="h6" className="empty-message">
            {hasActiveFilters ? 'No products match your filters' : 'No products found'}
          </Typography>
          {!hasActiveFilters && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              className="empty-add-btn"
            >
              Add Your First Product
            </Button>
          )}
          {hasActiveFilters && (
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              className="empty-clear-btn"
            >
              Clear Filters
            </Button>
          )}
        </Box>
      ) : (
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow className="table-header-row">
                <TableCell className="table-header-cell image-cell">
                  Image
                </TableCell>
                <TableCell className="table-header-cell">
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleSort('name')}
                    className="sort-label"
                  >
                    Product Name
                  </TableSortLabel>
                </TableCell>
                <TableCell className="table-header-cell">
                  <TableSortLabel
                    active={orderBy === 'price'}
                    direction={orderBy === 'price' ? order : 'asc'}
                    onClick={() => handleSort('price')}
                    className="sort-label"
                  >
                    Price
                  </TableSortLabel>
                </TableCell>
                <TableCell className="table-header-cell actions-cell">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedProducts.map((product) => (
                <TableRow 
                  key={product.id} 
                  className="table-row"
                  sx={{
                    opacity: product.is_active === 0 ? 0.5 : 1,
                    backgroundColor: product.is_active === 0 ? 'rgba(255, 0, 0, 0.08)' : 'transparent',
                    '&:hover': {
                      backgroundColor: product.is_active === 0 ? 'rgba(255, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                >
                  <TableCell>
                    <Box className="product-image-box">
                      {product.image && !imageErrors[product.id] ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="product-image"
                          onError={() => handleImageError(product.id)}
                        />
                      ) : (
                        <ImageIcon className="product-image-placeholder" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell className="product-name">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {product.name}
                      {product.is_active === 0 && (
                        <Chip 
                          label="Deleted" 
                          size="small" 
                          color="error" 
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell className="product-price">
                    L.L {parseFloat(product.price).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Box className="action-buttons">
                      {/* Edit - disabled for deleted products */}
                      <Tooltip title={product.is_active === 0 ? "Cannot edit deleted product" : "Edit Product"}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(product)}
                            className="edit-btn"
                            disabled={product.is_active === 0}
                          >
                            <EditIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      
                      {/* Soft Delete OR Restore */}
                      {product.is_active === 1 ? (
                        <Tooltip title="Soft Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(product)}
                            className="delete-btn"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Restore Product">
                          <IconButton
                            size="small"
                            onClick={() => handleRestoreClick(product)}
                            className="restore-btn"
                          >
                            <RestoreFromTrashIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {/* Permanent Delete - always visible */}
                      <Tooltip title="Permanent Delete">
                        <IconButton
                          size="small"
                          onClick={() => handlePermanentDeleteClick(product)}
                          className="permanent-delete-btn"
                        >
                          <DeleteForeverIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: 'dialog-paper' }}
      >
        <DialogTitle className="dialog-title">
          {editMode ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent className="dialog-content">
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
              className="form-field"
            />
            <TextField
              margin="dense"
              name="price"
              label="Price (L.L)"
              type="number"
              fullWidth
              required
              value={formData.price}
              onChange={handleInputChange}
              inputProps={{ step: '0.01', min: '0' }}
              className="form-field"
            />

            {/* Upload Image Section */}
            <Box sx={{ mt: 2, mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{
                  borderColor: '#FF3333',
                  color: '#FF3333',
                  '&:hover': {
                    borderColor: '#cc0000',
                    backgroundColor: 'rgba(255, 51, 51, 0.1)'
                  }
                }}
              >
                {formData.imageFile ? 'Change Image' : 'Upload Image'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>

              {/* Image Preview */}
              {imagePreview && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      border: '2px solid #FF3333'
                    }}
                  />
                  {formData.imageFile && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#999' }}>
                      {formData.imageFile.name}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions className="dialog-actions">
            <Button onClick={handleCloseDialog} className="cancel-btn">
              Cancel
            </Button>
            <Button type="submit" variant="contained" className="submit-btn">
              {editMode ? 'Update' : 'Add'} Product
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Soft Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        PaperProps={{ className: 'dialog-paper' }}
      >
        <DialogTitle className="dialog-title">
          Confirm Soft Delete
        </DialogTitle>
        <DialogContent>
          <Typography className="dialog-message">
            Are you sure you want to delete "{currentProduct?.name}"? This is a soft delete and can potentially be recovered.
          </Typography>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleDeleteCancel} className="cancel-btn">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" className="delete-confirm-btn">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog
        open={openPermanentDeleteDialog}
        onClose={handlePermanentDeleteCancel}
        PaperProps={{ className: 'dialog-paper' }}
      >
        <DialogTitle className="dialog-title danger-title">
          ⚠️ Confirm Permanent Delete
        </DialogTitle>
        <DialogContent>
          <Typography className="dialog-message">
            Are you sure you want to <strong>permanently delete</strong> "{currentProduct?.name}"?
          </Typography>
          <Typography className="danger-message">
            This action is <strong>IRREVERSIBLE</strong> and the product will be completely removed from the database.
          </Typography>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handlePermanentDeleteCancel} className="cancel-btn">
            Cancel
          </Button>
          <Button onClick={handlePermanentDeleteConfirm} variant="contained" className="permanent-delete-confirm-btn">
            Permanent Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog
        open={openRestoreDialog}
        onClose={handleRestoreCancel}
        PaperProps={{ className: 'dialog-paper' }}
      >
        <DialogTitle className="dialog-title">
          Confirm Restore
        </DialogTitle>
        <DialogContent>
          <Typography className="dialog-message">
            Are you sure you want to restore "{currentProduct?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleRestoreCancel} className="cancel-btn">
            Cancel
          </Button>
          <Button onClick={handleRestoreConfirm} variant="contained" className="submit-btn">
            Restore
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;