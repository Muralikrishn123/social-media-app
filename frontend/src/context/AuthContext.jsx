// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Memoized fetch user function
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data); // Assuming the data is nested under data property
      setError(null);
      return data.data;
    } catch (err) {
      console.error('Error fetching user:', err);
      localStorage.removeItem('token');
      setError(err.response?.data?.message || 'Failed to fetch user data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // User query
  const { refetch } = useQuery({
    queryKey: ['authUser'],
    queryFn: fetchUser,
    enabled: false, // Disable automatic fetch on mount
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onError: (err) => {
      console.error('Auth query error:', err);
      setError(err.response?.data?.message || 'Authentication error');
    }
  });

  // Check auth status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refetch().catch(console.error);
    } else {
      setLoading(false);
    }
  }, [refetch]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear any existing errors and data
      queryClient.removeQueries(['authUser']);
      
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('token', data.token);
      
      // Fetch fresh user data after login
      const userData = await fetchUser();
      
      // Invalidate any user-related queries
      queryClient.invalidateQueries(['user']);
      
      return { success: true, data: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.post('/auth/register', userData);
      return { 
        success: true,
        data 
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Attempt to call logout endpoint if possible
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
      // Continue with client-side cleanup even if server logout fails
    } finally {
      // Clear all queries from the cache
      queryClient.clear();
      // Clear local storage
      localStorage.removeItem('token');
      // Reset state
      setUser(null);
      setError(null);
      // Navigate to login
      navigate('/login');
    }
  };

  const updateUser = (userData) => {
    setUser(prev => {
      const updatedUser = { ...prev, ...userData };
      return updatedUser;
    });
  };

  // Provide auth context values
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    refetchUser: fetchUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;