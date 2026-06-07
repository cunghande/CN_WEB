import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

export const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token) => {
  return jwt.verify(token, secret);
};
