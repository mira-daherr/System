import React, { useState, useEffect } from 'react';
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
  
  // Selected Items States
  const [selectedGames, setSelectedGames] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Payment State
  const [paidAmount, setPaidAmount] = useState(0);
  
  // Loading State
  const [loading, setLoading] = useState(false);

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
  const handleAddGame = (game) => {
    const existing = selectedGames.find(g => g.id === game.id);
    
    if (existing) {
      // Increase quantity
      setSelectedGames(selectedGames.map(g => 
        g.id === game.id 
          ? { ...g, quantity: g.quantity + 1, total: (g.quantity + 1) * g.price }
          : g
      ));
    } else {
      // Add new
      const price = parseFloat(game.price_per_hour || game.price_per_round || 0);
      setSelectedGames([...selectedGames, {
        id: game.id,
        name: game.name,
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
        if (g.id === id) {
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
      setSelectedGames(selectedGames.filter(g => g.id !== id));
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
        // ✨ التعديل الجديد هنا
        const customerType = selectedCustomer ? 'Existing Customer' : 'New Customer';
        let message = '✅ Purchase saved successfully!\n\n' +
          'Customer: ' + customerName + ' (' + customerType + ')\n' +
          'Sale ID: ' + response.data.saleId + '\n';
        
        if (selectedCustomer && existingDebt > 0) {
          message += 'Previous Debt: L.L ' + existingDebt.toFixed(3) + '\n';
        }
        
        message += 'New Items: L.L ' + currentPurchaseTotal.toFixed(3) + '\n' +
          'Grand Total: L.L ' + totalAmount.toFixed(3) + '\n' +
          'Paid: L.L ' + paidAmount.toFixed(3) + '\n' +
          'Remaining: L.L ' + remainingAmount.toFixed(3) + '\n\n' +
          'Click OK to add another purchase\n' +
          'Click Cancel to go back';
        
        const continueAdding = window.confirm(message);
        
        if (continueAdding) {
          // Reset form للفاتورة الجديدة
          setCustomerName('');
          setCustomerSearch('');
          setSelectedCustomer(null);
          setCustomerHistory([]);
          setSelectedGames([]);
          setSelectedProducts([]);
          setPaidAmount(0);
          setSelectedCategory(null);
          setCategoryProducts([]);
        } else {
          // الرجوع للصفحة السابقة
          window.history.back();
        }
      }
    } catch (error) {
      console.error('Error saving purchase:', error);
      alert('❌ ' + (error.message || 'Error saving purchase!'));
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
        <h1>Customer Purchase</h1>
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
                        <div key={game.id} className="cart-item">
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
                                  updateQuantity('game', game.id, -1);
                                }}
                              >
                                -
                              </button>
                              <button 
                                type="button" 
                                className="qty-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  updateQuantity('game', game.id, 1);
                                }}
                              >
                                +
                              </button>
                              <button 
                                type="button" 
                                className="remove-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  removeItem('game', game.id);
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
              
              {/* Games Selection */}
              <div className="section selection-section">
                <h2 className="section-title">🎮 Games</h2>
                <div className="items-grid">
                  {games.length === 0 ? (
                    <p className="no-items">No games available</p>
                  ) : (
                    games.map(game => (
                      <div 
                        key={game.id} 
                        className="item-card" 
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddGame(game);
                        }}
                      >
                        <div className="item-icon">🎮</div>
                        <div className="item-name">{game.name}</div>
                        <div className="item-description">Gaming session</div>
                        <div className="item-price">
                          L.L {parseFloat(game.price_per_hour || game.price_per_round || 0).toFixed(3)}
                        </div>
                        <button 
                          type="button" 
                          className="add-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddGame(game);
                          }}
                        >
                          +
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Products by Category */}
              <div className="section selection-section">
                <h2 className="section-title">📦 Products</h2>
                
                {/* Categories Grid */}
                <div className="categories-grid">
                  {categories.length === 0 ? (
                    <p className="no-items">No categories available</p>
                  ) : (
                    categories.map(cat => (
                      <div 
                        key={cat.id}
                        className={`category-card ${selectedCategory === cat.name ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(cat.name)}
                        style={{ borderColor: cat.color }}
                      >
                        <span className="category-icon">{cat.icon}</span>
                        <span className="category-name">{cat.name}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Products in Selected Category */}
                {selectedCategory && (
                  <div className="products-section">
                    <div className="items-grid">
                      {categoryProducts.length === 0 ? (
                        <p className="no-items">No products in this category</p>
                      ) : (
                        categoryProducts.map(product => (
                          <div 
                            key={product.id} 
                            className="item-card"
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

                            {/* Product Price */}
                            <div className="item-price">
                              L.L {parseFloat(product.price || 0).toFixed(3)}
                            </div>

                            {/* Add Button */}
                            <button 
                              type="button" 
                              className="add-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddProduct(product);
                              }}
                            >
                              +
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CustomerPurchase;