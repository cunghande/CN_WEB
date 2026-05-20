import express from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/product.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, authorizeAdmin, upload.single('image'), createProduct);
router.put('/:id', authenticate, authorizeAdmin, upload.single('image'), updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

export default router;
