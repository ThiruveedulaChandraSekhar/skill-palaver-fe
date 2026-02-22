/**
 * API client configuration and axios instance
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Auth API
export const authAPI = {
  signup: (data) => apiClient.post('/api/auth/signup', data),
  login: (data) => apiClient.post('/api/auth/login', data),
  getMe: () => apiClient.get('/api/auth/me'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => apiClient.get('/api/admin/dashboard'),
  getAllUsers: () => apiClient.get('/api/admin/users'),
  getAllCompanies: () => apiClient.get('/api/admin/companies'),
  createCompany: (data) => apiClient.post('/api/admin/companies', data),
  getAllProducts: () => apiClient.get('/api/admin/products'),
  createOffer: (data) => apiClient.post('/api/admin/offers', data),
  getAllOffers: () => apiClient.get('/api/admin/offers'),
  triggerTraining: (data) => apiClient.post('/api/admin/train', data),
  trainWithCsv: (formData) => apiClient.post('/api/admin/train-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getTrainingHistory: (limit = 10) => apiClient.get(`/api/admin/training-history?limit=${limit}`),
};

// Company API
export const companyAPI = {
  getProducts: () => apiClient.get('/api/company/products'),
  createProduct: (data) => apiClient.post('/api/company/products', data),
  updateProduct: (id, data) => apiClient.put(`/api/company/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/api/company/products/${id}`),
  getSales: (limit = 100) => apiClient.get(`/api/company/sales?limit=${limit}`),
  createSales: (data) => apiClient.post('/api/company/sales', data),
  uploadSalesCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/api/company/sales/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAnalytics: () => apiClient.get('/api/company/analytics'),
  getPredictions: (months = 6) => apiClient.get(`/api/company/predictions?months=${months}`),
  getFeatureImportance: () => apiClient.get('/api/company/feature-importance'),
};

// Public API
export const publicAPI = {
  getInfo: () => apiClient.get('/api/info'),
  getHealth: () => apiClient.get('/api/health'),
};
