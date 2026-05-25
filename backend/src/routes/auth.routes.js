import express from 'express';
import { changePassword, getMe, login, register, updateAvatar, updateProfile } from '../controllers/auth.controller.js';
import { getUsers } from '../controllers/user.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);
router.post('/avatar', authenticate, upload.single('avatar'), updateAvatar);
router.get('/users', authenticate, authorizeAdmin, getUsers);

export default router;
