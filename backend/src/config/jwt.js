import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET || 'supersecretjwtkey_clothing_store';

export const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token) => {
  return jwt.verify(token, secret);
};
