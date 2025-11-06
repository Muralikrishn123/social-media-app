import express from 'express';
import {
  createPost,
  getPosts,
  getPost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  getPostsByUser,
  upload
} from '../controllers/posts.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getPosts)
  .post(protect, upload.single('image'), createPost);

router.route('/:id')
  .get(protect, getPost)
  .delete(protect, deletePost);

// backend/routes/posts.js
router.get('/user/:userId', protect, getPostsByUser);

router.put('/:id/like', protect, likePost);
router.put('/unlike/:id', protect, unlikePost);

router.post('/comment/:id', protect, addComment);
router.delete('/comment/:id/:comment_id', protect, deleteComment);

export default router;
