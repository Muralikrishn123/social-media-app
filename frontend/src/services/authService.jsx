// frontend/src/services/authService.js
import api from '../api/axios';

export const authService = {
  // Register a new user
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  // Login user
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  // Logout user
  logout: async () => {
    await api.post('/auth/logout');
  },

  // Get current user
  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const { data } = await api.put('/auth/update-profile', userData);
    return data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const { data } = await api.put('/auth/change-password', passwordData);
    return data;
  }
};