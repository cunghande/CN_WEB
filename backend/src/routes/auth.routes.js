import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { getUsers } from '../controllers/user.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.get('/users', authenticate, authorizeAdmin, getUsers);

export default router;
