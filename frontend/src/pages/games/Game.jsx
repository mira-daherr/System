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
  SportsEsports as GamesIcon
} from '@mui/icons-material';
import { gamesAPI } from '../../services/api';
import { getAuthToken, isAuthenticated } from '../../utils/auth';
import './style.css';

const Games = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

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
  const [currentGame, setCurrentGame] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price_per_hour: '',
    price_per_round: ''
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchGames();
  }, [navigate]);

  // Debounced search effect
  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const timeoutId = setTimeout(() => {
      fetchGames();
    }, 500);

    setSearchDebounce(timeoutId);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchTerm]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getAuthToken();
      let response;

      if (searchTerm.trim()) {
        response = await gamesAPI.search(searchTerm.trim(), token);
      } else {
        response = await gamesAPI.getAll(token);
      }

      if (response.success) {
        setGames(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch games');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch games');
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedGames = React.useMemo(() => {
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

    return [...games].sort(comparator);
  }, [games, order, orderBy]);

  // Format currency for Lebanese Lira
  const formatCurrency = (amount) => {
    // Return price as-is from database
    return amount;
  };

  const handleOpenDialog = (game = null) => {
    if (game) {
      setEditMode(true);
      setCurrentGame(game);
      setFormData({
        name: game.name,
        price_per_hour: game.price_per_hour.toString(),
        price_per_round: game.price_per_round.toString()
      });
    } else {
      setEditMode(false);
      setCurrentGame(null);
      setFormData({ name: '', price_per_hour: '', price_per_round: '' });
    }
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentGame(null);
    setFormData({ name: '', price_per_hour: '', price_per_round: '' });
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
      setError('Game name is required');
      return;
    }

    try {
      const token = getAuthToken();

      const gameData = {
        name: formData.name.trim(),
        price_per_hour: parseFloat(formData.price_per_hour) || 0,
        price_per_round: parseFloat(formData.price_per_round) || 0
      };

      let response;
      if (editMode && currentGame) {
        response = await gamesAPI.update(currentGame.id, gameData, token);
      } else {
        response = await gamesAPI.create(gameData, token);
      }

      if (response.success) {
        setSuccess(editMode ? 'Game updated successfully' : 'Game added successfully');
        handleCloseDialog();
        fetchGames();
      } else {
        setError(response.message || 'Operation failed');
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
      console.error('Error saving game:', err);
    }
  };

  const handleDeleteClick = (game) => {
    setCurrentGame(game);
    setOpenDeleteDialog(true);
    setError('');
    setSuccess('');
  };

  const handlePermanentDeleteClick = (game) => {
    setCurrentGame(game);
    setOpenPermanentDeleteDialog(true);
    setError('');
    setSuccess('');
  };

  const handleRestoreClick = (game) => {
    setCurrentGame(game);
    setOpenRestoreDialog(true);
    setError('');
    setSuccess('');
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = getAuthToken();
      const response = await gamesAPI.delete(currentGame.id, token);

      if (response.success) {
        setSuccess('Game deleted successfully (soft delete)');
        setOpenDeleteDialog(false);
        setCurrentGame(null);
        fetchGames();
      } else {
        setError(response.message || 'Failed to delete game');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete game');
      console.error('Error deleting game:', err);
    }
  };

  const handlePermanentDeleteConfirm = async () => {
    try {
      const token = getAuthToken();
      const response = await gamesAPI.permanentDelete(currentGame.id, token);

      if (response.success) {
        setSuccess('Game permanently deleted');
        setOpenPermanentDeleteDialog(false);
        setCurrentGame(null);
        fetchGames();
      } else {
        setError(response.message || 'Failed to permanently delete game');
      }
    } catch (err) {
      setError(err.message || 'Failed to permanently delete game');
      console.error('Error permanently deleting game:', err);
    }
  };

  const handleRestoreConfirm = async () => {
    try {
      const token = getAuthToken();
      const response = await gamesAPI.restore(currentGame.id, token);

      if (response.success) {
        setSuccess('Game restored successfully');
        setOpenRestoreDialog(false);
        setCurrentGame(null);
        await fetchGames();
      } else {
        setError(response.message || 'Failed to restore game');
      }
    } catch (err) {
      setError(err.message || 'Failed to restore game');
      console.error('Error restoring game:', err);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setCurrentGame(null);
  };

  const handlePermanentDeleteCancel = () => {
    setOpenPermanentDeleteDialog(false);
    setCurrentGame(null);
  };

  const handleRestoreCancel = () => {
    setOpenRestoreDialog(false);
    setCurrentGame(null);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Box className="games-container">
      {/* Header */}
      <Box className="games-header">
        <Box className="header-top">
          <IconButton onClick={() => navigate('/dashboard')} className="back-button">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" className="page-title">
            <GamesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Games Management
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box className="filters-bar">
          <Box className="filters-left">
            {/* Search */}
            <TextField
              placeholder="Search games by name..."
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
              label={`${games.length} game${games.length !== 1 ? 's' : ''}`}
              className="game-count-chip"
              color="primary"
            />

            {searchTerm && (
              <Button
                variant="text"
                size="small"
                onClick={handleClearSearch}
                className="clear-filters-btn"
              >
                Clear Search
              </Button>
            )}
          </Box>

          {/* Add Game Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            className="add-game-btn"
          >
            Add Game
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

      {/* Games Table */}
      {loading ? (
        <Box className="loading-container">
          <CircularProgress className="loading-spinner" />
        </Box>
      ) : games.length === 0 ? (
        <Box className="empty-state">
          <Typography variant="h6" className="empty-message">
            {searchTerm ? 'No games match your search' : 'No games found'}
          </Typography>
          {!searchTerm && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              className="empty-add-btn"
            >
              Add Your First Game
            </Button>
          )}
          {searchTerm && (
            <Button
              variant="outlined"
              onClick={handleClearSearch}
              className="empty-clear-btn"
            >
              Clear Search
            </Button>
          )}
        </Box>
      ) : (
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow className="table-header-row">
                <TableCell className="table-header-cell">
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleSort('name')}
                    className="sort-label"
                  >
                    Game Name
                  </TableSortLabel>
                </TableCell>
                <TableCell className="table-header-cell">
                  <TableSortLabel
                    active={orderBy === 'price_per_hour'}
                    direction={orderBy === 'price_per_hour' ? order : 'asc'}
                    onClick={() => handleSort('price_per_hour')}
                    className="sort-label"
                  >
                    Price Per Hour
                  </TableSortLabel>
                </TableCell>
                <TableCell className="table-header-cell">
                  <TableSortLabel
                    active={orderBy === 'price_per_round'}
                    direction={orderBy === 'price_per_round' ? order : 'asc'}
                    onClick={() => handleSort('price_per_round')}
                    className="sort-label"
                  >
                    Price Per Round
                  </TableSortLabel>
                </TableCell>
                <TableCell className="table-header-cell actions-cell">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedGames.map((game) => (
                <TableRow 
                  key={game.id} 
                  className="table-row"
                  sx={{
                    opacity: game.is_active === 0 ? 0.5 : 1,
                    backgroundColor: game.is_active === 0 ? 'rgba(255, 0, 0, 0.08)' : 'transparent',
                    '&:hover': {
                      backgroundColor: game.is_active === 0 ? 'rgba(255, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                >
                  <TableCell className="game-name">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {game.name}
                      {game.is_active === 0 && (
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
                  <TableCell className="game-price">
                    {parseFloat(game.price_per_hour) > 0 
                      ? `L.L ${formatCurrency(game.price_per_hour)}`
                      : '-'}
                  </TableCell>
                  <TableCell className="game-price">
                    {parseFloat(game.price_per_round) > 0 
                      ? `L.L ${formatCurrency(game.price_per_round)}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Box className="action-buttons">
                      {/* Edit */}
                      <Tooltip title={game.is_active === 0 ? "Cannot edit deleted game" : "Edit Game"}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(game)}
                            className="edit-btn"
                            disabled={game.is_active === 0}
                          >
                            <EditIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      
                      {/* Soft Delete OR Restore */}
                      {game.is_active === 1 ? (
                        <Tooltip title="Soft Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(game)}
                            className="delete-btn"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Restore Game">
                          <IconButton
                            size="small"
                            onClick={() => handleRestoreClick(game)}
                            className="restore-btn"
                          >
                            <RestoreFromTrashIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {/* Permanent Delete */}
                      <Tooltip title="Permanent Delete">
                        <IconButton
                          size="small"
                          onClick={() => handlePermanentDeleteClick(game)}
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

      {/* Add/Edit Game Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: 'dialog-paper' }}
      >
        <DialogTitle className="dialog-title">
          {editMode ? 'Edit Game' : 'Add New Game'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent className="dialog-content">
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Game Name"
              type="text"
              fullWidth
              required
              value={formData.name}
              onChange={handleInputChange}
              className="form-field"
            />
            <TextField
              margin="dense"
              name="price_per_hour"
              label="Price Per Hour (L.L)"
              type="number"
              fullWidth
              value={formData.price_per_hour}
              onChange={handleInputChange}
              inputProps={{ step: '0.01', min: '0' }}
              className="form-field"
              helperText="Leave 0 if not applicable"
            />
            <TextField
              margin="dense"
              name="price_per_round"
              label="Price Per Round (L.L)"
              type="number"
              fullWidth
              value={formData.price_per_round}
              onChange={handleInputChange}
              inputProps={{ step: '0.01', min: '0' }}
              className="form-field"
              helperText="Leave 0 if not applicable"
            />
          </DialogContent>
          <DialogActions className="dialog-actions">
            <Button onClick={handleCloseDialog} className="cancel-btn">
              Cancel
            </Button>
            <Button type="submit" variant="contained" className="submit-btn">
              {editMode ? 'Update' : 'Add'} Game
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
            Are you sure you want to delete "{currentGame?.name}"? This is a soft delete and can be recovered.
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
            Are you sure you want to <strong>permanently delete</strong> "{currentGame?.name}"?
          </Typography>
          <Typography className="danger-message">
            This action is <strong>IRREVERSIBLE</strong> and the game will be completely removed from the database.
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
            Are you sure you want to restore "{currentGame?.name}"?
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

export default Games;