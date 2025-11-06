// frontend/src/services/userService.js
import api from '../api/axios';

export const userService = {
  // Get user by ID
  getUserById: async (userId) => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    try {
      const { data } = await api.get(`/users/${userId}`);
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },


  
  // Get current user
  getCurrentUser: async () => {
    try {
      const { data } = await api.get('/auth/me');
      return data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    const { data } = await api.put(`/users/${userId}`, userData);
    return data;
  },

  // Upload profile picture
  uploadProfilePicture: async (userId, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const { data } = await api.post(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Get user connections
  getConnections: async (userId) => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    try {
      const { data } = await api.get(`/users/${userId}/connections`);
      return data;
    } catch (error) {
      console.error('Error fetching connections:', error);
      throw error;
    }
  },

  // Follow/Unfollow user
  toggleFollow: async (userId) => {
    const { data } = await api.post(`/users/${userId}/toggle-follow`);
    return data;
  }
};