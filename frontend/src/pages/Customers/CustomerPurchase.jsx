import React, { useState, useEffect } from 'react';
import { gamesAPI, productsAPI, customerPurchasesAPI } from '../../services/api';
import './style.css';

const CustomerPurchase = () => {
  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Customer Info States
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Available Items States
  const [games, setGames] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Selected Items States
  const [selectedGames, setSelectedGames] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Payment State
  const [paidAmount, setPaidAmount] = useState(0);
  
  // Loading State
  const [loading, setLoading] = useState(false);

  // Fetch games and products on component mount
  useEffect(() => {
    fetchGames();
    fetchProducts();
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
  // FETCH PRODUCTS
  // ===================================
  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll(token);
      console.log('Products Response:', response);
      setProducts(response.products || response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error loading products!');
    }
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
  const totalAmount = gamesTotal + productsTotal;
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
    
    if (!phone.trim()) {
      alert('Please enter phone number!');
      return;
    }
    
    if (selectedGames.length === 0 && selectedProducts.length === 0) {
      alert('Please select at least one game or product!');
      return;
    }

    setLoading(true);

    try {
      const purchaseData = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        selectedGames,
        selectedProducts,
        totalAmount,
        paidAmount,
        remainingAmount,
        notes: ''
      };

      console.log('Submitting purchase:', purchaseData);

      const response = await customerPurchasesAPI.createPurchase(purchaseData, token);

      if (response.success) {
        alert('✅ Purchase saved successfully!');
        
        // Reset form
        setCustomerName('');
        setPhone('');
        setAddress('');
        setSelectedGames([]);
        setSelectedProducts([]);
        setPaidAmount(0);
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
          
          {/* ========== CUSTOMER INFORMATION ========== */}
          <div className="section">
            <h2 className="section-title">1️⃣ Customer Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Name *</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07xxxxxxxx"
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Address (Optional)</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Address"
                />
              </div>
            </div>
          </div>

          {/* ========== GAMES SELECTION ========== */}
          <div className="section">
            <h2 className="section-title">2️⃣ Select Games</h2>
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
                      L.L {parseFloat(game.price_per_hour || game.price_per_round || 0).toFixed(2)}
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

            {selectedGames.length > 0 && (
              <div className="selected-items">
                <h3>Selected Games:</h3>
                {selectedGames.map(game => (
                  <div key={game.id} className="selected-item">
                    <span>• {game.name} ({game.quantity || 0}h)</span>
                    <span>L.L {(parseFloat(game.total) || 0).toFixed(2)}</span>
                    <div className="item-actions">
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuantity('game', game.id, -1);
                        }}
                      >
                        -
                      </button>
                      <span>{game.quantity || 0}</span>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuantity('game', game.id, 1);
                        }}
                      >
                        +
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          removeItem('game', game.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                <div className="subtotal">Games Total: L.L {gamesTotal.toFixed(2)}</div>
              </div>
            )}
          </div>

          {/* ========== PRODUCTS SELECTION ========== */}
          <div className="section">
            <h2 className="section-title">3️⃣ Select Products</h2>
            <div className="items-grid">
              {products.length === 0 ? (
                <p className="no-items">No products available</p>
              ) : (
                products.map(product => (
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
                        {product.category === 'Chips' && '🍟'}
                        {product.category === 'Drinks' && '🥤'}
                        {product.category === 'Hot Drinks' && '☕'}
                        {product.category === 'Sandwiches' && '🥪'}
                        {product.category === 'Sweets' && '🍬'}
                        {!['Chips', 'Drinks', 'Hot Drinks', 'Sandwiches', 'Sweets'].includes(product.category) && '🛒'}
                      </div>
                    </div>

                    {/* Product Name */}
                    <div className="item-name">{product.name}</div>

                    {/* Product Category */}
                    <div className="item-description">{product.category || 'Product'}</div>

                    {/* Product Price */}
                    <div className="item-price">
                      L.L {parseFloat(product.price || 0).toFixed(2)}
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

            {selectedProducts.length > 0 && (
              <div className="selected-items">
                <h3>Selected Products:</h3>
                {selectedProducts.map(product => (
                  <div key={product.id} className="selected-item">
                    <span>• {product.name} ({product.quantity || 0})</span>
                    <span>L.L {(parseFloat(product.total) || 0).toFixed(2)}</span>
                    <div className="item-actions">
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuantity('product', product.id, -1);
                        }}
                      >
                        -
                      </button>
                      <span>{product.quantity || 0}</span>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuantity('product', product.id, 1);
                        }}
                      >
                        +
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          removeItem('product', product.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                <div className="subtotal">Products Total: L.L {productsTotal.toFixed(2)}</div>
              </div>
            )}
          </div>

          {/* ========== PAYMENT SUMMARY ========== */}
          <div className="section summary-section">
            <h2 className="section-title">4️⃣ Payment Summary</h2>
            
            <div className="summary-row">
              <span>Games Total:</span>
              <span>L.L {gamesTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Products Total:</span>
              <span>L.L {productsTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span>L.L {totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="form-group" style={{marginTop: '20px'}}>
              <label>Amount Paid:</label>
              <input 
                type="number" 
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                step="0.01"
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
                  Pay Full
                </button>
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
              <span>Remaining Debt:</span>
              <span>L.L {remainingAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* ========== ACTION BUTTONS ========== */}
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
              {loading ? 'Saving...' : '💾 Save Purchase'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CustomerPurchase;