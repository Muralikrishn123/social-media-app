import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function CreatePost({ onPostCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const createPost = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/posts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      toast.success('Post created successfully');
      reset();
      if (onPostCreated) onPostCreated();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create post');
    }
  });

  const onSubmit = async (data) => {
    if (!data.content.trim()) return;
    setIsSubmitting(true);
    try {
      await createPost.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex space-x-4">
          <div className="flex-shrink-0">
            <img
              className="h-10 w-10 rounded-full"
              src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
              alt=""
            />
          </div>
          <div className="flex-1">
            <textarea
              {...register('content')}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="What's on your mind?"
              disabled={isSubmitting}
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}