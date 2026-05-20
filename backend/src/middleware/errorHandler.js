import { sendResponse } from '../utils/helpers.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Cảnh báo lỗi hệ thống:', err.stack);
  const status = err.status || 500;
  const message = err.message || 'Lỗi hệ thống nội bộ máy chủ';
  return sendResponse(res, status, false, message);
};
