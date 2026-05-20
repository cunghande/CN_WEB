import User from '../models/User.model.js';
import { sendResponse } from '../utils/helpers.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    return sendResponse(res, 200, true, 'Lấy danh sách tài khoản thành công', users);
  } catch (error) {
    next(error);
  }
};
