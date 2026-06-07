import express from 'express';
import {
  changePassword,
  forgotPassword,
  getMe,
  getPublicProfile,
  handleFacebookCallback,
  handleGoogleCallback,
  login,
  register,
  resetPassword,
  startFacebookLogin,
  startGoogleLogin,
  updateAvatar,
  updateProfile
} from '../controllers/auth.controller.js';
import {
  getUserDetail,
  getUsers,
  sendUserResetPassword,
  updateUserRole,
  updateUserStatus
} from '../controllers/user.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/google', startGoogleLogin);
router.get('/google/callback', handleGoogleCallback);
router.get('/facebook', startFacebookLogin);
router.get('/facebook/callback', handleFacebookCallback);
router.get('/users/:id/public', getPublicProfile);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);
router.post('/avatar', authenticate, upload.single('avatar'), updateAvatar);
router.get('/users', authenticate, authorizeAdmin, getUsers);
router.get('/users/:id', authenticate, authorizeAdmin, getUserDetail);
router.put('/users/:id/status', authenticate, authorizeAdmin, updateUserStatus);
router.put('/users/:id/role', authenticate, authorizeAdmin, updateUserRole);
router.post('/users/:id/reset-password', authenticate, authorizeAdmin, sendUserResetPassword);

export default router;
