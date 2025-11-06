// src/services/postService.jsx
import api from '../api/axios';

const handleApiError = (error, context = '') => {
  const errorMessage = error.response?.data?.message || error.message;
  console.error(`Error ${context}:`, errorMessage);
  const apiError = new Error(errorMessage);
  apiError.status = error.response?.status;
  apiError.data = error.response?.data;
  throw apiError;
};

const formatPostsResponse = (response, page = 1, limit = 10) => {
  if (!response?.data) {
    console.warn('Empty or invalid response received:', response);
    return { 
      posts: [], 
      total: 0, 
      hasMore: false, 
      page, 
      limit,
      success: false,
      error: 'No data received from server'
    };
  }

  // Default values
  let posts = [];
  let total = 0;
  let hasMore = false;
  let success = response.data.success !== false;

  // Log the response for debugging
  console.log('API Response:', {
    data: response.data,
    hasData: !!response.data.data,
    isArray: Array.isArray(response.data.data) || Array.isArray(response.data),
    hasPosts: !!response.data.posts
  });

  // Format 1: { success: true, count: number, data: Array }
  if (response.data.success !== undefined) {
    posts = Array.isArray(response.data.data) 
      ? response.data.data 
      : Array.isArray(response.data) 
        ? response.data 
        : [];
    total = response.data.count || posts.length || 0;
  } 
  // Format 2: Direct array response
  else if (Array.isArray(response.data)) {
    posts = response.data;
    total = posts.length;
  }
  // Format 3: Nested posts object
  else if (response.data.posts && Array.isArray(response.data.posts)) {
    posts = response.data.posts;
    total = response.data.total || posts.length;
  }

  // Calculate hasMore based on the most common pattern
  hasMore = (page * limit) < total;

  return { 
    posts, 
    total, 
    hasMore, 
    page, 
    limit,
    success,
    // Include the original response for debugging
    _original: response.data
  };
};

export const postService = {
  // Get all posts with pagination
  getPosts: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/posts', { 
        params: { page, limit } 
      });
      return formatPostsResponse(response, page, limit);
    } catch (error) {
      return handleApiError(error, 'fetching posts');
    }
  },

  // Create a new post with file upload support
  createPost: async (postData) => {
    try {
      if (!postData) {
        throw new Error('Post data is required');
      }

      // Handle both FormData and regular objects
      const isFormData = postData instanceof FormData;
      const data = isFormData ? postData : new FormData();
      
      if (!isFormData) {
        // Convert object to FormData
        Object.entries(postData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            data.append(key, value);
          }
        });
      }

      const response = await api.post('/posts', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'creating post');
    }
  },

   getUserPosts: async (userId) => {
    try {
      const response = await api.get(`/posts/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  },

  // Get a single post by ID
  getPostById: async (postId) => {
    try {
      if (!postId) {
        throw new Error('Post ID is required');
      }
      const response = await api.get(`/posts/${postId}`);
      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error, `fetching post ${postId}`);
    }
  },

  // Update a post
  updatePost: async (postId, postData) => {
    try {
      if (!postId || !postData) {
        throw new Error('Post ID and data are required');
      }
      const response = await api.put(`/posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      return handleApiError(error, `updating post ${postId}`);
    }
  },

  // Delete a post
  deletePost: async (postId) => {
    try {
      if (!postId) {
        throw new Error('Post ID is required');
      }
      const response = await api.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `deleting post ${postId}`);
    }
  },

  // Like a post
  likePost: async (postId) => {
    try {
      if (!postId) {
        throw new Error('Post ID is required');
      }
      const response = await api.put(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `liking post ${postId}`);
    }
  },

  // Add a comment to a post
  addComment: async (postId, commentData) => {
    try {
      if (!postId || !commentData) {
        throw new Error('Post ID and comment data are required');
      }
      const response = await api.post(`/posts/comment/${postId}`, {
        text: commentData.text || commentData.content || ''
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, `adding comment to post ${postId}`);
    }
  },





  // Delete a comment
  deleteComment: async (postId, commentId) => {
    try {
      if (!postId || !commentId) {
        throw new Error('Post ID and Comment ID are required');
      }
      const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `deleting comment ${commentId} from post ${postId}`);
    }
  }








};

export default postService;