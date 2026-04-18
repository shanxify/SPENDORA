import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api'),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const Client = {
  uploadPDF: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },

  getTransactions: async (params) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  updateTransactionCategory: async (id, category) => {
    const response = await api.put(`/transactions/${id}`, { category });
    return response.data;
  },

  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  clearTransactions: async () => {
    const response = await api.delete('/transactions/clear');
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  createCategory: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  getMerchants: async (params) => {
    const response = await api.get('/merchants', { params });
    return response.data;
  },

  updateMerchantCategory: async (normalized, category) => {
    const response = await api.put(`/merchants/${normalized}`, { category });
    return response.data;
  },

  bulkUpdateMerchants: async (merchants, category) => {
    const response = await api.put('/merchants/bulk/assign', { merchants, category });
    return response.data;
  }
};

export default Client;
