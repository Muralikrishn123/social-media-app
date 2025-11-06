// backend/routes/users.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  updateUserProfile,
  getUserById, 
  getUserConnections 
} from '../controllers/users.js';

const router = express.Router();

router.get('/:id',protect, getUserById);
router.get('/:id/connections', protect, getUserConnections);
router.put('/:id', protect, updateUserProfile);

export default router;