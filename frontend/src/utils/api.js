import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
};

// User endpoints
export const users = {
  get: (id) => api.get(`/api/users/${id}`),
  update: (data) => api.put('/api/users/me', data),
  getItems: (id) => api.get(`/api/users/${id}/items`),
  getReviews: (id) => api.get(`/api/users/${id}/reviews`),
};

// Item endpoints
export const items = {
  list: (params) => api.get('/api/items', { params }),
  get: (id) => api.get(`/api/items/${id}`),
  create: (data) => api.post('/api/items', data),
  update: (id, data) => api.put(`/api/items/${id}`, data),
  delete: (id) => api.delete(`/api/items/${id}`),
  getPricingSuggestion: (category) => api.get('/api/items/pricing/suggestion', { params: { category } }),
};

// Rental endpoints
export const rentals = {
  list: (params) => api.get('/api/rentals', { params }),
  get: (id) => api.get(`/api/rentals/${id}`),
  create: (data) => api.post('/api/rentals', data),
  update: (id, data) => api.put(`/api/rentals/${id}`, data),
  approve: (id) => api.post(`/api/rentals/${id}/approve`),
  reject: (id) => api.post(`/api/rentals/${id}/reject`),
  verifyPickup: (id) => api.post(`/api/rentals/${id}/verify-pickup`),
  verifyReturn: (id) => api.post(`/api/rentals/${id}/verify-return`),
};

// Message endpoints
export const messages = {
  getConversations: () => api.get('/api/messages/conversations'),
  getWithUser: (userId) => api.get(`/api/messages/${userId}`),
  send: (data) => api.post('/api/messages', data),
};

// Review endpoints
export const reviews = {
  create: (data) => api.post('/api/reviews', data),
};

// Dashboard endpoints
export const dashboard = {
  getStats: () => api.get('/api/dashboard/stats'),
  getEarningsChart: (period) => api.get('/api/dashboard/earnings-chart', { params: { period } }),
};

// Utility endpoints
export const utils = {
  getLocations: () => api.get('/api/locations'),
  getCategories: () => api.get('/api/categories'),
};

export default api;
