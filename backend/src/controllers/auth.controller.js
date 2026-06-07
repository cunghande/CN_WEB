import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { generateToken } from '../config/jwt.js';
import User from '../models/User.model.js';
import { sendPasswordResetOtpEmail } from '../services/emailService.js';
import { sendResponse } from '../utils/helpers.js';
import {
  isStrongEnoughPassword,
  isValidEmail,
  normalizePhone,
  normalizeText,
  validateProfilePayload
} from '../utils/validators.js';

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const passwordResetExpiresMinutes = Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES || 15);
const invalidLoginMessage = 'Email hoặc mật khẩu không chính xác';

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const makeResetOtp = () => crypto.randomInt(100000, 1000000).toString();

const redirectWithError = (res, message) => {
  const url = new URL(frontendUrl);
  url.searchParams.set('login', 'true');
  url.searchParams.set('social_error', message);
  return res.redirect(url.toString());
};

const redirectWithSession = (res, user) => {
  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  const url = new URL(frontendUrl);
  url.searchParams.set('social_token', token);
  url.searchParams.set('social_user', encodeURIComponent(JSON.stringify(user)));
  return res.redirect(url.toString());
};

const makeSocialPassword = () => bcrypt.hash(`social:${crypto.randomUUID()}`, 10);

const exchangeGoogleCode = async (code) => {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });

  if (!tokenResponse.ok) throw new Error('Không thể xác thực Google');
  const tokens = await tokenResponse.json();
  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  });
  if (!profileResponse.ok) throw new Error('Không thể lấy hồ sơ Google');

  const profile = await profileResponse.json();
  if (!profile.email) throw new Error('Tài khoản Google không trả về email');

  return {
    email: profile.email,
    full_name: profile.name || profile.email,
    avatar_url: profile.picture || ''
  };
};

const exchangeFacebookCode = async (code) => {
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:5000/api/auth/facebook/callback';
  const tokenUrl = new URL('https://graph.facebook.com/oauth/access_token');
  tokenUrl.searchParams.set('client_id', process.env.FACEBOOK_APP_ID);
  tokenUrl.searchParams.set('client_secret', process.env.FACEBOOK_APP_SECRET);
  tokenUrl.searchParams.set('redirect_uri', redirectUri);
  tokenUrl.searchParams.set('code', code);

  const tokenResponse = await fetch(tokenUrl);
  if (!tokenResponse.ok) throw new Error('Không thể xác thực Facebook');
  const tokens = await tokenResponse.json();

  const profileUrl = new URL('https://graph.facebook.com/me');
  profileUrl.searchParams.set('fields', 'id,name,email,picture.type(large)');
  profileUrl.searchParams.set('access_token', tokens.access_token);

  const profileResponse = await fetch(profileUrl);
  if (!profileResponse.ok) throw new Error('Không thể lấy hồ sơ Facebook');
  const profile = await profileResponse.json();
  if (!profile.email) throw new Error('Facebook chưa cấp quyền email cho tài khoản này');

  return {
    email: profile.email,
    full_name: profile.name || profile.email,
    avatar_url: profile.picture?.data?.url || ''
  };
};

const signInSocialProfile = async (res, profile) => {
  const password = await makeSocialPassword();
  const user = await User.findOrCreateSocialUser({ ...profile, password });
  return redirectWithSession(res, user);
};

export const register = async (req, res, next) => {
  try {
    const { full_name, email, password } = req.body;
    if (!full_name || !email || !password) {
      return sendResponse(res, 400, false, 'Vui lòng điền đầy đủ thông tin');
    }

    const profileError = validateProfilePayload({ full_name, gender: 'unspecified' });
    if (profileError) return sendResponse(res, 400, false, profileError);
    if (!isValidEmail(email)) return sendResponse(res, 400, false, 'Email không đúng định dạng.');
    if (!isStrongEnoughPassword(password)) return sendResponse(res, 400, false, 'Mật khẩu phải có ít nhất 6 ký tự, gồm cả chữ và số.');

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findByEmail(cleanEmail);
    if (existingUser) {
      return sendResponse(res, 400, false, 'Email này đã được đăng ký');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create({ full_name: normalizeText(full_name), email: cleanEmail, password: hashedPassword, role: 'customer' });
    const token = generateToken({ id: userId, email: cleanEmail, role: 'customer' });
    const user = await User.findById(userId);

    return sendResponse(res, 201, true, 'Đăng ký tài khoản thành công', { user, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendResponse(res, 400, false, 'Vui lòng nhập email và mật khẩu');
    }

    if (!isValidEmail(email)) return sendResponse(res, 400, false, 'Email không đúng định dạng.');

    const user = await User.findByEmail(email.trim().toLowerCase());
    if (!user) return sendResponse(res, 401, false, invalidLoginMessage);
    if (user.status === 'blocked') {
      return sendResponse(res, 403, false, 'Tài khoản của bạn đang bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    const isBcryptPassword = user.password?.startsWith('$2a$') || user.password?.startsWith('$2b$');
    const isMatch = isBcryptPassword
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!isMatch) return sendResponse(res, 401, false, invalidLoginMessage);

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    await User.markLogin(user.id);
    const safeUser = await User.findById(user.id);

    return sendResponse(res, 200, true, 'Đăng nhập thành công', { user: safeUser, token });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return sendResponse(res, 400, false, 'Vui lòng nhập email');

    if (!isValidEmail(email)) return sendResponse(res, 400, false, 'Email không đúng định dạng.');

    const user = await User.findByEmail(email.trim().toLowerCase());
    if (!user) {
      return sendResponse(res, 404, false, 'Email này chưa được đăng ký tài khoản');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const otp = makeResetOtp();
    const expiresAt = new Date(Date.now() + passwordResetExpiresMinutes * 60 * 1000);
    await User.setPasswordResetToken(user.id, hashResetToken(token), expiresAt, hashResetToken(otp));

    const resetUrl = new URL('/reset-password', frontendUrl);
    resetUrl.searchParams.set('email', user.email);
    resetUrl.searchParams.set('token', token);

    const sent = await sendPasswordResetOtpEmail(user.email, otp, resetUrl.toString(), passwordResetExpiresMinutes);
    if (!sent) {
      return sendResponse(res, 500, false, 'Không gửi được email OTP. Vui lòng kiểm tra cấu hình SMTP.');
    }

    return sendResponse(res, 200, true, 'Mã OTP đặt lại mật khẩu đã được gửi về email của bạn.');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, token, otp, new_password } = req.body;
    if (!email || !new_password || (!token && !otp)) {
      return sendResponse(res, 400, false, 'Vui lòng nhập email, mã xác nhận và mật khẩu mới');
    }
    if (!isValidEmail(email)) return sendResponse(res, 400, false, 'Email không đúng định dạng.');
    if (!isStrongEnoughPassword(new_password)) {
      return sendResponse(res, 400, false, 'Mật khẩu mới phải có ít nhất 6 ký tự, gồm cả chữ và số.');
    }

    const user = token
      ? await User.findByPasswordResetToken(email.trim().toLowerCase(), hashResetToken(token))
      : await User.findByPasswordResetOtp(email.trim().toLowerCase(), hashResetToken(otp));
    if (!user) {
      return sendResponse(res, 400, false, 'Mã xác nhận không hợp lệ hoặc đã hết hạn');
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await User.updatePassword(user.id, hashedPassword);
    await User.clearPasswordResetToken(user.id);

    return sendResponse(res, 200, true, 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.');
  } catch (error) {
    next(error);
  }
};

export const startGoogleLogin = (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return redirectWithError(res, 'Chưa cấu hình Google OAuth trong backend/.env');
  }

  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('prompt', 'select_account');
  return res.redirect(url.toString());
};

export const handleGoogleCallback = async (req, res) => {
  try {
    if (!req.query.code) return redirectWithError(res, 'Google không trả về mã xác thực');
    const profile = await exchangeGoogleCode(req.query.code);
    return signInSocialProfile(res, profile);
  } catch (error) {
    return redirectWithError(res, error.message || 'Đăng nhập Google thất bại');
  }
};

export const startFacebookLogin = (req, res) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return redirectWithError(res, 'Chưa cấu hình Facebook OAuth trong backend/.env');
  }

  const redirectUri = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:5000/api/auth/facebook/callback';
  const url = new URL('https://www.facebook.com/dialog/oauth');
  url.searchParams.set('client_id', process.env.FACEBOOK_APP_ID);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'email,public_profile');
  return res.redirect(url.toString());
};

export const handleFacebookCallback = async (req, res) => {
  try {
    if (!req.query.code) return redirectWithError(res, 'Facebook không trả về mã xác thực');
    const profile = await exchangeFacebookCode(req.query.code);
    return signInSocialProfile(res, profile);
  } catch (error) {
    return redirectWithError(res, error.message || 'Đăng nhập Facebook thất bại');
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return sendResponse(res, 404, false, 'Không tìm thấy tài khoản');
    return sendResponse(res, 200, true, 'Lấy thông tin tài khoản thành công', user);
  } catch (error) {
    next(error);
  }
};

export const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findPublicById(req.params.id);
    if (!user) return sendResponse(res, 404, false, 'Không tìm thấy người dùng');
    return sendResponse(res, 200, true, 'Lấy hồ sơ công khai thành công', user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, gender, theme_preference } = req.body;
    if (!full_name) return sendResponse(res, 400, false, 'Vui lòng nhập họ tên');

    const profileError = validateProfilePayload({ full_name, phone, gender });
    if (profileError) return sendResponse(res, 400, false, profileError);

    const user = await User.updateProfile(req.user.id, {
      full_name: normalizeText(full_name),
      phone: phone ? normalizePhone(phone) : '',
      gender,
      theme_preference
    });
    return sendResponse(res, 200, true, 'Cập nhật hồ sơ thành công', user);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password || !isStrongEnoughPassword(new_password)) {
      return sendResponse(res, 400, false, 'Mật khẩu mới phải có ít nhất 6 ký tự, gồm cả chữ và số.');
    }

    const user = await User.findByEmail(req.user.email);
    const isMatch = user.password?.startsWith('$2')
      ? await bcrypt.compare(current_password, user.password)
      : current_password === user.password;
    if (!isMatch) return sendResponse(res, 400, false, 'Mật khẩu hiện tại không đúng');

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await User.updatePassword(req.user.id, hashedPassword);
    return sendResponse(res, 200, true, 'Đổi mật khẩu thành công');
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) return sendResponse(res, 400, false, 'Vui lòng chọn ảnh đại diện');

    const user = await User.updateAvatar(req.user.id, `/uploads/${req.file.filename}`);
    return sendResponse(res, 200, true, 'Cập nhật ảnh đại diện thành công', user);
  } catch (error) {
    next(error);
  }
};

