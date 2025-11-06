import React, { useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import PostCard from '../../components/posts/PostCard';
import { Button, Textarea, Loader } from '../../components/common';

const Home = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [postContent, setPostContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const limit = 10;

  // ✅ Fetch posts using useInfiniteQuery
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 1 }) => postService.getPosts(pageParam, limit),
    getNextPageParam: (lastPage, allPages) => {
      // If the API returns "hasMore", use that to determine next page
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1
  });

  // Combine all pages into a single array of posts
  const posts = data?.pages.flatMap((page) => page.posts || []) || [];

  // ✅ Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (postData) => postService.createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setPostContent('');
      setImage(null);
      setImagePreview(null);
    }
  });

  // ✅ Handle post submission
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    const content = postContent.trim();

    if (!content) {
      alert('Please enter some text for your post');
      return;
    }

    const formData = new FormData();
    formData.append('text', content);

    if (image) {
      formData.append('image', image);
    }

    try {
      await createPostMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // ✅ Handle image upload + preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Like post
  const handleLike = async (postId) => {
    try {
      await postService.likePost(postId);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // ✅ Delete post
  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(postId);
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  // ✅ Add comment
  const handleAddComment = async (postId, commentText) => {
    if (!commentText?.trim()) return;
    try {
      await postService.addComment(postId, { text: commentText });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // ✅ Delete comment
  const handleDeleteComment = async (postId, commentId) => {
    try {
      await postService.deleteComment(postId, commentId);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* ✅ Create Post Form */}
      {user && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />

            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <input
                  type="file"
                  id="post-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="post-image"
                  className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-gray-700"
                >
                  📷 Add Photo
                </label>
              </div>

              <Button
                type="submit"
                disabled={createPostMutation.isLoading || !postContent.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {createPostMutation.isLoading ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ✅ Posts List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader size="lg" />
          </div>
        ) : isError ? (
          <div className="text-red-500 text-center p-4">
            Error loading posts: {error?.message || 'Unknown error'}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-500 p-8">
            No posts yet. Be the first to post something!
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user?._id}
                onLike={handleLike}
                onDelete={handleDeletePost}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
              />
            ))}

            {hasNextPage && (
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
