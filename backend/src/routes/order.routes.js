import express from 'express';
import { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  getAllOrders, 
  updateOrderStatus 
} from '../controllers/order.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/', authenticate, authorizeAdmin, getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/status', authenticate, authorizeAdmin, updateOrderStatus);

export default router;
