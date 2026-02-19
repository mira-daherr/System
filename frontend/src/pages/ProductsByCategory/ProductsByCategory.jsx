import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Image as ImageIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { productsAPI } from '../../services/api';
import { getAuthToken, isAuthenticated } from '../../utils/auth';
import '../Products/style.css';

const ProductsByCategory = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');

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
    initial_price: '',  // ← added
    category: category,
    imageFile: null
  });

  // Image preview
  const [imagePreview, setImagePreview] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, [category, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getAuthToken();
      const response = await productsAPI.getByCategory(category, token);

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

  // Format currency for Lebanese Lira
  const formatCurrency = (amount) => {
    return amount;
  };

  const sortedProducts = React.useMemo(() => {
    const comparator = (a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

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

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort(comparator);
  }, [products, order, orderBy, searchTerm]);

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditMode(true);
      setCurrentProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        initial_price: product.initial_price ? product.initial_price.toString() : '',  // ← added
        category: product.category,
        imageFile: null
      });
      setImagePreview(product.image);
    } else {
      setEditMode(false);
      setCurrentProduct(null);
      setFormData({ name: '', price: '', initial_price: '', category: category, imageFile: null });  // ← added
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
    setFormData({ name: '', price: '', initial_price: '', category: category, imageFile: null });  // ← added
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
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, imageFile: file }));

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
      const productData = new FormData();
      productData.append('name', formData.name.trim());
      productData.append('price', parseFloat(formData.price));
      productData.append('initial_price', formData.initial_price ? parseFloat(formData.initial_price) : 0);  // ← added
      productData.append('category', formData.category);

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
    }
  };

  const handleRestoreConfirm = async () => {
    try {
      const token = getAuthToken();
      const response = await productsAPI.restore(currentProduct.id, token);

      if (response.success) {
        setSuccess('Product restored successfully');
        setOpenRestoreDialog(false);
        setCurrentProduct(null);
        fetchProducts();
      } else {
        setError(response.message || 'Failed to restore product');
      }
    } catch (err) {
      setError(err.message || 'Failed to restore product');
    }
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  return (
    <Box className="products-container">
      {/* Header */}
      <Box className="products-header">
        <Box className="header-top">
          <IconButton onClick={() => navigate('/categories')} className="back-button">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" className="page-title">
            {category}
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box className="filters-bar">
          <Box className="filters-left">
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

            <Chip
              label={`${sortedProducts.length} product${sortedProducts.length !== 1 ? 's' : ''}`}
              className="product-count-chip"
            />
          </Box>

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
      ) : sortedProducts.length === 0 ? (
        <Box className="empty-state">
          <Typography variant="h6" className="empty-message">
            {searchTerm ? 'No products match your search' : `No products in ${category}`}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            className="empty-add-btn"
          >
            Add Your First Product
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow className="table-header-row">
                <TableCell className="table-header-cell image-cell">Image</TableCell>
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
                {/* ← added */}
                <TableCell className="table-header-cell">
                  <TableSortLabel
                    active={orderBy === 'initial_price'}
                    direction={orderBy === 'initial_price' ? order : 'asc'}
                    onClick={() => handleSort('initial_price')}
                    className="sort-label"
                  >
                    Initial Price
                  </TableSortLabel>
                </TableCell>
                <TableCell className="table-header-cell actions-cell">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className="table-row"
                  sx={{
                    opacity: product.is_active === 0 ? 0.5 : 1,
                    backgroundColor: product.is_active === 0 ? 'rgba(255, 0, 0, 0.08)' : 'transparent'
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
                        <Chip label="Deleted" size="small" color="error" variant="outlined" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell className="product-price">
                    L.L {formatCurrency(product.price)}
                  </TableCell>
                  {/* ← added */}
                  <TableCell className="product-price">
                    L.L {formatCurrency(product.initial_price || 0)}
                  </TableCell>
                  <TableCell>
                    <Box className="action-buttons">
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

                      {product.is_active === 1 ? (
                        <Tooltip title="Soft Delete">
                          <IconButton size="small" onClick={() => handleDeleteClick(product)} className="delete-btn">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Restore Product">
                          <IconButton size="small" onClick={() => handleRestoreClick(product)} className="restore-btn">
                            <RestoreFromTrashIcon />
                          </IconButton>
                        </Tooltip>
                      )}

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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ className: 'dialog-paper' }}>
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
            {/* ← added */}
            <TextField
              margin="dense"
              name="initial_price"
              label="Initial Price / راسمال (L.L)"
              type="number"
              fullWidth
              value={formData.initial_price}
              onChange={handleInputChange}
              inputProps={{ step: '0.01', min: '0' }}
              className="form-field"
            />
            <FormControl fullWidth margin="dense" className="form-field">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                label="Category"
              >
                <MenuItem value="Sweets">Sweets</MenuItem>
                <MenuItem value="Sandwiches">Sandwiches</MenuItem>
                <MenuItem value="Chips">Chips</MenuItem>
                <MenuItem value="Drinks">Drinks</MenuItem>
                <MenuItem value="Hot Drinks">Hot Drinks</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 2, mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{
                  borderColor: '#FF3333',
                  color: '#FF3333',
                  '&:hover': { borderColor: '#cc0000', backgroundColor: 'rgba(255, 51, 51, 0.1)' }
                }}
              >
                {formData.imageFile ? 'Change Image' : 'Upload Image'}
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>

              {imagePreview && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '2px solid #FF3333' }}
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions className="dialog-actions">
            <Button onClick={handleCloseDialog} className="cancel-btn">Cancel</Button>
            <Button type="submit" variant="contained" className="submit-btn">
              {editMode ? 'Update' : 'Add'} Product
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Dialogs (same as before) */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} PaperProps={{ className: 'dialog-paper' }}>
        <DialogTitle className="dialog-title">Confirm Soft Delete</DialogTitle>
        <DialogContent>
          <Typography className="dialog-message">
            Are you sure you want to delete "{currentProduct?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={() => setOpenDeleteDialog(false)} className="cancel-btn">Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" className="delete-confirm-btn">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPermanentDeleteDialog} onClose={() => setOpenPermanentDeleteDialog(false)} PaperProps={{ className: 'dialog-paper' }}>
        <DialogTitle className="dialog-title danger-title">⚠️ Confirm Permanent Delete</DialogTitle>
        <DialogContent>
          <Typography className="dialog-message">
            Are you sure you want to <strong>permanently delete</strong> "{currentProduct?.name}"?
          </Typography>
          <Typography className="danger-message">This action is <strong>IRREVERSIBLE</strong>.</Typography>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={() => setOpenPermanentDeleteDialog(false)} className="cancel-btn">Cancel</Button>
          <Button onClick={handlePermanentDeleteConfirm} variant="contained" className="permanent-delete-confirm-btn">
            Permanent Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openRestoreDialog} onClose={() => setOpenRestoreDialog(false)} PaperProps={{ className: 'dialog-paper' }}>
        <DialogTitle className="dialog-title">Confirm Restore</DialogTitle>
        <DialogContent>
          <Typography className="dialog-message">
            Are you sure you want to restore "{currentProduct?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={() => setOpenRestoreDialog(false)} className="cancel-btn">Cancel</Button>
          <Button onClick={handleRestoreConfirm} variant="contained" className="submit-btn">Restore</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsByCategory;
