import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
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
};

// Products API calls
export const productsAPI = {
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

  search: async (searchTerm, token) => {
    try {
      const response = await api.get(`/api/products/search?search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  getByPriceRange: async (minPrice, maxPrice, token) => {
    try {
      const response = await api.get(`/api/products/price-range?min=${minPrice}&max=${maxPrice}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

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

  delete: async (id, token) => {
    try {
      const response = await api.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  }
};

export default api;
