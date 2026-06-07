import express from 'express';
import { claimCoupon, getEventCoupons, getMyCoupons, validateCoupon, adminGetCoupons, adminCreateCoupon, adminUpdateCoupon, adminDeleteCoupon } from '../controllers/coupon.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.get('/admin', authenticate, authorizeAdmin, adminGetCoupons);
router.post('/admin', authenticate, authorizeAdmin, adminCreateCoupon);
router.put('/admin/:id', authenticate, authorizeAdmin, adminUpdateCoupon);
router.delete('/admin/:id', authenticate, authorizeAdmin, adminDeleteCoupon);

// User routes
router.get('/events', authenticate, getEventCoupons);
router.get('/my', authenticate, getMyCoupons);
router.post('/validate', authenticate, validateCoupon);
router.post('/:id/claim', authenticate, claimCoupon);

export default router;
