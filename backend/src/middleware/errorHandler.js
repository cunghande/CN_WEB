import { sendResponse } from '../utils/helpers.js';

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Lỗi hệ thống nội bộ máy chủ';

  console.error('Cảnh báo lỗi hệ thống:', {
    method: req.method,
    path: req.originalUrl,
    code: err.code,
    sqlMessage: err.sqlMessage,
    message,
    stack: err.stack
  });

  return sendResponse(res, status, false, message);
};
