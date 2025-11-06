import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Routes
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import userRoutes from './routes/users.js';

// Middleware
import { errorHandler } from './middleware/error.js';



// Connect to MongoDB
connectDB();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Uploads directory created successfully');
}

const app = express();

// CORS configuration — allows frontend to communicate properly
const corsOptions = {
  origin: ['http://localhost:5173','https://social-media-app-woad-delta.vercel.app/'], // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
  ],
  optionsSuccessStatus: 200,
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middleware for JSON parsing
app.use(express.json());

// Logging middleware (only in dev mode)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Default route check
app.get('/', (req, res) => {
  res.send('API is running successfully 🚀');
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5007;

const server = app.listen(PORT, () => {
  console.log(
    `✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});

export default app;
