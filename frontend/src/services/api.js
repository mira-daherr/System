import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {

  },
});

// Auth API calls
export const authAPI = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  logout: async (userId) => {
    try {
      const response = await api.post('/auth/logout', { id: userId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // Request reset code
  requestResetCode: async (username) => {
    try {
      const response = await api.post('/auth/request-reset-code', { username });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // Reset password with code
  resetPassword: async (username, code, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        username,
        code,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },
};

// Products API calls
export const productsAPI = {
  // GET all products
  getAll: async (token) => {
    try {
      const response = await api.get('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // GET all categories
  getCategories: async (token) => {
    try {
      const response = await api.get('/api/products/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // GET products by category
  getByCategory: async (category, token) => {
    try {
      const response = await api.get(`/api/products/category/${category}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // GET single product by ID
  getById: async (id, token) => {
    try {
      const response = await api.get(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // SEARCH products by name
  search: async (searchTerm, token) => {
    try {
      const response = await api.get(`/api/products/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchTerm }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // GET products by price range
  getByPriceRange: async (minPrice, maxPrice, token) => {
    try {
      const response = await api.get(`/api/products/price-range`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { min: minPrice, max: maxPrice }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // CREATE new product
  create: async (productData, token) => {
    try {
      const response = await api.post('/api/products', productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // UPDATE product
  update: async (id, productData, token) => {
    try {
      const response = await api.put(`/api/products/${id}`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // DELETE product (soft delete)
  delete: async (id, token) => {
    try {
      const response = await api.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // PERMANENT DELETE product
  permanentDelete: async (id, token) => {
    try {
      const response = await api.delete(`/api/products/permanent/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // RESTORE soft-deleted product
  restore: async (id, token) => {
    try {
      console.log('📡 Calling restore API:');
      console.log('   - Product ID:', id);
      console.log('   - URL:', `/api/products/${id}/restore`);
      console.log('   - Token:', token ? 'exists' : 'missing');
      
      const response = await api.put(`/api/products/${id}/restore`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
      throw error.response?.data || { message: 'Network error occurred' };
    }
  }
};

// Categories API calls
export const categoriesAPI = {
  // GET all categories
  getAll: async (token) => {
    try {
      const response = await api.get('/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // GET single category by ID
  getById: async (id, token) => {
    try {
      const response = await api.get(`/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // ✨ NEW: GET products by category name
  getProductsByCategory: async (categoryName, token) => {
    try {
      const response = await api.get(`/api/categories/${encodeURIComponent(categoryName)}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // CREATE new category
  create: async (categoryData, token) => {
    try {
      const response = await api.post('/api/categories', categoryData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // UPDATE category
  update: async (id, categoryData, token) => {
    try {
      const response = await api.put(`/api/categories/${id}`, categoryData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // DELETE category
  delete: async (id, token) => {
    try {
      const response = await api.delete(`/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  }
};

export const gamesAPI = {
  // GET all games
  getAll: async (token) => {
    try {
      const response = await api.get('/api/games', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // GET single game by ID
  getById: async (id, token) => {
    try {
      const response = await api.get(`/api/games/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // SEARCH games by name
  search: async (searchTerm, token) => {
    try {
      const response = await api.get(`/api/games/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchTerm }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // CREATE new game
  create: async (gameData, token) => {
    try {
      const response = await api.post('/api/games', gameData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // UPDATE game
  update: async (id, gameData, token) => {
    try {
      const response = await api.put(`/api/games/${id}`, gameData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // DELETE game (soft delete)
  delete: async (id, token) => {
    try {
      const response = await api.delete(`/api/games/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // PERMANENT DELETE game
  permanentDelete: async (id, token) => {
    try {
      const response = await api.delete(`/api/games/permanent/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // RESTORE soft-deleted game
  restore: async (id, token) => {
    try {
      const response = await api.put(`/api/games/${id}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  }
};

// Expenses API calls
export const expensesAPI = {
  // GET all expenses
  getAll: async (token) => {
    try {
      const response = await api.get('/api/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // GET single expense by ID
  getById: async (id, token) => {
    try {
      const response = await api.get(`/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // GET recent expenses
  getRecent: async (limit, token) => {
    try {
      const response = await api.get(`/api/expenses/recent?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // GET expenses by date range
  getByDateRange: async (startDate, endDate, token) => {
    try {
      const response = await api.get(
        `/api/expenses/date-range?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // GET expense analytics
  getAnalytics: async (startDate, endDate, groupBy, token) => {
    try {
      const response = await api.get(
        `/api/expenses/analytics?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // CREATE new expense
  create: async (expenseData, token) => {
    try {
      const response = await api.post('/api/expenses', expenseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // UPDATE expense
  update: async (id, expenseData, token) => {
    try {
      const response = await api.put(`/api/expenses/${id}`, expenseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // DELETE expense
  delete: async (id, token) => {
    try {
      const response = await api.delete(`/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  }
};

// Customer Purchases API calls
export const customerPurchasesAPI = {
  // ===================================
  // PURCHASES
  // ===================================
  
  // CREATE new purchase
  createPurchase: async (purchaseData, token) => {
    try {
      const response = await api.post('/api/customer-purchases/purchase', purchaseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // GET all purchases
  getAllPurchases: async (token) => {
    try {
      const response = await api.get('/api/customer-purchases/purchases', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // GET single purchase by ID
  getPurchaseById: async (id, token) => {
    try {
      const response = await api.get(`/api/customer-purchases/purchase/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // DELETE purchase
  deletePurchase: async (id, token) => {
    try {
      const response = await api.delete(`/api/customer-purchases/purchase/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // ===================================
  // CUSTOMERS
  // ===================================

  // SEARCH customers by name
  searchCustomers: async (searchTerm, token) => {
    try {
      const response = await api.get('/api/customer-purchases/customers/search', {
        params: { search: searchTerm },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // GET all customers
  getAllCustomers: async (token) => {
    try {
      const response = await api.get('/api/customer-purchases/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // GET single customer by ID with sales
  getCustomerById: async (id, token) => {
    try {
      const response = await api.get(`/api/customer-purchases/customer/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // GET customers with history and filtering
  getCustomersWithHistory: async (filter, token, startDate = '', endDate = '') => {
    try {
      const params = { filter };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.get('/api/customer-purchases/customers/history', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // PROCESS payment for a customer
  processPayment: async (customerId, paymentAmount, token) => {
    try {
      const response = await api.post(
        `/api/customer-purchases/customer/${customerId}/payment`,
        { paymentAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  }
};

export default api;