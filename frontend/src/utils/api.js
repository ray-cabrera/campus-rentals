import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

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

// Auth API
export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
};

// Items API
export const itemsAPI = {
  getAll: (params) => api.get('/api/items/', { params }),
  getById: (id) => api.get(`/api/items/${id}`),
  create: (data) => api.post('/api/items/', data),
  update: (id, data) => api.put(`/api/items/${id}`, data),
  delete: (id) => api.delete(`/api/items/${id}`),
  getMyItems: () => api.get('/api/items/user/my-items'),
};

// Rentals API
export const rentalsAPI = {
  getAll: (params) => api.get('/api/rentals/', { params }),
  getById: (id) => api.get(`/api/rentals/${id}`),
  create: (data) => api.post('/api/rentals/', data),
  approve: (id) => api.put(`/api/rentals/${id}/approve`),
  markPickup: (id, data) => api.put(`/api/rentals/${id}/pickup`, data),
  markReturn: (id, data) => api.put(`/api/rentals/${id}/return`, data),
  cancel: (id) => api.put(`/api/rentals/${id}/cancel`),
};

// Messages API
export const messagesAPI = {
  getAll: () => api.get('/api/messages/'),
  getRentalMessages: (rentalId) => api.get(`/api/messages/rental/${rentalId}`),
  send: (data) => api.post('/api/messages/', data),
  getUnreadCount: () => api.get('/api/messages/unread/count'),
};

// Ratings API
export const ratingsAPI = {
  create: (data) => api.post('/api/ratings/', data),
  getUserRatings: (userId, params) => api.get(`/api/ratings/user/${userId}`, { params }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
  getTransactions: (params) => api.get('/api/dashboard/transactions', { params }),
};

export default api;
