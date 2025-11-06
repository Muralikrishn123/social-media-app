// frontend/src/pages/feed/Feed.jsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '../../services/postService';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, LoadingSpinner } from '../../components/common/index';
import PostCard from '../../components/posts/PostCard';
import { FiImage, FiLink } from 'react-icons/fi';

export default function Feed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  // Fetch posts
  const { 
    data: posts, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['posts'],
    queryFn: () => postService.getPosts(),
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (content) => postService.createPost({ content }),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      setContent('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    createPostMutation.mutate(content);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load posts. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Create Post */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-start space-x-3">
          <img
            className="h-10 w-10 rounded-full"
            src={user?.avatar || '/default-avatar.png'}
            alt={user?.name}
          />
          <form onSubmit={handleSubmit} className="flex-1">
            <Input
              as="textarea"
              rows={3}
              placeholder="What's on your mind?"
              className="w-full"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                >
                  <FiImage className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                >
                  <FiLink className="h-5 w-5" />
                </button>
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={!content.trim() || createPostMutation.isLoading}
                loading={createPostMutation.isLoading}
              >
                Post
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts yet. Be the first to post something!</p>
          </div>
        ) : (
          posts?.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}