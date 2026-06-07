import crypto from 'node:crypto';
import User from '../models/User.model.js';
import { sendPasswordResetOtpEmail } from '../services/emailService.js';
import { sendResponse } from '../utils/helpers.js';

const passwordResetExpiresMinutes = Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES || 15);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const makeResetOtp = () => crypto.randomInt(100000, 1000000).toString();

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    return sendResponse(res, 200, true, 'Lấy danh sách tài khoản thành công', users);
  } catch (error) {
    next(error);
  }
};

export const getUserDetail = async (req, res, next) => {
  try {
    const user = await User.findAdminDetailById(req.params.id);
    if (!user) return sendResponse(res, 404, false, 'Không tìm thấy tài khoản');
    return sendResponse(res, 200, true, 'Lấy chi tiết tài khoản thành công', user);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'blocked'].includes(status)) {
      return sendResponse(res, 400, false, 'Trạng thái tài khoản không hợp lệ');
    }
    if (Number(req.params.id) === Number(req.user.id) && status === 'blocked') {
      return sendResponse(res, 400, false, 'Admin không thể tự khóa tài khoản của mình');
    }

    const user = await User.updateStatus(req.params.id, status);
    if (!user) return sendResponse(res, 404, false, 'Không tìm thấy tài khoản');
    return sendResponse(res, 200, true, status === 'blocked' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản', user);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['customer', 'admin'].includes(role)) {
      return sendResponse(res, 400, false, 'Vai trò tài khoản không hợp lệ');
    }
    if (Number(req.params.id) === Number(req.user.id) && role !== 'admin') {
      return sendResponse(res, 400, false, 'Admin không thể tự hạ quyền của mình');
    }

    const user = await User.updateRole(req.params.id, role);
    if (!user) return sendResponse(res, 404, false, 'Không tìm thấy tài khoản');
    return sendResponse(res, 200, true, 'Cập nhật vai trò tài khoản thành công', user);
  } catch (error) {
    next(error);
  }
};

export const sendUserResetPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendResponse(res, 404, false, 'Không tìm thấy tài khoản');

    const token = crypto.randomBytes(32).toString('hex');
    const otp = makeResetOtp();
    const expiresAt = new Date(Date.now() + passwordResetExpiresMinutes * 60 * 1000);
    await User.setPasswordResetToken(user.id, hashResetToken(token), expiresAt, hashResetToken(otp));

    const resetUrl = new URL('/reset-password', frontendUrl);
    resetUrl.searchParams.set('email', user.email);
    resetUrl.searchParams.set('token', token);

    const sent = await sendPasswordResetOtpEmail(user.email, otp, resetUrl.toString(), passwordResetExpiresMinutes);
    if (!sent) {
      return sendResponse(res, 500, false, 'Không gửi được email reset mật khẩu. Vui lòng kiểm tra SMTP.');
    }

    return sendResponse(res, 200, true, 'Đã gửi email reset mật khẩu cho người dùng');
  } catch (error) {
    next(error);
  }
};
