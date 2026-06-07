import express from 'express';
import { chatWithStylist } from '../controllers/ai.controller.js';
import { optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/stylist', optionalAuthenticate, chatWithStylist);

export default router;
