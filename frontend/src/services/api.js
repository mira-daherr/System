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

export default api;