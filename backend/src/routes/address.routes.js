import express from 'express';
import { createAddress, deleteAddress, getAddresses, updateAddress } from '../controllers/address.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/addresses', authenticate, getAddresses);
router.post('/addresses', authenticate, createAddress);
router.put('/addresses/:id', authenticate, updateAddress);
router.delete('/addresses/:id', authenticate, deleteAddress);

export default router;
