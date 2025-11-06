// frontend/src/components/posts/PostCard.jsx
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageSquare, FiShare2, FiMoreHorizontal } from 'react-icons/fi';

export default function PostCard({ post }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Initialize state when post data is available
  useEffect(() => {
    if (post) {
      setIsLiked(post.likes?.includes(user?._id) || false);
      setLikeCount(post.likes?.length || 0);
    }
  }, [post, user?._id]);

  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: () => 
      isLiked 
        ? postService.unlikePost(post._id)
        : postService.likePost(post._id),
    onSuccess: () => {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      queryClient.invalidateQueries(['posts']);
    },
    onError: (error) => {
      console.error('Error updating like:', error);
    }
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await postService.addComment(post._id, { text: commentText });
      setCommentText('');
      queryClient.invalidateQueries(['posts']);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // Debug log to check post data
  useEffect(() => {
    console.log('Post data:', {
      id: post?._id,
      content: post?.content,
      hasContent: !!post?.content,
      allFields: post ? Object.keys(post) : []
    });
  }, [post]);

  if (!post) {
    return <div className="p-4 text-center text-gray-500">Loading post...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to={`/profile/${post.user?._id}`} className="flex-shrink-0">
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={post.user?.avatar || '/default-avatar.png'}
                alt={post.user?.name || 'User'}
              />
            </Link>
            <div className="min-w-0">
              <Link 
                to={`/profile/${post.user?._id}`}
                className="font-medium text-gray-900 hover:underline block truncate"
              >
                {post.user?.name || 'Unknown User'}
              </Link>
              <p className="text-xs text-gray-500">
                {post.createdAt && !isNaN(new Date(post.createdAt).getTime()) 
                  ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                  : 'Just now'}
              </p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <FiMoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Post Content - Made more prominent */}
        <div className="mt-4">
          <p className="text-gray-800 text-base whitespace-pre-line break-words">
            {post.content || 'No content available'}
          </p>
        </div>

        {/* Post Image */}
        {post.image && (
          <div className="mt-3 rounded-lg overflow-hidden border border-gray-100">
            <img
              src={post.image}
              alt="Post content"
              className="w-full h-auto max-h-96 object-contain bg-gray-50"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.png';
              }}
            />
          </div>
        )}

        {/* Post Stats */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500 border-t border-b border-gray-100 py-2">
          <div className="flex items-center">
            <div className="flex -space-x-1">
              {post.likes?.slice(0, 3).map((like, idx) => (
                <div
                  key={idx}
                  className="h-5 w-5 rounded-full bg-blue-100 border-2 border-white"
                />
              ))}
            </div>
            <span className="ml-2">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
          </div>
          <div>
            <span>{post.comments?.length || 0} {post.comments?.length === 1 ? 'comment' : 'comments'}</span>
          </div>
        </div>

        {/* Post Actions */}
        <div className="flex justify-between mt-2 text-gray-500 border-b border-gray-100 pb-2">
          <button
            onClick={handleLike}
            disabled={likeMutation.isLoading}
            className={`flex-1 flex items-center justify-center py-2 rounded-md hover:bg-gray-100 ${
              isLiked ? 'text-red-500' : 'hover:text-gray-700'
            }`}
          >
            <FiHeart
              className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`}
            />
            {isLiked ? 'Liked' : 'Like'}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex-1 flex items-center justify-center py-2 rounded-md hover:bg-gray-100 hover:text-gray-700"
          >
            <FiMessageSquare className="h-5 w-5 mr-2" />
            Comment
          </button>
          <button className="flex-1 flex items-center justify-center py-2 rounded-md hover:bg-gray-100 hover:text-gray-700">
            <FiShare2 className="h-5 w-5 mr-2" />
            Share
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-gray-50 p-4 border-t">
          {/* Add Comment */}
          <div className="flex items-start space-x-3 mb-4">
            <img
              className="h-8 w-8 rounded-full object-cover"
              src={user?.avatar || '/default-avatar.png'}
              alt={user?.name || 'You'}
            />
            <form onSubmit={handleAddComment} className="flex-1 flex">
              <input
                type="text"
                placeholder="Write a comment..."
                className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || likeMutation.isLoading}
                className="ml-2 px-4 py-1 bg-blue-500 text-white text-sm font-medium rounded-full hover:bg-blue-600 disabled:opacity-50"
              >
                Post
              </button>
            </form>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {post.comments?.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment._id} className="flex items-start space-x-3">
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={comment.user?.avatar || '/default-avatar.png'}
                    alt={comment.user?.name || 'User'}
                  />
                  <div className="bg-white p-3 rounded-lg flex-1 shadow-sm">
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/profile/${comment.user?._id}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {comment.user?.name || 'Unknown User'}
                      </Link>
                      <span className="text-xs text-gray-400">
                        {comment.createdAt && !isNaN(new Date(comment.createdAt).getTime()) ? 
                          formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 
                          'just now'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mt-1">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-center text-gray-500 py-2">No comments yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}