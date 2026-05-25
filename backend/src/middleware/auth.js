import { verifyToken } from '../config/jwt.js';
import { sendResponse } from '../utils/helpers.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendResponse(res, 401, false, 'Không tìm thấy mã xác thực');
    }

    const token = authHeader.split(' ')[1];
    req.user = verifyToken(token);
    next();
  } catch {
    return sendResponse(res, 403, false, 'Mã xác thực không hợp lệ hoặc đã hết hạn');
  }
};

export const optionalAuthenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      req.user = verifyToken(authHeader.split(' ')[1]);
    }
  } catch {
    req.user = null;
  }
  next();
};

export const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendResponse(res, 403, false, 'Bạn không có quyền truy cập chức năng quản trị');
  }

  next();
};
