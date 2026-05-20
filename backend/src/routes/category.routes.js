import express from 'express';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/category.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', authenticate, authorizeAdmin, createCategory);
router.put('/:id', authenticate, authorizeAdmin, updateCategory);
router.delete('/:id', authenticate, authorizeAdmin, deleteCategory);

export default router;
