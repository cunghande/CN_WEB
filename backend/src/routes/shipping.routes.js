import express from 'express';
import { quoteShipping } from '../controllers/shipping.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/quote', authenticate, quoteShipping);

export default router;
