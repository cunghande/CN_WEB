import express from 'express';
import {
  addComment,
  addReview,
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  toggleLike,
  updateProduct
} from '../controllers/product.controller.js';
import { authenticate, authorizeAdmin, optionalAuthenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', optionalAuthenticate, getProducts);
router.get('/:id', optionalAuthenticate, getProductById);
router.post('/', authenticate, authorizeAdmin, upload.single('image'), createProduct);
router.put('/:id', authenticate, authorizeAdmin, upload.single('image'), updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);
router.post('/:id/like', authenticate, toggleLike);
router.delete('/:id/like', authenticate, toggleLike);
router.post('/:id/comments', authenticate, addComment);
router.post('/:id/reviews', authenticate, addReview);

export default router;
