import Post from '../models/Post.js';
import { ErrorResponse } from '../utils/errorHandler.js';
import multer from 'multer';
import path from 'path';

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Add the file filter configuration
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
    }
  }
});

// -------- Create a Post --------
export const createPost = async (req, res, next) => {
  try {
    const text = req.body.text;

    if (!text || text.trim() === '') {
      return next(new ErrorResponse('Please add some text', 400));
    }

    const newPost = new Post({
      text,
      name: req.user.name,
      user: req.user.id,
      avatar: req.user.avatar || ''
    });

    // If image is uploaded, attach its path
    if (req.file) {
      newPost.image = `/uploads/${req.file.filename}`;
    }

    const post = await newPost.save();

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// -------- Get All Posts --------
export const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.json({
      success: true,
      count: posts.length,
      total,
      page,
      hasMore: skip + posts.length < total,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};


// And in your posts controller:
export const getPostsByUser = async (req, res, next) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar');
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
};

// -------- Get Post by ID --------
export const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new ErrorResponse('Post not found', 404));

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

// -------- Delete Post --------
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new ErrorResponse('Post not found', 404));

    if (post.user.toString() !== req.user.id) {
      return next(new ErrorResponse('User not authorized', 401));
    }

    await post.deleteOne();

    res.json({ success: true, message: 'Post removed' });
  } catch (error) {
    next(error);
  }
};

// -------- Like a Post --------
export const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new ErrorResponse('Post not found', 404));
    }

    // Check if the post has already been liked
    const isLiked = post.likes.some(
      like => like.user.toString() === req.user.id
    );

    if (isLiked) {
      // Unlike the post
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.user.id
      );
    } else {
      // Like the post
      post.likes.unshift({ user: req.user.id });
    }

    await post.save();

    res.json({
      success: true,
      data: post.likes
    });
  } catch (error) {
    next(error);
  }
};

// -------- Unlike a Post --------
export const unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post.likes.some(like => like.user.toString() === req.user.id)) {
      return next(new ErrorResponse('Post has not yet been liked', 400));
    }

    post.likes = post.likes.filter(({ user }) => user.toString() !== req.user.id);
    await post.save();

    res.json({ success: true, data: post.likes });
  } catch (error) {
    next(error);
  }
};

// -------- Add Comment --------
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return next(new ErrorResponse('Text is required', 400));

    const post = await Post.findById(req.params.id);
    const newComment = {
     text: req.body.text,
      user: req.user.id,
      name: req.user.name,
      avatar: req.user.avatar
    };

    post.comments.unshift(newComment);
    await post.save();

    res.status(201).json({ success: true, data: post.comments });
  } catch (error) {
    next(error);
  }
};

// -------- Delete Comment --------
export const deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = post.comments.find(c => c.id === req.params.comment_id);

    if (!comment) return next(new ErrorResponse('Comment not found', 404));
    if (comment.user.toString() !== req.user.id)
      return next(new ErrorResponse('User not authorized', 401));

    post.comments = post.comments.filter(c => c.id !== req.params.comment_id);
    await post.save();

    res.json({ success: true, data: post.comments });
  } catch (error) {
    next(error);
  }
};
