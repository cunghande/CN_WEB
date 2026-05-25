import express from 'express';
import { getDistricts, getProvinces, getWards } from '../controllers/location.controller.js';

const router = express.Router();

router.get('/provinces', getProvinces);
router.get('/districts', getDistricts);
router.get('/wards', getWards);

export default router;
