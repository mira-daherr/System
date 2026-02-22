import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { gamesAPI, categoriesAPI, customerPurchasesAPI } from '../../services/api';
import './style.css';

const CustomerPurchase = () => {
  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Customer Info States
  const [customerName, setCustomerName] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customerHistory, setCustomerHistory] = useState([]);
  
  // Available Items States
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [selectedBox, setSelectedBox] = useState('Games'); // Track which box is selected
  
  // Selected Items States
  const [selectedGames, setSelectedGames] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Payment State
  const [paidAmount, setPaidAmount] = useState(0);

  // Loading State
  const [loading, setLoading] = useState(false);

  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch games and categories on component mount
  useEffect(() => {
    fetchGames();
    fetchCategories();
  }, []);

  // ===================================
  // FETCH GAMES
  // ===================================
  const fetchGames = async () => {
    try {
      const response = await gamesAPI.getAll(token);
      console.log('Games Response:', response);
      setGames(response.games || response.data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      alert('Error loading games!');
    }
  };

  // ===================================
  // FETCH CATEGORIES
  // ===================================
  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll(token);
      console.log('Categories Response:', response);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Error loading categories!');
    }
  };

  // ===================================
  // FETCH PRODUCTS BY CATEGORY
  // ===================================
  const handleCategoryClick = async (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedBox(categoryName);
    
    try {
      const response = await categoriesAPI.getProductsByCategory(categoryName, token);
      console.log('Category Products Response:', response);
      setCategoryProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error loading products!');
    }
  };

  // ===================================
  // HANDLE GAMES BOX CLICK
  // ===================================
  const handleGamesClick = () => {
    setSelectedBox('Games');
    setSelectedCategory(null);
    setCategoryProducts([]);
  };

  // ===================================
  // SEARCH CUSTOMERS
  // ===================================
  const handleCustomerSearch = async (searchTerm) => {
    setCustomerSearch(searchTerm);
    setCustomerName(searchTerm);
    
    if (searchTerm.length < 2) {
      setCustomerSuggestions([]);
      setShowSuggestions(false);
      setSelectedCustomer(null);
      setCustomerHistory([]);
      return;
    }
    
    try {
      const response = await customerPurchasesAPI.searchCustomers(searchTerm, token);
      setCustomerSuggestions(response.data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  };

  // ===================================
  // SELECT CUSTOMER
  // ===================================
  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name);
    setCustomerSearch(customer.name);
    setShowSuggestions(false);
    
    // Fetch customer's purchase history
    try {
      const response = await customerPurchasesAPI.getCustomerById(customer.id, token);
      setCustomerHistory(response.data.sales || []);
    } catch (error) {
      console.error('Error fetching customer history:', error);
    }
  };

  // ===================================
  // CLEAR CUSTOMER SELECTION
  // ===================================
  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerName('');
    setCustomerSearch('');
    setCustomerHistory([]);
    setShowSuggestions(false);
  };

  // ===================================
  // ADD GAME TO SELECTION
  // ===================================
  const handleAddGame = (game, priceType) => {
    const price = priceType === 'hour' 
      ? parseFloat(game.price_per_hour || 0) 
      : parseFloat(game.price_per_round || 0);
    
    // Create unique identifier with game id and price type (for UI tracking)
    const uniqueId = `${game.id}_${priceType}`;
    const existing = selectedGames.find(g => g.uniqueId === uniqueId);
    
    if (existing) {
      // Increase quantity
      setSelectedGames(selectedGames.map(g => 
        g.uniqueId === uniqueId 
          ? { ...g, quantity: g.quantity + 1, total: (g.quantity + 1) * g.price }
          : g
      ));
    } else {
      // Add new
      const priceLabel = priceType === 'hour' ? 'per hour' : 'per round';
      setSelectedGames([...selectedGames, {
        uniqueId: uniqueId,        // For UI tracking
        id: game.id,               // Actual game ID for database
        name: `${game.name} (${priceLabel})`,
        quantity: 1,
        price: price,
        total: price
      }]);
    }
  };

  // ===================================
  // ADD PRODUCT TO SELECTION
  // ===================================
  const handleAddProduct = (product) => {
    const existing = selectedProducts.find(p => p.id === product.id);
    
    if (existing) {
      // Increase quantity
      setSelectedProducts(selectedProducts.map(p => 
        p.id === product.id 
          ? { ...p, quantity: p.quantity + 1, total: (p.quantity + 1) * p.price }
          : p
      ));
    } else {
      // Add new
      const price = parseFloat(product.price || 0);
      setSelectedProducts([...selectedProducts, {
        id: product.id,
        name: product.name,
        quantity: 1,
        price: price,
        total: price
      }]);
    }
  };

  // ===================================
  // UPDATE QUANTITY
  // ===================================
  const updateQuantity = (type, id, change) => {
    if (type === 'game') {
      setSelectedGames(selectedGames.map(g => {
        if (g.uniqueId === id) {
          const newQty = Math.max(1, g.quantity + change);
          return { ...g, quantity: newQty, total: newQty * g.price };
        }
        return g;
      }));
    } else {
      setSelectedProducts(selectedProducts.map(p => {
        if (p.id === id) {
          const newQty = Math.max(1, p.quantity + change);
          return { ...p, quantity: newQty, total: newQty * p.price };
        }
        return p;
      }));
    }
  };

  // ===================================
  // REMOVE ITEM
  // ===================================
  const removeItem = (type, id) => {
    if (type === 'game') {
      setSelectedGames(selectedGames.filter(g => g.uniqueId !== id));
    } else {
      setSelectedProducts(selectedProducts.filter(p => p.id !== id));
    }
  };

  // ===================================
  // CALCULATE TOTALS
  // ===================================
  const gamesTotal = selectedGames.reduce((sum, g) => sum + (parseFloat(g.total) || 0), 0);
  const productsTotal = selectedProducts.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
  const currentPurchaseTotal = gamesTotal + productsTotal;
  const existingDebt = selectedCustomer ? parseFloat(selectedCustomer.total_debt) || 0 : 0;
  const totalAmount = currentPurchaseTotal + existingDebt;
  const remainingAmount = totalAmount - paidAmount;

  // ===================================
  // HANDLE SNACKBAR CLOSE
  // ===================================
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // ===================================
  // HANDLE FORM SUBMIT
  // ===================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!customerName.trim()) {
      alert('Please enter customer name!');
      return;
    }
    
    if (selectedGames.length === 0 && selectedProducts.length === 0) {
      alert('Please select at least one game or product!');
      return;
    }

    setLoading(true);

    try {
      const purchaseData = {
        customerId: selectedCustomer?.id || null,
        customerName: customerName.trim(),
        selectedGames,
        selectedProducts,
        totalAmount: currentPurchaseTotal,
        paidAmount,
        remainingAmount: currentPurchaseTotal - paidAmount,
        notes: ''
      };

      console.log('Submitting purchase:', purchaseData);

      const response = await customerPurchasesAPI.createPurchase(purchaseData, token);

      if (response.success) {
        // Build clean success message without DB values
        const customerType = selectedCustomer ? 'Existing Customer' : 'New Customer';
        let successMessage = `✅ Purchase saved successfully for ${customerName} (${customerType})!\n`;

        if (selectedCustomer && existingDebt > 0) {
          successMessage += `Previous Debt: L.L ${existingDebt.toFixed(3)} | `;
        }

        successMessage += `New Purchase: L.L ${currentPurchaseTotal.toFixed(3)} | `;
        successMessage += `Paid: L.L ${paidAmount.toFixed(3)} | `;
        successMessage += `Remaining: L.L ${remainingAmount.toFixed(3)}`;

        // Show success snackbar
        setSnackbar({
          open: true,
          message: successMessage,
          severity: 'success'
        });

        // Auto-reset form for next purchase
        setCustomerName('');
        setCustomerSearch('');
        setSelectedCustomer(null);
        setCustomerHistory([]);
        setSelectedGames([]);
        setSelectedProducts([]);
        setPaidAmount(0);
        setSelectedCategory(null);
        setCategoryProducts([]);
      }
    } catch (error) {
      console.error('Error saving purchase:', error);
      setSnackbar({
        open: true,
        message: '❌ ' + (error.message || 'Error saving purchase!'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-purchase">
      <div className="header">
        <button 
          type="button"
          className="back-btn" 
          onClick={() => window.history.back()}
        >
          ←
        </button>
        <h1>Customer Purchases</h1>
      </div>

      <div className="container">
        <form onSubmit={handleSubmit}>
          
          <div className="layout-split">
            {/* ========== LEFT SIDE: Customer Info & Cart ========== */}
            <div className="left-panel">
              
              {/* Customer Information */}
              <div className="section customer-info-section">
                <h2 className="section-title">👤 Customer</h2>
                <div className="form-group">
                  <label>Name *</label>
                  <div className="customer-search-wrapper">
                    <input 
                      type="text" 
                      value={customerSearch}
                      onChange={(e) => handleCustomerSearch(e.target.value)}
                      onFocus={() => customerSuggestions.length > 0 && setShowSuggestions(true)}
                      placeholder="Search or enter customer name"
                      required
                    />
                    {selectedCustomer && (
                      <button
                        type="button"
                        className="clear-customer-btn"
                        onClick={handleClearCustomer}
                        title="Clear customer"
                      >
                        ×
                      </button>
                    )}
                    
                    {/* Customer Suggestions Dropdown */}
                    {showSuggestions && customerSuggestions.length > 0 && (
                      <div className="customer-suggestions">
                        <div className="suggestions-header">
                          <span className="suggestions-title">Select Customer</span>
                          <button
                            type="button"
                            className="close-suggestions-btn"
                            onClick={() => setShowSuggestions(false)}
                            title="Close suggestions"
                          >
                            ×
                          </button>
                        </div>
                        {customerSuggestions.map(customer => (
                          <div
                            key={customer.id}
                            className="suggestion-item"
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            <div className="suggestion-name">{customer.name}</div>
                            <div className="suggestion-debt">
                              Debt: L.L {(parseFloat(customer.total_debt) || 0).toFixed(3)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Customer Info */}
                  {selectedCustomer && (
                    <div className="selected-customer-info">
                      <div className="customer-badge">
                        <span>✓ Existing Customer</span>
                        <span className="customer-debt">
                          Total Debt: L.L {(parseFloat(selectedCustomer.total_debt) || 0).toFixed(3)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Purchase History */}
              {selectedCustomer && customerHistory.length > 0 && (
                <div className="section history-section">
                  <h2 className="section-title">📋 Purchase History</h2>
                  <div className="history-list">
                    {customerHistory.slice(0, 3).map(purchase => {
                      // Use created_at if sale_date is invalid
                      const dateToShow = purchase.sale_date && purchase.sale_date !== '0000-00-00 00:00:00' 
                        ? new Date(purchase.sale_date) 
                        : new Date(purchase.created_at);
                      
                      return (
                        <div key={purchase.id} className="history-item">
                          <div className="history-date">
                            {dateToShow.toLocaleDateString()}
                          </div>
                          <div className="history-amount">
                            L.L {(parseFloat(purchase.total_amount) || 0).toFixed(3)}
                          </div>
                        </div>
                      );
                    })}
                    {customerHistory.length > 3 && (
                      <div className="history-more">
                        +{customerHistory.length - 3} more purchases
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Items Display */}
              {(selectedGames.length > 0 || selectedProducts.length > 0) && (
                <div className="section cart-section">
                  <h2 className="section-title">🛒 Cart</h2>
                  
                  {selectedGames.length > 0 && (
                    <div className="cart-items">
                      <h4 className="cart-category">Games:</h4>
                      {selectedGames.map(game => (
                        <div key={game.uniqueId} className="cart-item">
                          <div className="cart-item-info">
                            <span className="cart-item-name">{game.name}</span>
                            <span className="cart-item-qty">×{game.quantity}</span>
                          </div>
                          <div className="cart-item-actions">
                            <span className="cart-item-price">L.L {(parseFloat(game.total) || 0).toFixed(3)}</span>
                            <div className="cart-item-controls">
                              <button 
                                type="button" 
                                className="qty-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  updateQuantity('game', game.uniqueId, -1);
                                }}
                              >
                                -
                              </button>
                              <button 
                                type="button" 
                                className="qty-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  updateQuantity('game', game.uniqueId, 1);
                                }}
                              >
                                +
                              </button>
                              <button 
                                type="button" 
                                className="remove-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  removeItem('game', game.uniqueId);
                                }}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {selectedProducts.length > 0 && (
                    <div className="cart-items">
                      <h4 className="cart-category">Products:</h4>
                      {selectedProducts.map(product => (
                        <div key={product.id} className="cart-item">
                          <div className="cart-item-info">
                            <span className="cart-item-name">{product.name}</span>
                            <span className="cart-item-qty">×{product.quantity}</span>
                          </div>
                          <div className="cart-item-actions">
                            <span className="cart-item-price">L.L {(parseFloat(product.total) || 0).toFixed(3)}</span>
                            <div className="cart-item-controls">
                              <button 
                                type="button" 
                                className="qty-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  updateQuantity('product', product.id, -1);
                                }}
                              >
                                -
                              </button>
                              <button 
                                type="button" 
                                className="qty-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  updateQuantity('product', product.id, 1);
                                }}
                              >
                                +
                              </button>
                              <button 
                                type="button" 
                                className="remove-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  removeItem('product', product.id);
                                }}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Payment Summary */}
              <div className="section summary-section">
                <h2 className="section-title">💰 Payment</h2>
                
                {selectedCustomer && existingDebt > 0 && (
                  <div className="summary-row existing-debt">
                    <span>Previous Debt:</span>
                    <span>L.L {existingDebt.toFixed(3)}</span>
                  </div>
                )}
                
                <div className="summary-row">
                  <span>Games:</span>
                  <span>L.L {gamesTotal.toFixed(3)}</span>
                </div>
                <div className="summary-row">
                  <span>Products:</span>
                  <span>L.L {productsTotal.toFixed(3)}</span>
                </div>
                <div className="summary-row">
                  <span>New Items Total:</span>
                  <span>L.L {currentPurchaseTotal.toFixed(3)}</span>
                </div>
                <div className="summary-row total">
                  <span>Grand Total:</span>
                  <span>L.L {totalAmount.toFixed(3)}</span>
                </div>
                
                <div className="form-group" style={{marginTop: '20px'}}>
                  <label>Amount Paid:</label>
                  <input 
                    type="number" 
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.000"
                    step="0.001"
                    min="0"
                  />
                  <div className="quick-buttons">
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        setPaidAmount(totalAmount);
                      }}
                    >
                      Pay All
                    </button>
                    {selectedCustomer && existingDebt > 0 && (
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          setPaidAmount(currentPurchaseTotal);
                        }}
                      >
                        Pay New Only
                      </button>
                    )}
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        setPaidAmount(0);
                      }}
                    >
                      Pay Later
                    </button>
                  </div>
                </div>

                <div className={`summary-row debt ${remainingAmount > 0 ? 'has-debt' : ''}`}>
                  <span>Remaining:</span>
                  <span>L.L {remainingAmount.toFixed(3)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="btn-container">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => window.history.back()}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-save"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : '💾 Save'}
                </button>
              </div>
              
            </div>

            {/* ========== RIGHT SIDE: Product Selection ========== */}
            <div className="right-panel">
              
              {/* Selection Boxes - Games + Categories */}
              <div className="selection-boxes-section">
                <div className="selection-boxes">
                  {/* Games Box */}
                  <div 
                    className={`selection-box ${selectedBox === 'Games' ? 'active' : ''}`}
                    onClick={handleGamesClick}
                  >
                    <span className="box-icon">🎮</span>
                    <span className="box-title">Games</span>
                  </div>

                  {/* Category Boxes */}
                  {categories.map(cat => (
                    <div 
                      key={cat.id}
                      className={`selection-box ${selectedBox === cat.name ? 'active' : ''}`}
                      onClick={() => handleCategoryClick(cat.name)}
                      style={{ borderColor: selectedBox === cat.name ? cat.color : '#ddd' }}
                    >
                      <span className="box-icon">{cat.icon}</span>
                      <span className="box-title">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items Grid - Show Games or Products */}
              <div className="items-display-section">
                <div className={`items-grid ${selectedBox === 'Games' ? 'games-grid' : ''}`}>
                  {selectedBox === 'Games' ? (
                    // Show Games
                    games.length === 0 ? (
                      <p className="no-items">No games available</p>
                    ) : (
                      games.map(game => {
                        const pricePerHour = parseFloat(game.price_per_hour || 0);
                        const pricePerRound = parseFloat(game.price_per_round || 0);
                        
                        // Skip game if both prices are zero
                        if (pricePerHour === 0 && pricePerRound === 0) {
                          return null;
                        }
                        
                        return (
                          <div 
                            key={game.id} 
                            className="game-card-large"
                          >
                            <div className="game-card-header">
                              <div className="game-icon">🎮</div>
                              <div className="game-name">{game.name}</div>
                            </div>
                            <div className="game-card-body">
                              {pricePerHour > 0 && (
                                <div className="price-option">
                                  <div className="price-label">Per Hour</div>
                                  <div className="price-value">L.L {pricePerHour.toFixed(3)}</div>
                                  <button 
                                    type="button"
                                    className="add-price-btn"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleAddGame(game, 'hour');
                                    }}
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                              {pricePerRound > 0 && (
                                <div className="price-option">
                                  <div className="price-label">Per Round</div>
                                  <div className="price-value">L.L {pricePerRound.toFixed(3)}</div>
                                  <button 
                                    type="button"
                                    className="add-price-btn"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleAddGame(game, 'round');
                                    }}
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )
                  ) : (
                    // Show Products from Selected Category
                    categoryProducts.length === 0 ? (
                      <p className="no-items">No products in this category</p>
                    ) : (
                      categoryProducts.map(product => (
                        <div 
                          key={product.id} 
                          className="item-card-simple"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddProduct(product);
                          }}
                        >
                          {/* Product Image */}
                          <div className="item-icon">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="product-image"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'block';
                                }}
                              />
                            ) : null}
                            <div 
                              className="product-emoji"
                              style={{
                                display: product.image ? 'none' : 'block'
                              }}
                            >
                              🛒
                            </div>
                          </div>

                          {/* Product Name */}
                          <div className="item-name">{product.name}</div>
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>
              
            </div>
          </div>

      </form>
    </div>

    {/* Success/Error Snackbar */}
    <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            backgroundColor: snackbar.severity === 'success' ? '#2e7d32' : '#d32f2f',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            '& .MuiAlert-icon': {
              color: '#fff'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CustomerPurchase;